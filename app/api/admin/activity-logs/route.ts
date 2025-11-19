import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// ============================================================================
// ACTIVITY LOGS API
// ============================================================================
// Fetch activity logs for admin dashboard monitoring
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const actorType = searchParams.get('actorType') // 'admin', 'employee', 'client', 'system'
    const actorUsername = searchParams.get('actorUsername')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '100')

    console.log('[Activity Logs API] Fetching logs...', { actorType, actorUsername, category, limit })

    let query = supabaseServer
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (actorType) {
      query = query.eq('actor_type', actorType)
    }

    if (actorUsername) {
      query = query.eq('actor_username', actorUsername)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('[Activity Logs API] ❌ Error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch activity logs' },
        { status: 500 }
      )
    }

    console.log('[Activity Logs API] ✅ Found', logs?.length || 0, 'logs')

    return NextResponse.json({
      success: true,
      logs: logs || []
    })

  } catch (error: any) {
    console.error('[Activity Logs API] ❌ Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}
