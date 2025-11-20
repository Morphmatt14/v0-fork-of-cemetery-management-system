-- ============================================================================
-- Migration: Update Approval Workflow Configuration
-- Description: Set approval requirements to match business requirement
--              Only payment_update should require admin approval
-- Date: 2024-11-21
-- Author: System Configuration
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. UPDATE APPROVAL REQUIREMENTS
-- ============================================================================

-- Disable approval for lot management operations
UPDATE approval_workflow_config 
SET 
    requires_approval = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE action_type IN ('lot_create', 'lot_update', 'lot_delete');

-- Disable approval for burial management operations
UPDATE approval_workflow_config 
SET 
    requires_approval = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE action_type IN ('burial_create', 'burial_update', 'burial_delete');

-- Disable approval for client management operations
UPDATE approval_workflow_config 
SET 
    requires_approval = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE action_type IN ('client_update', 'client_delete');

-- Ensure payment_update STILL requires approval (this is the only one)
UPDATE approval_workflow_config 
SET 
    requires_approval = TRUE,
    description = 'Changing payment status (Paid, Under Payment, Overdue) - REQUIRES ADMIN APPROVAL',
    updated_at = CURRENT_TIMESTAMP
WHERE action_type = 'payment_update';

-- ============================================================================
-- 2. VERIFY CONFIGURATION
-- ============================================================================

-- This query should show only payment_update as TRUE
DO $$
DECLARE
    approval_count INTEGER;
    action_name TEXT;
BEGIN
    -- Count how many actions require approval
    SELECT COUNT(*) INTO approval_count
    FROM approval_workflow_config
    WHERE requires_approval = TRUE;
    
    -- Get the action that requires approval
    SELECT action_type INTO action_name
    FROM approval_workflow_config
    WHERE requires_approval = TRUE
    LIMIT 1;
    
    -- Validate configuration
    IF approval_count != 1 THEN
        RAISE EXCEPTION 'Configuration error: Expected only 1 action to require approval, found %', approval_count;
    END IF;
    
    IF action_name != 'payment_update' THEN
        RAISE EXCEPTION 'Configuration error: Expected payment_update to require approval, found % instead', action_name;
    END IF;
    
    RAISE NOTICE '✅ Configuration validated successfully';
    RAISE NOTICE '✅ Only payment_update requires approval';
    RAISE NOTICE '✅ All other actions execute immediately';
END $$;

COMMIT;

-- ============================================================================
-- 3. DISPLAY UPDATED CONFIGURATION
-- ============================================================================

-- Show the updated configuration
SELECT 
    action_type,
    requires_approval,
    CASE 
        WHEN requires_approval THEN '⚠️ REQUIRES APPROVAL'
        ELSE '✅ AUTO-EXECUTE'
    END as behavior,
    description,
    expiration_days,
    is_active
FROM approval_workflow_config
ORDER BY requires_approval DESC, action_type;

-- ============================================================================
-- 4. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE approval_workflow_config IS 
'Controls which employee actions require admin approval. 
Current policy (as of 2024-11-21): Only payment_update requires approval. 
All other operations (lots, burials, clients, maps) execute immediately without approval.';
