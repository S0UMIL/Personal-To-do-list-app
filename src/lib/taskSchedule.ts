import type { Task, TaskHistoryEntry } from '../types'
import { toDateKey, parseDateKey } from './dates'

/** Is this task scheduled to appear on the given date? */
export function isTaskScheduledOn(task: Task, date: Date | string): boolean {
  const key = typeof date === 'string' ? date : toDateKey(date)
  const dateObj = typeof date === 'string' ? parseDateKey(date) : date

  if (task.scheduleDays && task.scheduleDays.length > 0) {
    if (key < task.dueDate) return false
    return task.scheduleDays.includes(dateObj.getDay())
  }

  return task.dueDate === key
}

export function isCompletedOnDate(
  task: Task,
  dateKey: string,
  history: TaskHistoryEntry[],
): boolean {
  if (history.some((h) => h.taskId === task.id && h.date === dateKey && h.completed)) {
    return true
  }
  if (!task.scheduleDays?.length && task.status === 'completed') {
    const completedKey = task.completedAt ? toDateKey(task.completedAt) : task.dueDate
    return completedKey === dateKey
  }
  return false
}

export function taskStatusOnDate(
  task: Task,
  dateKey: string,
  history: TaskHistoryEntry[],
): Task['status'] {
  return isCompletedOnDate(task, dateKey, history) ? 'completed' : 'todo'
}

export function getWeekdayOptions(weekStartsOn: 0 | 1 = 1) {
  const order = weekStartsOn === 1 ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6]
  const labels =
    weekStartsOn === 1
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return order.map((value, i) => ({ value, label: labels[i], short: labels[i].charAt(0) }))
}

export function formatScheduleDays(days: number[], weekStartsOn: 0 | 1 = 1): string {
  if (!days.length) return ''
  const opts = getWeekdayOptions(weekStartsOn)
  return opts
    .filter((o) => days.includes(o.value))
    .map((o) => o.label)
    .join(', ')
}
