import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext'
import { useCloudIdentity } from '../../hooks/useCloudIdentity'
import { useAppStore } from '../../store/useAppStore'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { COLOR_THEMES } from '../../lib/themes'
import { connectGoogleTasksApi } from '../../services/cloud'
import { ensureNorthTaskList } from '../../services/googleTasks'
import { SupabaseConnectionPanel } from '../../components/supabase/SupabaseConnectionPanel'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const firebase = useAuth()
  const supabase = useSupabaseAuth()
  const identity = useCloudIdentity()
  const { signOut: firebaseSignOut } = firebase
  const user = useAppStore((s) => s.user)
  const setUserName = useAppStore((s) => s.setUserName)
  const updatePreferences = useAppStore((s) => s.updatePreferences)
  const resetDemoData = useAppStore((s) => s.resetDemoData)
  const googleTasks = useAppStore((s) => s.googleTasks)
  const connectGoogleTasks = useAppStore((s) => s.connectGoogleTasks)
  const disconnectGoogleTasks = useAppStore((s) => s.disconnectGoogleTasks)
  const [connectingTasks, setConnectingTasks] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)

  const colorTheme = user.preferences.colorTheme ?? 'midnight'

  const copyId = () => {
    if (identity.friendCode) {
      navigator.clipboard.writeText(identity.friendCode)
    }
  }

  const handleSignOut = async () => {
    await supabase.signOut().catch(() => undefined)
    await firebaseSignOut()
  }

  const handleConnectGoogleTasks = async () => {
    setConnectError(null)
    setConnectingTasks(true)
    try {
      const accessToken = await connectGoogleTasksApi()
      const listId = await ensureNorthTaskList(accessToken)
      connectGoogleTasks(accessToken, listId)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not connect Google Tasks'
      setConnectError(message)
    } finally {
      setConnectingTasks(false)
    }
  }

  const lastSyncedLabel = googleTasks.lastSyncedAt
    ? new Date(googleTasks.lastSyncedAt).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })
    : null

  return (
    <div className={styles.page}>
      <header>
        <p className={styles.eyebrow}>Account</p>
        <h1 className={`serif ${styles.title}`}>Profile</h1>
      </header>

      {identity.isAuthenticated && identity.friendCode && (
        <section className={styles.section}>
          <h2>Your ID</h2>
          <p className={styles.appearance}>
            Share this with friends so they can add you on the leaderboard.
          </p>
          <div className={styles.idBox}>
            <code className={styles.friendCode}>{identity.friendCode}</code>
            <Button size="sm" variant="secondary" onClick={copyId}>
              Copy
            </Button>
          </div>
          {identity.uid && (
            <p className={styles.uid}>Account · {identity.uid.slice(0, 12)}…</p>
          )}
        </section>
      )}

      <section className={styles.section}>
        <h2>You</h2>
        <Input
          label="Display name"
          value={user.name}
          onChange={(e) => setUserName(e.target.value)}
        />
      </section>

      <section className={styles.section}>
        <h2>Preferences</h2>
        <ToggleRow
          label="Notifications"
          description="Reminders for timed tasks"
          checked={user.preferences.notifications}
          onChange={(v) => updatePreferences({ notifications: v })}
        />
        <ToggleRow
          label="Default reminder"
          description="Suggest a reminder on new tasks"
          checked={user.preferences.defaultReminder}
          onChange={(v) => updatePreferences({ defaultReminder: v })}
        />
        <ToggleRow
          label="Haptic feedback"
          description="Subtle vibration on completion"
          checked={user.preferences.hapticFeedback}
          onChange={(v) => updatePreferences({ hapticFeedback: v })}
        />
        <label className={styles.selectRow}>
          <div>
            <span className={styles.toggleLabel}>Week starts on</span>
            <span className={styles.toggleDesc}>Affects weekly stats</span>
          </div>
          <select
            value={user.preferences.weekStartsOn}
            onChange={(e) =>
              updatePreferences({
                weekStartsOn: Number(e.target.value) as 0 | 1,
              })
            }
          >
            <option value={1}>Monday</option>
            <option value={0}>Sunday</option>
          </select>
        </label>
      </section>

      <section className={styles.section}>
        <h2>Theme</h2>
        <p className={styles.appearance}>
          Dark interface with a colored accent. Pick what feels right today.
        </p>
        <div className={styles.themeGrid}>
          {COLOR_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`${styles.themeOption} ${colorTheme === theme.id ? styles.themeActive : ''}`}
              onClick={() => updatePreferences({ colorTheme: theme.id })}
              aria-pressed={colorTheme === theme.id}
            >
              <span
                className={styles.themeSwatch}
                style={{
                  background: `linear-gradient(135deg, ${theme.secondary ?? '#0d0f14'} 50%, ${theme.preview} 50%)`,
                }}
                aria-hidden
              />
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Google Tasks</h2>
        <p className={styles.appearance}>
          Sync today&apos;s locked-in tasks to a &quot;North&quot; list in Google
          Tasks so reminders and notifications run through Google.
        </p>
        {googleTasks.connected ? (
          <div className={styles.googleTasksStatus}>
            <p className={styles.googleTasksConnected}>Connected</p>
            {lastSyncedLabel && (
              <p className={styles.googleTasksMeta}>
                Last synced · {lastSyncedLabel}
              </p>
            )}
            {googleTasks.syncError && (
              <p className={styles.googleTasksError}>{googleTasks.syncError}</p>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => disconnectGoogleTasks()}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className={styles.googleTasksStatus}>
            {connectError && (
              <p className={styles.googleTasksError}>{connectError}</p>
            )}
            <Button
              variant="secondary"
              onClick={handleConnectGoogleTasks}
              disabled={connectingTasks}
            >
              {connectingTasks ? 'Connecting…' : 'Connect Google Tasks'}
            </Button>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2>Widgets</h2>
        <p className={styles.appearance}>
          Preview home-screen widget concepts designed for glanceable progress.
        </p>
        <Link to="/widgets" className={styles.link}>
          View widget previews →
        </Link>
      </section>

      <SupabaseConnectionPanel />

      <section className={styles.section}>
        <h2>Data</h2>
        <Button variant="secondary" onClick={resetDemoData}>
          Reset demo data
        </Button>
      </section>

      {identity.isAuthenticated && (
        <section className={styles.section}>
          <Button variant="secondary" onClick={handleSignOut}>
            Sign out
          </Button>
        </section>
      )}

      <p className={styles.footer}>North · personal progress command center</p>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className={styles.toggleRow}>
      <div>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.toggleDesc}>{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`${styles.switch} ${checked ? styles.on : ''}`}
        onClick={() => onChange(!checked)}
      />
    </div>
  )
}
