import { createClient } from '@supabase/supabase-js';

if (!process.env.REACT_APP_SUPABASE_URL) {
  throw new Error('Missing REACT_APP_SUPABASE_URL environment variable');
}

if (!process.env.REACT_APP_SUPABASE_ANON_KEY) {
  throw new Error('Missing REACT_APP_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
); 