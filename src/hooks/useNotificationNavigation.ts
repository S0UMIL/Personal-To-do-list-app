import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const ALLOWED_ROUTES = new Set(['/', '/stats', '/tasks', '/profile', '/goals', '/widgets'])

export function useNotificationNavigation() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const sub = LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (event) => {
        const route =
          typeof event.notification.extra?.route === 'string'
            ? event.notification.extra.route
            : '/'
        if (ALLOWED_ROUTES.has(route)) {
          navigate(route)
        }
      },
    )

    return () => {
      void sub.then((h) => h.remove())
    }
  }, [navigate])
}
