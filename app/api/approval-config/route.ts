import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// ============================================================================
// GET /api/approval-config - Get approval workflow configuration
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    console.log('[Approval Config API] Fetching approval workflow configuration...')

    // Fetch all active approval configurations
    const { data, error } = await supabaseServer
      .from('approval_workflow_config')
      .select('*')
      .eq('is_active', true)
      .order('action_type', { ascending: true })

    if (error) {
      console.error('[Approval Config API] Database error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch approval configuration'
      }, { status: 500 })
    }

    console.log(`[Approval Config API] Fetched ${data?.length || 0} configurations`)

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('[Approval Config API] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// ============================================================================
// POST /api/approval-config - Update approval workflow configuration (Admin only)
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('[Approval Config API] Updating configuration:', body)

    // Verify admin authentication
    const adminId = request.headers.get('X-Admin-ID')
    if (!adminId) {
      return NextResponse.json({
        success: false,
        error: 'Admin authentication required'
      }, { status: 401 })
    }

    // Validate required fields
    if (!body.action_type) {
      return NextResponse.json({
        success: false,
        error: 'action_type is required'
      }, { status: 400 })
    }

    // Update or insert configuration
    const { data, error } = await supabaseServer
      .from('approval_workflow_config')
      .upsert({
        action_type: body.action_type,
        requires_approval: body.requires_approval ?? true,
        auto_approve_threshold: body.auto_approve_threshold,
        approval_timeout_hours: body.approval_timeout_hours,
        notify_roles: body.notify_roles,
        is_active: body.is_active ?? true,
        description: body.description,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'action_type'
      })
      .select()
      .single()

    if (error) {
      console.error('[Approval Config API] Update error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update configuration'
      }, { status: 500 })
    }

    console.log('[Approval Config API] Configuration updated successfully')

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('[Approval Config API] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
