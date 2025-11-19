-- ============================================================================
-- CEMETERY MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Migration: 001_create_core_tables.sql
-- Description: Core tables for users, lots, clients, and authentication
-- Date: 2024-11-18
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS & AUTHENTICATION TABLES
-- ============================================================================

-- Admins (System Administrators - formerly Super Admin)
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES admins(id),
    
    -- Audit fields
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES admins(id)
);

-- Employees (Operational Staff - formerly Admin)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES admins(id),
    
    -- Audit fields
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES admins(id)
);

-- Clients (Lot Owners)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    
    -- Status and metadata
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    balance DECIMAL(12,2) DEFAULT 0.00,
    join_date DATE DEFAULT CURRENT_DATE,
    
    -- Emergency contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    
    -- Notes and preferences
    notes TEXT,
    preferred_contact_method VARCHAR(50) CHECK (preferred_contact_method IN ('email', 'phone', 'sms', NULL)),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- ============================================================================
-- 2. CEMETERY LOT MANAGEMENT
-- ============================================================================

-- Cemetery Sections
CREATE TABLE IF NOT EXISTS cemetery_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    total_capacity INTEGER,
    available_capacity INTEGER,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lots (Cemetery Plots)
CREATE TABLE IF NOT EXISTS lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_number VARCHAR(50) UNIQUE NOT NULL,  -- e.g., "A-001", "B-456"
    section_id UUID REFERENCES cemetery_sections(id) ON DELETE RESTRICT,
    
    -- Lot details
    lot_type VARCHAR(50) NOT NULL CHECK (lot_type IN ('Standard', 'Premium', 'Family')),
    status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Occupied', 'Maintenance')),
    price DECIMAL(12,2) NOT NULL,
    dimensions VARCHAR(100),  -- e.g., "2m x 1m"
    
    -- Ownership
    owner_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    occupant_name VARCHAR(255),  -- Name of deceased if occupied
    
    -- Features and description
    features TEXT,
    description TEXT,
    
    -- Map association
    map_id UUID,  -- Will create foreign key in maps migration
    map_position JSONB,  -- Store {x, y, width, height} for map display
    
    -- Important dates
    date_added DATE DEFAULT CURRENT_DATE,
    date_reserved DATE,
    date_occupied DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    -- Audit fields
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- Client-Lot Association (many-to-many)
CREATE TABLE IF NOT EXISTS client_lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
    purchase_date DATE DEFAULT CURRENT_DATE,
    purchase_price DECIMAL(12,2),
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(client_id, lot_id)
);

-- ============================================================================
-- 3. BURIAL RECORDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS burials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE RESTRICT,
    
    -- Deceased information
    deceased_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    date_of_death DATE,
    age INTEGER,
    cause_of_death VARCHAR(255),
    
    -- Burial details
    burial_date DATE NOT NULL,
    burial_time TIME,
    
    -- Family and funeral
    family_name VARCHAR(255),
    funeral_home VARCHAR(255),
    funeral_location VARCHAR(255),
    
    -- Ceremony details
    attendees_count INTEGER,
    ceremony_type VARCHAR(100),
    
    -- Additional information
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    -- Audit fields
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID
);

-- ============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Admins indexes
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status) WHERE deleted_at IS NULL;

-- Employees indexes
CREATE INDEX IF NOT EXISTS idx_employees_username ON employees(username);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status) WHERE deleted_at IS NULL;

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clients_balance ON clients(balance) WHERE balance > 0;

-- Lots indexes
CREATE INDEX IF NOT EXISTS idx_lots_lot_number ON lots(lot_number);
CREATE INDEX IF NOT EXISTS idx_lots_section ON lots(section_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lots_owner ON lots(owner_id);
CREATE INDEX IF NOT EXISTS idx_lots_type ON lots(lot_type);
CREATE INDEX IF NOT EXISTS idx_lots_available ON lots(status) WHERE status = 'Available' AND deleted_at IS NULL;

-- Burials indexes
CREATE INDEX IF NOT EXISTS idx_burials_lot ON burials(lot_id);
CREATE INDEX IF NOT EXISTS idx_burials_date ON burials(burial_date);
CREATE INDEX IF NOT EXISTS idx_burials_deceased_name ON burials(deceased_name);

-- Client-Lots indexes
CREATE INDEX IF NOT EXISTS idx_client_lots_client ON client_lots(client_id);
CREATE INDEX IF NOT EXISTS idx_client_lots_lot ON client_lots(lot_id);

-- ============================================================================
-- 5. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lots_updated_at ON lots;
CREATE TRIGGER update_lots_updated_at BEFORE UPDATE ON lots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_burials_updated_at ON burials;
CREATE TRIGGER update_burials_updated_at BEFORE UPDATE ON burials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cemetery_sections_updated_at ON cemetery_sections;
CREATE TRIGGER update_cemetery_sections_updated_at BEFORE UPDATE ON cemetery_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. SOFT DELETE FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
        NEW.status = 'inactive';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply soft delete trigger to user tables
DROP TRIGGER IF EXISTS soft_delete_admins ON admins;
CREATE TRIGGER soft_delete_admins BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION soft_delete();

DROP TRIGGER IF EXISTS soft_delete_employees ON employees;
CREATE TRIGGER soft_delete_employees BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION soft_delete();

DROP TRIGGER IF EXISTS soft_delete_clients ON clients;
CREATE TRIGGER soft_delete_clients BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION soft_delete();

-- ============================================================================
-- 7. INITIAL DATA - Default Admin
-- ============================================================================

-- Insert default admin (password: admin123 - CHANGE THIS IN PRODUCTION!)
-- Password hash should be generated using bcrypt with salt
INSERT INTO admins (username, password_hash, name, email, status)
VALUES (
    'admin',
    '$2a$10$YourHashedPasswordHere',  -- Replace with actual bcrypt hash
    'Master Admin',
    'admin@smpi.com',
    'active'
) ON CONFLICT (username) DO NOTHING;

-- Insert default employee (password: emp123 - CHANGE THIS IN PRODUCTION!)
INSERT INTO employees (username, password_hash, name, email, status)
VALUES (
    'employee',
    '$2a$10$YourHashedPasswordHere',  -- Replace with actual bcrypt hash
    'Default Employee',
    'employee@smpi.com',
    'active'
) ON CONFLICT (username) DO NOTHING;

-- Insert default cemetery sections
INSERT INTO cemetery_sections (name, description, total_capacity, available_capacity, status)
VALUES 
    ('Garden of Peace', 'Peaceful garden setting with beautiful landscaping', 500, 350, 'active'),
    ('Garden of Serenity', 'Premium section with enhanced features', 300, 150, 'active'),
    ('Garden of Tranquility', 'Family section for larger lots', 200, 100, 'active'),
    ('Memorial Gardens', 'Traditional memorial section', 400, 200, 'active')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END OF MIGRATION 001
-- ============================================================================
