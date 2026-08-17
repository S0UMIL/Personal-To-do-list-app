import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { useCloudIdentity } from '../../hooks/useCloudIdentity'
import { toDateKey } from '../../lib/dates'
import { calcCompletion, getTodaySelectedTasks } from '../../lib/stats'
import {
  addFriendByCode as addFirebaseFriend,
  listFriends as listFirebaseFriends,
  getDailyProgress as getFirebaseProgress,
  type CloudFriend,
} from '../../services/cloud'
import {
  addFriendByCode as addSupabaseFriend,
  listMyFriends,
  removeFriend,
  getDailyProgress as getSupabaseProgress,
  progressRatePercent,
  type SupabaseFriend,
} from '../../services/supabase'
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
  const identity = useCloudIdentity()
  const user = useAppStore((s) => s.user)
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const dailySelection = useAppStore((s) => s.dailySelection)
  const demoFriends = useAppStore((s) => s.friends)
  const demoActivities = useAppStore((s) => s.friendActivities)

  const [cloudFriends, setCloudFriends] = useState<
    { id: string; name: string }[]
  >([])
  const [friendProgress, setFriendProgress] = useState<
    Record<string, { completed: number; total: number; rate: number }>
  >({})
  const [friendCodeInput, setFriendCodeInput] = useState('')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [loadingFriends, setLoadingFriends] = useState(false)

  const todayKey = toDateKey(new Date())
  const useSupabaseSocial = identity.source === 'supabase'
  const useFirebaseSocial = identity.source === 'firebase'

  const loadCloudFriends = useCallback(async () => {
    if (!identity.isAuthenticated || !identity.uid) return
    setLoadingFriends(true)
    try {
      if (useSupabaseSocial) {
        const friends = await listMyFriends(identity.uid)
        setCloudFriends(
          friends.map((f: SupabaseFriend) => ({
            id: f.id,
            name: f.display_name,
          })),
        )
        const progress: Record<string, { completed: number; total: number; rate: number }> =
          {}
        for (const f of friends) {
          const p = await getSupabaseProgress(f.id, todayKey)
          if (p) {
            progress[f.id] = {
              completed: p.completed,
              total: p.total,
              rate: progressRatePercent(p.rate),
            }
          }
        }
        setFriendProgress(progress)
      } else if (useFirebaseSocial) {
        const friends = await listFirebaseFriends(identity.uid)
        setCloudFriends(
          friends.map((f: CloudFriend) => ({
            id: f.uid,
            name: f.displayName,
          })),
        )
        const progress: Record<string, { completed: number; total: number; rate: number }> =
          {}
        for (const f of friends) {
          const p = await getFirebaseProgress(f.uid, todayKey)
          if (p) {
            progress[f.uid] = {
              completed: p.completed,
              total: p.total,
              rate: p.rate <= 1 ? Math.round(p.rate * 100) : p.rate,
            }
          }
        }
        setFriendProgress(progress)
      }
    } catch {
      /* stay on last known list — local app still works */
    } finally {
      setLoadingFriends(false)
    }
  }, [identity.isAuthenticated, identity.uid, useSupabaseSocial, useFirebaseSocial, todayKey])

  useEffect(() => {
    if (identity.isAuthenticated) {
      loadCloudFriends()
    }
  }, [identity.isAuthenticated, loadCloudFriends])

  const handleAddFriend = async () => {
    if (!identity.uid) return
    setAddError('')
    setAddLoading(true)
    try {
      if (useSupabaseSocial) {
        await addSupabaseFriend(friendCodeInput)
      } else if (useFirebaseSocial) {
        await addFirebaseFriend(identity.uid, friendCodeInput)
      }
      setFriendCodeInput('')
      await loadCloudFriends()
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Could not add friend')
    } finally {
      setAddLoading(false)
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    if (!useSupabaseSocial) return
    try {
      await removeFriend(friendId)
      await loadCloudFriends()
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Could not remove friend')
    }
  }

  const leaderboard = useMemo(() => {
    const entries: LeaderEntry[] = []
    const userStats = calcCompletion(
      getTodaySelectedTasks(tasks, dailySelection, history, todayKey),
    )

    entries.push({
      id: identity.uid ?? user.id,
      name: identity.displayName ?? user.name,
      color: 'var(--accent)',
      completed: userStats.completed,
      total: userStats.scheduled,
      rate: userStats.rate,
      isYou: true,
    })

    if (identity.isAuthenticated && cloudFriends.length > 0) {
      cloudFriends.forEach((friend, i) => {
        const p = friendProgress[friend.id]
        const completed = p?.completed ?? 0
        const total = p?.total ?? 0
        const rate = p?.rate ?? (total ? Math.round((completed / total) * 100) : 0)
        entries.push({
          id: friend.id,
          name: friend.name,
          color: FRIEND_COLORS[i % FRIEND_COLORS.length],
          completed,
          total,
          rate,
        })
      })
    } else if (!identity.isAuthenticated) {
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
    identity.uid,
    identity.displayName,
    identity.isAuthenticated,
    user,
    tasks,
    history,
    dailySelection,
    todayKey,
    cloudFriends,
    friendProgress,
    demoFriends,
    demoActivities,
  ])

  return (
    <div className={styles.page}>
      <header>
        <p className={styles.eyebrow}>Today</p>
        <h1 className={`displayTitle ${styles.title}`}>Leaderboard</h1>
      </header>

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
                  <span className={styles.crown} aria-label="1st place">
                    ★
                  </span>
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
                {useSupabaseSocial && !entry.isYou && (
                  <button
                    type="button"
                    className={styles.addHint}
                    onClick={() => handleRemoveFriend(entry.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {identity.isAuthenticated && identity.friendCode && (
        <section className={styles.addSection}>
          <h2 className={styles.addLabel}>Add friend</h2>
          <p className={styles.addHint}>
            Enter their unique ID (e.g. <strong>{identity.friendCode}</strong> is yours).
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
    </div>
  )
}
