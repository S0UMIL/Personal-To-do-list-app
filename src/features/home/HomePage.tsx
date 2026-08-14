import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { TaskRow } from '../../components/tasks/TaskRow'
import { DailyPickGate } from '../../components/tasks/DailyPickGate'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { formatLongDate, toDateKey } from '../../lib/dates'
import { calcCompletion, calcStreak, getTodaySelectedTasks } from '../../lib/stats'
import { buildRecommendations } from '../../lib/recommendations'
import { randomWorkQuote } from '../../lib/quotes'
import styles from './HomePage.module.css'

export function HomePage() {
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const dailyMinimum = useAppStore((s) => s.user.preferences.dailyMinimum ?? 5)
  const dailySelection = useAppStore((s) => s.dailySelection)
  const toggleTask = useAppStore((s) => s.toggleTask)
  const navigate = useNavigate()
  const [editingToday, setEditingToday] = useState(false)
  const [quote] = useState(randomWorkQuote)

  const todayKey = toDateKey(new Date())
  const needsPick = !(
    dailySelection.dateKey === todayKey && dailySelection.taskIds.length >= 5
  )

  const todayTasks = useMemo(() => {
    return getTodaySelectedTasks(tasks, dailySelection, history, todayKey).sort(
      (a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1
        if (b.status === 'completed' && a.status !== 'completed') return -1
        return (a.dueTime ?? '').localeCompare(b.dueTime ?? '')
      },
    )
  }, [tasks, history, dailySelection, todayKey])

  const stats = calcCompletion(todayTasks)
  const streak = calcStreak(history, dailyMinimum)
  const alertCount = useMemo(
    () => buildRecommendations(tasks, history).filter((r) => r.flagged).length,
    [tasks, history],
  )

  return (
    <div className={styles.page}>
      <DailyPickGate
        open={needsPick || editingToday}
        mode={needsPick ? 'initial' : 'edit'}
        onClose={() => setEditingToday(false)}
      />

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerMain}>
            <p className={styles.date}>{formatLongDate()}</p>
            <blockquote className={styles.quote}>
              <p>{quote.text}</p>
              <cite>— {quote.author}</cite>
            </blockquote>
          </div>
          <Link
            to="/recommendations"
            className={styles.alertsLink}
            aria-label={
              alertCount > 0
                ? `${alertCount} alerts`
                : 'Recommendations'
            }
          >
            Alerts
            {alertCount > 0 && (
              <span className={`${styles.badge} tabular`}>{alertCount}</span>
            )}
          </Link>
        </div>
      </header>

      {!needsPick && (
        <>
          <section className={styles.progressBlock} aria-label="Today's progress">
            <div className={styles.fractionBlock}>
              <p className={styles.fractionLabel}>Today</p>
              <p className={`${styles.fraction} tabular`}>
                <span className={styles.fractionDone}>{stats.completed}</span>
                <span className={styles.fractionSep}>/</span>
                <span>{stats.scheduled}</span>
              </p>
              <p className={styles.fractionSub}>completed</p>
            </div>
            <div className={styles.progressCopy}>
              <div className={styles.progressTop}>
                <div className={styles.marks} aria-hidden>
                  {todayTasks.map((t) => (
                    <span
                      key={t.id}
                      className={`${styles.mark} ${
                        t.status === 'completed' ? styles.markDone : ''
                      }`}
                      title={t.title}
                    />
                  ))}
                </div>
                <span
                  className={`${styles.streak} tabular`}
                  aria-label={`${streak} day streak`}
                >
                  <span aria-hidden>🔥</span> {streak}
                </span>
              </div>
            </div>
          </section>

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
            <section className={styles.taskList}>
              <div className={styles.listHead}>
                <h3 className={styles.listLabel}>Today&apos;s tasks</h3>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => setEditingToday(true)}
                >
                  Edit
                </button>
              </div>
              <div>
                {todayTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTask(task.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
