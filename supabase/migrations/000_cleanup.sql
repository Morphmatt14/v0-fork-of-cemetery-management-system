-- ============================================================================
-- 🧹 COMPLETE FRESH START - CLEANUP SCRIPT
-- ============================================================================
-- Purpose: DROP ALL tables, functions, triggers, and policies
-- WARNING: This will DELETE ALL DATA in your database!
-- Use: Starting fresh after failed/partial migrations
-- ============================================================================

-- Disable RLS temporarily to ensure clean drop
ALTER TABLE IF EXISTS admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. DROP ALL TABLES (in reverse dependency order)
-- ============================================================================

-- System tables
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS password_reset_requests CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS pricing CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS news CASCADE;

-- Map tables
DROP TABLE IF EXISTS map_lot_positions CASCADE;
DROP TABLE IF EXISTS cemetery_maps CASCADE;

-- Service tables
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS inquiry_tags CASCADE;
DROP TABLE IF EXISTS inquiry_responses CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;

-- Payment tables
DROP TABLE IF EXISTS payment_history CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Cemetery tables
DROP TABLE IF EXISTS burials CASCADE;
DROP TABLE IF EXISTS client_lots CASCADE;
DROP TABLE IF EXISTS lots CASCADE;
DROP TABLE IF EXISTS cemetery_sections CASCADE;

-- User tables
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Legacy/old tables (if any exist)
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS admin_messages CASCADE;
DROP TABLE IF EXISTS client_inquiries CASCADE;

-- ============================================================================
-- 2. DROP ALL FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS soft_delete() CASCADE;
DROP FUNCTION IF EXISTS update_client_balance_on_payment() CASCADE;
DROP FUNCTION IF EXISTS create_notification_on_inquiry_assignment() CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS get_user_id() CASCADE;

-- ============================================================================
-- 3. DROP ALL POLICIES (if they exist independently)
-- ============================================================================

-- Note: Policies are dropped automatically with CASCADE on tables
-- But listing them here for documentation

-- ============================================================================
-- 4. VERIFY CLEAN STATE
-- ============================================================================

-- Check remaining tables in public schema
SELECT 
    '📋 Tables' as type,
    COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public';

-- List any remaining tables
SELECT 
    '⚠️ Remaining table: ' || tablename as warning
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check remaining functions
SELECT 
    '🔧 Functions' as type,
    COUNT(*) as count
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace;

-- ============================================================================
-- 5. CONFIRMATION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ DATABASE CLEANUP COMPLETE!';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Run: 001_create_core_tables.sql';
    RAISE NOTICE '   2. Run: 002_create_operational_tables.sql';
    RAISE NOTICE '   3. Run: 003_create_system_tables.sql';
    RAISE NOTICE '   4. Run: 004_row_level_security.sql';
END $$;

-- ============================================================================
-- END OF CLEANUP
-- ============================================================================
