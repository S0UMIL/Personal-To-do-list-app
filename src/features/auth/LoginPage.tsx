import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { configured, signInGoogle, continueOffline, loading, isAuthenticated, isOfflineMode } =
    useAuth()

  if (isAuthenticated || isOfflineMode) {
    return <Navigate to="/" replace />
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.mark} aria-hidden />
        <h1 className={`serif ${styles.title}`}>North</h1>
        <p className={styles.subtitle}>
          Track daily tasks, stay aligned with your goals, and compete with friends.
        </p>

        {configured ? (
          <>
            <Button fullWidth size="lg" onClick={() => signInGoogle()} disabled={loading}>
              <GoogleIcon />
              Continue with Google
            </Button>
            <p className={styles.hint}>
              Sign in to sync progress and compete on the friends leaderboard.
            </p>
          </>
        ) : (
          <div className={styles.setup}>
            <p>
              Cloud login is not configured yet. Add Firebase keys to <code>.env</code> to
              enable Google sign-in and friend competition.
            </p>
            <p className={styles.setupHint}>See <code>.env.example</code> in the project.</p>
          </div>
        )}

        <button type="button" className={styles.offline} onClick={continueOffline}>
          Continue offline (local only)
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
