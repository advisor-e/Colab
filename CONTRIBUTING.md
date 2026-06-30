# Contributing — how we work on Advisor-e Collaborate

> Read this first. These rules exist because in June 2026 a stale second copy of
> the repo caused a near-miss: a whole day of work was built in one copy while
> another copy sat frozen and nearly overwrote it. **GitHub is the single source
> of truth. Everything flows through it.**

---

## 1. One canonical working copy

- **The canonical clone lives on a fast local disk on the C: drive** (e.g.
  `C:\Users\Mike Barnes\Projects\Advisor Collaborate`). Do all work there.
- **Do NOT keep or run the repo inside Dropbox / OneDrive / any file-sync folder.**
  Sync tools fight with Git, can corrupt `.git`, and — worst of all — make a stale
  copy *look* up to date when it isn't. (The old `...\Dropbox\...\Colab` copy is
  retired; don't commit from it.)
  - **Automatic guard:** `npm run dev` / `dev:all` / `backend` / `start` refuse to
    start if the project sits in a sync folder (see `scripts/check-run-location.js`),
    pointing you to the C: copy. Override only if you must: `ALLOW_SYNC_FOLDER=true`.
- One machine, one clone. If you must work on another machine, clone fresh from
  GitHub there — never copy the folder around by hand.

## 2. The golden loop — every session, no exceptions

```bash
git switch main
git pull                 # ALWAYS pull before you start — this is the rule that was missed
git switch -c feature/short-description
# ... make changes ...
git add -p && git commit
git push -u origin feature/short-description
# ... open a Pull Request on GitHub, let CI run, merge when green ...
```

- **Never commit straight to `main`.** Use a short-lived branch + Pull Request.
  `main` is protected: a PR cannot merge until the **CI checks pass**.
- Pull before you start; push when you pause. If `git push` is ever *rejected*,
  STOP — it means someone (or another copy) is ahead. Run `git fetch` and review
  before doing anything; never `git push --force` to `main`.

## 3. What runs automatically

- **On every push / PR (GitHub Actions, `.github/workflows/ci.yml`):**
  `npm ci` → **lint** → **tests** → **`nuxt build`**, on the locked **Node 14.15**.
- **Before every commit (once activated — see §5):** Husky runs lint + tests +
  the `npm audit --audit-level=critical` gate locally, so problems are caught
  before they ever reach GitHub.

## 4. Running the app locally (dev)

```bash
nvm use 14.15.0          # the project is LOCKED to Node 14.15; Node 20 will not work
npm install              # first time / when node_modules is missing (needs the corp TLS cert)
npm run dev:all          # Nuxt :3000 + Restify backend :4000
npm test                 # run the Jest suite
npm run lint             # check style before committing
```

## 5. Activate pre-commit hooks (one-time, on the C: machine)

The hooks need `npm install` to register, so they are set up on the canonical
machine, not from a sync folder:

```bash
npm install --save-dev husky lint-staged
npx husky install
npm pkg set scripts.prepare="husky install"
npx husky add .husky/pre-commit "npx lint-staged && npm test && npm audit --audit-level=critical"
git add .husky package.json package-lock.json
git commit -m "Add Husky pre-commit gate (lint + test + audit)"
```

> This step is tracked as **P1-HOOKS** in `design/ACTIONS.md` until it lands.

## 6. The rulebook

All engineering standards live in [`CLAUDE.md`](CLAUDE.md) (the Stack
Constitution + code governance). Outstanding gaps and deviations are tracked in
[`design/ACTIONS.md`](design/ACTIONS.md). When in doubt, the spec wins.
