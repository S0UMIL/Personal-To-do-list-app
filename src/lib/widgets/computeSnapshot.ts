import { toDateKey } from '../dates'
import {
  calcCompletion,
  calcStreak,
  getTodaySelectedTasks,
  areaTaskCounts,
} from '../stats'
import { buildRecommendations } from '../recommendations'
import { dailyWorkQuote } from '../quotes'
import { TASK_AREAS } from '../taskAreas'
import type {
  Task,
  TaskHistoryEntry,
  DailySelection,
  GoogleTasksConnection,
  User,
} from '../../types'
import type { WidgetSnapshot } from './types'

type SnapshotInput = {
  tasks: Task[]
  history: TaskHistoryEntry[]
  dailySelection: DailySelection
  googleTasks: GoogleTasksConnection
  user: User
}

/** Build the minimal widget payload from local app state (same math as WidgetsPage). */
export function computeWidgetSnapshot(state: SnapshotInput): WidgetSnapshot {
  const todayKey = toDateKey(new Date())
  const dailyMinimum = state.user.preferences.dailyMinimum ?? 5
  const today = getTodaySelectedTasks(
    state.tasks,
    state.dailySelection,
    state.history,
    todayKey,
  )
  const stats = calcCompletion(today)
  const streak = calcStreak(state.history, dailyMinimum)
  const lockedIn =
    state.dailySelection.dateKey === todayKey && state.dailySelection.taskIds.length >= 5
  const alertCount = buildRecommendations(state.tasks, state.history).filter(
    (r) => r.flagged,
  ).length

  const previewTasks = [...today]
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (b.status === 'completed' && a.status !== 'completed') return -1
      return 0
    })
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      title: t.title,
      completed: t.status === 'completed',
    }))

  const nextFocusTask = [...today]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 }
      return rank[a.priority] - rank[b.priority]
    })[0]

  const areas = TASK_AREAS.map((a) => ({
    label: a.label,
    ...areaTaskCounts(a.value, state.tasks, state.history, todayKey),
  })).filter((a) => a.total > 0)

  const remaining = Math.max(0, stats.scheduled - stats.completed)
  const progressPct =
    stats.scheduled > 0 ? Math.round((stats.completed / stats.scheduled) * 100) : 0
  const highPriorityLeft = today.filter(
    (t) => t.status !== 'completed' && t.priority === 'high',
  ).length
  const syncedCount = today.filter((t) => t.googleTaskId).length
  const quote = dailyWorkQuote(todayKey)

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    todayKey,
    today: {
      completed: stats.completed,
      scheduled: stats.scheduled,
      remaining,
      progressPct,
      lockedIn,
      lockedCount: lockedIn ? state.dailySelection.taskIds.length : 0,
      previewTasks,
      highPriorityLeft,
      done: stats.completed,
    },
    streak,
    alerts: alertCount,
    nextFocus: nextFocusTask
      ? {
          taskId: nextFocusTask.id,
          title: nextFocusTask.title,
          priority: nextFocusTask.priority,
        }
      : null,
    libraryCount: state.tasks.length,
    areas,
    quote: { text: quote.text, author: quote.author },
    googleTasks: {
      connected: state.googleTasks.connected,
      syncedCount,
      todayTotal: today.length,
      lastSyncedAt: state.googleTasks.lastSyncedAt,
      syncError: state.googleTasks.syncError,
    },
  }
}
