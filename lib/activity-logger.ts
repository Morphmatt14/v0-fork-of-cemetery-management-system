'use client'

export interface AdminActivity {
  id: string
  adminUsername: string
  action: string
  details: string
  timestamp: number
  status: 'success' | 'failed'
  affectedRecords?: string[]
  category: 'payment' | 'client' | 'lot' | 'map' | 'password' | 'system'
}

export interface PasswordResetRequest {
  id: string
  adminUsername: string
  requestedAt: number
  status: 'pending' | 'approved' | 'rejected'
  newPassword?: string
  resolvedAt?: number
  resolvedBy?: string
}

const ACTIVITY_LOG_KEY = 'admin_activity_logs'
const PASSWORD_RESET_REQUESTS_KEY = 'password_reset_requests'

export function logActivity(
  adminUsername: string,
  action: string,
  details: string,
  status: 'success' | 'failed' = 'success',
  category: 'payment' | 'client' | 'lot' | 'map' | 'password' | 'system' = 'system',
  affectedRecords?: string[]
): void {
  const logs = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]')

  const activity: AdminActivity = {
    id: Date.now().toString(),
    adminUsername,
    action,
    details,
    timestamp: Date.now(),
    status,
    category,
    affectedRecords
  }

  logs.push(activity)
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs))
}

export function getActivityLogs(filterBy?: {
  adminUsername?: string
  category?: string
  startDate?: number
  endDate?: number
}): AdminActivity[] {
  const logs = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]')
  let filtered = logs

  if (filterBy) {
    if (filterBy.adminUsername) {
      filtered = filtered.filter((l: AdminActivity) => l.adminUsername === filterBy.adminUsername)
    }
    if (filterBy.category) {
      filtered = filtered.filter((l: AdminActivity) => l.category === filterBy.category)
    }
    if (filterBy.startDate) {
      filtered = filtered.filter((l: AdminActivity) => l.timestamp >= filterBy.startDate!)
    }
    if (filterBy.endDate) {
      filtered = filtered.filter((l: AdminActivity) => l.timestamp <= filterBy.endDate!)
    }
  }

  return filtered.sort((a: AdminActivity, b: AdminActivity) => b.timestamp - a.timestamp)
}

export function createPasswordResetRequest(adminUsername: string): PasswordResetRequest {
  const requests = JSON.parse(localStorage.getItem(PASSWORD_RESET_REQUESTS_KEY) || '[]')

  const request: PasswordResetRequest = {
    id: Date.now().toString(),
    adminUsername,
    requestedAt: Date.now(),
    status: 'pending',
  }

  requests.push(request)
  localStorage.setItem(PASSWORD_RESET_REQUESTS_KEY, JSON.stringify(requests))

  logActivity('system', 'PASSWORD_RESET_REQUESTED', `Admin ${adminUsername} requested password reset`, 'success', 'password')

  return request
}

export function getPasswordResetRequests(): PasswordResetRequest[] {
  const requests = JSON.parse(localStorage.getItem(PASSWORD_RESET_REQUESTS_KEY) || '[]')
  return requests.sort((a: PasswordResetRequest, b: PasswordResetRequest) => b.requestedAt - a.requestedAt)
}

export function approvePasswordReset(
  requestId: string,
  newPassword: string,
  superAdminUsername: string,
): boolean {
  const requests = JSON.parse(localStorage.getItem(PASSWORD_RESET_REQUESTS_KEY) || '[]')
  const requestIndex = requests.findIndex((r: PasswordResetRequest) => r.id === requestId)

  if (requestIndex === -1) return false

  const request = requests[requestIndex]
  request.status = 'approved'
  request.newPassword = newPassword
  request.resolvedAt = Date.now()
  request.resolvedBy = superAdminUsername

  requests[requestIndex] = request
  localStorage.setItem(PASSWORD_RESET_REQUESTS_KEY, JSON.stringify(requests))

  const authStore = JSON.parse(localStorage.getItem('auth_store') || '{}')
  const adminIndex = authStore.adminUsers.findIndex((u: any) => u.username === request.adminUsername)
  if (adminIndex !== -1) {
    authStore.adminUsers[adminIndex].password = newPassword
    localStorage.setItem('auth_store', JSON.stringify(authStore))
  }

  logActivity(superAdminUsername, 'PASSWORD_RESET_APPROVED', `Reset password for admin ${request.adminUsername}`, 'success', 'password')

  return true
}

export function rejectPasswordReset(requestId: string, superAdminUsername: string): boolean {
  const requests = JSON.parse(localStorage.getItem(PASSWORD_RESET_REQUESTS_KEY) || '[]')
  const requestIndex = requests.findIndex((r: PasswordResetRequest) => r.id === requestId)

  if (requestIndex === -1) return false

  const request = requests[requestIndex]
  request.status = 'rejected'
  request.resolvedAt = Date.now()
  request.resolvedBy = superAdminUsername

  requests[requestIndex] = request
  localStorage.setItem(PASSWORD_RESET_REQUESTS_KEY, JSON.stringify(requests))

  logActivity(superAdminUsername, 'PASSWORD_RESET_REJECTED', `Rejected password reset request for ${request.adminUsername}`, 'success', 'password')

  return true
}
