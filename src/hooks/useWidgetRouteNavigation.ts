import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { WidgetBridge } from '../lib/widgets/WidgetBridge'

const WIDGET_ROUTES = new Set([
  '/',
  '/stats',
  '/recommendations',
  '/tasks',
  '/goals',
  '/widgets',
  '/profile',
])

/** Consumes a pending widget route from MainActivity and navigates in-app. */
export function useWidgetRouteNavigation() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const consumeRoute = async () => {
      try {
        const { route } = await WidgetBridge.getPendingWidgetRoute()
        if (route && WIDGET_ROUTES.has(route)) {
          navigate(route)
        }
      } catch {
        /* best-effort */
      }
    }

    void consumeRoute()

    const sub = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void consumeRoute()
    })

    return () => {
      void sub.then((h) => h.remove())
    }
  }, [navigate])
}
