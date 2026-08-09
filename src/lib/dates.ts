import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  differenceInCalendarDays,
  subDays,
} from 'date-fns'

export function toDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

export function parseDateKey(key: string): Date {
  return startOfDay(parseISO(key))
}

export function greetingForHour(hour = new Date().getHours()): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function formatLongDate(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE, MMMM d')
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'Today'
  return format(d, 'MMM d')
}

export function daysRemaining(deadline?: string): number | null {
  if (!deadline) return null
  return differenceInCalendarDays(parseISO(deadline), startOfDay(new Date()))
}

export function getWeekDays(anchor: Date = new Date(), weekStartsOn: 0 | 1 = 1): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn })
  const end = endOfWeek(anchor, { weekStartsOn })
  return eachDayOfInterval({ start, end })
}

export function getMonthDays(anchor: Date = new Date(), weekStartsOn: 0 | 1 = 1): Date[] {
  const monthStart = startOfMonth(anchor)
  const monthEnd = endOfMonth(anchor)
  const gridStart = startOfWeek(monthStart, { weekStartsOn })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn })
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

export function getYearDays(year: number = new Date().getFullYear()): Date[] {
  const start = startOfYear(new Date(year, 0, 1))
  const end = endOfYear(new Date(year, 0, 1))
  return eachDayOfInterval({ start, end })
}

export function periodRange(period: 'day' | 'week' | 'month' | 'year', anchor = new Date(), weekStartsOn: 0 | 1 = 1) {
  switch (period) {
    case 'day':
      return { start: startOfDay(anchor), end: startOfDay(anchor) }
    case 'week':
      return {
        start: startOfWeek(anchor, { weekStartsOn }),
        end: endOfWeek(anchor, { weekStartsOn }),
      }
    case 'month':
      return { start: startOfMonth(anchor), end: endOfMonth(anchor) }
    case 'year':
      return { start: startOfYear(anchor), end: endOfYear(anchor) }
  }
}

export function lastNDays(n: number, end: Date = new Date()): Date[] {
  const start = subDays(startOfDay(end), n - 1)
  return eachDayOfInterval({ start, end: startOfDay(end) })
}

export { isSameDay, isToday, addDays, format, parseISO, startOfDay, subDays }
