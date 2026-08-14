import type { Task, TaskHistoryEntry, TaskPriority } from '../types'
import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'
import { toDateKey } from './dates'

export const SKIP_THRESHOLDS: Record<TaskPriority, number> = {
  high: 4,
  medium: 5,
  low: 7,
}

export interface TaskRecommendation {
  task: Task
  daysSince: number
  threshold: number
  flagged: boolean
  approaching: boolean
}

export function daysSinceLastCompletion(
  taskId: string,
  history: TaskHistoryEntry[],
  today: Date = new Date(),
): number {
  const completed = history
    .filter((h) => h.taskId === taskId && h.completed)
    .map((h) => h.completedAt ?? h.date)
    .sort((a, b) => b.localeCompare(a))

  if (completed.length === 0) {
    return Number.POSITIVE_INFINITY
  }

  const last = completed[0]
  const lastDate = startOfDay(parseISO(last.length > 10 ? last : `${last}T12:00:00`))
  return differenceInCalendarDays(startOfDay(today), lastDate)
}

export function buildRecommendations(
  tasks: Task[],
  history: TaskHistoryEntry[],
  today: Date = new Date(),
): TaskRecommendation[] {
  return tasks
    .map((task) => {
      const daysSince = daysSinceLastCompletion(task.id, history, today)
      const threshold = SKIP_THRESHOLDS[task.priority]
      const flagged = daysSince >= threshold
      const approaching = !flagged && daysSince >= Math.max(1, threshold - 2)
      return { task, daysSince, threshold, flagged, approaching }
    })
    .sort((a, b) => {
      if (a.flagged !== b.flagged) return a.flagged ? -1 : 1
      if (a.approaching !== b.approaching) return a.approaching ? -1 : 1
      const priorityRank = { high: 0, medium: 1, low: 2 }
      if (priorityRank[a.task.priority] !== priorityRank[b.task.priority]) {
        return priorityRank[a.task.priority] - priorityRank[b.task.priority]
      }
      const aDays = Number.isFinite(a.daysSince) ? a.daysSince : 9999
      const bDays = Number.isFinite(b.daysSince) ? b.daysSince : 9999
      return bDays - aDays
    })
}

export function formatDaysSince(days: number): string {
  if (!Number.isFinite(days)) return 'Never done'
  if (days === 0) return 'Done today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export function todayKey(today: Date = new Date()): string {
  return toDateKey(today)
}
