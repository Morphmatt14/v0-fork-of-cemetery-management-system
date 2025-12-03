import { NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { supabaseServer } from '@/lib/supabase-server'
import { generateOwnershipCertificatePdfBuffer } from '@/lib/services/contract'

export const dynamic = 'force-dynamic'

const CERTIFICATE_TEMPLATE_PATH =
  process.env.CERTIFICATE_TEMPLATE_PATH ||
  path.join(process.cwd(), 'documents', 'CertificateofOwnershipSurigaoMemorialPark.pdf')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (clientId) {
      try {
        const { data: client, error: clientError } = await supabaseServer
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .maybeSingle()

        if (!clientError && client) {
          const { buffer } = await generateOwnershipCertificatePdfBuffer({
            contractNumber: client.contract_number || undefined,
            issueDate: client.contract_signed_at || new Date().toISOString(),
            grantee: {
              name: client.name || 'Client',
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

          return new NextResponse(buffer as any, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'inline; filename="CertificateOfOwnership.pdf"',
              'Cache-Control': 'no-store, max-age=0',
            },
          })
        }
      } catch (dynamicError) {
        console.error(
          '[Client Certificate Template API] Dynamic certificate generation failed, falling back to static template:',
          dynamicError
        )
      }
    }

    const pdfBuffer = await readFile(CERTIFICATE_TEMPLATE_PATH)

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="CertificateofOwnershipSurigaoMemorialPark.pdf"',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('[Client Certificate Template API] Failed to read certificate template:', error)
    return NextResponse.json(
      { error: 'Certificate template not available' },
      { status: 500 }
    )
  }
}
