export type TaskStatus = 'todo' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'
export type GoalType = 'long_term' | 'short_term'
export type GoalStatus = 'active' | 'completed' | 'paused'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime'
export type Recurrence =
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'custom'

export type ColorTheme = 'midnight' | 'forest' | 'copper' | 'lilac'

export type TaskArea = 'fitness' | 'money' | 'studies' | 'habit' | 'work' | 'personal'

export interface UserPreferences {
  theme: 'dark'
  colorTheme: ColorTheme
  weekStartsOn: 0 | 1
  notifications: boolean
  /** Local-time morning reminder in HH:mm (24h). */
  morningReminderTime: string
  /** Subtle tick when a task is marked complete. */
  completionSound: boolean
  defaultReminder: boolean
  hapticFeedback: boolean
  /** Tasks completed per day required to count as a successful streak day. */
  dailyMinimum: number
}

export interface GoogleTasksConnection {
  connected: boolean
  accessToken: string | null
  listId: string | null
  lastSyncedAt: string | null
  syncError: string | null
}

export interface Friend {
  id: string
  name: string
  color: string
}

export interface FriendActivity {
  id: string
  friendId: string
  date: string
  completed: boolean
  completedAt?: string
}

export interface User {
  id: string
  name: string
  preferences: UserPreferences
}

export interface DailySelection {
  dateKey: string
  taskIds: string[]
}

export interface OnboardingTaskDraft {
  title: string
  priority: TaskPriority
  area?: TaskArea
}

export interface Category {
  id: string
  name: string
  color: string
}

export interface Milestone {
  id: string
  goalId: string
  title: string
  completed: boolean
  completedAt?: string
  order: number
}

export interface Goal {
  id: string
  title: string
  description: string
  type: GoalType
  area: TaskArea
  parentId?: string
  deadline?: string
  status: GoalStatus
  categoryId?: string
  notes?: string
  createdAt: string
  completedAt?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  dueTime?: string
  timeOfDay: TimeOfDay
  recurrence: Recurrence
  scheduleDays?: number[]
  area?: TaskArea
  goalId?: string
  milestoneId?: string
  categoryId?: string
  estimatedMinutes?: number
  reminder?: boolean
  notes?: string
  createdAt: string
  completedAt?: string
  googleTaskId?: string
}

export interface TaskHistoryEntry {
  id: string
  taskId: string
  date: string
  completed: boolean
  completedAt?: string
}

export type StatsPeriod = 'day' | 'week' | 'month' | 'year'
