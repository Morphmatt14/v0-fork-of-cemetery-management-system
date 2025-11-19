-- ============================================================================
-- CEMETERY MANAGEMENT SYSTEM - SYSTEM TABLES
-- ============================================================================
-- Migration: 003_create_system_tables.sql
-- Description: Maps, news, messages, activity logs, and content management
-- Date: 2024-11-18
-- ============================================================================

-- ============================================================================
-- 1. CEMETERY MAPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cemetery_maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    section_id UUID REFERENCES cemetery_sections(id) ON DELETE SET NULL,
    
    -- Map image
    image_url TEXT,
    image_public_id VARCHAR(255),  -- For Cloudinary or similar
    
    -- Map dimensions
    width INTEGER,
    height INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    is_published BOOLEAN DEFAULT false,
    
    -- Metadata
    description TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    -- Audit fields
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Map Lot Positions (for interactive map display)
CREATE TABLE IF NOT EXISTS map_lot_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    map_id UUID NOT NULL REFERENCES cemetery_maps(id) ON DELETE CASCADE,
    lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
    
    -- Position on map (pixels or percentage)
    x_position DECIMAL(10,2) NOT NULL,
    y_position DECIMAL(10,2) NOT NULL,
    width DECIMAL(10,2) DEFAULT 50,
    height DECIMAL(10,2) DEFAULT 50,
    
    -- Display properties
    rotation DECIMAL(5,2) DEFAULT 0,
    color VARCHAR(50),
    label VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(map_id, lot_id)
);

-- Add foreign key to lots table for map_id
ALTER TABLE lots ADD CONSTRAINT fk_lots_map_id 
    FOREIGN KEY (map_id) REFERENCES cemetery_maps(id) ON DELETE SET NULL;

-- ============================================================================
-- 2. NEWS & ANNOUNCEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- News content
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt VARCHAR(1000),
    
    -- Categorization
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'Announcement', 'Event', 'Update', 'Maintenance', 
        'Holiday', 'Policy', 'Memorial', 'General'
    )),
    tags VARCHAR(255),  -- Comma-separated tags
    
    -- Priority and visibility
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_published BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Target audience
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'clients', 'employees', 'public')),
    
    -- Media
    image_url TEXT,
    attachments JSONB,  -- Array of attachment URLs/metadata
    
    -- Display dates
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- View tracking
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    -- Audit fields
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- ============================================================================
-- 3. MESSAGES & INTERNAL COMMUNICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Sender and recipient
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('admin', 'employee', 'system')),
    sender_id UUID NOT NULL,
    sender_name VARCHAR(255),
    
    recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('admin', 'employee', 'specific')),
    recipient_id UUID,  -- NULL if broadcast to all
    recipient_name VARCHAR(255),
    
    -- Message content
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    
    -- Message type and priority
    message_type VARCHAR(100) CHECK (message_type IN (
        'report_request', 'issue', 'general', 'reply', 
        'notification', 'announcement', 'approval_request'
    )),
    priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
    
    -- Reply chain
    parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    thread_id UUID,  -- To group related messages
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Attachments
    attachments JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Audit fields
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- ============================================================================
-- 4. ACTIVITY LOGS & AUDIT TRAIL
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Actor information
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('admin', 'employee', 'client', 'system')),
    actor_id UUID,
    actor_username VARCHAR(255),
    
    -- Action details
    action VARCHAR(255) NOT NULL,
    details TEXT,
    
    -- Categorization
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'auth', 'payment', 'client', 'lot', 'map', 'inquiry', 
        'burial', 'system', 'news', 'password', 'user_management'
    )),
    
    -- Status and importance
    status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'warning', 'info')),
    severity VARCHAR(50) DEFAULT 'normal' CHECK (severity IN ('low', 'normal', 'high', 'critical')),
    
    -- Affected resources
    affected_resources JSONB,  -- Array of {type, id, name}
    
    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a partition-like structure for old activity logs (optional optimization)
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX idx_activity_logs_actor ON activity_logs(actor_id, actor_type);
CREATE INDEX idx_activity_logs_category ON activity_logs(category);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- ============================================================================
-- 5. PASSWORD RESET REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Requester information
    requester_type VARCHAR(50) NOT NULL CHECK (requester_type IN ('admin', 'employee', 'client')),
    requester_id UUID NOT NULL,
    requester_username VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255),
    
    -- Request details
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    reason TEXT,
    
    -- New password (encrypted, only if approved)
    new_password_hash VARCHAR(255),
    
    -- Resolution
    resolved_by UUID REFERENCES admins(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Token for reset link (if using email reset)
    reset_token VARCHAR(255) UNIQUE,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- ============================================================================
-- 6. CONTENT MANAGEMENT (Homepage, Services, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Content identification
    category VARCHAR(100) NOT NULL CHECK (category IN ('homepage', 'services', 'about', 'contact', 'faq', 'terms', 'privacy', 'custom')),
    section VARCHAR(100) NOT NULL,  -- e.g., 'hero', 'features', 'testimonials'
    key VARCHAR(100) NOT NULL,      -- e.g., 'title', 'description', 'image_url'
    
    -- Content value (flexible storage)
    value TEXT,
    value_type VARCHAR(50) DEFAULT 'text' CHECK (value_type IN ('text', 'html', 'markdown', 'url', 'json', 'number')),
    
    -- Organization
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    UNIQUE(category, section, key)
);

-- ============================================================================
-- 7. PRICING
-- ============================================================================

CREATE TABLE IF NOT EXISTS pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Pricing details
    lot_type VARCHAR(50) NOT NULL UNIQUE CHECK (lot_type IN ('Standard', 'Premium', 'Family', 'Lawn', 'Garden')),
    price DECIMAL(12,2) NOT NULL,
    
    -- Description and features
    description TEXT,
    features JSONB,  -- Array of feature strings
    
    -- Display
    display_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    -- Price history (for tracking)
    previous_price DECIMAL(12,2),
    price_changed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- ============================================================================
-- 8. SYSTEM SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    value_type VARCHAR(50) DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    category VARCHAR(100) DEFAULT 'general' CHECK (category IN ('general', 'email', 'payment', 'notification', 'security', 'appearance')),
    is_public BOOLEAN DEFAULT false,  -- Can clients see this setting?
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- ============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Maps indexes
CREATE INDEX idx_cemetery_maps_section ON cemetery_maps(section_id);
CREATE INDEX idx_cemetery_maps_status ON cemetery_maps(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_map_lot_positions_map ON map_lot_positions(map_id);
CREATE INDEX idx_map_lot_positions_lot ON map_lot_positions(lot_id);

-- News indexes
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_published ON news(is_published, published_at DESC);
CREATE INDEX idx_news_featured ON news(is_featured) WHERE is_featured = true;
CREATE INDEX idx_news_expires ON news(expires_at) WHERE expires_at IS NOT NULL;

-- Messages indexes
CREATE INDEX idx_messages_sender ON messages(sender_type, sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_type, recipient_id);
CREATE INDEX idx_messages_unread ON messages(recipient_id) WHERE is_read = false;
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_parent ON messages(parent_message_id);

-- Password reset requests indexes
CREATE INDEX idx_password_reset_requester ON password_reset_requests(requester_type, requester_id);
CREATE INDEX idx_password_reset_status ON password_reset_requests(status);
CREATE INDEX idx_password_reset_token ON password_reset_requests(reset_token) WHERE reset_token IS NOT NULL;

-- Content indexes
CREATE INDEX idx_content_category ON content(category, section);
CREATE INDEX idx_content_published ON content(is_published) WHERE is_published = true;

-- Pricing indexes
CREATE INDEX idx_pricing_active ON pricing(is_active) WHERE is_active = true;
CREATE INDEX idx_pricing_type ON pricing(lot_type);

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

-- Apply updated_at triggers
CREATE TRIGGER update_cemetery_maps_updated_at BEFORE UPDATE ON cemetery_maps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_map_lot_positions_updated_at BEFORE UPDATE ON map_lot_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. INITIAL DATA
-- ============================================================================

-- Insert default pricing
INSERT INTO pricing (lot_type, price, description, display_name, features, is_active, sort_order)
VALUES 
    ('Standard', 75000.00, 'Standard burial lot with basic features', 'Standard Lot', 
     '["Concrete headstone", "Garden border", "Basic maintenance"]'::jsonb, true, 1),
    ('Premium', 120000.00, 'Premium lot with enhanced features', 'Premium Lot',
     '["Marble headstone", "Landscaped garden", "Memorial bench", "Priority maintenance"]'::jsonb, true, 2),
    ('Family', 200000.00, 'Spacious family lot for multiple burials', 'Family Lot',
     '["Family monument", "Landscaped area", "Multiple burial spaces", "Private section"]'::jsonb, true, 3)
ON CONFLICT (lot_type) DO UPDATE SET
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    features = EXCLUDED.features;

-- Insert default system settings
INSERT INTO system_settings (key, value, value_type, description, category)
VALUES 
    ('site_name', 'Surigao Memorial Park Inc.', 'string', 'Name of the cemetery', 'general'),
    ('site_email', 'info@smpi.com', 'string', 'Contact email', 'general'),
    ('site_phone', '+63 123 456 7890', 'string', 'Contact phone number', 'general'),
    ('allow_online_payments', 'true', 'boolean', 'Enable online payment processing', 'payment'),
    ('payment_due_days', '30', 'number', 'Days until payment is due', 'payment'),
    ('enable_notifications', 'true', 'boolean', 'Enable system notifications', 'notification')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- END OF MIGRATION 003
-- ============================================================================
