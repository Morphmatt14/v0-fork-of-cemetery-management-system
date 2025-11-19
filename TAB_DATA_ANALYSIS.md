# Employee Dashboard - Data Analysis & Functional Implementation Plan

## 🔍 Current State Analysis

### Data Sources Overview

#### ✅ **Real Data (Already Functional)**
1. **DashboardOverview Component** - Uses `fetchDashboardStats()` from `dashboard-api.ts`
   - Fetches from `/api/dashboard/stats?role=employee`
   - Returns real-time data:
     - Total lots (available, occupied, reserved, maintenance)
     - Total clients
     - Total burials
     - Payment statistics (total, completed, pending, overdue)
     - Inquiry statistics (total, open, in-progress, resolved)
     - Upcoming appointments

#### ❌ **Mock Data (Currently Using Static Data)**
All other tab data is currently loaded from:
- **Source:** `defaultDashboardData` constant (lines 342-828 in page.tsx)
- **Storage:** localStorage (`globalData` key)
- **Problem:** Not connected to Supabase database

### Tabs Data Status

| Tab | Current Status | Data Source | Needs Implementation |
|-----|----------------|-------------|----------------------|
| **Overview** | ⚠️ Partially Real | DashboardOverview: ✅ Real<br>Additional stats: ❌ Mock | Update additional stats, recent burials, pending inquiries |
| **Lots** | ❌ Mock | defaultDashboardData.lots | Connect to `/api/lots` |
| **Burials** | ❌ Mock | defaultDashboardData.burials | Need to create API endpoint |
| **Clients** | ❌ Mock | defaultDashboardData.clients | Need to create API endpoint |
| **Payments** | ❌ Mock | defaultDashboardData.payments | Need to create API endpoint |
| **Inquiries** | ❌ Mock | defaultDashboardData.pendingInquiries | Need to create API endpoint |
| **Maps** | ✅ Uses MapManager | MapManager component | Already functional |
| **News** | ✅ Uses NewsManager | NewsManager component | Already functional |
| **Reports** | ❌ Mock | Report generation logic | Need to implement real report generation |

## 📊 Available APIs

### ✅ **Existing API Endpoints**

1. **Dashboard Stats API** (`/api/dashboard/stats`)
   - Already functional and used by DashboardOverview
   - Returns aggregated statistics

2. **Lots API** (`/api/lots`)
   - `GET /api/lots` - Fetch lots with filters
   - `GET /api/lots/:id` - Fetch single lot
   - `POST /api/lots` - Create lot
   - `PUT /api/lots/:id` - Update lot
   - `DELETE /api/lots/:id` - Delete lot
   - ✅ **Client library exists:** `lib/api/lots-api.ts`

3. **Activity Logs API** (`/api/dashboard/activity-logs`)
   - Used for tracking user activities
   - ✅ Already integrated

### ❓ **APIs to Check/Create**

Need to verify if these exist:
- `/api/burials` or `/api/deceased`
- `/api/clients`
- `/api/payments`
- `/api/inquiries`

## 🎯 Implementation Strategy

### Phase 1: Verify Existing APIs ✅ PRIORITY
**Action:** Check what API endpoints already exist in the codebase

```bash
# Check for API directories
ls app/api/
```

Expected to find:
- `app/api/lots/` ✅ (confirmed)
- `app/api/dashboard/` ✅ (confirmed)
- `app/api/burials/` ❓
- `app/api/clients/` ❓
- `app/api/payments/` ❓
- `app/api/inquiries/` ❓

### Phase 2: Create Missing API Endpoints

For each missing endpoint, we need:

#### **Burials API** (`app/api/burials/route.ts`)
```typescript
// GET /api/burials - Fetch burials with filters
// POST /api/burials - Create burial record
// PUT /api/burials/:id - Update burial record
// DELETE /api/burials/:id - Delete burial record
```

**Database table:** Likely `deceased` or `burials` in Supabase

#### **Clients API** (`app/api/clients/route.ts`)
```typescript
// GET /api/clients - Fetch clients with filters
// POST /api/clients - Create client
// PUT /api/clients/:id - Update client
// DELETE /api/clients/:id - Delete client
```

**Database table:** Likely `clients` or `lot_owners` in Supabase

#### **Payments API** (`app/api/payments/route.ts`)
```typescript
// GET /api/payments - Fetch payments with filters
// POST /api/payments - Create payment
// PUT /api/payments/:id - Update payment
// DELETE /api/payments/:id - Delete payment
```

**Database table:** Likely `payments` in Supabase

#### **Inquiries API** (`app/api/inquiries/route.ts`)
```typescript
// GET /api/inquiries - Fetch inquiries with filters
// POST /api/inquiries - Create inquiry
// PUT /api/inquiries/:id - Update inquiry (reply, status change)
// DELETE /api/inquiries/:id - Delete inquiry
```

**Database table:** Likely `inquiries` or `contact_forms` in Supabase

### Phase 3: Create Client API Libraries

For each API, create a client library like `lots-api.ts`:

```typescript
// lib/api/burials-api.ts
export async function fetchBurials(filters?: BurialFilters): Promise<PaginatedBurialsResponse>
export async function createBurial(data: CreateBurialInput): Promise<BurialResponse>
export async function updateBurial(id: string, updates: UpdateBurialInput): Promise<BurialResponse>
export async function deleteBurial(id: string): Promise<{ success: boolean }>

// lib/api/clients-api.ts
export async function fetchClients(filters?: ClientFilters): Promise<PaginatedClientsResponse>
export async function createClient(data: CreateClientInput): Promise<ClientResponse>
export async function updateClient(id: string, updates: UpdateClientInput): Promise<ClientResponse>
export async function deleteClient(id: string): Promise<{ success: boolean }>

// lib/api/payments-api.ts
export async function fetchPayments(filters?: PaymentFilters): Promise<PaginatedPaymentsResponse>
export async function createPayment(data: CreatePaymentInput): Promise<PaymentResponse>
export async function updatePayment(id: string, updates: UpdatePaymentInput): Promise<PaymentResponse>

// lib/api/inquiries-api.ts
export async function fetchInquiries(filters?: InquiryFilters): Promise<PaginatedInquiriesResponse>
export async function updateInquiryStatus(id: string, status: string): Promise<InquiryResponse>
export async function replyToInquiry(id: string, reply: string): Promise<InquiryResponse>
```

### Phase 4: Update Tab Components

#### **Update Overview Tab**
```typescript
// components/overview-tab.tsx
import { fetchBurials } from '@/lib/api/burials-api'
import { fetchInquiries } from '@/lib/api/inquiries-api'

export default function OverviewTab() {
  const [recentBurials, setRecentBurials] = useState([])
  const [pendingInquiries, setPendingInquiries] = useState([])
  
  useEffect(() => {
    loadRecentBurials()
    loadPendingInquiries()
  }, [])
  
  const loadRecentBurials = async () => {
    const { data } = await fetchBurials({ 
      limit: 3, 
      sort_by: 'created_at', 
      sort_order: 'desc' 
    })
    setRecentBurials(data)
  }
  
  const loadPendingInquiries = async () => {
    const { data } = await fetchInquiries({ 
      status: ['New', 'In Progress'],
      limit: 3 
    })
    setPendingInquiries(data)
  }
}
```

#### **Extract & Update Lots Tab**
```typescript
// components/lots-tab.tsx
import { fetchLots, createLot, updateLot, deleteLot } from '@/lib/api/lots-api'

export default function LotsTab() {
  const [lots, setLots] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadLots()
  }, [])
  
  const loadLots = async () => {
    try {
      setIsLoading(true)
      const { data } = await fetchLots()
      setLots(data)
    } catch (error) {
      console.error('Error loading lots:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCreateLot = async (lotData) => {
    await createLot(lotData)
    loadLots() // Reload after creation
  }
  
  const handleUpdateLot = async (id, updates) => {
    await updateLot(id, updates)
    loadLots() // Reload after update
  }
  
  const handleDeleteLot = async (id) => {
    await deleteLot(id)
    loadLots() // Reload after deletion
  }
}
```

#### **Extract & Update Other Tabs**
Apply same pattern to:
- Burials Tab
- Clients Tab
- Payments Tab
- Inquiries Tab

### Phase 5: Remove localStorage Dependency

**Current code to remove/modify:**
```typescript
// ❌ Remove this
const loadFromLocalStorage = (): any => {
  const saved = localStorage.getItem("globalData")
  return saved ? JSON.parse(saved) : null
}

const saveToLocalStorage = (data: any) => {
  localStorage.setItem("globalData", JSON.stringify(data))
}

// ❌ Remove this
useEffect(() => {
  const loadedData = loadFromLocalStorage()
  if (loadedData) {
    setDashboardData(loadedData)
  } else {
    setDashboardData(defaultDashboardData)
    saveToLocalStorage(defaultDashboardData)
  }
}, [])
```

**Replace with API calls:**
```typescript
// ✅ Use this instead
useEffect(() => {
  loadAllData()
}, [])

const loadAllData = async () => {
  try {
    setIsLoading(true)
    const [lotsData, clientsData, paymentsData, burialsData, inquiriesData] = await Promise.all([
      fetchLots(),
      fetchClients(),
      fetchPayments(),
      fetchBurials(),
      fetchInquiries()
    ])
    
    setLots(lotsData.data)
    setClients(clientsData.data)
    setPayments(paymentsData.data)
    setBurials(burialsData.data)
    setInquiries(inquiriesData.data)
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    setIsLoading(false)
  }
}
```

## 📋 Step-by-Step Implementation Checklist

### 1. Discovery Phase
- [ ] List all existing API endpoints in `app/api/`
- [ ] Check Supabase database schema for available tables
- [ ] Identify which APIs exist vs need to be created
- [ ] Document database table structures

### 2. API Development Phase
- [ ] Create `/api/burials` endpoint (if missing)
- [ ] Create `/api/clients` endpoint (if missing)
- [ ] Create `/api/payments` endpoint (if missing)
- [ ] Create `/api/inquiries` endpoint (if missing)
- [ ] Test all endpoints with Postman/Thunder Client

### 3. Client Library Phase
- [ ] Create `lib/api/burials-api.ts`
- [ ] Create `lib/api/clients-api.ts`
- [ ] Create `lib/api/payments-api.ts`
- [ ] Create `lib/api/inquiries-api.ts`
- [ ] Add TypeScript types for all APIs

### 4. Component Refactoring Phase
- [ ] Update Overview tab to use real data
- [ ] Extract & connect Lots tab
- [ ] Extract & connect Burials tab
- [ ] Extract & connect Clients tab
- [ ] Extract & connect Payments tab
- [ ] Extract & connect Inquiries tab
- [ ] Update Reports tab generation logic

### 5. Data Migration Phase
- [ ] Remove `defaultDashboardData` constant
- [ ] Remove localStorage read/write functions
- [ ] Update all `useEffect` hooks to fetch from APIs
- [ ] Add error handling for API failures
- [ ] Add loading states for all tabs

### 6. Testing Phase
- [ ] Test CRUD operations for Lots
- [ ] Test CRUD operations for Burials
- [ ] Test CRUD operations for Clients
- [ ] Test CRUD operations for Payments
- [ ] Test Inquiry management
- [ ] Test report generation
- [ ] Verify data persistence across page refreshes

## 🚀 Quick Wins (Start Here)

### 1. **Lots Tab** (API Already Exists!)
Since `lots-api.ts` already exists, this is the easiest to implement:

```typescript
// Just import and use!
import { fetchLots, createLot, updateLot } from '@/lib/api/lots-api'

// Replace mock data with:
const { data: lots } = await fetchLots()
```

### 2. **Overview Tab Statistics**
DashboardOverview already uses real data, just need to add:
- Recent burials (once burials API is ready)
- Pending inquiries (once inquiries API is ready)

## 🔧 Code Changes Required

### Main Page Changes
```typescript
// BEFORE: Mock data
const [dashboardData, setDashboardData] = useState(defaultDashboardData)

// AFTER: Real data from APIs
const [stats, setStats] = useState(null) // From DashboardOverview
const [lots, setLots] = useState([])     // From lots API
const [burials, setBurials] = useState([]) // From burials API
const [clients, setClients] = useState([]) // From clients API
const [payments, setPayments] = useState([]) // From payments API
const [inquiries, setInquiries] = useState([]) // From inquiries API
```

### Remove Lines
- Lines 342-828: `defaultDashboardData` constant
- Lines 315-335: localStorage helper functions
- Lines 956-980: localStorage loading logic

### Add Lines
- Import statements for all API clients
- `useEffect` hooks for data fetching
- Error handling and loading states
- Data refresh functions

## 📈 Expected Benefits

After implementation:
- ✅ Real-time data from Supabase database
- ✅ CRUD operations persist to database
- ✅ Multi-user support (changes reflect across users)
- ✅ Data consistency across all dashboards
- ✅ No more localStorage limitations
- ✅ Proper data validation and error handling
- ✅ Scalable architecture for future features

## ⚠️ Important Notes

1. **DashboardOverview is already functional** - Don't touch it!
2. **Maps and News tabs are already functional** - They use separate components
3. **Start with Lots tab** - API already exists, easiest implementation
4. **Check database schema** before creating new APIs
5. **Maintain existing UI** - Only change data source, not appearance
6. **Add loading states** - Important for UX during API calls
7. **Error handling** - Show user-friendly errors when APIs fail

## 🎯 Next Action

**Immediate next step:** Run discovery to check what APIs already exist:
```bash
# Check API directories
ls -la app/api/

# Check for specific endpoints
ls app/api/burials/ 2>/dev/null
ls app/api/clients/ 2>/dev/null
ls app/api/payments/ 2>/dev/null
ls app/api/inquiries/ 2>/dev/null
```

This will tell us exactly what needs to be created vs what can be immediately used!
