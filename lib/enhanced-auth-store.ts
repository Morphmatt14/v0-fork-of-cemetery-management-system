'use client'

export interface AuthStore {
  admins: Array<{
    id: string
    username: string
    password: string
    email: string
    name: string
    role: 'admin' | 'employee'
    createdAt: number
  }>
  otpStore: Array<{
    email: string
    otp: string
    expiresAt: number
    attempts: number
  }>
  pendingApprovals: Array<{
    id: string
    type: 'user_create' | 'user_edit' | 'lot_add' | 'burial_add' | 'payment_update'
    performedBy: string
    targetUser?: string
    data: any
    status: 'pending' | 'approved' | 'rejected'
    createdAt: number
  }>
  clients: Array<{
    id: string
    email: string
    password: string
    name: string
    phone: string
    status: 'pending' | 'active' | 'inactive'
    createdAt: number
    approvedAt?: number
    approvedBy?: string
  }>
}

const DEFAULT_ADMIN = {
  id: 'admin-001',
  username: 'admin',
  password: 'admin123',
  email: 'admin@smpi.com',
  name: 'System Admin',
  role: 'admin' as const,
  createdAt: Date.now(),
}

const DEFAULT_EMPLOYEE = {
  id: 'emp-001',
  username: 'employee',
  password: 'emp123',
  email: 'employee@smpi.com',
  name: 'Employee',
  role: 'employee' as const,
  createdAt: Date.now(),
}

export function initializeEnhancedAuth() {
  if (typeof window === 'undefined') return

  const existing = localStorage.getItem('enhanced_auth_store')
  if (!existing) {
    const authData: AuthStore = {
      admins: [DEFAULT_ADMIN, DEFAULT_EMPLOYEE],
      otpStore: [],
      pendingApprovals: [],
      clients: [],
    }
    localStorage.setItem('enhanced_auth_store', JSON.stringify(authData))
  }
}

export function verifyAdminCredentials(username: string, password: string) {
  if (typeof window === 'undefined') return null
  initializeEnhancedAuth()

  const store = JSON.parse(localStorage.getItem('enhanced_auth_store') || '{}') as AuthStore
  const admin = store.admins?.find((u) => u.username === username && u.password === password)

  return admin
    ? {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        email: admin.email,
        name: admin.name,
      }
    : null
}

export function generateAndSendOTP(email: string): boolean {
  if (typeof window === 'undefined') return false
  initializeEnhancedAuth()

  const store = JSON.parse(localStorage.getItem('enhanced_auth_store') || '{}') as AuthStore
  const otp = Math.random().toString().slice(2, 8)
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes

  // Remove old OTP for this email
  store.otpStore = store.otpStore.filter((o) => o.email !== email)

  // Add new OTP
  store.otpStore.push({
    email,
    otp,
    expiresAt,
    attempts: 0,
  })

  localStorage.setItem('enhanced_auth_store', JSON.stringify(store))

  // In production, send via email service
  console.log(`[v0] OTP for ${email}: ${otp}`)
  return true
}

export function verifyOTP(email: string, otp: string): boolean {
  if (typeof window === 'undefined') return false
  const store = JSON.parse(localStorage.getItem('enhanced_auth_store') || '{}') as AuthStore

  const otpRecord = store.otpStore?.find((o) => o.email === email)
  if (!otpRecord) return false

  if (otpRecord.expiresAt < Date.now()) {
    store.otpStore = store.otpStore.filter((o) => o.email !== email)
    localStorage.setItem('enhanced_auth_store', JSON.stringify(store))
    return false
  }

  if (otpRecord.otp === otp) {
    store.otpStore = store.otpStore.filter((o) => o.email !== email)
    localStorage.setItem('enhanced_auth_store', JSON.stringify(store))
    return true
  }

  otpRecord.attempts++
  if (otpRecord.attempts >= 3) {
    store.otpStore = store.otpStore.filter((o) => o.email !== email)
  }

  localStorage.setItem('enhanced_auth_store', JSON.stringify(store))
  return false
}

export function resetPasswordWithOTP(email: string, newPassword: string): boolean {
  if (typeof window === 'undefined') return false
  const store = JSON.parse(localStorage.getItem('enhanced_auth_store') || '{}') as AuthStore

  const admin = store.admins?.find((a) => a.email === email)
  if (!admin) return false

  admin.password = newPassword
  localStorage.setItem('enhanced_auth_store', JSON.stringify(store))
  return true
}

export function addPendingApproval(
  type: 'user_create' | 'user_edit' | 'lot_add' | 'burial_add' | 'payment_update',
  performedBy: string,
  data: any,
): string {
  if (typeof window === 'undefined') return ''
  initializeEnhancedAuth()

  const store = JSON.parse(localStorage.getItem('enhanced_auth_store') || '{}') as AuthStore
  const approval = {
    id: `approval-${Date.now()}`,
    type,
    performedBy,
    data,
    status: 'pending' as const,
    createdAt: Date.now(),
  }

  store.pendingApprovals = store.pendingApprovals || []
  store.pendingApprovals.push(approval)
  localStorage.setItem('enhanced_auth_store', JSON.stringify(store))

  return approval.id
}

export function getPendingApprovals() {
  if (typeof window === 'undefined') return []
  const store = JSON.parse(localStorage.getItem('enhanced_auth_store') || '{}') as AuthStore
  return store.pendingApprovals?.filter((a) => a.status === 'pending') || []
}

export function approveRequest(approvalId: string): boolean {
  if (typeof window === 'undefined') return false
  const store = JSON.parse(localStorage.getItem('enhanced_auth_store') || '{}') as AuthStore

  const approval = store.pendingApprovals?.find((a) => a.id === approvalId)
  if (!approval) return false

  approval.status = 'approved'
  localStorage.setItem('enhanced_auth_store', JSON.stringify(store))
  return true
}

export function rejectRequest(approvalId: string): boolean {
  if (typeof window === 'undefined') return false
  const store = JSON.parse(localStorage.getItem('enhanced_auth_store') || '{}') as AuthStore

  const approval = store.pendingApprovals?.find((a) => a.id === approvalId)
  if (!approval) return false

  approval.status = 'rejected'
  localStorage.setItem('enhanced_auth_store', JSON.stringify(store))
  return true
}

export function createClientWithApproval(
  email: string,
  password: string,
  name: string,
  phone: string,
  createdBy: string,
): string {
  if (typeof window === 'undefined') return ''
  initializeEnhancedAuth()

  const store = JSON.parse(localStorage.getItem('enhanced_auth_store') || '{}') as AuthStore

  // Create client in pending state
  const clientId = `client-${Date.now()}`
  const client = {
    id: clientId,
    email,
    password,
    name,
    phone,
    status: 'pending' as const,
    createdAt: Date.now(),
  }

  store.clients = store.clients || []
  store.clients.push(client)

  // Add to pending approvals
  const approvalId = addPendingApproval('user_create', createdBy, { type: 'client', clientId, email, name })

  localStorage.setItem('enhanced_auth_store', JSON.stringify(store))
  return approvalId
}

export function approveClientAccount(clientId: string, approvedBy: string): boolean {
  if (typeof window === 'undefined') return false
  const store = JSON.parse(localStorage.getItem('enhanced_auth_store') || '{}') as AuthStore

  const client = store.clients?.find((c) => c.id === clientId)
  if (!client) return false

  client.status = 'active'
  client.approvedAt = Date.now()
  client.approvedBy = approvedBy

  localStorage.setItem('enhanced_auth_store', JSON.stringify(store))
  return true
}

export function deleteClient(clientId: string): boolean {
  if (typeof window === 'undefined') return false
  const store = JSON.parse(localStorage.getItem('enhanced_auth_store') || '{}') as AuthStore

  store.clients = store.clients?.filter((c) => c.id !== clientId) || []
  localStorage.setItem('enhanced_auth_store', JSON.stringify(store))
  return true
}
