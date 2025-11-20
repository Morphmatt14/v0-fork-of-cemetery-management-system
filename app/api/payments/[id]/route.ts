import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// ============================================================================
// PATCH /api/payments/[id] - Update payment
// ============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const paymentId = params.id

    console.log('[Payments API] Updating payment:', paymentId)

    // Validate required fields
    if (!body.status && !body.amount && !body.balance) {
      return NextResponse.json({
        success: false,
        error: 'At least one field (status, amount, or balance) must be provided'
      }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Map status to payment_status (database column name)
    if (body.status) updateData.payment_status = body.status
    if (body.amount !== undefined) updateData.amount = body.amount
    if (body.balance !== undefined) updateData.balance = body.balance
    if (body.payment_date) updateData.payment_date = body.payment_date
    if (body.payment_type) updateData.payment_type = body.payment_type
    if (body.payment_method) updateData.payment_method = body.payment_method

    // Update in database
    const { data, error } = await supabaseServer
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single()

    if (error) {
      console.error('[Payments API] Database error:', error)
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to update payment'
      }, { status: 500 })
    }

    console.log('[Payments API] Payment updated successfully:', data.id)

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('[Payments API] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// ============================================================================
// GET /api/payments/[id] - Get single payment
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id

    const { data, error } = await supabaseServer
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (error) {
      console.error('[Payments API] Database error:', error)
      return NextResponse.json({
        success: false,
        error: error.message || 'Payment not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('[Payments API] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
