-- Payment plan core tables
CREATE TABLE IF NOT EXISTS payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    lot_id UUID REFERENCES lots(id) ON DELETE SET NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'annual', 'full', 'custom')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    down_payment NUMERIC(12, 2) DEFAULT 0 CHECK (down_payment >= 0),
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'defaulted')),
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_plans_client ON payment_plans (client_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_status ON payment_plans (status);

-- Installments linked to plans
CREATE TABLE IF NOT EXISTS payment_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    paid_at TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    invoice_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_installments_plan ON payment_installments (plan_id);
CREATE INDEX IF NOT EXISTS idx_payment_installments_due_date ON payment_installments (due_date);
CREATE INDEX IF NOT EXISTS idx_payment_installments_status ON payment_installments (status);

-- Invoices referencing plans and installments
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
    installment_id UUID UNIQUE REFERENCES payment_installments(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'PHP',
    pdf_url TEXT,
    status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'paid', 'void')),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_plan ON invoices (plan_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);

-- Add FK now that invoices table exists
ALTER TABLE payment_installments
    ADD CONSTRAINT payment_installments_invoice_id_fkey
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- Simple trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_plans_updated
    BEFORE UPDATE ON payment_plans
    FOR EACH ROW EXECUTE FUNCTION set_timestamp();

CREATE TRIGGER trg_payment_installments_updated
    BEFORE UPDATE ON payment_installments
    FOR EACH ROW EXECUTE FUNCTION set_timestamp();
