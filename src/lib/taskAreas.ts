import type { TaskArea } from '../types'

export const TASK_AREAS: { value: TaskArea; label: string }[] = [
  { value: 'fitness', label: 'Fitness' },
  { value: 'money', label: 'Money' },
  { value: 'studies', label: 'Studies' },
  { value: 'habit', label: 'Habit' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
]

export function getAreaLabel(area?: TaskArea): string | undefined {
  if (!area) return undefined
  return TASK_AREAS.find((a) => a.value === area)?.label
}

/** Map legacy goal ids to generic areas for persisted data */
export function goalIdToArea(goalId?: string): TaskArea | undefined {
  if (!goalId) return undefined
  if (goalId.includes('fit') || goalId.includes('lose')) return 'fitness'
  if (goalId.includes('quant') || goalId.includes('dsa') || goalId.includes('sql') || goalId.includes('swe'))
    return 'studies'
  if (goalId.includes('project') || goalId.includes('yt') || goalId.includes('video')) return 'work'
  if (goalId.includes('money') || goalId.includes('finance')) return 'money'
  return 'personal'
}
