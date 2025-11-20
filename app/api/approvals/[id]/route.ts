import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { PendingAction } from '@/lib/types/approvals'

// ============================================================================
// GET /api/approvals/[id] - Get single pending action by ID
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Pending action ID is required'
      }, { status: 400 })
    }

    console.log('[Approvals API] GET single - ID:', id)

    // Fetch pending action with relations
    const { data, error } = await supabaseServer
      .from('pending_actions')
      .select(`
        *,
        employees!pending_actions_requested_by_id_fkey (
          id,
          username,
          name
        ),
        admins!pending_actions_reviewed_by_id_fkey (
          id,
          username,
          name
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Pending action not found'
        }, { status: 404 })
      }

      console.error('[Approvals API] GET single error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch pending action'
      }, { status: 500 })
    }

    // Transform data to match PendingAction interface
    const pendingAction: PendingAction = {
      id: data.id,
      action_type: data.action_type,
      target_entity: data.target_entity,
      target_id: data.target_id,
      change_data: data.change_data,
      previous_data: data.previous_data,
      status: data.status,
      priority: data.priority,
      category: data.category,
      notes: data.notes,
      requested_by: {
        id: data.requested_by_id,
        username: data.requested_by_username,
        name: data.requested_by_name
      },
      reviewed_by: data.reviewed_by_id ? {
        id: data.reviewed_by_id,
        username: data.reviewed_by_username,
        name: data.admins?.name || ''
      } : undefined,
      reviewed_at: data.reviewed_at,
      rejection_reason: data.rejection_reason,
      admin_notes: data.admin_notes,
      is_executed: data.is_executed,
      executed_at: data.executed_at,
      execution_result: data.execution_result,
      execution_error: data.execution_error,
      related_client_id: data.related_client_id,
      related_lot_id: data.related_lot_id,
      related_payment_id: data.related_payment_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      expires_at: data.expires_at,
    }

    return NextResponse.json({
      success: true,
      data: pendingAction
    })

  } catch (error) {
    console.error('[Approvals API] GET single unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// ============================================================================
// PATCH /api/approvals/[id] - Cancel pending action (employee only)
// ============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Pending action ID is required'
      }, { status: 400 })
    }

    // Currently only supports cancellation
    if (body.action !== 'cancel') {
      return NextResponse.json({
        success: false,
        error: 'Only cancellation is supported via PATCH'
      }, { status: 400 })
    }

    console.log('[Approvals API] PATCH cancel - ID:', id)

    // Get current user (employee)
    const employeeId = request.headers.get('X-Employee-ID')
    if (!employeeId) {
      return NextResponse.json({
        success: false,
        error: 'Employee authentication required'
      }, { status: 401 })
    }

    // Verify employee can cancel this action (must be theirs and pending)
    const { data: existingAction, error: fetchError } = await supabaseServer
      .from('pending_actions')
      .select('*')
      .eq('id', id)
      .eq('requested_by_id', employeeId)
      .eq('status', 'pending')
      .single()

    if (fetchError || !existingAction) {
      return NextResponse.json({
        success: false,
        error: 'Pending action not found or cannot be cancelled'
      }, { status: 404 })
    }

    // Update status to cancelled
    const { data: updatedAction, error: updateError } = await supabaseServer
      .from('pending_actions')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('[Approvals API] Cancel error:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to cancel pending action'
      }, { status: 500 })
    }

    // Log activity
    // TODO: Implement activity logging

    return NextResponse.json({
      success: true,
      data: updatedAction,
      message: 'Pending action cancelled successfully'
    })

  } catch (error) {
    console.error('[Approvals API] PATCH unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// ============================================================================
// DELETE /api/approvals/[id] - Not allowed (use PATCH to cancel instead)
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    success: false,
    error: 'Hard deletion not allowed. Use PATCH with action: "cancel" instead.'
  }, { status: 405 })
}
