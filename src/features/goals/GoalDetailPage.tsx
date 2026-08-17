import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useQuickAdd } from '../../components/layout/AppShell'
import { TaskRow } from '../../components/tasks/TaskRow'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { daysRemaining, formatShortDate, toDateKey } from '../../lib/dates'
import { areaTaskCounts, calcStreak, buildActivitySeries } from '../../lib/stats'
import { lastNDays } from '../../lib/dates'
import { getAreaLabel } from '../../lib/taskAreas'
import { BarChart } from '../../components/stats/Charts'
import styles from './GoalDetailPage.module.css'

export function GoalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const goals = useAppStore((s) => s.goals)
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const dailyMinimum = useAppStore((s) => s.user.preferences.dailyMinimum ?? 5)
  const toggleTask = useAppStore((s) => s.toggleTask)
  const deleteGoal = useAppStore((s) => s.deleteGoal)
  const { openQuickAdd } = useQuickAdd()

  const goal = goals.find((g) => g.id === id)
  const counts = goal ? areaTaskCounts(goal.area, tasks, history) : { done: 0, total: 0 }
  const remaining = goal ? daysRemaining(goal.deadline) : null
  const connected = useMemo(
    () =>
      goal
        ? tasks
            .filter((t) => t.area === goal.area)
            .sort((a, b) => a.title.localeCompare(b.title))
        : [],
    [tasks, goal],
  )

  const areaTaskIds = useMemo(
    () =>
      goal
        ? new Set(tasks.filter((t) => t.area === goal.area).map((t) => t.id))
        : undefined,
    [tasks, goal],
  )

  const streak = goal
    ? calcStreak(history, dailyMinimum, { taskIds: areaTaskIds })
    : 0
  const historySeries = goal
    ? buildActivitySeries(
        tasks.filter((t) => t.area === goal.area),
        lastNDays(14)[0],
        new Date(),
        history,
        dailyMinimum,
        areaTaskIds,
      )
    : []

  if (!goal) {
    return (
      <EmptyState
        title="Goal not found"
        description="It may have been removed."
        action={
          <Button variant="secondary" onClick={() => navigate('/goals')}>
            Back to goals
          </Button>
        }
      />
    )
  }

  const areaLabel = getAreaLabel(goal.area)

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Goals
      </button>

      <header className={styles.header}>
        <p className={styles.type}>{areaLabel ?? 'Goal'}</p>
        <h1 className={`displayTitle ${styles.title}`}>{goal.title}</h1>
        {goal.description && <p className={styles.desc}>{goal.description}</p>}
      </header>

      <section className={styles.metrics}>
        <div>
          <p className={styles.metricLabel}>Today</p>
          <p className={`${styles.metricValue} tabular`}>
            {counts.done}/{counts.total}
          </p>
        </div>
        <div>
          <p className={styles.metricLabel}>Remaining</p>
          <p className={`${styles.metricValue} tabular`}>
            {remaining === null ? '—' : remaining < 0 ? 'Past' : `${remaining}d`}
          </p>
        </div>
        <div>
          <p className={styles.metricLabel}>Streak</p>
          <p className={`${styles.metricValue} tabular`}>{streak}d</p>
        </div>
      </section>

      <p className={styles.statusLine}>
        {counts.total === 0
          ? 'No linked tasks in this area yet.'
          : `${counts.done} of ${counts.total} linked tasks done today.`}
      </p>

      {goal.deadline && (
        <p className={styles.deadline}>Deadline {formatShortDate(goal.deadline)}</p>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Tasks in {areaLabel}</h2>
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() =>
              openQuickAdd({
                date: toDateKey(new Date()),
                area: goal.area,
              })
            }
          >
            Add
          </button>
        </div>
        {connected.length === 0 ? (
          <p className={styles.muted}>No tasks in this area yet.</p>
        ) : (
          connected.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onOpen={() => openQuickAdd({ task })}
            />
          ))
        )}
      </section>

      <section className={styles.section}>
        <h2>Recent activity</h2>
        <BarChart data={historySeries} height={100} />
      </section>

      {goal.notes && (
        <section className={styles.section}>
          <h2>Notes</h2>
          <p className={styles.notes}>{goal.notes}</p>
        </section>
      )}

      <Button
        variant="danger"
        onClick={() => {
          deleteGoal(goal.id)
          navigate('/goals')
        }}
      >
        Delete goal
      </Button>
    </div>
  )
}
