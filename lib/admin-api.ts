// ============================================================================
// ADMIN API CLIENT
// ============================================================================
// Client-side utilities for admin dashboard data fetching
// ============================================================================

export interface Employee {
  id: string
  username: string
  name: string | null
  email: string | null
  phone: string | null
  status: string
  created_at: string
  last_login: string | null
}

export interface PasswordResetRequest {
  id: string
  requester_type: 'admin' | 'employee' | 'client'
  requester_id: string
  requester_username: string
  requester_email: string | null
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  reason: string | null
  new_password_hash: string | null
  resolved_by: string | null
  resolved_at: string | null
  resolution_notes: string | null
  requested_at: string
  expires_at: string
}

export interface ActivityLog {
  id: string
  actor_type: 'admin' | 'employee' | 'client' | 'system'
  actor_id: string | null
  actor_username: string | null
  action: string
  details: string | null
  category: string
  status: 'success' | 'failed' | 'warning' | 'info'
  severity: 'low' | 'normal' | 'high' | 'critical'
  affected_resources: any
  ip_address: string | null
  user_agent: string | null
  timestamp: string
}

/**
 * Fetch all employees
 */
export async function fetchEmployees(): Promise<{ employees: Employee[]; count: number }> {
  try {
    // Add cache busting parameter and no-cache headers
    const timestamp = Date.now()
    const response = await fetch(`/api/admin/employees?_t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch employees')
    }
    
    return { employees: data.employees, count: data.count }
  } catch (error) {
    console.error('[Admin API] Error fetching employees:', error)
    throw error
  }
}

/**
 * Fetch password reset requests
 */
export async function fetchPasswordResetRequests(status?: string): Promise<PasswordResetRequest[]> {
  try {
    const url = status 
      ? `/api/admin/password-resets?status=${status}`
      : '/api/admin/password-resets'
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch password reset requests')
    }
    
    return data.requests
  } catch (error) {
    console.error('[Admin API] Error fetching password reset requests:', error)
    throw error
  }
}

/**
 * Fetch activity logs with optional filters
 */
export async function fetchActivityLogs(filters?: {
  actorType?: 'admin' | 'employee' | 'client' | 'system'
  actorUsername?: string
  category?: string
  limit?: number
}): Promise<ActivityLog[]> {
  try {
    const params = new URLSearchParams()
    
    if (filters?.actorType) params.append('actorType', filters.actorType)
    if (filters?.actorUsername) params.append('actorUsername', filters.actorUsername)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    
    const url = `/api/admin/activity-logs${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch activity logs')
    }
    
    return data.logs
  } catch (error) {
    console.error('[Admin API] Error fetching activity logs:', error)
    throw error
  }
}

/**
 * Get admin dashboard overview stats
 */
export async function fetchAdminOverviewStats() {
  try {
    const [employeesData, passwordResets, activityLogs] = await Promise.all([
      fetchEmployees(),
      fetchPasswordResetRequests(),
      fetchActivityLogs({ limit: 50 })
    ])

    return {
      employees: employeesData.employees,
      employeesCount: employeesData.count,
      passwordResetRequests: passwordResets,
      pendingPasswordResets: passwordResets.filter(r => r.status === 'pending').length,
      activityLogs: activityLogs,
      recentActivitiesCount: activityLogs.length
    }
  } catch (error) {
    console.error('[Admin API] Error fetching overview stats:', error)
    throw error
  }
}

/**
 * Create a new employee
 */
export async function createEmployee(data: {
  username: string
  password: string
  name?: string
  email?: string
  phone?: string
  createdBy?: string
}): Promise<Employee> {
  try {
    const response = await fetch('/api/admin/employees/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to create employee')
    }

    return result.employee
  } catch (error) {
    console.error('[Admin API] Error creating employee:', error)
    throw error
  }
}

/**
 * Update an employee
 */
export async function updateEmployee(data: {
  id: string
  name?: string
  email?: string
  phone?: string
  password?: string
  status?: string
  updatedBy?: string
}): Promise<Employee> {
  try {
    const response = await fetch('/api/admin/employees/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to update employee')
    }

    return result.employee
  } catch (error) {
    console.error('[Admin API] Error updating employee:', error)
    throw error
  }
}

/**
 * Delete an employee
 */
export async function deleteEmployee(params: {
  id?: string
  username?: string
  deletedBy?: string
}): Promise<void> {
  try {
    const searchParams = new URLSearchParams()
    if (params.id) searchParams.append('id', params.id)
    if (params.username) searchParams.append('username', params.username)
    if (params.deletedBy) searchParams.append('deletedBy', params.deletedBy)

    const response = await fetch(`/api/admin/employees/delete?${searchParams.toString()}`, {
      method: 'DELETE'
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete employee')
    }
  } catch (error) {
    console.error('[Admin API] Error deleting employee:', error)
    throw error
  }
}
