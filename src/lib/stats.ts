import type { Task, Goal, Milestone, TaskHistoryEntry, TaskArea } from '../types'
import { createId } from './id'
import { toDateKey, lastNDays, subDays, parseISO, startOfDay } from './dates'
import { format, eachDayOfInterval } from 'date-fns'
import { isTaskScheduledOn, isCompletedOnDate } from './taskSchedule'

export interface CompletionStats {
  completed: number
  scheduled: number
  rate: number
  missed: number
}

export interface DayActivity {
  date: string
  completed: number
  scheduled: number
  rate: number
}

export interface WeeklySummary {
  tasksCompleted: number
  completionRate: number
  bestDay: string | null
  mostProductiveHour: string | null
  goalsAdvanced: number
}

export interface MonthlyOverview {
  totalTasks: number
  completedTasks: number
  completionRate: number
  missedTasks: number
  averageDailyCompletion: number
  longestStreak: number
  goalsCompleted: number
  mostProductiveDay: string | null
  mostProductiveTime: string | null
}

function inRange(dateKey: string, start: Date, end: Date): boolean {
  const d = startOfDay(parseISO(dateKey)).getTime()
  return d >= startOfDay(start).getTime() && d <= startOfDay(end).getTime()
}

export function getTasksForDate(
  tasks: Task[],
  dateKey: string,
  history: TaskHistoryEntry[] = [],
): Task[] {
  const date = parseISO(dateKey)
  return tasks.filter((t) => isTaskScheduledOn(t, date)).map((t) => ({
    ...t,
    status: taskStatusOnDate(t, dateKey, history),
  }))
}

function taskStatusOnDate(
  task: Task,
  dateKey: string,
  history: TaskHistoryEntry[],
): Task['status'] {
  return isCompletedOnDate(task, dateKey, history) ? 'completed' : 'todo'
}

export function calcCompletionForDate(
  tasks: Task[],
  dateKey: string,
  history: TaskHistoryEntry[] = [],
): CompletionStats {
  const dayTasks = getTasksForDate(tasks, dateKey, history)
  return calcCompletion(dayTasks)
}

export function calcCompletion(tasks: Task[]): CompletionStats {
  const scheduled = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const missed = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate < toDateKey(new Date()),
  ).length
  const rate = scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100)
  return { completed, scheduled, rate, missed }
}

export function calcPeriodCompletion(
  tasks: Task[],
  start: Date,
  end: Date,
  history: TaskHistoryEntry[] = [],
): CompletionStats {
  const series = buildActivitySeries(tasks, start, end, history)
  const scheduled = series.reduce((sum, d) => sum + d.scheduled, 0)
  const completed = series.reduce((sum, d) => sum + d.completed, 0)
  const missed = series.reduce(
    (sum, d) => sum + Math.max(0, d.scheduled - d.completed),
    0,
  )
  const rate = scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100)
  return { completed, scheduled, rate, missed }
}

export function buildActivitySeries(
  tasks: Task[],
  start: Date,
  end: Date,
  history: TaskHistoryEntry[] = [],
): DayActivity[] {
  const days = eachDayOfInterval({ start: startOfDay(start), end: startOfDay(end) })
  return days.map((day) => {
    const key = toDateKey(day)
    const dayTasks = getTasksForDate(tasks, key, history)
    const stats = calcCompletion(dayTasks)
    return {
      date: key,
      completed: stats.completed,
      scheduled: stats.scheduled,
      rate: stats.rate,
    }
  })
}

/** Consecutive days (ending today or yesterday) with ≥1 completed task */
export function calcStreak(tasks: Task[], history: TaskHistoryEntry[] = []): number {
  const completedDates = new Set<string>()

  for (const t of tasks) {
    if (t.status === 'completed' && t.completedAt) {
      completedDates.add(toDateKey(t.completedAt))
    } else if (t.status === 'completed') {
      completedDates.add(t.dueDate)
    }
  }

  for (const h of history) {
    if (h.completed && h.completedAt) completedDates.add(toDateKey(h.completedAt))
    else if (h.completed) completedDates.add(h.date)
  }

  let streak = 0
  let cursor = startOfDay(new Date())
  const todayKey = toDateKey(cursor)

  // Allow streak to continue if today has no completions yet but yesterday did
  if (!completedDates.has(todayKey)) {
    cursor = subDays(cursor, 1)
  }

  while (completedDates.has(toDateKey(cursor))) {
    streak += 1
    cursor = subDays(cursor, 1)
  }

  return streak
}

export function calcLongestStreak(tasks: Task[], lookbackDays = 365): number {
  const days = lastNDays(lookbackDays)
  const completedByDay = new Set(
    tasks
      .filter((t) => t.status === 'completed')
      .map((t) => (t.completedAt ? toDateKey(t.completedAt) : t.dueDate)),
  )

  let longest = 0
  let current = 0
  for (const day of days) {
    if (completedByDay.has(toDateKey(day))) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 0
    }
  }
  return longest
}

export function areaProgress(area: TaskArea, tasks: Task[]): number {
  const linked = tasks.filter((t) => t.area === area)
  if (linked.length === 0) return 0
  const done = linked.filter((t) => t.status === 'completed').length
  return Math.round((done / linked.length) * 100)
}

export function goalProgress(goalId: string, milestones: Milestone[], tasks: Task[]): number {
  const ms = milestones.filter((m) => m.goalId === goalId)
  if (ms.length > 0) {
    const done = ms.filter((m) => m.completed).length
    return Math.round((done / ms.length) * 100)
  }

  const linked = tasks.filter((t) => t.goalId === goalId)
  if (linked.length === 0) return 0
  const done = linked.filter((t) => t.status === 'completed').length
  return Math.round((done / linked.length) * 100)
}

export function calcWeeklySummary(
  tasks: Task[],
  start: Date,
  end: Date,
): WeeklySummary {
  const periodTasks = tasks.filter((t) => inRange(t.dueDate, start, end))
  const stats = calcCompletion(periodTasks)
  const series = buildActivitySeries(tasks, start, end)

  let bestDay: string | null = null
  let bestCount = -1
  for (const day of series) {
    if (day.completed > bestCount) {
      bestCount = day.completed
      bestDay = format(parseISO(day.date), 'EEEE')
    }
  }

  const hourBuckets = new Map<number, number>()
  for (const t of periodTasks.filter((x) => x.status === 'completed' && x.dueTime)) {
    const hour = Number(t.dueTime!.split(':')[0])
    hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + 1)
  }
  let mostProductiveHour: string | null = null
  let maxH = -1
  for (const [h, count] of hourBuckets) {
    if (count > maxH) {
      maxH = count
      const suffix = h >= 12 ? 'PM' : 'AM'
      const display = h % 12 === 0 ? 12 : h % 12
      mostProductiveHour = `${display} ${suffix}`
    }
  }

  const advancedAreas = new Set(
    periodTasks
      .filter((t) => t.status === 'completed' && t.area)
      .map((t) => t.area as string),
  )

  return {
    tasksCompleted: stats.completed,
    completionRate: stats.rate,
    bestDay: bestCount > 0 ? bestDay : null,
    mostProductiveHour,
    goalsAdvanced: advancedAreas.size,
  }
}

export function calcMonthlyOverview(
  tasks: Task[],
  goals: Goal[],
  start: Date,
  end: Date,
): MonthlyOverview {
  const periodTasks = tasks.filter((t) => inRange(t.dueDate, start, end))
  const stats = calcCompletion(periodTasks)
  const series = buildActivitySeries(tasks, start, end)
  const daysWithTasks = series.filter((d) => d.scheduled > 0).length || 1

  let bestDay: string | null = null
  let bestCount = -1
  for (const day of series) {
    if (day.completed > bestCount) {
      bestCount = day.completed
      bestDay = format(parseISO(day.date), 'EEEE')
    }
  }

  const hourBuckets = new Map<number, number>()
  for (const t of periodTasks.filter((x) => x.status === 'completed' && x.dueTime)) {
    const hour = Number(t.dueTime!.split(':')[0])
    hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + 1)
  }
  let mostProductiveTime: string | null = null
  let maxH = -1
  for (const [h, count] of hourBuckets) {
    if (count > maxH) {
      maxH = count
      const suffix = h >= 12 ? 'PM' : 'AM'
      const display = h % 12 === 0 ? 12 : h % 12
      mostProductiveTime = `${display} ${suffix}`
    }
  }

  const goalsCompleted = goals.filter(
    (g) =>
      g.status === 'completed' &&
      g.completedAt &&
      inRange(toDateKey(g.completedAt), start, end),
  ).length

  return {
    totalTasks: stats.scheduled,
    completedTasks: stats.completed,
    completionRate: stats.rate,
    missedTasks: stats.missed,
    averageDailyCompletion: Math.round((stats.completed / daysWithTasks) * 10) / 10,
    longestStreak: calcLongestStreak(tasks),
    goalsCompleted,
    mostProductiveDay: bestCount > 0 ? bestDay : null,
    mostProductiveTime,
  }
}

export function compareToPreviousWeek(tasks: Task[]): number {
  const now = new Date()
  const thisWeek = lastNDays(7)
  const prevWeek = lastNDays(7, subDays(now, 7))

  const countIn = (days: Date[]) => {
    const keys = new Set(days.map(toDateKey))
    return tasks.filter((t) => {
      if (t.status !== 'completed') return false
      const key = t.completedAt ? toDateKey(t.completedAt) : t.dueDate
      return keys.has(key)
    }).length
  }

  const thisCompleted = countIn(thisWeek)
  const prevCompleted = countIn(prevWeek)
  if (prevCompleted === 0) return thisCompleted > 0 ? 100 : 0
  return Math.round(((thisCompleted - prevCompleted) / prevCompleted) * 100)
}

export function createHistoryEntry(task: Task): TaskHistoryEntry {
  return {
    id: createId('hist'),
    taskId: task.id,
    date: task.dueDate,
    completed: task.status === 'completed',
    completedAt: task.completedAt,
  }
}

export function inferTimeOfDay(time?: string): 'morning' | 'afternoon' | 'evening' | 'anytime' {
  if (!time) return 'anytime'
  const hour = Number(time.split(':')[0])
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
