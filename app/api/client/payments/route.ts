import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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

    // Fetch payments for this client (including lot + contract metadata)
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`*, lots:lot_id(id, lot_number), clients:client_id(contract_pdf_url)`)
      .eq('client_id', clientId)
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
    const transformedPayments = (payments || []).map(payment => ({
      id: payment.id,
      date: payment.payment_date || payment.created_at,
      amount: payment.amount,
      type: payment.payment_type || 'Installment',
      status: payment.payment_status || payment.status || 'Pending',
      // Use the database lot_id for joins/calculations
      lotId: payment.lot_id,
      // Provide a friendly label (lot number) for display
      lotLabel: payment.lots?.lot_number || payment.lot_id,
      reference: payment.reference_number || payment.id,
      invoice_pdf_url: payment.invoice_pdf_url || payment.receipt_pdf_url || null,
      contract_pdf_url: payment.contract_pdf_url || payment.clients?.contract_pdf_url || null,
      receipt_pdf_url: payment.receipt_pdf_url || null,
      agreement_text: payment.agreement_text || null
    }))

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
