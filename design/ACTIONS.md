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

## Master to-do — all outstanding work (single index)

> **One scannable list of everything still to do**, gathered from the sections below
> and from `HANDOVER.md` (§4 seams, §6 not-built, §8 open questions) and the plan
> (`advisor-collaboration-platform-plan.md` §12). This table is the **index**; the
> detailed entry for each row lives in the place named in its last column. Nothing
> outstanding should exist outside this table — if it does, add a row.
>
> **Type key:** Fix = code fix/config · Tidy = cleanup · Integration = connect a real
> Advisory system (needs creds) · Feature = build new capability · Triage = candidate
> scope, decide keep/delete/do · Decision = needs an answer (owner or master team), not code.

| ID | P | Item | Type | Blocked by / detail in |
|----|---|------|------|------------------------|
| INT-MYSQL | P1 | Connect real MySQL — fill SQL into the single seam `server/data/repository.js` | Integration | DB creds + schema provisioned · HANDOVER §4b |
| INT-AUTH | P1 | Wire real Advisory login — set `JWT_SECRET`, confirm claim names/algorithm | Integration | Advisory auth team · HANDOVER §4a |
| P1-TOOLCHAIN | P1 | Re-enable strict Node-floor enforcement (`engine-strict`) | Fix | 2 transitive `overrides` · "Open" below |
| P2-TEMPLATE-FEED | P2 | Marketplace: swap JSON snapshot → live Advisory template feed (keep access-control) | Integration | Advisory template API · HANDOVER §4d |
| P3-I18N-TOASTS | P3 | Move hardcoded toast strings into `$t()` / locale files | Tidy | — · "Open" below |
| FEAT-RBAC | P2 | Role hierarchy / RBAC enforcement (Mentor→Global→Group→Firm→Advisor→Client) | Feature | Q-ROLES · HANDOVER §6 |
| ~~FEAT-CROSSORG~~ | P2 | Cross-org wall — discovery/connect/outreach, default **closed/opt-in** (D1), seal at **office/branch** (Q6) | Feature | ✅ **DONE 2026-07-03** — see Done table |
| FEAT-CROSSORG-GROUPS | P2 | Cross-org gating for **groups & spaces** + the **manager toggle UI** to flip a firm open/closed | Feature | Blocked by FEAT-RBAC (Q-ROLES) · see Done note |
| ~~FEAT-AUDITLOG~~ | P2 | Audit logging — append-only trail + read API | Feature | ✅ **DONE 2026-07-03** — see Done table |
| FEAT-AUDIT-UI | P3 | Admin/compliance **audit viewer UI** (read route exists; needs the admin gate) | Feature | Blocked by FEAT-RBAC (Q-ROLES) |
| FEAT-BULKINVITE | P3 | Manager bulk-invite | Feature | — · HANDOVER §6 |
| T1-SPACES | P2 | Collaboration "spaces" (chat + shared-content references) | Feature | **Deferred 2026-07-03** (owner) to a later phase · "Backlog" below |
| ~~T2-NOTIFICATIONS~~ | P2 | Notifications — in-app-only MVP | Feature | ✅ **DONE 2026-07-03** — see Done table |
| ~~T3-IP-GOVERNANCE~~ | P2 | IP governance MVP — 4-tier labels + locked-flag enforcement | Feature | ✅ **DONE 2026-07-03** — see Done table |
| T4-ANTISPAM | P3 | Outreach anti-spam guardrails (verify what routes already enforce first) | Triage | — · "Backlog" below |
| T5-MARKET-SIGNALS | P3 | Marketplace "proven tools" signal + ratings (optional) | Triage | Owner decision · "Backlog" below |
| T6-SKETCHES-DOC | P3 | Repair truncated `design/ux-sketches.md` | Tidy | — · "Backlog" below |
| Q-JWTCLAIMS | P1 | Confirm JWT claim names + signing algorithm (HS256 vs RS256) | Decision | Advisory auth team · HANDOVER §8.2 |
| Q-PROFILE | P1 | Advisor profile API/source to read identity from | Decision | Master team · HANDOVER §8.3 |
| Q-ROLES | P2 | Role-hierarchy source of truth | Decision | Master team · HANDOVER §8.5 |
| Q5-GROUPIP | P3 | Confirm net-new group-IP edge cases (member's pre-existing personal IP) | Decision | Owner · plan §12.5 |

> **Resolved 2026-07-03 (owner decisions — now in the Done table + plan §13):** D1-POSTURE →
> closed/opt-in · D2-GROUPVIS → live immediately · Q6-ONEORG → seal at individual office (branch).
> These unblock FEAT-CROSSORG and turned T2/T3 into build tasks (T1 deferred).

---

## Open

| ID | P | Title | Notes / next step |
|----|---|-------|-------------------|
| P1-TOOLCHAIN | P1 | Dev-toolchain Node-floor drift | Per CLAUDE.md: `engine-strict` is `false` pending two transitive `overrides`; some build tools declare a Node floor above 14.15. Audit `.npmrc` overrides, document, and aim to re-enable `engine-strict`. |
| P3-I18N-TOASTS | P3 | Frontend toast strings are hardcoded English | The pages raise error/success toasts as literal English (e.g. `'Save failed'`, `'Could not load your connections — is the backend running?'`) instead of going through `$t()` with locale keys. This drifts from CLAUDE.md §Internationalisation ("no hardcoded English"). Low priority (dev-facing failure states), but for full i18n move these into `locales/en.json` and swap to `$t('…')`. Logged 2026-07-02 during the pre-handover review (kept the hardcoded style then to match existing pages and keep the res.ok robustness fix minimal). |
| P2-TEMPLATE-FEED | P2 | Marketplace tool links use a JSON snapshot, not the live Advisory feed | The "List a tool" picker + create-validation read a **read-only snapshot** (`design/reference/search_content_*.json`) via the seam `server/data/advisoryTemplates.js` (async `list`/`exists`). Before production: (a) swap the seam to Advisory's **live template API/DB** — drop-in, keep the return shapes (HANDOVER §4d); (b) **security:** ensure a shared tool link stays **gated by Advisory's own access control** — this app only stores the page ID and must never bypass Advisory auth. Added 2026-07-01. |

## In progress

| ID | P | Title | Notes |
|----|---|-------|-------|
| _(none — all in-flight items resolved)_ | | | |

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
| P1-PROTECT | P1 | `main` protection was bypassable by admins | 2026-07-02 — owner decision: apply the rules to everyone. Enabled **`enforce_admins`** on `main`, so admins are now held to the same rules (PR required + the CI **verify** check must pass; no direct-to-main pushes, no bypass). Existing settings retained: required status check `Lint, test & build (Node 14.15)` (strict/up-to-date), linear history, no force-push or deletion. |
| P1-CANON | P1 | Single source of truth = GitHub | 2026-07-02 — **done.** Live canonical copy is `C:\Users\Mike Barnes\Projects\Advisor Collaborate` (in sync with GitHub `origin/main`). Duplicate copies removed: the Dropbox copy (earlier) and `E:\Visual Code Projects\Advisor Collaborate` (deleted 2026-07-02 — it sat at the first scaffold commit; all committed work was already on GitHub; only an obsolete 30-Jun `theme.css` draft was intentionally discarded). **Correction:** the earlier note's `C:\Users\mb\…` path was wrong — the real user folder is `Mike Barnes`. |
| P1-TEST | P1 | Test coverage below targets | 2026-07-02 — **complete.** Backend **~99% lines** (routes 100%, repository 99%, proxy/db/middleware/utils 100%); mixins **100%**; **every page + the `PageHelp` component** unit-tested (`@vue/test-utils@1.3.6` + `@vue/vue2-jest@27.0.0`, Pug + jsdom); **Playwright e2e** — 8 critical journeys driving the real app (`@playwright/test@1.34.3`, the last Node-14-safe line). **240 tests total** (232 Jest + 8 Playwright). Gates: `coverageThreshold` (routes ≥90 / mixins ≥80 / security utils 100 / global floor) enforced in the pre-commit hook + CI; a separate CI **`e2e`** job (ubuntu-22.04, Node 14.15) runs the journeys via `npm run test:e2e`. All targets in CLAUDE.md §Testing met. |
| T7-FONT-OPENSANS | P2 | Global font → Open Sans Light (app-wide) | 2026-07-02 — owner confirmed **all** text (including headings) is **Open Sans, Light (300)**. Replaced Inter + Poppins: `nuxt.config.js` now loads `Open+Sans:wght@300;400`; `assets/css/theme.css` sets Open Sans + weight 300 throughout, with a global `!important` block neutralising Bulma/Buefy bold utilities (`.title`, `.has-text-weight-*`, `strong`, `th`, labels); scoped weights in `PageHelp.vue` + `marketplace.vue` set to 300. Font sizes/layout unchanged; `nuxt build` passes. |
| P1-AUDIT-GATE | P1 | Documented audit gate blocked all commits | 2026-07-02 — resolved **without relaxing the spec**. Implemented `scripts/audit-gate.js` (wired into `.husky/pre-commit` + CI as `npm run audit:gate`): blocks on any **critical** except a documented build-time **allow-list** (one entry — `ejs`/`GHSA-phwq-j96m-2c2q`, the bundle-analyzer chain), reports highs without blocking, requires GHSA **and** module to match (a new critical in the same package still blocks), and warns on a stale allow-list entry. Pure logic unit-tested (`tests/auditGate.test.js`, 15 cases). Live run: `1 critical (1 allow-listed, 0 un-accepted) · PASS`. Documented in `SECURITY-AUDIT-NOTES.md` §3. |
| FEAT-AUDITLOG | P2 | Audit logging | 2026-07-03 — **built.** New **append-only** seam `server/data/auditLog.js` (`record`/`list` only — no update/delete). Wired into the significant actions in `server/routes/people.js`: profile update, group create/join/invite/accept/decline, connection request/accept/decline, outreach send, listing create, purchase — plus the **security events** `connection.blocked` / `outreach.blocked` (cross-firm) and `listing.locked_blocked` (locked IP). Read API `GET /api/people/audit` (filter by actor/action, newest-first, capped). `audit_log` table added to `config/db-schema.sql` (INSERT-only). Entries hold IDs/labels only — no PII. Tests: `auditLog.test.js` + route wiring (**288 passing**). **Deferred (FEAT-AUDIT-UI):** the admin/compliance viewer UI + the read-route admin gate need FEAT-RBAC (Q-ROLES). |
| T3-IP-GOVERNANCE | P2 | IP governance MVP (4-tier labels + locked flag) | 2026-07-03 — **built.** New classification seam `server/data/ipClassification.js` (`classify` → tier/label/locked) keyed by catalogue page ID — a **separate layer; the source JSON is never edited**. **Locked-flag enforcement:** a locked Tier-2 framework can't be listed — refused in `createListing` (`LOCKED_IP` 400) and blocked at the picker. **Tier labels:** marketplace listings tagged **Group-owned (Tier 4)** with a badge; the tool picker flags 🔒 locked frameworks (templates route enriches each row with tier/locked). `config/db-schema.sql` gains `ip_register` + `marketplace_listing.ip_tier`. Tests: `ipClassification.test.js` + route/component coverage (**278 passing**). **Deferred:** per-space terms-acceptance (depends on T1 spaces). |
| FEAT-CROSSORG | P2 | Cross-org engagement wall (person-to-person) | 2026-07-03 — **built.** Default posture **closed/opt-in** (`config/integration.js → CROSS_ORG.defaultPosture`, D1); boundary = the advisor's **firm/office** (Q6); **both-sides consent** (a cross-firm interaction needs both firms open). Enforced on **discovery** (`listAdvisors` hides sealed advisers), **connection** (`requestConnection` → `CROSS_ORG_BLOCKED`), **outreach** and **profile view** (403). Per-firm posture is a seam (`getOrgPosture`/`setOrgPosture`); demo firms seeded open so the show-home is navigable. Read-only posture indicator on the Profile page. Frontend now surfaces the block message (Discover connect/outreach no longer fail silently). Tests: `crossOrg.test.js` + route guards (**269 passing**). **Deferred (logged as FEAT-CROSSORG-GROUPS):** group/space-level gating and the manager toggle UI — both need FEAT-RBAC (Q-ROLES). |
| T2-NOTIFICATIONS | P2 | Notifications — in-app-only MVP | 2026-07-03 — **built.** Bell in `AppHeader.vue` (unread badge + dropdown, all strings via `$t`/`locales/en.json`); `GET /api/people/notifications` + `POST /api/people/notifications/read`; a per-recipient `notifications` store + `pushNotification` seam in `repository.js`, wired into all four events (connection request, group invitation, message, purchase) with `notification` table added to `config/db-schema.sql`. Text is rendered from `type` + `params` via i18n (no English stored server-side). Tests: repo + routes + `AppHeader` component (**257 passing**). Group-chat fan-out and email delivery remain future work (noted in code). |
| D1-POSTURE | P2 | Default cross-org posture (open vs closed) | 2026-07-03 — owner: **closed / opt-in**. New members start sealed to their own organisation and opt in to reach across firms — the recommended posture for a high-IP network. Remains a config flip (both paths switchable). Feeds FEAT-CROSSORG; recorded in plan §12/§13. |
| D2-GROUPVIS | P2 | New-group approval/visibility default | 2026-07-03 — owner: **live immediately**. A new specialty group is listed and can recruit the moment it's created; no manager pre-approval step. Recorded in plan §12/§13. |
| Q6-ONEORG | P2 | "One organisation" boundary for the cross-org policy | 2026-07-03 — owner: seal at the **individual office (branch / Firm tier)** — two offices of the same firm are treated as cross-org and need opt-in. Maps directly onto Advisory's existing `branch`; needs no extra master data. Feeds FEAT-CROSSORG; recorded in plan §12/§13. |
| P1-NODE-ENV | P1 | Local dev on Node 20 → reconciled to locked 14.15 | 2026-07-02 — `.nvmrc` `20`→`14.15.0`; installed **nvm-windows** on the dev machine and selected **Node 14.15.0 / npm 6.14.8**; `npm ci` restored the full toolchain (incl. the previously-missing `markdownlint-cli` + `husky`) and **re-wired the pre-commit hook** (was not firing locally). Local gate now green on 14.15: `lint` (0 errors), `lint:md` (clean), `test` (76 passing, 10 suites); `package-lock.json` unchanged. Stale "npm 6.14.8 / Node 14.15 local" claims corrected in `SECURITY-AUDIT-NOTES.md`. Invalidated the npm-6 premise in P1-AUDIT-GATE (still open). |

---

## Backlog — design items to triage (added 2026-07-01; review next session)

> Surfaced by the "show home" audit (2026-07-01): design ideas that are **not built and were
> not yet logged**. Priorities are **suggestions only** — next session we decide, per item,
> **keep / delete / do**. This is candidate scope, not committed work.

| ID | Suggested P | Item | Decision needed next session |
|----|---|-------|------------------------------|
| T1-SPACES | P2 | Collaboration "spaces" (plan pillar 4) | ✅ **DECIDED 2026-07-03 — DEFER** (owner). Plan describes a *room* per connection/group holding chat **+ shared content / Drive-asset references**. Chat exists; the space-with-content concept does not. Parked to a later phase (overlaps T3 IP governance); stays logged, not dropped. |
| T2-NOTIFICATIONS | P2 | Notifications | ✅ **DONE 2026-07-03 — see Done table.** Built the in-app-only MVP bell (unread badge + dropdown) for all four events (connection request, group invitation, message, purchase); no email. Group-chat fan-out + email delivery are future work. |
| T3-IP-GOVERNANCE | P2 | IP classification & governance (plan §6) | ✅ **DONE 2026-07-03 — see Done table.** Built the MVP: 4-tier ownership labels (marketplace listings badged Group-owned/Tier 4; catalogue tools default Advisory-owned/Tier 1) + locked-flag enforcement (a locked Tier-2 framework can't be listed — refused on create + blocked at the picker). Per-space terms-acceptance deferred (depends on T1 spaces). |
| T4-ANTISPAM | P3 | Outreach anti-spam guardrails (plan §4) | one-pending-outreach, rate limits, respect-availability. First **verify** what (if any) `server/routes/*` already enforces, then log the real gap. |
| T5-MARKET-SIGNALS | P3 | Marketplace "proven tools" signal + ratings (plan §7, marked optional) | Keep as a future nicety, or drop. |
| T6-SKETCHES-DOC | P3 | Repair `design/ux-sketches.md` | File is **truncated** (unclosed code fence) and its "screens still to sketch" list is **stale** (create-a-group is built). Close/complete the file and refresh the backlog. |
| T7-FONT-OPENSANS | P2 | Global font → **Open Sans Light** (app-wide) | ✅ **DONE 2026-07-02 — see the Done table above.** Was a confirmed owner requirement (2026-07-01). Use **Open Sans, Light (weight 300)** for **all** text across the whole app, replacing the current Inter (body) + Poppins (headings). Load the webfont in `nuxt.config.js` head (where Inter/Poppins load today) and set the base `font-family` in `assets/css/theme.css` so Buefy/Bulma inherit. At build time, confirm whether headings should also be Light or a slightly heavier Open Sans weight for legibility. |

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
