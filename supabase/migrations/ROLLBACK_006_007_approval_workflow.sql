-- ============================================================================
-- CEMETERY MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Rollback Script: ROLLBACK_006_007_approval_workflow.sql
-- Description: Rollback approval workflow migrations (006 and 007)
-- Date: 2024-11-20
-- ============================================================================

-- WARNING: This script will completely remove the approval workflow feature
-- Use only if you need to rollback migrations 006 and 007

-- ============================================================================
-- STEP 1: DROP RLS POLICIES (from migration 007)
-- ============================================================================

-- Drop pending_actions policies
DROP POLICY IF EXISTS "employees_view_own_pending_actions" ON pending_actions;
DROP POLICY IF EXISTS "admins_view_all_pending_actions" ON pending_actions;
DROP POLICY IF EXISTS "employees_submit_pending_actions" ON pending_actions;
DROP POLICY IF EXISTS "employees_cancel_own_pending_actions" ON pending_actions;
DROP POLICY IF EXISTS "admins_review_pending_actions" ON pending_actions;
DROP POLICY IF EXISTS "system_update_execution_status" ON pending_actions;
DROP POLICY IF EXISTS "no_delete_pending_actions" ON pending_actions;

-- Drop approval_workflow_config policies
DROP POLICY IF EXISTS "authenticated_view_workflow_config" ON approval_workflow_config;
DROP POLICY IF EXISTS "admins_create_workflow_config" ON approval_workflow_config;
DROP POLICY IF EXISTS "admins_update_workflow_config" ON approval_workflow_config;
DROP POLICY IF EXISTS "admins_delete_workflow_config" ON approval_workflow_config;

-- ============================================================================
-- STEP 2: DROP HELPER FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_employee();
DROP FUNCTION IF EXISTS owns_pending_action(UUID);

-- ============================================================================
-- STEP 3: DROP TRIGGERS (from migration 006)
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_update_pending_actions_updated_at ON pending_actions;
DROP TRIGGER IF EXISTS trigger_update_approval_workflow_config_updated_at ON approval_workflow_config;
DROP TRIGGER IF EXISTS trigger_set_pending_action_expiration ON pending_actions;

-- ============================================================================
-- STEP 4: DROP TRIGGER FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS update_pending_actions_updated_at();
DROP FUNCTION IF EXISTS update_approval_workflow_config_updated_at();
DROP FUNCTION IF EXISTS set_pending_action_expiration();

-- ============================================================================
-- STEP 5: DROP INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_pending_actions_status_pending;
DROP INDEX IF EXISTS idx_pending_actions_requested_by;
DROP INDEX IF EXISTS idx_pending_actions_reviewed_by;
DROP INDEX IF EXISTS idx_pending_actions_target;
DROP INDEX IF EXISTS idx_pending_actions_expires_at;
DROP INDEX IF EXISTS idx_pending_actions_priority;
DROP INDEX IF EXISTS idx_pending_actions_related_client;
DROP INDEX IF EXISTS idx_pending_actions_related_lot;
DROP INDEX IF EXISTS idx_pending_actions_action_type;

-- ============================================================================
-- STEP 6: DROP TABLES
-- ============================================================================

-- Drop tables in correct order (reverse of creation)
DROP TABLE IF EXISTS pending_actions CASCADE;
DROP TABLE IF EXISTS approval_workflow_config CASCADE;

-- ============================================================================
-- ROLLBACK COMPLETE
-- ============================================================================

-- Migrations 006 and 007 successfully rolled back
-- Removed: pending_actions table
-- Removed: approval_workflow_config table
-- Removed: All indexes, triggers, functions, and policies
-- System restored to pre-approval workflow state

-- Note: Any data in pending_actions has been permanently deleted
-- If you need to preserve data, make a backup before running this rollback
