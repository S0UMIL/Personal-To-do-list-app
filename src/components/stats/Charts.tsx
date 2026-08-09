import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { DayActivity } from '../../lib/stats'
import { format, parseISO } from 'date-fns'
import styles from './Charts.module.css'

interface TrendChartProps {
  data: DayActivity[]
  height?: number
}

export function TrendChart({ data, height = 140 }: TrendChartProps) {
  const { points, area, max } = useMemo(() => {
    const maxVal = Math.max(1, ...data.map((d) => d.completed))
    const w = 100
    const h = 100
    const step = data.length <= 1 ? 0 : w / (data.length - 1)
    const coords = data.map((d, i) => {
      const x = i * step
      const y = h - (d.completed / maxVal) * (h * 0.85) - h * 0.05
      return { x, y, ...d }
    })
    const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
    const areaPath =
      coords.length > 0
        ? `${line} L ${coords[coords.length - 1].x} ${h} L ${coords[0].x} ${h} Z`
        : ''
    return { points: coords, area: areaPath, max: maxVal, linePath: line }
  }, [data])

  const linePath = points.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')

  return (
    <div className={styles.trend} style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.trendSvg}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#trendFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className={styles.trendAxis}>
        {data.filter((_, i) => i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)).map((d) => (
          <span key={d.date}>{format(parseISO(d.date), data.length > 14 ? 'MMM d' : 'EEE')}</span>
        ))}
      </div>
      <span className={styles.trendMax}>peak {max}</span>
    </div>
  )
}

interface BarChartProps {
  data: DayActivity[]
  height?: number
}

export function BarChart({ data, height = 120 }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.completed))
  return (
    <div className={styles.bars} style={{ height }}>
      {data.map((d) => (
        <div key={d.date} className={styles.barCol}>
          <motion.div
            className={styles.bar}
            initial={{ height: 0 }}
            animate={{ height: `${(d.completed / max) * 100}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            title={`${d.completed} completed`}
          />
        </div>
      ))}
    </div>
  )
}

interface HeatmapProps {
  data: DayActivity[]
  weeks?: number
}

export function Heatmap({ data }: HeatmapProps) {
  const level = (completed: number) => {
    if (completed <= 0) return 0
    if (completed === 1) return 1
    if (completed <= 3) return 2
    if (completed <= 5) return 3
    return 4
  }

  return (
    <div className={styles.heat}>
      {data.map((d) => (
        <div
          key={d.date}
          className={styles.heatCell}
          data-level={level(d.completed)}
          title={`${format(parseISO(d.date), 'MMM d')}: ${d.completed} completed`}
        />
      ))}
    </div>
  )
}

interface GoalBarsProps {
  items: { id: string; label: string; progress: number }[]
}

export function GoalProgressList({ items }: GoalBarsProps) {
  return (
    <div className={styles.goalList}>
      {items.map((item) => (
        <div key={item.id} className={styles.goalRow}>
          <div className={styles.goalMeta}>
            <span>{item.label}</span>
            <span className="tabular">{item.progress}%</span>
          </div>
          <div className={styles.goalTrack}>
            <motion.div
              className={styles.goalFill}
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
