-- Content Management System Tables

-- Create content_pages table to store page configurations
CREATE TABLE IF NOT EXISTS content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_sections table to store sections within pages
CREATE TABLE IF NOT EXISTS content_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  section_type VARCHAR(50) NOT NULL,
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_fields table to store individual content fields
CREATE TABLE IF NOT EXISTS content_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES content_sections(id) ON DELETE CASCADE,
  field_key VARCHAR(255) NOT NULL,
  field_label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  field_value TEXT,
  placeholder TEXT,
  is_required BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing table to store lot pricing
CREATE TABLE IF NOT EXISTS lot_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_type VARCHAR(50) NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  features TEXT[],
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table for system-wide settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE lot_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_sections_page_id ON content_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_content_fields_section_id ON content_fields(section_id);
CREATE INDEX IF NOT EXISTS idx_lot_pricing_lot_type ON lot_pricing(lot_type);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Insert default homepage content
INSERT INTO content_pages (title, slug, description) VALUES
('Homepage', 'homepage', 'Main landing page content'),
('Services', 'services', 'Service offerings and descriptions'),
('About', 'about', 'About Surigao Memorial Park'),
('Contact', 'contact', 'Contact information and inquiries')
ON CONFLICT DO NOTHING;

-- Insert default lot pricing
INSERT INTO lot_pricing (lot_type, price, description, display_order) VALUES
('Lawn Lot', 75000, 'Standard single burial plot measuring 1 meter by 2.44 meters', 1),
('Garden Lot', 120000, 'Premium burial space measuring 4 meters by 2.44 meters', 2),
('Family Estate', 500000, 'Prestigious 30-square-meter lot designed for legacy', 3)
ON CONFLICT DO NOTHING;

-- RLS Policies
-- Everyone can read public content
CREATE POLICY "Content pages are viewable by everyone" ON content_pages
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Content sections are viewable by everyone" ON content_sections
  FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Content fields are viewable by everyone" ON content_fields
  FOR SELECT
  USING (true);

CREATE POLICY "Pricing is viewable by everyone" ON lot_pricing
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Settings are viewable by everyone" ON system_settings
  FOR SELECT
  USING (true);
