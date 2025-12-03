import PDFDocument from 'pdfkit/js/pdfkit.standalone'
import { Buffer } from 'node:buffer'

export interface OwnershipCertificateContext {
  contractNumber?: string
  issueDate?: string
  grantee: {
    name: string
    address?: string | null
    email?: string | null
    phone?: string | null
  }
  lot: {
    section: string
    block: string
    lotNumber: string
    lotType: string
    cemeteryName?: string
    cemeteryAddress?: string
  }
  authorizedSignatory: {
    name: string
    position: string
  }
  terms?: string[]
}

const DEFAULT_TERMS = [
  'Use of Lot. The internment space shall be used solely for the internment of human remains in accordance with the rules and regulations of Surigao Memorial Park, Inc.',
  'Transferability. The grantee may transfer rights subject to full settlement of obligations and prior approval from the grantor.',
  'Non-Ownership of Land. This certificate grants perpetual right of internment, not ownership of land.',
  'Maintenance and Improvements. Improvements must comply with cemetery standards and require approval.',
  'Payments and Obligations. All balances, dues, and related fees must be settled promptly.',
  'Cancellation. The grantor reserves the right to revoke this certificate for non-compliance or unpaid obligations.'
]

export async function generateOwnershipCertificatePdfBuffer(context: OwnershipCertificateContext) {
  const certificateNumber = context.contractNumber || `COO-${Date.now().toString(36).toUpperCase()}`
  const issueDate = formatDate(context.issueDate || new Date().toISOString())
  const cemeteryName = context.lot.cemeteryName || 'SURIGAO MEMORIAL PARK, INC.'
  const cemeteryAddress = context.lot.cemeteryAddress || 'Jose Sering Road, Surigao City, Surigao del Norte'
  const terms = context.terms && context.terms.length > 0 ? context.terms : DEFAULT_TERMS

  return new Promise<{ buffer: Buffer; certificateNumber: string }>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56 })
    const buffers: Buffer[] = []

    doc.on('data', (data: Buffer) => buffers.push(data))
    doc.on('end', () => resolve({ buffer: Buffer.concat(buffers), certificateNumber }))
    doc.on('error', (error: Error) => reject(error))

    doc.fontSize(22).text('SURIGAO MEMORIAL PARK CEMETERY, INC.', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(13).text('CERTIFICATE OF OWNERSHIP', { align: 'center' })
    doc.moveDown(0.6)
    doc.fontSize(11).text(`Contract No.: ${certificateNumber}`, { align: 'right' })
    doc.moveDown(0.5)

    doc.fontSize(12).text(
      'For valuable consideration, this Certificate of Ownership is hereby granted by Surigao Memorial Park, Inc., a corporation duly organized and existing under Philippine laws, with principal office located at Jose Sering Road, Surigao City, Surigao del Norte, hereinafter referred to as the GRANTOR.',
      { align: 'justify' }
    )

    doc.moveDown(0.6)
    doc.text('This certificate is issued to:', { align: 'left' })
    doc.moveDown(0.3)
    doc.fontSize(13).text('______________________________________________', { align: 'center' })
    doc.text(`${context.grantee.name} (GRANTEE)`, { align: 'center' })
    doc.moveDown(0.5)

    doc.fontSize(12).text(
      'The GRANTEE, his/her heirs, executors, and assigns is hereby granted Perpetual Right of Use of the internment space located at:',
      { align: 'justify' }
    )
    doc.moveDown(0.4)
    doc.fontSize(13).text(cemeteryName, { align: 'center' })
    doc.fontSize(11).text(cemeteryAddress, { align: 'center' })

    doc.moveDown(0.8)
    doc.fontSize(11)
    doc.text(`SECTION: ${context.lot.section}`, { continued: true })
    doc.text(`    BLOCK: ${context.lot.block}`)
    doc.moveDown(0.2)
    doc.text(`LOT NO.: ${context.lot.lotNumber}`, { continued: true })
    doc.text(`    LOT TYPE: ${context.lot.lotType}`)

    doc.moveDown(1)
    doc.fontSize(12).text('Terms and Conditions', { underline: true })
    doc.moveDown(0.3)
    doc.fontSize(11)
    terms.forEach((term, index) => {
      doc.text(`${index + 1}. ${term}`, { align: 'justify' })
      doc.moveDown(0.3)
    })

    doc.moveDown(0.5)
    doc.text(
      `Signed and sealed this ${issueDate} at Surigao City, Philippines.`,
      { align: 'left' }
    )

    doc.moveDown(2)
    doc.fontSize(12).text('SURIGAO MEMORIAL PARK, INC.', { align: 'left' })
    doc.moveDown(1.4)
    doc.text('______________________________')
    doc.text(context.authorizedSignatory.name)
    doc.text(`Position: ${context.authorizedSignatory.position}`)

    doc.moveDown(1.5)
    doc.fontSize(10)
    doc.text('Note: This certificate grants perpetual right of internment and is non-transferable without written consent from Surigao Memorial Park, Inc.', {
      align: 'justify'
    })

    doc.end()
  })
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(value))
}
