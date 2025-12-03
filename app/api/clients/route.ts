import { NextRequest, NextResponse } from 'next/server'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import bcrypt from 'bcryptjs'
import { supabaseServer } from '@/lib/supabase-server'
import { generateOwnershipCertificatePdfBuffer } from '@/lib/services/contract'
import { uploadBufferToStorage } from '@/lib/services/storage'
import { sendEmail } from '@/lib/services/email'

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

const normalizeLotNumberLabel = (input?: string | null): string | null => {
  if (!input) return null
  const cleaned = input
    .replace(/^Lot\s+/i, '')
    .split('•')[0]
    .split('|')[0]
    .trim()
  return cleaned || input.trim()
}

type ClientLookupColumn = 'email' | 'id'

const ALLOWED_LOOKUP_COLUMNS: Record<string, ClientLookupColumn> = {
  email: 'email',
  id: 'id',
}

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
    console.error('[Clients API] Template certificate upload failed:', error)
    return null
  }
}

// ============================================================================
// GET /api/clients - Simple lookups (used by email availability checker)
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const columnParam = (searchParams.get('column') || '').toLowerCase()
    const value = searchParams.get('value')?.trim()

    if (columnParam && value) {
      const allowedColumn = ALLOWED_LOOKUP_COLUMNS[columnParam]
      if (!allowedColumn) {
        return NextResponse.json(
          { success: false, error: `Lookup on column "${columnParam}" is not allowed` },
          { status: 400 }
        )
      }

      const { data, error } = await supabaseServer
        .from('clients')
        .select('id, name, email, phone, status')
        .eq(allowedColumn as string, value)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('[Clients API] GET lookup error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to perform lookup' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        exists: Boolean(data),
        data: data || null,
      })
    }

    // Default listing mode
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500)
    const statusFilter = searchParams.get('status')?.trim()

    let query = supabaseServer
      .from('clients')
      .select('id, name, email, phone, status')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(Number.isFinite(limit) ? limit : 100)

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('[Clients API] GET list error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to load clients' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error('[Clients API] GET unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/clients - Create new client
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[Clients API] Creating client:', body.email)

    // Validate required fields
    if (!body.email || !body.password_hash || !body.name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, password, name'
      }, { status: 400 })
    }

    let lotId = typeof body.lot_id === 'string' ? body.lot_id.trim() : ''
    let targetLot: any = null
    let reservedLot: any = null

    if (process.env.NODE_ENV !== 'production') {
      const safeBody = { ...body }
      if (safeBody.password_hash) safeBody.password_hash = '[redacted]'
      console.log('[Clients API] Incoming payload summary:', {
        lot_id: lotId || null,
        contract_lot_number: body.contract_lot_number,
        contract_section: body.contract_section,
        contract_block: body.contract_block,
        lot_type: body.contract_lot_type,
      })
    }

    if (lotId) {
      const { data: existingLot, error: lotFetchError } = await supabaseServer
        .from('lots')
        .select('*')
        .eq('id', lotId)
        .is('deleted_at', null)
        .single()

      if (lotFetchError || !existingLot) {
        console.error('[Clients API] Lot not found via lots table:', lotFetchError)

        // Fallback: try to load via map_lot_positions join
        const { data: positionLot, error: positionError } = await supabaseServer
          .from('map_lot_positions')
          .select('lot_id, lots (*)')
          .eq('lot_id', lotId)
          .maybeSingle()

        if (positionError) {
          console.error('[Clients API] map_lot_positions fallback error:', positionError)
        }

        if (positionLot?.lots) {
          targetLot = positionLot.lots
        }
      } else {
        targetLot = existingLot
      }
    }

    const normalizedContractLotNumber = normalizeLotNumberLabel(body.contract_lot_number)

    // Fallback lookup by lot_number if lotId missing or lookup failed
    if (!targetLot && normalizedContractLotNumber) {
      const { data: fallbackLot, error: fallbackError } = await supabaseServer
        .from('lots')
        .select('*')
        .eq('lot_number', normalizedContractLotNumber)
        .is('deleted_at', null)
        .maybeSingle()

      if (fallbackError) {
        console.error('[Clients API] Fallback lot lookup error:', fallbackError)
      }

      if (fallbackLot) {
        targetLot = fallbackLot
        lotId = fallbackLot.id
      } else {
        const { data: fuzzyLot, error: fuzzyError } = await supabaseServer
          .from('lots')
          .select('*')
          .ilike('lot_number', `%${normalizedContractLotNumber}%`)
          .is('deleted_at', null)
          .maybeSingle()

        if (fuzzyError) {
          console.error('[Clients API] Fuzzy lot lookup error:', fuzzyError)
        }

        if (fuzzyLot) {
          targetLot = fuzzyLot
          const ineligibleLotStatus = ['reserved', 'occupied', 'maintenance']
          if (ineligibleLotStatus.includes(targetLot.status.toLowerCase())) {
            return NextResponse.json({
              success: false,
              error: 'Selected lot is no longer available.'
            }, { status: 409 })
          }
          lotId = fuzzyLot.id
        }
      }
    }

    if (targetLot) {
      const lotStatus = (targetLot.status || '').toString().toLowerCase()
      if (lotStatus !== 'available') {
        return NextResponse.json({
          success: false,
          error: 'Selected lot is no longer available.'
        }, { status: 409 })
      }
    } else if (lotId) {
      return NextResponse.json({
        success: false,
        error: `Selected lot could not be found (lot_id: ${lotId}, lot_number: ${normalizedContractLotNumber || body.contract_lot_number || 'N/A'}).`
      }, { status: 404 })
    }

    // Hash the password if it's not already hashed
    let passwordHash = body.password_hash
    if (!passwordHash.startsWith('$2a$') && !passwordHash.startsWith('$2b$')) {
      passwordHash = await hashPassword(body.password_hash)
    }

    const preferredPaymentMethod = body.preferred_payment_method || 'cash'
    const preferredPaymentSchedule = body.preferred_payment_schedule || 'monthly'

    // Prepare client data
    const now = new Date().toISOString()
    const clientStatus = (body.status || 'inactive').toLowerCase()
    const clientData = {
      email: body.email,
      password_hash: passwordHash,
      name: body.name,
      phone: body.phone || null,
      address: body.address || null,
      status: clientStatus, // Start inactive by default; cashier can later activate via payment
      balance: body.balance || 0,
      emergency_contact_name: body.emergency_contact_name || null,
      emergency_contact_phone: body.emergency_contact_phone || null,
      notes: body.notes || null,
      contract_section: body.contract_section || null,
      contract_block: body.contract_block || null,
      contract_lot_number: normalizedContractLotNumber || body.contract_lot_number || null,
      contract_lot_type: body.contract_lot_type || null,
      contract_signed_at: body.contract_signed_at || null,
      contract_authorized_by: body.contract_authorized_by || null,
      contract_authorized_pos: body.contract_authorized_pos || null,
      contract_pdf_url: body.contract_pdf_url || null,
      join_date: now.split('T')[0], // Add join_date as YYYY-MM-DD
      created_at: now,
      updated_at: now
    }

    // Insert into database
    const { data, error } = await supabaseServer
      .from('clients')
      .insert([clientData])
      .select()
      .single()

    if (error) {
      console.error('[Clients API] Database error:', error)

      // Check for duplicate email
      if (error.code === '23505' && error.message.includes('clients_email_key')) {
        return NextResponse.json({
          success: false,
          error: 'A client with this email address already exists.'
        }, { status: 409 })
      }

      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to create client'
      }, { status: 500 })
    }

    console.log('[Clients API] Client created successfully:', data.id)

    const revertClientAndLot = async () => {
      await supabaseServer.from('clients').delete().eq('id', data.id)
      if (targetLot) {
        await supabaseServer
          .from('lots')
          .update({
            status: targetLot.status,
            owner_id: targetLot.owner_id,
            occupant_name: targetLot.occupant_name,
            date_reserved: targetLot.date_reserved || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', targetLot.id)
        await supabaseServer
          .from('client_lots')
          .delete()
          .eq('client_id', data.id)
          .eq('lot_id', targetLot.id)
      }
    }

    const getFreshClientBalance = async (clientId: string) => {
      const { data: ownedLots, error: ownedLotsError } = await supabaseServer
        .from('lots')
        .select('balance')
        .eq('owner_id', clientId)
        .is('deleted_at', null)

      if (ownedLotsError) {
        console.error('[Clients API] Failed to fetch owned lots for balance recompute:', ownedLotsError)
        return data.balance || 0
      }

      return (ownedLots || []).reduce((sum, lot) => sum + (Number(lot.balance) || 0), 0)
    }

    if (targetLot) {
      const reservationDate = new Date().toISOString().split('T')[0]
      const lotBalance = typeof targetLot.balance === 'number' && targetLot.balance > 0
        ? targetLot.balance
        : (Number(targetLot.price) || 0)

      const { data: updatedLot, error: lotUpdateError } = await supabaseServer
        .from('lots')
        .update({
          status: 'Reserved',
          owner_id: data.id,
          occupant_name: data.name,
          date_reserved: reservationDate,
          balance: lotBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetLot.id)
        .eq('status', 'Available')
        .select('*')
        .single()

      if (lotUpdateError || !updatedLot) {
        console.error('[Clients API] Failed to reserve lot:', lotUpdateError)
        await revertClientAndLot()
        return NextResponse.json({
          success: false,
          error: 'Failed to reserve selected lot. Please try again.'
        }, { status: 409 })
      }

      reservedLot = updatedLot

      const { error: linkError } = await supabaseServer
        .from('client_lots')
        .insert({
          client_id: data.id,
          lot_id: updatedLot.id,
          purchase_date: reservationDate,
          purchase_price: updatedLot.price || null,
          is_primary: true,
          notes: `Auto-linked via Add Client on ${reservationDate}`
        })

      if (linkError) {
        console.error('[Clients API] Failed to link client to lot:', linkError)
        await revertClientAndLot()
        return NextResponse.json({
          success: false,
          error: 'Failed to link client to lot. Please try again.'
        }, { status: 500 })
      }

      // Refresh client balance to reflect new lot assignment
      const recomputedBalance = await getFreshClientBalance(data.id)
      const { error: clientBalanceError } = await supabaseServer
        .from('clients')
        .update({ balance: recomputedBalance, updated_at: new Date().toISOString() })
        .eq('id', data.id)

      if (clientBalanceError) {
        console.error('[Clients API] Failed to update client balance:', clientBalanceError)
      } else {
        data.balance = recomputedBalance
      }

      try {
        const { data: existingPending } = await supabaseServer
          .from('payments')
          .select('id')
          .eq('client_id', data.id)
          .eq('lot_id', updatedLot.id)
          .in('payment_status', ['Pending', 'Overdue'])
          .is('deleted_at', null)
          .limit(1)

        if (!existingPending || existingPending.length === 0) {
          const referenceNumber = `AUTO-${Date.now().toString(36).toUpperCase()}-${data.id.slice(0, 6).toUpperCase()}`

          await supabaseServer.from('payments').insert({
            client_id: data.id,
            lot_id: updatedLot.id,
            amount: lotBalance,
            payment_type: 'Installment',
            payment_method: 'Cash',
            payment_status: 'Pending',
            payment_date: new Date().toISOString(),
            reference_number: referenceNumber,
            notes: 'Auto-generated pending payment awaiting cashier confirmation.'
          })
        }
      } catch (pendingError) {
        console.error('[Clients API] Failed to seed pending payment for queue:', pendingError)
      }
    }

    let contractUrl: string | null = data.contract_pdf_url
    const hasContractDetails = data.contract_section && data.contract_block && data.contract_lot_number && data.contract_lot_type && data.contract_signed_at && data.contract_authorized_by && data.contract_authorized_pos

    if (hasContractDetails) {
      try {
        const { buffer, certificateNumber } = await generateOwnershipCertificatePdfBuffer({
          contractNumber: data.contract_number || undefined,
          issueDate: data.contract_signed_at || undefined,
          grantee: {
            name: data.name,
            address: data.address,
            email: data.email,
            phone: data.phone
          },
          lot: {
            section: data.contract_section,
            block: data.contract_block,
            lotNumber: data.contract_lot_number,
            lotType: data.contract_lot_type
          },
          authorizedSignatory: {
            name: data.contract_authorized_by,
            position: data.contract_authorized_pos
          }
        })

        const contractBucket = process.env.NEXT_PUBLIC_CONTRACT_BUCKET || process.env.NEXT_PUBLIC_INVOICE_BUCKET || 'documents'
        const storagePath = `contracts/${data.id}/${certificateNumber}.pdf`
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
          .eq('id', data.id)

        if (data.email) {
          await sendEmail({
            to: data.email,
            subject: 'Contract of Ownership - Surigao Memorial Park',
            html: `
              <p>Hi ${data.name || 'Client'},</p>
              <p>Your Contract of Ownership has been generated. You can download it using the link below:</p>
              <p><a href="${contractUrl}" target="_blank" rel="noopener noreferrer">Download Contract</a></p>
              <p>Thank you,<br/>Surigao Memorial Park</p>
            `
          })
        }
      } catch (contractError) {
        console.error('[Clients API] Failed to generate contract PDF:', contractError)
      }
    } else {
      console.warn('[Clients API] Skipping contract generation due to missing contract details for client', data.id)
    }

    if (!contractUrl) {
      const fallbackUrl = await uploadTemplateCertificate(data.id)
      if (fallbackUrl) {
        contractUrl = fallbackUrl
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        contract_pdf_url: contractUrl,
        reserved_lot: reservedLot,
        preferred_payment_method: preferredPaymentMethod,
        preferred_payment_schedule: preferredPaymentSchedule,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('[Clients API] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

