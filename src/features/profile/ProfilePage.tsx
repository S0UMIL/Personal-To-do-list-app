import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAppStore } from '../../store/useAppStore'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { COLOR_THEMES } from '../../lib/themes'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const { profile, isAuthenticated, signOut } = useAuth()
  const user = useAppStore((s) => s.user)
  const setUserName = useAppStore((s) => s.setUserName)
  const updatePreferences = useAppStore((s) => s.updatePreferences)
  const resetDemoData = useAppStore((s) => s.resetDemoData)

  const colorTheme = user.preferences.colorTheme ?? 'midnight'

  const copyId = () => {
    if (profile?.friendCode) {
      navigator.clipboard.writeText(profile.friendCode)
    }
  }

  return (
    <div className={styles.page}>
      <header>
        <p className={styles.eyebrow}>Account</p>
        <h1 className={`serif ${styles.title}`}>Profile</h1>
      </header>

      {isAuthenticated && profile && (
        <section className={styles.section}>
          <h2>Your ID</h2>
          <p className={styles.appearance}>
            Share this with friends so they can add you on the leaderboard.
          </p>
          <div className={styles.idBox}>
            <code className={styles.friendCode}>{profile.friendCode}</code>
            <Button size="sm" variant="secondary" onClick={copyId}>
              Copy
            </Button>
          </div>
          <p className={styles.uid}>Account · {profile.uid.slice(0, 12)}…</p>
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
            <span className={styles.toggleDesc}>Affects calendar and weekly stats</span>
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
        <h2>Widgets</h2>
        <p className={styles.appearance}>
          Preview home-screen widget concepts designed for glanceable progress.
        </p>
        <Link to="/widgets" className={styles.link}>
          View widget previews →
        </Link>
      </section>

      <section className={styles.section}>
        <h2>Data</h2>
        <Button variant="secondary" onClick={resetDemoData}>
          Reset demo data
        </Button>
      </section>

      {isAuthenticated && (
        <section className={styles.section}>
          <Button variant="secondary" onClick={() => signOut()}>
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
