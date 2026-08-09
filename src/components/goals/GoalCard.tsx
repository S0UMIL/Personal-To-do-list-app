import { Link } from 'react-router-dom'
import type { Goal } from '../../types'
import { getAreaLabel } from '../../lib/taskAreas'
import { ProgressBar } from '../ui/Progress'
import { daysRemaining, formatShortDate } from '../../lib/dates'
import styles from './GoalCard.module.css'

interface GoalCardProps {
  goal: Goal
  progress: number
  milestoneSummary?: string
}

export function GoalCard({ goal, progress, milestoneSummary }: GoalCardProps) {
  const remaining = daysRemaining(goal.deadline)

  return (
    <Link to={`/goals/${goal.id}`} className={styles.card}>
      <div className={styles.top}>
        <span className={styles.type}>{getAreaLabel(goal.area) ?? 'Goal'}</span>
        <span className={`${styles.progress} tabular`}>{progress}%</span>
      </div>
      <h3 className={styles.title}>{goal.title}</h3>
      <ProgressBar value={progress} className={styles.bar} />
      <div className={styles.footer}>
        {milestoneSummary && <span>{milestoneSummary}</span>}
        {remaining !== null && (
          <span className="tabular">
            {remaining < 0
              ? 'Past due'
              : remaining === 0
                ? 'Due today'
                : `${remaining}d left`}
            {goal.deadline && remaining >= 0 ? ` · ${formatShortDate(goal.deadline)}` : ''}
          </span>
        )}
      </div>
    </Link>
  )
}
