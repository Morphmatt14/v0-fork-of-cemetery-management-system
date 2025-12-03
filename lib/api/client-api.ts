/**
 * Client Portal API Functions
 * Helper functions to interact with client-specific API endpoints
 */

/**
 * Fetch client profile data
 */
export async function fetchClientProfile(clientId: string) {
  try {
    const response = await fetch(`/api/client/profile?clientId=${clientId}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch profile')
    }
    
    const data = await response.json()
    return data.data
  } catch (error: any) {
    console.error('[Client API] Error fetching profile:', error)
    throw error
  }
}

/**
 * Fetch client's assigned lots
 */
export async function fetchClientLots(clientId: string) {
  try {
    const response = await fetch(`/api/client/lots?clientId=${clientId}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch lots')
    }
    
    const data = await response.json()
    return data.data
  } catch (error: any) {
    console.error('[Client API] Error fetching lots:', error)
    throw error
  }
}

/**
 * Fetch client's payment history
 */
export async function fetchClientPayments(clientId: string) {
  try {
    const response = await fetch(`/api/client/payments?clientId=${clientId}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch payments')
    }
    
    const data = await response.json()
    return data.data
  } catch (error: any) {
    console.error('[Client API] Error fetching payments:', error)
    throw error
  }
}

/**
 * Fetch client's requests/inquiries
 */
export async function fetchClientRequests(clientId: string) {
  try {
    const response = await fetch(`/api/client/requests?clientId=${clientId}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch requests')
    }
    
    const data = await response.json()
    return data.data
  } catch (error: any) {
    console.error('[Client API] Error fetching requests:', error)
    throw error
  }
}

export async function fetchClientPaymentPlans(clientId: string) {
  try {
    const response = await fetch(`/api/client/payment-plans?clientId=${clientId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch payment plans')
    }

    const data = await response.json()
    return data.data
  } catch (error: any) {
    console.error('[Client API] Error fetching payment plans:', error)
    throw error
  }
}

export async function resendClientDocuments(clientId: string) {
  try {
    const response = await fetch('/api/client/email-documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId })
    })

    const data = await response.json()

    if (!response.ok || data.success === false) {
      throw new Error(data.error || 'Failed to send documents')
    }

    return data
  } catch (error: any) {
    console.error('[Client API] Error resending documents:', error)
    throw error
  }
}

/**
 * Submit a new request/inquiry
 */
export async function submitClientRequest(
  clientId: string,
  requestData: {
    subject: string
    message: string
    type: string
    lotId?: string
  }
) {
  try {
    const response = await fetch('/api/client/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId,
        ...requestData
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit request')
    }
    
    const data = await response.json()
    return data.data
  } catch (error: any) {
    console.error('[Client API] Error submitting request:', error)
    throw error
  }
}

/**
 * Fetch all client dashboard data at once
 */
export async function fetchClientDashboardData(clientId: string) {
  try {
    const [profile, lots, payments, requests, paymentPlans] = await Promise.all([
      fetchClientProfile(clientId),
      fetchClientLots(clientId),
      fetchClientPayments(clientId),
      fetchClientRequests(clientId),
      fetchClientPaymentPlans(clientId)
    ])

    // Normalize profile field names
    const normalizedProfile = {
      ...profile,
      name: profile.name || profile.full_name,
      full_name: profile.full_name || profile.name
    }

    return {
      profile: normalizedProfile,
      lots,
      payments,
      requests,
      paymentPlans,
      // Mock notifications for now
      notifications: [
        {
          id: 1,
          type: 'payment',
          message: 'Payment reminder: Your next installment is due soon',
          date: new Date().toISOString(),
          read: false
        }
      ]
    }
  } catch (error: any) {
    console.error('[Client API] Error fetching dashboard data:', error)
    throw error
  }
}
