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

    const actorRole = body.actorRole as 'admin' | 'employee' | 'cashier' | undefined
    const actorId = body.actorId as string | undefined

    // Validate required fields
    if (!body.status && !body.amount && !body.balance && !body.payment_date && !body.payment_type && !body.payment_method) {
      return NextResponse.json({
        success: false,
        error: 'At least one field (status, amount, balance, payment_date, payment_type, or payment_method) must be provided'
      }, { status: 400 })
    }

    if (actorRole === 'cashier' && !actorId) {
      return NextResponse.json({
        success: false,
        error: 'Cashier updates require actorId'
      }, { status: 403 })
    }

    let existingPayment: { processed_by: string | null } | null = null

    if (actorRole === 'cashier') {
      const { data, error: existingError } = await supabaseServer
        .from('payments')
        .select('processed_by')
        .eq('id', paymentId)
        .single()

      if (existingError || !data) {
        console.error('[Payments API] Unable to verify cashier payment ownership:', existingError)
        return NextResponse.json({
          success: false,
          error: 'Payment not found or inaccessible'
        }, { status: 404 })
      }

      existingPayment = data

      if (existingPayment.processed_by && existingPayment.processed_by !== actorId) {
        return NextResponse.json({
          success: false,
          error: 'Cashiers can only update payments they processed'
        }, { status: 403 })
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (actorRole === 'cashier' && actorId && existingPayment && !existingPayment.processed_by) {
      updateData.processed_by = actorId
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
