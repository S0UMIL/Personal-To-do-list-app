import { motion } from 'framer-motion'
import type { Task } from '../../types'
import { getAreaLabel } from '../../lib/taskAreas'
import styles from './TaskRow.module.css'

interface TaskRowProps {
  task: Task
  onToggle: () => void
  onOpen?: () => void
}

const priorityClass: Record<Task['priority'], string> = {
  high: styles.priorityHigh,
  medium: styles.priorityMedium,
  low: styles.priorityLow,
}

export function TaskRow({ task, onToggle, onOpen }: TaskRowProps) {
  const done = task.status === 'completed'
  const areaLabel = getAreaLabel(task.area)

  return (
    <motion.div
      layout
      className={`${styles.row} ${done ? styles.done : ''}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className={`${styles.check} ${done ? styles.checked : ''}`}
        onClick={onToggle}
        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
      >
        <motion.span
          className={styles.checkInner}
          animate={done ? { scale: [0.6, 1.1, 1], opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        />
      </button>

      <button type="button" className={styles.content} onClick={onOpen}>
        <span className={styles.title}>{task.title}</span>
        <span className={styles.meta}>
          <span className={`${styles.dot} ${priorityClass[task.priority]}`} aria-hidden />
          {task.dueTime && <span className="tabular">{formatTime(task.dueTime)}</span>}
          {areaLabel && <span className={styles.goal}>{areaLabel}</span>}
        </span>
      </button>
    </motion.div>
  )
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}:${String(m).padStart(2, '0')} ${suffix}`
}
