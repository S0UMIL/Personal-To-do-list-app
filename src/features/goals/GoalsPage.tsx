import { useMemo, useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { GoalCard } from '../../components/goals/GoalCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Input, TextArea } from '../../components/ui/Input'
import { areaTaskCounts } from '../../lib/stats'
import { TASK_AREAS } from '../../lib/taskAreas'
import type { TaskArea } from '../../types'
import styles from './GoalsPage.module.css'

export function GoalsPage() {
  const goals = useAppStore((s) => s.goals)
  const tasks = useAppStore((s) => s.tasks)
  const history = useAppStore((s) => s.history)
  const addGoal = useAppStore((s) => s.addGoal)

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [area, setArea] = useState<TaskArea>('studies')
  const [deadline, setDeadline] = useState('')

  const visible = useMemo(
    () => goals.filter((g) => g.status === 'active'),
    [goals],
  )

  const create = () => {
    if (!title.trim()) return
    addGoal({
      title: title.trim(),
      description: description.trim(),
      type: 'long_term',
      area,
      deadline: deadline || undefined,
    })
    setOpen(false)
    setTitle('')
    setDescription('')
    setArea('studies')
    setDeadline('')
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Direction</p>
          <h1 className={`serif ${styles.title}`}>Goals</h1>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          New goal
        </Button>
      </header>

      {visible.length === 0 ? (
        <EmptyState
          title="Where are you heading?"
          description="Create your first goal."
          action={
            <Button variant="secondary" onClick={() => setOpen(true)}>
              Create goal
            </Button>
          }
        />
      ) : (
        <div className={styles.list}>
          {visible.map((goal) => {
            const counts = areaTaskCounts(goal.area, tasks, history)
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                done={counts.done}
                total={counts.total}
              />
            )
          })}
        </div>
      )}

      <BottomSheet open={open} onClose={() => setOpen(false)} title="New goal" tall>
        <div className={styles.form}>
          <label className={styles.selectField}>
            <span>Area</span>
            <select
              value={area}
              onChange={(e) => {
                const next = e.target.value as TaskArea
                setArea(next)
                if (!title) setTitle(TASK_AREAS.find((a) => a.value === next)?.label ?? '')
              }}
            >
              {TASK_AREAS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fitness"
            autoFocus
          />
          <TextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why this matters"
          />
          <Input
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <Button fullWidth onClick={create} disabled={!title.trim()}>
            Create goal
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
