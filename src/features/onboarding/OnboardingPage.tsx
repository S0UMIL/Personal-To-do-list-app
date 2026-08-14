import { Navigate, Outlet } from 'react-router-dom'
import { ThemeApplier } from '../../components/layout/ThemeApplier'
import { useAppStore } from '../../store/useAppStore'

export function OnboardingPage() {
  const hydrated = useAppStore((s) => s.hydrated)
  const onboardingComplete = useAppStore((s) => s.onboardingComplete)

  if (!hydrated) {
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

  if (onboardingComplete) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <ThemeApplier />
      <Outlet />
    </>
  )
}
