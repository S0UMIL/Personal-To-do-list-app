import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAppStore } from '../store/useAppStore'
import { toDateKey } from '../lib/dates'
import { calcCompletionForDate } from '../lib/stats'
import { pushDailyProgress } from '../services/cloud'

/** Push today's completion stats to Firestore when logged in */
export function useProgressSync() {
  const { isAuthenticated, profile } = useAuth()
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)

  useEffect(() => {
    if (!isAuthenticated || !profile) return

    const todayKey = toDateKey(new Date())
    const stats = calcCompletionForDate(tasks, todayKey, history)

    pushDailyProgress(profile.uid, todayKey, {
      completed: stats.completed,
      total: stats.scheduled,
      rate: stats.rate,
    }).catch(() => {
      /* silent — local tasks still work */
    })
  }, [isAuthenticated, profile, tasks, history])
}
