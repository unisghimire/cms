-- Add invoice_number column to invoices table
ALTER TABLE invoices
ADD COLUMN invoice_number TEXT NOT NULL DEFAULT 'INV-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::text, 4, '0');

-- Create a function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate invoice numbers
CREATE TRIGGER set_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION generate_invoice_number();

-- Add RLS policies for invoice_number
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices"
ON invoices FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can create invoices"
ON invoices FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own invoices"
ON invoices FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own invoices"
ON invoices FOR DELETE
USING (auth.uid() = created_by); 