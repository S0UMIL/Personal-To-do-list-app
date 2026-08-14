import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Task,
  Goal,
  Milestone,
  Category,
  User,
  TaskHistoryEntry,
  Friend,
  FriendActivity,
  TaskPriority,
  TimeOfDay,
  Recurrence,
  TaskArea,
  DailySelection,
  GoogleTasksConnection,
} from '../types'
import { goalIdToArea } from '../lib/taskAreas'
import {
  seedUser,
  seedTasks,
  seedGoals,
  seedMilestones,
  seedCategories,
  seedHistory,
  seedFriends,
  seedFriendActivities,
  seedDailySelection,
  seedOnboardingComplete,
} from '../data/seed'
import { createId } from '../lib/id'
import { toDateKey } from '../lib/dates'
import { inferTimeOfDay } from '../lib/stats'
import { isCompletedOnDate } from '../lib/taskSchedule'
import { normalizeColorTheme } from '../lib/themes'

export interface CreateTaskInput {
  title: string
  description?: string
  dueDate?: string
  dueTime?: string
  timeOfDay?: TimeOfDay
  priority?: TaskPriority
  area?: TaskArea
  recurrence?: Recurrence
  scheduleDays?: number[]
  categoryId?: string
  estimatedMinutes?: number
  reminder?: boolean
  notes?: string
}

interface AppState {
  user: User
  tasks: Task[]
  goals: Goal[]
  milestones: Milestone[]
  categories: Category[]
  history: TaskHistoryEntry[]
  friends: Friend[]
  friendActivities: FriendActivity[]
  onboardingComplete: boolean
  onboardingWalkthroughDone: boolean
  dailySelection: DailySelection
  googleTasks: GoogleTasksConnection
  hydrated: boolean

  setUserName: (name: string) => void
  updatePreferences: (prefs: Partial<User['preferences']>) => void

  connectGoogleTasks: (accessToken: string, listId: string) => void
  disconnectGoogleTasks: () => void
  setGoogleTasksSyncState: (
    patch: Partial<Pick<GoogleTasksConnection, 'lastSyncedAt' | 'syncError'>>,
  ) => void
  applyGoogleTaskIds: (mapping: Record<string, string>) => void

  completeWalkthrough: () => void
  completeOnboarding: () => void
  setDailySelection: (taskIds: string[]) => boolean
  ensureDayCycle: () => void
  hasDailySelection: () => boolean

  addTask: (input: CreateTaskInput) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void

  addGoal: (
    goal: Omit<Goal, 'id' | 'createdAt' | 'status'> & { status?: Goal['status'] },
  ) => Goal
  updateGoal: (id: string, patch: Partial<Goal>) => void
  deleteGoal: (id: string) => void

  addMilestone: (goalId: string, title: string) => Milestone
  toggleMilestone: (id: string) => void
  deleteMilestone: (id: string) => void

  resetDemoData: () => void
}

const emptySelection = (): DailySelection => ({
  dateKey: toDateKey(new Date()),
  taskIds: [],
})

const emptyGoogleTasks = (): GoogleTasksConnection => ({
  connected: false,
  accessToken: null,
  listId: null,
  lastSyncedAt: null,
  syncError: null,
})

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: seedUser,
      tasks: [],
      goals: seedGoals,
      milestones: seedMilestones,
      categories: seedCategories,
      history: [],
      friends: seedFriends,
      friendActivities: seedFriendActivities,
      onboardingComplete: seedOnboardingComplete,
      onboardingWalkthroughDone: seedOnboardingComplete,
      dailySelection: emptySelection(),
      googleTasks: emptyGoogleTasks(),
      hydrated: false,

      setUserName: (name) => set((s) => ({ user: { ...s.user, name } })),

      updatePreferences: (prefs) =>
        set((s) => ({
          user: { ...s.user, preferences: { ...s.user.preferences, ...prefs } },
        })),

      connectGoogleTasks: (accessToken, listId) =>
        set({
          googleTasks: {
            connected: true,
            accessToken,
            listId,
            lastSyncedAt: null,
            syncError: null,
          },
        }),

      disconnectGoogleTasks: () => set({ googleTasks: emptyGoogleTasks() }),

      setGoogleTasksSyncState: (patch) =>
        set((s) => ({
          googleTasks: { ...s.googleTasks, ...patch },
        })),

      applyGoogleTaskIds: (mapping) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            mapping[t.id] ? { ...t, googleTaskId: mapping[t.id] } : t,
          ),
        })),

      completeWalkthrough: () => set({ onboardingWalkthroughDone: true }),

      completeOnboarding: () =>
        set({
          onboardingComplete: true,
          onboardingWalkthroughDone: true,
        }),

      setDailySelection: (taskIds) => {
        const unique = [...new Set(taskIds)]
        if (unique.length < 5) return false
        const today = toDateKey(new Date())
        set({
          dailySelection: { dateKey: today, taskIds: unique },
        })
        return true
      },

      ensureDayCycle: () => {
        const today = toDateKey(new Date())
        const { dailySelection } = get()
        if (dailySelection.dateKey !== today) {
          set({
            dailySelection: { dateKey: today, taskIds: [] },
            tasks: get().tasks.map((t) => ({
              ...t,
              status: 'todo' as const,
              completedAt: undefined,
            })),
          })
        }
      },

      hasDailySelection: () => {
        const today = toDateKey(new Date())
        const { dailySelection } = get()
        return (
          dailySelection.dateKey === today && dailySelection.taskIds.length >= 5
        )
      },

      addTask: (input) => {
        const now = new Date().toISOString()
        const dueDate = input.dueDate ?? toDateKey(new Date())
        const task: Task = {
          id: createId('task'),
          title: input.title.trim(),
          description: input.description,
          status: 'todo',
          priority: input.priority ?? 'medium',
          dueDate,
          dueTime: input.dueTime,
          timeOfDay: input.timeOfDay ?? inferTimeOfDay(input.dueTime),
          recurrence: input.recurrence ?? 'none',
          scheduleDays:
            input.scheduleDays && input.scheduleDays.length > 0
              ? input.scheduleDays
              : undefined,
          area: input.area,
          categoryId: input.categoryId,
          estimatedMinutes: input.estimatedMinutes,
          reminder: input.reminder,
          notes: input.notes,
          createdAt: now,
        }
        set((s) => ({ tasks: [task, ...s.tasks] }))
        return task
      },

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      toggleTask: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        if (!task) return

        const todayKey = toDateKey(new Date())
        const completing = !isCompletedOnDate(task, todayKey, get().history)

        if (completing) {
          const completedAt = new Date().toISOString()
          set((s) => ({
            history: [
              {
                id: createId('hist'),
                taskId: id,
                date: todayKey,
                completed: true,
                completedAt,
              },
              ...s.history.filter(
                (h) => !(h.taskId === id && h.date === todayKey),
              ),
            ],
            tasks: s.tasks.map((t) =>
              t.id === id ? { ...t, status: 'completed', completedAt } : t,
            ),
          }))
        } else {
          set((s) => ({
            history: s.history.filter(
              (h) => h.taskId !== id || h.date !== todayKey,
            ),
            tasks: s.tasks.map((t) =>
              t.id === id
                ? { ...t, status: 'todo', completedAt: undefined }
                : t,
            ),
          }))
        }

        if (
          completing &&
          get().user.preferences.hapticFeedback &&
          typeof navigator !== 'undefined' &&
          'vibrate' in navigator
        ) {
          navigator.vibrate(12)
        }
      },

      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          dailySelection: {
            ...s.dailySelection,
            taskIds: s.dailySelection.taskIds.filter((tid) => tid !== id),
          },
          history: s.history.filter((h) => h.taskId !== id),
        })),

      addGoal: (input) => {
        const goal: Goal = {
          id: createId('goal'),
          title: input.title,
          description: input.description,
          type: input.type,
          area: input.area,
          parentId: input.parentId,
          deadline: input.deadline,
          status: input.status ?? 'active',
          categoryId: input.categoryId,
          notes: input.notes,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ goals: [goal, ...s.goals] }))
        return goal
      },

      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      deleteGoal: (id) =>
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== id),
          milestones: s.milestones.filter((m) => m.goalId !== id),
        })),

      addMilestone: (goalId, title) => {
        const order = get().milestones.filter((m) => m.goalId === goalId).length
        const milestone: Milestone = {
          id: createId('ms'),
          goalId,
          title: title.trim(),
          completed: false,
          order,
        }
        set((s) => ({ milestones: [...s.milestones, milestone] }))
        return milestone
      },

      toggleMilestone: (id) =>
        set((s) => ({
          milestones: s.milestones.map((m) =>
            m.id === id
              ? {
                  ...m,
                  completed: !m.completed,
                  completedAt: !m.completed
                    ? new Date().toISOString()
                    : undefined,
                }
              : m,
          ),
        })),

      deleteMilestone: (id) =>
        set((s) => ({
          milestones: s.milestones.filter((m) => m.id !== id),
        })),

      resetDemoData: () =>
        set({
          user: seedUser,
          tasks: seedTasks,
          goals: seedGoals,
          milestones: seedMilestones,
          categories: seedCategories,
          history: seedHistory,
          friends: seedFriends,
          friendActivities: seedFriendActivities,
          onboardingComplete: true,
          onboardingWalkthroughDone: true,
          dailySelection: seedDailySelection,
          googleTasks: emptyGoogleTasks(),
        }),
    }),
    {
      name: 'north-app-v2',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true
          if (!state.user.preferences.colorTheme) {
            state.user.preferences.colorTheme = 'midnight'
          } else {
            state.user.preferences.colorTheme = normalizeColorTheme(
              state.user.preferences.colorTheme,
            )
          }
          if (!state.friends?.length) {
            state.friends = seedFriends
            state.friendActivities = seedFriendActivities
          }
          if (state.goals?.some((g) => !g.area)) {
            state.goals = seedGoals
            state.milestones = seedMilestones
          }
          for (const task of state.tasks) {
            if (!task.area) {
              task.area = goalIdToArea(task.goalId)
            }
          }

          if (typeof state.onboardingComplete !== 'boolean') {
            state.onboardingComplete = (state.tasks?.length ?? 0) >= 5
          }
          if (typeof state.onboardingWalkthroughDone !== 'boolean') {
            state.onboardingWalkthroughDone = Boolean(state.onboardingComplete)
          }
          if (!state.dailySelection?.dateKey) {
            state.dailySelection = emptySelection()
          }
          if (!state.googleTasks) {
            state.googleTasks = emptyGoogleTasks()
          }

          const today = toDateKey(new Date())
          if (state.dailySelection.dateKey !== today) {
            state.dailySelection = { dateKey: today, taskIds: [] }
            state.tasks = state.tasks.map((t) => ({
              ...t,
              status: 'todo' as const,
              completedAt: undefined,
            }))
          }
          state.hydrated = true
        }
        useAppStore.setState({ hydrated: true })
      },
      partialize: (s) => {
        const { hydrated: _hydrated, ...rest } = s
        return rest
      },
    },
  ),
)

if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as Window & { __northResetOnboarding?: () => void }).__northResetOnboarding =
    () => {
      useAppStore.setState({
        onboardingComplete: false,
        onboardingWalkthroughDone: false,
      })
    }
}
