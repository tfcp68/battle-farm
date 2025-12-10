import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/types/supabase';


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
	console.warn('[supabaseClient] Missing SUPABASE_URL or SUPABASE_KEY env vars');
}

const client: SupabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

export default client;