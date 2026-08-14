/**
 * Lightweight streak regression checks (no test runner required).
 * Run: node scripts/verify-streak.mjs
 */

import { format, subDays, startOfDay } from 'date-fns'

const DEFAULT_DAILY_MINIMUM = 5

function toDateKey(d) {
  return format(startOfDay(d), 'yyyy-MM-dd')
}

function countCompletionsForDate(history, dateKey, taskIds) {
  return history.filter(
    (h) =>
      h.date === dateKey &&
      h.completed &&
      (!taskIds || taskIds.has(h.taskId)),
  ).length
}

function isSuccessfulStreakDay(history, dateKey, dailyMinimum, taskIds) {
  const minimum = Math.max(1, dailyMinimum)
  return countCompletionsForDate(history, dateKey, taskIds) >= minimum
}

function calcStreak(history, dailyMinimum, now = new Date()) {
  const todayKey = toDateKey(now)
  const todaySuccess = isSuccessfulStreakDay(history, todayKey, dailyMinimum)
  let cursor = startOfDay(now)
  if (!todaySuccess) cursor = subDays(cursor, 1)
  let streak = 0
  while (isSuccessfulStreakDay(history, toDateKey(cursor), dailyMinimum)) {
    streak += 1
    cursor = subDays(cursor, 1)
  }
  return streak
}

function histForDay(dateKey, count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `h_${dateKey}_${i}`,
    taskId: `t_${dateKey}_${i}`,
    date: dateKey,
    completed: true,
  }))
}

function dayOffset(now, offset) {
  return toDateKey(subDays(startOfDay(now), offset))
}

const now = new Date('2026-08-14T15:00:00')
const min = 5
let passed = 0
let failed = 0

function assert(name, actual, expected) {
  if (actual === expected) {
    passed += 1
    return
  }
  failed += 1
  console.error(`FAIL: ${name} — expected ${expected}, got ${actual}`)
}

assert('1 new user', calcStreak([], min, now), 0)
assert('2 min=5 no completions', calcStreak([], min, now), 0)

const d0 = dayOffset(now, 0)
assert('3 four today in progress', calcStreak(histForDay(d0, 4), min, now), 0)

assert('4 exactly five today', calcStreak(histForDay(d0, 5), min, now), 1)
assert('5 eight today', calcStreak(histForDay(d0, 8), min, now), 1)

const twoDays = [
  ...histForDay(dayOffset(now, 0), 5),
  ...histForDay(dayOffset(now, 1), 6),
]
assert('6 two consecutive days', calcStreak(twoDays, min, now), 2)

const threeDays = [
  ...histForDay(dayOffset(now, 0), 8),
  ...histForDay(dayOffset(now, 1), 5),
  ...histForDay(dayOffset(now, 2), 7),
]
assert('7 three consecutive days', calcStreak(threeDays, min, now), 3)

const missDay = [
  ...histForDay(dayOffset(now, 0), 8),
  ...histForDay(dayOffset(now, 2), 6),
]
assert('8 miss one day', calcStreak(missDay, min, now), 1)

const inProgress = [
  ...histForDay(dayOffset(now, 0), 2),
  ...histForDay(dayOffset(now, 1), 5),
  ...histForDay(dayOffset(now, 2), 5),
  ...histForDay(dayOffset(now, 3), 5),
  ...histForDay(dayOffset(now, 4), 5),
  ...histForDay(dayOffset(now, 5), 5),
  ...histForDay(dayOffset(now, 6), 5),
  ...histForDay(dayOffset(now, 7), 5),
]
assert('9 today in progress preserves prior streak', calcStreak(inProgress, min, now), 7)

const failedYesterday = [
  ...histForDay(dayOffset(now, 0), 2),
  ...histForDay(dayOffset(now, 1), 4),
  ...histForDay(dayOffset(now, 2), 5),
]
assert('10 failed yesterday breaks streak', calcStreak(failedYesterday, min, now), 0)

const toggled = histForDay(d0, 5)
assert('11 five completions counts', calcStreak(toggled, min, now), 1)

console.log(`Streak checks: ${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
