import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { DailyPickGate } from '../../components/tasks/DailyPickGate'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { format, toDateKey } from '../../lib/dates'
import { calcCompletion, calcStreak, getTodaySelectedTasks } from '../../lib/stats'
import { getAreaLabel } from '../../lib/taskAreas'
import type { Task } from '../../types'
import styles from './HomePage.module.css'

const priorityRank = { high: 0, medium: 1, low: 2 }

export function HomePage() {
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const dailySelection = useAppStore((s) => s.dailySelection)
  const toggleTask = useAppStore((s) => s.toggleTask)
  const dailyMinimum = useAppStore((s) => s.user.preferences.dailyMinimum ?? 5)
  const navigate = useNavigate()
  const [editingToday, setEditingToday] = useState(false)

  const todayKey = toDateKey(new Date())
  const needsPick = !(
    dailySelection.dateKey === todayKey && dailySelection.taskIds.length >= 5
  )

  const todayTasks = useMemo(() => {
    return getTodaySelectedTasks(tasks, dailySelection, history, todayKey).sort(
      (a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1
        if (b.status === 'completed' && a.status !== 'completed') return -1
        return priorityRank[a.priority] - priorityRank[b.priority]
      },
    )
  }, [tasks, history, dailySelection, todayKey])

  const stats = calcCompletion(todayTasks)
  const remaining = Math.max(0, stats.scheduled - stats.completed)
  const streak = calcStreak(history, dailyMinimum)
  const todayLabel = format(new Date(), 'MMM d')

  const focusTask = useMemo(
    () => todayTasks.find((t) => t.status !== 'completed') ?? null,
    [todayTasks],
  )

  return (
    <div className={styles.page}>
      <DailyPickGate
        open={needsPick || editingToday}
        mode={needsPick ? 'initial' : 'edit'}
        onClose={() => setEditingToday(false)}
      />

      {!needsPick && (
        <>
          <header className={styles.header}>
            <div className={styles.headerMain}>
              <p className={styles.eyebrow}>
                Today <span className={styles.liveDot} aria-hidden />
              </p>
            </div>
            <div className={styles.streakBadge} aria-label={`${streak} day streak`}>
              <span className={styles.streakLabel}>STREAK</span>
              <span className={styles.streakDivider} aria-hidden>
                –
              </span>
              <span className={`${styles.streakValue} tabular`}>{streak}</span>
            </div>
          </header>

          {todayTasks.length === 0 ? (
            <EmptyState
              title="Nothing selected."
              description="Pick at least 5 tasks for today."
              action={
                <Button variant="secondary" onClick={() => navigate('/tasks')}>
                  Go to Tasks
                </Button>
              }
            />
          ) : (
            <>
              <section className={styles.focusCard} aria-label="Today's progress">
                {focusTask ? (
                  <>
                    <div className={styles.focusTop}>
                      <span className={styles.focusTitle}>{todayLabel}</span>
                    </div>
                    <div className={styles.focusStat}>
                      <span className={`${styles.focusNumber} tabular`}>
                        {stats.completed}
                      </span>
                      <span className={styles.focusUnit}>done</span>
                    </div>
                    <div className={styles.focusBarTrack}>
                      <div
                        className={styles.focusBarFill}
                        style={{
                          width: `${stats.scheduled > 0 ? (stats.completed / stats.scheduled) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p className={styles.focusMeta}>
                      {remaining} remaining · {stats.scheduled} today
                    </p>
                  </>
                ) : (
                  <>
                    <div className={styles.focusTop}>
                      <span className={styles.focusTitle}>{todayLabel}</span>
                      <span className={styles.focusBadge}>● Done</span>
                    </div>
                    <div className={styles.focusStat}>
                      <span className={`${styles.focusNumber} tabular`}>
                        {stats.completed}
                      </span>
                      <span className={styles.focusUnit}>done</span>
                    </div>
                    <p className={styles.focusMeta}>All tasks finished for today.</p>
                  </>
                )}
              </section>

              <section className={styles.listSection} aria-label="Today's tasks">
                <ul className={styles.taskList}>
                  {todayTasks.map((task) => (
                    <HomeTaskItem
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(task.id)}
                    />
                  ))}
                </ul>
              </section>

              <button
                type="button"
                className={styles.editAction}
                onClick={() => setEditingToday(true)}
              >
                Edit today&apos;s list →
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}

function HomeTaskItem({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const done = task.status === 'completed'
  const areaLabel = getAreaLabel(task.area)

  return (
    <li className={`${styles.taskItem} ${done ? styles.taskDone : ''}`}>
      <button type="button" className={styles.taskMain} onClick={onToggle}>
        <div className={styles.taskHead}>
          <span className={styles.taskTitle}>{task.title}</span>
          <span
            className={`${styles.taskCheck} ${done ? styles.taskCheckDone : styles.taskCheckOpen}`}
            aria-hidden
          >
            {done ? '✓' : ''}
          </span>
        </div>
        <p className={styles.taskMeta}>
          {areaLabel && <span>{areaLabel}</span>}
          {areaLabel && task.dueTime && <span> · </span>}
          {task.dueTime && <span className="tabular">{formatTime(task.dueTime)}</span>}
          {!areaLabel && !task.dueTime && (
            <span>{task.priority} priority</span>
          )}
        </p>
      </button>
    </li>
  )
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}:${String(m).padStart(2, '0')} ${suffix}`
}
