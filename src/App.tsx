import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { RequireAuth } from './components/auth/RequireAuth'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './features/auth/LoginPage'
import { HomePage } from './features/home/HomePage'
import { FriendsPage } from './features/friends/FriendsPage'
import { GoalsPage } from './features/goals/GoalsPage'
import { GoalDetailPage } from './features/goals/GoalDetailPage'
import { StatsPage } from './features/stats/StatsPage'
import { CalendarPage } from './features/calendar/CalendarPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { WidgetsPage } from './features/widgets/WidgetsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="goals/:id" element={<GoalDetailPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="widgets" element={<WidgetsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
