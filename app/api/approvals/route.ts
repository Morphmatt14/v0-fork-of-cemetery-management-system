import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { 
  SubmitApprovalRequest, 
  ApprovalFilters, 
  ApprovalListResponse, 
  SubmitApprovalResponse,
  PendingAction 
} from '@/lib/types/approvals'

// ============================================================================
// GET /api/approvals - List pending actions with filters and pagination
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filters from query parameters
    const filters: ApprovalFilters = {
      status: searchParams.get('status') as any,
      action_type: searchParams.get('action_type') as any,
      target_entity: searchParams.get('target_entity') as any,
      priority: searchParams.get('priority') as any,
      requested_by_id: searchParams.get('requested_by_id') || undefined,
      reviewed_by_id: searchParams.get('reviewed_by_id') || undefined,
      category: searchParams.get('category') || undefined,
      created_after: searchParams.get('created_after') || undefined,
      created_before: searchParams.get('created_before') || undefined,
      related_client_id: searchParams.get('related_client_id') || undefined,
      related_lot_id: searchParams.get('related_lot_id') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sort_by: (searchParams.get('sort_by') || 'created_at') as any,
      sort_order: (searchParams.get('sort_order') || 'desc') as any,
      search: searchParams.get('search') || undefined,
    }

    const offset = ((filters.page || 1) - 1) * (filters.limit || 20)

    console.log('[Approvals API] GET - Filters:', filters)

    // Build query with relations
    let query = supabaseServer
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
      `, { count: 'exact' })

    // Apply filters
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status)
      } else {
        query = query.eq('status', filters.status)
      }
    }

    if (filters.action_type) {
      if (Array.isArray(filters.action_type)) {
        query = query.in('action_type', filters.action_type)
      } else {
        query = query.eq('action_type', filters.action_type)
      }
    }

    if (filters.target_entity) {
      if (Array.isArray(filters.target_entity)) {
        query = query.in('target_entity', filters.target_entity)
      } else {
        query = query.eq('target_entity', filters.target_entity)
      }
    }

    if (filters.priority) {
      if (Array.isArray(filters.priority)) {
        query = query.in('priority', filters.priority)
      } else {
        query = query.eq('priority', filters.priority)
      }
    }

    if (filters.requested_by_id) {
      query = query.eq('requested_by_id', filters.requested_by_id)
    }

    if (filters.reviewed_by_id) {
      query = query.eq('reviewed_by_id', filters.reviewed_by_id)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.created_after) {
      query = query.gte('created_at', filters.created_after)
    }

    if (filters.created_before) {
      query = query.lte('created_at', filters.created_before)
    }

    if (filters.related_client_id) {
      query = query.eq('related_client_id', filters.related_client_id)
    }

    if (filters.related_lot_id) {
      query = query.eq('related_lot_id', filters.related_lot_id)
    }

    if (filters.search) {
      query = query.or(`notes.ilike.%${filters.search}%,admin_notes.ilike.%${filters.search}%,requested_by_username.ilike.%${filters.search}%`)
    }

    // Apply sorting
    const sortColumn = filters.sort_by || 'created_at'
    const sortOrder = filters.sort_order || 'desc'
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + (filters.limit || 20) - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('[Approvals API] GET error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch pending actions' 
      }, { status: 500 })
    }

    // Transform data to match PendingAction interface
    const pendingActions: PendingAction[] = (data || []).map(item => ({
      id: item.id,
      action_type: item.action_type,
      target_entity: item.target_entity,
      target_id: item.target_id,
      change_data: item.change_data,
      previous_data: item.previous_data,
      status: item.status,
      priority: item.priority,
      category: item.category,
      notes: item.notes,
      requested_by: {
        id: item.requested_by_id,
        username: item.requested_by_username,
        name: item.requested_by_name
      },
      reviewed_by: item.reviewed_by_id ? {
        id: item.reviewed_by_id,
        username: item.reviewed_by_username,
        name: item.admins?.name || ''
      } : undefined,
      reviewed_at: item.reviewed_at,
      rejection_reason: item.rejection_reason,
      admin_notes: item.admin_notes,
      is_executed: item.is_executed,
      executed_at: item.executed_at,
      execution_result: item.execution_result,
      execution_error: item.execution_error,
      related_client_id: item.related_client_id,
      related_lot_id: item.related_lot_id,
      related_payment_id: item.related_payment_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      expires_at: item.expires_at,
    }))

    const response: ApprovalListResponse = {
      success: true,
      data: pendingActions,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / (filters.limit || 20)),
        hasMore: offset + (filters.limit || 20) < (count || 0)
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Approvals API] GET unexpected error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// ============================================================================
// POST /api/approvals - Submit new pending action for approval
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body: SubmitApprovalRequest = await request.json()
    
    console.log('[Approvals API] POST - Submitting action:', body)

    // Validate required fields
    if (!body.action_type || !body.target_entity || !body.change_data) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: action_type, target_entity, change_data'
      }, { status: 400 })
    }

    // Get current user (this will be enhanced with proper auth)
    // For now, we'll need the user to pass their employee ID
    // TODO: Replace with proper JWT token validation
    
    // Check if approval is required for this action type
    const { data: config, error: configError } = await supabaseServer
      .from('approval_workflow_config')
      .select('*')
      .eq('action_type', body.action_type)
      .eq('is_active', true)
      .single()

    if (configError && configError.code !== 'PGRST116') {
      console.error('[Approvals API] Config fetch error:', configError)
      return NextResponse.json({
        success: false,
        error: 'Failed to check approval requirements'
      }, { status: 500 })
    }

    // If no config found or approval not required, return without creating pending action
    if (!config || !config.requires_approval) {
      return NextResponse.json({
        success: true,
        message: 'Action does not require approval - execute directly',
        requires_approval: false
      })
    }

    // Get employee information (mock for now - replace with auth)
    // TODO: Get from JWT token
    const employeeId = request.headers.get('X-Employee-ID') // Temporary header
    if (!employeeId) {
      return NextResponse.json({
        success: false,
        error: 'Employee authentication required'
      }, { status: 401 })
    }

    const { data: employee, error: empError } = await supabaseServer
      .from('employees')
      .select('id, username, name, status')
      .eq('id', employeeId)
      .eq('status', 'active')
      .single()

    if (empError || !employee) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or inactive employee'
      }, { status: 403 })
    }

    // Create pending action
    const pendingActionData = {
      action_type: body.action_type,
      target_entity: body.target_entity,
      target_id: body.target_id || null,
      change_data: body.change_data,
      previous_data: body.previous_data || null,
      status: 'pending',
      priority: body.priority || 'normal',
      category: body.category || null,
      notes: body.notes || null,
      requested_by_id: employee.id,
      requested_by_username: employee.username,
      requested_by_name: employee.name,
      related_client_id: body.related_client_id || null,
      related_lot_id: body.related_lot_id || null,
      related_payment_id: body.related_payment_id || null,
    }

    const { data: pendingAction, error: insertError } = await supabaseServer
      .from('pending_actions')
      .insert([pendingActionData])
      .select('*')
      .single()

    if (insertError) {
      console.error('[Approvals API] Insert error:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create pending action'
      }, { status: 500 })
    }

    // Create notification for admins
    // TODO: Implement notification system

    // Log activity
    // TODO: Implement activity logging

    const response: SubmitApprovalResponse = {
      success: true,
      data: {
        id: pendingAction.id,
        action_type: pendingAction.action_type,
        target_entity: pendingAction.target_entity,
        target_id: pendingAction.target_id,
        change_data: pendingAction.change_data,
        previous_data: pendingAction.previous_data,
        status: pendingAction.status,
        priority: pendingAction.priority,
        category: pendingAction.category,
        notes: pendingAction.notes,
        requested_by: {
          id: employee.id,
          username: employee.username,
          name: employee.name
        },
        reviewed_by: undefined,
        reviewed_at: undefined,
        rejection_reason: undefined,
        admin_notes: undefined,
        is_executed: pendingAction.is_executed,
        executed_at: pendingAction.executed_at,
        execution_result: pendingAction.execution_result,
        execution_error: pendingAction.execution_error,
        related_client_id: pendingAction.related_client_id,
        related_lot_id: pendingAction.related_lot_id,
        related_payment_id: pendingAction.related_payment_id,
        created_at: pendingAction.created_at,
        updated_at: pendingAction.updated_at,
        expires_at: pendingAction.expires_at,
      },
      message: 'Action submitted for approval successfully'
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('[Approvals API] POST unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
