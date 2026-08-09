import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, isOfflineMode } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        Loading…
      </div>
    )
  }

  if (!isAuthenticated && !isOfflineMode) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
