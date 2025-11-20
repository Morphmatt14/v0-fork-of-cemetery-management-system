-- ============================================================================
-- CEMETERY MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Test Script: TEST_006_007_approval_workflow.sql
-- Description: Verification tests for approval workflow migrations
-- Date: 2024-11-20
-- ============================================================================

-- This script contains test queries to verify the approval workflow migration
-- Run these queries to ensure everything is set up correctly

-- ============================================================================
-- 1. VERIFY TABLES EXIST
-- ============================================================================

-- Check if pending_actions table exists
SELECT 
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pending_actions'
    ) AS pending_actions_exists;
-- Expected: TRUE

-- Check if approval_workflow_config table exists
SELECT 
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'approval_workflow_config'
    ) AS approval_workflow_config_exists;
-- Expected: TRUE

-- ============================================================================
-- 2. VERIFY TABLE STRUCTURE
-- ============================================================================

-- View pending_actions columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pending_actions'
ORDER BY ordinal_position;

-- View approval_workflow_config columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'approval_workflow_config'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. VERIFY DEFAULT CONFIGURATION DATA
-- ============================================================================

-- Count configuration records
SELECT COUNT(*) AS config_count 
FROM approval_workflow_config;
-- Expected: 11 records

-- View all configuration
SELECT 
    action_type,
    requires_approval,
    expiration_days,
    is_active,
    description
FROM approval_workflow_config
ORDER BY action_type;

-- Check which actions require approval
SELECT 
    action_type,
    requires_approval,
    CASE 
        WHEN requires_approval THEN '✓ Requires Approval'
        ELSE '✗ No Approval Needed'
    END as status
FROM approval_workflow_config
WHERE is_active = TRUE
ORDER BY requires_approval DESC, action_type;

-- ============================================================================
-- 4. VERIFY INDEXES
-- ============================================================================

-- List all indexes on pending_actions
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'pending_actions'
ORDER BY indexname;
-- Expected: 9 indexes (including primary key)

-- ============================================================================
-- 5. VERIFY TRIGGERS
-- ============================================================================

-- List all triggers on pending_actions
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'pending_actions'
ORDER BY trigger_name;
-- Expected: 2 triggers (updated_at, expiration)

-- List all triggers on approval_workflow_config
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'approval_workflow_config'
ORDER BY trigger_name;
-- Expected: 1 trigger (updated_at)

-- ============================================================================
-- 6. VERIFY FUNCTIONS
-- ============================================================================

-- Check if helper functions exist
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'is_admin',
    'is_employee',
    'owns_pending_action',
    'update_pending_actions_updated_at',
    'update_approval_workflow_config_updated_at',
    'set_pending_action_expiration'
)
ORDER BY routine_name;
-- Expected: 6 functions

-- ============================================================================
-- 7. VERIFY RLS POLICIES
-- ============================================================================

-- List all policies on pending_actions
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'pending_actions'
ORDER BY policyname;
-- Expected: 7 policies

-- List all policies on approval_workflow_config
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'approval_workflow_config'
ORDER BY policyname;
-- Expected: 4 policies

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('pending_actions', 'approval_workflow_config');
-- Expected: Both should have rowsecurity = TRUE

-- ============================================================================
-- 8. VERIFY CONSTRAINTS
-- ============================================================================

-- Check constraints on pending_actions
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    CASE contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
    END AS type_description
FROM pg_constraint
WHERE conrelid = 'pending_actions'::regclass
ORDER BY contype, conname;

-- Check foreign key relationships
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'pending_actions';

-- ============================================================================
-- 9. TEST DATA INSERTION (Optional - for manual testing)
-- ============================================================================

-- NOTE: These are commented out. Uncomment to test actual data insertion
-- You'll need valid employee and admin UUIDs from your database

/*
-- Test 1: Insert a pending action (requires valid employee_id)
INSERT INTO pending_actions (
    action_type,
    target_entity,
    target_id,
    change_data,
    previous_data,
    requested_by_id,
    requested_by_username,
    requested_by_name,
    status,
    priority,
    notes
) VALUES (
    'lot_update',
    'lot',
    'your-lot-uuid-here'::UUID,
    '{"status": "Sold", "price": 75000}'::JSONB,
    '{"status": "Available", "price": 50000}'::JSONB,
    'your-employee-uuid-here'::UUID,
    'john.doe',
    'John Doe',
    'pending',
    'normal',
    'Test pending action'
) RETURNING *;

-- Test 2: Query pending actions
SELECT 
    id,
    action_type,
    target_entity,
    status,
    requested_by_username,
    created_at,
    expires_at,
    EXTRACT(DAY FROM (expires_at - created_at)) AS days_to_expire
FROM pending_actions
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Test 3: Update configuration
UPDATE approval_workflow_config
SET expiration_days = 14
WHERE action_type = 'lot_update'
RETURNING action_type, expiration_days, updated_at;

-- Test 4: Check if expiration trigger works
SELECT 
    action_type,
    created_at,
    expires_at,
    expires_at - created_at AS expiration_interval
FROM pending_actions
ORDER BY created_at DESC
LIMIT 5;
*/

-- ============================================================================
-- 10. SUMMARY REPORT
-- ============================================================================

-- Generate migration summary
SELECT 
    'MIGRATION VERIFICATION SUMMARY' AS section,
    '================================' AS divider;

SELECT 
    'Tables Created' AS item,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name IN ('pending_actions', 'approval_workflow_config')
    )::TEXT AS count,
    '2 expected' AS expected;

SELECT 
    'Configuration Records' AS item,
    (SELECT COUNT(*)::TEXT FROM approval_workflow_config) AS count,
    '11 expected' AS expected;

SELECT 
    'Indexes Created' AS item,
    (SELECT COUNT(*)::TEXT FROM pg_indexes 
     WHERE tablename = 'pending_actions'
    ) AS count,
    '9 expected' AS expected;

SELECT 
    'Triggers Created' AS item,
    (SELECT COUNT(*)::TEXT FROM information_schema.triggers 
     WHERE event_object_table IN ('pending_actions', 'approval_workflow_config')
    ) AS count,
    '3 expected' AS expected;

SELECT 
    'RLS Policies Created' AS item,
    (SELECT COUNT(*)::TEXT FROM pg_policies 
     WHERE tablename IN ('pending_actions', 'approval_workflow_config')
    ) AS count,
    '11 expected' AS expected;

SELECT 
    'Helper Functions' AS item,
    (SELECT COUNT(*)::TEXT FROM information_schema.routines
     WHERE routine_schema = 'public'
     AND routine_name IN (
         'is_admin', 'is_employee', 'owns_pending_action',
         'update_pending_actions_updated_at',
         'update_approval_workflow_config_updated_at',
         'set_pending_action_expiration'
     )
    ) AS count,
    '6 expected' AS expected;

-- ============================================================================
-- TEST COMPLETE
-- ============================================================================

-- All verification queries completed
-- Review the results above to ensure migration was successful
-- If any counts don't match expected values, investigate further

-- Next Steps:
-- 1. Verify all counts match expected values
-- 2. Test data insertion (uncomment section 9)
-- 3. Test RLS policies with different user roles
-- 4. Proceed to Phase 2 (API implementation)
