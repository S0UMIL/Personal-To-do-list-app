# Setup guide

This guide covers local development, Firebase configuration, and production deployment for North.

---

## Prerequisites

- **Node.js** 20+ (recommended)
- **npm** 10+
- A modern browser (Chrome, Safari, Firefox, Edge)

---

## 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/north.git
cd north
npm install
```

---

## 2. Run locally (offline mode)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). On the login screen, click **Continue offline (local only)**.

All tasks, goals, stats, and calendar data are stored in your browser under the key `north-app-v1`. No server required.

---

## 3. Enable Google sign-in and friends

### Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) and create a project.
2. Register a **Web app** and copy the Firebase config object.

### Authentication

1. Open **Build → Authentication**.
2. Enable **Google** as a sign-in provider.
3. Under **Settings → Authorized domains**, add:
   - `localhost` (development)
   - Your production domain (e.g. `north-app.web.app`)

### Firestore

1. Open **Build → Firestore Database** and create a database.
2. Start in **production mode** (you will deploy custom rules).
3. Deploy security rules from the repo root:

   ```bash
   firebase deploy --only firestore:rules
   ```

   Or paste the contents of [`firestore.rules`](../../firestore.rules) in the Firebase console under **Rules**.

### Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Usually `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Web app ID |

Restart the dev server after changing `.env`.

### Verify

1. Run `npm run dev`.
2. Click **Continue with Google** on the login screen.
3. Open **Profile** — you should see your unique friend ID (format `N-XXXXXX`).
4. Add a friend on the **Friends** page using their ID.

---

## 4. Production build

```bash
npm run build
npm run preview   # optional: test dist/ locally
```

The output is in `dist/`. Deploy to any static host:

| Platform | Notes |
|----------|-------|
| **Vercel** | Connect repo; build command `npm run build`; output `dist` |
| **Netlify** | Same as Vercel |
| **Firebase Hosting** | `firebase init hosting` → public directory `dist` |
| **GitHub Pages** | Use `vite` base path if serving from a subpath |

Set the same `VITE_*` environment variables in your host’s dashboard.

---

## 5. Troubleshooting

| Issue | Fix |
|-------|-----|
| Login popup blocked | Allow popups for localhost / your domain |
| `Firebase Auth is not configured` | Check `.env` values and restart dev server |
| Friend ID not found | Confirm both users signed in; codes are case-normalized |
| Leaderboard empty for friends | Friend must complete tasks today; progress syncs on task changes |
| Data lost after clearing browser | Offline data lives in `localStorage` — export/backup is not built in yet |

---

## 6. Reset demo data

In **Profile → Data**, tap **Reset demo data** to restore the seeded Ishan demo dataset (offline store only).
