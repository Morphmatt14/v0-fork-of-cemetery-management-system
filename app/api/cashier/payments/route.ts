import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const STATUS_OPTIONS = ['Pending', 'Overdue', 'Completed', 'Cancelled', 'Refunded'] as const

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cashierId = searchParams.get('cashierId')
    const scope = searchParams.get('scope') || 'assigned'
    const statusParam = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)

    if (!cashierId) {
      return NextResponse.json({
        success: false,
        error: 'cashierId is required'
      }, { status: 400 })
    }

    let query = supabaseServer
      .from('payments')
      .select(`
        id,
        amount,
        payment_status,
        payment_type,
        payment_method,
        payment_date,
        created_at,
        due_date,
        reference_number,
        client_id,
        lot_id,
        processed_by,
        notes,
        clients(name, email, phone),
        lots(lot_number, section)
      `)
      .is('deleted_at', null)

    if (scope === 'queue') {
      query = query
        .in('payment_status', ['Pending', 'Overdue'])
        .is('processed_by', null)
    } else if (scope === 'all') {
      query = query.or(`processed_by.eq.${cashierId},processed_by.is.null`)
    } else {
      query = query.eq('processed_by', cashierId)
    }

    if (statusParam) {
      const statuses = statusParam.split(',').map((status) => status.trim()).filter((status) => STATUS_OPTIONS.includes(status as any))
      if (statuses.length > 0) {
        query = query.in('payment_status', statuses)
      }
    }

    query = query.order('created_at', { ascending: false }).limit(limit)

    const { data, error } = await query

    if (error) {
      throw error
    }

    const payments = data || []

    const stats = payments.reduce(
      (acc, payment) => {
        const statusKey = (payment.payment_status || 'Unknown') as keyof typeof acc
        if (acc[statusKey as keyof typeof acc] !== undefined) {
          acc[statusKey as keyof typeof acc] += 1
        }
        acc.totalAmount += Number(payment.amount || 0)
        return acc
      },
      {
        Pending: 0,
        Overdue: 0,
        Completed: 0,
        Cancelled: 0,
        Refunded: 0,
        totalAmount: 0
      }
    )

    return NextResponse.json({
      success: true,
      data: payments,
      stats
    })
  } catch (error: any) {
    console.error('[Cashier Payments API] Error:', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to load cashier payments'
    }, { status: 500 })
  }
}
