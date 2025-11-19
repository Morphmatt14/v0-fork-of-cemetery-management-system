import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// ============================================================================
// EMPLOYEES API
// ============================================================================
// Fetch employees data for admin dashboard
// ============================================================================

// Force dynamic rendering - don't cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    console.log('[Employees API] Fetching employees...')

    const { data: employees, error, count } = await supabaseServer
      .from('employees')
      .select('id, username, name, email, phone, status, created_at, last_login', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Employees API] ❌ Error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch employees' },
        { status: 500 }
      )
    }

    console.log('[Employees API] ✅ Found', count, 'employees')
    console.log('[Employees API] Employee IDs:', employees?.map(e => ({ id: e.id, username: e.username })))

    return NextResponse.json({
      success: true,
      employees: employees || [],
      count: count || 0
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })

  } catch (error: any) {
    console.error('[Employees API] ❌ Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}
