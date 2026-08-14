import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { toDateKey } from '../lib/dates'
import { syncTasksToGoogle } from '../services/googleTasks'

/** Push today's selected tasks to Google Tasks when connected */
export function useGoogleTasksSync() {
  const googleTasks = useAppStore((s) => s.googleTasks)
  const tasks = useAppStore((s) => s.tasks)
  const dailySelection = useAppStore((s) => s.dailySelection)
  const history = useAppStore((s) => s.history)
  const setGoogleTasksSyncState = useAppStore((s) => s.setGoogleTasksSyncState)
  const applyGoogleTaskIds = useAppStore((s) => s.applyGoogleTaskIds)

  useEffect(() => {
    if (
      !googleTasks.connected ||
      !googleTasks.accessToken ||
      !googleTasks.listId
    ) {
      return
    }

    if (dailySelection.taskIds.length < 5) return

    const todayKey = toDateKey(new Date())
    const completedToday = new Set(
      history
        .filter((h) => h.date === todayKey && h.completed)
        .map((h) => h.taskId),
    )
    const googleIds = Object.fromEntries(
      tasks
        .filter((t) => t.googleTaskId)
        .map((t) => [t.id, t.googleTaskId!]),
    )

    syncTasksToGoogle(
      googleTasks.accessToken,
      googleTasks.listId,
      tasks,
      dailySelection.taskIds,
      completedToday,
      googleIds,
    )
      .then((mapping) => {
        applyGoogleTaskIds(mapping)
        setGoogleTasksSyncState({
          lastSyncedAt: new Date().toISOString(),
          syncError: null,
        })
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Google Tasks sync failed'
        setGoogleTasksSyncState({ syncError: message })
      })
  }, [
    googleTasks.connected,
    googleTasks.accessToken,
    googleTasks.listId,
    tasks,
    dailySelection,
    history,
    applyGoogleTaskIds,
    setGoogleTasksSyncState,
  ])
}
