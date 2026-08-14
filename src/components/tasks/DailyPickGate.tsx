import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../ui/Button'
import { getAreaLabel } from '../../lib/taskAreas'
import styles from './DailyPickGate.module.css'

const MIN = 5

interface DailyPickGateProps {
  open: boolean
  mode?: 'initial' | 'edit'
  onClose?: () => void
}

export function DailyPickGate({ open, mode = 'initial', onClose }: DailyPickGateProps) {
  const tasks = useAppStore((s) => s.tasks)
  const dateKey = useAppStore((s) => s.dailySelection.dateKey)
  const currentIds = useAppStore((s) => s.dailySelection.taskIds)
  const setDailySelection = useAppStore((s) => s.setDailySelection)
  const [selected, setSelected] = useState<string[]>([])

  const isEdit = mode === 'edit'

  useEffect(() => {
    if (!open) return
    setSelected(isEdit ? [...currentIds] : [])
  }, [open, dateKey, isEdit, currentIds])

  const sorted = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const rank = { high: 0, medium: 1, low: 2 }
        return rank[a.priority] - rank[b.priority] || a.title.localeCompare(b.title)
      }),
    [tasks],
  )

  if (!open) return null

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const canSubmit = selected.length >= MIN

  const handleSave = () => {
    if (!canSubmit) return
    setDailySelection(selected)
    onClose?.()
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="daily-pick-title">
      <div className={styles.panel}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Today</p>
          <h2 id="daily-pick-title" className={`serif ${styles.title}`}>
            {isEdit ? "Edit today's tasks" : "Choose today's tasks"}
          </h2>
          <p className={styles.lead}>
            {isEdit
              ? `Swap tasks anytime — keep at least ${MIN} selected.`
              : `Pick at least ${MIN} from your library. The day resets at midnight.`}
          </p>
          <p className={`${styles.count} tabular`}>
            {selected.length} selected
            {selected.length < MIN ? ` · ${MIN - selected.length} more` : ''}
          </p>
        </header>

        <ul className={styles.list}>
          {sorted.map((task) => {
            const on = selected.includes(task.id)
            return (
              <li key={task.id}>
                <button
                  type="button"
                  className={`${styles.item} ${on ? styles.on : ''}`}
                  onClick={() => toggle(task.id)}
                  aria-pressed={on}
                >
                  <span className={styles.check} aria-hidden>
                    {on ? '✓' : ''}
                  </span>
                  <span className={styles.body}>
                    <span className={styles.itemTitle}>{task.title}</span>
                    <span className={styles.meta}>
                      {task.priority}
                      {task.area ? ` · ${getAreaLabel(task.area)}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className={styles.footer}>
          {isEdit ? (
            <div className={styles.footerActions}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={!canSubmit} onClick={handleSave}>
                Save changes
              </Button>
            </div>
          ) : (
            <Button fullWidth disabled={!canSubmit} onClick={handleSave}>
              Start day
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
