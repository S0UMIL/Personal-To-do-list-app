import { Navigate, useLocation } from 'react-router-dom'
import { useCloudIdentity } from '../../hooks/useCloudIdentity'
import { hasAuthCallback } from '../../lib/authCallback'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, isOfflineMode } = useCloudIdentity()
  const location = useLocation()

  if (hasAuthCallback(location.search, location.hash)) {
    return (
      <Navigate
        to={`/login${location.search}${location.hash}`}
        replace
      />
    )
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg, #08090c)',
          color: 'var(--text-muted, #8b909a)',
          fontSize: '0.875rem',
        }}
      >
        Signing you in…
      </div>
    )
  }

  if (!isAuthenticated && !isOfflineMode) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
