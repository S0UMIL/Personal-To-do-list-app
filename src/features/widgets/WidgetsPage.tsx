import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { WIDGET_CATALOG } from '../../lib/widgets/catalog'
import { computeWidgetSnapshot } from '../../lib/widgets/computeSnapshot'
import { WidgetPreviewCard } from './WidgetPreviewCard'
import styles from './WidgetsPage.module.css'

export function WidgetsPage() {
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const dailySelection = useAppStore((s) => s.dailySelection)
  const user = useAppStore((s) => s.user)
  const googleTasks = useAppStore((s) => s.googleTasks)

  const snapshot = useMemo(
    () =>
      computeWidgetSnapshot({
        tasks,
        history,
        dailySelection,
        googleTasks,
        user,
      }),
    [tasks, history, dailySelection, user, googleTasks],
  )

  return (
    <div className={styles.page}>
      <Link to="/profile" className={styles.back}>
        ← Profile
      </Link>
      <header>
        <p className={styles.eyebrow}>Home screen</p>
        <h1 className={`displayTitle ${styles.title}`}>Widgets</h1>
        <p className={styles.lead}>
          Glanceable surfaces that mirror North&apos;s visual language. On native
          builds these map to iOS/Android widget targets.
        </p>
      </header>

      <div className={styles.grid}>
        {WIDGET_CATALOG.map((entry) => (
          <WidgetPreviewCard key={entry.id} entry={entry} snapshot={snapshot} />
        ))}
      </div>
    </div>
  )
}
