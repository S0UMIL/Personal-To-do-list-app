import { useMemo, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { Segmented } from '../../components/ui/Segmented'
import { EmptyState } from '../../components/ui/EmptyState'
import {
  BarChart,
  TrendChart,
  Heatmap,
  GoalProgressList,
} from '../../components/stats/Charts'
import type { StatsPeriod } from '../../types'
import { periodRange, lastNDays, getYearDays } from '../../lib/dates'
import {
  calcPeriodCompletion,
  buildActivitySeries,
  calcStreak,
  calcWeeklySummary,
  calcMonthlyOverview,
  areaProgress,
  compareToPreviousWeek,
} from '../../lib/stats'
import { TASK_AREAS } from '../../lib/taskAreas'
import styles from './StatsPage.module.css'

export function StatsPage() {
  const tasks = useAppStore((s) => s.tasks)
  const goals = useAppStore((s) => s.goals)
  const history = useAppStore((s) => s.history)
  const weekStartsOn = useAppStore((s) => s.user.preferences.weekStartsOn)

  const [period, setPeriod] = useState<StatsPeriod>('week')

  const range = periodRange(period, new Date(), weekStartsOn)
  const streak = calcStreak(tasks, history)
  const weekDelta = compareToPreviousWeek(tasks)

  const completion = calcPeriodCompletion(tasks, range.start, range.end, history)

  const series = useMemo(() => {
    if (period === 'day') return buildActivitySeries(tasks, lastNDays(7)[0], new Date(), history)
    if (period === 'year') {
      const days = getYearDays()
      return buildActivitySeries(tasks, days[0], days[days.length - 1], history)
    }
    return buildActivitySeries(tasks, range.start, range.end, history)
  }, [tasks, history, period, range.start, range.end])

  const heatmapData = useMemo(() => {
    const days = lastNDays(119)
    return buildActivitySeries(tasks, days[0], days[days.length - 1], history)
  }, [tasks, history])

  const yearHeat = useMemo(() => {
    const days = getYearDays()
    return buildActivitySeries(tasks, days[0], days[days.length - 1], history)
  }, [tasks, history])

  const weekRange = periodRange('week', new Date(), weekStartsOn)
  const monthRange = periodRange('month', new Date(), weekStartsOn)
  const weekly = calcWeeklySummary(tasks, weekRange.start, weekRange.end)
  const monthly = calcMonthlyOverview(tasks, goals, monthRange.start, monthRange.end)

  const goalBars = TASK_AREAS.map((a) => ({
    id: a.value,
    label: a.label,
    progress: areaProgress(a.value, tasks, history),
  })).filter((g) => g.progress > 0 || tasks.some((t) => t.area === g.id))

  const hasData = history.some((h) => h.completed) || tasks.some((t) => t.status === 'completed')

  if (!hasData) {
    return (
      <div className={styles.page}>
        <header>
          <p className={styles.eyebrow}>Analytics</p>
          <h1 className={`serif ${styles.title}`}>Statistics</h1>
        </header>
        <EmptyState
          title="Your story starts today."
          description="Complete a few tasks and your progress will appear here."
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header>
        <p className={styles.eyebrow}>Analytics</p>
        <h1 className={`serif ${styles.title}`}>Statistics</h1>
      </header>

      <Segmented
        ariaLabel="Stats period"
        value={period}
        onChange={setPeriod}
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ]}
      />

      <section className={styles.heroStat}>
        <div>
          <p className={styles.statLabel}>Completion rate</p>
          <p className={`${styles.statNumber} tabular`}>{completion.rate}%</p>
          <p className={styles.statSub}>
            <span className="tabular">
              {completion.completed} / {completion.scheduled}
            </span>{' '}
            tasks completed
          </p>
        </div>
        <div className={styles.streakBox}>
          <p className={styles.statLabel}>Consistency</p>
          <p className={`${styles.streakValue} tabular`}>{streak}</p>
          <p className={styles.statSub}>day streak</p>
          {weekDelta !== 0 && (
            <p className={styles.delta}>
              {weekDelta > 0 ? '+' : ''}
              {weekDelta}% vs last week
            </p>
          )}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Productivity trend</h2>
        {period === 'year' || series.length > 20 ? (
          <TrendChart data={series.length > 60 ? downsample(series, 52) : series} />
        ) : (
          <BarChart data={series} />
        )}
      </section>

      <section className={styles.panel}>
        <h2>Activity</h2>
        <Heatmap data={period === 'year' ? yearHeat : heatmapData} />
        <div className={styles.heatLegend}>
          <span>Less</span>
          <i data-level="0" />
          <i data-level="1" />
          <i data-level="2" />
          <i data-level="3" />
          <i data-level="4" />
          <span>More</span>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Goal progress</h2>
        <GoalProgressList items={goalBars} />
      </section>

      <section className={styles.panel}>
        <h2>This week</h2>
        <dl className={styles.summary}>
          <div>
            <dt>Tasks completed</dt>
            <dd className="tabular">{weekly.tasksCompleted}</dd>
          </div>
          <div>
            <dt>Completion rate</dt>
            <dd className="tabular">{weekly.completionRate}%</dd>
          </div>
          <div>
            <dt>Best day</dt>
            <dd>{weekly.bestDay ?? '—'}</dd>
          </div>
          <div>
            <dt>Most productive</dt>
            <dd>{weekly.mostProductiveHour ?? '—'}</dd>
          </div>
          <div>
            <dt>Goals advanced</dt>
            <dd className="tabular">{weekly.goalsAdvanced}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.panel}>
        <h2>Monthly overview</h2>
        <dl className={styles.summary}>
          <div>
            <dt>Total tasks</dt>
            <dd className="tabular">{monthly.totalTasks}</dd>
          </div>
          <div>
            <dt>Completed</dt>
            <dd className="tabular">{monthly.completedTasks}</dd>
          </div>
          <div>
            <dt>Missed</dt>
            <dd className="tabular">{monthly.missedTasks}</dd>
          </div>
          <div>
            <dt>Daily average</dt>
            <dd className="tabular">{monthly.averageDailyCompletion}</dd>
          </div>
          <div>
            <dt>Longest streak</dt>
            <dd className="tabular">{monthly.longestStreak}d</dd>
          </div>
          <div>
            <dt>Best day</dt>
            <dd>{monthly.mostProductiveDay ?? '—'}</dd>
          </div>
        </dl>
      </section>

      {period === 'year' && (
        <section className={styles.panel}>
          <h2>Yearly heatmap</h2>
          <p className={styles.yearHint}>
            Each cell is a day in {new Date().getFullYear()}. Spot streaks, dips, and peaks at a glance.
          </p>
          <Heatmap data={yearHeat} />
        </section>
      )}
    </div>
  )
}

function downsample<T>(arr: T[], count: number): T[] {
  if (arr.length <= count) return arr
  const step = arr.length / count
  return Array.from({ length: count }, (_, i) => arr[Math.floor(i * step)])
}
