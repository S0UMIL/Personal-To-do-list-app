import { useEffect, useRef } from 'react'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useAppStore } from '../store/useAppStore'
import { computeWidgetSnapshot } from '../lib/widgets/computeSnapshot'
import { syncWidgetSnapshotToNative } from '../lib/widgets/WidgetBridge'

/**
 * Pushes a minimal widget snapshot to native Android when local data changes.
 * No-op on web. Never bridges tokens or the full Zustand store.
 */
export function useWidgetBridgeSync() {
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const dailySelection = useAppStore((s) => s.dailySelection)
  const dailyMinimum = useAppStore((s) => s.user.preferences.dailyMinimum)
  const googleConnected = useAppStore((s) => s.googleTasks.connected)
  const googleLastSyncedAt = useAppStore((s) => s.googleTasks.lastSyncedAt)
  const googleSyncError = useAppStore((s) => s.googleTasks.syncError)
  const hydrated = useAppStore((s) => s.hydrated)
  const syncing = useRef(false)

  const pushSnapshot = async () => {
    if (!Capacitor.isNativePlatform() || syncing.current) return
    syncing.current = true
    try {
      const state = useAppStore.getState()
      const snapshot = computeWidgetSnapshot(state)
      await syncWidgetSnapshotToNative(snapshot)
    } catch {
      /* widgets are best-effort */
    } finally {
      syncing.current = false
    }
  }

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !hydrated) return
    void pushSnapshot()
  }, [
    hydrated,
    tasks,
    history,
    dailySelection,
    dailyMinimum,
    googleConnected,
    googleLastSyncedAt,
    googleSyncError,
  ])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const sub = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void pushSnapshot()
    })
    return () => {
      void sub.then((h) => h.remove())
    }
  }, [])
}
