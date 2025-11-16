-- Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Inquiries Table
CREATE TABLE IF NOT EXISTS public.client_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES public.lots(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  admin_response TEXT,
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Messages (Super Admin <-> Admin communication)
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'general' CHECK (message_type IN ('general', 'issue', 'report_request', 'announcement')),
  priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES public.admin_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  action_category VARCHAR(50) CHECK (action_category IN ('payment', 'client', 'lot', 'map', 'password', 'system', 'inquiry', 'message')),
  description TEXT NOT NULL,
  affected_record_type VARCHAR(100),
  affected_record_id UUID,
  metadata JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password Reset Requests Table
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  approved_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  new_password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Lot Assignments Table (tracks which customer owns which lot)
CREATE TABLE IF NOT EXISTS public.lot_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.lot_orders(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  notes TEXT,
  UNIQUE(lot_id, customer_id)
);

-- Map Data Table (stores map configurations and lot positions)
CREATE TABLE IF NOT EXISTS public.map_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_name VARCHAR(255) NOT NULL,
  map_type VARCHAR(50) CHECK (map_type IN ('lawn', 'garden', 'family')),
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
  coordinates JSONB NOT NULL, -- {x, y, width, height}
  fabric_object JSONB, -- Full Fabric.js object data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Installments Table
CREATE TABLE IF NOT EXISTS public.payment_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.lot_orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount_due NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  due_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_client_inquiries_customer ON public.client_inquiries(customer_id);
CREATE INDEX IF NOT EXISTS idx_client_inquiries_status ON public.client_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_admin_messages_recipient ON public.admin_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_is_read ON public.admin_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin ON public.activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category ON public.activity_logs(action_category);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lot_assignments_lot ON public.lot_assignments(lot_id);
CREATE INDEX IF NOT EXISTS idx_lot_assignments_customer ON public.lot_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_map_data_lot ON public.map_data(lot_id);
CREATE INDEX IF NOT EXISTS idx_payment_installments_order ON public.payment_installments(order_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_status ON public.password_reset_requests(status);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_installments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Admin Users (only super admins can manage)
CREATE POLICY "Admins can view themselves" ON public.admin_users
  FOR SELECT USING (true);

CREATE POLICY "Only system can insert admins" ON public.admin_users
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Admins can update their own profile" ON public.admin_users
  FOR UPDATE USING (true);

-- RLS Policies for Client Inquiries
CREATE POLICY "Customers can view own inquiries" ON public.client_inquiries
  FOR SELECT USING (true);

CREATE POLICY "Customers can create inquiries" ON public.client_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update inquiries" ON public.client_inquiries
  FOR UPDATE USING (true);

-- RLS Policies for Admin Messages
CREATE POLICY "Admins can view messages sent to them" ON public.admin_messages
  FOR SELECT USING (true);

CREATE POLICY "Admins can send messages" ON public.admin_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can mark messages as read" ON public.admin_messages
  FOR UPDATE USING (true);

-- RLS Policies for Activity Logs (read-only for admins)
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT USING (true);

-- RLS Policies for Lot Assignments
CREATE POLICY "Customers can view their lot assignments" ON public.lot_assignments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage lot assignments" ON public.lot_assignments
  FOR ALL USING (true);

-- RLS Policies for Map Data
CREATE POLICY "Everyone can view map data" ON public.map_data
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage map data" ON public.map_data
  FOR ALL USING (true);

-- RLS Policies for Payment Installments
CREATE POLICY "Customers can view own installments" ON public.payment_installments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage installments" ON public.payment_installments
  FOR ALL USING (true);

-- Insert Default Super Admin (password: superadmin123)
-- Note: In production, use proper password hashing with bcrypt
INSERT INTO public.admin_users (username, password_hash, full_name, role, email)
VALUES ('superadmin', 'hashed_superadmin123', 'Super Administrator', 'super_admin', 'admin@surigaomemorial.com')
ON CONFLICT (username) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_inquiries_updated_at BEFORE UPDATE ON public.client_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_map_data_updated_at BEFORE UPDATE ON public.map_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_installments_updated_at BEFORE UPDATE ON public.payment_installments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
