// ============================================================================
// DASHBOARD API CLIENT
// ============================================================================
// Client-side utilities for fetching dashboard data from Supabase
// ============================================================================

export interface DashboardStats {
  lots: {
    total: number
    available: number
    occupied: number
    reserved: number
    maintenance: number
  }
  clients: {
    total: number
  }
  burials: {
    total: number
  }
  payments: {
    total: number
    completed: number
    pending: number
    overdue: number
  }
  inquiries: {
    total: number
    open: number
    inProgress: number
    resolved: number
  }
  appointments: {
    upcoming: number
  }
}

export interface ActivityLog {
  id: string
  actor_type: 'admin' | 'employee' | 'client'
  actor_id: string
  actor_username: string
  action: string
  details: string
  category: string
  status: 'success' | 'failure' | 'pending'
  timestamp: string
  metadata?: any
}

/**
 * Fetch dashboard statistics
 */
export async function fetchDashboardStats(role: 'admin' | 'employee'): Promise<DashboardStats> {
  try {
    const response = await fetch(`/api/dashboard/stats?role=${role}`)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch dashboard stats')
    }
    
    return data.stats
  } catch (error) {
    console.error('[Dashboard API] Error fetching stats:', error)
    throw error
  }
}

/**
 * Fetch activity logs with optional filters
 */
export async function fetchActivityLogs(filters?: {
  limit?: number
  actorType?: 'admin' | 'employee' | 'client'
  action?: string
  actorUsername?: string
}): Promise<ActivityLog[]> {
  try {
    const params = new URLSearchParams()
    
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.actorType) params.append('actorType', filters.actorType)
    if (filters?.action) params.append('action', filters.action)
    if (filters?.actorUsername) params.append('actorUsername', filters.actorUsername)
    
    const response = await fetch(`/api/dashboard/activity-logs?${params.toString()}`)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch activity logs')
    }
    
    return data.logs
  } catch (error) {
    console.error('[Dashboard API] Error fetching activity logs:', error)
    throw error
  }
}

/**
 * Log a new activity
 */
export async function logActivity(
  actorType: 'admin' | 'employee' | 'client',
  actorId: string,
  actorUsername: string,
  action: string,
  details: string,
  category: string = 'system',
  status: 'success' | 'failure' | 'pending' = 'success',
  metadata?: any
): Promise<boolean> {
  try {
    // For now, we'll just log to console
    // In production, this would send to an API endpoint
    console.log('[Activity Log]', {
      actorType,
      actorId,
      actorUsername,
      action,
      details,
      category,
      status,
      metadata
    })
    
    // TODO: Implement API endpoint for logging activities
    return true
  } catch (error) {
    console.error('[Dashboard API] Error logging activity:', error)
    return false
  }
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): { id: string; username: string; role: string } | null {
  if (typeof window === 'undefined') return null
  
  try {
    const currentUser = localStorage.getItem('currentUser')
    if (!currentUser) return null
    
    return JSON.parse(currentUser)
  } catch (error) {
    console.error('[Dashboard API] Error getting current user:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  
  const adminSession = localStorage.getItem('adminSession')
  const employeeSession = localStorage.getItem('employeeSession')
  const currentUser = localStorage.getItem('currentUser')
  
  return !!(adminSession || employeeSession || currentUser)
}

/**
 * Logout user
 * @param router - Next.js router instance
 * @param redirectPath - Optional redirect path (defaults to '/admin/login')
 */
export function logout(router?: any, redirectPath: string = '/admin/login') {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('adminSession')
  localStorage.removeItem('adminUser')
  localStorage.removeItem('employeeSession')
  localStorage.removeItem('employeeUser')
  localStorage.removeItem('currentUser')
  
  if (router) {
    router.push(redirectPath)
  } else if (typeof window !== 'undefined') {
    window.location.href = redirectPath
  }
}
