import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext'
import { useCloudIdentity } from '../../hooks/useCloudIdentity'
import { authCallbackError, hasAuthCallback } from '../../lib/authCallback'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAppStore } from '../../store/useAppStore'
import styles from './LoginPage.module.css'

type Mode = 'login' | 'signup'

export function LoginPage() {
  const firebase = useAuth()
  const supabase = useSupabaseAuth()
  const { isAuthenticated, isOfflineMode, loading: identityLoading } = useCloudIdentity()
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)
  const hydrated = useAppStore((s) => s.hydrated)
  const location = useLocation()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(
    () => authCallbackError(location.search, location.hash),
  )
  const [info, setInfo] = useState<string | null>(null)

  const callbackErr = authCallbackError(location.search, location.hash)
  const waitingOnCallback =
    hasAuthCallback(location.search, location.hash) &&
    !isAuthenticated &&
    !error &&
    !callbackErr

  useEffect(() => {
    if (!waitingOnCallback) return
    const t = window.setTimeout(() => {
      setError(
        'Google sign-in did not finish. In Supabase, add http://localhost:5173/login to Redirect URLs, and confirm the Google provider is enabled.',
      )
    }, 12000)
    return () => window.clearTimeout(t)
  }, [waitingOnCallback])

  if (waitingOnCallback || identityLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p className={styles.hint}>
            {waitingOnCallback ? 'Finishing Google sign-in…' : 'Loading…'}
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
    setInfo(null)
    setBusy(true)
    try {
      if (supabase.configured) {
        await supabase.signInWithGoogle(mode)
        return
      }
      await firebase.signInGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
      setBusy(false)
    }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (!supabase.configured) {
      setError('Email login requires Supabase. Use Google or continue offline.')
      return
    }
    if (!email.trim() || password.length < 6) {
      setError('Enter an email and a password of at least 6 characters.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { needsEmailConfirm } = await supabase.signUpWithEmail(
          email.trim(),
          password,
        )
        if (needsEmailConfirm) {
          setInfo('Check your email to confirm your account, then log in.')
        }
      } else {
        await supabase.signInWithEmail(email.trim(), password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not authenticate')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.mark} aria-hidden />
        <h1 className={`serif ${styles.title}`}>North</h1>
        <p className={styles.subtitle}>
          {mode === 'login'
            ? 'Log in to compete with friends. Your tasks stay on this device.'
            : 'Create an account for the friends leaderboard. Tasks stay on this device.'}
        </p>

        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`${styles.tab} ${mode === 'login' ? styles.tabOn : ''}`}
            onClick={() => {
              setMode('login')
              setError(null)
              setInfo(null)
            }}
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`${styles.tab} ${mode === 'signup' ? styles.tabOn : ''}`}
            onClick={() => {
              setMode('signup')
              setError(null)
              setInfo(null)
            }}
          >
            Sign up
          </button>
        </div>

        {cloudReady ? (
          <>
            <Button
              fullWidth
              size="lg"
              onClick={handleGoogle}
              disabled={loading}
            >
              <GoogleIcon />
              {mode === 'login' ? 'Log in with Google' : 'Sign up with Google'}
            </Button>

            <p className={styles.divider}>or email</p>

            <form className={styles.form} onSubmit={handleEmail}>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button fullWidth type="submit" disabled={loading}>
                {mode === 'login' ? 'Log in' : 'Create account'}
              </Button>
            </form>

            {error && <p className={styles.error}>{error}</p>}
            {info && <p className={styles.hint}>{info}</p>}
          </>
        ) : (
          <div className={styles.setup}>
            <p>
              Cloud login is not configured yet. Add Supabase keys to <code>.env</code>{' '}
              to enable Google or email sign-in.
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
