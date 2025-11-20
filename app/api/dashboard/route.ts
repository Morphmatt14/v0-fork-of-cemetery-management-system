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

/**
 * GET /api/dashboard
 * Fetch all dashboard data for employee/admin portal
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Dashboard API] Fetching dashboard data...')

    // Fetch all data in parallel (excluding soft-deleted records)
    const [lotsRes, clientsRes, paymentsRes, burialsRes, inquiriesRes] = await Promise.all([
      supabase.from('lots').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('clients').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('payments').select('*, clients(name, email), lots(lot_number)').is('deleted_at', null).order('payment_date', { ascending: false }),
      supabase.from('burials').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('inquiries').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
    ])

    // Handle errors gracefully - return empty arrays instead of failing
    const lots = lotsRes.error ? [] : (lotsRes.data || [])
    const clients = clientsRes.error ? [] : (clientsRes.data || [])
    const rawPayments = paymentsRes.error ? [] : (paymentsRes.data || [])
    const burials = burialsRes.error ? [] : (burialsRes.data || [])
    const inquiries = inquiriesRes.error ? [] : (inquiriesRes.data || [])
    
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
    }))

    // Log any errors but don't fail
    if (lotsRes.error) console.error('[Dashboard API] Lots error:', lotsRes.error)
    if (clientsRes.error) console.error('[Dashboard API] Clients error:', clientsRes.error)
    if (paymentsRes.error) console.error('[Dashboard API] Payments error:', paymentsRes.error)
    if (burialsRes.error) console.error('[Dashboard API] Burials error:', burialsRes.error)
    if (inquiriesRes.error) console.error('[Dashboard API] Inquiries error:', inquiriesRes.error)

    // Calculate statistics from real data
    const totalLots = lots.length
    const occupiedLots = lots.filter((lot: any) => lot.status === 'Occupied').length
    const availableLots = lots.filter((lot: any) => lot.status === 'Available').length
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
      lots: lots.length,
      clients: clients.length,
      payments: payments.length,
      burials: burials.length,
      inquiries: inquiries.length
    })

    return NextResponse.json({
      success: true,
      data: {
        lots,
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
