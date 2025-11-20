import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

/**
 * GET /api/dashboard
 * Fetch all dashboard data (lots, clients, payments, burials, inquiries)
 * Uses service role to bypass RLS
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Dashboard API] Fetching dashboard data...')

    // Fetch all data in parallel
    const [lotsRes, clientsRes, paymentsRes, burialsRes, inquiriesRes] = await Promise.all([
      supabaseServer.from('lots').select('*').order('created_at', { ascending: false }),
      supabaseServer.from('clients').select('*').order('created_at', { ascending: false }),
      supabaseServer.from('payments').select('*').order('created_at', { ascending: false }),
      supabaseServer.from('burials').select('*').order('created_at', { ascending: false }),
      supabaseServer.from('inquiries').select('*').order('created_at', { ascending: false }),
    ])

    // Check for errors
    if (lotsRes.error) {
      console.error('[Dashboard API] Error fetching lots:', lotsRes.error)
      throw lotsRes.error
    }
    if (clientsRes.error) {
      console.error('[Dashboard API] Error fetching clients:', clientsRes.error)
      throw clientsRes.error
    }
    if (paymentsRes.error) {
      console.error('[Dashboard API] Error fetching payments:', paymentsRes.error)
      throw paymentsRes.error
    }
    if (burialsRes.error) {
      console.error('[Dashboard API] Error fetching burials:', burialsRes.error)
      throw burialsRes.error
    }
    if (inquiriesRes.error) {
      console.error('[Dashboard API] Error fetching inquiries:', inquiriesRes.error)
      throw inquiriesRes.error
    }

    const lots = lotsRes.data || []
    const clients = clientsRes.data || []
    const payments = paymentsRes.data || []
    const burials = burialsRes.data || []
    const inquiries = inquiriesRes.data || []

    console.log('[Dashboard API] Data fetched successfully:', {
      lots: lots.length,
      clients: clients.length,
      payments: payments.length,
      burials: burials.length,
      inquiries: inquiries.length
    })

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
               payment.status === 'Paid'
      })
      .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0)

    // Count pending inquiries
    const pendingInquiriesCount = inquiries.filter((inq: any) => 
      inq.status === 'New' || inq.status === 'In Progress'
    ).length

    // Count overdue payments
    const overduePayments = payments.filter((payment: any) => 
      payment.status === 'Overdue'
    ).length

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
    console.error('[Dashboard API] Error fetching dashboard data:', error)
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
