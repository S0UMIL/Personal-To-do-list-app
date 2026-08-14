import { Link } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import {
  buildRecommendations,
  formatDaysSince,
} from '../../lib/recommendations'
import { getAreaLabel } from '../../lib/taskAreas'
import styles from './RecommendationsPage.module.css'

export function RecommendationsPage() {
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)

  const all = buildRecommendations(tasks, history)
  const alerts = all.filter((r) => r.flagged)
  const suggestions = all.filter((r) => !r.flagged && r.approaching)

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>
        ← Home
      </Link>

      <header className={styles.header}>
        <p className={styles.eyebrow}>Attention</p>
        <h1 className={`serif ${styles.title}`}>Recommendations</h1>
        <p className={styles.lead}>
          Tasks that have gone quiet relative to their priority.
        </p>
      </header>

      <section className={styles.section} aria-label="Alerts">
        <h2 className={styles.sectionTitle}>Alerts</h2>
        {alerts.length === 0 ? (
          <p className={styles.empty}>Nothing flagged right now.</p>
        ) : (
          <ul className={styles.list}>
            {alerts.map(({ task, daysSince, threshold }) => (
              <li key={task.id} className={styles.alert}>
                <div className={styles.row}>
                  <p className={styles.taskTitle}>{task.title}</p>
                  <span className={`${styles.badge} ${styles[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
                <p className={styles.detail}>
                  {formatDaysSince(daysSince)}
                  {Number.isFinite(daysSince)
                    ? ` · threshold ${threshold}d`
                    : ''}
                  {task.area ? ` · ${getAreaLabel(task.area)}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section} aria-label="Suggestions">
        <h2 className={styles.sectionTitle}>Suggestions</h2>
        {suggestions.length === 0 ? (
          <p className={styles.empty}>You&apos;re caught up on everything else.</p>
        ) : (
          <ul className={styles.list}>
            {suggestions.map(({ task, daysSince }) => (
              <li key={task.id} className={styles.soft}>
                <div className={styles.row}>
                  <p className={styles.taskTitle}>{task.title}</p>
                  <span className={styles.softMeta}>{task.priority}</span>
                </div>
                <p className={styles.detail}>{formatDaysSince(daysSince)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
