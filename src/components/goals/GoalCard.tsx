import { Link } from 'react-router-dom'
import type { Goal } from '../../types'
import { getAreaLabel } from '../../lib/taskAreas'
import { daysRemaining, formatShortDate } from '../../lib/dates'
import styles from './GoalCard.module.css'

interface GoalCardProps {
  goal: Goal
  done: number
  total: number
  milestoneSummary?: string
}

export function GoalCard({ goal, done, total, milestoneSummary }: GoalCardProps) {
  const remaining = daysRemaining(goal.deadline)

  return (
    <Link to={`/goals/${goal.id}`} className={styles.card}>
      <div className={styles.top}>
        <span className={styles.type}>{getAreaLabel(goal.area) ?? 'Goal'}</span>
        <span className={`${styles.progress} tabular`}>
          {done}/{total}
        </span>
      </div>
      <h3 className={styles.title}>{goal.title}</h3>
      <p className={styles.status}>
        {total === 0
          ? 'No linked tasks yet'
          : done === total
            ? 'All linked tasks done today'
            : `${done} of ${total} linked tasks done today`}
      </p>
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
