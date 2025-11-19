# Employee Dashboard - Functionality Analysis & Implementation Roadmap

## 🔍 Executive Summary

The employee dashboard **uses a mix of real and mock data**:

- ✅ **Real Data (Working)**: Overview stats from `DashboardOverview` component
- ❌ **Mock Data (Not Working)**: All CRUD operations, detailed lists, recent activities
- 🎯 **Solution**: Connect to existing Supabase database tables via API endpoints

---

## 📊 Current Data Flow Analysis

### Working (Real Data) ✅

**Component**: `DashboardOverview`  
**API Endpoint**: `/api/dashboard/stats?role=employee`  
**Data Source**: Supabase database  
**Tables Used**:
- `lots` - Total, available, occupied, reserved, maintenance counts
- `clients` - Total count
- `burials` - Total count  
- `payments` - Total, completed, pending, overdue
- `inquiries` - Total, open, in-progress, resolved
- `appointments` - Upcoming count

**Status**: ✅ **Fully functional** - Shows real-time aggregated statistics

### Not Working (Mock Data) ❌

**Component**: Main dashboard page  
**Data Source**: `defaultDashboardData` constant (hardcoded) + localStorage  
**Problem**: All tab operations use static mock data

**Affected Operations**:
- 📋 **Lots Management** - View, create, update, delete lots
- ⚰️ **Burials** - View, create burial records
- 👥 **Clients** - View, create, update clients
- 💰 **Payments** - View, record payments
- 📧 **Inquiries** - View, reply to inquiries
- 📊 **Reports** - Generate reports (uses mock data)

---

## 🗄️ Database Schema Analysis

### Available Tables in Supabase

#### ✅ **Already Have API Endpoints**
1. **lots** → `/api/lots` (Full CRUD available)
   - Columns: `id`, `lot_number`, `section_id`, `lot_type`, `status`, `price`, `owner_id`, `occupant_name`
   - Client Library: `lib/api/lots-api.ts` ✅ **Ready to use!**

2. **dashboard stats** → `/api/dashboard/stats` (Read-only aggregates)
   - Already integrated via `DashboardOverview`

#### ❌ **Missing API Endpoints** (Tables exist in DB)

3. **burials**
   - Columns: `id`, `lot_id`, `deceased_name`, `burial_date`, `family_name`, `funeral_home`, `attendees_count`, `notes`
   - API: **MISSING** - Need to create `/api/burials`

4. **clients**
   - Columns: `id`, `email`, `name`, `phone`, `address`, `balance`, `status`, `join_date`, `emergency_contact_*`
   - API: **MISSING** - Need to create `/api/clients`

5. **payments**
   - Columns: `id`, `client_id`, `lot_id`, `amount`, `payment_type`, `payment_status`, `payment_method`, `reference_number`, `payment_date`
   - API: **MISSING** - Need to create `/api/payments`

6. **inquiries**
   - Columns: `id`, `name`, `email`, `phone`, `inquiry_type`, `message`, `status`, `priority`, `assigned_to`, `assigned_by`
   - Related: `inquiry_responses`, `inquiry_tags` tables
   - API: **MISSING** - Need to create `/api/inquiries`

7. **cemetery_sections**
   - Columns: `id`, `name`, `description`, `total_capacity`, `available_capacity`
   - API: **EXISTS** at `/api/sections` (needs verification)

---

## 🎯 Implementation Priority

### **Phase 1: Quick Wins** (Immediate Implementation)

#### 1. Lots Tab ⭐ **HIGHEST PRIORITY**
**Why**: API already exists, easiest to implement  
**Effort**: Low (2-3 hours)  
**Impact**: High - Most frequently used feature

**Steps**:
```typescript
// 1. Import API client
import { fetchLots, createLot, updateLot, deleteLot } from '@/lib/api/lots-api'

// 2. Replace useState loading
useEffect(() => {
  loadLots()
}, [])

async function loadLots() {
  const { data } = await fetchLots()
  setLots(data)
}

// 3. Update handlers
async function handleCreateLot(lotData) {
  await createLot(lotData)
  await loadLots() // Refresh list
}
```

**Files to Modify**:
- Extract `LotsTab` component from `page.tsx` (lines ~2378-2630)
- Connect to `lots-api.ts`

---

### **Phase 2: Create Missing APIs** (Backend Work)

#### 2. Clients API
**Effort**: Medium (4-6 hours)  
**Priority**: High - Required for client management

**Create**:
```
app/api/clients/route.ts - GET, POST
app/api/clients/[id]/route.ts - GET, PUT, DELETE
lib/api/clients-api.ts - Client library
```

**Database Table**: `clients` (already exists)

#### 3. Payments API
**Effort**: Medium-High (6-8 hours)  
**Priority**: High - Critical for financial tracking

**Create**:
```
app/api/payments/route.ts - GET, POST
app/api/payments/[id]/route.ts - GET, PUT, DELETE
lib/api/payments-api.ts - Client library
```

**Database Table**: `payments` (already exists)  
**Related**: May need to handle `payment_history` table updates

#### 4. Burials API
**Effort**: Medium (4-6 hours)  
**Priority**: Medium - Important but less frequent

**Create**:
```
app/api/burials/route.ts - GET, POST
app/api/burials/[id]/route.ts - GET, PUT, DELETE
lib/api/burials-api.ts - Client library
```

**Database Table**: `burials` (already exists)

#### 5. Inquiries API
**Effort**: High (8-10 hours)  
**Priority**: Medium-High - Has multiple related tables

**Create**:
```
app/api/inquiries/route.ts - GET, POST
app/api/inquiries/[id]/route.ts - GET, PUT, DELETE
app/api/inquiries/[id]/reply/route.ts - POST (for responses)
lib/api/inquiries-api.ts - Client library
```

**Database Tables**: 
- `inquiries` (main)
- `inquiry_responses` (replies)
- `inquiry_tags` (categorization)

---

### **Phase 3: Frontend Integration** (Connect Tabs)

#### Order of Implementation:

1. **Lots Tab** ✅ (API exists)
   - Time: 2-3 hours
   - Extract to `components/lots-tab.tsx`
   - Connect to existing `lots-api.ts`

2. **Clients Tab** (After Clients API)
   - Time: 3-4 hours
   - Extract to `components/clients-tab.tsx`
   - Create CRUD operations

3. **Payments Tab** (After Payments API)
   - Time: 3-4 hours
   - Extract to `components/payments-tab.tsx`
   - Integrate payment processing

4. **Burials Tab** (After Burials API)
   - Time: 2-3 hours
   - Extract to `components/burials-tab.tsx`
   - View and record burials

5. **Inquiries Tab** (After Inquiries API)
   - Time: 4-5 hours
   - Extract to `components/inquiries-tab.tsx`
   - Handle inquiry management and replies

6. **Overview Tab Enhancement**
   - Time: 1-2 hours
   - Add real recent burials data
   - Add real pending inquiries data

7. **Reports Tab**
   - Time: 6-8 hours
   - Generate reports from real database data
   - Excel/Word export functionality

---

## 📝 Step-by-Step Implementation Guide

### Step 1: Extract Lots Tab (Immediate Action)

**File**: `app/admin/employee/dashboard/components/lots-tab.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchLots, createLot, updateLot, deleteLot } from '@/lib/api/lots-api'
import type { Lot } from '@/lib/types/lots'

interface LotsTabProps {
  // Props as needed
}

export default function LotsTab(props: LotsTabProps) {
  const [lots, setLots] = useState<Lot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLots()
  }, [])

  async function loadLots() {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetchLots()
      setLots(response.data)
    } catch (err: any) {
      console.error('Error loading lots:', err)
      setError(err.message || 'Failed to load lots')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateLot(lotData: any) {
    try {
      await createLot(lotData)
      await loadLots() // Refresh the list
    } catch (err: any) {
      console.error('Error creating lot:', err)
      alert('Failed to create lot: ' + err.message)
    }
  }

  async function handleUpdateLot(id: string, updates: any) {
    try {
      await updateLot(id, updates)
      await loadLots() // Refresh the list
    } catch (err: any) {
      console.error('Error updating lot:', err)
      alert('Failed to update lot: ' + err.message)
    }
  }

  async function handleDeleteLot(id: string) {
    if (!confirm('Are you sure you want to delete this lot?')) return
    
    try {
      await deleteLot(id)
      await loadLots() // Refresh the list
    } catch (err: any) {
      console.error('Error deleting lot:', err)
      alert('Failed to delete lot: ' + err.message)
    }
  }

  if (isLoading) {
    return <div>Loading lots...</div>
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <Button onClick={loadLots}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Copy existing Lots tab UI here */}
      {/* Replace mock data with {lots} */}
      {/* Replace handlers with handleCreateLot, handleUpdateLot, handleDeleteLot */}
    </div>
  )
}
```

### Step 2: Create API Template (For Missing APIs)

**Template**: `app/api/[resource]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    
    // Build query
    let query = supabase
      .from('table_name')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Apply filters from searchParams
    const status = searchParams.get('status')
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data,
      pagination: { /* ... */ }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// POST - Create new record
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('table_name')
      .insert(body)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

---

## ⚡ Quick Implementation Checklist

### Immediate (Today)
- [x] Analyze current data flow ✅ (Done)
- [x] Document database schema ✅ (Done)
- [ ] Extract Lots tab to separate component
- [ ] Connect Lots tab to existing API
- [ ] Test Lots CRUD operations

### Short-term (This Week)
- [ ] Create Clients API endpoint
- [ ] Create client library for Clients API
- [ ] Extract and connect Clients tab
- [ ] Create Payments API endpoint
- [ ] Create client library for Payments API
- [ ] Extract and connect Payments tab

### Medium-term (Next Week)
- [ ] Create Burials API endpoint
- [ ] Extract and connect Burials tab
- [ ] Create Inquiries API endpoint
- [ ] Extract and connect Inquiries tab
- [ ] Enhance Overview tab with real data

### Long-term (Later)
- [ ] Reports generation with real data
- [ ] Advanced filtering and search
- [ ] Data export functionality
- [ ] Performance optimization

---

## 🎯 Success Criteria

### Definition of "Functional"

A tab is considered **functional** when:

✅ **Data Loading**
- Fetches real data from Supabase
- Shows loading state while fetching
- Displays error messages on failure
- Has retry mechanism

✅ **CRUD Operations**
- **Create**: Can add new records to database
- **Read**: Can view list and details
- **Update**: Can edit existing records
- **Delete**: Can remove records (soft delete preferred)

✅ **User Experience**
- Real-time updates after actions
- Validation and error messages
- Confirmation dialogs for destructive actions
- Search and filter capabilities

✅ **Data Persistence**
- Changes persist across page refreshes
- Changes visible to other users
- No reliance on localStorage for data

---

## 📊 Estimated Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| **Phase 1** | Extract Lots Tab | 2-3h | 🟡 Ready |
| | Connect to Lots API | 1h | 🟡 Ready |
| | Test Lots CRUD | 1h | ⚪ Pending |
| **Phase 2** | Create Clients API | 4-6h | ⚪ Pending |
| | Create Payments API | 6-8h | ⚪ Pending |
| | Create Burials API | 4-6h | ⚪ Pending |
| | Create Inquiries API | 8-10h | ⚪ Pending |
| **Phase 3** | Connect all tabs | 15-20h | ⚪ Pending |
| | Testing & fixes | 8-10h | ⚪ Pending |
| **Total** | | **45-65 hours** | |

**Breakdown by Developer**:
- Backend (APIs): ~25-30 hours
- Frontend (Tabs): ~15-20 hours
- Testing: ~5-10 hours
- Integration: ~5 hours

---

## 🚀 Getting Started

### Start Here (30-Minute Quick Start)

1. **Extract Lots Tab** (15 min)
   ```bash
   # Create the component file
   touch app/admin/employee/dashboard/components/lots-tab.tsx
   
   # Copy the Lots TabsContent from page.tsx
   # Lines 2378-2630 approximately
   ```

2. **Connect to API** (10 min)
   ```typescript
   // Import existing API client
   import { fetchLots } from '@/lib/api/lots-api'
   
   // Replace mock data with API call
   useEffect(() => {
     async function load() {
       const { data } = await fetchLots()
       setLots(data)
     }
     load()
   }, [])
   ```

3. **Test** (5 min)
   - Navigate to Lots tab
   - Verify real data loads
   - Try creating a new lot
   - Confirm it persists on refresh

---

**Next Steps**: Once Lots tab is working, repeat the pattern for other tabs!
