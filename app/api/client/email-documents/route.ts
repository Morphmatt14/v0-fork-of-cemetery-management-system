 import { NextRequest, NextResponse } from 'next/server'
 import path from 'node:path'
 import { readFile } from 'node:fs/promises'
 import { supabaseServer } from '@/lib/supabase-server'
 import { sendEmail } from '@/lib/services/email'
 import { generateOwnershipCertificatePdfBuffer } from '@/lib/services/contract'
 import { uploadBufferToStorage } from '@/lib/services/storage'
 import { generatePaymentInvoicePdfBuffer } from '@/lib/services/invoice'

 const CERTIFICATE_TEMPLATE_PATH =
   process.env.CERTIFICATE_TEMPLATE_PATH ||
   path.join(process.cwd(), 'documents', 'CertificateofOwnershipSurigaoMemorialPark.pdf')

 async function uploadTemplateCertificate(clientId: string) {
   try {
     const templateBuffer = await readFile(CERTIFICATE_TEMPLATE_PATH)
     const contractBucket = process.env.NEXT_PUBLIC_CONTRACT_BUCKET || process.env.NEXT_PUBLIC_INVOICE_BUCKET || 'documents'
     const storagePath = `contracts/${clientId}/template-certificate.pdf`
     const upload = await uploadBufferToStorage({
       bucket: contractBucket,
       path: storagePath,
       buffer: templateBuffer,
       contentType: 'application/pdf',
     })

     await supabaseServer
       .from('clients')
       .update({ contract_pdf_url: upload.url, updated_at: new Date().toISOString() })
       .eq('id', clientId)

     return upload.url
   } catch (error) {
     console.error('[Client Email Documents] Template certificate upload failed:', error)
     return null
   }
 }

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json()

    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Client ID is required' }, { status: 400 })
    }

    const { data: client, error: clientError } = await supabaseServer
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle()

    if (clientError) {
      console.error('[Client Email Documents] Failed to fetch client:', clientError)
      return NextResponse.json({ success: false, error: 'Failed to load client profile' }, { status: 500 })
    }

    if (!client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    if (!client.email) {
      return NextResponse.json({ success: false, error: 'Client does not have an email on file.' }, { status: 400 })
    }

    let contractUrl: string | null = client.contract_pdf_url
    const contractFields: Record<string, string | null> = {
      contract_section: client.contract_section,
      contract_block: client.contract_block,
      contract_lot_number: client.contract_lot_number,
      contract_lot_type: client.contract_lot_type,
      contract_signed_at: client.contract_signed_at,
      contract_authorized_by: client.contract_authorized_by,
      contract_authorized_pos: client.contract_authorized_pos,
    }

    const missingContractFields = Object.entries(contractFields)
      .filter(([, value]) => !value || !`${value}`.trim())
      .map(([key]) => key)

    const hasContractDetails = missingContractFields.length === 0

    if (!contractUrl && hasContractDetails) {
      try {
        const { buffer, certificateNumber } = await generateOwnershipCertificatePdfBuffer({
          contractNumber: client.contract_number || undefined,
          issueDate: client.contract_signed_at || new Date().toISOString(),
          grantee: {
            name: client.name,
            address: client.address,
            email: client.email,
            phone: client.phone,
          },
          lot: {
            section: client.contract_section || 'N/A',
            block: client.contract_block || 'N/A',
            lotNumber: client.contract_lot_number || client.id,
            lotType: client.contract_lot_type || 'N/A',
          },
          authorizedSignatory: {
            name: client.contract_authorized_by || 'Surigao Memorial Park',
            position: client.contract_authorized_pos || 'Authorized Representative',
          },
        })

        const contractBucket = process.env.NEXT_PUBLIC_CONTRACT_BUCKET || process.env.NEXT_PUBLIC_INVOICE_BUCKET || 'documents'
        const storagePath = `contracts/${client.id}/${certificateNumber}.pdf`
        const upload = await uploadBufferToStorage({
          bucket: contractBucket,
          path: storagePath,
          buffer,
          contentType: 'application/pdf',
        })

        contractUrl = upload.url

        await supabaseServer
          .from('clients')
          .update({
            contract_pdf_url: contractUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', client.id)
      } catch (contractError) {
        console.error('[Client Email Documents] Failed to generate contract PDF:', contractError)
      }
    }

    if (!contractUrl) {
      const fallbackUrl = await uploadTemplateCertificate(client.id)
      if (fallbackUrl) {
        contractUrl = fallbackUrl
      }
    }

    // Collect invoice URLs from direct payments
    const { data: payments, error: paymentsError } = await supabaseServer
      .from('payments')
      .select('id, lot_id, amount, payment_type, payment_method, payment_date, reference_number, invoice_pdf_url, receipt_pdf_url, agreement_text')
      .eq('client_id', clientId)
      .is('deleted_at', null)

    if (paymentsError) {
      console.error('[Client Email Documents] Failed to fetch payments:', paymentsError)
    }

    const paymentInvoiceUrls: string[] = (payments || [])
      .map((p: any) => p.invoice_pdf_url || p.receipt_pdf_url)
      .filter((url: string | null | undefined): url is string => Boolean(url))

    // Collect invoice URLs from payment plans
    const { data: plans, error: plansError } = await supabaseServer
      .from('payment_plans')
      .select('id')
      .eq('client_id', clientId)

    let planInvoiceUrls: string[] = []

    if (plansError) {
      console.error('[Client Email Documents] Failed to fetch payment plans:', plansError)
    } else if (plans && plans.length > 0) {
      const planIds = plans.map((p: any) => p.id)

      const { data: invoices, error: invoicesError } = await supabaseServer
        .from('invoices')
        .select('pdf_url, plan_id')
        .in('plan_id', planIds)

      if (invoicesError) {
        console.error('[Client Email Documents] Failed to fetch invoices:', invoicesError)
      } else {
        planInvoiceUrls = (invoices || [])
          .map((inv: any) => inv.pdf_url)
          .filter((url: string | null | undefined): url is string => Boolean(url))
      }
    }

    const allInvoiceUrls = Array.from(new Set([...paymentInvoiceUrls, ...planInvoiceUrls]))

    if (allInvoiceUrls.length === 0 && payments && payments.length > 0) {
      const targetPayment = (payments as any[]).find((p) => Number(p.amount) > 0) || (payments as any[])[0]

      try {
        let lotDetails: { lot_number: string | null; lot_type: string | null; price: number | null; section: string | null } | undefined

        if (targetPayment.lot_id) {
          const { data: lot, error: lotError } = await supabaseServer
            .from('lots')
            .select('lot_number, lot_type, price, section_id, cemetery_sections(name)')
            .eq('id', targetPayment.lot_id)
            .maybeSingle()

          if (lotError) {
            console.error('[Client Email Documents] Failed to fetch lot for invoice fallback:', lotError)
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
            reference: targetPayment.reference_number || `INV-${targetPayment.id}`,
            amount: targetPayment.amount,
            payment_type: targetPayment.payment_type,
            payment_method: targetPayment.payment_method,
            payment_date: targetPayment.payment_date,
          },
          cashier: { name: 'System' },
          agreementText: targetPayment.agreement_text,
        })

        const invoiceBucket = process.env.NEXT_PUBLIC_INVOICE_BUCKET || 'documents'
        const storagePath = `cashier-payments/${client.id}/${invoiceNumber}.pdf`
        const upload = await uploadBufferToStorage({
          bucket: invoiceBucket,
          path: storagePath,
          buffer,
          contentType: 'application/pdf',
        })

        await supabaseServer
          .from('payments')
          .update({
            invoice_number: invoiceNumber,
            invoice_pdf_url: upload.url,
          })
          .eq('id', targetPayment.id)

        allInvoiceUrls.push(upload.url)
      } catch (invoiceError) {
        console.error('[Client Email Documents] Failed to generate fallback invoice:', invoiceError)
      }
    }

    const emailLinks: string[] = []

    for (const url of allInvoiceUrls) {
      emailLinks.push(`<p><a href="${url}" target="_blank" rel="noopener noreferrer">Download Invoice</a></p>`)
    }

    if (contractUrl) {
      emailLinks.push(`<p><a href="${contractUrl}" target="_blank" rel="noopener noreferrer">Download Contract of Ownership</a></p>`)
    }

    if (emailLinks.length === 0) {
      return NextResponse.json({ success: false, error: 'No documents available to email yet.' }, { status: 404 })
    }

    const emailResult = await sendEmail({
      to: client.email,
      subject: 'Your Documents - Surigao Memorial Park',
      html: `
        <p>Hi ${client.name || 'Client'},</p>
        <p>Here are your documents from Surigao Memorial Park:</p>
        ${emailLinks.join('\n')}
        <p>Thank you,<br/>Surigao Memorial Park</p>
      `
    })

    if (!emailResult || (emailResult as any).skipped || (emailResult as any).success === false) {
      console.error('[Client Email Documents] sendEmail failed:', emailResult)
      const reason = (emailResult as any)?.error?.message || 'Email service is not configured'
      return NextResponse.json({ success: false, error: `Unable to send email: ${reason}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Client Email Documents] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
