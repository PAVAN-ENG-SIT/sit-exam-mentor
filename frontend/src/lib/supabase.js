// ─────────────────────────────────────────────────────────────
// Supabase Client  —  frontend/src/lib/supabase.js
// Initializes the Supabase browser client from env vars.
// ─────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail fast with a clear message during development
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Make sure VITE_SUPABASE_URL and ' +
    'VITE_SUPABASE_ANON_KEY are set in frontend/.env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
