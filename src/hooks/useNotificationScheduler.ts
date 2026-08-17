import { useEffect, useRef } from 'react'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useAppStore } from '../store/useAppStore'
import { scheduleNorthNotifications } from '../lib/notifications/scheduleNotifications'

/** Keep local notification schedules in sync with preferences and today's task state. */
export function useNotificationScheduler() {
  const hydrated = useAppStore((s) => s.hydrated)
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const dailySelection = useAppStore((s) => s.dailySelection)
  const preferences = useAppStore((s) => s.user.preferences)
  const syncing = useRef(false)

  const reschedule = async () => {
    if (!Capacitor.isNativePlatform() || syncing.current) return
    syncing.current = true
    try {
      const state = useAppStore.getState()
      await scheduleNorthNotifications({
        tasks: state.tasks,
        history: state.history,
        dailySelection: state.dailySelection,
        preferences: state.user.preferences,
      })
    } catch {
      /* best-effort */
    } finally {
      syncing.current = false
    }
  }

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !hydrated) return
    void reschedule()
  }, [
    hydrated,
    tasks,
    history,
    dailySelection,
    preferences.notifications,
    preferences.morningReminderTime,
  ])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const sub = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void reschedule()
    })
    return () => {
      void sub.then((h) => h.remove())
    }
  }, [])
}
