# ACTIONS — reconcile & remediation tracker

> The task tracker mandated by `CLAUDE.md` (Deviation logging rule + Dependency
> and Version Governance). **Every deviation from the Stack Constitution, and
> every governance gap, is logged here as a P1 the moment it is found** — never
> silently accepted. Items only ever move the repo *toward* the Constitution.
>
> **Created:** 2026-07-01 (this file was mandated by `CLAUDE.md` but had never
> been created — that gap is itself logged below as P1-TRACKER).
> **Priority key:** P1 = critical / blocking-quality · P2 = important · P3 = nice-to-have.

---

## Open

| ID | P | Title | Notes / next step |
|----|---|-------|-------------------|
| P1-HOOKS | P1 | Pre-commit hooks not installed | Husky + lint-staged must run `lint` + `test` + `npm audit --audit-level=critical` before commit (CLAUDE.md §Enforcement). **Cannot be added from the Dropbox copy** (no Node/`npm install` here, which would also regenerate the lockfile). Install on the canonical C: machine — see CONTRIBUTING.md "Activate pre-commit hooks". |
| P1-PROTECT | P1 | `main` is unprotected | Anyone can push straight to `main`; this enabled the June drift. Apply branch protection requiring the CI **verify** job + PR review, once CI is green. To be done via `gh` (Increment 3). |
| P1-SEC-UTILS | P1 | Mandated security utils missing | `server/utils/sanitiseInput.js` and `server/utils/validateAIResponse.js` do not exist, yet `CLAUDE.md` (§Security, §Testing) requires them and `jest.config.js` referenced them. Implement both (pure functions, 100% test coverage) and wire input-sanitisation + external/LLM-output validation into the routes that handle outside data (start: `server/routes/translate.js`). Then restore strict coverage thresholds (see P1-TEST). |
| P1-TEST | P1 | Test coverage far below targets | Suite started 2026-07-01 (auth, translate, sendError, health). Grow toward CLAUDE.md targets — Restify routes ≥90%, mixins/Vuex actions ≥80%, AI-validation 100% — then restore `coverageThreshold` gates in `jest.config.js` and add a `--coverage` step to CI. No frontend component tests yet (`@vue/test-utils` v1) or Playwright journeys. |
| P1-PROD-GUARD | P1 | No production startup guard | `config/integration.js` and `server/middleware/auth.js` reference a guard that "refuses to boot in production while placeholders are in place" / "refuses `ALLOW_DEV_AUTH=true` in production" — but `server/restify-server.js` only guards the Node *version*. Add: refuse to start when `NODE_ENV=production` and (`ALLOW_DEV_AUTH=true` OR `JWT_SECRET`/DB password still placeholders). Security-critical before go-live. |
| P1-TOOLCHAIN | P1 | Dev-toolchain Node-floor drift | Per CLAUDE.md: `engine-strict` is `false` pending two transitive `overrides`; some build tools declare a Node floor above 14.15. Audit `.npmrc` overrides, document, and aim to re-enable `engine-strict`. |

## In progress

| ID | P | Title | Notes |
|----|---|-------|-------|
| P1-CANON | P1 | Single source of truth = GitHub | Decision 2026-07-01: the fast **C: clone is canonical**; this Dropbox copy is **retired** after the current clean-up. Repo should not live inside Dropbox (sync can corrupt `.git` and masks staleness). Discipline documented in CONTRIBUTING.md. Remaining: physically stop using / Dropbox-exclude this copy. |

## Done

| ID | P | Title | Resolved |
|----|---|-------|----------|
| P1-CI | P1 | No CI pipeline | 2026-07-01 — added `.github/workflows/ci.yml`: `npm ci` + lint + test + `nuxt build` on Node 14.15, on push/PR to `main`. |
| P1-JEST-CONFIG | P1 | Broken jest coverage config | 2026-07-01 — removed `coverageThreshold` entries pointing at non-existent files (would error under `--coverage`). Restoration tracked by P1-SEC-UTILS / P1-TEST. |
| P1-TRACKER | P1 | This tracker did not exist | 2026-07-01 — created `design/ACTIONS.md` (had been mandated by CLAUDE.md but never created). |

---

## How to use

- Add a row to **Open** the moment a deviation or gap is found; never leave it implicit.
- Move it to **In progress** when started, **Done** (with a date) when resolved.
- Stack-Constitution deviations are always **P1** and only ever reconciled *toward* the
  spec — never by relaxing the spec (CLAUDE.md one-directional rule).
