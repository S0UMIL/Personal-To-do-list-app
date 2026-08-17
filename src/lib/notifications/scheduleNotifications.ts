import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { DailySelection, Task, TaskHistoryEntry, UserPreferences } from '../../types'
import {
  ALL_NORTH_NOTIFICATION_IDS,
  NOTIFICATION_CHANNEL_ID,
  NOTIFICATION_IDS,
} from './notificationIds'
import { buildProgressNotificationContent } from './progressContent'

const PROGRESS_INTERVAL_HOURS = 5
const MAX_PROGRESS_SLOTS = 2
const LATEST_PROGRESS_HOUR = 21

function parseMorningTime(value: string): { hour: number; minute: number } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return { hour: 8, minute: 0 }
  const hour = Math.min(23, Math.max(0, Number(match[1])))
  const minute = Math.min(59, Math.max(0, Number(match[2])))
  return { hour, minute }
}

function progressFireTimes(morningHour: number, morningMinute: number): Date[] {
  const now = new Date()
  const startMinutes = morningHour * 60 + morningMinute
  const slots: Date[] = []

  for (let i = 1; i <= MAX_PROGRESS_SLOTS + 1; i++) {
    const slotMinutes = startMinutes + i * PROGRESS_INTERVAL_HOURS * 60
    const hour = Math.floor(slotMinutes / 60)
    const minute = slotMinutes % 60
    if (hour > LATEST_PROGRESS_HOUR) continue
    if (slots.length >= MAX_PROGRESS_SLOTS) break

    const at = new Date(now)
    at.setHours(hour, minute, 0, 0)
    if (at > now) slots.push(at)
  }

  return slots
}

async function ensureChannel(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  await LocalNotifications.createChannel({
    id: NOTIFICATION_CHANNEL_ID,
    name: 'North reminders',
    description: 'Morning task selection and daily progress',
    importance: 3,
    visibility: 1,
  })
}

export async function cancelNorthNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  await LocalNotifications.cancel({
    notifications: ALL_NORTH_NOTIFICATION_IDS.map((id) => ({ id })),
  })
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  const { display } = await LocalNotifications.checkPermissions()
  return display === 'granted'
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  const current = await LocalNotifications.checkPermissions()
  if (current.display === 'granted') return true
  const result = await LocalNotifications.requestPermissions()
  return result.display === 'granted'
}

export interface ScheduleNotificationInput {
  tasks: Task[]
  history: TaskHistoryEntry[]
  dailySelection: DailySelection
  preferences: UserPreferences
}

/** Cancel and reschedule morning + progress local notifications. */
export async function scheduleNorthNotifications(
  input: ScheduleNotificationInput,
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  if (!input.preferences.notifications) {
    await cancelNorthNotifications()
    return
  }

  const granted = await hasNotificationPermission()
  if (!granted) {
    await cancelNorthNotifications()
    return
  }

  await ensureChannel()
  await cancelNorthNotifications()

  const { hour, minute } = parseMorningTime(
    input.preferences.morningReminderTime ?? '08:00',
  )
  const progressContent = buildProgressNotificationContent(
    input.tasks,
    input.history,
    input.dailySelection,
  )
  const progressTimes = progressFireTimes(hour, minute)
  const progressIds = [NOTIFICATION_IDS.PROGRESS_1, NOTIFICATION_IDS.PROGRESS_2]

  const notifications = [
    {
      id: NOTIFICATION_IDS.MORNING,
      title: 'North',
      body: 'Time to choose your tasks for today.',
      channelId: NOTIFICATION_CHANNEL_ID,
      schedule: {
        every: 'day' as const,
        on: { hour, minute },
        allowWhileIdle: true,
      },
      extra: { route: '/' },
    },
    ...progressTimes.map((at, index) => ({
      id: progressIds[index]!,
      title: progressContent.title,
      body: progressContent.body,
      channelId: NOTIFICATION_CHANNEL_ID,
      schedule: {
        at,
        allowWhileIdle: true,
      },
      extra: { route: '/' },
    })),
  ]

  await LocalNotifications.schedule({ notifications })
}
