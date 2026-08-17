import type { ColorTheme } from '../types'

export const COLOR_THEMES: {
  id: ColorTheme
  label: string
  preview: string
  secondary?: string
}[] = [
  { id: 'mono', label: 'Black & White', preview: '#ffffff', secondary: '#000000' },
  { id: 'midnight', label: 'Neon', preview: '#b8ff3c', secondary: '#000000' },
  { id: 'forest', label: 'Forest', preview: '#7db896', secondary: '#0f1310' },
  { id: 'copper', label: 'Copper', preview: '#d4845a', secondary: '#12100e' },
  { id: 'lilac', label: 'Lilac', preview: '#b8a0d8', secondary: '#12101a' },
]

const LEGACY_THEME_MAP: Record<string, ColorTheme> = {
  black: 'mono',
  red: 'copper',
  green: 'forest',
  purple: 'lilac',
}

export function normalizeColorTheme(theme?: string): ColorTheme {
  if (!theme) return 'mono'
  if (theme in LEGACY_THEME_MAP) return LEGACY_THEME_MAP[theme]
  if (COLOR_THEMES.some((t) => t.id === theme)) return theme as ColorTheme
  return 'mono'
}

export function applyColorTheme(theme: ColorTheme | string) {
  document.documentElement.setAttribute('data-theme', normalizeColorTheme(theme))
}
