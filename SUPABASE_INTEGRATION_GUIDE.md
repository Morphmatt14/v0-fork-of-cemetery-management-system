# 🔗 Supabase Integration Guide

## ✅ Completed Setup

### **Database**
- [x] 28 tables created in Supabase
- [x] Row Level Security (RLS) enabled on all tables
- [x] 80+ RLS policies active
- [x] Triggers and functions working
- [x] Default admin/employee accounts created with secure bcrypt hashes

### **Authentication Services**
- [x] `lib/supabase-client.ts` - Updated with bcrypt and RLS context
- [x] `lib/supabase-auth.ts` - New authentication service created

---

## 🚀 Next Steps: Update Login Pages

### **Priority 1: Admin Login** (Easiest to test)

**File:** `app/admin/login/page.tsx`

Replace the old authentication logic with:

```typescript
import { loginAdmin } from '@/lib/supabase-auth'
import { useRouter } from 'next/navigation'

// In your handleLogin function:
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError('')

  try {
    const result = await loginAdmin(username, password)
    
    if (result.success) {
      // Success! Redirect to dashboard
      router.push('/admin/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
  } catch (err) {
    setError('An unexpected error occurred')
  } finally {
    setIsLoading(false)
  }
}
```

---

### **Priority 2: Employee Login**

**File:** `app/admin/employee/login/page.tsx`

```typescript
import { loginEmployee } from '@/lib/supabase-auth'

// In your handleLogin function:
const result = await loginEmployee(username, password)

if (result.success) {
  router.push('/admin/employee/dashboard')
} else {
  setError(result.error || 'Login failed')
}
```

---

### **Priority 3: Client Login**

**File:** `app/login/page.tsx` (if exists) or client login component

```typescript
import { loginClient } from '@/lib/supabase-auth'

// In your handleLogin function:
const result = await loginClient(email, password)

if (result.success) {
  router.push('/client/dashboard')
} else {
  setError(result.error || 'Login failed')
}
```

---

## 🔐 Testing Your Login

### **Test Credentials**

**Admin:**
- Username: `admin`
- Password: `admin123`

**Employee:**
- Username: `employee`
- Password: `emp123`

**Client:**
- You'll need to register a client first or create one manually in Supabase

---

## 📊 Create Example Client (Optional)

Run this in Supabase SQL Editor to create a test client:

```sql
-- Create test client
-- Password: password123
INSERT INTO clients (email, password_hash, name, phone, address, status, balance)
VALUES (
  'testclient@example.com',
  '$2b$10$YourBcryptHashHere', -- Generate with: node -e "console.log(require('bcryptjs').hashSync('password123', 10))"
  'Test Client',
  '09123456789',
  '123 Test Street',
  'active',
  0.00
);
```

---

## 🔄 Session Management

The new auth system maintains backward compatibility:
- ✅ Still uses `localStorage` for session persistence
- ✅ Stores `adminSession`, `employeeSession`, `clientSession`
- ✅ Stores `currentUser` JSON object
- ✅ **NEW:** Also sets Supabase RLS context for database queries

---

## 📝 Example: Full Login Page Update

Here's a complete example for `app/admin/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/lib/supabase-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await loginAdmin(username, password)
      
      if (result.success) {
        console.log('✅ Admin logged in:', result.user)
        router.push('/admin/dashboard')
      } else {
        setError(result.error || 'Invalid username or password')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Admin Login</h2>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

---

## 🧪 Testing Checklist

After updating login pages:

- [ ] Admin can login with `admin` / `admin123`
- [ ] Employee can login with `employee` / `emp123`
- [ ] Invalid credentials show error message
- [ ] Successful login redirects to dashboard
- [ ] `localStorage` has session data
- [ ] Console logs show user data on successful login

---

## 🔄 After Login Works: Update Dashboards

Once login is working, update dashboards to fetch data from Supabase:

### **Example: Fetch Lots in Dashboard**

**Old (localStorage):**
```typescript
const lotsData = JSON.parse(localStorage.getItem('globalData') || '{}').lots
```

**New (Supabase):**
```typescript
import { supabase } from '@/lib/supabase-client'

const { data: lots, error } = await supabase
  .from('lots')
  .select('*, cemetery_sections(*)')
  .order('created_at', { ascending: false })

if (error) {
  console.error('Error fetching lots:', error)
} else {
  console.log('Lots:', lots)
}
```

---

## 📚 Available Functions in `supabase-auth.ts`

```typescript
// Login functions
loginAdmin(username, password) → AuthResponse
loginEmployee(username, password) → AuthResponse
loginClient(email, password) → AuthResponse

// Registration
registerClient(data) → AuthResponse

// Session management
logout() → void
checkSession() → { hasSession, role, user }
```

---

## 🎯 Recommended Order

1. ✅ **Update Admin Login** (test authentication works)
2. ✅ **Update Employee Login** (verify RLS context)
3. ✅ **Test Dashboard Access** (ensure redirects work)
4. 🔄 **Update Dashboard Data Fetching** (replace localStorage)
5. 🔄 **Update Create/Edit/Delete Operations** (use Supabase)
6. 🔄 **Migrate Existing Data** (if needed)

---

## 💡 Tips

### **Debugging Login Issues**

```typescript
// Add console logs to debug
const result = await loginAdmin(username, password)
console.log('Login result:', result)

if (result.success) {
  console.log('User data:', result.user)
  console.log('Role:', result.role)
}
```

### **Check RLS Context is Set**

```sql
-- In Supabase SQL Editor after login:
SELECT current_setting('app.user_role', true) as role;
SELECT current_setting('app.user_id', true) as user_id;
```

### **View Activity Logs**

```sql
-- See recent logins
SELECT * FROM activity_logs 
WHERE action = 'login' 
ORDER BY timestamp DESC 
LIMIT 10;
```

---

## 🆘 Common Issues

### **Issue: "Failed to set user context"**
**Solution:** Make sure `set_config` RPC function exists in Supabase.

### **Issue: "Invalid username or password" even with correct credentials**
**Solution:** Verify password hashes in database match generated hashes.

### **Issue: Login works but dashboard shows no data**
**Solution:** RLS context not set properly. Check `setUserContext()` is called after login.

---

## 📞 Next Steps

**Option A:** I can help you update the admin login page now  
**Option B:** I can create example CRUD operations for lots/clients/payments  
**Option C:** I can help set up data migration from localStorage  

**Which would you like to tackle first?**
