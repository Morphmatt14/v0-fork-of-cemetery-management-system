import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// ============================================================================
// ACTIVITY LOGS API
// ============================================================================
// Fetches activity logs with filtering options
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const actorType = searchParams.get('actorType') // 'admin', 'employee', 'client'
    const action = searchParams.get('action')
    const actorUsername = searchParams.get('actorUsername')

    console.log('[Activity Logs] Fetching logs with filters:', {
      limit,
      actorType,
      action,
      actorUsername
    })

    // Build query
    let query = supabaseServer
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    // Apply filters
    if (actorType) {
      query = query.eq('actor_type', actorType)
    }
    
    if (action) {
      query = query.eq('action', action)
    }
    
    if (actorUsername) {
      query = query.ilike('actor_username', `%${actorUsername}%`)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('[Activity Logs] Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch activity logs' },
        { status: 500 }
      )
    }

    console.log('[Activity Logs] ✅ Fetched', logs?.length, 'logs')

    return NextResponse.json({
      success: true,
      logs: logs || []
    })

  } catch (error: any) {
    console.error('[Activity Logs] ❌ Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}
