import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { ReviewApprovalRequest, ReviewApprovalResponse } from '@/lib/types/approvals'

// ============================================================================
// POST /api/approvals/[id]/review - Approve or reject pending action (admin only)
// ============================================================================
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body: ReviewApprovalRequest = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Pending action ID is required'
      }, { status: 400 })
    }

    if (!body.action || !['approve', 'reject'].includes(body.action)) {
      return NextResponse.json({
        success: false,
        error: 'Valid action (approve/reject) is required'
      }, { status: 400 })
    }

    if (body.action === 'reject' && !body.rejection_reason) {
      return NextResponse.json({
        success: false,
        error: 'Rejection reason is required when rejecting'
      }, { status: 400 })
    }

    console.log('[Approvals API] POST review - ID:', id, 'Action:', body.action)

    // Get current admin user
    const adminId = request.headers.get('X-Admin-ID')
    if (!adminId) {
      return NextResponse.json({
        success: false,
        error: 'Admin authentication required'
      }, { status: 401 })
    }

    // Verify admin exists and is active
    const { data: admin, error: adminError } = await supabaseServer
      .from('admins')
      .select('id, username, name, status')
      .eq('id', adminId)
      .eq('status', 'active')
      .single()

    if (adminError || !admin) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or inactive admin'
      }, { status: 403 })
    }

    // Get pending action and verify it can be reviewed
    const { data: pendingAction, error: fetchError } = await supabaseServer
      .from('pending_actions')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending')
      .single()

    if (fetchError || !pendingAction) {
      if (fetchError?.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Pending action not found or already reviewed'
        }, { status: 404 })
      }

      console.error('[Approvals API] Fetch error:', fetchError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch pending action'
      }, { status: 500 })
    }

    // Check if action has expired
    if (pendingAction.expires_at && new Date(pendingAction.expires_at) < new Date()) {
      // Auto-expire the action
      await supabaseServer
        .from('pending_actions')
        .update({ 
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      return NextResponse.json({
        success: false,
        error: 'Pending action has expired'
      }, { status: 410 })
    }

    const now = new Date().toISOString()
    const newStatus = body.action === 'approve' ? 'approved' : 'rejected'
    
    // Update pending action with review
    const updateData = {
      status: newStatus,
      reviewed_by_id: admin.id,
      reviewed_by_username: admin.username,
      reviewed_at: now,
      updated_at: now,
      ...(body.rejection_reason && { rejection_reason: body.rejection_reason }),
      ...(body.admin_notes && { admin_notes: body.admin_notes }),
    }

    const { data: updatedAction, error: updateError } = await supabaseServer
      .from('pending_actions')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('[Approvals API] Update error:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update pending action'
      }, { status: 500 })
    }

    let executed = false
    let executionError: string | undefined

    // If approved, execute the action
    if (body.action === 'approve') {
      try {
        console.log('[Approvals API] Starting execution for action:', {
          id: updatedAction.id,
          action_type: updatedAction.action_type,
          target_entity: updatedAction.target_entity,
          target_id: updatedAction.target_id
        })

        const executionResult = await executeApprovedAction(updatedAction)
        executed = executionResult.success

        console.log('[Approvals API] Execution result:', {
          success: executionResult.success,
          error: executionResult.error,
          data: executionResult.data
        })

        // Update execution status
        const { error: updateError } = await supabaseServer
          .from('pending_actions')
          .update({
            is_executed: executionResult.success,
            executed_at: executionResult.success ? now : undefined,
            execution_result: executionResult.success ? executionResult.data : undefined,
            execution_error: executionResult.success ? undefined : executionResult.error,
            updated_at: now
          })
          .eq('id', id)

        if (updateError) {
          console.error('[Approvals API] Failed to update execution status:', updateError)
        }

        if (!executionResult.success) {
          executionError = executionResult.error
          console.error('[Approvals API] Execution failed:', executionError)
        } else {
          console.log('[Approvals API] ✅ Execution successful!')
        }

      } catch (error) {
        console.error('[Approvals API] Execution exception:', error)
        executionError = error instanceof Error ? error.message : 'Unexpected error during execution'
        
        // Update with execution error
        await supabaseServer
          .from('pending_actions')
          .update({
            is_executed: false,
            execution_error: executionError,
            updated_at: now
          })
          .eq('id', id)
      }
    }

    // Create notification for employee
    // TODO: Implement notification system

    // Log activity
    // TODO: Implement activity logging

    const response: ReviewApprovalResponse = {
      success: true,
      data: {
        id: updatedAction.id,
        action_type: updatedAction.action_type,
        target_entity: updatedAction.target_entity,
        target_id: updatedAction.target_id,
        change_data: updatedAction.change_data,
        previous_data: updatedAction.previous_data,
        status: updatedAction.status,
        priority: updatedAction.priority,
        category: updatedAction.category,
        notes: updatedAction.notes,
        requested_by: {
          id: updatedAction.requested_by_id,
          username: updatedAction.requested_by_username,
          name: updatedAction.requested_by_name
        },
        reviewed_by: {
          id: admin.id,
          username: admin.username,
          name: admin.name
        },
        reviewed_at: updatedAction.reviewed_at,
        rejection_reason: updatedAction.rejection_reason,
        admin_notes: updatedAction.admin_notes,
        is_executed: updatedAction.is_executed,
        executed_at: updatedAction.executed_at,
        execution_result: updatedAction.execution_result,
        execution_error: updatedAction.execution_error || executionError,
        related_client_id: updatedAction.related_client_id,
        related_lot_id: updatedAction.related_lot_id,
        related_payment_id: updatedAction.related_payment_id,
        created_at: updatedAction.created_at,
        updated_at: updatedAction.updated_at,
        expires_at: updatedAction.expires_at,
      },
      executed,
      message: body.action === 'approve' 
        ? (executed ? 'Action approved and executed successfully' : `Action approved but execution failed: ${executionError}`)
        : 'Action rejected successfully'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Approvals API] POST review unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// ============================================================================
// HELPER FUNCTION: Execute approved action
// ============================================================================
async function executeApprovedAction(pendingAction: any): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const { action_type, target_entity, target_id, change_data } = pendingAction

    console.log('[Approvals API] Executing action:', { action_type, target_entity, target_id })

    switch (action_type) {
      case 'lot_update':
        return await executeLotUpdate(target_id, change_data)
      
      case 'payment_update':
        return await executePaymentUpdate(target_id, change_data)
      
      case 'client_update':
        return await executeClientUpdate(target_id, change_data)
      
      case 'client_create':
        return await executeClientCreate(change_data)
      
      case 'lot_create':
        return await executeLotCreate(change_data)
        
      case 'burial_create':
        return await executeBurialCreate(change_data)
        
      case 'burial_update':
        return await executeBurialUpdate(target_id, change_data)
        
      // Add more action types as needed
      default:
        return {
          success: false,
          error: `Execution not implemented for action type: ${action_type}`
        }
    }

  } catch (error) {
    console.error('[Approvals API] executeApprovedAction error:', error)
    return {
      success: false,
      error: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// Execute lot update
async function executeLotUpdate(lotId: string, changes: any) {
  const { data, error } = await supabaseServer
    .from('lots')
    .update({
      ...changes,
      updated_at: new Date().toISOString()
    })
    .eq('id', lotId)
    .select('*')
    .single()

  return {
    success: !error,
    data: error ? undefined : data,
    error: error?.message
  }
}

// Execute payment update
async function executePaymentUpdate(paymentId: string, changes: any) {
  // Map frontend field names to database column names
  const updateData: any = {
    updated_at: new Date().toISOString()
  }
  
  // Map status → payment_status (database column)
  if (changes.status) {
    updateData.payment_status = changes.status
  }
  
  // Map other fields if present
  if (changes.amount !== undefined) updateData.amount = changes.amount
  if (changes.payment_type) updateData.payment_type = changes.payment_type
  if (changes.payment_method) updateData.payment_method = changes.payment_method
  if (changes.payment_date) updateData.payment_date = changes.payment_date
  if (changes.notes) updateData.notes = changes.notes

  console.log('[Approvals API] Executing payment update:', { paymentId, updateData })

  const { data, error } = await supabaseServer
    .from('payments')
    .update(updateData)
    .eq('id', paymentId)
    .select('*')
    .single()

  if (error) {
    console.error('[Approvals API] Payment update error:', error)
  } else {
    console.log('[Approvals API] Payment updated successfully:', data)
  }

  return {
    success: !error,
    data: error ? undefined : data,
    error: error?.message
  }
}

// Execute client update
async function executeClientUpdate(clientId: string, changes: any) {
  const { data, error } = await supabaseServer
    .from('clients')
    .update({
      ...changes,
      updated_at: new Date().toISOString()
    })
    .eq('id', clientId)
    .select('*')
    .single()

  return {
    success: !error,
    data: error ? undefined : data,
    error: error?.message
  }
}

// Execute client creation
async function executeClientCreate(clientData: any) {
  const { data, error } = await supabaseServer
    .from('clients')
    .insert([{
      ...clientData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select('*')
    .single()

  return {
    success: !error,
    data: error ? undefined : data,
    error: error?.message
  }
}

// Execute lot creation
async function executeLotCreate(lotData: any) {
  const { data, error } = await supabaseServer
    .from('lots')
    .insert([{
      ...lotData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select('*')
    .single()

  return {
    success: !error,
    data: error ? undefined : data,
    error: error?.message
  }
}

// Execute burial creation
async function executeBurialCreate(burialData: any) {
  const { data, error } = await supabaseServer
    .from('burials')
    .insert([{
      ...burialData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select('*')
    .single()

  return {
    success: !error,
    data: error ? undefined : data,
    error: error?.message
  }
}

// Execute burial update
async function executeBurialUpdate(burialId: string, changes: any) {
  const { data, error } = await supabaseServer
    .from('burials')
    .update({
      ...changes,
      updated_at: new Date().toISOString()
    })
    .eq('id', burialId)
    .select('*')
    .single()

  return {
    success: !error,
    data: error ? undefined : data,
    error: error?.message
  }
}
