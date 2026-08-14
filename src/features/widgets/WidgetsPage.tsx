import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { toDateKey } from '../../lib/dates'
import {
  calcCompletion,
  calcStreak,
  getTodaySelectedTasks,
  areaTaskCounts,
} from '../../lib/stats'
import { buildRecommendations } from '../../lib/recommendations'
import { dailyWorkQuote } from '../../lib/quotes'
import { TASK_AREAS } from '../../lib/taskAreas'
import styles from './WidgetsPage.module.css'

export function WidgetsPage() {
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const dailySelection = useAppStore((s) => s.dailySelection)
  const googleTasks = useAppStore((s) => s.googleTasks)

  const todayKey = toDateKey(new Date())
  const quote = dailyWorkQuote(todayKey)
  const today = useMemo(
    () => getTodaySelectedTasks(tasks, dailySelection, history, todayKey),
    [tasks, dailySelection, history, todayKey],
  )
  const stats = calcCompletion(today)
  const streak = calcStreak(tasks, history)
  const lockedIn =
    dailySelection.dateKey === todayKey && dailySelection.taskIds.length >= 5
  const alertCount = useMemo(
    () => buildRecommendations(tasks, history).filter((r) => r.flagged).length,
    [tasks, history],
  )

  const previewTasks = [...today]
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (b.status === 'completed' && a.status !== 'completed') return -1
      return 0
    })
    .slice(0, 4)

  const nextFocus = [...today]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 }
      return rank[a.priority] - rank[b.priority]
    })[0]

  const areaSnapshots = TASK_AREAS.map((a) => ({
    ...a,
    ...areaTaskCounts(a.value, tasks, history, todayKey),
  })).filter((a) => a.total > 0)

  const remaining = Math.max(0, stats.scheduled - stats.completed)
  const completionPct =
    stats.scheduled > 0 ? Math.round((stats.completed / stats.scheduled) * 100) : 0
  const highPriorityLeft = today.filter(
    (t) => t.status !== 'completed' && t.priority === 'high',
  ).length
  const syncedCount = today.filter((t) => t.googleTaskId).length

  return (
    <div className={styles.page}>
      <Link to="/profile" className={styles.back}>
        ← Profile
      </Link>
      <header>
        <p className={styles.eyebrow}>Home screen</p>
        <h1 className={`serif ${styles.title}`}>Widgets</h1>
        <p className={styles.lead}>
          Glanceable surfaces that mirror North&apos;s visual language. On native
          builds these map to iOS/Android widget targets.
        </p>
      </header>

      <div className={styles.grid}>
        <article className={`${styles.widget} ${styles.medium}`}>
          <p className={styles.wLabel}>Today</p>
          <p className={`${styles.wStat} tabular`}>
            {stats.completed} / {stats.scheduled}
          </p>
          <ul className={styles.wTasks}>
            {previewTasks.length === 0 ? (
              <li className={styles.muted}>No tasks locked in</li>
            ) : (
              previewTasks.map((t) => (
                <li
                  key={t.id}
                  className={t.status === 'completed' ? styles.done : undefined}
                >
                  <span className={styles.bullet}>
                    {t.status === 'completed' ? '✓' : '○'}
                  </span>
                  {t.title}
                </li>
              ))
            )}
          </ul>
        </article>

        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>Streak</p>
          <p className={`${styles.bigPct} tabular`}>{streak}</p>
          <p className={styles.wSub}>days active</p>
        </article>

        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>Alerts</p>
          <p className={`${styles.bigPct} tabular`}>{alertCount}</p>
          <p className={styles.wSub}>priority flags</p>
        </article>

        <article className={`${styles.widget} ${styles.medium}`}>
          <p className={styles.wLabel}>Next focus</p>
          {nextFocus ? (
            <>
              <p className={styles.goalTitle}>{nextFocus.title}</p>
              <p className={styles.wSub}>{nextFocus.priority} priority</p>
            </>
          ) : (
            <p className={styles.muted}>
              {lockedIn ? 'All clear for today' : 'Lock in today’s tasks first'}
            </p>
          )}
        </article>

        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>Day</p>
          <p className={`${styles.dayStatus} tabular`}>
            {lockedIn ? dailySelection.taskIds.length : '—'}
          </p>
          <p className={styles.wSub}>
            {lockedIn ? 'tasks locked in' : 'not started'}
          </p>
        </article>

        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>Library</p>
          <p className={`${styles.dayStatus} tabular`}>{tasks.length}</p>
          <p className={styles.wSub}>standing tasks</p>
        </article>

        <article className={`${styles.widget} ${styles.medium}`}>
          <p className={styles.wLabel}>Areas today</p>
          {areaSnapshots.length === 0 ? (
            <p className={styles.muted}>No areas linked yet</p>
          ) : (
            <ul className={styles.areaList}>
              {areaSnapshots.map((a) => (
                <li key={a.value}>
                  <span>{a.label}</span>
                  <span className="tabular">
                    {a.done}/{a.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className={`${styles.widget} ${styles.medium}`}>
          <p className={styles.wLabel}>Daily quote</p>
          <p className={styles.quoteText}>&ldquo;{quote.text}&rdquo;</p>
          <p className={styles.wSub}>— {quote.author}</p>
        </article>

        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>Remaining</p>
          <p className={`${styles.bigPct} tabular`}>{remaining}</p>
          <p className={styles.wSub}>tasks left today</p>
        </article>

        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>Progress</p>
          <p className={`${styles.bigPct} tabular`}>{completionPct}%</p>
          <p className={styles.wSub}>of today&apos;s list</p>
        </article>

        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>High priority</p>
          <p className={`${styles.bigPct} tabular`}>{highPriorityLeft}</p>
          <p className={styles.wSub}>still open</p>
        </article>

        <article className={`${styles.widget} ${styles.medium}`}>
          <p className={styles.wLabel}>Google Tasks</p>
          {googleTasks.connected ? (
            <>
              <p className={styles.goalTitle}>Synced to North list</p>
              <p className={styles.wSub}>
                {syncedCount}/{today.length} today&apos;s tasks linked
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

        <article className={`${styles.widget} ${styles.small}`}>
          <p className={styles.wLabel}>Done</p>
          <p className={`${styles.dayStatus} tabular`}>{stats.completed}</p>
          <p className={styles.wSub}>checked off</p>
        </article>
      </div>
    </div>
  )
}
