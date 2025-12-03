import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cashierId = searchParams.get('cashierId')

    if (!cashierId) {
      return NextResponse.json({
        success: false,
        error: 'cashierId is required'
      }, { status: 400 })
    }

    const today = new Date()
    const todayDate = today.toISOString().split('T')[0]
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

    const [processedRes, queueRes, notificationsRes] = await Promise.all([
      supabaseServer
        .from('payments')
        .select(`
          id,
          amount,
          payment_status,
          payment_type,
          payment_method,
          payment_date,
          created_at,
          client_id,
          lot_id,
          reference_number,
          notes,
          clients(name, email),
          lots(lot_number, section_id)
        `)
        .eq('processed_by', cashierId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(100),
      supabaseServer
        .from('payments')
        .select(`
          id,
          amount,
          payment_status,
          payment_type,
          payment_method,
          payment_date,
          created_at,
          client_id,
          lot_id,
          processed_by,
          reference_number,
          clients(name, email),
          lots(lot_number, section_id)
        `)
        .in('payment_status', ['Pending', 'Overdue'])
        .is('deleted_at', null)
        .order('payment_date', { ascending: true })
        .limit(50),
      supabaseServer
        .from('notifications')
        .select('id, title, message, created_at, is_read, notification_type, related_payment_id')
        .eq('recipient_type', 'cashier')
        .eq('recipient_id', cashierId)
        .order('created_at', { ascending: false })
        .limit(30)
    ])

    if (processedRes.error) throw processedRes.error
    if (queueRes.error) throw queueRes.error
    if (notificationsRes.error) throw notificationsRes.error

    const processedPayments = processedRes.data || []
    const queue = queueRes.data || []
    const notifications = notificationsRes.data || []

    const todayPayments = processedPayments.filter((payment) => {
      if (!payment.payment_date) return false
      return new Date(payment.payment_date).toISOString().split('T')[0] === todayDate
    })

    const todaysAmount = todayPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    const monthCompleted = processedPayments.filter((payment) => {
      if (!payment.created_at) return false
      return new Date(payment.created_at).toISOString() >= monthStart && payment.payment_status === 'Completed'
    }).length

    const summary = {
      todaysWalkIns: todayPayments.length,
      todaysAmount,
      queueSize: queue.length,
      completedThisMonth: monthCompleted,
      pendingAssigned: processedPayments.filter((payment) => payment.payment_status === 'Pending').length,
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        processedPayments,
        queue,
        notifications
      }
    })
  } catch (error: any) {
    console.error('[Cashier Dashboard API] Error:', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to load cashier dashboard'
    }, { status: 500 })
  }
}
