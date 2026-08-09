import { useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { applyColorTheme, normalizeColorTheme } from '../../lib/themes'

export function ThemeApplier() {
  const colorTheme = useAppStore((s) => s.user.preferences.colorTheme)
  const hydrated = useAppStore((s) => s.hydrated)

  useEffect(() => {
    applyColorTheme(normalizeColorTheme(colorTheme))
  }, [colorTheme, hydrated])

  return null
}
