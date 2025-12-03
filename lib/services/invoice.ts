import PDFDocument from 'pdfkit/js/pdfkit.standalone'
import { Buffer } from 'node:buffer'

interface PartyInfo {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
}

export async function generatePaymentInvoicePdfBuffer(context: PaymentInvoiceContext) {
  const safeReference = context.payment.reference || `PAY-${Date.now().toString(36).toUpperCase()}`
  const invoiceNumber = `PAY-${Date.now()}-${safeReference.slice(-6).replace(/[^A-Z0-9]/gi, '').toUpperCase()}`

  return new Promise<{ buffer: Buffer; invoiceNumber: string }>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const buffers: Buffer[] = []

    doc.on('data', (data: Buffer) => buffers.push(data))
    doc.on('end', () => {
      resolve({ buffer: Buffer.concat(buffers), invoiceNumber })
    })
    doc.on('error', (err: Error) => reject(err))

    doc.fontSize(20).text('SURIGAO MEMORIAL PARK', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(12).text('Official Payment Receipt & Agreement', { align: 'center' })
    doc.moveDown(1)

    doc.fontSize(14).text('Invoice Details', { underline: true })
    doc.fontSize(12)
    doc.text(`Invoice Number: ${invoiceNumber}`)
    doc.text(`Reference Number: ${safeReference}`)
    doc.text(`Issue Date: ${formatDate(new Date().toISOString())}`)
    doc.text(`Payment Date: ${formatDate(context.payment.payment_date)}`)

    doc.moveDown(1)
    doc.fontSize(14).text('Client Information', { underline: true })
    doc.fontSize(12)
    doc.text(`Name: ${context.client.name}`)
    doc.text(`Email: ${context.client.email || 'N/A'}`)
    doc.text(`Phone: ${context.client.phone || 'N/A'}`)
    doc.text(`Address: ${context.client.address || 'N/A'}`)

    if (context.lot) {
      doc.moveDown(1)
      doc.fontSize(14).text('Lot Details', { underline: true })
      doc.fontSize(12)
      doc.text(`Lot Number: ${context.lot.lot_number || 'N/A'}`)
      doc.text(`Lot Type: ${context.lot.lot_type || 'N/A'}`)
      doc.text(`Section: ${context.lot.section || 'N/A'}`)
      doc.text(`Lot Price: ${formatCurrency(context.lot.price || 0)}`)
    }

    doc.moveDown(1)
    doc.fontSize(14).text('Payment Summary', { underline: true })
    doc.fontSize(12)
    doc.text(`Amount Paid: ${formatCurrency(context.payment.amount)}`)
    doc.text(`Payment Type: ${context.payment.payment_type || 'Walk-in Payment'}`)
    doc.text(`Payment Method: ${context.payment.payment_method || 'N/A'}`)

    if (context.cashier?.name) {
      doc.text(`Processed By: ${context.cashier.name}`)
    }

    doc.moveDown(1)
    doc.fontSize(14).text('Agreement', { underline: true })
    doc.fontSize(12)
    doc.text(
      context.agreementText ||
        'By acknowledging this receipt, the client agrees that the payment recorded herein will be applied toward the outstanding balance for the selected lot or service. All payments are subject to the company’s standard terms and conditions.'
    )

    doc.moveDown(2)
    doc.text('Client Signature: ________________________________')
    doc.text('Date: ____________________')

    doc.moveDown(1.5)
    doc.text('Authorized Cashier: _____________________________')
    doc.text('Date: ____________________')

    doc.end()
  })
}

interface LotInfo {
  lot_number?: string | null
  lot_type?: string | null
  price?: number | null
  section?: string | null
}

interface PlanInfo {
  id: string
  plan_type: string
  total_amount: number
  start_date?: string | null
  end_date?: string | null
}

interface InstallmentInfo {
  id: string
  due_date: string
  amount: number
}

interface InvoiceContext {
  client: PartyInfo
  lot: LotInfo
  plan: PlanInfo
  installment: InstallmentInfo
}

interface CashierInfo {
  name?: string | null
}

interface PaymentInfo {
  reference: string
  amount: number
  payment_type?: string | null
  payment_method?: string | null
  payment_date?: string | null
}

interface PaymentInvoiceContext {
  client: PartyInfo
  lot?: LotInfo | null
  payment: PaymentInfo
  cashier?: CashierInfo
  agreementText?: string | null
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(value || 0)
}

function formatDate(value?: string | null) {
  if (!value) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(value))
}

export async function generateInvoicePdfBuffer(context: InvoiceContext) {
  const invoiceNumber = `INV-${Date.now()}-${context.installment.id.slice(0, 8).toUpperCase()}`

  return new Promise<{ buffer: Buffer; invoiceNumber: string }>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const buffers: Buffer[] = []

    doc.on('data', (data: Buffer) => buffers.push(data))
    doc.on('end', () => {
      resolve({ buffer: Buffer.concat(buffers), invoiceNumber })
    })
    doc.on('error', (err: Error) => reject(err))

    doc.fontSize(20).text('SAN MIGUEL PLAN INC.', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(12).text('Cemetery Management Division', { align: 'center' })
    doc.moveDown(1)

    doc.fontSize(16).text('Invoice / Payment Agreement', { underline: true })
    doc.moveDown(0.5)
    doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`)
    doc.text(`Issue Date: ${formatDate(new Date().toISOString())}`)

    doc.moveDown(1)
    doc.fontSize(14).text('Client Information', { underline: true })
    doc.fontSize(12)
    doc.text(`Name: ${context.client.name}`)
    doc.text(`Email: ${context.client.email || 'N/A'}`)
    doc.text(`Phone: ${context.client.phone || 'N/A'}`)
    doc.text(`Address: ${context.client.address || 'N/A'}`)

    doc.moveDown(1)
    doc.fontSize(14).text('Lot Details', { underline: true })
    doc.fontSize(12)
    doc.text(`Lot Number: ${context.lot.lot_number || 'N/A'}`)
    doc.text(`Lot Type: ${context.lot.lot_type || 'N/A'}`)
    doc.text(`Section: ${context.lot.section || 'N/A'}`)
    doc.text(`Lot Price: ${formatCurrency(context.lot.price || 0)}`)

    doc.moveDown(1)
    doc.fontSize(14).text('Payment Plan', { underline: true })
    doc.fontSize(12)
    doc.text(`Plan ID: ${context.plan.id}`)
    doc.text(`Plan Type: ${context.plan.plan_type.toUpperCase()}`)
    doc.text(`Total Amount: ${formatCurrency(context.plan.total_amount)}`)
    doc.text(`Plan Start: ${formatDate(context.plan.start_date)}`)
    doc.text(`Plan End: ${formatDate(context.plan.end_date)}`)

    doc.moveDown(1)
    doc.fontSize(14).text('Installment Details', { underline: true })
    doc.fontSize(12)
    doc.text(`Installment ID: ${context.installment.id}`)
    doc.text(`Due Date: ${formatDate(context.installment.due_date)}`)
    doc.text(`Amount Due: ${formatCurrency(context.installment.amount)}`)

    doc.moveDown(1)
    doc.fontSize(12)
    doc.text('Agreement:', { underline: true })
    doc.text(
      'By accepting this invoice, the client acknowledges and agrees to the terms of the lot purchase and payment plan described above. Payments must be made on or before the indicated due dates. Late payments may incur penalties or result in plan cancellation per company policy.'
    )

    doc.moveDown(2)
    doc.text('Client Signature: ________________________________', { continued: false })
    doc.text(`Date: ____________________`)

    doc.moveDown(1.5)
    doc.text('Authorized Representative: ________________________')
    doc.text('Date: ____________________')

    doc.moveDown(2)
    doc.fontSize(10).text('Thank you for trusting San Miguel Plan Inc. Please keep this invoice for your records.', {
      align: 'center'
    })

    doc.end()
  })
}
