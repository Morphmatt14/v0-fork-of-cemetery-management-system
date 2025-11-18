export interface AuthStore {
  admins: Array<{ username: string; password: string; name?: string; createdAt?: number }>
  employees: Array<{ username: string; password: string; name?: string; createdAt?: number }>
  clientUsers: Array<{ email: string; password: string; id: string; name?: string; phone?: string }>
}

const EMPLOYEE_CREDENTIALS = {
  username: "employee",
  password: "emp123",
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

export function initializeAuth() {
  if (typeof window === 'undefined') return
  
  const existing = localStorage.getItem("auth_store")
  if (!existing) {
    const authData = {
      admins: [{ ...ADMIN_CREDENTIALS, name: 'Master Admin', createdAt: Date.now() }],
      employees: [{ ...EMPLOYEE_CREDENTIALS, name: 'Default Employee', createdAt: Date.now() }],
      clientUsers: [DEMO_CLIENT],
    }
    localStorage.setItem("auth_store", JSON.stringify(authData))
    console.log("[v0] Auth store initialized with default credentials - Admin & Employee roles")
  }
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  if (typeof window === 'undefined') return false
  
  initializeAuth()
  
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  
  console.log("[v0] Verifying Admin (Master) credentials:", { username })
  
  const admin = store.admins?.find((u: any) => u.username === username && u.password === password)
  
  if (admin) {
    return true
  }
  
  // Fallback to hardcoded credentials
  return username === "admin" && password === "admin123"
}

export function verifyEmployeeCredentials(username: string, password: string): boolean {
  if (typeof window === 'undefined') return false
  
  initializeAuth()
  
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  
  console.log("[v0] Verifying Employee credentials:", { username })
  console.log("[v0] Available employees:", store.employees)
  
  const employee = store.employees?.find((u: any) => u.username === username && u.password === password)
  
  if (employee) {
    console.log("[v0] Employee verification successful")
    return true
  }
  
  const isValid = username === "employee" && password === "emp123"
  console.log("[v0] Employee fallback check result:", isValid)
  return isValid
}

export function verifySuperAdminCredentials(username: string, password: string): boolean {
  // This now points to Admin role
  return verifyAdminCredentials(username, password)
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

export function createEmployee(username: string, password: string, name: string): boolean {
  if (typeof window === 'undefined') return false
  initializeAuth()
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  
  if (store.employees?.some((u: any) => u.username === username)) {
    return false
  }
  
  store.employees = store.employees || []
  store.employees.push({
    username,
    password,
    name,
    createdAt: Date.now()
  })
  
  localStorage.setItem("auth_store", JSON.stringify(store))
  return true
}

export function deleteEmployee(username: string): boolean {
  if (typeof window === 'undefined') return false
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  
  store.employees = store.employees?.filter((u: any) => u.username !== username) || []
  localStorage.setItem("auth_store", JSON.stringify(store))
  return true
}

export function getAllEmployees() {
  if (typeof window === 'undefined') return []
  initializeAuth()
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  return store.employees || []
}

export function getAllAdmins() {
  if (typeof window === 'undefined') return []
  initializeAuth()
  const store = JSON.parse(localStorage.getItem("auth_store") || "{}")
  return store.admins || []
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeAuth()
}
