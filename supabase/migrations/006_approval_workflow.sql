-- ============================================================================
-- CEMETERY MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Migration: 006_approval_workflow.sql
-- Description: Admin approval workflow for employee actions
-- Date: 2024-11-20
-- ============================================================================

-- This migration adds the approval workflow system that requires admin review
-- before employee actions are executed. It is non-destructive and adds only
-- new tables without modifying existing schema.

-- ============================================================================
-- 1. PENDING ACTIONS TABLE
-- ============================================================================

-- Stores all employee actions that require admin approval
CREATE TABLE IF NOT EXISTS pending_actions (
    -- Primary Identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Action Type: What kind of action is being requested
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'lot_create',
        'lot_update',
        'lot_delete',
        'burial_create',
        'burial_update',
        'burial_delete',
        'payment_update',
        'client_create',
        'client_update',
        'client_delete',
        'map_create'
    )),
    
    -- Actor Information (Employee who requested)
    requested_by_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    requested_by_username VARCHAR(255) NOT NULL,
    requested_by_name VARCHAR(255),
    
    -- Target Data: What entity is being modified
    target_entity VARCHAR(50) NOT NULL CHECK (target_entity IN (
        'lot',
        'burial',
        'payment',
        'client',
        'map',
        'section'
    )),
    target_id UUID,  -- NULL for create operations, UUID for update/delete
    
    -- Change Payload: JSONB for flexibility to store any entity's data
    change_data JSONB NOT NULL,      -- New/updated data to be applied
    previous_data JSONB,              -- Original data (for updates/deletes)
    
    -- Approval Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Awaiting admin review
        'approved',     -- Approved by admin
        'rejected',     -- Rejected by admin
        'cancelled',    -- Cancelled by employee before review
        'expired'       -- Auto-expired after expiration period
    )),
    
    -- Admin Review Information
    reviewed_by_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    reviewed_by_username VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    admin_notes TEXT,
    
    -- Execution Status
    is_executed BOOLEAN DEFAULT FALSE,
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_result JSONB,  -- Success/error details after execution
    execution_error TEXT,    -- Error message if execution failed
    
    -- Metadata
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN (
        'low',
        'normal',
        'high',
        'urgent'
    )),
    category VARCHAR(50),     -- For filtering/grouping (e.g., 'financial', 'operational')
    notes TEXT,               -- Employee's notes about the request
    
    -- Related Records: For quick lookups and filtering
    related_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    related_lot_id UUID REFERENCES lots(id) ON DELETE SET NULL,
    related_payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE  -- Auto-expire date
);

-- ============================================================================
-- 2. APPROVAL WORKFLOW CONFIGURATION TABLE
-- ============================================================================

-- Defines which actions require approval and workflow rules
CREATE TABLE IF NOT EXISTS approval_workflow_config (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Action Configuration
    action_type VARCHAR(50) UNIQUE NOT NULL,
    requires_approval BOOLEAN DEFAULT TRUE,
    description TEXT,
    
    -- Approval Requirements
    min_approvers INTEGER DEFAULT 1 CHECK (min_approvers >= 1),
    allowed_approver_roles VARCHAR(50)[] DEFAULT ARRAY['admin'],
    
    -- Auto-approval Rules (for future use)
    auto_approve_conditions JSONB,  -- Flexible conditions for automatic approval
    
    -- Expiration Settings
    expiration_days INTEGER DEFAULT 7 CHECK (expiration_days > 0),
    
    -- Notification Settings
    notify_on_submit BOOLEAN DEFAULT TRUE,
    notify_on_approve BOOLEAN DEFAULT TRUE,
    notify_on_reject BOOLEAN DEFAULT TRUE,
    notify_on_expire BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE AND CONSTRAINTS
-- ============================================================================

-- UNIQUE CONSTRAINT VIA INDEX
-- Prevents duplicate pending requests for the same entity (when target_id is present)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_action 
ON pending_actions (target_entity, target_id, action_type) 
WHERE status = 'pending' AND target_id IS NOT NULL;

-- Partial index for pending actions (most common query)
CREATE INDEX IF NOT EXISTS idx_pending_actions_status_pending ON pending_actions(status, created_at DESC)
WHERE status = 'pending';

-- Index for employee's pending actions
CREATE INDEX IF NOT EXISTS idx_pending_actions_requested_by ON pending_actions(requested_by_id, created_at DESC);

-- Index for admin's reviewed actions
CREATE INDEX IF NOT EXISTS idx_pending_actions_reviewed_by ON pending_actions(reviewed_by_id, reviewed_at DESC)
WHERE reviewed_by_id IS NOT NULL;

-- Index for target entity lookups
CREATE INDEX IF NOT EXISTS idx_pending_actions_target ON pending_actions(target_entity, target_id);

-- Index for expired actions cleanup
CREATE INDEX IF NOT EXISTS idx_pending_actions_expires_at ON pending_actions(expires_at)
WHERE status = 'pending' AND expires_at IS NOT NULL;

-- Index for priority filtering
CREATE INDEX IF NOT EXISTS idx_pending_actions_priority ON pending_actions(priority, created_at DESC)
WHERE status = 'pending';

-- Index for related records
CREATE INDEX IF NOT EXISTS idx_pending_actions_related_client ON pending_actions(related_client_id)
WHERE related_client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pending_actions_related_lot ON pending_actions(related_lot_id)
WHERE related_lot_id IS NOT NULL;

-- Composite index for action type filtering
CREATE INDEX IF NOT EXISTS idx_pending_actions_action_type ON pending_actions(action_type, status, created_at DESC);

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

-- Trigger to automatically update updated_at timestamp on pending_actions
CREATE OR REPLACE FUNCTION update_pending_actions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pending_actions_updated_at ON pending_actions;
CREATE TRIGGER trigger_update_pending_actions_updated_at
    BEFORE UPDATE ON pending_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_pending_actions_updated_at();

-- Trigger to automatically update updated_at timestamp on approval_workflow_config
CREATE OR REPLACE FUNCTION update_approval_workflow_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_approval_workflow_config_updated_at ON approval_workflow_config;
CREATE TRIGGER trigger_update_approval_workflow_config_updated_at
    BEFORE UPDATE ON approval_workflow_config
    FOR EACH ROW
    EXECUTE FUNCTION update_approval_workflow_config_updated_at();

-- Trigger to set expires_at based on config when pending action is created
CREATE OR REPLACE FUNCTION set_pending_action_expiration()
RETURNS TRIGGER AS $$
DECLARE
    expiration_days INTEGER;
BEGIN
    -- Get expiration days from config
    SELECT awc.expiration_days INTO expiration_days
    FROM approval_workflow_config awc
    WHERE awc.action_type = NEW.action_type
    AND awc.is_active = TRUE;
    
    -- Set expires_at if config found
    IF expiration_days IS NOT NULL THEN
        NEW.expires_at = NEW.created_at + (expiration_days || ' days')::INTERVAL;
    ELSE
        -- Default to 7 days if no config
        NEW.expires_at = NEW.created_at + INTERVAL '7 days';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_pending_action_expiration ON pending_actions;
CREATE TRIGGER trigger_set_pending_action_expiration
    BEFORE INSERT ON pending_actions
    FOR EACH ROW
    EXECUTE FUNCTION set_pending_action_expiration();

-- ============================================================================
-- 5. DEFAULT CONFIGURATION DATA
-- ============================================================================

-- Insert default approval workflow configuration
INSERT INTO approval_workflow_config 
    (action_type, requires_approval, description, expiration_days, is_active) 
VALUES
    -- Lot Management (Requires Approval)
    ('lot_create', TRUE, 'Creating new lots via map editor', 7, TRUE),
    ('lot_update', TRUE, 'Updating lot details, status, or ownership', 7, TRUE),
    ('lot_delete', TRUE, 'Deleting lots from the system', 7, TRUE),
    
    -- Burial Management (Requires Approval)
    ('burial_create', TRUE, 'Assigning deceased person to a lot', 7, TRUE),
    ('burial_update', TRUE, 'Updating burial information', 7, TRUE),
    ('burial_delete', TRUE, 'Removing burial records', 7, TRUE),
    
    -- Payment Management (Requires Approval)
    ('payment_update', TRUE, 'Changing payment status (Paid, Under Payment, Overdue)', 7, TRUE),
    
    -- Client Management (Mixed)
    ('client_create', FALSE, 'Creating new client accounts (optional approval)', 7, TRUE),
    ('client_update', TRUE, 'Updating client information', 7, TRUE),
    ('client_delete', TRUE, 'Deleting client accounts', 7, TRUE),
    
    -- Map Management (Optional Approval)
    ('map_create', FALSE, 'Creating new cemetery maps (optional approval)', 7, TRUE)
ON CONFLICT (action_type) DO NOTHING;

-- ============================================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE pending_actions IS 'Stores all employee actions requiring admin approval before execution';
COMMENT ON TABLE approval_workflow_config IS 'Configuration table defining which actions require approval and workflow rules';

COMMENT ON COLUMN pending_actions.action_type IS 'Type of action being requested (lot_update, payment_update, etc.)';
COMMENT ON COLUMN pending_actions.change_data IS 'JSONB containing the new/updated data to be applied';
COMMENT ON COLUMN pending_actions.previous_data IS 'JSONB containing the original data before changes (for rollback)';
COMMENT ON COLUMN pending_actions.status IS 'Current approval status: pending, approved, rejected, cancelled, expired';
COMMENT ON COLUMN pending_actions.is_executed IS 'Whether the approved action has been executed';
COMMENT ON COLUMN pending_actions.execution_result IS 'JSONB containing the result of execution (success/error details)';
COMMENT ON COLUMN pending_actions.expires_at IS 'Automatic expiration date for pending actions';

COMMENT ON COLUMN approval_workflow_config.requires_approval IS 'Whether this action type requires admin approval';
COMMENT ON COLUMN approval_workflow_config.expiration_days IS 'Number of days before pending action auto-expires';
COMMENT ON COLUMN approval_workflow_config.auto_approve_conditions IS 'JSONB conditions for automatic approval (future use)';

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

-- Grant appropriate permissions (adjust based on your auth setup)
-- Note: You may need to adjust these based on your RLS policies

-- Employees can insert pending actions
GRANT SELECT, INSERT, UPDATE ON pending_actions TO authenticated;

-- Admins have full access to pending actions
-- (This will be further restricted by Row Level Security policies)

-- All authenticated users can read config
GRANT SELECT ON approval_workflow_config TO authenticated;

-- Only admins can modify config
-- (This will be enforced by Row Level Security policies)

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Migration 006 successfully applied
-- Added: pending_actions table
-- Added: approval_workflow_config table
-- Added: Indexes for performance
-- Added: Triggers for automation
-- Added: Default configuration data

-- Next Step: Apply Row Level Security policies (migration 007)
