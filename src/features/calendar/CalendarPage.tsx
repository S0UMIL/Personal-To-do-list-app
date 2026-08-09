import { useMemo, useState } from 'react'
import { format, isSameMonth, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useQuickAdd } from '../../components/layout/AppShell'
import { Segmented } from '../../components/ui/Segmented'
import { TaskRow } from '../../components/tasks/TaskRow'
import {
  addDays,
  getMonthDays,
  getWeekDays,
  toDateKey,
  formatLongDate,
} from '../../lib/dates'
import { getTasksForDate } from '../../lib/stats'
import styles from './CalendarPage.module.css'

type CalView = 'month' | 'week' | 'day'

export function CalendarPage() {
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const goals = useAppStore((s) => s.goals)
  const milestones = useAppStore((s) => s.milestones)
  const weekStartsOn = useAppStore((s) => s.user.preferences.weekStartsOn)
  const toggleTask = useAppStore((s) => s.toggleTask)
  const { openQuickAdd } = useQuickAdd()

  const [view, setView] = useState<CalView>('month')
  const [anchor, setAnchor] = useState(new Date())
  const [selected, setSelected] = useState(toDateKey(new Date()))

  const monthDays = useMemo(
    () => getMonthDays(anchor, weekStartsOn),
    [anchor, weekStartsOn],
  )
  const weekDays = useMemo(
    () => getWeekDays(anchor, weekStartsOn),
    [anchor, weekStartsOn],
  )

  const getDayTasks = (key: string) => getTasksForDate(tasks, key, history)

  const selectedTasks = getDayTasks(selected).sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1
    if (b.status === 'completed' && a.status !== 'completed') return -1
    return (a.dueTime ?? '').localeCompare(b.dueTime ?? '')
  })

  const deadlines = goals.filter((g) => g.deadline === selected)
  const milestoneHits = milestones.filter((m) => m.completedAt && toDateKey(m.completedAt) === selected)

  const shift = (dir: -1 | 1) => {
    if (view === 'month') setAnchor(addDays(anchor, dir * 30))
    else if (view === 'week') setAnchor(addDays(anchor, dir * 7))
    else {
      const next = addDays(anchor, dir)
      setAnchor(next)
      setSelected(toDateKey(next))
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Schedule</p>
          <h1 className={`serif ${styles.title}`}>Calendar</h1>
        </div>
        <div className={styles.nav}>
          <button type="button" onClick={() => shift(-1)} aria-label="Previous">
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className={styles.todayBtn}
            onClick={() => {
              const now = new Date()
              setAnchor(now)
              setSelected(toDateKey(now))
            }}
          >
            Today
          </button>
          <button type="button" onClick={() => shift(1)} aria-label="Next">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: 'month', label: 'Month' },
          { value: 'week', label: 'Week' },
          { value: 'day', label: 'Day' },
        ]}
      />

      <p className={styles.monthLabel}>
        {view === 'day'
          ? formatLongDate(selected)
          : format(anchor, 'MMMM yyyy')}
      </p>

      {view === 'month' && (
        <div className={styles.monthGrid}>
          {(weekStartsOn === 1
            ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
            : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
          ).map((d, i) => (
            <span key={`${d}-${i}`} className={styles.dow}>
              {d}
            </span>
          ))}
          {monthDays.map((day) => {
            const key = toDateKey(day)
            const dayTasks = getDayTasks(key)
            const count = dayTasks.length
            const done = dayTasks.filter((t) => t.status === 'completed').length
            const inMonth = isSameMonth(day, anchor)
            return (
              <button
                key={key}
                type="button"
                className={`${styles.dayCell} ${!inMonth ? styles.out : ''} ${selected === key ? styles.selected : ''} ${isToday(day) ? styles.isToday : ''}`}
                onClick={() => {
                  setSelected(key)
                  setAnchor(day)
                }}
              >
                <span className="tabular">{format(day, 'd')}</span>
                {count > 0 && (
                  <span
                    className={styles.dot}
                    data-full={done === count && count > 0 ? '1' : '0'}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      {view === 'week' && (
        <div className={styles.weekRow}>
          {weekDays.map((day) => {
            const key = toDateKey(day)
            const count = getDayTasks(key).length
            return (
              <button
                key={key}
                type="button"
                className={`${styles.weekCell} ${selected === key ? styles.selected : ''} ${isToday(day) ? styles.isToday : ''}`}
                onClick={() => {
                  setSelected(key)
                  setAnchor(day)
                }}
              >
                <span className={styles.weekDow}>{format(day, 'EEE')}</span>
                <span className={`${styles.weekDate} tabular`}>{format(day, 'd')}</span>
                <span className={styles.weekCount}>{count > 0 ? count : ''}</span>
              </button>
            )
          })}
        </div>
      )}

      <section className={styles.dayPanel}>
        <div className={styles.dayHead}>
          <h2>{format(new Date(selected + 'T12:00:00'), 'EEEE, MMM d')}</h2>
          <button
            type="button"
            className={styles.addLink}
            onClick={() => openQuickAdd({ date: selected })}
          >
            Add task
          </button>
        </div>

        {(deadlines.length > 0 || milestoneHits.length > 0) && (
          <div className={styles.markers}>
            {deadlines.map((g) => (
              <span key={g.id} className={styles.marker}>
                Deadline · {g.title}
              </span>
            ))}
            {milestoneHits.map((m) => (
              <span key={m.id} className={styles.markerSoft}>
                Milestone · {m.title}
              </span>
            ))}
          </div>
        )}

        {selectedTasks.length === 0 ? (
          <p className={styles.empty}>No tasks on this day.</p>
        ) : (
          selectedTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onOpen={() => openQuickAdd({ task })}
            />
          ))
        )}
      </section>
    </div>
  )
}
