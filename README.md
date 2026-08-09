# North

**Personal progress command center** — daily tasks tied to goals, meaningful stats, and optional friend competition.

North is a mobile-first productivity web app: one clean daily list, weekday scheduling, goal areas (Fitness, Money, Studies, and more), rich analytics, and a friends leaderboard when you sign in with Google.

---

## Features

| Area | What you get |
|------|----------------|
| **Today** | Single sorted task list — scheduled weekdays, dated tasks, priorities |
| **Goals** | Long- and short-term goals with milestones and linked tasks |
| **Stats** | Completion rates, streaks, heatmaps, and period summaries |
| **Calendar** | Month, week, and day views aligned to your week-start preference |
| **Friends** | Daily leaderboard; add people by unique ID (`N-XXXXXX`) when cloud is enabled |
| **Profile** | Themes (Midnight, Forest, Copper, Lilac), preferences, your friend ID |
| **Widgets** | Home-screen widget concepts for glanceable progress |

**Offline-first:** tasks, goals, stats, and calendar persist in your browser. Cloud sync is only required for cross-user friend leaderboards.

---

## Quick start

```bash
git clone https://github.com/Ishan1818/north.git
cd north
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

- **Without Firebase:** choose **Continue offline** on the login screen.
- **With Firebase:** copy `.env.example` to `.env`, fill in your keys, then sign in with Google.

See [docs/SETUP.md](docs/SETUP.md) for full Firebase and deployment instructions.

To publish this repository, see [docs/GITHUB.md](docs/GITHUB.md).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run Oxlint |

---

## Tech stack

- **UI:** React 19, TypeScript, CSS Modules, Framer Motion
- **State:** Zustand (persisted to `localStorage` as `north-app-v1`)
- **Routing:** React Router 7
- **Cloud (optional):** Firebase Auth (Google) + Firestore
- **Build:** Vite 8

---

## Project structure

```
src/
├── components/     # UI primitives, layout, auth guards
├── contexts/       # AuthProvider
├── features/       # Page-level modules (home, goals, stats, …)
├── hooks/          # Progress sync, etc.
├── lib/            # Dates, stats, themes, Firebase helpers
├── services/       # Firestore cloud API
├── store/          # Zustand app store
├── styles/         # Global CSS + theme tokens
└── types/          # Shared TypeScript types
```

More detail in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Local vs cloud

| Mode | Tasks & stats | Friends |
|------|---------------|---------|
| Offline | Browser `localStorage` | Demo leaderboard |
| Signed in | Local + daily progress synced to Firestore | Real friends by ID |

---

## Firebase (optional)

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication → Google**.
3. Create a **Firestore** database.
4. Copy web app config into `.env` (see `.env.example`).
5. Deploy rules from [`firestore.rules`](firestore.rules).
6. Add `localhost` and your production domain to **Authorized domains**.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

[MIT](LICENSE) — see [LICENSE](LICENSE) for details.

---

Built with focus — **North** · personal progress command center
