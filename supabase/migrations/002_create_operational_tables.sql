-- ============================================================================
-- CEMETERY MANAGEMENT SYSTEM - OPERATIONAL TABLES
-- ============================================================================
-- Migration: 002_create_operational_tables.sql
-- Description: Payments, inquiries, notifications, and service requests
-- Date: 2024-11-18
-- ============================================================================

-- ============================================================================
-- 1. PAYMENTS & TRANSACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES lots(id) ON DELETE SET NULL,
    
    -- Payment details
    amount DECIMAL(12,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('Full Payment', 'Down Payment', 'Installment', 'Partial Payment')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Check', 'Online Payment')),
    payment_status VARCHAR(50) DEFAULT 'Pending' CHECK (payment_status IN ('Completed', 'Pending', 'Overdue', 'Cancelled', 'Refunded')),
    
    -- Transaction details
    reference_number VARCHAR(100) UNIQUE,
    payment_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Stripe integration
    stripe_payment_intent_id VARCHAR(255),
    stripe_payment_status VARCHAR(50),
    
    -- Notes and metadata
    notes TEXT,
    receipt_url TEXT,
    
    -- Processing
    processed_by UUID,  -- Employee who processed
    approved_by UUID REFERENCES admins(id),  -- Admin who approved
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Audit fields
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Payment History (for tracking all payment events)
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. INQUIRIES & REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Contact information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    
    -- Inquiry details
    inquiry_type VARCHAR(100) NOT NULL CHECK (inquiry_type IN (
        'Lot Availability', 'Payment Plans', 'Maintenance', 'Documentation', 
        'General Information', 'Complaint', 'Burial Service', 'Other'
    )),
    subject VARCHAR(500),
    message TEXT NOT NULL,
    
    -- Status and priority
    status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Resolved', 'Closed', 'Pending')),
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Source and preferences
    source VARCHAR(100) CHECK (source IN (
        'Website Contact Form', 'Phone Call', 'Email', 'In-Person Visit', 
        'Website Chat', 'Social Media', 'Walk-in'
    )),
    preferred_contact_method VARCHAR(50) CHECK (preferred_contact_method IN ('Email', 'Phone', 'SMS')),
    
    -- Additional information
    budget VARCHAR(100),
    timeline VARCHAR(100),
    
    -- Assignment and follow-up
    assigned_to UUID,  -- Employee assigned
    assigned_by UUID REFERENCES admins(id),
    follow_up_date DATE,
    resolved_date DATE,
    resolved_by UUID,
    
    -- Related lot if applicable
    related_lot_id UUID REFERENCES lots(id) ON DELETE SET NULL,
    
    -- Timestamps
    inquiry_date DATE DEFAULT CURRENT_DATE,
    inquiry_time TIME DEFAULT CURRENT_TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Audit fields
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Inquiry Responses
CREATE TABLE IF NOT EXISTS inquiry_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    respondent_name VARCHAR(255) NOT NULL,
    respondent_id UUID,  -- Employee or admin who responded
    message TEXT NOT NULL,
    response_method VARCHAR(50) CHECK (response_method IN ('Email', 'Phone', 'SMS', 'In-Person')),
    response_date DATE DEFAULT CURRENT_DATE,
    response_time TIME DEFAULT CURRENT_TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inquiry Tags (many-to-many)
CREATE TABLE IF NOT EXISTS inquiry_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(inquiry_id, tag)
);

-- ============================================================================
-- 3. SERVICE REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES lots(id) ON DELETE SET NULL,
    
    -- Request details
    request_type VARCHAR(100) NOT NULL CHECK (request_type IN (
        'Lot Maintenance', 'Documentation Request', 'Headstone Repair', 
        'Landscaping', 'Certificate Request', 'Transfer Request', 'Other'
    )),
    subject VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
    
    -- Assignment
    assigned_to UUID,  -- Employee assigned
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Completion
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID,
    
    -- Notes
    notes TEXT,
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Audit fields
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- ============================================================================
-- 4. NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Recipient (can be client, employee, or admin)
    recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('client', 'employee', 'admin')),
    recipient_id UUID NOT NULL,
    
    -- Notification details
    notification_type VARCHAR(100) NOT NULL CHECK (notification_type IN (
        'payment', 'maintenance', 'announcement', 'reminder', 
        'inquiry', 'service_request', 'system', 'alert'
    )),
    title VARCHAR(500),
    message TEXT NOT NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Related entities
    related_payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    related_inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
    related_service_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
    related_lot_id UUID REFERENCES lots(id) ON DELETE SET NULL,
    
    -- Priority
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Expiry
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. APPOINTMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES lots(id) ON DELETE SET NULL,
    
    -- Appointment details
    appointment_type VARCHAR(100) NOT NULL CHECK (appointment_type IN (
        'Lot Visit', 'Consultation', 'Payment', 'Documentation', 
        'Burial Arrangement', 'Other'
    )),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    
    -- Status
    status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN (
        'Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-Show', 'Rescheduled'
    )),
    
    -- Assignment
    assigned_to UUID,  -- Employee handling the appointment
    
    -- Details
    notes TEXT,
    cancellation_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- ============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Payments indexes
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_lot ON payments(lot_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_reference ON payments(reference_number);
CREATE INDEX idx_payments_overdue ON payments(due_date) WHERE payment_status IN ('Pending', 'Overdue');

-- Inquiries indexes
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_priority ON inquiries(priority);
CREATE INDEX idx_inquiries_assigned_to ON inquiries(assigned_to);
CREATE INDEX idx_inquiries_date ON inquiries(inquiry_date);
CREATE INDEX idx_inquiries_email ON inquiries(email);
CREATE INDEX idx_inquiries_type ON inquiries(inquiry_type);

-- Service Requests indexes
CREATE INDEX idx_service_requests_client ON service_requests(client_id);
CREATE INDEX idx_service_requests_lot ON service_requests(lot_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_assigned ON service_requests(assigned_to);

-- Notifications indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Appointments indexes
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_assigned ON appointments(assigned_to);

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Update client balance when payment is made
CREATE OR REPLACE FUNCTION update_client_balance_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.payment_status = 'Completed' THEN
        UPDATE clients
        SET balance = GREATEST(balance - NEW.amount, 0)
        WHERE id = NEW.client_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.payment_status = 'Completed' AND OLD.payment_status != 'Completed' THEN
        UPDATE clients
        SET balance = GREATEST(balance - NEW.amount, 0)
        WHERE id = NEW.client_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.payment_status = 'Refunded' AND OLD.payment_status = 'Completed' THEN
        UPDATE clients
        SET balance = balance + NEW.amount
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_client_balance
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_client_balance_on_payment();

-- Create notification when inquiry is assigned
CREATE OR REPLACE FUNCTION create_notification_on_inquiry_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
        INSERT INTO notifications (
            recipient_type,
            recipient_id,
            notification_type,
            title,
            message,
            related_inquiry_id,
            priority
        ) VALUES (
            'employee',
            NEW.assigned_to,
            'inquiry',
            'New Inquiry Assigned',
            'You have been assigned a new inquiry: ' || NEW.subject,
            NEW.id,
            NEW.priority
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_inquiry_assignment_notification
AFTER INSERT OR UPDATE ON inquiries
FOR EACH ROW
EXECUTE FUNCTION create_notification_on_inquiry_assignment();

-- Apply updated_at triggers
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF MIGRATION 002
-- ============================================================================
