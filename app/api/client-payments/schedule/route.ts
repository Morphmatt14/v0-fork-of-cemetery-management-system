import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer
    const body = await request.json()

    const {
      clientId,
      lotId,
      amount,
      paymentType,
      paymentDate,
      paymentMethod,
      notes,
    } = body

    // Validation
    if (!clientId || !lotId || !amount || !paymentDate || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than zero' },
        { status: 400 }
      )
    }

    // Verify client exists and get their balance
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, balance')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    // Get the lot to verify balance
    const { data: lot, error: lotError } = await supabase
      .from('lots')
      .select('id, balance, price')
      .eq('id', lotId)
      .single()

    if (lotError || !lot) {
      return NextResponse.json(
        { success: false, error: 'Lot not found' },
        { status: 404 }
      )
    }

    // Use lot balance (or price if balance not set) for validation
    const lotBalance = lot.balance || lot.price || 0

    // Verify amount doesn't exceed lot balance
    if (amount > lotBalance) {
      return NextResponse.json(
        { success: false, error: `Payment amount exceeds lot balance of ₱${lotBalance.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Check for existing pending payments for this specific lot to prevent over-scheduling
    const { data: pendingPayments, error: pendingError } = await supabase
      .from('payments')
      .select('amount')
      .eq('lot_id', lotId)
      .eq('payment_status', 'Pending')

    if (pendingError) {
      console.error('Error checking pending payments:', pendingError)
    }

    const totalPending = pendingPayments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0
    const availableToSchedule = lotBalance - totalPending

    if (amount > availableToSchedule) {
      return NextResponse.json(
        {
          success: false,
          error: `You can only schedule up to ₱${availableToSchedule.toFixed(2)} (Lot Balance: ₱${lotBalance.toFixed(2)}, Already scheduled: ₱${totalPending.toFixed(2)})`,
        },
        { status: 400 }
      )
    }

    // Validate payment date
    const paymentDateObj = new Date(paymentDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (paymentDateObj < today) {
      return NextResponse.json(
        { success: false, error: 'Payment date cannot be in the past' },
        { status: 400 }
      )
    }

    // Generate reference number
    const timestamp = Date.now()
    const referenceNumber = `SCH-${timestamp}-${clientId.substring(0, 8).toUpperCase()}`

    // Create payment record with status "Pending"
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        client_id: clientId,
        lot_id: lotId,
        amount: amount,
        payment_type: paymentType || 'Installment',
        payment_method: paymentMethod,
        payment_status: 'Pending',
        payment_date: paymentDate,
        reference_number: referenceNumber,
        notes: notes || null,
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment:', paymentError)
      return NextResponse.json(
        { success: false, error: 'Failed to schedule payment' },
        { status: 500 }
      )
    }

    // Create notification for client
    await supabase.from('notifications').insert({
      client_id: clientId,
      notification_type: 'payment',
      title: 'Payment Scheduled',
      message: `Your payment of ₱${amount.toFixed(2)} has been scheduled for ${new Date(paymentDate).toLocaleDateString()}. Please ensure you make the payment on or before this date.`,
      is_read: false,
      related_payment_id: payment.id,
    })

    // TODO: Send email notification to client
    // TODO: Create notification for employees

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Payment scheduled successfully',
    })
  } catch (error) {
    console.error('Error in schedule payment route:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
