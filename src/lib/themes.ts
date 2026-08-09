import type { ColorTheme } from '../types'

export const COLOR_THEMES: {
  id: ColorTheme
  label: string
  preview: string
  secondary?: string
}[] = [
  { id: 'midnight', label: 'Midnight', preview: '#6b9cd4', secondary: '#0d0f14' },
  { id: 'forest', label: 'Forest', preview: '#7db896', secondary: '#0f1310' },
  { id: 'copper', label: 'Copper', preview: '#d4845a', secondary: '#12100e' },
  { id: 'lilac', label: 'Lilac', preview: '#b8a0d8', secondary: '#12101a' },
]

const LEGACY_THEME_MAP: Record<string, ColorTheme> = {
  black: 'midnight',
  red: 'copper',
  green: 'forest',
  purple: 'lilac',
}

export function normalizeColorTheme(theme?: string): ColorTheme {
  if (!theme) return 'midnight'
  if (theme in LEGACY_THEME_MAP) return LEGACY_THEME_MAP[theme]
  if (COLOR_THEMES.some((t) => t.id === theme)) return theme as ColorTheme
  return 'midnight'
}

export function applyColorTheme(theme: ColorTheme | string) {
  document.documentElement.setAttribute('data-theme', normalizeColorTheme(theme))
}
