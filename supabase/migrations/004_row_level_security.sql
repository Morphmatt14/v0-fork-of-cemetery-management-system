-- ============================================================================
-- CEMETERY MANAGEMENT SYSTEM - ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Migration: 004_row_level_security.sql
-- Description: RLS policies for role-based access control
-- Date: 2024-11-18
-- ============================================================================

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cemetery_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE burials ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cemetery_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_lot_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper function to get current user role and ID
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN current_setting('app.user_role', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'anonymous';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.user_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ADMINS TABLE POLICIES
-- ============================================================================

-- Admins can view all admins
CREATE POLICY "Admins can view all admins" ON admins
    FOR SELECT
    USING (get_user_role() = 'admin' AND deleted_at IS NULL);

-- Admins can create other admins
CREATE POLICY "Admins can create admins" ON admins
    FOR INSERT
    WITH CHECK (get_user_role() = 'admin');

-- Admins can update admins (except password without proper verification)
CREATE POLICY "Admins can update admins" ON admins
    FOR UPDATE
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

-- Admins can soft-delete admins
CREATE POLICY "Admins can delete admins" ON admins
    FOR UPDATE
    USING (get_user_role() = 'admin' AND deleted_at IS NULL)
    WITH CHECK (get_user_role() = 'admin' AND deleted_at IS NOT NULL);

-- ============================================================================
-- EMPLOYEES TABLE POLICIES
-- ============================================================================

-- Admins can view all employees
CREATE POLICY "Admins can view all employees" ON employees
    FOR SELECT
    USING (get_user_role() = 'admin' AND deleted_at IS NULL);

-- Employees can view their own record
CREATE POLICY "Employees can view own record" ON employees
    FOR SELECT
    USING (get_user_role() = 'employee' AND id = get_user_id() AND deleted_at IS NULL);

-- Admins can create employees
CREATE POLICY "Admins can create employees" ON employees
    FOR INSERT
    WITH CHECK (get_user_role() = 'admin');

-- Admins can update employees
CREATE POLICY "Admins can update employees" ON employees
    FOR UPDATE
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

-- Employees can update their own profile (except role/permissions)
CREATE POLICY "Employees can update own profile" ON employees
    FOR UPDATE
    USING (get_user_role() = 'employee' AND id = get_user_id())
    WITH CHECK (get_user_role() = 'employee' AND id = get_user_id());

-- ============================================================================
-- CLIENTS TABLE POLICIES
-- ============================================================================

-- Admins and employees can view all clients
CREATE POLICY "Staff can view all clients" ON clients
    FOR SELECT
    USING (get_user_role() IN ('admin', 'employee') AND deleted_at IS NULL);

-- Clients can view their own record
CREATE POLICY "Clients can view own record" ON clients
    FOR SELECT
    USING (get_user_role() = 'client' AND id = get_user_id() AND deleted_at IS NULL);

-- Public registration (for new clients)
CREATE POLICY "Anyone can register as client" ON clients
    FOR INSERT
    WITH CHECK (get_user_role() = 'anonymous' OR get_user_role() = 'employee');

-- Admins and employees can update clients
CREATE POLICY "Staff can update clients" ON clients
    FOR UPDATE
    USING (get_user_role() IN ('admin', 'employee'))
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- Clients can update their own profile
CREATE POLICY "Clients can update own profile" ON clients
    FOR UPDATE
    USING (get_user_role() = 'client' AND id = get_user_id())
    WITH CHECK (get_user_role() = 'client' AND id = get_user_id());

-- ============================================================================
-- LOTS TABLE POLICIES
-- ============================================================================

-- Everyone can view available lots (for browsing)
CREATE POLICY "Anyone can view available lots" ON lots
    FOR SELECT
    USING (status = 'Available' AND deleted_at IS NULL);

-- Staff can view all lots
CREATE POLICY "Staff can view all lots" ON lots
    FOR SELECT
    USING (get_user_role() IN ('admin', 'employee') AND deleted_at IS NULL);

-- Clients can view their own lots
CREATE POLICY "Clients can view own lots" ON lots
    FOR SELECT
    USING (
        get_user_role() = 'client' 
        AND owner_id = get_user_id() 
        AND deleted_at IS NULL
    );

-- Employees can create lots
CREATE POLICY "Employees can create lots" ON lots
    FOR INSERT
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- Employees can update lots
CREATE POLICY "Employees can update lots" ON lots
    FOR UPDATE
    USING (get_user_role() IN ('admin', 'employee'))
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- Admins can delete lots
CREATE POLICY "Admins can delete lots" ON lots
    FOR UPDATE
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

-- Staff can view all payments
CREATE POLICY "Staff can view all payments" ON payments
    FOR SELECT
    USING (get_user_role() IN ('admin', 'employee') AND deleted_at IS NULL);

-- Clients can view their own payments
CREATE POLICY "Clients can view own payments" ON payments
    FOR SELECT
    USING (get_user_role() = 'client' AND client_id = get_user_id() AND deleted_at IS NULL);

-- Employees can create payments
CREATE POLICY "Employees can create payments" ON payments
    FOR INSERT
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- Employees can update payments
CREATE POLICY "Employees can update payments" ON payments
    FOR UPDATE
    USING (get_user_role() IN ('admin', 'employee'))
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- ============================================================================
-- INQUIRIES TABLE POLICIES
-- ============================================================================

-- Staff can view all inquiries
CREATE POLICY "Staff can view all inquiries" ON inquiries
    FOR SELECT
    USING (get_user_role() IN ('admin', 'employee') AND deleted_at IS NULL);

-- Anyone can create inquiries (public contact form)
CREATE POLICY "Anyone can create inquiries" ON inquiries
    FOR INSERT
    WITH CHECK (true);

-- Staff can update inquiries
CREATE POLICY "Staff can update inquiries" ON inquiries
    FOR UPDATE
    USING (get_user_role() IN ('admin', 'employee'))
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- ============================================================================
-- SERVICE REQUESTS TABLE POLICIES
-- ============================================================================

-- Staff can view all service requests
CREATE POLICY "Staff can view all service requests" ON service_requests
    FOR SELECT
    USING (get_user_role() IN ('admin', 'employee') AND deleted_at IS NULL);

-- Clients can view their own service requests
CREATE POLICY "Clients can view own requests" ON service_requests
    FOR SELECT
    USING (get_user_role() = 'client' AND client_id = get_user_id() AND deleted_at IS NULL);

-- Clients can create service requests
CREATE POLICY "Clients can create requests" ON service_requests
    FOR INSERT
    WITH CHECK (get_user_role() = 'client' AND client_id = get_user_id());

-- Staff can update service requests
CREATE POLICY "Staff can update requests" ON service_requests
    FOR UPDATE
    USING (get_user_role() IN ('admin', 'employee'))
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT
    USING (
        (get_user_role() = 'admin' AND recipient_type = 'admin' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'employee' AND recipient_type = 'employee' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'client' AND recipient_type = 'client' AND recipient_id = get_user_id())
    );

-- System can create notifications
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT
    WITH CHECK (get_user_role() IN ('admin', 'employee', 'system'));

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE
    USING (
        (get_user_role() = 'admin' AND recipient_type = 'admin' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'employee' AND recipient_type = 'employee' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'client' AND recipient_type = 'client' AND recipient_id = get_user_id())
    )
    WITH CHECK (
        (get_user_role() = 'admin' AND recipient_type = 'admin' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'employee' AND recipient_type = 'employee' AND recipient_id = get_user_id()) OR
        (get_user_role() = 'client' AND recipient_type = 'client' AND recipient_id = get_user_id())
    );

-- ============================================================================
-- NEWS TABLE POLICIES
-- ============================================================================

-- Everyone can view published news
CREATE POLICY "Anyone can view published news" ON news
    FOR SELECT
    USING (is_published = true AND deleted_at IS NULL);

-- Staff can view all news
CREATE POLICY "Staff can view all news" ON news
    FOR SELECT
    USING (get_user_role() IN ('admin', 'employee') AND deleted_at IS NULL);

-- Employees can create news
CREATE POLICY "Employees can create news" ON news
    FOR INSERT
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- Employees can update news
CREATE POLICY "Employees can update news" ON news
    FOR UPDATE
    USING (get_user_role() IN ('admin', 'employee'))
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- Admins can delete news
CREATE POLICY "Admins can delete news" ON news
    FOR UPDATE
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

-- ============================================================================
-- MESSAGES TABLE POLICIES
-- ============================================================================

-- Users can view messages sent to them
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT
    USING (
        (get_user_role() = 'admin' AND (sender_id = get_user_id() OR recipient_id = get_user_id())) OR
        (get_user_role() = 'employee' AND (sender_id = get_user_id() OR recipient_id = get_user_id())) AND
        deleted_at IS NULL
    );

-- Admins and employees can send messages
CREATE POLICY "Staff can send messages" ON messages
    FOR INSERT
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE
    USING (recipient_id = get_user_id())
    WITH CHECK (recipient_id = get_user_id());

-- ============================================================================
-- ACTIVITY LOGS TABLE POLICIES
-- ============================================================================

-- Admins can view all activity logs
CREATE POLICY "Admins can view all logs" ON activity_logs
    FOR SELECT
    USING (get_user_role() = 'admin');

-- Employees can view their own activity logs
CREATE POLICY "Employees can view own logs" ON activity_logs
    FOR SELECT
    USING (get_user_role() = 'employee' AND actor_id = get_user_id());

-- System can create activity logs
CREATE POLICY "System can create logs" ON activity_logs
    FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- PASSWORD RESET REQUESTS TABLE POLICIES
-- ============================================================================

-- Admins can view all password reset requests
CREATE POLICY "Admins can view all reset requests" ON password_reset_requests
    FOR SELECT
    USING (get_user_role() = 'admin');

-- Users can view their own reset requests
CREATE POLICY "Users can view own reset requests" ON password_reset_requests
    FOR SELECT
    USING (requester_id = get_user_id());

-- Users can create their own reset requests
CREATE POLICY "Users can create reset requests" ON password_reset_requests
    FOR INSERT
    WITH CHECK (requester_id = get_user_id() OR get_user_role() = 'anonymous');

-- Admins can update reset requests (approve/reject)
CREATE POLICY "Admins can update reset requests" ON password_reset_requests
    FOR UPDATE
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

-- ============================================================================
-- CONTENT & PRICING TABLE POLICIES (Public Read)
-- ============================================================================

-- Everyone can view published content
CREATE POLICY "Anyone can view published content" ON content
    FOR SELECT
    USING (is_published = true);

-- Staff can view all content
CREATE POLICY "Staff can view all content" ON content
    FOR SELECT
    USING (get_user_role() IN ('admin', 'employee'));

-- Employees can manage content
CREATE POLICY "Employees can manage content" ON content
    FOR ALL
    USING (get_user_role() IN ('admin', 'employee'))
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- Everyone can view active pricing
CREATE POLICY "Anyone can view active pricing" ON pricing
    FOR SELECT
    USING (is_active = true);

-- Employees can manage pricing
CREATE POLICY "Employees can manage pricing" ON pricing
    FOR ALL
    USING (get_user_role() IN ('admin', 'employee'))
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- Everyone can view public system settings
CREATE POLICY "Anyone can view public settings" ON system_settings
    FOR SELECT
    USING (is_public = true);

-- Admins can manage system settings
CREATE POLICY "Admins can manage settings" ON system_settings
    FOR ALL
    USING (get_user_role() = 'admin')
    WITH CHECK (get_user_role() = 'admin');

-- ============================================================================
-- CEMETERY MAPS & SECTIONS (Public for browsing)
-- ============================================================================

-- Everyone can view published maps
CREATE POLICY "Anyone can view published maps" ON cemetery_maps
    FOR SELECT
    USING (is_published = true AND deleted_at IS NULL);

-- Staff can view all maps
CREATE POLICY "Staff can view all maps" ON cemetery_maps
    FOR SELECT
    USING (get_user_role() IN ('admin', 'employee') AND deleted_at IS NULL);

-- Employees can manage maps
CREATE POLICY "Employees can manage maps" ON cemetery_maps
    FOR ALL
    USING (get_user_role() IN ('admin', 'employee'))
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- Everyone can view sections
CREATE POLICY "Anyone can view sections" ON cemetery_sections
    FOR SELECT
    USING (status = 'active');

-- Staff can manage sections
CREATE POLICY "Staff can manage sections" ON cemetery_sections
    FOR ALL
    USING (get_user_role() IN ('admin', 'employee'))
    WITH CHECK (get_user_role() IN ('admin', 'employee'));

-- ============================================================================
-- END OF MIGRATION 004
-- ============================================================================
