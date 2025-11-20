import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * GET /api/client/payments
 * Get all payments for the logged-in client
 */
export async function GET(request: NextRequest) {
  try {
    // Get client ID from query params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    console.log('[Client Payments API] Fetching payments for client:', clientId)

    // First, get client's lots
    const { data: lots, error: lotsError } = await supabase
      .from('lots')
      .select('id, lot_number')
      .eq('owner_id', clientId)

    if (lotsError) {
      console.error('[Client Payments API] Error fetching lots:', lotsError)
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      })
    }

    // If client has no lots, return empty array
    if (!lots || lots.length === 0) {
      console.log('[Client Payments API] Client has no lots, returning empty payments')
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      })
    }

    const lotIds = lots.map(lot => lot.id)

    // Fetch payments for these lots
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .in('lot_id', lotIds)
      .order('payment_date', { ascending: false })

    if (error) {
      console.error('[Client Payments API] Error fetching payments:', error)
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      })
    }

    // Transform data to match client portal format
    const transformedPayments = (payments || []).map(payment => {
      const lot = lots.find(l => l.id === payment.lot_id)
      return {
        id: payment.id,
        date: payment.payment_date,
        amount: payment.amount,
        type: payment.payment_type || 'Installment',
        status: payment.status,
        lotId: lot?.lot_number || payment.lot_id,
        ...payment
      }
    })

    console.log('[Client Payments API] Found', transformedPayments.length, 'payments')

    return NextResponse.json({
      success: true,
      data: transformedPayments,
      count: transformedPayments.length
    })

  } catch (error: any) {
    console.error('[Client Payments API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
