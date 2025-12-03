ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS agreement_text TEXT,
  ADD COLUMN IF NOT EXISTS agreement_document_url TEXT;
