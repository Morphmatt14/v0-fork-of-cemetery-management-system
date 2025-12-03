import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { generatePaymentInvoicePdfBuffer } from '@/lib/services/invoice'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      )
    }

    const { data: client, error: clientError } = await supabaseServer
      .from('clients')
      .select('id, name, email, phone, address')
      .eq('id', clientId)
      .maybeSingle()

    if (clientError) {
      console.error('[Client Latest Invoice] Failed to fetch client:', clientError)
      return NextResponse.json(
        { success: false, error: 'Failed to load client profile' },
        { status: 500 }
      )
    }

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    const { data: payment, error: paymentError } = await supabaseServer
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .in('payment_status', ['Completed', 'Paid'])
      .is('deleted_at', null)
      .order('payment_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (paymentError) {
      console.error('[Client Latest Invoice] Failed to fetch payments:', paymentError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch latest payment' },
        { status: 500 }
      )
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'No completed payments found for this client' },
        { status: 404 }
      )
    }

    let lotDetails:
      | { lot_number: string | null; lot_type: string | null; price: number | null; section: string | null }
      | undefined

    if (payment.lot_id) {
      const { data: lot, error: lotError } = await supabaseServer
        .from('lots')
        .select('lot_number, lot_type, price, section_id, cemetery_sections(name)')
        .eq('id', payment.lot_id)
        .maybeSingle()

      if (lotError) {
        console.error('[Client Latest Invoice] Failed to fetch lot for invoice:', lotError)
      } else if (lot) {
        const sectionRelation = Array.isArray(lot.cemetery_sections)
          ? lot.cemetery_sections[0]
          : lot.cemetery_sections

        lotDetails = {
          lot_number: lot.lot_number,
          lot_type: lot.lot_type,
          price: lot.price,
          section: sectionRelation?.name || lot.section_id,
        }
      }
    }

    const { buffer, invoiceNumber } = await generatePaymentInvoicePdfBuffer({
      client: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
      },
      lot: lotDetails,
      payment: {
        reference: payment.reference_number || `INV-${payment.id}`,
        amount: payment.amount,
        payment_type: payment.payment_type,
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
      },
      cashier: { name: 'System' },
      agreementText: payment.agreement_text,
    })

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoiceNumber}.pdf"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error: any) {
    console.error('[Client Latest Invoice] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
