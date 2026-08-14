import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext'
import { useAppStore } from '../store/useAppStore'
import { toDateKey } from '../lib/dates'
import { calcCompletion, getTodaySelectedTasks } from '../lib/stats'
import { pushDailyProgress } from '../services/cloud'
import { upsertDailyProgress } from '../services/supabase/progress'

/**
 * Push today's aggregate progress for the leaderboard.
 * Never sends task titles, notes, goals, or completion history.
 * Failures are silent so local productivity keeps working.
 */
export function useProgressSync() {
  const firebase = useAuth()
  const supabase = useSupabaseAuth()
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const dailySelection = useAppStore((s) => s.dailySelection)

  useEffect(() => {
    const todayKey = toDateKey(new Date())
    const todayTasks = getTodaySelectedTasks(tasks, dailySelection, history, todayKey)
    const stats = calcCompletion(todayTasks)
    const payload = {
      completed: stats.completed,
      total: stats.scheduled,
      rate: stats.rate,
    }

    if (supabase.isAuthenticated && supabase.profile) {
      upsertDailyProgress(supabase.profile.id, todayKey, payload).catch(() => {
        /* retry on next local change / reconnect */
      })
    }

    if (firebase.isAuthenticated && firebase.profile) {
      pushDailyProgress(firebase.profile.uid, todayKey, payload).catch(() => {
        /* silent — local tasks still work */
      })
    }
  }, [
    firebase.isAuthenticated,
    firebase.profile,
    supabase.isAuthenticated,
    supabase.profile,
    tasks,
    history,
    dailySelection,
  ])
}
