import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { toDateKey } from '../../lib/dates'
import { calcCompletion, areaProgress } from '../../lib/stats'
import { ProgressBar } from '../../components/ui/Progress'
import styles from './WidgetsPage.module.css'

export function WidgetsPage() {
  const tasks = useAppStore((s) => s.tasks)
  const goals = useAppStore((s) => s.goals)

  const todayKey = toDateKey(new Date())
  const today = useMemo(
    () => tasks.filter((t) => t.dueDate === todayKey),
    [tasks, todayKey],
  )
  const stats = calcCompletion(today)
  const previewTasks = [...today]
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (b.status === 'completed' && a.status !== 'completed') return -1
      return 0
    })
    .slice(0, 4)

  const studiesGoal = goals.find((g) => g.area === 'studies') ?? goals[0]
  const studiesProgress = studiesGoal ? areaProgress(studiesGoal.area, tasks) : 0

  return (
    <div className={styles.page}>
      <Link to="/profile" className={styles.back}>
        ← Profile
      </Link>
      <header>
        <p className={styles.eyebrow}>Home screen</p>
        <h1 className={`serif ${styles.title}`}>Widgets</h1>
        <p className={styles.lead}>
          Glanceable surfaces that mirror North's visual language. On native builds these map to iOS/Android widget targets.
        </p>
      </header>

      <div className={styles.grid}>
        <article className={`${styles.widget} ${styles.medium}`}>
          <p className={styles.wLabel}>Today</p>
          <p className={`${styles.wStat} tabular`}>
            {stats.completed} / {stats.scheduled} completed
          </p>
          <ul className={styles.wTasks}>
            {previewTasks.map((t) => (
              <li key={t.id} className={t.status === 'completed' ? styles.done : undefined}>
                <span className={styles.bullet}>
                  {t.status === 'completed' ? '✓' : '○'}
                </span>
                {t.title}
              </li>
            ))}
          </ul>
        </article>

        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>Quick add</p>
          <div className={styles.quickAdd}>
            <span className={styles.plus}>+</span>
            <span>Add Task</span>
          </div>
        </article>

        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>Progress</p>
          <p className={`${styles.bigPct} tabular`}>{stats.rate}%</p>
          <p className={styles.wSub}>Today's completion</p>
          <ProgressBar value={stats.rate} className={styles.wBar} />
        </article>

        <article className={`${styles.widget} ${styles.medium}`}>
          <p className={styles.wLabel}>Goal</p>
          <p className={styles.goalTitle}>{studiesGoal?.title ?? 'Studies'}</p>
          <p className={`${styles.wStat} tabular`}>{studiesProgress}%</p>
          <ProgressBar value={studiesProgress} height={5} />
        </article>
      </div>
    </div>
  )
}
