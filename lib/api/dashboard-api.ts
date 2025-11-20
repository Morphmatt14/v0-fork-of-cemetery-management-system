// ============================================================================
// DASHBOARD DATA API
// ============================================================================
// Functions to fetch dashboard data from API endpoint
// Updated: 2024-11-21 - Changed to use API endpoint to bypass RLS
// ============================================================================

import { supabase } from '@/lib/supabase-client'

/**
 * Fetch all dashboard data from API endpoint
 * Uses service role key on server-side to bypass RLS
 */
export async function fetchDashboardData() {
  try {
    console.log('[Dashboard API Helper] Fetching from /api/dashboard...')
    
    const response = await fetch('/api/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (response.ok && result.success) {
      console.log('[Dashboard API Helper] Data fetched successfully')
      return result
    } else {
      console.error('[Dashboard API Helper] API returned error:', result.error)
      return {
        success: false,
        error: result.error || 'Failed to fetch dashboard data',
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
      }
    }
  } catch (error) {
    console.error('[Dashboard API Helper] Error fetching dashboard data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
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
    }
  }
}

/**
 * Fetch lots from Supabase
 */
export async function fetchLots() {
  try {
    const { data, error } = await supabase
      .from('lots')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('[Dashboard API] Error fetching lots:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch lots',
      data: []
    }
  }
}

/**
 * Fetch clients from Supabase
 */
export async function fetchClients() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('[Dashboard API] Error fetching clients:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch clients',
      data: []
    }
  }
}

/**
 * Fetch payments from Supabase
 */
export async function fetchPayments() {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('[Dashboard API] Error fetching payments:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payments',
      data: []
    }
  }
}

/**
 * Fetch burials from Supabase
 */
export async function fetchBurials() {
  try {
    const { data, error } = await supabase
      .from('burials')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('[Dashboard API] Error fetching burials:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch burials',
      data: []
    }
  }
}

/**
 * Fetch inquiries from Supabase
 */
export async function fetchInquiries() {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('[Dashboard API] Error fetching inquiries:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch inquiries',
      data: []
    }
  }
}

/**
 * Update payment via server-side API
 */
export async function updatePayment(paymentId: string, updates: any) {
  try {
    const response = await fetch(`/api/payments/${paymentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP error ${response.status}`
      }
    }

    return {
      success: true,
      data: result.data
    }
  } catch (error: any) {
    console.error('[Dashboard API] Error updating payment:', error)
    return {
      success: false,
      error: error?.message || 'Failed to update payment'
    }
  }
}

/**
 * Check if client email already exists
 */
export async function checkClientEmailExists(email: string) {
  try {
    const response = await fetch(`/api/clients?column=email&value=${encodeURIComponent(email)}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }

    const result = await response.json()
    
    return {
      success: result.success,
      exists: result.exists || false,
      client: result.data
    }
  } catch (error) {
    console.error('[Dashboard API] Error checking email:', error)
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : 'Failed to check email'
    }
  }
}

/**
 * Create client via server-side API
 */
export async function createClient(clientData: any) {
  try {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clientData)
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP error ${response.status}`
      }
    }

    return {
      success: true,
      data: result.data
    }
  } catch (error: any) {
    console.error('[Dashboard API] Error creating client:', error)
    return {
      success: false,
      error: error?.message || 'Failed to create client'
    }
  }
}

/**
 * Update client in Supabase
 */
export async function updateClient(clientId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('[Dashboard API] Error updating client:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update client'
    }
  }
}

/**
 * Create burial in Supabase
 */
export async function createBurial(burialData: any) {
  try {
    const { data, error } = await supabase
      .from('burials')
      .insert([{
        ...burialData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('[Dashboard API] Error creating burial:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create burial'
    }
  }
}

/**
 * Update burial in Supabase
 */
export async function updateBurial(burialId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('burials')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', burialId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('[Dashboard API] Error updating burial:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update burial'
    }
  }
}

/**
 * Create inquiry in Supabase
 */
export async function createInquiry(inquiryData: any) {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .insert([{
        ...inquiryData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('[Dashboard API] Error creating inquiry:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create inquiry'
    }
  }
}

/**
 * Update inquiry in Supabase
 */
export async function updateInquiry(inquiryId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', inquiryId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('[Dashboard API] Error updating inquiry:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update inquiry'
    }
  }
}
