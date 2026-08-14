import { useMemo, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { useQuickAdd } from '../../components/layout/AppShell'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { getAreaLabel } from '../../lib/taskAreas'
import styles from './TasksPage.module.css'

export function TasksPage() {
  const tasks = useAppStore((s) => s.tasks)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const { openQuickAdd } = useQuickAdd()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const sorted = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const rank = { high: 0, medium: 1, low: 2 }
        return rank[a.priority] - rank[b.priority] || a.title.localeCompare(b.title)
      }),
    [tasks],
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Library</p>
          <h1 className={`serif ${styles.title}`}>Tasks</h1>
          <p className={styles.lead}>
            Standing tasks you draw from each day. Add or remove as you like.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => openQuickAdd()}>
          Add
        </Button>
      </header>

      {sorted.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Build a library of 10–15 standing tasks."
          action={
            <Button variant="secondary" onClick={() => openQuickAdd()}>
              Add a task
            </Button>
          }
        />
      ) : (
        <ul className={styles.list}>
          {sorted.map((task) => (
            <li key={task.id} className={styles.item}>
              <button
                type="button"
                className={styles.main}
                onClick={() => openQuickAdd({ task })}
              >
                <span className={styles.itemTitle}>{task.title}</span>
                <span className={styles.meta}>
                  <span className={`${styles.priority} ${styles[task.priority]}`}>
                    {task.priority}
                  </span>
                  {task.area && <span>{getAreaLabel(task.area)}</span>}
                </span>
              </button>
              {confirmId === task.id ? (
                <div className={styles.confirm}>
                  <button
                    type="button"
                    className={styles.danger}
                    onClick={() => {
                      deleteTask(task.id)
                      setConfirmId(null)
                    }}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className={styles.cancel}
                    onClick={() => setConfirmId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => setConfirmId(task.id)}
                  aria-label={`Remove ${task.title}`}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
