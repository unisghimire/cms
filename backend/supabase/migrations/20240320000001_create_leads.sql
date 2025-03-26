-- Create enum for lead status
create type lead_status as enum (
  'new',
  'initial_contact',
  'document_collection',
  'assessment_completed',
  'visa_application_submitted',
  'visa_approved',
  'visa_rejected',
  'visa_issued',
  'lost'
);

-- Create enum for lead source
create type lead_source as enum (
  'website',
  'referral',
  'social_media',
  'email_campaign',
  'walk_in',
  'phone_inquiry',
  'other'
);

-- Create enum for visa type
create type visa_type as enum (
  'student',
  'work',
  'business',
  'tourist',
  'family_sponsorship',
  'permanent_residence',
  'other'
);

-- Create enum for target country
create type target_country as enum (
  'canada',
  'australia',
  'united_kingdom',
  'united_states',
  'new_zealand',
  'germany',
  'france',
  'other'
);

-- Create enum for education level
create type education_level as enum (
  'high_school',
  'diploma',
  'bachelors',
  'masters',
  'phd',
  'other'
);

-- Create leads table
create table leads (
  -- Unique identifier for the lead
  id uuid default uuid_generate_v4() primary key,
  -- Personal information
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  gender text not null,
  nationality text not null,
  current_country text not null,
  -- Contact information
  email text not null,
  phone text not null,
  alternate_phone text,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null,
  -- Education information
  education_level education_level not null,
  current_education text,
  institution_name text,
  graduation_year integer,
  -- Work experience
  current_occupation text,
  years_of_experience integer,
  current_employer text,
  -- Immigration details
  visa_type visa_type not null,
  target_country target_country not null,
  target_course text,
  target_institution text,
  target_intake text,
  -- Lead details
  status lead_status not null default 'new',
  source lead_source not null,
  source_details text,
  -- Financial information
  budget_range text,
  funding_source text[],
  -- Notes and additional information
  notes text,
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Assigned to
  assigned_to uuid references auth.users(id)
);

-- Create documents table
create table documents (
  -- Unique identifier for the document
  id uuid default uuid_generate_v4() primary key,
  -- Reference to the lead
  lead_id uuid references leads(id) on delete cascade not null,
  -- Document information
  document_type text not null,
  document_name text not null,
  document_url text not null,
  document_size integer not null,
  document_type_mime text not null,
  -- Document status
  is_verified boolean default false,
  verified_by uuid references auth.users(id),
  verified_at timestamp with time zone,
  -- Notes
  notes text,
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create visa applications table
create table visa_applications (
  -- Unique identifier for the application
  id uuid default uuid_generate_v4() primary key,
  -- Reference to the lead
  lead_id uuid references leads(id) on delete cascade not null,
  -- Application details
  application_number text not null unique,
  visa_type visa_type not null,
  target_country target_country not null,
  application_status text not null default 'draft',
  -- Important dates
  submission_date timestamp with time zone,
  processing_start_date timestamp with time zone,
  expected_decision_date timestamp with time zone,
  decision_date timestamp with time zone,
  -- Application details
  course_details jsonb,
  institution_details jsonb,
  financial_details jsonb,
  -- Fees and payments
  application_fee decimal,
  service_fee decimal,
  payment_status text default 'pending',
  -- Notes
  notes text,
  -- Created by
  created_by uuid references auth.users(id) not null,
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create lead activities table for tracking interactions
create table lead_activities (
  -- Unique identifier for the activity
  id uuid default uuid_generate_v4() primary key,
  -- Reference to the lead
  lead_id uuid references leads(id) on delete cascade not null,
  -- Activity details
  activity_type text not null,
  description text not null,
  -- Meeting details (if applicable)
  meeting_date timestamp with time zone,
  meeting_duration interval,
  meeting_notes text,
  -- Follow-up details
  follow_up_date timestamp with time zone,
  follow_up_notes text,
  -- Document collection status
  documents_collected text[],
  documents_pending text[],
  -- Performed by
  performed_by uuid references auth.users(id) not null,
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create triggers for updated_at
create trigger update_leads_updated_at
  before update on leads
  for each row
  execute function update_updated_at_column();

create trigger update_documents_updated_at
  before update on documents
  for each row
  execute function update_updated_at_column();

create trigger update_visa_applications_updated_at
  before update on visa_applications
  for each row
  execute function update_updated_at_column();

-- Create indexes for better query performance
create index leads_status_idx on leads(status);
create index leads_assigned_to_idx on leads(assigned_to);
create index leads_visa_type_idx on leads(visa_type);
create index leads_target_country_idx on leads(target_country);
create index documents_lead_id_idx on documents(lead_id);
create index documents_is_verified_idx on documents(is_verified);
create index visa_applications_lead_id_idx on visa_applications(lead_id);
create index visa_applications_status_idx on visa_applications(application_status);
create index lead_activities_lead_id_idx on lead_activities(lead_id);

-- Insert lead menu items
insert into menu_items (title, path, icon, is_active, sort_order) values
  ('Leads', '/leads', 'PersonAdd', true, 5);

-- Insert lead submenu items
insert into menu_items (title, path, icon, is_active, parent_id, sort_order) values
  ('All Leads', '/leads/all', 'People', true, (select id from menu_items where path = '/leads'), 1),
  ('Visa Applications', '/leads/applications', 'Assignment', true, (select id from menu_items where path = '/leads'), 2),
  ('Documents', '/leads/documents', 'Folder', true, (select id from menu_items where path = '/leads'), 3),
  ('Follow-ups', '/leads/followups', 'Notifications', true, (select id from menu_items where path = '/leads'), 4); 