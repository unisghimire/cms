-- Add Lead Transfer menu item as a child of Leads menu
INSERT INTO public.menu_items (
  title,
  path,
  icon,
  is_active,
  parent_id,
  sort_order
) VALUES (
  'Lead Transfer',
  '/leads/transfer',
  'Transfer',
  true,
  (SELECT id FROM menu_items WHERE path = '/leads'),
  5
);

-- Add RLS policies for menu_items if they don't exist
DO $$
BEGIN
  -- Enable RLS
  ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

  -- Create policy for selecting menu items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'menu_items' 
    AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" 
    ON public.menu_items
    FOR SELECT
    USING (true);
  END IF;

  -- Create policy for inserting menu items (admin only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'menu_items' 
    AND policyname = 'Enable insert for administrators only'
  ) THEN
    CREATE POLICY "Enable insert for administrators only" 
    ON public.menu_items
    FOR INSERT
    WITH CHECK (
      auth.uid() IN (
        SELECT user_id FROM public.user_roles 
        WHERE role = 'admin'
      )
    );
  END IF;

  -- Create policy for updating menu items (admin only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'menu_items' 
    AND policyname = 'Enable update for administrators only'
  ) THEN
    CREATE POLICY "Enable update for administrators only" 
    ON public.menu_items
    FOR UPDATE
    USING (
      auth.uid() IN (
        SELECT user_id FROM public.user_roles 
        WHERE role = 'admin'
      )
    );
  END IF;

  -- Create policy for deleting menu items (admin only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'menu_items' 
    AND policyname = 'Enable delete for administrators only'
  ) THEN
    CREATE POLICY "Enable delete for administrators only" 
    ON public.menu_items
    FOR DELETE
    USING (
      auth.uid() IN (
        SELECT user_id FROM public.user_roles 
        WHERE role = 'admin'
      )
    );
  END IF;
END $$; 