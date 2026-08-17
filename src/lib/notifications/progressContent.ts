import { toDateKey } from '../dates'
import { calcCompletion, getTodaySelectedTasks } from '../stats'
import type { DailySelection, Task, TaskHistoryEntry } from '../../types'

export interface ProgressNotificationContent {
  title: string
  body: string
}

/** Aggregate-only notification copy — never includes task titles. */
export function buildProgressNotificationContent(
  tasks: Task[],
  history: TaskHistoryEntry[],
  dailySelection: DailySelection,
): ProgressNotificationContent {
  const todayKey = toDateKey(new Date())
  const todayTasks = getTodaySelectedTasks(tasks, dailySelection, history, todayKey)
  const stats = calcCompletion(todayTasks)
  const remaining = Math.max(0, stats.scheduled - stats.completed)

  if (stats.scheduled > 0 && stats.completed >= stats.scheduled) {
    return {
      title: 'North — Day complete 🎉',
      body: "You've completed all your tasks for today.",
    }
  }

  return {
    title: 'North — Daily progress',
    body: `${stats.completed} tasks completed · ${remaining} remaining`,
  }
}
