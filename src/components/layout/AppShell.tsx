import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Target, Users, ChartColumn, ListTodo, User, Menu, X } from 'lucide-react'
import { useState, createContext, useContext, useMemo, useEffect } from 'react'
import { QuickAdd } from '../tasks/QuickAdd'
import { ThemeApplier } from './ThemeApplier'
import { useProgressSync } from '../../hooks/useProgressSync'
import { useDayCycle } from '../../hooks/useDayCycle'
import { useGoogleTasksSync } from '../../hooks/useGoogleTasksSync'
import type { Task, TaskArea } from '../../types'
import styles from './AppShell.module.css'

interface QuickAddContextValue {
  openQuickAdd: (opts?: { task?: Task; date?: string; area?: TaskArea }) => void
}

const QuickAddContext = createContext<QuickAddContextValue>({
  openQuickAdd: () => undefined,
})

export function useQuickAdd() {
  return useContext(QuickAddContext)
}

const nav = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/stats', label: 'Stats', icon: ChartColumn },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/profile', label: 'Profile', icon: User },
]

export function AppShell() {
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [defaultDate, setDefaultDate] = useState<string | undefined>()
  const [defaultArea, setDefaultArea] = useState<TaskArea | undefined>()

  useProgressSync()
  useDayCycle()
  useGoogleTasksSync()

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [navOpen])

  const ctx = useMemo<QuickAddContextValue>(
    () => ({
      openQuickAdd: (opts) => {
        setEditTask(opts?.task ?? null)
        setDefaultDate(opts?.date)
        setDefaultArea(opts?.area)
        setQuickOpen(true)
      },
    }),
    [],
  )

  const hideFab =
    location.pathname === '/' ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/friends') ||
    location.pathname.startsWith('/recommendations')

  return (
    <QuickAddContext.Provider value={ctx}>
      <ThemeApplier />
      <div className={styles.shell}>
        {navOpen && (
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          />
        )}

        <aside className={`${styles.sidebar} ${navOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHead}>
            <div className={styles.brand}>
              <span className={styles.brandMark} aria-hidden />
              <span className={`serif ${styles.brandName}`}>North</span>
            </div>
            <button
              type="button"
              className={styles.closeNav}
              aria-label="Close menu"
              onClick={() => setNavOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <nav className={styles.sideNav}>
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.sideLink} ${isActive ? styles.sideActive : ''}`
                }
                onClick={() => setNavOpen(false)}
              >
                <item.icon size={18} strokeWidth={1.75} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className={styles.sideAdd}
            onClick={() => {
              ctx.openQuickAdd()
              setNavOpen(false)
            }}
          >
            New task
          </button>
        </aside>

        <div className={styles.main}>
          <header className={styles.topBar}>
            <button
              type="button"
              className={styles.menuBtn}
              aria-label="Open menu"
              aria-expanded={navOpen}
              onClick={() => setNavOpen((v) => !v)}
            >
              <Menu size={22} strokeWidth={1.75} />
            </button>
            <span className={`serif ${styles.topTitle}`}>North</span>
          </header>

          <motion.div
            key={location.key}
            className={styles.page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </div>

        {!hideFab && (
          <button
            type="button"
            className={styles.fab}
            aria-label="Add task"
            onClick={() => ctx.openQuickAdd()}
          >
            <span aria-hidden>+</span>
          </button>
        )}

        <QuickAdd
          open={quickOpen}
          editTask={editTask}
          defaultDate={defaultDate}
          defaultArea={defaultArea}
          onClose={() => {
            setQuickOpen(false)
            setEditTask(null)
            setDefaultArea(undefined)
          }}
        />
      </div>
    </QuickAddContext.Provider>
  )
}
