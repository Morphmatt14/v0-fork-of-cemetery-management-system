-- Create tables for Super Admin system

-- Super Admin table (only one super admin)
CREATE TABLE IF NOT EXISTS super_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES super_admin(id),
  is_active BOOLEAN DEFAULT true
);

-- Client users table (if not already exists)
CREATE TABLE IF NOT EXISTS client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  entity_type TEXT, -- 'client', 'lot', 'payment', 'admin'
  entity_id TEXT,
  status TEXT CHECK (status IN ('success', 'failed')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Password reset requests table
CREATE TABLE IF NOT EXISTS password_reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_username TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
  new_password_hash TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT
);

-- Lots table (if not exists)
CREATE TABLE IF NOT EXISTS lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_number TEXT UNIQUE NOT NULL,
  section TEXT,
  lot_type TEXT,
  status TEXT CHECK (status IN ('available', 'reserved', 'sold')),
  price DECIMAL(10, 2),
  dimensions TEXT,
  map_id TEXT,
  coordinates JSONB,
  owner_id UUID REFERENCES client_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID REFERENCES lots(id),
  client_id UUID REFERENCES client_users(id),
  total_price DECIMAL(10, 2),
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2),
  status TEXT CHECK (status IN ('pending', 'partial', 'paid')),
  last_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin ON activity_logs(admin_username);
CREATE INDEX IF NOT EXISTS idx_lots_owner ON lots(owner_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_status ON password_reset_requests(status);

-- Insert default super admin (password: superadmin123 - hashed)
INSERT INTO super_admin (username, password_hash)
VALUES ('superadmin', '$2a$10$YourHashedPasswordHere')
ON CONFLICT (username) DO NOTHING;

-- Insert default admin (password: admin123 - hashed)
INSERT INTO admin_users (username, password_hash, name)
VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'Default Admin')
ON CONFLICT (username) DO NOTHING;

-- Insert demo client
INSERT INTO client_users (email, password_hash, name, phone)
VALUES ('client@example.com', '$2a$10$YourHashedPasswordHere', 'Juan Dela Cruz', '09123456789')
ON CONFLICT (email) DO NOTHING;
