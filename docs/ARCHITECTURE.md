# Architecture

Overview of how North is structured and how data flows through the app.

---

## High-level diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────┐ │
│  │ React pages │◄──►│ Zustand store│◄──►│ localStorage   │ │
│  │ (features/) │    │ (persisted)  │    │ north-app-v1   │ │
│  └──────┬──────┘    └──────┬───────┘    └────────────────┘ │
│         │                  │                                │
│         │         useProgressSync (when signed in)         │
│         │                  │                                │
│         ▼                  ▼                                │
│  ┌─────────────┐    ┌──────────────┐                         │
│  │ AuthContext │◄──►│ cloud.ts     │                         │
│  │ (Firebase)  │    │ Firestore    │                         │
│  └─────────────┘    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## State management

**Zustand** (`src/store/useAppStore.ts`) holds:

- User preferences and display name
- Tasks, goals, milestones, history
- Demo friends and friend activities (offline leaderboard)
- Statistics helpers consume tasks + history, not separate stat blobs

Persistence uses Zustand’s `persist` middleware with key `north-app-v1`.

---

## Task scheduling

Tasks support:

- **One-off** — `dueDate` on a specific day
- **Recurring weekdays** — `scheduleDays: number[]` (JS `getDay()`: 0 = Sun … 6 = Sat)

Logic lives in `src/lib/taskSchedule.ts`:

- `isTaskScheduledOn(task, dateKey)` — should the task appear today?
- `isCompletedOnDate(task, dateKey, history)` — completed for that calendar day?
- `taskStatusOnDate` — derived status for UI

Scheduled tasks complete per-day via **history entries** rather than flipping `task.completed` globally.

---

## Statistics

`src/lib/stats.ts` computes completion from tasks + history:

- Daily completion rate (completed / scheduled for that day)
- Streaks, weekly summaries, heatmap data
- No hardcoded demo stats in the UI

---

## Authentication

`AuthContext` (`src/contexts/AuthContext.tsx`):

| State | Meaning |
|-------|---------|
| `configured` | Firebase env vars present |
| `isAuthenticated` | Firebase user + Firestore profile loaded |
| `isOfflineMode` | User chose offline, or Firebase not configured |
| `profile` | Cloud profile including `friendCode` |

`RequireAuth` allows access when `isAuthenticated || isOfflineMode`.

---

## Cloud / Firestore

When Firebase is configured (`src/lib/firebase.ts`):

### Collections

```
users/{uid}
  ├── displayName, email, photoURL, friendCode (N-XXXXXX)
  ├── friends/{friendUid}     — bidirectional friend links
  └── daily/{YYYY-MM-DD}      — { completed, total, rate, updatedAt }
```

### Services (`src/services/cloud.ts`)

- `upsertUserProfile` — create user + unique friend code on first sign-in
- `addFriendByCode` — lookup by friend code, mutual friend docs
- `pushDailyProgress` — called from `useProgressSync` on task/history changes
- `getDailyProgress` — Friends page leaderboard for each friend

---

## Routing

`src/App.tsx`:

- `/login` — public
- All other routes wrapped in `RequireAuth` + `AppShell`

Navigation: hamburger sidebar on mobile; persistent sidebar on desktop (≥900px).

---

## Theming

- Design tokens in `src/styles/global.css`
- Color themes in `src/styles/themes.css` — Midnight, Forest, Copper, Lilac
- `ThemeApplier` + `applyColorTheme` set CSS variables on `:root`
- Legacy theme IDs (`black`, `red`, etc.) map to new names in `src/lib/themes.ts`

---

## Key dependencies

| Package | Role |
|---------|------|
| `react` / `react-dom` | UI |
| `react-router-dom` | Routing |
| `zustand` | Client state |
| `firebase` | Auth + Firestore |
| `framer-motion` | Transitions |
| `date-fns` | Date utilities |
| `lucide-react` | Icons |

---

## Future considerations

- Code-splitting Firebase and heavy routes to reduce initial bundle size
- Export/import for offline backup
- Push notifications for timed tasks
- Native mobile wrappers (Capacitor / React Native)
