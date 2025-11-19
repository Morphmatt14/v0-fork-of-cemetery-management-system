# 🚀 Quick Start: Backend Implementation

## 📌 Priority 1 - Start Here!

Based on your existing UI, here's what to implement **FIRST** to make the Employee Dashboard fully functional:

---

## 🎯 Week 1: Lots Management (Most Important!)

### **Why Start Here?**
- Central to cemetery operations
- Required by multiple features (clients, burials, map)
- Employee dashboard has entire tab for this
- Most UI already built

### **APIs to Create:**

#### **1. List Lots** (GET /api/lots/route.ts)
```typescript
// Returns all lots with filters
?status=Available
&section=section-id
&type=Standard
&search=lot-number
&page=1
&limit=20
```

#### **2. Create Lot** (POST /api/lots/route.ts)
```typescript
{
  lot_number: "A-101",
  section_id: "uuid",
  lot_type: "Standard",
  status: "Available",
  price: 75000,
  dimensions: "1m x 2.44m",
  features: ["Lawn area", "Flat marker"]
}
```

#### **3. Update Lot** (PUT /api/lots/[id]/route.ts)
```typescript
{
  status: "Reserved",
  price: 80000,
  owner_id: "client-uuid"
}
```

#### **4. Delete Lot** (DELETE /api/lots/[id]/route.ts)
```typescript
// Soft delete - set deleted_at
```

### **File Structure:**
```
app/api/lots/
├── route.ts              # GET (list), POST (create)
├── [id]/
│   └── route.ts          # GET (detail), PUT (update), DELETE (soft delete)
└── available/
    └── route.ts          # GET available lots only
```

---

## 🎯 Week 2: Clients Management

### **Why Second?**
- Clients own lots
- Required for payments
- Employee dashboard has client management tab

### **APIs to Create:**

```
app/api/clients/
├── route.ts              # GET (list), POST (create)
├── [id]/
│   ├── route.ts          # GET, PUT, DELETE
│   ├── lots/
│   │   └── route.ts      # GET client's lots
│   └── payments/
│       └── route.ts      # GET client's payments
```

---

## 🎯 Week 3: Payments Management

### **Why Third?**
- Financial tracking critical
- Integration with Stripe needed
- Client portal needs this

### **APIs to Create:**

```
app/api/payments/
├── route.ts              # GET (list), POST (create)
├── [id]/
│   ├── route.ts          # GET, PUT
│   └── receipt/
│       └── route.ts      # Generate PDF receipt
├── overdue/
│   └── route.ts          # List overdue payments
└── pending/
    └── route.ts          # List pending payments
```

---

## 📋 Implementation Checklist

### **For Each API Endpoint:**
- [ ] Create route.ts file
- [ ] Import `supabaseServer` from `@/lib/supabase-server`
- [ ] Add TypeScript types
- [ ] Implement function with Supabase query
- [ ] Add error handling
- [ ] Add validation
- [ ] Test with Postman/Thunder Client
- [ ] Document the API
- [ ] Update UI to use API instead of localStorage

---

## 💻 Example Implementation

### **Example: GET /api/lots**

```typescript
// app/api/lots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const section = searchParams.get('section')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build query
    let query = supabaseServer
      .from('lots')
      .select('*, cemetery_sections(*)', { count: 'exact' })
      .is('deleted_at', null)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (section) {
      query = query.eq('section_id', section)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[Lots API] Error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch lots' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('[Lots API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.lot_number || !body.section_id || !body.lot_type || !body.price) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert into database
    const { data, error } = await supabaseServer
      .from('lots')
      .insert({
        lot_number: body.lot_number,
        section_id: body.section_id,
        lot_type: body.lot_type,
        status: body.status || 'Available',
        price: body.price,
        dimensions: body.dimensions,
        features: body.features,
        description: body.description,
        created_by: body.created_by // From session
      })
      .select()
      .single()

    if (error) {
      console.error('[Lots API] Insert error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // Log activity
    await supabaseServer
      .from('activity_logs')
      .insert({
        actor_type: 'employee',
        actor_id: body.created_by,
        action: 'create_lot',
        details: `Created lot ${body.lot_number}`,
        category: 'lot_management',
        status: 'success'
      })

    return NextResponse.json({
      success: true,
      data
    }, { status: 201 })
  } catch (error: any) {
    console.error('[Lots API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 🧪 Testing Your API

### **Using Thunder Client (VS Code Extension)**

1. **Install Thunder Client** extension in VS Code

2. **Create New Request**:
   - Method: GET
   - URL: `http://localhost:3000/api/lots?status=Available&page=1&limit=10`
   - Send

3. **Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "lot_number": "A-101",
      "section_id": "uuid",
      "lot_type": "Standard",
      "status": "Available",
      "price": 75000,
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

## 🔗 Integrating with UI

### **Update Employee Dashboard to Use API**

**Before (using localStorage)**:
```typescript
const lots = JSON.parse(localStorage.getItem('lots') || '[]')
```

**After (using API)**:
```typescript
const fetchLots = async () => {
  try {
    const response = await fetch('/api/lots?status=Available')
    const result = await response.json()
    
    if (result.success) {
      setLots(result.data)
    } else {
      console.error('Error:', result.error)
    }
  } catch (error) {
    console.error('Fetch error:', error)
  }
}
```

---

## 📊 Database Tables You'll Use

### **Already Exist in Supabase:**
- ✅ `lots` - Main lots table
- ✅ `cemetery_sections` - For section references
- ✅ `clients` - For owner references
- ✅ `client_lots` - Lot ownership junction table
- ✅ `burials` - Burial records
- ✅ `payments` - Payment records
- ✅ `activity_logs` - For logging all actions

---

## 🎓 Learning Resources

### **Supabase Queries**
```typescript
// SELECT
const { data } = await supabase.from('table').select('*')

// SELECT with JOIN
const { data } = await supabase
  .from('lots')
  .select('*, cemetery_sections(*)')

// INSERT
const { data } = await supabase
  .from('table')
  .insert({ field: 'value' })
  .select()

// UPDATE
const { data } = await supabase
  .from('table')
  .update({ field: 'new value' })
  .eq('id', id)

// SOFT DELETE
const { data } = await supabase
  .from('table')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', id)

// FILTER
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('status', 'Active')
  .is('deleted_at', null)

// PAGINATION
const { data } = await supabase
  .from('table')
  .select('*')
  .range(0, 9) // First 10 items
```

---

## ✅ Success Criteria

### **Week 1 Complete When:**
- [ ] Can fetch all lots from database
- [ ] Can create new lot
- [ ] Can update lot status
- [ ] Can soft delete lot
- [ ] Employee dashboard shows real lots
- [ ] All operations logged in activity_logs

### **Week 2 Complete When:**
- [ ] Can manage clients (CRUD)
- [ ] Can view client's lots
- [ ] Can view client's payments
- [ ] Dashboard shows real client data

### **Week 3 Complete When:**
- [ ] Can record payments
- [ ] Can view payment history
- [ ] Can generate receipts
- [ ] Overdue payments identified
- [ ] Dashboard shows real payment data

---

## 🚨 Common Pitfalls to Avoid

1. **Not using service role key**
   - ✅ Use: `supabaseServer` (from `@/lib/supabase-server`)
   - ❌ Don't use: `supabase` (anon key - has RLS restrictions)

2. **Forgetting soft deletes**
   - Always filter: `.is('deleted_at', null)`
   - Delete by setting: `deleted_at = NOW()`

3. **Not logging activities**
   - Every create/update/delete should log to `activity_logs`

4. **Missing error handling**
   - Always wrap in try-catch
   - Return proper error responses

5. **Not validating input**
   - Check required fields
   - Validate data types
   - Sanitize inputs

---

## 📞 Need Help?

Refer to:
- `BACKEND_IMPLEMENTATION_PLAN.md` - Complete implementation guide
- `DASHBOARD_INTEGRATION.md` - API integration examples
- `AUTHENTICATION_COMPLETE.md` - Auth system reference
- Supabase docs: https://supabase.com/docs

---

**Ready to Start?** 🚀

**Next Action**: Create `app/api/lots/route.ts` and implement GET/POST!
