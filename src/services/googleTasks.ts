import type { Task } from '../types'
import { toDateKey } from '../lib/dates'

const TASKS_API = 'https://tasks.googleapis.com/tasks/v1'
const NORTH_LIST_TITLE = 'North'

export interface GoogleTaskList {
  id: string
  title: string
}

export interface GoogleTask {
  id: string
  title: string
  status: 'needsAction' | 'completed'
  due?: string
  notes?: string
}

async function tasksFetch<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${TASKS_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || `Google Tasks error (${res.status})`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function listGoogleTaskLists(
  accessToken: string,
): Promise<GoogleTaskList[]> {
  const data = await tasksFetch<{ items?: GoogleTaskList[] }>(
    accessToken,
    '/users/@me/lists',
  )
  return data.items ?? []
}

export async function ensureNorthTaskList(accessToken: string): Promise<string> {
  const lists = await listGoogleTaskLists(accessToken)
  const existing = lists.find((l) => l.title === NORTH_LIST_TITLE)
  if (existing) return existing.id

  const created = await tasksFetch<GoogleTaskList>(accessToken, '/users/@me/lists', {
    method: 'POST',
    body: JSON.stringify({ title: NORTH_LIST_TITLE }),
  })
  return created.id
}

function priorityNote(priority: Task['priority']): string {
  return `north-priority:${priority}`
}

function parsePriority(notes?: string): Task['priority'] | null {
  const match = notes?.match(/north-priority:(low|medium|high)/)
  return (match?.[1] as Task['priority']) ?? null
}

export async function upsertGoogleTask(
  accessToken: string,
  listId: string,
  task: Task,
  googleTaskId: string | undefined,
  completedToday: boolean,
): Promise<string> {
  const body = {
    title: task.title,
    status: completedToday ? 'completed' : 'needsAction',
    due: `${toDateKey(new Date())}T00:00:00.000Z`,
    notes: priorityNote(task.priority),
  }

  if (googleTaskId) {
    await tasksFetch(accessToken, `/lists/${listId}/tasks/${googleTaskId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
    return googleTaskId
  }

  const created = await tasksFetch<GoogleTask>(
    accessToken,
    `/lists/${listId}/tasks`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
  return created.id
}

export async function syncTasksToGoogle(
  accessToken: string,
  listId: string,
  tasks: Task[],
  taskIds: string[],
  completedToday: Set<string>,
  googleIds: Record<string, string>,
): Promise<Record<string, string>> {
  const next: Record<string, string> = { ...googleIds }
  const selected = tasks.filter((t) => taskIds.includes(t.id))

  for (const task of selected) {
    next[task.id] = await upsertGoogleTask(
      accessToken,
      listId,
      task,
      googleIds[task.id],
      completedToday.has(task.id),
    )
  }

  return next
}

export { parsePriority, priorityNote }
