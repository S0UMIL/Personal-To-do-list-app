import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext'
import { useCloudIdentity } from '../../hooks/useCloudIdentity'
import { authCallbackError, hasAuthCallback } from '../../lib/authCallback'
import { isNativePlatform } from '../../lib/authRedirect'
import { Logo } from '../../components/ui/Logo'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const firebase = useAuth()
  const supabase = useSupabaseAuth()
  const { isAuthenticated, isOfflineMode, loading: identityLoading } = useCloudIdentity()
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const hydrated = useAppStore((s) => s.hydrated)
  const location = useLocation()

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(
    () => authCallbackError(location.search, location.hash),
  )

  const callbackErr = authCallbackError(location.search, location.hash)
  const waitingOnWebCallback =
    !isNativePlatform() &&
    hasAuthCallback(location.search, location.hash) &&
    !isAuthenticated &&
    !error &&
    !callbackErr
  const waitingOnNativeOAuth = isNativePlatform() && supabase.oauthInProgress && !isAuthenticated
  const nativeOAuthErr = supabase.nativeOAuthError

  useEffect(() => {
    if (!waitingOnWebCallback) return
    const t = window.setTimeout(() => {
      setError(
        'Google sign-in did not finish. In Supabase, add http://localhost:5173/login to Redirect URLs, and confirm the Google provider is enabled.',
      )
    }, 12000)
    return () => window.clearTimeout(t)
  }, [waitingOnWebCallback])

  useEffect(() => {
    if (!nativeOAuthErr) return
    setError(nativeOAuthErr)
    setBusy(false)
    supabase.clearNativeOAuthError()
  }, [nativeOAuthErr, supabase])

  if (waitingOnWebCallback || waitingOnNativeOAuth || identityLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p className={styles.hint}>
            {waitingOnWebCallback || waitingOnNativeOAuth
              ? 'Finishing Google sign-in…'
              : 'Loading…'}
          </p>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    )
  }

  if (isAuthenticated || isOfflineMode) {
    if (!hydrated) {
      return (
        <div className={styles.page}>
          <div className={styles.card}>
            <p className={styles.hint}>Loading…</p>
          </div>
        </div>
      )
    }
    return <Navigate to={onboardingComplete ? '/' : '/onboarding'} replace />
  }

  const cloudReady = supabase.configured || firebase.configured
  const loading = busy || firebase.loading || supabase.loading

  const handleGoogle = async () => {
    setError(null)
    setBusy(true)
    try {
      if (supabase.configured) {
        await supabase.signInWithGoogle()
        return
      }
      await firebase.signInGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Logo size={56} className={styles.logo} />
        <h1 className={`displayTitle ${styles.title}`}>North</h1>
        <p className={styles.subtitle}>
          Sign in to compete with friends. Your tasks stay on this device.
        </p>

        {cloudReady ? (
          <>
            <Button
              fullWidth
              size="lg"
              onClick={handleGoogle}
              disabled={loading}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            {error && <p className={styles.error}>{error}</p>}
          </>
        ) : (
          <div className={styles.setup}>
            <p>
              Cloud login is not configured yet. Add Supabase keys to <code>.env</code>{' '}
              to enable Google sign-in.
            </p>
            <p className={styles.setupHint}>See <code>.env.example</code> in the project.</p>
          </div>
        )}

        <button type="button" className={styles.offline} onClick={firebase.continueOffline}>
          Continue offline (local only)
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.6 7.5l6.3 5.3C38.9 37.1 44 31.1 44 24c0-1.3-.1-2.5-.4-3.5z"
      />
    </svg>
  )
}
