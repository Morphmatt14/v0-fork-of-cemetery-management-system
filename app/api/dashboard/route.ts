import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const LOT_TYPE_LABEL_MAP: Record<string, string> = {
  standard: 'Lawn Lot',
  premium: 'Garden Lot',
  family: 'Family State',
}

const normalizeLotTypeLabel = (lotType?: string | null) => {
  if (!lotType) return 'Lawn Lot'
  const key = lotType.toLowerCase()
  return LOT_TYPE_LABEL_MAP[key] || 'Lawn Lot'
}

const deriveBlockId = (mapName?: string | null, lotTypeLabel?: string | null) => {
  if (!mapName || !lotTypeLabel) return undefined
  const trimmedName = mapName.trim()
  if (!trimmedName) return undefined
  const words = trimmedName.split(/\s+/)
  const lastWord = words[words.length - 1] || ''
  if (!lastWord) return undefined
  const mapInitial = lastWord[0]?.toUpperCase()
  const lotInitial = lotTypeLabel[0]?.toUpperCase()
  if (!mapInitial || !lotInitial) return undefined
  return `${mapInitial}-${lotInitial}`
}

const deriveSectionLabel = (lot: any, mapName?: string | null) => {
  if (mapName?.trim()) return mapName.trim()
  if (typeof lot?.section_label === 'string' && lot.section_label.trim()) return lot.section_label.trim()
  if (typeof lot?.section === 'string' && lot.section.trim()) return lot.section.trim()
  if (typeof lot?.section_id === 'string' && lot.section_id.trim()) return lot.section_id.trim()
  return undefined
}

/**
 * GET /api/dashboard
 * Fetch all dashboard data for employee/admin portal
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Dashboard API] Fetching dashboard data...')

    // Fetch all data in parallel (excluding soft-deleted records)
    const [lotsRes, clientsRes, paymentsRes, burialsRes, inquiriesRes, mapsRes] = await Promise.all([
      supabase.from('lots').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('clients').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase
        .from('payments')
        .select('*, clients(name, email, contract_pdf_url), lots(lot_number)')
        .is('deleted_at', null)
        .order('payment_date', { ascending: false }),
      supabase.from('burials').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('inquiries').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('cemetery_maps').select('id, name').is('deleted_at', null),
    ])

    // Handle errors gracefully - return empty arrays instead of failing
    const lots = lotsRes.error ? [] : (lotsRes.data || [])
    const clients = clientsRes.error ? [] : (clientsRes.data || [])
    const rawPayments = paymentsRes.error ? [] : (paymentsRes.data || [])
    const burials = burialsRes.error ? [] : (burialsRes.data || [])
    const inquiries = inquiriesRes.error ? [] : (inquiriesRes.data || [])
    const maps = mapsRes.error ? [] : (mapsRes.data || [])

    const mapNameById = new Map<string, string>()
    maps.forEach((map: any) => {
      if (map?.id && map?.name) {
        mapNameById.set(map.id, map.name)
      }
    })

    const normalizedLots = lots.map((lot: any) => {
      const mapName = lot?.map_id ? mapNameById.get(lot.map_id) : undefined
      const lotTypeLabel = normalizeLotTypeLabel(lot?.lot_type)
      const sectionLabel = deriveSectionLabel(lot, mapName)
      const blockId = deriveBlockId(mapName, lotTypeLabel)
      return {
        ...lot,
        section_label: sectionLabel,
        block_id: blockId,
        lot_type_label: lotTypeLabel,
      }
    })
    
    // Transform payments to include client name and format for employee dashboard
    const payments = rawPayments.map((payment: any) => ({
      id: payment.id,
      client: payment.clients?.name || 'Unknown Client',
      client_id: payment.client_id,
      reference: payment.reference_number || payment.id,
      amount: payment.amount,
      type: payment.payment_type || 'Installment',
      method: payment.payment_method || 'N/A',
      payment_method: payment.payment_method || 'N/A',
      status: payment.payment_status || 'Pending',
      payment_status: payment.payment_status || 'Pending',
      date: payment.payment_date || payment.created_at,
      payment_date: payment.payment_date || payment.created_at,
      lot_id: payment.lot_id,
      lot_number: payment.lots?.lot_number || payment.lot_id,
      notes: payment.notes,
      created_at: payment.created_at,
      invoice_pdf_url: payment.invoice_pdf_url || null,
      contract_pdf_url: payment.contract_pdf_url || payment.clients?.contract_pdf_url || null,
      receipt_pdf_url: payment.receipt_pdf_url || null,
    }))

    // Log any errors but don't fail
    if (lotsRes.error) console.error('[Dashboard API] Lots error:', lotsRes.error)
    if (clientsRes.error) console.error('[Dashboard API] Clients error:', clientsRes.error)
    if (paymentsRes.error) console.error('[Dashboard API] Payments error:', paymentsRes.error)
    if (burialsRes.error) console.error('[Dashboard API] Burials error:', burialsRes.error)
    if (inquiriesRes.error) console.error('[Dashboard API] Inquiries error:', inquiriesRes.error)
    if (mapsRes.error) console.error('[Dashboard API] Maps error:', mapsRes.error)

    // Calculate statistics from real data
    const totalLots = normalizedLots.length
    const occupiedLots = normalizedLots.filter((lot: any) => lot.status === 'Occupied').length
    const availableLots = normalizedLots.filter((lot: any) => lot.status === 'Available').length
    const totalClients = clients.length
    
    // Calculate monthly revenue from payments
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const monthlyRevenue = payments
      .filter((payment: any) => {
        if (!payment.created_at) return false
        const paymentDate = new Date(payment.created_at)
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear &&
               (payment.status === 'Paid' || payment.status === 'Completed')
      })
      .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)

    // Count pending inquiries
    const pendingInquiriesCount = inquiries.filter((inq: any) => 
      inq.status === 'New' || inq.status === 'In Progress' || inq.status === 'Pending'
    ).length

    // Count overdue payments
    const overduePayments = payments.filter((payment: any) => 
      payment.status === 'Overdue'
    ).length

    console.log('[Dashboard API] Data fetched successfully:', {
      lots: normalizedLots.length,
      clients: clients.length,
      payments: payments.length,
      burials: burials.length,
      inquiries: inquiries.length
    })

    return NextResponse.json({
      success: true,
      data: {
        lots: normalizedLots,
        clients,
        payments,
        burials,
        pendingInquiries: inquiries,
        recentBurials: burials.slice(0, 5), // Get 5 most recent
        stats: {
          totalLots,
          occupiedLots,
          availableLots,
          totalClients,
          monthlyRevenue,
          pendingInquiries: pendingInquiriesCount,
          overduePayments
        }
      }
    })

  } catch (error: any) {
    console.error('[Dashboard API] Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch dashboard data',
        data: {
          lots: [],
          clients: [],
          payments: [],
          burials: [],
          pendingInquiries: [],
          recentBurials: [],
          stats: {
            totalLots: 0,
            occupiedLots: 0,
            availableLots: 0,
            totalClients: 0,
            monthlyRevenue: 0,
            pendingInquiries: 0,
            overduePayments: 0
          }
        }
      },
      { status: 500 }
    )
  }
}
