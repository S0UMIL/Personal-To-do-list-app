import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChartColumn, ListTodo, Target, Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'
import styles from './OnboardingPage.module.css'

const screens = [
  {
    icon: ListTodo,
    title: 'Plan the day, not the noise',
    body: 'Each morning, pick at least 5 tasks to focus on. That’s your day.',
  },
  {
    icon: Target,
    title: 'Keep a longer north star',
    body: 'Goals and milestones sit beside the daily list so today still points somewhere.',
  },
  {
    icon: ChartColumn,
    title: 'See the streak, not just the list',
    body: 'Stats track what you actually finish — privately, on this device.',
  },
  {
    icon: Users,
    title: 'Compete without oversharing',
    body: 'Friends see daily completion. Your tasks never leave this phone.',
  },
]

export function OnboardingWalkthrough() {
  const navigate = useNavigate()
  const completeWalkthrough = useAppStore((s) => s.completeWalkthrough)
  const [index, setIndex] = useState(0)
  const screen = screens[index]
  const last = index === screens.length - 1
  const Icon = screen.icon

  const goNext = () => {
    if (!last) {
      setIndex((i) => i + 1)
      return
    }
    completeWalkthrough()
    navigate('/onboarding/tasks')
  }

  return (
    <div className={styles.page}>
      <p className={styles.progressLabel}>
        {index + 1} of {screens.length}
      </p>
      <div className={styles.dots} aria-hidden>
        {screens.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i === index ? styles.dotOn : ''}`}
          />
        ))}
      </div>

      <div className={styles.walkBody}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className={styles.walkScreen}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.iconWrap}>
              <Icon size={32} strokeWidth={1.6} />
            </div>
            <h1 className={`serif ${styles.title}`}>{screen.title}</h1>
            <p className={styles.lead}>{screen.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={index > 0 ? styles.walkNav : `${styles.walkNav} ${styles.walkNavSolo}`}>
        {index > 0 ? (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setIndex((i) => i - 1)}
          >
            Back
          </Button>
        ) : null}
        <Button type="button" size="lg" onClick={goNext}>
          {last ? 'Build my list' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
