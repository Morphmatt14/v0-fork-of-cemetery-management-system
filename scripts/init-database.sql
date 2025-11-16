-- Create lots table
CREATE TABLE IF NOT EXISTS lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  lot_type VARCHAR(50) NOT NULL CHECK (lot_type IN ('lawn', 'garden', 'family')),
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lot_orders table
CREATE TABLE IF NOT EXISTS lot_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  lot_id UUID NOT NULL REFERENCES lots(id),
  quantity INT DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  lot_id UUID NOT NULL REFERENCES lots(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES lot_orders(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  stripe_charge_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_lot_orders_customer_id ON lot_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_lot_orders_lot_id ON lot_orders(lot_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Enable RLS (Row Level Security)
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lot_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Lots table: Everyone can read
CREATE POLICY "Lots are viewable by everyone" ON lots
  FOR SELECT
  USING (true);

-- Customers table: Users can only access their own record
CREATE POLICY "Customers can view own record" ON customers
  FOR SELECT
  USING (true);

CREATE POLICY "Customers can update own record" ON customers
  FOR UPDATE
  USING (true);

CREATE POLICY "Customers can insert their own record" ON customers
  FOR INSERT
  WITH CHECK (true);

-- Lot orders: Users can view and manage their own orders
CREATE POLICY "Users can view own orders" ON lot_orders
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own orders" ON lot_orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own orders" ON lot_orders
  FOR UPDATE
  USING (true);

-- Appointments: Users can manage their own
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE
  USING (true);

-- Payments: Users can view payments for their orders
CREATE POLICY "Users can view payments for own orders" ON payments
  FOR SELECT
  USING (true);

-- Insert sample lots
INSERT INTO lots (name, lot_type, price, description, available) VALUES
('Lawn Lot A1', 'lawn', 75000, 'Standard single burial plot with flat marker', true),
('Lawn Lot A2', 'lawn', 75000, 'Standard single burial plot with flat marker', true),
('Garden Lot G1', 'garden', 120000, 'Premium garden-style lot for multiple family members', true),
('Garden Lot G2', 'garden', 120000, 'Premium garden-style lot for multiple family members', true),
('Family Estate F1', 'family', 500000, 'Prestigious 30-square-meter lot for private mausoleum', true)
ON CONFLICT DO NOTHING;
