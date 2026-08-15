import type { WidgetCatalogEntry } from '../../lib/widgets/types'
import type { WidgetSnapshot } from '../../lib/widgets/types'
import styles from './WidgetsPage.module.css'

interface Props {
  entry: WidgetCatalogEntry
  snapshot: WidgetSnapshot
}

export function WidgetPreviewCard({ entry, snapshot }: Props) {
  const { today, streak, alerts, nextFocus, libraryCount, areas, quote, googleTasks } =
    snapshot

  switch (entry.id) {
    case 'today':
      return (
        <article className={`${styles.widget} ${styles.medium}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          <p className={`${styles.wStat} tabular`}>
            {today.completed} / {today.scheduled}
          </p>
          <ul className={styles.wTasks}>
            {today.previewTasks.length === 0 ? (
              <li className={styles.muted}>No tasks locked in</li>
            ) : (
              today.previewTasks.map((t) => (
                <li key={t.id} className={t.completed ? styles.done : undefined}>
                  <span className={styles.bullet}>{t.completed ? '✓' : '○'}</span>
                  {t.title}
                </li>
              ))
            )}
          </ul>
        </article>
      )

    case 'streak':
      return (
        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          <p className={`${styles.bigPct} tabular`}>{streak}</p>
          <p className={styles.wSub}>days active</p>
        </article>
      )

    case 'alerts':
      return (
        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          <p className={`${styles.bigPct} tabular`}>{alerts}</p>
          <p className={styles.wSub}>priority flags</p>
        </article>
      )

    case 'next_focus':
      return (
        <article className={`${styles.widget} ${styles.medium}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          {nextFocus ? (
            <>
              <p className={styles.goalTitle}>{nextFocus.title}</p>
              <p className={styles.wSub}>{nextFocus.priority} priority</p>
            </>
          ) : (
            <p className={styles.muted}>
              {today.lockedIn ? 'All clear for today' : 'Lock in today’s tasks first'}
            </p>
          )}
        </article>
      )

    case 'day':
      return (
        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          <p className={`${styles.dayStatus} tabular`}>
            {today.lockedIn ? today.lockedCount : '—'}
          </p>
          <p className={styles.wSub}>
            {today.lockedIn ? 'tasks locked in' : 'not started'}
          </p>
        </article>
      )

    case 'library':
      return (
        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          <p className={`${styles.dayStatus} tabular`}>{libraryCount}</p>
          <p className={styles.wSub}>standing tasks</p>
        </article>
      )

    case 'areas_today':
      return (
        <article className={`${styles.widget} ${styles.medium}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          {areas.length === 0 ? (
            <p className={styles.muted}>No areas linked yet</p>
          ) : (
            <ul className={styles.areaList}>
              {areas.map((a) => (
                <li key={a.label}>
                  <span>{a.label}</span>
                  <span className="tabular">
                    {a.done}/{a.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      )

    case 'daily_quote':
      return (
        <article className={`${styles.widget} ${styles.medium}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          <p className={styles.quoteText}>&ldquo;{quote.text}&rdquo;</p>
          <p className={styles.wSub}>— {quote.author}</p>
        </article>
      )

    case 'remaining':
      return (
        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          <p className={`${styles.bigPct} tabular`}>{today.remaining}</p>
          <p className={styles.wSub}>tasks left today</p>
        </article>
      )

    case 'progress':
      return (
        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          <p className={`${styles.bigPct} tabular`}>{today.progressPct}%</p>
          <p className={styles.wSub}>of today&apos;s list</p>
        </article>
      )

    case 'high_priority':
      return (
        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          <p className={`${styles.bigPct} tabular`}>{today.highPriorityLeft}</p>
          <p className={styles.wSub}>still open</p>
        </article>
      )

    case 'google_tasks':
      return (
        <article className={`${styles.widget} ${styles.medium}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          {googleTasks.connected ? (
            <>
              <p className={styles.goalTitle}>Synced to North list</p>
              <p className={styles.wSub}>
                {googleTasks.syncedCount}/{googleTasks.todayTotal} today&apos;s tasks linked
                {googleTasks.lastSyncedAt
                  ? ` · ${new Date(googleTasks.lastSyncedAt).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}`
                  : ''}
              </p>
              {googleTasks.syncError && (
                <p className={styles.syncError}>{googleTasks.syncError}</p>
              )}
            </>
          ) : (
            <p className={styles.muted}>
              Connect in Profile to push tasks and use Google notifications
            </p>
          )}
        </article>
      )

    case 'done':
      return (
        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>{entry.label}</p>
          <p className={`${styles.dayStatus} tabular`}>{today.done}</p>
          <p className={styles.wSub}>checked off</p>
        </article>
      )

    default:
      return null
  }
}
