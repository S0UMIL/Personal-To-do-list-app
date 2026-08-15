import type { WidgetCatalogEntry } from './types'

/** Source of truth for widget types — used by WidgetsPage and native Android picker. */
export const WIDGET_CATALOG: WidgetCatalogEntry[] = [
  {
    id: 'today',
    label: 'Today',
    size: 'medium',
    route: '/',
    sublabel: "Today's tasks and progress",
  },
  {
    id: 'streak',
    label: 'Streak',
    size: 'small',
    route: '/stats',
    sublabel: 'Days active',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    size: 'small',
    route: '/recommendations',
    sublabel: 'Priority flags',
  },
  {
    id: 'next_focus',
    label: 'Next focus',
    size: 'medium',
    route: '/',
    sublabel: 'Highest priority open task',
  },
  {
    id: 'day',
    label: 'Day',
    size: 'small',
    route: '/',
    sublabel: 'Tasks locked in today',
  },
  {
    id: 'library',
    label: 'Library',
    size: 'small',
    route: '/tasks',
    sublabel: 'Standing tasks',
  },
  {
    id: 'areas_today',
    label: 'Areas today',
    size: 'medium',
    route: '/goals',
    sublabel: 'Progress by area',
  },
  {
    id: 'daily_quote',
    label: 'Daily quote',
    size: 'medium',
    route: '/widgets',
    sublabel: 'Daily motivation',
  },
  {
    id: 'remaining',
    label: 'Remaining',
    size: 'small',
    route: '/',
    sublabel: 'Tasks left today',
  },
  {
    id: 'progress',
    label: 'Progress',
    size: 'small',
    route: '/stats',
    sublabel: "Today's completion",
  },
  {
    id: 'high_priority',
    label: 'High priority',
    size: 'small',
    route: '/',
    sublabel: 'Open high-priority tasks',
  },
  {
    id: 'google_tasks',
    label: 'Google Tasks',
    size: 'medium',
    route: '/profile',
    sublabel: 'Sync status',
  },
  {
    id: 'done',
    label: 'Done',
    size: 'small',
    route: '/',
    sublabel: 'Checked off today',
  },
]

export function getWidgetCatalogEntry(id: string): WidgetCatalogEntry | undefined {
  return WIDGET_CATALOG.find((w) => w.id === id)
}
