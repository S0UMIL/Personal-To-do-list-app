import type {
  Category,
  Goal,
  Milestone,
  Task,
  TaskHistoryEntry,
  User,
  Friend,
  FriendActivity,
  DailySelection,
} from '../types'
import { toDateKey, subDays } from '../lib/dates'
import { format } from 'date-fns'

const today = new Date()
const todayKey = toDateKey(today)
const past = (offset: number) => toDateKey(subDays(today, offset))

export const seedUser: User = {
  id: 'user_ishan',
  name: 'Ishan',
  preferences: {
    theme: 'dark',
    colorTheme: 'midnight',
    weekStartsOn: 1,
    notifications: true,
    defaultReminder: false,
    hapticFeedback: true,
    dailyMinimum: 5,
  },
}

export const seedCategories: Category[] = [
  { id: 'cat_learning', name: 'Learning', color: '#C8A96B' },
  { id: 'cat_fitness', name: 'Fitness', color: '#7A9E7E' },
  { id: 'cat_projects', name: 'Projects', color: '#8BA4B8' },
  { id: 'cat_personal', name: 'Personal', color: '#A89BB0' },
]

export const seedGoals: Goal[] = [
  {
    id: 'goal_fitness',
    title: 'Fitness',
    description: 'Training, movement, nutrition, and recovery.',
    type: 'long_term',
    area: 'fitness',
    status: 'active',
    categoryId: 'cat_fitness',
    createdAt: past(90),
  },
  {
    id: 'goal_money',
    title: 'Money',
    description: 'Saving, investing, and building financial discipline.',
    type: 'long_term',
    area: 'money',
    status: 'active',
    createdAt: past(80),
  },
  {
    id: 'goal_studies',
    title: 'Studies',
    description: 'Learning, coursework, and skill development.',
    type: 'long_term',
    area: 'studies',
    status: 'active',
    categoryId: 'cat_learning',
    createdAt: past(120),
  },
  {
    id: 'goal_habit',
    title: 'Habit',
    description: 'Daily routines that compound over time.',
    type: 'long_term',
    area: 'habit',
    status: 'active',
    createdAt: past(60),
  },
  {
    id: 'goal_work',
    title: 'Work',
    description: 'Projects, career growth, and professional output.',
    type: 'long_term',
    area: 'work',
    status: 'active',
    categoryId: 'cat_projects',
    createdAt: past(45),
  },
  {
    id: 'goal_personal',
    title: 'Personal',
    description: 'Relationships, reflection, and life outside work.',
    type: 'long_term',
    area: 'personal',
    status: 'active',
    categoryId: 'cat_personal',
    createdAt: past(30),
  },
]

export const seedMilestones: Milestone[] = []

function task(
  partial: Omit<Task, 'createdAt' | 'status' | 'dueDate' | 'timeOfDay' | 'recurrence'> & {
    status?: Task['status']
    createdAt?: string
    completedAt?: string
    dueDate?: string
    timeOfDay?: Task['timeOfDay']
    recurrence?: Task['recurrence']
  },
): Task {
  return {
    status: 'todo',
    dueDate: todayKey,
    timeOfDay: 'anytime',
    recurrence: 'none',
    createdAt: past(30),
    ...partial,
  }
}

/** Standing task library (10–15 items). */
export const seedTasks: Task[] = [
  task({
    id: 'task_gym',
    title: 'Workout',
    priority: 'high',
    area: 'fitness',
    categoryId: 'cat_fitness',
    estimatedMinutes: 60,
  }),
  task({
    id: 'task_read',
    title: 'Read 20 pages',
    priority: 'medium',
    area: 'habit',
    categoryId: 'cat_personal',
    estimatedMinutes: 30,
  }),
  task({
    id: 'task_sql_review',
    title: 'Review SQL',
    priority: 'high',
    area: 'studies',
    categoryId: 'cat_learning',
    estimatedMinutes: 45,
  }),
  task({
    id: 'task_dsa',
    title: 'Complete DSA problems',
    description: 'Solve 2 LeetCode medium problems',
    priority: 'high',
    area: 'studies',
    categoryId: 'cat_learning',
    estimatedMinutes: 90,
  }),
  task({
    id: 'task_project',
    title: 'Work on project',
    priority: 'medium',
    area: 'work',
    categoryId: 'cat_projects',
    estimatedMinutes: 120,
  }),
  task({
    id: 'task_steps',
    title: '8,000 steps',
    priority: 'medium',
    area: 'fitness',
    categoryId: 'cat_fitness',
  }),
  task({
    id: 'task_journal',
    title: 'Journal',
    priority: 'low',
    area: 'personal',
    categoryId: 'cat_personal',
    estimatedMinutes: 15,
  }),
  task({
    id: 'task_plan',
    title: 'Plan tomorrow',
    priority: 'medium',
    area: 'habit',
    categoryId: 'cat_personal',
    estimatedMinutes: 10,
  }),
  task({
    id: 'task_water',
    title: 'Drink 3L water',
    priority: 'low',
    area: 'fitness',
    categoryId: 'cat_fitness',
  }),
  task({
    id: 'task_calories',
    title: 'Track calories',
    priority: 'medium',
    area: 'fitness',
    categoryId: 'cat_fitness',
  }),
  task({
    id: 'task_meditate',
    title: 'Meditate 10 min',
    priority: 'low',
    area: 'habit',
    estimatedMinutes: 10,
  }),
  task({
    id: 'task_inbox',
    title: 'Clear inbox',
    priority: 'medium',
    area: 'work',
    categoryId: 'cat_projects',
    estimatedMinutes: 20,
  }),
]

export const seedDailySelection: DailySelection = {
  dateKey: todayKey,
  taskIds: [
    'task_gym',
    'task_sql_review',
    'task_dsa',
    'task_project',
    'task_read',
    'task_water',
  ],
}

export const seedOnboardingComplete = false

function buildSeedHistory(): TaskHistoryEntry[] {
  const entries: TaskHistoryEntry[] = []
  const library = seedTasks

  // Varied skip gaps so recommendations have something to flag
  const lastDoneOffset: Record<string, number> = {
    task_gym: 5, // high, flagged
    task_read: 2,
    task_sql_review: 1,
    task_dsa: 0,
    task_project: 3,
    task_steps: 6, // medium, flagged
    task_journal: 4,
    task_plan: 1,
    task_water: 0,
    task_calories: 8, // medium-ish overdue
    task_meditate: 10, // low, flagged
    task_inbox: 2,
  }

  for (const t of library) {
    const offset = lastDoneOffset[t.id] ?? 3
    // Sprinkle completions going back so streaks/stats look alive
    for (let day = offset; day < 28; day += 2 + (t.id.length % 3)) {
      const date = past(day)
      entries.push({
        id: `hist_${t.id}_${date}`,
        taskId: t.id,
        date,
        completed: true,
        completedAt: `${date}T10:30:00`,
      })
    }
  }

  // Today's completions for selected tasks already done
  for (const id of ['task_dsa', 'task_water']) {
    entries.push({
      id: `hist_${id}_${todayKey}`,
      taskId: id,
      date: todayKey,
      completed: true,
      completedAt: `${todayKey}T09:15:00`,
    })
  }

  return entries
}

export const seedHistory: TaskHistoryEntry[] = buildSeedHistory()

export const seedFriends: Friend[] = [
  { id: 'friend_riya', name: 'Riya', color: '#a78bfa' },
  { id: 'friend_arjun', name: 'Arjun', color: '#5ecf8a' },
  { id: 'friend_sara', name: 'Sara', color: '#e85d5d' },
  { id: 'friend_marcus', name: 'Marcus', color: '#8ba4b8' },
  { id: 'friend_nina', name: 'Nina', color: '#c8a96b' },
]

export const seedFriendActivities: FriendActivity[] = [
  { id: 'fa_1', friendId: 'friend_riya', date: todayKey, completed: true, completedAt: `${todayKey}T07:30:00` },
  { id: 'fa_2', friendId: 'friend_riya', date: todayKey, completed: true, completedAt: `${todayKey}T08:15:00` },
  { id: 'fa_3', friendId: 'friend_riya', date: todayKey, completed: true, completedAt: `${todayKey}T14:00:00` },
  { id: 'fa_4', friendId: 'friend_riya', date: todayKey, completed: true, completedAt: `${todayKey}T17:30:00` },
  { id: 'fa_5', friendId: 'friend_riya', date: todayKey, completed: false },
  { id: 'fa_6', friendId: 'friend_riya', date: todayKey, completed: false },
  { id: 'fa_7', friendId: 'friend_arjun', date: todayKey, completed: true, completedAt: `${todayKey}T06:45:00` },
  { id: 'fa_8', friendId: 'friend_arjun', date: todayKey, completed: true, completedAt: `${todayKey}T10:00:00` },
  { id: 'fa_9', friendId: 'friend_arjun', date: todayKey, completed: true, completedAt: `${todayKey}T15:00:00` },
  { id: 'fa_10', friendId: 'friend_arjun', date: todayKey, completed: false },
  { id: 'fa_11', friendId: 'friend_arjun', date: todayKey, completed: false },
  { id: 'fa_12', friendId: 'friend_sara', date: todayKey, completed: true, completedAt: `${todayKey}T07:00:00` },
  { id: 'fa_13', friendId: 'friend_sara', date: todayKey, completed: true, completedAt: `${todayKey}T11:30:00` },
  { id: 'fa_14', friendId: 'friend_sara', date: todayKey, completed: false },
  { id: 'fa_15', friendId: 'friend_sara', date: todayKey, completed: false },
  { id: 'fa_16', friendId: 'friend_marcus', date: todayKey, completed: true, completedAt: `${todayKey}T09:00:00` },
  { id: 'fa_17', friendId: 'friend_marcus', date: todayKey, completed: true, completedAt: `${todayKey}T13:00:00` },
  { id: 'fa_18', friendId: 'friend_marcus', date: todayKey, completed: true, completedAt: `${todayKey}T19:00:00` },
  { id: 'fa_19', friendId: 'friend_marcus', date: todayKey, completed: true, completedAt: `${todayKey}T20:00:00` },
  { id: 'fa_20', friendId: 'friend_marcus', date: todayKey, completed: false },
  { id: 'fa_21', friendId: 'friend_nina', date: todayKey, completed: true, completedAt: `${todayKey}T06:30:00` },
  { id: 'fa_22', friendId: 'friend_nina', date: todayKey, completed: false },
  { id: 'fa_23', friendId: 'friend_nina', date: todayKey, completed: true, completedAt: `${todayKey}T12:00:00` },
  { id: 'fa_24', friendId: 'friend_nina', date: todayKey, completed: false },
]

export function formatSeedLabel(): string {
  return format(today, 'MMMM d, yyyy')
}
