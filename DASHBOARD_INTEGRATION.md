# 📊 Dashboard Integration with Supabase

## ✅ What's Been Created

Your cemetery management system now has **real-time dashboard statistics** fetched from Supabase!

---

## 🗂️ New Files Created

### 1. **API Routes**
- `app/api/dashboard/stats/route.ts` - Fetches dashboard statistics
- `app/api/dashboard/activity-logs/route.ts` - Fetches activity logs with filters

### 2. **Client Utilities**
- `lib/dashboard-api.ts` - Client-side functions for fetching dashboard data

### 3. **React Components**
- `components/dashboard-overview.tsx` - Reusable dashboard stats component

---

## 🎯 How to Use in Your Dashboards

### **Option 1: Use the Ready-Made Component**

Simply add the `DashboardOverview` component to your dashboard:

```tsx
import { DashboardOverview } from '@/components/dashboard-overview'

export default function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <DashboardOverview role="admin" />
    </div>
  )
}
```

### **Option 2: Fetch Data Manually**

Use the utility functions for custom implementations:

```tsx
import { fetchDashboardStats, fetchActivityLogs } from '@/lib/dashboard-api'

export default function MyDashboard() {
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDashboardStats('admin')
      setStats(data)
    }
    loadData()
  }, [])
  
  return (
    <div>
      <h2>Total Lots: {stats?.lots.total}</h2>
      <h2>Total Clients: {stats?.clients.total}</h2>
    </div>
  )
}
```

---

## 📊 Available Statistics

The `DashboardStats` object includes:

```typescript
{
  lots: {
    total: number
    available: number
    occupied: number
    reserved: number
    maintenance: number
  },
  clients: {
    total: number
  },
  burials: {
    total: number
  },
  payments: {
    total: number
    completed: number
    pending: number
    overdue: number
  },
  inquiries: {
    total: number
    open: number
    inProgress: number
    resolved: number
  },
  appointments: {
    upcoming: number
  }
}
```

---

## 🔧 API Endpoints

### **GET /api/dashboard/stats**

Fetch dashboard statistics.

**Query Parameters:**
- `role` - User role ('admin' or 'employee')

**Response:**
```json
{
  "success": true,
  "stats": {
    "lots": { "total": 50, "available": 20, ... },
    "clients": { "total": 100 },
    ...
  }
}
```

**Example:**
```javascript
const response = await fetch('/api/dashboard/stats?role=admin')
const data = await response.json()
console.log(data.stats)
```

---

### **GET /api/dashboard/activity-logs**

Fetch activity logs with optional filters.

**Query Parameters:**
- `limit` - Number of logs to return (default: 50)
- `actorType` - Filter by user type ('admin', 'employee', 'client')
- `action` - Filter by action type
- `actorUsername` - Filter by username (partial match)

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "actor_type": "admin",
      "actor_username": "admin",
      "action": "login",
      "details": "Admin logged in successfully",
      "timestamp": "2024-11-18T...",
      ...
    }
  ]
}
```

**Example:**
```javascript
const response = await fetch('/api/dashboard/activity-logs?limit=10&actorType=admin')
const data = await response.json()
console.log(data.logs)
```

---

## 🚀 Quick Start: Update Admin Dashboard

Here's how to add real-time stats to your admin dashboard:

### **Step 1: Import the Component**

```tsx
// In app/admin/dashboard/page.tsx
import { DashboardOverview } from '@/components/dashboard-overview'
```

### **Step 2: Add to Your Dashboard**

```tsx
export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Real-time statistics from Supabase */}
      <DashboardOverview role="admin" />
      
      {/* Rest of your dashboard content */}
    </div>
  )
}
```

That's it! The component will:
- ✅ Fetch real data from Supabase
- ✅ Display loading states
- ✅ Handle errors gracefully
- ✅ Show current statistics

---

## 📱 Responsive Design

The `DashboardOverview` component is fully responsive:
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 4 columns

---

## 🎨 Customization

### **Custom Loading State**

```tsx
<DashboardOverview role="admin" />
```

The component automatically shows:
- Loading skeleton while fetching
- Error message with retry button if failed
- Statistics cards when loaded

### **Fetch Activity Logs**

```tsx
import { fetchActivityLogs } from '@/lib/dashboard-api'

const logs = await fetchActivityLogs({
  limit: 20,
  actorType: 'admin',
  action: 'login'
})
```

---

## 🔍 Helper Functions

### **Get Current User**

```tsx
import { getCurrentUser } from '@/lib/dashboard-api'

const user = getCurrentUser()
console.log(user) // { id: '...', username: 'admin', role: 'admin' }
```

### **Check Authentication**

```tsx
import { isAuthenticated } from '@/lib/dashboard-api'

if (!isAuthenticated()) {
  router.push('/admin/login')
}
```

### **Logout User**

```tsx
import { logout } from '@/lib/dashboard-api'

const handleLogout = () => {
  logout(router)
}
```

---

## 📈 Real-Time Updates

To add auto-refresh for real-time data:

```tsx
import { useEffect, useState } from 'react'
import { fetchDashboardStats } from '@/lib/dashboard-api'

export default function LiveDashboard() {
  const [stats, setStats] = useState(null)
  
  useEffect(() => {
    const loadStats = async () => {
      const data = await fetchDashboardStats('admin')
      setStats(data)
    }
    
    // Load initially
    loadStats()
    
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  return <div>Total Lots: {stats?.lots.total}</div>
}
```

---

## 🧪 Testing

### **Test API Endpoints**

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test stats endpoint:**
   ```bash
   curl http://localhost:3000/api/dashboard/stats?role=admin
   ```

3. **Test activity logs:**
   ```bash
   curl http://localhost:3000/api/dashboard/activity-logs?limit=5
   ```

### **View in Browser**

After logging in as admin, add the component to your dashboard and you should see:
- ✅ Real lot counts from database
- ✅ Real client counts
- ✅ Real burial records
- ✅ Payment statistics
- ✅ Inquiry status
- ✅ Upcoming appointments

---

## 🎯 Next Steps

### **Recommended Actions:**

1. **Add DashboardOverview to Admin Dashboard**
   ```tsx
   // In app/admin/dashboard/page.tsx
   <DashboardOverview role="admin" />
   ```

2. **Add DashboardOverview to Employee Dashboard**
   ```tsx
   // In app/admin/employee/dashboard/page.tsx
   <DashboardOverview role="employee" />
   ```

3. **Replace localStorage data with Supabase API calls**
   - Update `loadData()` functions to use `fetchDashboardStats()`
   - Update activity logs to use `fetchActivityLogs()`

4. **Add real-time features:**
   - Implement polling or websockets for live updates
   - Add notification badges for new inquiries/appointments

---

## 🔒 Security

All API routes use the **service role key** which:
- ✅ Bypasses RLS for data aggregation
- ✅ Only runs server-side (never exposed to browser)
- ✅ Properly secured with environment variables

---

## 📊 Example Dashboard Layout

```tsx
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, Admin</p>
      </div>

      {/* Statistics Overview - REAL DATA FROM SUPABASE */}
      <DashboardOverview role="admin" />

      {/* Additional Content */}
      <div className="mt-6 grid gap-4">
        {/* Recent Activity, Charts, etc. */}
      </div>
    </div>
  )
}
```

---

## 🐛 Troubleshooting

### **Stats not loading?**

1. Check browser console for errors
2. Verify dev server is running
3. Test API endpoint directly:
   ```
   http://localhost:3000/api/dashboard/stats?role=admin
   ```

### **Empty data?**

The database might not have test data yet. Run these SQL commands in Supabase:

```sql
-- Check if data exists
SELECT COUNT(*) FROM lots;
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM burials;
```

If counts are 0, you need to add some test data.

---

## 📚 Additional Resources

- **Component API**: See `components/dashboard-overview.tsx`
- **API Routes**: See `app/api/dashboard/*/route.ts`
- **Utilities**: See `lib/dashboard-api.ts`
- **Types**: TypeScript definitions included in all files

---

**Status**: ✅ Ready to Use  
**Next**: Add `<DashboardOverview />` to your dashboard pages!
