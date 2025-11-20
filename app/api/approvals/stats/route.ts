import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { ApprovalStats, ApprovalStatsResponse } from '@/lib/types/approvals'

// ============================================================================
// GET /api/approvals/stats - Get approval workflow statistics
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    console.log('[Approvals API] GET stats - Fetching approval statistics')

    // Get current admin user for authorization
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
      .select('id, status')
      .eq('id', adminId)
      .eq('status', 'active')
      .single()

    if (adminError || !admin) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or inactive admin'
      }, { status: 403 })
    }

    // Get date boundaries for "today"
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Parallel queries for different statistics
    const [
      pendingCount,
      todayStats,
      actionTypeStats,
      employeeStats,
      priorityStats,
      avgApprovalTime
    ] = await Promise.all([
      // Current pending count
      supabaseServer
        .from('pending_actions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),

      // Today's stats
      supabaseServer
        .from('pending_actions')
        .select('status, reviewed_at, created_at')
        .gte('reviewed_at', today.toISOString())
        .lt('reviewed_at', tomorrow.toISOString()),

      // Stats by action type
      supabaseServer
        .from('pending_actions')
        .select('action_type, status')
        .neq('status', 'cancelled'), // Exclude cancelled from stats

      // Stats by employee (last 30 days)
      supabaseServer
        .from('pending_actions')
        .select(`
          requested_by_id,
          requested_by_username,
          requested_by_name,
          status,
          created_at,
          reviewed_at
        `)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

      // Stats by priority (current pending)
      supabaseServer
        .from('pending_actions')
        .select('priority, created_at, reviewed_at')
        .eq('status', 'pending'),

      // Average approval time (last 100 approved/rejected actions)
      supabaseServer
        .from('pending_actions')
        .select('created_at, reviewed_at, status')
        .in('status', ['approved', 'rejected'])
        .not('reviewed_at', 'is', null)
        .order('reviewed_at', { ascending: false })
        .limit(100)
    ])

    // Handle query errors
    if (pendingCount.error) {
      console.error('Pending count error:', pendingCount.error)
      throw new Error('Failed to fetch pending count')
    }

    if (todayStats.error) {
      console.error('Today stats error:', todayStats.error)
      throw new Error('Failed to fetch today statistics')
    }

    if (actionTypeStats.error) {
      console.error('Action type stats error:', actionTypeStats.error)
      throw new Error('Failed to fetch action type statistics')
    }

    if (employeeStats.error) {
      console.error('Employee stats error:', employeeStats.error)
      throw new Error('Failed to fetch employee statistics')
    }

    if (priorityStats.error) {
      console.error('Priority stats error:', priorityStats.error)
      throw new Error('Failed to fetch priority statistics')
    }

    if (avgApprovalTime.error) {
      console.error('Avg approval time error:', avgApprovalTime.error)
      throw new Error('Failed to fetch approval time statistics')
    }

    // Calculate today's counts
    const todayData = todayStats.data || []
    const approvedToday = todayData.filter(item => item.status === 'approved').length
    const rejectedToday = todayData.filter(item => item.status === 'rejected').length
    const cancelledToday = todayData.filter(item => item.status === 'cancelled').length
    const expiredToday = todayData.filter(item => item.status === 'expired').length

    // Calculate approval/rejection rates
    const totalReviewed = approvedToday + rejectedToday
    const approvalRate = totalReviewed > 0 ? (approvedToday / totalReviewed) * 100 : 0
    const rejectionRate = totalReviewed > 0 ? (rejectedToday / totalReviewed) * 100 : 0

    // Calculate average approval time
    const approvalTimeData = avgApprovalTime.data || []
    let avgApprovalTimeHours = 0
    if (approvalTimeData.length > 0) {
      const totalHours = approvalTimeData.reduce((sum, item) => {
        const created = new Date(item.created_at)
        const reviewed = new Date(item.reviewed_at)
        const diffHours = (reviewed.getTime() - created.getTime()) / (1000 * 60 * 60)
        return sum + diffHours
      }, 0)
      avgApprovalTimeHours = totalHours / approvalTimeData.length
    }

    // Group by action type
    const actionTypeData = actionTypeStats.data || []
    const byActionType: any = {}
    actionTypeData.forEach(item => {
      if (!byActionType[item.action_type]) {
        byActionType[item.action_type] = {
          pending: 0,
          approved: 0,
          rejected: 0,
          cancelled: 0,
          expired: 0
        }
      }
      byActionType[item.action_type][item.status]++
    })

    // Group by employee
    const employeeData = employeeStats.data || []
    const byEmployee: any = {}
    employeeData.forEach(item => {
      const key = `${item.requested_by_username} (${item.requested_by_name || 'No name'})`
      if (!byEmployee[key]) {
        byEmployee[key] = {
          pending: 0,
          approved: 0,
          rejected: 0,
          avg_approval_time_hours: 0,
          total_reviewed: 0,
          total_approval_time: 0
        }
      }

      byEmployee[key][item.status]++

      // Calculate approval time for this employee
      if (item.reviewed_at && (item.status === 'approved' || item.status === 'rejected')) {
        const created = new Date(item.created_at)
        const reviewed = new Date(item.reviewed_at)
        const diffHours = (reviewed.getTime() - created.getTime()) / (1000 * 60 * 60)
        byEmployee[key].total_reviewed++
        byEmployee[key].total_approval_time += diffHours
        byEmployee[key].avg_approval_time_hours = byEmployee[key].total_approval_time / byEmployee[key].total_reviewed
      }
    })

    // Clean up employee stats
    Object.keys(byEmployee).forEach(key => {
      delete byEmployee[key].total_reviewed
      delete byEmployee[key].total_approval_time
    })

    // Group by priority
    const priorityData = priorityStats.data || []
    const byPriority: any = {}
    priorityData.forEach(item => {
      if (!byPriority[item.priority]) {
        byPriority[item.priority] = {
          pending: 0,
          avg_approval_time_hours: 0,
          total_time: 0,
          count: 0
        }
      }

      byPriority[item.priority].pending++

      // Calculate average time pending for this priority
      const created = new Date(item.created_at)
      const now = new Date()
      const pendingHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
      byPriority[item.priority].total_time += pendingHours
      byPriority[item.priority].count++
      byPriority[item.priority].avg_approval_time_hours = byPriority[item.priority].total_time / byPriority[item.priority].count
    })

    // Clean up priority stats
    Object.keys(byPriority).forEach(key => {
      delete byPriority[key].total_time
      delete byPriority[key].count
    })

    const stats: ApprovalStats = {
      pending_count: pendingCount.count || 0,
      approved_today: approvedToday,
      rejected_today: rejectedToday,
      cancelled_today: cancelledToday,
      expired_today: expiredToday,
      avg_approval_time_hours: Math.round(avgApprovalTimeHours * 100) / 100,
      approval_rate: Math.round(approvalRate * 100) / 100,
      rejection_rate: Math.round(rejectionRate * 100) / 100,
      by_action_type: byActionType,
      by_employee: byEmployee,
      by_priority: byPriority
    }

    const response: ApprovalStatsResponse = {
      success: true,
      data: stats
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Approvals API] GET stats unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}
