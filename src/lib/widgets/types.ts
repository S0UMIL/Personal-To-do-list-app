export type WidgetId =
  | 'today'
  | 'streak'
  | 'alerts'
  | 'next_focus'
  | 'day'
  | 'library'
  | 'areas_today'
  | 'daily_quote'
  | 'remaining'
  | 'progress'
  | 'high_priority'
  | 'google_tasks'
  | 'done'

export type WidgetSize = 'small' | 'medium'

export interface WidgetCatalogEntry {
  id: WidgetId
  label: string
  size: WidgetSize
  /** In-app route opened when the home-screen widget is tapped. */
  route: string
  sublabel: string
}

export interface WidgetTaskPreview {
  id: string
  title: string
  completed: boolean
}

export interface WidgetAreaSnapshot {
  label: string
  done: number
  total: number
}

export interface WidgetNextFocus {
  taskId: string
  title: string
  priority: string
}

export interface WidgetGoogleTasksSnapshot {
  connected: boolean
  syncedCount: number
  todayTotal: number
  lastSyncedAt: string | null
  syncError: string | null
}

/** Minimal payload bridged to native Android widgets — no secrets or full store. */
export interface WidgetSnapshot {
  version: 1
  updatedAt: string
  todayKey: string
  today: {
    completed: number
    scheduled: number
    remaining: number
    progressPct: number
    lockedIn: boolean
    lockedCount: number
    previewTasks: WidgetTaskPreview[]
    highPriorityLeft: number
    done: number
  }
  streak: number
  alerts: number
  nextFocus: WidgetNextFocus | null
  libraryCount: number
  areas: WidgetAreaSnapshot[]
  quote: { text: string; author: string }
  googleTasks: WidgetGoogleTasksSnapshot
}
