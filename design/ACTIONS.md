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
| P1-AUDIT-GATE | P1 | Documented audit gate blocks all commits | `CLAUDE.md` §Enforcement gate is `npm audit --audit-level=critical`. As of 2026-07-01 there are **2 build-time criticals** (`ejs` via `nuxt > @nuxt/webpack > webpack-bundle-analyzer`) → the gate now fails on every commit. Unfixable under the lock (semver-major = forbidden); npm 6.14.8 `--production` does **not** exclude dev deps. **Do NOT relax the spec.** Needs a team decision on scoping (explicit `ejs` allow-list / runtime-only audit tooling / newer npm used only for auditing). Full analysis in `design/SECURITY-AUDIT-NOTES.md`. |
| P1-PROTECT | P1 | `main` branch-protection is bypassed | Branch-protection rules now exist on `main` (require a PR + the CI **verify** status check), but **admin pushes have been bypassing them** during setup (each push reports "Bypassed rule violations"). Decide with the owner: stop bypassing and route changes via PRs, or keep the admin override for now. Surfaced to the owner 2026-07-01. |
| P1-TEST | P1 | Test coverage below targets | **Updated 2026-07-01:** the security utils (`sanitiseInput`, `validateAIResponse`, `productionGuard`) are now at **100%** with enforced per-file `coverageThreshold` gates in `jest.config.js` (68 tests, 9 suites). Remaining: grow Restify routes → ≥90% and mixins/Vuex actions → ≥80%; add frontend component tests (`@vue/test-utils` v1) + Playwright journeys; add a `--coverage` step to CI. |
| P1-TOOLCHAIN | P1 | Dev-toolchain Node-floor drift | Per CLAUDE.md: `engine-strict` is `false` pending two transitive `overrides`; some build tools declare a Node floor above 14.15. Audit `.npmrc` overrides, document, and aim to re-enable `engine-strict`. |

## In progress

| ID | P | Title | Notes |
|----|---|-------|-------|
| P1-CANON | P1 | Single source of truth = GitHub | Decision 2026-07-01: the fast **C: clone is canonical**; this Dropbox copy is **retired** after the current clean-up. **Move executed 2026-07-01** — `C:\Users\mb\Projects\Advisor Collaborate` is now the live copy: deps installed, app runs (blocked in Dropbox by the run-location guard), desktop launcher repointed, commits pushed from here. Remaining: physically delete / Dropbox-exclude the old copy once the owner is confident. |

## Done

| ID | P | Title | Resolved |
|----|---|-------|----------|
| P1-CI | P1 | No CI pipeline | 2026-07-01 — added `.github/workflows/ci.yml`: `npm ci` + lint + `lint:md` + test + `nuxt build` on Node 14.15, on push/PR to `main`. |
| P1-HOOKS | P1 | Pre-commit hooks not installed | 2026-07-01 — Husky v8 installed; `.husky/pre-commit` runs `lint` + `lint:md` + `test`; the same checks run in CI. Audit portion deferred (P1-AUDIT-GATE). The no-silent-deferral / daily-clean discipline is now recorded in `CLAUDE.md`. |
| P1-SEC-UTILS | P1 | Mandated security utils missing | 2026-07-01 — added `server/utils/sanitiseInput.js` + `validateAIResponse.js` (+ `productionGuard.js`), each 100%-tested; wired input-sanitisation + response-shape validation into `server/routes/translate.js`; restored per-file 100% `coverageThreshold` gates in `jest.config.js`. |
| P1-PROD-GUARD | P1 | No production startup guard | 2026-07-01 — added `server/utils/productionGuard.js` (pure, 100%-tested) + a startup call in `server/restify-server.js`: refuses to boot when `NODE_ENV=production` and dev-auth is on or the JWT/DB secrets are still placeholders. No-op in dev/test. |
| P1-JEST-CONFIG | P1 | Broken jest coverage config | 2026-07-01 — removed `coverageThreshold` entries pointing at non-existent files (would error under `--coverage`). Strict gates restored by P1-SEC-UTILS. |
| P1-MD-LINT | P1 | Markdown standard unenforced | 2026-07-01 — added `.markdownlint.jsonc` + `lint:md`; wired into the pre-commit hook and CI so docs cannot regress. `markdownlint-cli@0.28.1` (Node-14-safe) added as a devDep (logged in `SECURITY-AUDIT-NOTES.md`). |
| P1-TRACKER | P1 | This tracker did not exist | 2026-07-01 — created `design/ACTIONS.md` (had been mandated by CLAUDE.md but never created). |

---

## How to use

- Add a row to **Open** the moment a deviation or gap is found; never leave it implicit.
- Move it to **In progress** when started, **Done** (with a date) when resolved.
- Stack-Constitution deviations are always **P1** and only ever reconciled *toward* the
  spec — never by relaxing the spec (CLAUDE.md one-directional rule).
