import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// Test endpoint to manually update a payment
// Call: POST /api/test-payment-update
// Body: { paymentId: "uuid", status: "Paid" }

export async function POST(request: NextRequest) {
  try {
    const { paymentId, status } = await request.json()

    console.log('[Test] Attempting to update payment:', { paymentId, status })

    // First, check if payment exists
    const { data: existingPayment, error: fetchError } = await supabaseServer
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (fetchError || !existingPayment) {
      return NextResponse.json({
        success: false,
        error: `Payment not found: ${fetchError?.message || 'No payment with this ID'}`,
        paymentId
      })
    }

    console.log('[Test] Found existing payment:', {
      id: existingPayment.id,
      current_status: existingPayment.payment_status,
      amount: existingPayment.amount
    })

    // Now try to update it
    const updateData = {
      payment_status: status,
      updated_at: new Date().toISOString()
    }

    console.log('[Test] Updating with data:', updateData)

    const { data, error } = await supabaseServer
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select('*')
      .single()

    if (error) {
      console.error('[Test] Update failed:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }

    console.log('[Test] Update successful:', data)

    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully',
      before: existingPayment,
      after: data
    })

  } catch (error) {
    console.error('[Test] Exception:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
