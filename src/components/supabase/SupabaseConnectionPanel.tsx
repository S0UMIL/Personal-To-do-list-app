import { useCallback, useEffect, useState } from 'react'
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext'
import { checkSupabaseHealth } from '../../services/supabase/health'
import type { SupabaseHealthResult } from '../../services/supabase/health'
import { Button } from '../ui/Button'
import styles from './SupabaseConnectionPanel.module.css'

/**
 * Read-only panel for verifying Supabase setup alongside Firebase/localStorage.
 * Does not replace the existing auth flow.
 */
export function SupabaseConnectionPanel() {
  const supabaseAuth = useSupabaseAuth()
  const [health, setHealth] = useState<SupabaseHealthResult | null>(null)
  const [checking, setChecking] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const runHealthCheck = useCallback(async () => {
    setChecking(true)
    try {
      const result = await checkSupabaseHealth()
      setHealth(result)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    runHealthCheck()
  }, [runHealthCheck, supabaseAuth.session])

  const handleSupabaseSignIn = async () => {
    setAuthError(null)
    try {
      await supabaseAuth.signInWithGoogle()
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in failed')
    }
  }

  const handleSupabaseSignOut = async () => {
    setAuthError(null)
    try {
      await supabaseAuth.signOut()
      await runHealthCheck()
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-out failed')
    }
  }

  if (!supabaseAuth.configured) {
    return (
      <section className={styles.section}>
        <h2>Supabase (preview)</h2>
        <p className={styles.muted}>
          Not configured. Add <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file, then
          run the migrations in the Supabase dashboard or CLI.
        </p>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <h2>Supabase (preview)</h2>
      <p className={styles.lead}>
        Identity and friends leaderboard only. Tasks stay on this device. Apply{' '}
        <code>supabase/apply_all.sql</code> in the SQL Editor if the schema is not
        created yet.
      </p>

      <dl className={styles.status}>
        <div>
          <dt>Configured</dt>
          <dd>{health?.configured ? 'Yes' : 'No'}</dd>
        </div>
        <div>
          <dt>Reachable</dt>
          <dd>{health?.connected ? 'Yes' : 'No'}</dd>
        </div>
        <div>
          <dt>Session</dt>
          <dd>{health?.authenticated ? 'Signed in' : 'None'}</dd>
        </div>
        <div>
          <dt>Profile row</dt>
          <dd>
            {health?.profileExists === null
              ? '—'
              : health?.profileExists
                ? 'Created'
                : 'Missing'}
          </dd>
        </div>
        {supabaseAuth.profile && (
          <div>
            <dt>Friend code</dt>
            <dd className={styles.mono}>{supabaseAuth.profile.friend_code}</dd>
          </div>
        )}
        {supabaseAuth.isAuthenticated && !supabaseAuth.profile && (
          <div>
            <dt>Profile row</dt>
            <dd>Signed in — apply apply_all.sql if missing</dd>
          </div>
        )}
      </dl>

      {health?.error && <p className={styles.error}>{health.error}</p>}
      {authError && <p className={styles.error}>{authError}</p>}

      <div className={styles.actions}>
        <Button
          size="sm"
          variant="secondary"
          onClick={runHealthCheck}
          disabled={checking}
        >
          {checking ? 'Checking…' : 'Re-check connection'}
        </Button>
        {supabaseAuth.isAuthenticated ? (
          <Button size="sm" variant="secondary" onClick={handleSupabaseSignOut}>
            Sign out (Supabase)
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={handleSupabaseSignIn}>
            Sign in with Google (Supabase)
          </Button>
        )}
      </div>
    </section>
  )
}
