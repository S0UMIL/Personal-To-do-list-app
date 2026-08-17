import { useEffect, useState } from 'react'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { Input, TextArea } from '../ui/Input'
import { WeekdayPicker } from './WeekdayPicker'
import { useAppStore, type CreateTaskInput } from '../../store/useAppStore'
import type { Task, TaskPriority, Recurrence, TaskArea } from '../../types'
import { TASK_AREAS } from '../../lib/taskAreas'
import { toDateKey } from '../../lib/dates'
import styles from './QuickAdd.module.css'

interface QuickAddProps {
  open: boolean
  onClose: () => void
  editTask?: Task | null
  defaultDate?: string
  defaultArea?: TaskArea
}

const priorities: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const recurrences: { value: Recurrence; label: string }[] = [
  { value: 'none', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
]

export function QuickAdd({ open, onClose, editTask, defaultDate, defaultArea }: QuickAddProps) {
  const addTask = useAppStore((s) => s.addTask)
  const updateTask = useAppStore((s) => s.updateTask)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const weekStartsOn = useAppStore((s) => s.user.preferences.weekStartsOn)

  const [title, setTitle] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [dueDate, setDueDate] = useState(defaultDate ?? toDateKey(new Date()))
  const [dueTime, setDueTime] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [area, setArea] = useState<TaskArea | ''>('')
  const [scheduleDays, setScheduleDays] = useState<number[]>([])
  const [recurrence, setRecurrence] = useState<Recurrence>('none')
  const [notes, setNotes] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [reminder, setReminder] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editTask) {
      setTitle(editTask.title)
      setDueDate(editTask.dueDate)
      setDueTime(editTask.dueTime ?? '')
      setPriority(editTask.priority)
      setArea(editTask.area ?? '')
      setScheduleDays(editTask.scheduleDays ?? [])
      setRecurrence(editTask.recurrence)
      setNotes(editTask.notes ?? editTask.description ?? '')
      setEstimatedMinutes(editTask.estimatedMinutes?.toString() ?? '')
      setReminder(!!editTask.reminder)
      setExpanded(true)
    } else {
      setTitle('')
      setDueDate(defaultDate ?? toDateKey(new Date()))
      setDueTime('')
      setPriority('medium')
      setArea(defaultArea ?? '')
      setScheduleDays([])
      setRecurrence('none')
      setNotes('')
      setEstimatedMinutes('')
      setReminder(false)
      setExpanded(!!defaultArea)
    }
  }, [open, editTask, defaultDate, defaultArea])

  const submit = () => {
    if (!title.trim()) return
    const payload: CreateTaskInput = {
      title,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      area: area || undefined,
      scheduleDays: scheduleDays.length > 0 ? scheduleDays : undefined,
      recurrence: scheduleDays.length > 0 ? 'custom' : recurrence,
      notes: notes || undefined,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
      reminder,
    }
    if (editTask) {
      updateTask(editTask.id, payload)
    } else {
      addTask(payload)
    }
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={editTask ? 'Edit task' : undefined}
      tall={expanded || scheduleDays.length > 0}
    >
      <div className={styles.form}>
        {!editTask && (
          <p className={`displayTitle ${styles.prompt}`}>What needs to get done?</p>
        )}
        <input
          className={styles.titleInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task name"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
        />

        <WeekdayPicker
          value={scheduleDays}
          onChange={setScheduleDays}
          weekStartsOn={weekStartsOn}
        />

        <div className={styles.quickRow}>
          <input
            type="date"
            className={styles.chipInput}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <select
            className={styles.chipInput}
            value={area}
            onChange={(e) => setArea(e.target.value as TaskArea | '')}
          >
            <option value="">Goal</option>
            {TASK_AREAS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <select
            className={styles.chipInput}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={styles.moreBtn}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Less' : 'More'}
          </button>
        </div>

        {expanded && (
          <div className={styles.details}>
            <Input
              label="Time"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />

            {scheduleDays.length === 0 && (
              <label className={styles.selectField}>
                <span>Recurrence</span>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                >
                  {recurrences.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className={styles.grid2}>
              <Input
                label="Duration (min)"
                type="number"
                min={5}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
              />
              <label className={styles.toggleField}>
                <span>Reminder</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={reminder}
                  className={`${styles.switch} ${reminder ? styles.on : ''}`}
                  onClick={() => setReminder((v) => !v)}
                />
              </label>
            </div>

            <TextArea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional context"
            />
          </div>
        )}

        <div className={styles.actions}>
          {editTask && (
            <Button
              variant="danger"
              onClick={() => {
                deleteTask(editTask.id)
                onClose()
              }}
            >
              Delete
            </Button>
          )}
          <Button fullWidth onClick={submit} disabled={!title.trim()}>
            {editTask ? 'Save changes' : 'Add task'}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
