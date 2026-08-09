# Publishing to GitHub

The project is initialized as a git repository on branch `main` with an initial commit. Follow these steps to create the remote repo and push.

---

## Option A — GitHub CLI (recommended)

1. **Authenticate** (one time):

   ```bash
   gh auth login
   ```

   Choose GitHub.com → HTTPS → Login with a web browser.

2. **Create the repo and push**:

   ```bash
   cd path/to/north
   gh repo create north --public --source=. --remote=origin --push --description "Personal progress command center"
   ```

   If the repo already exists on GitHub:

   ```bash
   git remote add origin https://github.com/Ishan1818/north.git
   git push -u origin main
   ```

---

## Option B — GitHub website

1. Go to [github.com/new](https://github.com/new).
2. Repository name: `north`
3. Visibility: Public
4. Do **not** add README, .gitignore, or license (already in the project).
5. Create the repository.
6. Push:

   ```bash
   git remote add origin https://github.com/Ishan1818/north.git
   git branch -M main
   git push -u origin main
   ```

---

## After push

- CI runs automatically via [.github/workflows/ci.yml](../.github/workflows/ci.yml).
- Enable GitHub Pages or connect to Vercel/Netlify for deployment (see [SETUP.md](SETUP.md)).
