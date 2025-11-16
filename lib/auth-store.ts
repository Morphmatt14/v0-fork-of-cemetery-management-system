export interface AuthStore {
  adminUsers: Array<{ username: string; password: string; name?: string; createdAt?: number }>
  clientUsers: Array<{ email: string; password: string; id: string; name?: string; phone?: string }>
  superAdmin?: { username: string; password: string }
}

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
}

const DEMO_CLIENT = {
  email: "client@example.com",
  password: "password123",
  id: "client-001",
  name: "Juan Dela Cruz",
  phone: "09123456789",
}

const SUPER_ADMIN_CREDENTIALS = {
  username: "superadmin",
  password: "superadmin123",
}

export function initializeAuth() {
  if (typeof window === 'undefined') return
  
  const existing = localStorage.getItem("auth_store")
  if (!existing) {
    const authData = {
      adminUsers: [{ ...ADMIN_CREDENTIALS, name: 'Default Admin', createdAt: Date.now() }],
      clientUsers: [DEMO_CLIENT],
      superAdmin: SUPER_ADMIN_CREDENTIALS,
    }
    localStorage.setItem("auth_store", JSON.stringify(authData))
    console.log("[v0] Auth store initialized with default credentials")
  }
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  if (typeof window === 'undefined') return false
  initializeAuth()
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  return store.adminUsers?.some((user: any) => user.username === username && user.password === password) || false
}

export function verifySuperAdminCredentials(username: string, password: string): boolean {
  if (typeof window === 'undefined') return false
  
  // Initialize if needed
  initializeAuth()
  
  // Get from localStorage
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  const superAdmin = store.superAdmin
  
  console.log("[v0] Verifying super admin:", { username, superAdmin })
  
  // Check against stored credentials
  if (superAdmin && superAdmin.username === username && superAdmin.password === password) {
    return true
  }
  
  // Fallback to hardcoded credentials
  return username === "superadmin" && password === "superadmin123"
}

export function verifyClientCredentials(
  email: string,
  password: string,
): { id: string; name: string; email: string } | null {
  if (typeof window === 'undefined') return null
  initializeAuth()
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  const user = store.clientUsers?.find((user: any) => user.email === email && user.password === password)
  return user ? { id: user.id, name: user.name, email: user.email } : null
}

export function getClientUser(id: string) {
  if (typeof window === 'undefined') return null
  initializeAuth()
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  return store.clientUsers?.find((user: any) => user.id === id)
}

export function createAdmin(username: string, password: string, name: string): boolean {
  if (typeof window === 'undefined') return false
  initializeAuth()
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  
  // Check if admin already exists
  if (store.adminUsers?.some((u: any) => u.username === username)) {
    return false
  }
  
  store.adminUsers = store.adminUsers || []
  store.adminUsers.push({
    username,
    password,
    name,
    createdAt: Date.now()
  })
  
  localStorage.setItem("auth_store", JSON.stringify(store))
  return true
}

export function deleteAdmin(username: string): boolean {
  if (typeof window === 'undefined') return false
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  
  store.adminUsers = store.adminUsers?.filter((u: any) => u.username !== username) || []
  localStorage.setItem("auth_store", JSON.stringify(store))
  return true
}

export function getAllAdmins() {
  if (typeof window === 'undefined') return []
  initializeAuth()
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  return store.adminUsers || []
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeAuth()
}
