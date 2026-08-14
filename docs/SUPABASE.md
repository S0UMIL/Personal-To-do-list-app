# Supabase setup (North — local-first)

Personal productivity data stays on the device (Zustand + localStorage).
Supabase is **only** for Auth, profiles, friends, and leaderboard aggregates.

**Do not** run any old 12-table schema. Use `supabase/apply_all.sql` (3 tables).

## Credentials

| Variable | Where |
|---|---|
| `VITE_SUPABASE_URL` | Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Publishable key (`sb_publishable_...`) or legacy anon JWT |

Never put the `service_role` / secret key in the frontend.

## Apply schema

SQL Editor → paste **`supabase/apply_all.sql`** → Run.

Tables created: `profiles`, `friendships`, `daily_progress`.

## Google Auth

Authentication → Providers → Google: Client ID + secret.

In **Authentication → URL Configuration**:

- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/login` and `http://localhost:5173/**`

Google Cloud → Authorized redirect URI must include:

`https://fvszxndfdekemomsocsv.supabase.co/auth/v1/callback`

## Leaderboard privacy

Uploaded fields only: `user_id`, `progress_date`, `completed`, `total`, `rate`.
Values are **self-reported** from the local device — not a tamper-proof ranking.

## Verify

1. `npm run dev`
2. Sign in with Google (or Profile → Supabase panel)
3. Profile shows friend code
4. Friends: add by code
5. Toggle local tasks; friend’s leaderboard shows counts only
