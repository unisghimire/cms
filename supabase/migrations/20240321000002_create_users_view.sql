-- Create a view for users based on auth.users
CREATE OR REPLACE VIEW public.users AS
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  created_at,
  updated_at
FROM auth.users
WHERE deleted_at IS NULL;

-- Grant access to the view
GRANT SELECT ON public.users TO authenticated;

-- Create a function to update user metadata
CREATE OR REPLACE FUNCTION public.update_user_metadata(
  user_id UUID,
  full_name TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{full_name}',
    to_jsonb(full_name)
  )
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_metadata TO authenticated; 