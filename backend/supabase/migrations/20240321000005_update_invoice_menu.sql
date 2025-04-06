-- Update the Invoice menu item to point to the invoices list
UPDATE menu_items 
SET path = '/invoices'
WHERE title = 'Invoice';

-- Add RLS policy for the invoices table if not exists
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users"
ON public.invoices FOR SELECT
TO authenticated
USING (true)
WHERE NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invoices' 
    AND policyname = 'Enable read access for authenticated users'
); 