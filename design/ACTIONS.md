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
| P1-AUDIT-GATE | P1 | Documented audit gate blocks all commits | `CLAUDE.md` §Enforcement gate is `npm audit --audit-level=critical`. As of 2026-07-01 there are **2 build-time criticals** (`ejs` via `nuxt > @nuxt/webpack > webpack-bundle-analyzer`) → the gate now fails on every commit. Unfixable under the lock (semver-major = forbidden). **⚠️ 2026-07-02: the npm-6 reasoning here is wrong — local is actually npm 10 (see P1-NODE-ENV); and `nuxt` is a *production* dependency, so even `npm audit --omit=dev` still reports the `ejs` chain. Re-analyse on the true toolchain.** **Do NOT relax the spec.** Needs a team decision on scoping (explicit `ejs` allow-list / runtime-only audit tooling / newer npm used only for auditing). Full analysis in `design/SECURITY-AUDIT-NOTES.md`. |
| P1-PROTECT | P1 | `main` branch-protection is bypassed | Branch-protection rules now exist on `main` (require a PR + the CI **verify** status check), but **admin pushes have been bypassing them** during setup (each push reports "Bypassed rule violations"). Decide with the owner: stop bypassing and route changes via PRs, or keep the admin override for now. Surfaced to the owner 2026-07-01. |
| P1-TEST | P1 | Test coverage below targets | **Updated 2026-07-01:** the security utils (`sanitiseInput`, `validateAIResponse`, `productionGuard`) are now at **100%** with enforced per-file `coverageThreshold` gates in `jest.config.js` (68 tests, 9 suites). Remaining: grow Restify routes → ≥90% and mixins/Vuex actions → ≥80%; add frontend component tests (`@vue/test-utils` v1) + Playwright journeys; add a `--coverage` step to CI. |
| P1-TOOLCHAIN | P1 | Dev-toolchain Node-floor drift | Per CLAUDE.md: `engine-strict` is `false` pending two transitive `overrides`; some build tools declare a Node floor above 14.15. Audit `.npmrc` overrides, document, and aim to re-enable `engine-strict`. |
| P2-TEMPLATE-FEED | P2 | Marketplace tool links use a JSON snapshot, not the live Advisory feed | The "List a tool" picker + create-validation read a **read-only snapshot** (`design/reference/search_content_*.json`) via the seam `server/data/advisoryTemplates.js` (async `list`/`exists`). Before production: (a) swap the seam to Advisory's **live template API/DB** — drop-in, keep the return shapes (HANDOVER §4d); (b) **security:** ensure a shared tool link stays **gated by Advisory's own access control** — this app only stores the page ID and must never bypass Advisory auth. Added 2026-07-01. |

## In progress

| ID | P | Title | Notes |
|----|---|-------|-------|
| P1-CANON | P1 | Single source of truth = GitHub | Decision 2026-07-01: the fast **C: clone is canonical**; this Dropbox copy is **retired** after the current clean-up. **Move executed 2026-07-01** — `C:\Users\mb\Projects\Advisor Collaborate` is now the live copy: deps installed, app runs (blocked in Dropbox by the run-location guard), desktop launcher repointed, commits pushed from here. Remaining: physically delete / Dropbox-exclude the old copy once the owner is confident. |
| P1-NODE-ENV | P1 | Local dev on Node 20 — reconciling to locked 14.15 | **Found & started 2026-07-02.** Dev machine runs **Node 20.20.2 / npm 10.8.2**; `.nvmrc` had pinned **`20`** since the first commit `7e705b7` (never 14.15) — drift from Stack Constitution req. 9. **Done 2026-07-02:** `.nvmrc` → **`14.15.0`** (matches CI's pin); stale npm-6/Node-14 claims corrected in `SECURITY-AUDIT-NOTES.md`. **Blocker (machine, needs owner/dev):** no `nvm` on PATH, so Node 14.15.0 can't be selected here yet; and the local `node_modules` is a **partial install** — `markdownlint-cli` + `husky` are missing, so `npm run lint:md` fails **and the Husky pre-commit hook is not wired → local commits currently bypass the gate** (CI still enforces). **Remaining:** install nvm-windows + Node 14.15.0 → `nvm use` → `npm ci` (safe: installs the v1 lockfile as-is, restores `markdownlint-cli` + `husky`, wires the hook) → re-run `lint` / `lint:md` / `test` / `build` to confirm parity. One-directional; CI already proves the tree builds on 14.15. |

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

## Backlog — design items to triage (added 2026-07-01; review next session)

> Surfaced by the "show home" audit (2026-07-01): design ideas that are **not built and were
> not yet logged**. Priorities are **suggestions only** — next session we decide, per item,
> **keep / delete / do**. This is candidate scope, not committed work.

| ID | Suggested P | Item | Decision needed next session |
|----|---|-------|------------------------------|
| T1-SPACES | P2 | Collaboration "spaces" (plan pillar 4) | Plan describes a *room* per connection/group holding chat **+ shared content / Drive-asset references**. Chat exists; the space-with-content concept does not. Build it, fold it into Messaging, or defer to a later phase? |
| T2-NOTIFICATIONS | P2 | Notifications | Sketches show a "🔔 3" and list a "Notifications panel"; nothing built. Decide which events + in-app vs. email, or defer. |
| T3-IP-GOVERNANCE | P2 | IP classification & governance (plan §6) | 4-tier ownership, the "locked / non-derivable" flag, per-space terms-acceptance. Designed in detail; not built. High-IP network → decide an MVP vs. defer. |
| T4-ANTISPAM | P3 | Outreach anti-spam guardrails (plan §4) | one-pending-outreach, rate limits, respect-availability. First **verify** what (if any) `server/routes/*` already enforces, then log the real gap. |
| T5-MARKET-SIGNALS | P3 | Marketplace "proven tools" signal + ratings (plan §7, marked optional) | Keep as a future nicety, or drop. |
| T6-SKETCHES-DOC | P3 | Repair `design/ux-sketches.md` | File is **truncated** (unclosed code fence) and its "screens still to sketch" list is **stale** (create-a-group is built). Close/complete the file and refresh the backlog. |
| T7-FONT-OPENSANS | P2 | Global font → **Open Sans Light** (app-wide) | **Confirmed owner requirement (2026-07-01)** — this one is a "do", not keep/delete. Use **Open Sans, Light (weight 300)** for **all** text across the whole app, replacing the current Inter (body) + Poppins (headings). Load the webfont in `nuxt.config.js` head (where Inter/Poppins load today) and set the base `font-family` in `assets/css/theme.css` so Buefy/Bulma inherit. At build time, confirm whether headings should also be Light or a slightly heavier Open Sans weight for legibility. |

**Already-tracked unbuilt scope (bring to the same review, no duplication):** role hierarchy /
RBAC, cross-org engagement policy, manager bulk-invite, and audit logging are in `HANDOVER.md`
§6; the deferred UX defaults **D1** (open-vs-closed) / **D2** (new-group visibility) and open
questions **Q5** / **Q6** are in the plan §12. Review those alongside T1–T6.

---

## How to use

- Add a row to **Open** the moment a deviation or gap is found; never leave it implicit.
- Move it to **In progress** when started, **Done** (with a date) when resolved.
- Stack-Constitution deviations are always **P1** and only ever reconciled *toward* the
  spec — never by relaxing the spec (CLAUDE.md one-directional rule).
