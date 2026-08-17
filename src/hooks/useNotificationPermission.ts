import { useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { useAppStore } from '../store/useAppStore'
import {
  hasNotificationPermission,
  requestNotificationPermission,
} from '../lib/notifications/scheduleNotifications'
import { PERMISSION_REQUESTED_KEY } from '../lib/notifications/notificationIds'

/**
 * Ask for notification permission once after onboarding, when notifications are enabled.
 * Never blocks the app; denial is remembered so we do not nag.
 */
export function useNotificationPermission() {
  const hydrated = useAppStore((s) => s.hydrated)
  const notificationsEnabled = useAppStore((s) => s.user.preferences.notifications)
  const asked = useRef(false)

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !hydrated || asked.current) return
    if (!notificationsEnabled) return

    const alreadyRequested =
      typeof localStorage !== 'undefined' &&
      localStorage.getItem(PERMISSION_REQUESTED_KEY) === '1'
    if (alreadyRequested) return

    asked.current = true

    void (async () => {
      const granted = await hasNotificationPermission()
      if (!granted) {
        await requestNotificationPermission()
      }
      localStorage.setItem(PERMISSION_REQUESTED_KEY, '1')
    })()
  }, [hydrated, notificationsEnabled])
}
