import { motion } from 'framer-motion'
import styles from './Progress.module.css'

interface RingProps {
  value: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
}

export function ProgressRing({
  value,
  size = 112,
  stroke = 6,
  label,
  sublabel,
}: RingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={styles.ringWrap} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={styles.ring}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className={styles.ringCenter}>
        {label !== undefined ? (
          <span className={`${styles.ringValue} tabular`}>{label}</span>
        ) : (
          <span className={`${styles.ringValue} tabular`}>{clamped}%</span>
        )}
        {sublabel && <span className={styles.ringSub}>{sublabel}</span>}
      </div>
    </div>
  )
}

interface BarProps {
  value: number
  className?: string
  height?: number
}

export function ProgressBar({ value, className = '', height = 4 }: BarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={`${styles.barTrack} ${className}`} style={{ height }}>
      <motion.div
        className={styles.barFill}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
