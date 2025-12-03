import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { supabaseServer } from '@/lib/supabase-server'

interface StepResult {
  name: string
  success: boolean
  details?: any
  error?: string
}

const sanitizeError = (error: any) => (error instanceof Error ? error.message : String(error))

async function parseJson<T = any>(response: Response) {
  try {
    return (await response.json()) as T
  } catch (error) {
    return { success: false, error: sanitizeError(error) } as T
  }
}

export async function POST(request: NextRequest) {
  const steps: StepResult[] = []
  let clientId: string | null = null
  let lotId: string | null = null
  let paymentId: string | null = null

  try {
    const { searchParams } = new URL(request.url)
    const body = await request.json().catch(() => ({}))
    const intervalMinutes = Math.min(60, Math.max(1, Number(body.intervalMinutes || searchParams.get('intervalMinutes') || 1)))
    const cleanup = body.cleanup ?? (searchParams.get('cleanup') !== 'false')

    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '')
    const lotNumber = `E2E-${timestamp}`
    const clientEmail = `e2e+${timestamp}@surigaomemorial.test`
    const clientName = `E2E Demo ${timestamp}`
    const origin = `${request.nextUrl.origin}`

    // Step 1: Create a fresh available lot for the flow
    const { data: newLot, error: lotError } = await supabaseServer
      .from('lots')
      .insert({
        lot_number: lotNumber,
        status: 'Available',
        lot_type: 'Premium',
        price: 150000,
        section_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        balance: 150000
      })
      .select('*')
      .single()

    if (lotError || !newLot) {
      throw new Error(lotError?.message || 'Failed to create demo lot')
    }

    lotId = newLot.id
    steps.push({ name: 'create-lot', success: true, details: { lotId, lotNumber } })

    // Step 2: Register a client via existing /api/clients endpoint
    const clientPayload = {
      email: clientEmail,
      password_hash: 'DemoPassword123!',
      name: clientName,
      phone: '+63 912 000 0000',
      address: 'E2E Demo Address',
      status: 'inactive',
      lot_id: lotId,
      balance: 150000,
      contract_section: 'Garden of Peace',
      contract_block: 'Block 5',
      contract_lot_number: lotNumber,
      contract_lot_type: 'Premium',
      contract_signed_at: new Date().toISOString().split('T')[0],
      contract_authorized_by: 'Juan Dela Cruz',
      contract_authorized_pos: 'General Manager',
      contract_number: `E2E-CONTRACT-${timestamp}`,
      preferred_payment_method: 'cash',
      preferred_payment_schedule: 'monthly'
    }

    const clientResponse = await fetch(`${origin}/api/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientPayload)
    })

    const clientJson = await parseJson<any>(clientResponse)

    if (!clientResponse.ok || !clientJson?.success) {
      throw new Error(clientJson?.error || 'Client creation failed')
    }

    clientId = clientJson.data?.id
    if (!clientId) {
      throw new Error('Client ID missing after creation')
    }

    steps.push({ name: 'create-client', success: true, details: { clientId, email: clientEmail } })

    // Step 3: Record a payment via the cashier walk-in endpoint
    const paymentResponse = await fetch(`${origin}/api/cashier/walk-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cashierId: 'demo-cashier',
        cashierUsername: 'Demo Cashier',
        clientId,
        clientName,
        clientEmail,
        lotId,
        amount: 25000,
        paymentType: 'Installment',
        paymentMethod: 'Cash',
        paymentStatus: 'Completed',
        notes: 'E2E automated payment',
        agreementText: 'Demo payment agreement for automated verification.'
      })
    })

    const paymentJson = await parseJson<any>(paymentResponse)

    if (!paymentResponse.ok || !paymentJson?.success) {
      throw new Error(paymentJson?.error || 'Cashier payment failed')
    }

    paymentId = paymentJson.data?.id
    const invoiceUrl = paymentJson.data?.invoice_pdf_url || null
    steps.push({ name: 'record-payment', success: true, details: { paymentId, invoiceUrl } })

    // Step 4: Trigger client document email API (generates any missing PDFs and emails links)
    const emailDocsResponse = await fetch(`${origin}/api/client/email-documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId })
    })

    const emailDocsJson = await parseJson<any>(emailDocsResponse)
    steps.push({
      name: 'email-documents',
      success: emailDocsResponse.ok && emailDocsJson?.success !== false,
      details: emailDocsJson
    })

    // Step 5: Trigger demo reminder notification for this client (countdown email only)
    const reminderResponse = await fetch(`${origin}/api/notifications/demo-reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, intervalMinutes, limit: 1, lookaheadDays: 5 })
    })
    const reminderJson = await parseJson<any>(reminderResponse)
    steps.push({
      name: 'demo-reminder-email',
      success: reminderResponse.ok && reminderJson?.success !== false,
      details: reminderJson
    })

    // Verification: pull fresh data to confirm documents exist
    const { data: clientRecord } = await supabaseServer
      .from('clients')
      .select('id, email, contract_pdf_url, name')
      .eq('id', clientId)
      .maybeSingle()

    const { data: latestPayment } = await supabaseServer
      .from('payments')
      .select('id, invoice_pdf_url, payment_date')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const verification = {
      contractPdfUrl: clientRecord?.contract_pdf_url || null,
      invoicePdfUrl: latestPayment?.invoice_pdf_url || null
    }

    if (!verification.contractPdfUrl || !verification.invoicePdfUrl) {
      throw new Error('Verification failed: missing contract or invoice PDF URL')
    }

    steps.push({ name: 'verify-documents', success: true, details: verification })

    // Optional cleanup to avoid cluttering production data
    if (cleanup) {
      await supabaseServer.from('payments').delete().eq('client_id', clientId)
      await supabaseServer.from('client_lots').delete().eq('client_id', clientId)
      await supabaseServer.from('clients').delete().eq('id', clientId)
      await supabaseServer.from('lots').delete().eq('id', lotId)
      steps.push({ name: 'cleanup', success: true })
    }

    return NextResponse.json({ success: true, steps, verification })
  } catch (error: any) {
    const message = sanitizeError(error)
    steps.push({ name: 'error', success: false, error: message })

    return NextResponse.json({ success: false, steps, error: message }, { status: 500 })
  }
}
