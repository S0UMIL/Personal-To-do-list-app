import type { Category, Goal, Milestone, Task, TaskHistoryEntry, User, Friend, FriendActivity } from '../types'
import { toDateKey, subDays, addDays } from '../lib/dates'
import { format } from 'date-fns'

const today = new Date()
const todayKey = toDateKey(today)
const d = (offset: number) => toDateKey(addDays(today, offset))
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
  partial: Omit<Task, 'createdAt' | 'status'> & { status?: Task['status']; createdAt?: string; completedAt?: string },
): Task {
  return {
    status: 'todo',
    createdAt: past(2),
    ...partial,
  }
}

export const seedTasks: Task[] = [
  task({
    id: 'task_gym',
    title: 'Workout',
    dueDate: todayKey,
    dueTime: '07:00',
    timeOfDay: 'morning',
    priority: 'high',
    recurrence: 'custom',
    scheduleDays: [1, 3, 5],
    area: 'fitness',
    categoryId: 'cat_fitness',
    estimatedMinutes: 60,
    status: 'completed',
    completedAt: `${todayKey}T07:45:00`,
  }),
  task({
    id: 'task_read',
    title: 'Read 20 pages',
    dueDate: todayKey,
    dueTime: '08:00',
    timeOfDay: 'morning',
    priority: 'medium',
    recurrence: 'daily',
    area: 'habit',
    categoryId: 'cat_personal',
    estimatedMinutes: 30,
    status: 'completed',
    completedAt: `${todayKey}T08:20:00`,
  }),
  task({
    id: 'task_sql_review',
    title: 'Review SQL',
    dueDate: todayKey,
    dueTime: '09:00',
    timeOfDay: 'morning',
    priority: 'high',
    recurrence: 'weekdays',
    area: 'studies',
    categoryId: 'cat_learning',
    estimatedMinutes: 45,
  }),
  task({
    id: 'task_dsa',
    title: 'Complete DSA problems',
    description: 'Solve 2 LeetCode medium problems',
    dueDate: todayKey,
    dueTime: '14:00',
    timeOfDay: 'afternoon',
    priority: 'high',
    recurrence: 'weekdays',
    area: 'studies',
    categoryId: 'cat_learning',
    estimatedMinutes: 90,
  }),
  task({
    id: 'task_project',
    title: 'Work on project',
    dueDate: todayKey,
    dueTime: '16:00',
    timeOfDay: 'afternoon',
    priority: 'medium',
    recurrence: 'none',
    area: 'work',
    categoryId: 'cat_projects',
    estimatedMinutes: 120,
  }),
  task({
    id: 'task_steps',
    title: '8,000 steps',
    dueDate: todayKey,
    timeOfDay: 'afternoon',
    priority: 'medium',
    recurrence: 'daily',
    area: 'fitness',
    categoryId: 'cat_fitness',
  }),
  task({
    id: 'task_journal',
    title: 'Journal',
    dueDate: todayKey,
    dueTime: '21:00',
    timeOfDay: 'evening',
    priority: 'low',
    recurrence: 'daily',
    area: 'personal',
    categoryId: 'cat_personal',
    estimatedMinutes: 15,
  }),
  task({
    id: 'task_plan',
    title: 'Plan tomorrow',
    dueDate: todayKey,
    dueTime: '21:30',
    timeOfDay: 'evening',
    priority: 'medium',
    recurrence: 'daily',
    area: 'habit',
    categoryId: 'cat_personal',
    estimatedMinutes: 10,
  }),
  task({
    id: 'task_water',
    title: 'Drink 3L water',
    dueDate: todayKey,
    timeOfDay: 'anytime',
    priority: 'low',
    recurrence: 'daily',
    area: 'fitness',
    categoryId: 'cat_fitness',
    status: 'completed',
    completedAt: `${todayKey}T18:00:00`,
  }),
  task({
    id: 'task_calories',
    title: 'Track calories',
    dueDate: todayKey,
    timeOfDay: 'anytime',
    priority: 'medium',
    recurrence: 'daily',
    area: 'fitness',
    categoryId: 'cat_fitness',
  }),
  task({
    id: 'task_cte',
    title: 'Practice CTEs',
    dueDate: d(1),
    dueTime: '10:00',
    timeOfDay: 'morning',
    priority: 'high',
    recurrence: 'none',
    area: 'studies',
    categoryId: 'cat_learning',
  }),
  ...Array.from({ length: 45 }, (_, i) => {
    const dayOffset = i + 1
    const date = past(dayOffset)
    const completedCount = 4 + ((i * 3) % 5)
    const areas: Task['area'][] = ['studies', 'fitness', 'work', 'habit', 'personal']
    return Array.from({ length: completedCount }, (_, j) =>
      task({
        id: `hist_task_${dayOffset}_${j}`,
        title: `Focus block ${j + 1}`,
        dueDate: date,
        dueTime: `${9 + j}:00`,
        timeOfDay: j < 2 ? 'morning' : j < 4 ? 'afternoon' : 'evening',
        priority: j === 0 ? 'high' : 'medium',
        recurrence: 'none',
        area: areas[j % areas.length],
        categoryId: j % 2 === 0 ? 'cat_learning' : 'cat_fitness',
        status: 'completed',
        completedAt: `${date}T${String(10 + j).padStart(2, '0')}:30:00`,
        createdAt: date,
      }),
    )
  }).flat(),
  ...[2, 5, 9].map((offset, idx) =>
    task({
      id: `missed_${idx}`,
      title: 'Inbox zero sweep',
      dueDate: past(offset),
      timeOfDay: 'afternoon',
      priority: 'low',
      recurrence: 'none',
      area: 'personal',
      categoryId: 'cat_personal',
      status: 'todo',
      createdAt: past(offset + 1),
    }),
  ),
]

export const seedHistory: TaskHistoryEntry[] = seedTasks
  .filter((t) => t.status === 'completed')
  .map((t) => ({
    id: `hist_${t.id}`,
    taskId: t.id,
    date: t.dueDate,
    completed: true,
    completedAt: t.completedAt,
  }))

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
