import styles from './WeekdayPicker.module.css'

interface WeekdayPickerProps {
  value: number[]
  onChange: (days: number[]) => void
  weekStartsOn?: 0 | 1
}

export function WeekdayPicker({ value, onChange, weekStartsOn = 1 }: WeekdayPickerProps) {
  const order = weekStartsOn === 1 ? [1, 2, 3, 4, 5, 6, 0] : [0, 1, 2, 3, 4, 5, 6]
  const labels =
    weekStartsOn === 1
      ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
      : ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const toggle = (day: number) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day))
    } else {
      onChange([...value, day].sort((a, b) => a - b))
    }
  }

  return (
    <div className={styles.root}>
      <span className={styles.label}>Repeat on</span>
      <div className={styles.days} role="group" aria-label="Weekdays">
        {order.map((day, i) => {
          const active = value.includes(day)
          return (
            <button
              key={day}
              type="button"
              className={`${styles.day} ${active ? styles.active : ''}`}
              aria-pressed={active}
              onClick={() => toggle(day)}
            >
              {labels[i]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
