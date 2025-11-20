# Approval Workflow Implementation - Complete

## Overview
Successfully implemented approval workflows for all critical employee operations in the cemetery management system. Employees now submit requests for admin review before changes are applied to the database.

## Implementation Date
November 21, 2024

## Implemented Approval Workflows

### 1. **Lot Management** ✅
**Component:** `app/admin/employee/dashboard/components/lots-tab.tsx`

#### Lot Update (`lot_update`)
- **Action Type:** `lot_update`
- **Requires Approval:** YES (7 days expiration)
- **Priority:** Normal
- **Implementation:** Lines 126-201
- **Features:**
  - Captures previous lot data for rollback
  - Stores all field changes in `change_data`
  - Shows "Submitted for Approval" toast notification
  - Fallback to direct update if approval not required

#### Lot Delete (`lot_delete`)
- **Action Type:** `lot_delete`
- **Requires Approval:** YES (7 days expiration)
- **Priority:** High
- **Implementation:** Lines 203-260
- **Features:**
  - Captures complete lot data before deletion
  - Marks deletion with `{ deleted: true }` in change_data
  - High priority due to permanent nature
  - Shows "Submitted for Approval" toast notification

**Props Added:**
- `currentEmployeeId?: string` - Required for approval submission

**Usage in Parent:**
```typescript
<LotsTab currentEmployeeId={currentEmployeeId || undefined} />
```

---

### 2. **Client Management** ✅
**Component:** `app/admin/employee/dashboard/page.tsx`

#### Client Create (`client_create`)
- **Action Type:** `client_create`
- **Requires Approval:** NO (configurable - currently disabled)
- **Priority:** Normal
- **Implementation:** Lines 1449-1470
- **Features:**
  - Already implemented
  - Can be toggled in approval_workflow_config
  - Creates client account with portal login

#### Client Update (`client_update`)
- **Action Type:** `client_update`
- **Requires Approval:** YES (7 days expiration)
- **Priority:** Normal
- **Implementation:** Lines 1526-1628
- **Features:**
  - Captures previous client data
  - Updates contact information, address, emergency contacts
  - Logs activity with new action type `CLIENT_UPDATE_SUBMITTED`
  - Shows "Submitted for Approval" toast notification
  - Fallback to direct update if approval not required

#### Client Delete (`client_delete`)
- **Status:** Not implemented in employee dashboard
- **Reason:** Security - Only admins should delete client accounts

---

### 3. **Burial Management** ✅
**Component:** `app/admin/employee/dashboard/page.tsx`

#### Burial Create (`burial_create`)
- **Action Type:** `burial_create`
- **Requires Approval:** YES (7 days expiration)
- **Priority:** High
- **Implementation:** Lines 1926-1976
- **Features:**
  - Validates lot availability before submission
  - Captures complete burial data including:
    - Deceased information (name, age, cause)
    - Lot and owner association
    - Burial schedule (date, time)
    - Funeral details (home, attendees)
  - Shows "Submitted for Approval" toast notification
  - Prevents duplicate lot occupation
  - Fallback to direct creation if approval not required

#### Burial Update & Delete
- **Status:** Not implemented in employee dashboard
- **Reason:** Burial records are permanent historical data

---

### 4. **Payment Management** ✅
**Component:** `app/admin/employee/dashboard/page.tsx`

#### Payment Update (`payment_update`)
- **Action Type:** `payment_update`
- **Requires Approval:** YES (7 days expiration)
- **Priority:** Normal
- **Implementation:** Lines 2795-2816 (already implemented)
- **Features:**
  - Updates payment status (Paid, Under Payment, Overdue)
  - Captures previous payment status for audit
  - Shows "Submitted for Approval" toast notification

---

## Configuration

### Database Configuration
**Table:** `approval_workflow_config`

```sql
action_type         | requires_approval | expiration_days | is_active
--------------------|-------------------|-----------------|----------
lot_create          | TRUE              | 7               | TRUE
lot_update          | TRUE              | 7               | TRUE
lot_delete          | TRUE              | 7               | TRUE
burial_create       | TRUE              | 7               | TRUE
burial_update       | TRUE              | 7               | TRUE
burial_delete       | TRUE              | 7               | TRUE
payment_update      | TRUE              | 7               | TRUE
client_create       | FALSE             | 7               | TRUE
client_update       | TRUE              | 7               | TRUE
client_delete       | TRUE              | 7               | TRUE
map_create          | FALSE             | 7               | TRUE
```

### Row Level Security (RLS)
**Migration:** `007_approval_workflow_rls.sql`

- **Employees:** Can view and cancel their own pending actions
- **Admins:** Can view all actions and approve/reject them
- **No Hard Deletes:** Soft delete via status changes only

---

## API Integration

### Approval API Functions Used
From `lib/api/approvals-api.ts`:

1. **`checkApprovalRequired(actionType)`**
   - Checks if approval is required for action type
   - Returns config and requirement status

2. **`submitPendingAction(request, employeeId)`**
   - Submits action for admin approval
   - Returns success/error response

3. **`listMyPendingActions(employeeId, filters)`**
   - Lists employee's pending actions
   - Used in Approvals tab

### Request Structure
```typescript
{
  action_type: 'lot_update' | 'client_update' | 'burial_create' | ...,
  target_entity: 'lot' | 'client' | 'burial' | 'payment',
  target_id?: string,  // For updates/deletes
  change_data: { /* new/updated data */ },
  previous_data?: { /* original data */ },  // For updates/deletes
  notes: string,
  priority: 'low' | 'normal' | 'high' | 'urgent'
}
```

---

## User Experience Flow

### Employee Flow
1. Employee performs action (update lot, create burial, etc.)
2. System checks if approval required via `checkApprovalRequired()`
3. **If approval required:**
   - Show confirmation of submission
   - Action appears in Approvals tab as "Pending"
   - Employee can cancel while pending
4. **If approval not required:**
   - Action executes immediately
   - Standard success notification

### Admin Flow
1. Pending actions appear in Admin Dashboard → Approvals tab
2. Admin reviews change data and previous data
3. Admin can:
   - **Approve** - Action executes and updates database
   - **Reject** - Action cancelled with rejection reason
4. Employee notified of decision

---

## Testing Checklist

### Lot Management
- [ ] Update lot details triggers approval
- [ ] Delete lot triggers approval (high priority)
- [ ] Direct update works when approval disabled

### Client Management
- [ ] Create client (approval optional, currently disabled)
- [ ] Update client information triggers approval
- [ ] Previous client data captured correctly

### Burial Management
- [ ] Create burial triggers approval
- [ ] Lot validation works before submission
- [ ] Burial data captured completely

### Payment Management
- [ ] Update payment status triggers approval
- [ ] Previous status captured for audit

### Approval Tab
- [ ] Pending actions display correctly
- [ ] Action details show change_data and previous_data
- [ ] Status badges reflect current state
- [ ] Cancel button works for pending actions
- [ ] Summary cards show correct counts

---

## File Changes Summary

### Modified Files
1. **`app/admin/employee/dashboard/components/lots-tab.tsx`**
   - Added `currentEmployeeId` prop
   - Implemented approval workflow in `handleEditLot()`
   - Implemented approval workflow in `handleDeleteLot()`
   - Imported `checkApprovalRequired` and `submitPendingAction`

2. **`app/admin/employee/dashboard/page.tsx`**
   - Updated `handleUpdateClient()` with approval workflow
   - Updated `handleAddBurial()` with approval workflow
   - Fixed hardcoded ₱125,000 payment balance calculation
   - Passed `currentEmployeeId` to LotsTab component

### Imports Added
```typescript
import { checkApprovalRequired, submitPendingAction } from '@/lib/api/approvals-api'
```

---

## Benefits

### Security
- ✅ All critical operations require admin approval
- ✅ Audit trail via previous_data storage
- ✅ RLS policies prevent unauthorized access

### Accountability
- ✅ Clear record of who requested what
- ✅ Timestamp and notes for each action
- ✅ Admin reviewer tracked

### Flexibility
- ✅ Approval requirements configurable per action type
- ✅ Can enable/disable approval without code changes
- ✅ Priority levels for urgent vs normal actions

### User Experience
- ✅ Clear feedback on submission status
- ✅ Employees can track their requests
- ✅ No blocking - employees continue working

---

## Next Steps

### For Admins
1. Review pending actions in Admin Dashboard → Approvals tab
2. Approve or reject based on business rules
3. Monitor approval statistics

### For Testing
1. Test each approval workflow with different scenarios
2. Verify RLS policies prevent unauthorized access
3. Test expiration (7 days)
4. Verify email notifications (if implemented)

### For Future Enhancement
1. Add email notifications for approval status changes
2. Implement batch approval for similar actions
3. Add approval delegation for specific action types
4. Create approval history reports

---

## Compliance

### Database Integrity
- ✅ No direct database modifications without approval
- ✅ Rollback capability via previous_data
- ✅ Soft delete prevents data loss

### Business Rules
- ✅ 7-day expiration prevents stale approvals
- ✅ High priority for critical actions (delete, burial)
- ✅ Admin-only approval execution

---

## Support & Documentation

### Related Files
- **Database Schema:** `supabase/migrations/006_approval_workflow.sql`
- **RLS Policies:** `supabase/migrations/007_approval_workflow_rls.sql`
- **API Client:** `lib/api/approvals-api.ts`
- **Type Definitions:** `lib/types/approvals.ts`

### Migration Documentation
- **Setup Guide:** `supabase/DATABASE_SETUP_GUIDE.md`
- **Approval Workflow:** `supabase/migrations/README_APPROVAL_WORKFLOW.md`

---

## Conclusion

All critical employee operations now require admin approval, providing a secure, auditable workflow system. The implementation is flexible, configurable, and follows best practices for security and user experience.

**Implementation Status:** ✅ COMPLETE
**Last Updated:** November 21, 2024
