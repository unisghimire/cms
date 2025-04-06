-- Create invoices table
create table if not exists public.invoices (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid not null,
  invoice_number text not null unique,
  amount decimal(10,2) not null,
  status text not null check (status in ('pending', 'paid', 'cancelled')),
  due_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint fk_lead foreign key (lead_id) references public.leads(id) on delete cascade
);

-- Create index on lead_id for faster lookups
create index if not exists invoices_lead_id_idx on public.invoices(lead_id);

-- Create index on invoice_number for faster lookups
create index if not exists invoices_invoice_number_idx on public.invoices(invoice_number);

-- Create index on status for filtering
create index if not exists invoices_status_idx on public.invoices(status);

-- Create index on due_date for sorting
create index if not exists invoices_due_date_idx on public.invoices(due_date);

-- Add RLS policies
alter table public.invoices enable row level security;

-- Allow authenticated users to view all invoices
create policy "Allow authenticated users to view invoices"
  on public.invoices for select
  to authenticated
  using (true);

-- Allow authenticated users to insert invoices
create policy "Allow authenticated users to insert invoices"
  on public.invoices for insert
  to authenticated
  with check (true);

-- Allow authenticated users to update invoices
create policy "Allow authenticated users to update invoices"
  on public.invoices for update
  to authenticated
  using (true)
  with check (true);

-- Create trigger to update updated_at timestamp
create trigger handle_updated_at before update on public.invoices
  for each row execute procedure moddatetime (updated_at); 