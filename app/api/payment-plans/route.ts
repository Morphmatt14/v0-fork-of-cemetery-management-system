 import { NextRequest, NextResponse } from 'next/server'
 import { supabaseServer } from '@/lib/supabase-server'
 import { uploadBufferToStorage } from '@/lib/services/storage'
 import { generateInvoicePdfBuffer } from '@/lib/services/invoice'
 import { sendEmail } from '@/lib/services/email'

 const ALLOWED_PLAN_TYPES = ['full', 'monthly', 'annual', 'custom'] as const

interface InstallmentInput {
  dueDate: string
  amount: number
}

export async function POST(request: NextRequest) {
  try {
    const {
      clientId,
      lotId,
      planType,
      totalAmount,
      downPayment,
      startDate,
      endDate,
      installments,
      notes
    } = await request.json()

    if (!clientId || !lotId || !planType || !totalAmount) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    if (!ALLOWED_PLAN_TYPES.includes(planType)) {
      return NextResponse.json({ success: false, error: 'Invalid plan type' }, { status: 400 })
    }

    if (!Array.isArray(installments) || installments.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one installment is required' }, { status: 400 })
    }

    const validInstallments: InstallmentInput[] = installments.filter(
      (inst: InstallmentInput) => inst?.dueDate && inst?.amount > 0
    )

    if (validInstallments.length === 0) {
      return NextResponse.json({ success: false, error: 'Installments are invalid' }, { status: 400 })
    }

    const [clientRes, lotRes] = await Promise.all([
      supabaseServer
        .from('clients')
        .select('id, name, email, phone, address, contract_pdf_url')
        .eq('id', clientId)
        .single(),
      supabaseServer
        .from('lots')
        .select('id, lot_number, lot_type, price')
        .eq('id', lotId)
        .single()
    ])

    if (clientRes.error || !clientRes.data) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    if (lotRes.error || !lotRes.data) {
      return NextResponse.json({ success: false, error: 'Lot not found' }, { status: 404 })
    }

    const { data: plan, error: planError } = await supabaseServer
      .from('payment_plans')
      .insert({
        client_id: clientId,
        lot_id: lotId,
        plan_type: planType,
        total_amount: totalAmount,
        down_payment: downPayment || null,
        start_date: startDate || new Date().toISOString(),
        end_date: endDate || null,
        notes: notes || null
      })
      .select()
      .single()

    if (planError || !plan) {
      console.error('[Payment Plans] Failed to create plan:', planError)
      return NextResponse.json({ success: false, error: 'Failed to create payment plan' }, { status: 500 })
    }

    const installmentPayload = validInstallments.map((inst) => ({
      plan_id: plan.id,
      client_id: clientId,
      lot_id: lotId,
      due_date: inst.dueDate,
      amount: inst.amount
    }))

    const { data: insertedInstallments, error: installmentError } = await supabaseServer
      .from('payment_installments')
      .insert(installmentPayload)
      .select()

    if (installmentError || !insertedInstallments) {
      console.error('[Payment Plans] Failed to insert installments:', installmentError)
      return NextResponse.json({ success: false, error: 'Failed to create installments' }, { status: 500 })
    }

    const invoiceBucket = process.env.NEXT_PUBLIC_INVOICE_BUCKET || 'documents'
    const invoiceLinks: string[] = []

    for (const installment of insertedInstallments) {
      try {
        const { buffer, invoiceNumber } = await generateInvoicePdfBuffer({
          client: clientRes.data,
          lot: {
            lot_number: lotRes.data.lot_number,
            lot_type: lotRes.data.lot_type,
            price: lotRes.data.price,
            section: null
          },
          plan: {
            id: plan.id,
            plan_type: plan.plan_type,
            total_amount: plan.total_amount,
            start_date: plan.start_date,
            end_date: plan.end_date
          },
          installment: {
            id: installment.id,
            due_date: installment.due_date,
            amount: installment.amount
          }
        })

        const storagePath = `invoices/${plan.id}/${invoiceNumber}.pdf`
        const upload = await uploadBufferToStorage({
          bucket: invoiceBucket,
          path: storagePath,
          buffer,
          contentType: 'application/pdf'
        })

        const { data: invoice, error: invoiceError } = await supabaseServer
          .from('invoices')
          .insert({
            plan_id: plan.id,
            installment_id: installment.id,
            invoice_number: invoiceNumber,
            amount: installment.amount,
            currency: 'PHP',
            pdf_url: upload.url,
            status: 'generated'
          })
          .select()
          .single()

        if (invoiceError || !invoice) {
          console.error('[Payment Plans] Failed to insert invoice:', invoiceError)
          continue
        }

        invoiceLinks.push(upload.url)

        await supabaseServer
          .from('payment_installments')
          .update({ invoice_id: invoice.id })
          .eq('id', installment.id)
      } catch (error) {
        console.error('[Payment Plans] Invoice generation failed:', error)
      }
    }

    if (clientRes.data.email && invoiceLinks.length > 0) {
      const emailLinks: string[] = []

      for (const url of invoiceLinks) {
        emailLinks.push(`<p><a href="${url}" target="_blank" rel="noopener noreferrer">Download Invoice</a></p>`)
      }

      if (clientRes.data.contract_pdf_url) {
        emailLinks.push(`<p><a href="${clientRes.data.contract_pdf_url}" target="_blank" rel="noopener noreferrer">Download Contract of Ownership</a></p>`)
      }

      try {
        await sendEmail({
          to: clientRes.data.email,
          subject: 'Payment Plan Documents - Surigao Memorial Park',
          html: `
            <p>Hi ${clientRes.data.name || 'Client'},</p>
            <p>Your payment plan has been created. You can access your documents below:</p>
            ${emailLinks.join('\n')}
            <p>Thank you,<br/>Surigao Memorial Park</p>
          `
        })
      } catch (emailError) {
        console.error('[Payment Plans] Failed to send invoice email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        plan,
        installments: insertedInstallments
      }
    })
  } catch (error) {
    console.error('[Payment Plans] Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
