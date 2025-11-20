    -- ============================================================================
    -- CEMETERY MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
    -- ============================================================================
    -- Migration: 007_approval_workflow_rls.sql
    -- Description: Row Level Security policies for approval workflow
    -- Date: 2024-11-20
    -- ============================================================================

    -- This migration adds RLS policies to secure the approval workflow tables
    -- ensuring proper access control for employees and admins.

    -- ============================================================================
    -- 1. ENABLE ROW LEVEL SECURITY
    -- ============================================================================

    ALTER TABLE pending_actions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE approval_workflow_config ENABLE ROW LEVEL SECURITY;

    -- ============================================================================
    -- 2. PENDING ACTIONS POLICIES
    -- ============================================================================

    -- ────────────────────────────────────────────────────────────────────────
    -- SELECT Policies (Who can view pending actions)
    -- ────────────────────────────────────────────────────────────────────────

    -- Policy: Employees can view their own pending actions
    CREATE POLICY "employees_view_own_pending_actions"
    ON pending_actions
    FOR SELECT
    TO authenticated
    USING (
        -- Employee can see their own pending actions
        requested_by_id::text = auth.uid()::text
    );

    -- Policy: Admins can view all pending actions
    CREATE POLICY "admins_view_all_pending_actions"
    ON pending_actions
    FOR SELECT
    TO authenticated
    USING (
        -- Check if user is an admin
        EXISTS (
            SELECT 1 FROM admins
            WHERE id::text = auth.uid()::text
            AND status = 'active'
        )
    );

    -- ────────────────────────────────────────────────────────────────────────
    -- INSERT Policies (Who can create pending actions)
    -- ────────────────────────────────────────────────────────────────────────

    -- Policy: Employees can submit their own pending actions
    CREATE POLICY "employees_submit_pending_actions"
    ON pending_actions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Must be an active employee
        EXISTS (
            SELECT 1 FROM employees
            WHERE id::text = auth.uid()::text
            AND status = 'active'
        )
        AND
        -- Must be creating for themselves
        requested_by_id::text = auth.uid()::text
        AND
        -- Must start with pending status
        status = 'pending'
    );

    -- ────────────────────────────────────────────────────────────────────────
    -- UPDATE Policies (Who can modify pending actions)
    -- ────────────────────────────────────────────────────────────────────────

    -- Policy: Employees can cancel their own pending actions
    CREATE POLICY "employees_cancel_own_pending_actions"
    ON pending_actions
    FOR UPDATE
    TO authenticated
    USING (
        -- Employee can only update their own pending actions
        requested_by_id::text = auth.uid()::text
        AND
        -- Only if still pending
        status = 'pending'
        AND
        -- Must be an active employee
        EXISTS (
            SELECT 1 FROM employees
            WHERE id::text = auth.uid()::text
            AND status = 'active'
        )
    )
    WITH CHECK (
        -- Can only change status to cancelled
        status = 'cancelled'
        AND
        -- Cannot change the requesting employee (must remain the same)
        requested_by_id::text = auth.uid()::text
    );

    -- Policy: Admins can review (approve/reject) pending actions
    CREATE POLICY "admins_review_pending_actions"
    ON pending_actions
    FOR UPDATE
    TO authenticated
    USING (
        -- Must be an active admin
        EXISTS (
            SELECT 1 FROM admins
            WHERE id::text = auth.uid()::text
            AND status = 'active'
        )
        AND
        -- Can only review pending actions
        status = 'pending'
    )
    WITH CHECK (
        -- Can approve, reject, or mark as executed
        status IN ('approved', 'rejected', 'executed')
        AND
        -- Must set reviewed_by_id to themselves
        reviewed_by_id::text = auth.uid()::text
    );

    -- Policy: System can update execution status after approval
    -- This allows API to mark actions as executed after successful completion
    CREATE POLICY "system_update_execution_status"
    ON pending_actions
    FOR UPDATE
    TO authenticated
    USING (
        -- Must be an approved action
        status = 'approved'
        AND
        -- Must be an admin executing it
        EXISTS (
            SELECT 1 FROM admins
            WHERE id::text = auth.uid()::text
            AND status = 'active'
        )
    )
    WITH CHECK (
        -- Can only mark as executed or record execution result
        (is_executed = TRUE OR execution_result IS NOT NULL OR execution_error IS NOT NULL)
    );

    -- ────────────────────────────────────────────────────────────────────────
    -- DELETE Policies (Who can delete pending actions)
    -- ────────────────────────────────────────────────────────────────────────

    -- Policy: No one can delete pending actions
    -- We use soft delete via status changes instead
    CREATE POLICY "no_delete_pending_actions"
    ON pending_actions
    FOR DELETE
    TO authenticated
    USING (FALSE);

    -- ============================================================================
    -- 3. APPROVAL WORKFLOW CONFIG POLICIES
    -- ============================================================================

    -- ────────────────────────────────────────────────────────────────────────
    -- SELECT Policies (Who can view configuration)
    -- ────────────────────────────────────────────────────────────────────────

    -- Policy: All authenticated users can read workflow configuration
    -- This is needed so employees can check if approval is required
    CREATE POLICY "authenticated_view_workflow_config"
    ON approval_workflow_config
    FOR SELECT
    TO authenticated
    USING (TRUE);

    -- ────────────────────────────────────────────────────────────────────────
    -- INSERT Policies (Who can create configuration)
    -- ────────────────────────────────────────────────────────────────────────

    -- Policy: Only admins can add new workflow configurations
    CREATE POLICY "admins_create_workflow_config"
    ON approval_workflow_config
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins
            WHERE id::text = auth.uid()::text
            AND status = 'active'
        )
    );

    -- ────────────────────────────────────────────────────────────────────────
    -- UPDATE Policies (Who can modify configuration)
    -- ────────────────────────────────────────────────────────────────────────

    -- Policy: Only admins can update workflow configuration
    CREATE POLICY "admins_update_workflow_config"
    ON approval_workflow_config
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE id::text = auth.uid()::text
            AND status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins
            WHERE id::text = auth.uid()::text
            AND status = 'active'
        )
    );

    -- ────────────────────────────────────────────────────────────────────────
    -- DELETE Policies (Who can delete configuration)
    -- ────────────────────────────────────────────────────────────────────────

    -- Policy: Only admins can delete workflow configuration
    CREATE POLICY "admins_delete_workflow_config"
    ON approval_workflow_config
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE id::text = auth.uid()::text
            AND status = 'active'
        )
    );

    -- ============================================================================
    -- 4. HELPER FUNCTIONS FOR RLS
    -- ============================================================================

    -- Function to check if current user is an admin
    CREATE OR REPLACE FUNCTION is_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN EXISTS (
            SELECT 1 FROM admins
            WHERE id::text = auth.uid()::text
            AND status = 'active'
        );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to check if current user is an employee
    CREATE OR REPLACE FUNCTION is_employee()
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN EXISTS (
            SELECT 1 FROM employees
            WHERE id::text = auth.uid()::text
            AND status = 'active'
        );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Function to check if user owns a pending action
    CREATE OR REPLACE FUNCTION owns_pending_action(action_id UUID)
    RETURNS BOOLEAN AS $$
    BEGIN
        RETURN EXISTS (
            SELECT 1 FROM pending_actions
            WHERE id = action_id
            AND requested_by_id::text = auth.uid()::text
        );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- ============================================================================
    -- 5. COMMENTS FOR DOCUMENTATION
    -- ============================================================================

    COMMENT ON POLICY "employees_view_own_pending_actions" ON pending_actions IS 
        'Employees can view their own submitted pending actions';

    COMMENT ON POLICY "admins_view_all_pending_actions" ON pending_actions IS 
        'Admins can view all pending actions for review';

    COMMENT ON POLICY "employees_submit_pending_actions" ON pending_actions IS 
        'Employees can submit new actions for approval';

    COMMENT ON POLICY "employees_cancel_own_pending_actions" ON pending_actions IS 
        'Employees can cancel their own pending actions before review';

    COMMENT ON POLICY "admins_review_pending_actions" ON pending_actions IS 
        'Admins can approve or reject pending actions';

    COMMENT ON POLICY "authenticated_view_workflow_config" ON approval_workflow_config IS 
        'All authenticated users can read workflow configuration';

    COMMENT ON POLICY "admins_update_workflow_config" ON approval_workflow_config IS 
        'Only admins can modify workflow configuration';

    COMMENT ON FUNCTION is_admin() IS 
        'Helper function to check if current user is an active admin';

    COMMENT ON FUNCTION is_employee() IS 
        'Helper function to check if current user is an active employee';

    COMMENT ON FUNCTION owns_pending_action(UUID) IS 
        'Helper function to check if user owns a specific pending action';

    -- ============================================================================
    -- MIGRATION COMPLETE
    -- ============================================================================

    -- Migration 007 successfully applied
    -- Added: Row Level Security policies for pending_actions
    -- Added: Row Level Security policies for approval_workflow_config
    -- Added: Helper functions for RLS checks
    -- Security: Employees can only manage their own actions
    -- Security: Admins have full review and configuration access
    -- Security: No hard deletes allowed (soft delete via status)
