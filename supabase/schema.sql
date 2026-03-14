-- ============================================================
-- CMS Supabase Schema - Run this in Supabase Dashboard > SQL Editor
-- Project: https://ojiyflurxgaevxhodzcz.supabase.co
-- ============================================================

-- Enable required extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== FUNCTIONS ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- ==================== MENU ITEMS ====================
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  path text NOT NULL UNIQUE,
  icon text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  parent_id uuid REFERENCES menu_items(id),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== ENUMS ====================
DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM (
    'new', 'initial_contact', 'document_collection', 'assessment_completed',
    'visa_application_submitted', 'visa_approved', 'visa_rejected', 'visa_issued', 'lost'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_source AS ENUM (
    'website', 'referral', 'social_media', 'email_campaign', 'walk_in', 'phone_inquiry', 'other'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE visa_type AS ENUM (
    'student', 'work', 'business', 'tourist', 'family_sponsorship', 'permanent_residence', 'other'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE target_country AS ENUM (
    'canada', 'australia', 'united_kingdom', 'united_states', 'new_zealand', 'germany', 'france', 'other'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE education_level AS ENUM (
    'high_school', 'diploma', 'bachelors', 'masters', 'phd', 'other'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ==================== LEADS ====================
CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text NOT NULL,
  nationality text NOT NULL,
  current_country text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  alternate_phone text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  education_level education_level NOT NULL,
  current_education text,
  institution_name text,
  graduation_year integer,
  current_occupation text,
  years_of_experience integer,
  current_employer text,
  visa_type visa_type NOT NULL,
  target_country target_country NOT NULL,
  target_course text,
  target_institution text,
  target_intake text,
  status lead_status NOT NULL DEFAULT 'new',
  source lead_source NOT NULL,
  source_details text,
  budget_range text,
  funding_source text[],
  notes text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  assigned_to uuid REFERENCES auth.users(id)
);

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_assigned_to_idx ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS leads_visa_type_idx ON leads(visa_type);
CREATE INDEX IF NOT EXISTS leads_target_country_idx ON leads(target_country);

-- ==================== DOCUMENTS ====================
CREATE TABLE IF NOT EXISTS documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  document_name text NOT NULL,
  document_url text NOT NULL,
  document_size integer NOT NULL,
  document_type_mime text NOT NULL,
  is_verified boolean DEFAULT false,
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS documents_lead_id_idx ON documents(lead_id);
CREATE INDEX IF NOT EXISTS documents_is_verified_idx ON documents(is_verified);

-- ==================== VISA APPLICATIONS ====================
CREATE TABLE IF NOT EXISTS visa_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  application_number text NOT NULL UNIQUE,
  visa_type visa_type NOT NULL,
  target_country target_country NOT NULL,
  application_status text NOT NULL DEFAULT 'draft',
  submission_date timestamptz,
  processing_start_date timestamptz,
  expected_decision_date timestamptz,
  decision_date timestamptz,
  course_details jsonb,
  institution_details jsonb,
  financial_details jsonb,
  application_fee decimal,
  service_fee decimal,
  payment_status text DEFAULT 'pending',
  notes text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_visa_applications_updated_at
  BEFORE UPDATE ON visa_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS visa_applications_lead_id_idx ON visa_applications(lead_id);
CREATE INDEX IF NOT EXISTS visa_applications_status_idx ON visa_applications(application_status);

-- ==================== LEAD ACTIVITIES (with follow-up fields) ====================
CREATE TABLE IF NOT EXISTS lead_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL,
  description text NOT NULL,
  meeting_date timestamptz,
  meeting_duration text,
  meeting_notes text,
  follow_up_date timestamptz,
  follow_up_notes text,
  documents_collected text[],
  documents_pending text[],
  performed_by uuid REFERENCES auth.users(id) NOT NULL,
  follow_up_channel text,
  outcome_status text,
  reminder_time time,
  reminder_before integer,
  assigned_to uuid REFERENCES auth.users(id),
  internal_notes text,
  notify_lead boolean DEFAULT false,
  notification_message text,
  follow_up_result text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS lead_activities_lead_id_idx ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS lead_activities_assigned_to_idx ON lead_activities(assigned_to);

-- ==================== PUBLIC USERS (synced from auth.users) ====================
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Re-create trigger (in case of re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sync existing auth users into public.users
INSERT INTO public.users (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ==================== GET_USERS RPC (for Followups page) ====================
CREATE OR REPLACE FUNCTION public.get_users()
RETURNS TABLE (id uuid, email text, full_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.email, u.full_name FROM public.users u;
$$;

GRANT EXECUTE ON FUNCTION public.get_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users() TO anon;

-- ==================== INVOICES ====================
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  amount decimal(10,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
  due_date date NOT NULL,
  discount_percentage decimal(5,2) DEFAULT 0 NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS invoices_lead_id_idx ON public.invoices(lead_id);
CREATE INDEX IF NOT EXISTS invoices_invoice_number_idx ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices(status);
CREATE INDEX IF NOT EXISTS invoices_due_date_idx ON public.invoices(due_date);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated to read invoices"
  ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated to insert invoices"
  ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated to update invoices"
  ON public.invoices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ==================== RLS for other tables ====================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to leads"
  ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to documents"
  ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE visa_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to visa_applications"
  ON visa_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated full access to lead_activities"
  ON lead_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read menu_items"
  ON menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read menu_items anon"
  ON menu_items FOR SELECT TO anon USING (true);

-- ==================== STORAGE BUCKET (leaddocument) ====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('leaddocument', 'leaddocument', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for leaddocument
CREATE POLICY "Allow authenticated upload to leaddocument"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'leaddocument' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read leaddocument"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'leaddocument');

CREATE POLICY "Allow authenticated update in leaddocument"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'leaddocument' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete in leaddocument"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'leaddocument' AND auth.role() = 'authenticated');

-- ==================== MENU SEED DATA ====================
INSERT INTO menu_items (title, path, icon, is_active, sort_order) VALUES
  ('Dashboard', '/dashboard', 'Dashboard', true, 1),
  ('Content', '/content', 'Article', true, 2),
  ('Users', '/users', 'People', true, 3),
  ('Settings', '/settings', 'Settings', true, 4),
  ('Leads', '/leads', 'PersonAdd', true, 5)
ON CONFLICT (path) DO NOTHING;

INSERT INTO menu_items (title, path, icon, is_active, parent_id, sort_order)
SELECT 'Articles', '/content/articles', 'Article', true, id, 1 FROM menu_items WHERE path = '/content' LIMIT 1
ON CONFLICT (path) DO NOTHING;

INSERT INTO menu_items (title, path, icon, is_active, parent_id, sort_order)
SELECT 'Categories', '/content/categories', 'Category', true, id, 2 FROM menu_items WHERE path = '/content' LIMIT 1
ON CONFLICT (path) DO NOTHING;

INSERT INTO menu_items (title, path, icon, is_active, parent_id, sort_order)
SELECT 'Tags', '/content/tags', 'Tag', true, id, 3 FROM menu_items WHERE path = '/content' LIMIT 1
ON CONFLICT (path) DO NOTHING;

INSERT INTO menu_items (title, path, icon, is_active, parent_id, sort_order)
SELECT 'All Leads', '/leads/all', 'People', true, id, 1 FROM menu_items WHERE path = '/leads' LIMIT 1
ON CONFLICT (path) DO NOTHING;

INSERT INTO menu_items (title, path, icon, is_active, parent_id, sort_order)
SELECT 'Visa Applications', '/leads/applications', 'Assignment', true, id, 2 FROM menu_items WHERE path = '/leads' LIMIT 1
ON CONFLICT (path) DO NOTHING;

INSERT INTO menu_items (title, path, icon, is_active, parent_id, sort_order)
SELECT 'Documents', '/leads/documents', 'Folder', true, id, 3 FROM menu_items WHERE path = '/leads' LIMIT 1
ON CONFLICT (path) DO NOTHING;

INSERT INTO menu_items (title, path, icon, is_active, parent_id, sort_order)
SELECT 'Follow-ups', '/leads/followups', 'Notifications', true, id, 4 FROM menu_items WHERE path = '/leads' LIMIT 1
ON CONFLICT (path) DO NOTHING;

INSERT INTO menu_items (title, path, icon, is_active, parent_id, sort_order)
SELECT 'Invoice', '/invoices', 'Receipt', true, id, 5 FROM menu_items WHERE path = '/leads' LIMIT 1
ON CONFLICT (path) DO NOTHING;

INSERT INTO menu_items (title, path, icon, is_active, parent_id, sort_order)
SELECT 'Lead Transfer', '/leads/transfer', 'TransferWithinAStation', true, id, 6 FROM menu_items WHERE path = '/leads' LIMIT 1
ON CONFLICT (path) DO NOTHING;

INSERT INTO menu_items (title, path, icon, is_active, parent_id, sort_order)
SELECT 'Leads 365', '/leads365', 'People', true, id, 7 FROM menu_items WHERE path = '/leads' LIMIT 1
ON CONFLICT (path) DO NOTHING;
