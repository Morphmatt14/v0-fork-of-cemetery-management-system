# Soft Delete Verification Guide

## What is Soft Delete?

Soft delete means records are **marked as deleted** but **not removed** from the database. This allows:
- ✅ Complete audit trail
- ✅ Data recovery if needed
- ✅ Compliance with data retention policies
- ✅ Historical reporting

## How to Verify Soft Delete Works

### 1. Check in Supabase Table Editor

Go to your `employees` table and look for deleted employees. They will have:
- `deleted_at` field with a timestamp
- `status` field set to 'inactive'
- `deleted_by` field with the admin ID who deleted them

### 2. Run This SQL Query in Supabase

```sql
-- View all employees including deleted ones
SELECT 
  id,
  username,
  name,
  email,
  status,
  created_at,
  deleted_at,
  CASE 
    WHEN deleted_at IS NULL THEN 'Active'
    ELSE 'Deleted'
  END as record_status
FROM employees
ORDER BY created_at DESC;
```

### 3. View Only Deleted Employees

```sql
-- View only soft-deleted employees
SELECT 
  id,
  username,
  name,
  email,
  status,
  deleted_at,
  deleted_by
FROM employees
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;
```

### 4. Count Active vs Deleted Employees

```sql
-- Count employees by status
SELECT 
  CASE 
    WHEN deleted_at IS NULL THEN 'Active'
    ELSE 'Deleted'
  END as record_status,
  COUNT(*) as count
FROM employees
GROUP BY record_status;
```

## Expected Behavior

### When You Delete an Employee:

**In the UI:**
- ❌ Employee disappears from the list immediately
- ✅ Success message shown
- ✅ List refreshes without the deleted employee

**In the Database:**
- ✅ Employee record STILL EXISTS
- ✅ `deleted_at` field IS SET (has timestamp)
- ✅ `status` field IS 'inactive'
- ✅ `deleted_by` field HAS admin ID

**In Activity Logs:**
- ✅ New log entry created with action 'EMPLOYEE_DELETED'
- ✅ Contains employee username and name
- ✅ Records who performed the deletion

### When You Fetch Employees:

The GET API filters out soft-deleted employees:
```typescript
.is('deleted_at', null)  // Only returns employees where deleted_at IS NULL
```

## How to Recover a Deleted Employee

If you need to recover a deleted employee, run this SQL in Supabase:

```sql
-- Recover a deleted employee
UPDATE employees
SET 
  deleted_at = NULL,
  deleted_by = NULL,
  status = 'active'
WHERE username = 'Carl';  -- Replace with actual username
```

## Benefits of Soft Delete

1. **Audit Trail**: You can always see who was deleted and when
2. **Data Recovery**: Accidentally deleted? Just unset `deleted_at`
3. **Compliance**: Meet legal requirements for data retention
4. **Reporting**: Include historical data in reports
5. **References**: Other tables can still reference the employee ID

## Hard Delete (Permanent Delete)

If you REALLY want to permanently delete (NOT recommended), you would:

```sql
-- ⚠️ DANGER: This permanently removes the record
-- Only use if absolutely necessary!
DELETE FROM employees 
WHERE id = 'employee-id-here';
```

**Why NOT to use hard delete:**
- ❌ Loses all audit history
- ❌ Breaks foreign key references
- ❌ Can't recover if mistake
- ❌ Compliance issues
- ❌ Breaks reporting

## Verifying Your Current Setup

Run this query to see the current state of all your employees:

```sql
SELECT 
  username,
  name,
  status,
  created_at::date as created_date,
  deleted_at::date as deleted_date,
  CASE 
    WHEN deleted_at IS NULL THEN '✅ Active'
    ELSE '❌ Deleted'
  END as current_status
FROM employees
ORDER BY created_at DESC;
```

## What You Should See After Deleting "Carl"

```
username | name             | status   | deleted_at           | current_status
---------|------------------|----------|---------------------|---------------
Carl     | Carlstein Borja  | inactive | 2025-11-19 02:33:... | ❌ Deleted
employee | Default Employee | active   | NULL                | ✅ Active
```

The record is still there, just marked as deleted! ✅
