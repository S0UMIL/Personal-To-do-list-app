# Contributing to North

Thank you for your interest in contributing. This document covers how to get started and what we expect in pull requests.

---

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Create a branch: `git checkout -b feat/your-feature`

---

## Development workflow

Before opening a PR:

```bash
npm run lint
npm run build
```

Both must pass. CI runs the same checks on every push to `main`.

---

## Code style

- **TypeScript** — prefer explicit types at module boundaries; avoid `any`.
- **Components** — feature pages in `src/features/`; shared UI in `src/components/`.
- **Styles** — CSS Modules per component; use design tokens (`var(--accent)`, etc.).
- **State** — app data in Zustand; auth in `AuthContext`; avoid duplicating persisted state.
- **Imports** — match existing path style (`../../` from features).

Keep changes focused. Prefer the smallest diff that solves the problem.

---

## Pull requests

1. Describe **what** changed and **why**.
2. Link related issues if applicable.
3. Include screenshots for UI changes.
4. Update docs if you change setup, env vars, or architecture.

---

## Reporting bugs

Open an issue with:

- Steps to reproduce
- Expected vs actual behavior
- Browser / OS
- Whether you use offline mode or Firebase

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
