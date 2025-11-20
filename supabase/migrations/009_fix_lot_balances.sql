-- ============================================================================
-- Migration: Fix Lot Balances
-- Description: Update lot balances to match price for lots that were assigned
--              without proper balance initialization
-- Date: 2024-11-21
-- Issue: When lots are assigned to clients, balance was not set to price,
--        causing lots to appear as "Fully Paid" when they haven't been paid
-- ============================================================================

BEGIN;

-- ============================================================================
-- 0. ADD BALANCE COLUMN TO LOTS TABLE (if not exists)
-- ============================================================================

-- Add balance column to lots table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lots' AND column_name = 'balance'
    ) THEN
        ALTER TABLE lots ADD COLUMN balance DECIMAL(12,2) DEFAULT 0;
        RAISE NOTICE '✅ Added balance column to lots table';
    ELSE
        RAISE NOTICE 'ℹ️ Balance column already exists in lots table';
    END IF;
END $$;

-- ============================================================================
-- 1. FIX EXISTING LOTS WITH INCORRECT BALANCES
-- ============================================================================

-- Update lots that have an owner but balance is 0 or NULL
-- Set balance = price for these lots (they should owe the full amount)
UPDATE lots
SET 
    balance = COALESCE(price, 0),
    updated_at = CURRENT_TIMESTAMP
WHERE 
    owner_id IS NOT NULL  -- Lot is assigned to a client
    AND (balance IS NULL OR balance = 0)  -- Balance is not set
    AND price > 0  -- Lot has a price
    AND status IN ('Reserved', 'Occupied');  -- Only for assigned lots

-- ============================================================================
-- 2. UPDATE CLIENT BALANCES TO MATCH LOT BALANCES
-- ============================================================================

-- Recalculate client balances based on sum of their lot balances
UPDATE clients c
SET 
    balance = COALESCE((
        SELECT SUM(l.balance)
        FROM lots l
        WHERE l.owner_id = c.id
        AND l.balance IS NOT NULL
    ), 0),
    updated_at = CURRENT_TIMESTAMP
WHERE EXISTS (
    SELECT 1
    FROM lots l
    WHERE l.owner_id = c.id
);

-- ============================================================================
-- 3. VERIFICATION QUERIES (for logging)
-- ============================================================================

-- Show lots that were updated
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM lots
    WHERE 
        owner_id IS NOT NULL
        AND balance > 0
        AND status IN ('Reserved', 'Occupied');
    
    RAISE NOTICE '✅ Updated % lots with correct balances', updated_count;
END $$;

-- Show client balances that were updated
DO $$
DECLARE
    client_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO client_count
    FROM clients
    WHERE balance > 0;
    
    RAISE NOTICE '✅ Updated balances for % clients', client_count;
END $$;

COMMIT;

-- ============================================================================
-- 4. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN lots.balance IS 
'Outstanding balance for the lot. Initialized to price when assigned to client. 
Reduced by payment trigger when payment_status = Completed.';

-- ============================================================================
-- 5. TRIGGER TO AUTO-SET BALANCE ON LOT ASSIGNMENT (Future assignments)
-- ============================================================================

-- Create or replace function to set balance when lot is assigned
CREATE OR REPLACE FUNCTION set_initial_lot_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- If owner_id is being set (lot is being assigned)
    -- AND balance is not explicitly provided
    -- THEN set balance to price
    IF NEW.owner_id IS NOT NULL 
       AND OLD.owner_id IS NULL 
       AND (NEW.balance IS NULL OR NEW.balance = 0)
       AND NEW.price > 0 THEN
        NEW.balance := NEW.price;
        RAISE NOTICE 'Auto-set lot balance to price: %', NEW.price;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_initial_lot_balance ON lots;

-- Create trigger to run before update
CREATE TRIGGER trigger_set_initial_lot_balance
    BEFORE UPDATE ON lots
    FOR EACH ROW
    EXECUTE FUNCTION set_initial_lot_balance();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Query to verify the fix
SELECT 
    'Lots with correct balances:' as description,
    COUNT(*) as count,
    SUM(balance) as total_balance
FROM lots
WHERE owner_id IS NOT NULL AND balance > 0;

SELECT 
    'Clients with correct balances:' as description,
    COUNT(*) as count,
    SUM(balance) as total_balance
FROM clients
WHERE balance > 0;
