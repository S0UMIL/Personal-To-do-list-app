import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

/** Silently rolls the day cycle when the local date changes. No UI timer. */
export function useDayCycle() {
  const ensureDayCycle = useAppStore((s) => s.ensureDayCycle)

  useEffect(() => {
    ensureDayCycle()

    const onVisible = () => {
      if (document.visibilityState === 'visible') ensureDayCycle()
    }

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', ensureDayCycle)
    const id = window.setInterval(ensureDayCycle, 60_000)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', ensureDayCycle)
      window.clearInterval(id)
    }
  }, [ensureDayCycle])
}
