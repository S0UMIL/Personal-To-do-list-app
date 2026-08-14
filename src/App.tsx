import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext'
import { RequireAuth } from './components/auth/RequireAuth'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './features/auth/LoginPage'
import { OnboardingPage } from './features/onboarding/OnboardingPage'
import { OnboardingWalkthrough } from './features/onboarding/OnboardingWalkthrough'
import { OnboardingTasks } from './features/onboarding/OnboardingTasks'
import { HomePage } from './features/home/HomePage'
import { FriendsPage } from './features/friends/FriendsPage'
import { GoalsPage } from './features/goals/GoalsPage'
import { GoalDetailPage } from './features/goals/GoalDetailPage'
import { StatsPage } from './features/stats/StatsPage'
import { TasksPage } from './features/tasks/TasksPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { WidgetsPage } from './features/widgets/WidgetsPage'
import { RecommendationsPage } from './features/recommendations/RecommendationsPage'
import { useAppStore } from './store/useAppStore'

function OnboardingGate({ children }: { children: React.ReactNode }) {
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

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

export default function App() {
  return (
    <SupabaseAuthProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/onboarding"
            element={
              <RequireAuth>
                <OnboardingPage />
              </RequireAuth>
            }
          >
            <Route index element={<OnboardingWalkthrough />} />
            <Route path="tasks" element={<OnboardingTasks />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </Route>
          <Route
            element={
              <RequireAuth>
                <OnboardingGate>
                  <AppShell />
                </OnboardingGate>
              </RequireAuth>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="goals/:id" element={<GoalDetailPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="widgets" element={<WidgetsPage />} />
            <Route path="calendar" element={<Navigate to="/tasks" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </SupabaseAuthProvider>
  )
}
