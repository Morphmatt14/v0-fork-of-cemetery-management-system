// ============================================================================
// SUPABASE AUTHENTICATION SERVICE
// ============================================================================
// Replaces localStorage-based auth-store.ts with Supabase database queries
// ============================================================================

import { supabase, setUserContext, clearUserContext, verifyPassword, hashPassword } from './supabase-client'

// ============================================================================
// TYPES
// ============================================================================

export interface Admin {
  id: string
  username: string
  name: string
  email: string
  status: string
  created_at: string
  last_login?: string
}

export interface Employee {
  id: string
  username: string
  name: string
  email: string
  status: string
  created_at: string
  last_login?: string
}

export interface Client {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  balance: number
  status: string
  join_date: string
  last_login?: string
}

export interface AuthResponse {
  success: boolean
  user?: Admin | Employee | Client
  role?: 'admin' | 'employee' | 'client'
  error?: string
}

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================

/**
 * Login admin user
 * @param username - Admin username
 * @param password - Plain text password
 */
export async function loginAdmin(username: string, password: string): Promise<AuthResponse> {
  try {
    // Fetch admin from database
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single()

    if (error || !admin) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Verify password
    const passwordValid = await verifyPassword(password, admin.password_hash)
    
    if (!passwordValid) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id)

    // Set RLS context
    await setUserContext('admin', admin.id)

    // Store session in localStorage (for client-side persistence)
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminSession', 'true')
      localStorage.setItem('adminUser', admin.username)
      localStorage.setItem('currentUser', JSON.stringify({
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }))
    }

    // Log activity
    await logActivity('admin', admin.id, admin.username, 'login', 'Admin logged in successfully', 'system')

    return {
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        status: admin.status,
        created_at: admin.created_at,
        last_login: admin.last_login
      },
      role: 'admin'
    }
  } catch (error: any) {
    console.error('Admin login error:', error)
    return { success: false, error: error.message }
  }
}

// ============================================================================
// EMPLOYEE AUTHENTICATION
// ============================================================================

/**
 * Login employee user
 * @param username - Employee username
 * @param password - Plain text password
 */
export async function loginEmployee(username: string, password: string): Promise<AuthResponse> {
  try {
    // Fetch employee from database
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('username', username)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single()

    if (error || !employee) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Verify password
    const passwordValid = await verifyPassword(password, employee.password_hash)
    
    if (!passwordValid) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Update last login
    await supabase
      .from('employees')
      .update({ last_login: new Date().toISOString() })
      .eq('id', employee.id)

    // Set RLS context
    await setUserContext('employee', employee.id)

    // Store session in localStorage (for client-side persistence)
    if (typeof window !== 'undefined') {
      localStorage.setItem('employeeSession', 'true')
      localStorage.setItem('employeeUser', employee.username)
      localStorage.setItem('currentUser', JSON.stringify({
        id: employee.id,
        username: employee.username,
        name: employee.name,
        email: employee.email,
        role: 'employee'
      }))
    }

    // Log activity
    await logActivity('employee', employee.id, employee.username, 'login', 'Employee logged in successfully', 'system')

    return {
      success: true,
      user: {
        id: employee.id,
        username: employee.username,
        name: employee.name,
        email: employee.email,
        status: employee.status,
        created_at: employee.created_at,
        last_login: employee.last_login
      },
      role: 'employee'
    }
  } catch (error: any) {
    console.error('Employee login error:', error)
    return { success: false, error: error.message }
  }
}

// ============================================================================
// CLIENT AUTHENTICATION
// ============================================================================

/**
 * Login client user
 * @param email - Client email
 * @param password - Plain text password
 */
export async function loginClient(email: string, password: string): Promise<AuthResponse> {
  try {
    // Fetch client from database
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single()

    if (error || !client) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Verify password
    const passwordValid = await verifyPassword(password, client.password_hash)
    
    if (!passwordValid) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Update last login
    await supabase
      .from('clients')
      .update({ last_login: new Date().toISOString() })
      .eq('id', client.id)

    // Set RLS context
    await setUserContext('client', client.id)

    // Store session in localStorage (for client-side persistence)
    if (typeof window !== 'undefined') {
      localStorage.setItem('clientSession', 'true')
      localStorage.setItem('clientEmail', client.email)
      localStorage.setItem('currentUser', JSON.stringify({
        id: client.id,
        email: client.email,
        name: client.name,
        role: 'client'
      }))
    }

    return {
      success: true,
      user: {
        id: client.id,
        email: client.email,
        name: client.name,
        phone: client.phone,
        address: client.address,
        balance: parseFloat(client.balance),
        status: client.status,
        join_date: client.join_date,
        last_login: client.last_login
      },
      role: 'client'
    }
  } catch (error: any) {
    console.error('Client login error:', error)
    return { success: false, error: error.message }
  }
}

// ============================================================================
// CLIENT REGISTRATION
// ============================================================================

/**
 * Register new client
 */
export async function registerClient(data: {
  email: string
  password: string
  name: string
  phone?: string
  address?: string
}): Promise<AuthResponse> {
  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('email', data.email)
      .single()

    if (existing) {
      return { success: false, error: 'Email already registered' }
    }

    // Hash password
    const bcrypt = require('bcryptjs')
    const password_hash = await bcrypt.hash(data.password, 10)

    // Create client
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        email: data.email,
        password_hash,
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
        status: 'active',
        balance: 0,
        join_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (error || !newClient) {
      return { success: false, error: 'Failed to create account' }
    }

    return {
      success: true,
      user: {
        id: newClient.id,
        email: newClient.email,
        name: newClient.name,
        phone: newClient.phone,
        address: newClient.address,
        balance: 0,
        status: newClient.status,
        join_date: newClient.join_date
      },
      role: 'client'
    }
  } catch (error: any) {
    console.error('Client registration error:', error)
    return { success: false, error: error.message }
  }
}

// ============================================================================
// LOGOUT
// ============================================================================

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    // Clear RLS context
    await clearUserContext()

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminSession')
      localStorage.removeItem('adminUser')
      localStorage.removeItem('employeeSession')
      localStorage.removeItem('employeeUser')
      localStorage.removeItem('clientSession')
      localStorage.removeItem('clientEmail')
      localStorage.removeItem('currentUser')
    }
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// ============================================================================
// SESSION CHECK
// ============================================================================

/**
 * Check if user has active session
 */
export function checkSession(): {
  hasSession: boolean
  role?: 'admin' | 'employee' | 'client'
  user?: any
} {
  if (typeof window === 'undefined') {
    return { hasSession: false }
  }

  const currentUser = localStorage.getItem('currentUser')
  const adminSession = localStorage.getItem('adminSession')
  const employeeSession = localStorage.getItem('employeeSession')
  const clientSession = localStorage.getItem('clientSession')

  if (!currentUser) {
    return { hasSession: false }
  }

  try {
    const user = JSON.parse(currentUser)
    
    if (adminSession && user.role === 'admin') {
      return { hasSession: true, role: 'admin', user }
    }
    
    if (employeeSession && user.role === 'employee') {
      return { hasSession: true, role: 'employee', user }
    }
    
    if (clientSession && user.role === 'client') {
      return { hasSession: true, role: 'client', user }
    }
    
    return { hasSession: false }
  } catch {
    return { hasSession: false }
  }
}

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

/**
 * Log user activity
 */
async function logActivity(
  actorType: 'admin' | 'employee' | 'client',
  actorId: string,
  actorUsername: string,
  action: string,
  details: string,
  category: string,
  status: 'success' | 'failed' = 'success'
): Promise<void> {
  try {
    await supabase
      .from('activity_logs')
      .insert({
        actor_type: actorType,
        actor_id: actorId,
        actor_username: actorUsername,
        action,
        details,
        category,
        status,
        timestamp: new Date().toISOString()
      })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}
