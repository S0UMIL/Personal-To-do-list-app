import { getSupabase, getSupabaseOrNull, isSupabaseConfigured } from '../../lib/supabase'

export interface SupabaseHealthResult {
  configured: boolean
  connected: boolean
  authenticated: boolean
  userId: string | null
  profileExists: boolean | null
  error: string | null
}

/**
 * Verifies env vars, client init, session, and profile row existence.
 * Safe to call before Firebase/localStorage migration.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthResult> {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      connected: false,
      authenticated: false,
      userId: null,
      profileExists: null,
      error: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY',
    }
  }

  const supabase = getSupabaseOrNull()
  if (!supabase) {
    return {
      configured: true,
      connected: false,
      authenticated: false,
      userId: null,
      profileExists: null,
      error: 'Supabase client failed to initialize',
    }
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      return {
        configured: true,
        connected: true,
        authenticated: false,
        userId: null,
        profileExists: null,
        error: sessionError.message,
      }
    }

    const userId = sessionData.session?.user.id ?? null
    if (!userId) {
      return {
        configured: true,
        connected: true,
        authenticated: false,
        userId: null,
        profileExists: null,
        error: null,
      }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      const migrationsPending = profileError.code === 'PGRST205'
      return {
        configured: true,
        connected: true,
        authenticated: true,
        userId,
        profileExists: null,
        error: migrationsPending
          ? 'Database schema not applied yet — run supabase/apply_all.sql in the SQL Editor'
          : profileError.message,
      }
    }

    return {
      configured: true,
      connected: true,
      authenticated: true,
      userId,
      profileExists: Boolean(profile),
      error: null,
    }
  } catch (err) {
    return {
      configured: true,
      connected: false,
      authenticated: false,
      userId: null,
      profileExists: null,
      error: err instanceof Error ? err.message : 'Unknown Supabase error',
    }
  }
}

/** Lightweight ping — confirms client can reach Supabase (no auth required). */
export async function pingSupabase(): Promise<{ ok: boolean; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Not configured' }
  }

  try {
    const supabase = getSupabase()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    if (error) {
      if (error.code === 'PGRST116') return { ok: true, error: null }
      if (error.code === 'PGRST205') {
        return {
          ok: true,
          error: 'Connected — run supabase/apply_all.sql in Supabase SQL Editor',
        }
      }
      return { ok: false, error: error.message }
    }
    return { ok: true, error: null }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Ping failed',
    }
  }
}
