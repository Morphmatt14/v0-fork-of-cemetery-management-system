import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// ============================================================================
// PASSWORD RESET REQUESTS API
// ============================================================================
// Manage password reset requests for admin dashboard
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'rejected', 'expired'

    console.log('[Password Resets API] Fetching requests...', { status })

    let query = supabaseServer
      .from('password_reset_requests')
      .select('*')
      .order('requested_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: requests, error } = await query

    if (error) {
      console.error('[Password Resets API] ❌ Error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch password reset requests' },
        { status: 500 }
      )
    }

    console.log('[Password Resets API] ✅ Found', requests?.length || 0, 'requests')

    return NextResponse.json({
      success: true,
      requests: requests || []
    })

  } catch (error: any) {
    console.error('[Password Resets API] ❌ Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch password reset requests' },
      { status: 500 }
    )
  }
}
