import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

let client: SupabaseClient<Database> | null = null

if (isSupabaseConfigured) {
  client = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Required for native deep links: implicit flow puts tokens in the URL hash
      // (#access_token=...), which Android intents often drop. PKCE uses ?code=...
      flowType: 'pkce',
    },
  })
}

export function getSupabase(): SupabaseClient<Database> {
  if (!client) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
    )
  }
  return client
}

/** Safe accessor — returns null when env vars are missing. */
export function getSupabaseOrNull(): SupabaseClient<Database> | null {
  return client
}
