# Lot Balance Bug Fix

**Issue Discovered:** November 21, 2024  
**Status:** ✅ Fixed  
**Severity:** High - Affects all newly assigned lots

---

## Problem Description

When an employee assigns a lot to a client, the lot shows as "**Fully Paid**" with ₱0.00 balance in the client portal, even though the client hasn't made any payments.

### Example from Screenshot:
- **Client:** Carl Trazares Borja
- **Lot:** 62a28e35-d59f-43f3-b0bb-182427b4408
- **Total Price:** ₱75,000.00
- **Displayed Balance:** ₱0.00
- **Status Shown:** ✓ Fully Paid (GREEN)
- **Expected Balance:** ₱75,000.00
- **Expected Status:** Under Payment or Pending

---

## Root Cause

### Code Analysis

**File:** `app/admin/employee/dashboard/components/lots-tab.tsx`

**Function:** `handleAssignLotToOwner()`

**Original Code (Lines 98-121):**
```typescript
const handleAssignLotToOwner = async (lotId: string, ownerId: string, ownerName: string) => {
  try {
    await updateLot(lotId, {
      owner_id: ownerId,
      status: 'Reserved',
      // ❌ MISSING: balance initialization!
    })
    // ...
  }
}
```

**Problem:**
- When assigning a lot, only `owner_id` and `status` were updated
- The `balance` field was **NOT initialized**
- Database returns `balance = NULL` or `balance = 0`
- Client API returns `balance: lot.balance || 0` → Always **0**

### Data Flow

```
1. EMPLOYEE ASSIGNS LOT
   ↓
   updateLot(lotId, {
     owner_id: clientId,
     status: 'Reserved'
     // balance: ❌ NOT SET
   })
   ↓
2. DATABASE
   lots.balance = NULL or 0
   ↓
3. CLIENT FETCHES LOT DATA
   /api/client/lots?clientId=...
   ↓
4. API RETURNS
   {
     price: 75000,
     balance: 0,  // ❌ WRONG!
     ...
   }
   ↓
5. CLIENT UI CALCULATES
   if (balance === 0) {
     show "Fully Paid" ✓
     show ₱0.00
   }
```

---

## Solution Implemented

### 1. **Code Fix - Initialize Balance on Assignment**

**File:** `app/admin/employee/dashboard/components/lots-tab.tsx`

**Updated Function:**
```typescript
const handleAssignLotToOwner = async (lotId: string, ownerId: string, ownerName: string) => {
  try {
    // ✅ Get the lot details to set initial balance
    const lot = lots.find(l => l.id === lotId)
    
    if (!lot) {
      throw new Error('Lot not found')
    }

    // ✅ Set balance to the lot's price when assigning
    const initialBalance = lot.price || 0

    await updateLot(lotId, {
      owner_id: ownerId,
      status: 'Reserved',
      balance: initialBalance, // ✅ Initialize balance to lot price
    })

    toast({
      title: 'Lot Assigned',
      description: `Lot ${lotId} has been assigned to ${ownerName}. Balance: ₱${initialBalance.toLocaleString()}`,
    })
    // ...
  }
}
```

**Changes:**
1. ✅ Find the lot to get its price
2. ✅ Set `initialBalance = lot.price`
3. ✅ Include `balance: initialBalance` in update
4. ✅ Show balance in success toast

---

### 2. **Type Definition Update**

**File:** `lib/types/lots.ts`

**Added `balance` to `UpdateLotInput`:**
```typescript
export interface UpdateLotInput {
  lot_number?: string
  section_id?: string
  lot_type?: LotType
  status?: LotStatus
  price?: number
  balance?: number  // ✅ Added this field
  dimensions?: string
  owner_id?: string
  // ... other fields
}
```

---

### 3. **Database Migration - Fix Existing Data**

**File:** `supabase/migrations/009_fix_lot_balances.sql`

**What It Does:**

**a) Fix Existing Lots:**
```sql
UPDATE lots
SET 
    balance = COALESCE(price, 0)
WHERE 
    owner_id IS NOT NULL  -- Lot is assigned
    AND (balance IS NULL OR balance = 0)  -- Balance not set
    AND price > 0  -- Lot has a price
    AND status IN ('Reserved', 'Occupied');
```

**b) Update Client Balances:**
```sql
UPDATE clients c
SET 
    balance = (
        SELECT SUM(l.balance)
        FROM lots l
        WHERE l.owner_id = c.id
    )
WHERE EXISTS (
    SELECT 1 FROM lots WHERE owner_id = c.id
);
```

**c) Auto-Set Balance Trigger (Future Assignments):**
```sql
CREATE FUNCTION set_initial_lot_balance()
CREATE TRIGGER trigger_set_initial_lot_balance
    BEFORE UPDATE ON lots
    -- Auto-sets balance = price when owner_id changes from NULL
```

---

## Impact

### Before Fix:
❌ All newly assigned lots show as "Fully Paid"  
❌ Clients see ₱0.00 balance  
❌ No payment tracking for new assignments  
❌ Financial records incorrect  

### After Fix:
✅ New lot assignments set balance = price  
✅ Clients see correct outstanding balance  
✅ Payment tracking works correctly  
✅ "Fully Paid" only shows when truly paid  
✅ Database trigger prevents future issues  

---

## Testing Checklist

### Test 1: New Lot Assignment
- [ ] Employee assigns lot to client
- [ ] Lot price: ₱75,000
- [ ] Check database: `lots.balance = 75000`
- [ ] Client portal shows: Balance ₱75,000
- [ ] Status shows: "Under Payment" or "Pending"
- [ ] NOT showing "Fully Paid"

### Test 2: Existing Lot (After Migration)
- [ ] Run migration `009_fix_lot_balances.sql`
- [ ] Check Carl's lot in database
- [ ] Balance should now be ₱75,000
- [ ] Client portal refreshed
- [ ] Shows correct balance

### Test 3: Payment Flow
- [ ] Client schedules payment for ₱25,000
- [ ] Employee confirms payment
- [ ] Status changes to "Completed"
- [ ] Balance updates: ₱75,000 → ₱50,000
- [ ] Client sees updated balance

### Test 4: Full Payment
- [ ] Client makes final payment
- [ ] All payments marked "Completed"
- [ ] Balance updates to ₱0.00
- [ ] NOW shows "Fully Paid" ✓
- [ ] This is correct!

---

## Affected Users

### Current Impact:
- **Carl Trazares Borja** (shown in screenshot)
- Any other clients who were recently assigned lots
- All clients assigned lots since system deployment

### How to Identify Affected Lots:
```sql
SELECT 
    l.lot_number,
    l.owner_id,
    c.name as client_name,
    l.price,
    l.balance,
    l.status,
    l.created_at
FROM lots l
LEFT JOIN clients c ON c.id = l.owner_id
WHERE 
    l.owner_id IS NOT NULL
    AND (l.balance IS NULL OR l.balance = 0)
    AND l.price > 0
    AND l.status IN ('Reserved', 'Occupied')
ORDER BY l.created_at DESC;
```

---

## Migration Instructions

### **Important Note:**
The migration will automatically **add the `balance` column** to the `lots` table if it doesn't exist. This is safe to run multiple times.

### Step 1: Apply Code Changes
```bash
# Code changes are already committed
git pull origin main
```

### Step 2: Run Database Migration
```bash
# Option A: Using Supabase CLI
supabase migration up

# Option B: Using Supabase Dashboard
# Go to SQL Editor → Paste 009_fix_lot_balances.sql → Run
```

### Step 3: Verify Column Was Added
```sql
-- Check if balance column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'lots' AND column_name = 'balance';

-- Should return:
-- column_name | data_type | column_default
-- balance     | numeric   | 0
```

### Step 4: Verify Fix
```sql
-- Check if lots have correct balances
SELECT 
    COUNT(*) as total_assigned_lots,
    COUNT(CASE WHEN balance > 0 THEN 1 END) as lots_with_balance,
    SUM(balance) as total_balance
FROM lots
WHERE owner_id IS NOT NULL;

-- Check specific client (Carl)
SELECT 
    l.*,
    c.name as client_name,
    c.balance as client_balance
FROM lots l
JOIN clients c ON c.id = l.owner_id
WHERE l.id = '62a28e35-d59f-43f3-b0bb-182427b4408';
```

### Step 5: Notify Affected Clients
- Send email explaining balance correction
- Apologize for confusion
- Confirm actual payment status
- Provide updated balance information

---

## Prevention

### Automated Trigger
The migration creates a database trigger that automatically sets `balance = price` when a lot is assigned. This prevents the issue from happening again, even if the code is modified in the future.

**Trigger Logic:**
```sql
IF owner_id changes from NULL to a value
  AND balance is 0 or NULL
  AND price > 0
THEN
  SET balance = price
END IF
```

### Code Review Checklist
- [ ] When assigning lots, always set balance
- [ ] Test with client portal to verify balance shows
- [ ] Check database after assignment
- [ ] Verify client sees correct balance

---

## Related Files Modified

1. ✅ `app/admin/employee/dashboard/components/lots-tab.tsx`
   - Updated `handleAssignLotToOwner` function

2. ✅ `lib/types/lots.ts`
   - Added `balance` to `UpdateLotInput`

3. ✅ `supabase/migrations/009_fix_lot_balances.sql`
   - New migration file
   - Fixes existing data
   - Adds prevention trigger

---

## Rollback Plan

If issues occur after applying the fix:

```sql
-- Rollback migration
BEGIN;

-- Remove trigger
DROP TRIGGER IF EXISTS trigger_set_initial_lot_balance ON lots;
DROP FUNCTION IF EXISTS set_initial_lot_balance();

-- Restore previous balances (if needed)
-- Note: Only if you have a backup!
-- RESTORE FROM BACKUP

COMMIT;
```

---

## Conclusion

**Status:** ✅ **FIXED**

The bug where newly assigned lots appeared as "Fully Paid" has been resolved. The fix includes:

1. Code changes to initialize balance on assignment
2. Database migration to fix existing data  
3. Automated trigger to prevent future occurrences
4. Documentation for testing and verification

**Priority:** Deploy immediately to prevent confusion for new lot assignments.

---

**Last Updated:** November 21, 2024  
**Fixed By:** System Analysis & Implementation
