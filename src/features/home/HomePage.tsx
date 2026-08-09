import { useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { useQuickAdd } from '../../components/layout/AppShell'
import { TaskRow } from '../../components/tasks/TaskRow'
import { ProgressRing } from '../../components/ui/Progress'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { greetingForHour, formatLongDate, toDateKey } from '../../lib/dates'
import {
  calcCompletionForDate,
  calcStreak,
  compareToPreviousWeek,
} from '../../lib/stats'
import { getTasksForDate } from '../../lib/stats'
import styles from './HomePage.module.css'

export function HomePage() {
  const user = useAppStore((s) => s.user)
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const toggleTask = useAppStore((s) => s.toggleTask)
  const { openQuickAdd } = useQuickAdd()

  const todayKey = toDateKey(new Date())
  const todayTasks = useMemo(() => {
    return getTasksForDate(tasks, todayKey, history).sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (b.status === 'completed' && a.status !== 'completed') return -1
      return (a.dueTime ?? '').localeCompare(b.dueTime ?? '')
    })
  }, [tasks, history, todayKey])

  const stats = calcCompletionForDate(tasks, todayKey, history)
  const streak = calcStreak(tasks, history)
  const weekDelta = compareToPreviousWeek(tasks)

  const insight =
    weekDelta > 0
      ? `You're ${weekDelta}% ahead of last week.`
      : weekDelta < 0
        ? `${Math.abs(weekDelta)}% behind last week — today still counts.`
        : streak > 1
          ? `You're ${streak} days into your current streak.`
          : 'Small progress compounds.'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.greeting}>
          {greetingForHour()}, {user.name}.
        </p>
        <p className={styles.date}>{formatLongDate()}</p>
      </header>

      <section className={styles.progressBlock} aria-label="Today's progress">
        <ProgressRing
          value={stats.rate}
          label={`${stats.completed}/${stats.scheduled || 0}`}
          sublabel="today"
          size={120}
        />
        <div className={styles.progressCopy}>
          <h2>Today's Progress</h2>
          <p className="tabular">
            {stats.completed} / {stats.scheduled} completed
          </p>
          <p className={styles.insight}>{insight}</p>
        </div>
      </section>

      {todayTasks.length === 0 ? (
        <EmptyState
          title="Nothing scheduled."
          description="Enjoy the space — or add something worth doing."
          action={
            <Button variant="secondary" onClick={() => openQuickAdd()}>
              Add a task
            </Button>
          }
        />
      ) : (
        <section className={styles.taskList}>
          <h3 className={styles.listLabel}>Today's tasks</h3>
          <div>
            {todayTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onOpen={() => openQuickAdd({ task })}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
