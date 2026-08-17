import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { TASK_AREAS } from '../../lib/taskAreas'
import type { TaskArea, TaskPriority } from '../../types'
import styles from './OnboardingPage.module.css'

const MIN = 5
const RECOMMENDED = 10

const priorities: { value: TaskPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export function OnboardingTasks() {
  const navigate = useNavigate()
  const walkthroughDone = useAppStore((s) => s.onboardingWalkthroughDone)
  const completeOnboarding = useAppStore((s) => s.completeOnboarding)
  const addTask = useAppStore((s) => s.addTask)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const tasks = useAppStore((s) => s.tasks)

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [area, setArea] = useState<TaskArea | ''>('')

  if (!walkthroughDone) {
    return <Navigate to="/onboarding" replace />
  }

  const validTasks = tasks.filter((t) => t.title.trim())
  const count = validTasks.length
  const canFinish = count >= MIN

  const add = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    addTask({
      title: trimmed,
      priority,
      area: area || undefined,
    })
    setTitle('')
    setPriority('medium')
    setArea('')
  }

  const finish = () => {
    if (!canFinish) return
    completeOnboarding()
    navigate('/', { replace: true })
  }

  return (
    <div className={`${styles.page} ${styles.tasksPage}`}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => navigate('/onboarding')}
        >
          Back
        </button>
        <p className={styles.eyebrow}>Getting started</p>
        <h1 className={`displayTitle ${styles.title}`}>Let's build your starting list</h1>
        <p className={styles.lead}>
          Add at least 5 things you genuinely want to get done. You can always add more later.
        </p>
        <p className={`${styles.count} tabular`}>
          {count < MIN
            ? `${count} / ${MIN} tasks`
            : `${count} tasks added ✓`}
        </p>
        {count >= MIN && count < RECOMMENDED && (
          <p className={styles.hintInline}>
            {RECOMMENDED} is a strong starting list — keep going if you want.
          </p>
        )}
      </header>

      <form
        className={styles.addRow}
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <Input
          label="Task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Workout, Read, Deep work"
          maxLength={80}
          autoComplete="off"
        />
        <div className={styles.row}>
          <label className={styles.field}>
            <span>Priority</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Area</span>
            <select
              value={area}
              onChange={(e) => setArea((e.target.value || '') as TaskArea | '')}
            >
              <option value="">Optional</option>
              {TASK_AREAS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button type="submit" variant="secondary" disabled={!title.trim()}>
          Add task
        </Button>
      </form>

      <ul className={styles.list}>
        {validTasks.map((t) => (
          <li key={t.id} className={styles.item}>
            <div>
              <p className={styles.itemTitle}>{t.title}</p>
              <p className={styles.itemMeta}>
                {t.priority}
                {t.area ? ` · ${t.area}` : ''}
              </p>
            </div>
            <button
              type="button"
              className={styles.remove}
              onClick={() => deleteTask(t.id)}
              aria-label={`Remove ${t.title}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <Button fullWidth size="lg" disabled={!canFinish} onClick={finish}>
          Continue
        </Button>
        {!canFinish && (
          <p className={styles.hint}>Add at least {MIN} tasks to continue.</p>
        )}
      </div>
    </div>
  )
}
