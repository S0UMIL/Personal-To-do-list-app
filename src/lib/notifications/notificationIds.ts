/** Fixed local-notification IDs — cancel/reschedule as a set to avoid duplicates. */
export const NOTIFICATION_IDS = {
  MORNING: 1001,
  PROGRESS_1: 2001,
  PROGRESS_2: 2002,
} as const

export const ALL_NORTH_NOTIFICATION_IDS = [
  NOTIFICATION_IDS.MORNING,
  NOTIFICATION_IDS.PROGRESS_1,
  NOTIFICATION_IDS.PROGRESS_2,
] as const

export const NOTIFICATION_CHANNEL_ID = 'north-reminders'

export const PERMISSION_REQUESTED_KEY = 'north-notifications-permission-requested'
