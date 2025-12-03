import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// ============================================================================
// DASHBOARD STATS API
// ============================================================================
// Fetches real-time statistics for admin/employee dashboards
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // 'admin' or 'employee'

    console.log('[Dashboard Stats] Fetching stats for role:', role)

    // Fetch counts in parallel
    const [
      lotsResult,
      clientsResult,
      burialsResult,
      paymentsResult,
      inquiriesResult,
      appointmentsResult
    ] = await Promise.all([
      // Total lots
      supabaseServer
        .from('lots')
        .select('id, status', { count: 'exact', head: false })
        .is('deleted_at', null),
      
      // Total clients
      supabaseServer
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null),
      
      // Total burials
      supabaseServer
        .from('burials')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null),
      
      // Recent payments
      supabaseServer
        .from('payments')
        .select('id, payment_status', { count: 'exact', head: false })
        .is('deleted_at', null),
      
      // Open inquiries
      supabaseServer
        .from('inquiries')
        .select('id, status', { count: 'exact', head: false })
        .is('deleted_at', null),
      
      // Upcoming appointments
      supabaseServer
        .from('appointments')
        .select('id, status', { count: 'exact', head: false })
        .gte('appointment_date', new Date().toISOString())
        .is('deleted_at', null)
    ])

    // Calculate lot statistics
    const lots = lotsResult.data || []
    const lotStats = {
      total: lotsResult.count || 0,
      available: lots.filter(l => l.status === 'Available').length,
      occupied: lots.filter(l => l.status === 'Occupied').length,
      reserved: lots.filter(l => l.status === 'Reserved').length,
      maintenance: lots.filter(l => l.status === 'Maintenance').length
    }

    // Calculate payment statistics
    const payments = paymentsResult.data || []
    const paymentStats = {
      total: paymentsResult.count || 0,
      completed: payments.filter(p => p.payment_status === 'Completed').length,
      pending: payments.filter(p => p.payment_status === 'Pending').length,
      overdue: payments.filter(p => p.payment_status === 'Overdue').length
    }

    // Calculate inquiry statistics
    const inquiries = inquiriesResult.data || []
    const inquiryStats = {
      total: inquiriesResult.count || 0,
      open: inquiries.filter(i => i.status === 'New' || i.status === 'Pending' || i.status === 'Open').length,
      inProgress: inquiries.filter(i => i.status === 'In Progress').length,
      resolved: inquiries.filter(i => i.status === 'Resolved' || i.status === 'Closed').length
    }

    const stats = {
      lots: lotStats,
      clients: {
        total: clientsResult.count || 0
      },
      burials: {
        total: burialsResult.count || 0
      },
      payments: paymentStats,
      inquiries: inquiryStats,
      appointments: {
        upcoming: appointmentsResult.count || 0
      }
    }

    console.log('[Dashboard Stats] ✅ Stats fetched successfully')

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error: any) {
    console.error('[Dashboard Stats] ❌ Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
