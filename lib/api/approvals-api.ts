// ============================================================================
// APPROVAL WORKFLOW CLIENT API
// ============================================================================
// Client-side functions for interacting with the approval workflow API
// Date: 2024-11-20
// ============================================================================

import { 
  SubmitApprovalRequest, 
  SubmitApprovalResponse,
  ReviewApprovalRequest,
  ReviewApprovalResponse,
  ApprovalFilters,
  ApprovalListResponse,
  ApprovalStatsResponse,
  PendingAction,
  ApprovalConfig,
  ApiResponse
} from '@/lib/types/approvals'

// ============================================================================
// BASE CONFIGURATION
// ============================================================================

const API_BASE = '/api/approvals'

// Headers for authentication (will be enhanced with proper JWT)
const getHeaders = (userType: 'employee' | 'admin', userId: string) => {
  return {
    'Content-Type': 'application/json',
    ...(userType === 'employee' && { 'X-Employee-ID': userId }),
    ...(userType === 'admin' && { 'X-Admin-ID': userId }),
  }
}

// ============================================================================
// EMPLOYEE FUNCTIONS
// ============================================================================

/**
 * Submit a new action for approval (Employee)
 */
export async function submitPendingAction(
  request: SubmitApprovalRequest,
  employeeId: string
): Promise<SubmitApprovalResponse> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: getHeaders('employee', employeeId),
      body: JSON.stringify(request),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[Approvals API Client] submitPendingAction error:', error)
    return {
      success: false,
      error: 'Failed to submit action for approval'
    }
  }
}

/**
 * List pending actions (Employee - own actions only)
 */
export async function listMyPendingActions(
  employeeId: string,
  filters?: Partial<ApprovalFilters>
): Promise<ApprovalListResponse> {
  try {
    const params = new URLSearchParams()
    
    // Force filter to employee's own actions
    params.set('requested_by_id', employeeId)
    
    // Add other filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.set(key, value.join(','))
          } else {
            params.set(key, String(value))
          }
        }
      })
    }

    const response = await fetch(`${API_BASE}?${params}`, {
      headers: getHeaders('employee', employeeId),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[Approvals API Client] listMyPendingActions error:', error)
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false
      },
      error: 'Failed to fetch pending actions'
    }
  }
}

/**
 * Get single pending action (Employee)
 */
export async function getPendingAction(
  actionId: string,
  employeeId: string
): Promise<ApiResponse<PendingAction>> {
  try {
    const response = await fetch(`${API_BASE}/${actionId}`, {
      headers: getHeaders('employee', employeeId),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[Approvals API Client] getPendingAction error:', error)
    return {
      success: false,
      error: 'Failed to fetch pending action'
    }
  }
}

/**
 * Cancel pending action (Employee)
 */
export async function cancelPendingAction(
  actionId: string,
  employeeId: string
): Promise<ApiResponse<PendingAction>> {
  try {
    const response = await fetch(`${API_BASE}/${actionId}`, {
      method: 'PATCH',
      headers: getHeaders('employee', employeeId),
      body: JSON.stringify({ action: 'cancel' }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[Approvals API Client] cancelPendingAction error:', error)
    return {
      success: false,
      error: 'Failed to cancel pending action'
    }
  }
}

// ============================================================================
// ADMIN FUNCTIONS
// ============================================================================

/**
 * List all pending actions (Admin)
 */
export async function listAllPendingActions(
  adminId: string,
  filters?: ApprovalFilters
): Promise<ApprovalListResponse> {
  try {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.set(key, value.join(','))
          } else {
            params.set(key, String(value))
          }
        }
      })
    }

    const response = await fetch(`${API_BASE}?${params}`, {
      headers: getHeaders('admin', adminId),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[Approvals API Client] listAllPendingActions error:', error)
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false
      },
      error: 'Failed to fetch pending actions'
    }
  }
}

/**
 * Get single pending action for review (Admin)
 */
export async function getPendingActionForReview(
  actionId: string,
  adminId: string
): Promise<ApiResponse<PendingAction>> {
  try {
    const response = await fetch(`${API_BASE}/${actionId}`, {
      headers: getHeaders('admin', adminId),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[Approvals API Client] getPendingActionForReview error:', error)
    return {
      success: false,
      error: 'Failed to fetch pending action'
    }
  }
}

/**
 * Review pending action (Admin)
 */
export async function reviewPendingAction(
  actionId: string,
  adminId: string,
  review: ReviewApprovalRequest
): Promise<ReviewApprovalResponse> {
  try {
    const response = await fetch(`${API_BASE}/${actionId}/review`, {
      method: 'POST',
      headers: getHeaders('admin', adminId),
      body: JSON.stringify(review),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[Approvals API Client] reviewPendingAction error:', error)
    return {
      success: false,
      error: 'Failed to review pending action'
    }
  }
}

/**
 * Get approval statistics (Admin)
 */
export async function getApprovalStats(
  adminId: string
): Promise<ApprovalStatsResponse> {
  try {
    const response = await fetch(`${API_BASE}/stats`, {
      headers: getHeaders('admin', adminId),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[Approvals API Client] getApprovalStats error:', error)
    return {
      success: false,
      error: 'Failed to fetch approval statistics'
    }
  }
}

// ============================================================================
// CONFIGURATION FUNCTIONS
// ============================================================================

/**
 * Get approval workflow configuration (Any authenticated user)
 */
export async function getApprovalConfig(): Promise<ApiResponse<ApprovalConfig[]>> {
  try {
    const response = await fetch('/api/approval-config')

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      console.error(`[Approvals API Client] HTTP error ${response.status}: ${response.statusText}`)
      return {
        success: false,
        error: `Failed to fetch approval configuration: ${response.statusText}`
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[Approvals API Client] getApprovalConfig error:', error)
    return {
      success: false,
      error: 'Failed to fetch approval configuration',
      data: [] // Return empty array as fallback
    }
  }
}

/**
 * Check if approval is required for an action type
 */
export async function checkApprovalRequired(
  actionType: string
): Promise<{ required: boolean; config?: ApprovalConfig }> {
  try {
    const actionsRequiringApproval = new Set<string>([
      'lot_create',
      'map_create',
      'content_update',
    ])

    if (!actionsRequiringApproval.has(actionType)) {
      return { required: false }
    }

    const configResponse = await getApprovalConfig()

    if (!configResponse.success || !configResponse.data) {
      return { required: true }
    }

    const config = configResponse.data.find((c) => c.action_type === actionType)

    return {
      required: true,
      config,
    }
  } catch (error) {
    console.error('[Approvals API Client] checkApprovalRequired error:', error)
    return { required: true }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format approval action for display
 */
export function formatActionType(actionType: string): string {
  const formatMap: Record<string, string> = {
    'lot_create': 'Create Lot',
    'lot_update': 'Update Lot',
    'lot_delete': 'Delete Lot',
    'burial_create': 'Create Burial',
    'burial_update': 'Update Burial',
    'burial_delete': 'Delete Burial',
    'payment_update': 'Update Payment',
    'client_create': 'Create Client',
    'client_update': 'Update Client',
    'client_delete': 'Delete Client',
    'map_create': 'Create Map',
  }

  return formatMap[actionType] || actionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Format approval status for display
 */
export function formatApprovalStatus(status: string): string {
  const formatMap: Record<string, string> = {
    'pending': 'Pending Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'cancelled': 'Cancelled',
    'expired': 'Expired',
  }

  return formatMap[status] || status
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'pending': 'yellow',
    'approved': 'green',
    'rejected': 'red',
    'cancelled': 'gray',
    'expired': 'orange',
  }

  return colorMap[status] || 'gray'
}

/**
 * Get priority color for UI
 */
export function getPriorityColor(priority: string): string {
  const colorMap: Record<string, string> = {
    'low': 'blue',
    'normal': 'gray',
    'high': 'orange',
    'urgent': 'red',
  }

  return colorMap[priority] || 'gray'
}

/**
 * Calculate time elapsed since creation
 */
export function getTimeElapsed(createdAt: string): string {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  }
}

/**
 * Calculate time until expiration
 */
export function getTimeUntilExpiration(expiresAt?: string): string | null {
  if (!expiresAt) return null

  const expires = new Date(expiresAt)
  const now = new Date()
  const diffMs = expires.getTime() - now.getTime()

  if (diffMs <= 0) {
    return 'Expired'
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} remaining`
  }
}
