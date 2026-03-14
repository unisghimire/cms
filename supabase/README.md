# Supabase schema setup

After creating a new Supabase project (or resetting the database), run the schema to create all tables and seed data.

## 1. Environment variables

Use your own Supabase project and set:

- **Frontend** (`frontend/.env`): `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`
- **Backend** (`backend/.env`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

Copy from `frontend/.env.example` and `backend/.env.example` and fill in your project values.

## 2. Run the schema in Supabase

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard) (e.g. `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`).
2. Go to **SQL Editor**.
3. Open `supabase/schema.sql` in this repo, copy its full contents, and paste into the SQL Editor.
4. Click **Run**.

This will create:

- **Tables:** `menu_items`, `leads`, `documents`, `visa_applications`, `lead_activities`, `public.users`, `invoices`
- **Enums:** `lead_status`, `lead_source`, `visa_type`, `target_country`, `education_level`
- **RPC:** `get_users()` for the Followups page
- **Storage:** bucket `leaddocument` (public) for lead documents
- **RLS:** policies for authenticated access
- **Seed:** default menu items (Dashboard, Leads, Documents, etc.)

## 3. Create a user

Create at least one user to sign in:

- Go to **Authentication → Users → Add user** in the Supabase Dashboard (email + password).
- That user is synced to `public.users` by the trigger and can sign in to the app.

You can also run the `add_sample_user` migration from the Dashboard SQL Editor if you use that migration in your project.

## 4. Run the app

From the project root:

```bash
npm start
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000
