import { NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'crypto'
import { supabaseServer } from '@/lib/supabase-server'
import { hashPassword } from '@/lib/supabase-client'
import { generatePaymentInvoicePdfBuffer } from '@/lib/services/invoice'
import { generateOwnershipCertificatePdfBuffer } from '@/lib/services/contract'
import { uploadBufferToStorage } from '@/lib/services/storage'
import { sendEmail } from '@/lib/services/email'

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
      contentType: 'application/pdf'
    })

    await supabaseServer
      .from('clients')
      .update({ contract_pdf_url: upload.url, updated_at: new Date().toISOString() })
      .eq('id', clientId)

    return upload.url
  } catch (error) {
    console.error('[Cashier Walk-In API] Template certificate upload failed:', error)
    return null
  }
}

async function recomputeLotAndClientBalance(clientId: string, lotId: string) {
  try {
    const { data: lot, error: lotError } = await supabaseServer
      .from('lots')
      .select('id, price, balance')
      .eq('id', lotId)
      .is('deleted_at', null)
      .maybeSingle()

    if (lotError || !lot) {
      console.error('[Cashier Walk-In API] Balance recompute skipped - lot not found:', lotError)
      return
    }

    const { data: completedPayments, error: paymentsError } = await supabaseServer
      .from('payments')
      .select('amount, payment_status')
      .eq('client_id', clientId)
      .eq('lot_id', lotId)
      .is('deleted_at', null)
      .in('payment_status', ['Completed', 'Paid'])

    if (paymentsError) {
      console.error('[Cashier Walk-In API] Failed to load completed payments for balance recompute:', paymentsError)
      return
    }

    const totalPaid = (completedPayments || []).reduce(
      (sum, payment) => sum + (Number(payment.amount) || 0),
      0
    )

    const lotPrice = Number((lot as any).price) || 0
    const newLotBalance = Math.max(0, lotPrice - totalPaid)

    const { error: lotUpdateError } = await supabaseServer
      .from('lots')
      .update({ balance: newLotBalance, updated_at: new Date().toISOString() })
      .eq('id', lotId)

    if (lotUpdateError) {
      console.error('[Cashier Walk-In API] Failed to update lot balance:', lotUpdateError)
      return
    }

    const { data: ownedLots, error: ownedLotsError } = await supabaseServer
      .from('lots')
      .select('balance')
      .eq('owner_id', clientId)
      .is('deleted_at', null)

    if (ownedLotsError) {
      console.error('[Cashier Walk-In API] Failed to recompute client balance:', ownedLotsError)
      return
    }

    const newClientBalance = (ownedLots || []).reduce(
      (sum, item) => sum + (Number(item.balance) || 0),
      0
    )

    await supabaseServer
      .from('clients')
      .update({ balance: newClientBalance, updated_at: new Date().toISOString() })
      .eq('id', clientId)
      .is('deleted_at', null)
  } catch (error) {
    console.error('[Cashier Walk-In API] Unexpected error during balance recompute:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      cashierId,
      cashierUsername,
      clientId,
      clientName,
      clientEmail,
      lotId,
      amount,
      paymentType,
      paymentMethod,
      paymentStatus,
      notes,
      agreementText,
      sourcePaymentId
    } = body

    if (!cashierId) {
      return NextResponse.json({ success: false, error: 'cashierId is required' }, { status: 400 })
    }

    const paymentAmount = Number(amount)

    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid payment amount is required' }, { status: 400 })
    }

    if (!paymentType || !paymentMethod) {
      return NextResponse.json({ success: false, error: 'paymentType and paymentMethod are required' }, { status: 400 })
    }

    let resolvedClientId = clientId?.trim() || ''
    let resolvedClientName = clientName?.trim() || ''
    let resolvedClientEmail = clientEmail?.trim() || ''

    if (!resolvedClientId) {
      if (!resolvedClientName || !resolvedClientEmail) {
        return NextResponse.json({
          success: false,
          error: 'Provide either clientId or clientName + clientEmail'
        }, { status: 400 })
      }

      const { data: existingClient, error: existingClientError } = await supabaseServer
        .from('clients')
        .select('id, name, email')
        .eq('email', resolvedClientEmail)
        .maybeSingle()

      if (existingClientError) {
        throw existingClientError
      }

      if (existingClient) {
        resolvedClientId = existingClient.id
        resolvedClientName = existingClient.name
        resolvedClientEmail = existingClient.email
      } else {
        const tempPassword = randomUUID().slice(0, 8)
        const passwordHash = await hashPassword(tempPassword)
        const timestamp = new Date().toISOString()

        const { data: newClient, error: createClientError } = await supabaseServer
          .from('clients')
          .insert({
            email: resolvedClientEmail,
            password_hash: passwordHash,
            name: resolvedClientName,
            status: 'active',
            join_date: timestamp.split('T')[0],
            created_at: timestamp,
            updated_at: timestamp
          })
          .select('id, name, email')
          .single()

        if (createClientError || !newClient) {
          console.error('[Cashier Walk-In API] Failed to create client:', createClientError)
          return NextResponse.json({ success: false, error: 'Unable to create client profile' }, { status: 500 })
        }

        resolvedClientId = newClient.id
      }
    }

    if (!resolvedClientId) {
      return NextResponse.json({ success: false, error: 'Client could not be resolved' }, { status: 400 })
    }

    let resolvedLotId: string | null = null

    let lotDetails: { id: string; lot_number: string | null; lot_type: string | null; section: string | null; price: number | null } | null = null

    async function hydrateLotDetails(targetLotId: string) {
      const { data: lot, error: lotError } = await supabaseServer
        .from('lots')
        .select('id, lot_number, lot_type, section_id, price, cemetery_sections(name)')
        .eq('id', targetLotId)
        .maybeSingle()

      if (lotError) {
        throw lotError
      }

      if (!lot) {
        return null
      }

      const sectionRelation = Array.isArray(lot.cemetery_sections)
        ? lot.cemetery_sections[0]
        : lot.cemetery_sections

      return {
        id: lot.id,
        lot_number: lot.lot_number,
        lot_type: lot.lot_type,
        section: sectionRelation?.name || lot.section_id,
        price: lot.price
      }
    }

    if (lotId) {
      lotDetails = await hydrateLotDetails(lotId)

      if (!lotDetails) {
        return NextResponse.json({ success: false, error: 'Lot not found' }, { status: 404 })
      }

      resolvedLotId = lotDetails.id
    } else {
      const { data: linkedLot, error: linkedLotError } = await supabaseServer
        .from('client_lots')
        .select('lot_id, lots(id, lot_number, lot_type, section_id, price, cemetery_sections(name))')
        .eq('client_id', resolvedClientId)
        .order('is_primary', { ascending: false })
        .order('purchase_date', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (linkedLotError) {
        console.error('[Cashier Walk-In API] Failed to resolve client lot:', linkedLotError)
      }

      const derivedLotCollection = linkedLot?.lots
      const derivedLot = Array.isArray(derivedLotCollection)
        ? derivedLotCollection[0]
        : derivedLotCollection || null

      if (derivedLot) {
        const sectionRelation = Array.isArray(derivedLot.cemetery_sections)
          ? derivedLot.cemetery_sections[0]
          : derivedLot.cemetery_sections

        lotDetails = {
          id: derivedLot.id,
          lot_number: derivedLot.lot_number,
          lot_type: derivedLot.lot_type,
          section: sectionRelation?.name || derivedLot.section_id,
          price: derivedLot.price
        }
        resolvedLotId = derivedLot.id
      }
    }

    if (!resolvedLotId || !lotDetails) {
      return NextResponse.json({ success: false, error: 'Client must have an assigned lot before recording a payment.' }, { status: 400 })
    }

    const { data: clientProfile } = await supabaseServer
      .from('clients')
      .select(`
        id,
        name,
        email,
        phone,
        address,
        contract_section,
        contract_block,
        contract_lot_number,
        contract_lot_type,
        contract_signed_at,
        contract_authorized_by,
        contract_authorized_pos,
        contract_pdf_url
      `)
      .eq('id', resolvedClientId)
      .maybeSingle()

    const referenceNumber = `WALK-${Date.now().toString(36).toUpperCase()}-${cashierId.slice(0, 6).toUpperCase()}`
    const status = paymentStatus || 'Completed'
    const paymentDate = new Date().toISOString()

    let payment: any = null

    if (sourcePaymentId) {
      const { data: existingPayment, error: existingError } = await supabaseServer
        .from('payments')
        .select('*')
        .eq('id', sourcePaymentId)
        .is('deleted_at', null)
        .maybeSingle()

      if (!existingError && existingPayment) {
        const { data: updatedPayment, error: updateError } = await supabaseServer
          .from('payments')
          .update({
            client_id: resolvedClientId,
            lot_id: resolvedLotId,
            amount: paymentAmount,
            payment_type: paymentType,
            payment_method: paymentMethod,
            payment_status: status,
            payment_date: paymentDate,
            processed_by: cashierId,
            reference_number: existingPayment.reference_number || referenceNumber,
            notes: notes || existingPayment.notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', sourcePaymentId)
          .select('*')
          .maybeSingle()

        if (updateError || !updatedPayment) {
          console.error('[Cashier Walk-In API] Failed to update existing payment, falling back to insert:', updateError)
        } else {
          payment = updatedPayment
        }
      } else {
        console.error('[Cashier Walk-In API] Source payment not found, falling back to insert:', existingError)
      }
    }

    if (!payment) {
      const { data: insertedPayment, error: paymentError } = await supabaseServer
        .from('payments')
        .insert({
          client_id: resolvedClientId,
          lot_id: resolvedLotId,
          amount: paymentAmount,
          payment_type: paymentType,
          payment_method: paymentMethod,
          payment_status: status,
          payment_date: paymentDate,
          processed_by: cashierId,
          reference_number: referenceNumber,
          notes: notes || null
        })
        .select('*')
        .single()

      if (paymentError || !insertedPayment) {
        console.error('[Cashier Walk-In API] Payment insert error:', paymentError)
        return NextResponse.json({ success: false, error: 'Failed to record payment' }, { status: 500 })
      }

      payment = insertedPayment
    }

    if (status === 'Completed' || status === 'Paid') {
      await recomputeLotAndClientBalance(resolvedClientId, resolvedLotId)
    }

    let invoiceNumber: string | null = null
    let invoiceUrl: string | null = null
    let contractUrl: string | null = clientProfile?.contract_pdf_url || null

    try {
      const { buffer, invoiceNumber: generatedNumber } = await generatePaymentInvoicePdfBuffer({
        client: {
          name: resolvedClientName || clientProfile?.name || 'Client',
          email: resolvedClientEmail || clientProfile?.email,
          phone: clientProfile?.phone,
          address: clientProfile?.address
        },
        lot: {
          lot_number: lotDetails.lot_number,
          lot_type: lotDetails.lot_type,
          price: lotDetails.price,
          section: lotDetails.section
        },
        payment: {
          reference: referenceNumber,
          amount: paymentAmount,
          payment_type: paymentType,
          payment_method: paymentMethod,
          payment_date: paymentDate
        },
        cashier: { name: cashierUsername },
        agreementText
      })

      const invoiceBucket = process.env.NEXT_PUBLIC_INVOICE_BUCKET || 'documents'
      const storagePath = `cashier-payments/${resolvedClientId}/${generatedNumber}.pdf`
      const upload = await uploadBufferToStorage({
        bucket: invoiceBucket,
        path: storagePath,
        buffer,
        contentType: 'application/pdf'
      })

      invoiceNumber = generatedNumber
      invoiceUrl = upload.url

      await supabaseServer
        .from('payments')
        .update({
          invoice_number: invoiceNumber,
          invoice_pdf_url: invoiceUrl,
          agreement_text: agreementText || null
        })
        .eq('id', payment.id)
    } catch (invoiceError) {
      console.error('[Cashier Walk-In API] Failed to generate/upload invoice:', invoiceError)
    }

    if (!contractUrl && clientProfile?.contract_section && clientProfile.contract_block && clientProfile.contract_lot_number && clientProfile.contract_lot_type && clientProfile.contract_signed_at && clientProfile.contract_authorized_by && clientProfile.contract_authorized_pos) {
      try {
        const { buffer, certificateNumber } = await generateOwnershipCertificatePdfBuffer({
          issueDate: clientProfile.contract_signed_at || undefined,
          grantee: {
            name: resolvedClientName || clientProfile.name || 'Client',
            address: clientProfile.address,
            email: resolvedClientEmail || clientProfile.email,
            phone: clientProfile.phone,
          },
          lot: {
            section: clientProfile.contract_section,
            block: clientProfile.contract_block,
            lotNumber: clientProfile.contract_lot_number,
            lotType: clientProfile.contract_lot_type,
          },
          authorizedSignatory: {
            name: clientProfile.contract_authorized_by,
            position: clientProfile.contract_authorized_pos,
          },
        })

        const contractBucket = process.env.NEXT_PUBLIC_CONTRACT_BUCKET || process.env.NEXT_PUBLIC_INVOICE_BUCKET || 'documents'
        const storagePath = `contracts/${resolvedClientId}/${certificateNumber}.pdf`
        const upload = await uploadBufferToStorage({
          bucket: contractBucket,
          path: storagePath,
          buffer,
          contentType: 'application/pdf'
        })

        contractUrl = upload.url

        await supabaseServer
          .from('clients')
          .update({
            contract_pdf_url: contractUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', resolvedClientId)
      } catch (contractError) {
        console.error('[Cashier Walk-In API] Failed to generate/upload contract:', contractError)
      }
    }

    if (!contractUrl) {
      const fallbackUrl = await uploadTemplateCertificate(resolvedClientId)
      if (fallbackUrl) {
        contractUrl = fallbackUrl
      }
    }

    if (resolvedClientEmail || clientProfile?.email) {
      const emailLinks: string[] = []
      if (invoiceUrl) {
        emailLinks.push(`<p><a href="${invoiceUrl}" target="_blank" rel="noopener noreferrer">Download Invoice Receipt</a></p>`)
      }
      if (contractUrl) {
        emailLinks.push(`<p><a href="${contractUrl}" target="_blank" rel="noopener noreferrer">Download Contract of Ownership</a></p>`)
      }

      if (emailLinks.length > 0) {
        try {
          await sendEmail({
            to: resolvedClientEmail || clientProfile?.email!,
            subject: 'Payment Receipt & Contract - Surigao Memorial Park',
            html: `
              <p>Hi ${resolvedClientName || clientProfile?.name || 'Client'},</p>
              <p>Thank you for your payment. You can access your documents below:</p>
              ${emailLinks.join('\n')}
              <p>Reference Number: <strong>${referenceNumber}</strong></p>
              <p>Thank you,<br/>Surigao Memorial Park</p>
            `
          })
        } catch (emailError) {
          console.error('[Cashier Walk-In API] Failed to send email:', emailError)
        }
      }
    }

    await supabaseServer
      .from('notifications')
      .insert({
        recipient_type: 'cashier',
        recipient_id: cashierId,
        notification_type: 'payment',
        title: 'Walk-in payment recorded',
        message: `Processed ₱${paymentAmount.toFixed(2)} for ${resolvedClientName || 'client'}. Reference ${referenceNumber}.`,
        related_payment_id: payment.id,
        is_read: false,
        priority: 'normal'
      })

    await supabaseServer
      .from('activity_logs')
      .insert({
        actor_type: 'employee',
        actor_id: cashierId,
        actor_username: cashierUsername || 'cashier',
        action: 'walk_in_payment',
        details: `Processed walk-in payment ${referenceNumber}`,
        category: 'payment',
        status: 'success',
        affected_resources: [{ type: 'payment', id: payment.id }]
      })

    // Ensure client account is marked active after successful cashier payment
    try {
      await supabaseServer
        .from('clients')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', resolvedClientId)
        .is('deleted_at', null)
    } catch (statusError) {
      console.error('[Cashier Walk-In API] Failed to activate client status:', statusError)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...payment,
        invoice_number: invoiceNumber || payment.invoice_number,
        invoice_pdf_url: invoiceUrl || payment.invoice_pdf_url,
        agreement_text: agreementText || payment.agreement_text,
        contract_pdf_url: contractUrl || clientProfile?.contract_pdf_url || null
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('[Cashier Walk-In API] Error:', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to record walk-in payment'
    }, { status: 500 })
  }
}
