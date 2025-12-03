-- ============================================================================
-- CEMETERY MANAGEMENT SYSTEM - CASHIER RLS UPDATES
-- ============================================================================
-- Migration: 011_update_cashier_rls.sql
-- Description: Extend RLS policies to support cashier role permissions
-- Date: 2025-11-21
-- ============================================================================

BEGIN;

-- Employees table: allow cashiers to view/update their own records
DROP POLICY IF EXISTS "Employees can view own record" ON employees;
CREATE POLICY "Employees can view own record" ON employees
    FOR SELECT
    USING (
        get_user_role() IN ('employee', 'cashier')
        AND id = get_user_id()
        AND deleted_at IS NULL
    );

DROP POLICY IF EXISTS "Employees can update own profile" ON employees;
CREATE POLICY "Employees can update own profile" ON employees
    FOR UPDATE
    USING (
        get_user_role() IN ('employee', 'cashier')
        AND id = get_user_id()
    )
    WITH CHECK (
        get_user_role() IN ('employee', 'cashier')
        AND id = get_user_id()
    );

-- Clients: allow cashiers read-only access
DROP POLICY IF EXISTS "Staff can view all clients" ON clients;
CREATE POLICY "Staff can view all clients" ON clients
    FOR SELECT
    USING (
        get_user_role() IN ('admin', 'employee', 'cashier')
        AND deleted_at IS NULL
    );

-- Lots: allow cashiers read-only access
DROP POLICY IF EXISTS "Staff can view all lots" ON lots;
CREATE POLICY "Staff can view all lots" ON lots
    FOR SELECT
    USING (
        get_user_role() IN ('admin', 'employee', 'cashier')
        AND deleted_at IS NULL
    );

-- Payments access for cashiers
DROP POLICY IF EXISTS "Staff can view all payments" ON payments;
CREATE POLICY "Staff can view all payments" ON payments
    FOR SELECT
    USING (
        get_user_role() IN ('admin', 'employee', 'cashier')
        AND deleted_at IS NULL
    );

DROP POLICY IF EXISTS "Employees can create payments" ON payments;
CREATE POLICY "Employees can create payments" ON payments
    FOR INSERT
    WITH CHECK (get_user_role() IN ('admin', 'employee', 'cashier'));

DROP POLICY IF EXISTS "Employees can update payments" ON payments;
CREATE POLICY "Employees can update payments" ON payments
    FOR UPDATE
    USING (get_user_role() IN ('admin', 'employee', 'cashier'))
    WITH CHECK (get_user_role() IN ('admin', 'employee', 'cashier'));

-- Payment history visibility for cashiers
DROP POLICY IF EXISTS "Employees can view payment history" ON payment_history;
CREATE POLICY "Employees can view payment history" ON payment_history
    FOR SELECT
    USING (get_user_role() IN ('admin', 'employee', 'cashier'));

-- Notifications: include cashier recipient type
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT
    USING (
        (get_user_role() = 'admin' AND recipient_type = 'admin' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'employee' AND recipient_type = 'employee' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'cashier' AND recipient_type = 'cashier' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'client' AND recipient_type = 'client' AND recipient_id = get_user_id())
    );

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE
    USING (
        (get_user_role() = 'admin' AND recipient_type = 'admin' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'employee' AND recipient_type = 'employee' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'cashier' AND recipient_type = 'cashier' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'client' AND recipient_type = 'client' AND recipient_id = get_user_id())
    )
    WITH CHECK (
        (get_user_role() = 'admin' AND recipient_type = 'admin' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'employee' AND recipient_type = 'employee' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'cashier' AND recipient_type = 'cashier' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'client' AND recipient_type = 'client' AND recipient_id = get_user_id())
    );

COMMIT;
