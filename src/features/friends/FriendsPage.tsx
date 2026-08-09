import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useAppStore } from '../../store/useAppStore'
import { toDateKey } from '../../lib/dates'
import { calcCompletionForDate } from '../../lib/stats'
import {
  addFriendByCode,
  listFriends,
  getDailyProgress,
  type CloudFriend,
} from '../../services/cloud'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import styles from './FriendsPage.module.css'

interface LeaderEntry {
  id: string
  name: string
  color: string
  completed: number
  total: number
  rate: number
  isYou?: boolean
}

const FRIEND_COLORS = ['#a78bfa', '#5ecf8a', '#e85d5d', '#8ba4b8', '#d4845a', '#6b9cd4']

export function FriendsPage() {
  const { profile, isAuthenticated, isOfflineMode } = useAuth()
  const user = useAppStore((s) => s.user)
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const demoFriends = useAppStore((s) => s.friends)
  const demoActivities = useAppStore((s) => s.friendActivities)

  const [cloudFriends, setCloudFriends] = useState<CloudFriend[]>([])
  const [friendProgress, setFriendProgress] = useState<
    Record<string, { completed: number; total: number; rate: number }>
  >({})
  const [friendCodeInput, setFriendCodeInput] = useState('')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [loadingFriends, setLoadingFriends] = useState(false)

  const todayKey = toDateKey(new Date())

  const loadCloudFriends = useCallback(async () => {
    if (!profile) return
    setLoadingFriends(true)
    try {
      const friends = await listFriends(profile.uid)
      setCloudFriends(friends)
      const progress: Record<string, { completed: number; total: number; rate: number }> = {}
      for (const f of friends) {
        const p = await getDailyProgress(f.uid, todayKey)
        if (p) progress[f.uid] = { completed: p.completed, total: p.total, rate: p.rate }
      }
      setFriendProgress(progress)
    } finally {
      setLoadingFriends(false)
    }
  }, [profile, todayKey])

  useEffect(() => {
    if (isAuthenticated && profile) {
      loadCloudFriends()
    }
  }, [isAuthenticated, profile, loadCloudFriends])

  const handleAddFriend = async () => {
    if (!profile) return
    setAddError('')
    setAddLoading(true)
    try {
      await addFriendByCode(profile.uid, friendCodeInput)
      setFriendCodeInput('')
      await loadCloudFriends()
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Could not add friend')
    } finally {
      setAddLoading(false)
    }
  }

  const leaderboard = useMemo(() => {
    const entries: LeaderEntry[] = []
    const userStats = calcCompletionForDate(tasks, todayKey, history)

    entries.push({
      id: profile?.uid ?? user.id,
      name: profile?.displayName ?? user.name,
      color: 'var(--accent)',
      completed: userStats.completed,
      total: userStats.scheduled,
      rate: userStats.rate,
      isYou: true,
    })

    if (isAuthenticated && cloudFriends.length > 0) {
      cloudFriends.forEach((friend, i) => {
        const p = friendProgress[friend.uid]
        const completed = p?.completed ?? 0
        const total = p?.total ?? 0
        const rate = p?.rate ?? (total ? Math.round((completed / total) * 100) : 0)
        entries.push({
          id: friend.uid,
          name: friend.displayName,
          color: FRIEND_COLORS[i % FRIEND_COLORS.length],
          completed,
          total,
          rate,
        })
      })
    } else if (isOfflineMode) {
      demoFriends.forEach((friend) => {
        const dayActs = demoActivities.filter(
          (a) => a.friendId === friend.id && a.date === todayKey,
        )
        const completed = dayActs.filter((a) => a.completed).length
        const total = dayActs.length
        entries.push({
          id: friend.id,
          name: friend.name,
          color: friend.color,
          completed,
          total,
          rate: total ? Math.round((completed / total) * 100) : 0,
        })
      })
    }

    return entries.sort((a, b) => {
      if (b.completed !== a.completed) return b.completed - a.completed
      return b.rate - a.rate
    })
  }, [
    profile,
    user,
    tasks,
    history,
    todayKey,
    cloudFriends,
    friendProgress,
    isAuthenticated,
    isOfflineMode,
    demoFriends,
    demoActivities,
  ])

  return (
    <div className={styles.page}>
      <header>
        <p className={styles.eyebrow}>Today</p>
        <h1 className={`serif ${styles.title}`}>Friends</h1>
        <p className={styles.lead}>
          {isAuthenticated
            ? 'Compete on daily completion with people you add.'
            : 'Sign in with Google to compete with real friends.'}
        </p>
      </header>

      {isAuthenticated && profile && (
        <section className={styles.addSection}>
          <h2 className={styles.addLabel}>Add friend</h2>
          <p className={styles.addHint}>
            Enter their unique ID (e.g. <strong>{profile.friendCode}</strong> is yours).
          </p>
          <div className={styles.addRow}>
            <Input
              value={friendCodeInput}
              onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
              placeholder="N-XXXXXX"
            />
            <Button onClick={handleAddFriend} disabled={addLoading || !friendCodeInput.trim()}>
              Add
            </Button>
          </div>
          {addError && <p className={styles.addError}>{addError}</p>}
        </section>
      )}

      {loadingFriends && <p className={styles.loading}>Updating leaderboard…</p>}

      <ol className={styles.leaderboard}>
        {leaderboard.map((entry, index) => {
          const isFirst = index === 0 && entry.completed > 0
          return (
            <li
              key={entry.id}
              className={`${styles.row} ${entry.isYou ? styles.you : ''} ${isFirst ? styles.first : ''}`}
            >
              <span className={`${styles.rank} tabular`}>
                {isFirst ? (
                  <span className={styles.crown} aria-label="1st place">★</span>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`${styles.avatar} ${isFirst ? styles.avatarFirst : ''}`}
                style={{ background: entry.color }}
              >
                {entry.name.charAt(0)}
              </span>
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>
                    {entry.name}
                    {isFirst && <span className={styles.firstBadge}>1st</span>}
                    {entry.isYou && <span className={styles.youBadge}>You</span>}
                  </span>
                  <span className={`${styles.score} tabular`}>
                    {entry.completed}/{entry.total}
                  </span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${entry.rate}%`, background: entry.color }}
                  />
                </div>
                <p className={`${styles.rate} tabular`}>{entry.rate}% today</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
