-- ============================================================================
-- CEMETERY MANAGEMENT SYSTEM - AUTHENTICATION BYPASS POLICIES
-- ============================================================================
-- Migration: 005_auth_bypass_policies.sql
-- Description: Allow service role to query users for authentication
-- Date: 2024-11-18
-- ============================================================================

-- ============================================================================
-- DROP EXISTING RESTRICTIVE SELECT POLICIES FOR AUTH
-- ============================================================================

-- Drop the restrictive admin select policy
DROP POLICY IF EXISTS "Admins can view all admins" ON admins;

-- Drop the restrictive employee select policies
DROP POLICY IF EXISTS "Admins can view all employees" ON employees;
DROP POLICY IF EXISTS "Employees can view own record" ON employees;

-- Drop the restrictive client select policies  
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Employees can view all clients" ON clients;
DROP POLICY IF EXISTS "Clients can view own record" ON clients;

-- ============================================================================
-- CREATE NEW SELECT POLICIES WITH SERVICE ROLE BYPASS
-- ============================================================================

-- Allow service role (used by API routes) to query admins for authentication
-- Also allow admins to view all admins once authenticated
CREATE POLICY "Service role and admins can view admins" ON admins
    FOR SELECT
    USING (
        -- Allow if no role is set (service role bypass for auth)
        get_user_role() IS NULL OR 
        get_user_role() = 'anonymous' OR
        -- Allow if user is an admin
        (get_user_role() = 'admin' AND deleted_at IS NULL)
    );

-- Allow service role and admins to query employees for authentication
-- Also allow employees to view their own record
CREATE POLICY "Service role and admins can view employees" ON employees
    FOR SELECT
    USING (
        -- Allow if no role is set (service role bypass for auth)
        get_user_role() IS NULL OR 
        get_user_role() = 'anonymous' OR
        -- Allow if user is an admin
        (get_user_role() = 'admin' AND deleted_at IS NULL) OR
        -- Allow employees to view their own record
        (get_user_role() = 'employee' AND id = get_user_id() AND deleted_at IS NULL)
    );

-- Allow service role and authenticated users to query clients
CREATE POLICY "Service role and authenticated users can view clients" ON clients
    FOR SELECT
    USING (
        -- Allow if no role is set (service role bypass for auth)
        get_user_role() IS NULL OR 
        get_user_role() = 'anonymous' OR
        -- Allow admins to view all clients
        (get_user_role() = 'admin' AND deleted_at IS NULL) OR
        -- Allow employees to view all clients
        (get_user_role() = 'employee' AND deleted_at IS NULL) OR
        -- Allow clients to view their own record
        (get_user_role() = 'client' AND id = get_user_id() AND deleted_at IS NULL)
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Service role and admins can view admins" ON admins IS 
'Allows service role (no user context) to query for authentication, and admins to view all admins';

COMMENT ON POLICY "Service role and admins can view employees" ON employees IS 
'Allows service role (no user context) to query for authentication, admins to view all, and employees to view own record';

COMMENT ON POLICY "Service role and authenticated users can view clients" ON clients IS 
'Allows service role (no user context) to query for authentication, and authenticated users to view clients';
