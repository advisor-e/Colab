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
| SEC-THREAD-ACL | P2 | Enforce **participant/member authorization** on message read + reply + list (privacy) | Fix | At INT-AUTH/INT-MYSQL wiring · "Open" below |
| P1-TOOLCHAIN | P1 | Re-enable strict Node-floor enforcement (`engine-strict`) | Fix | 2 transitive `overrides` · "Open" below |
| P2-TEMPLATE-FEED | P2 | Marketplace: swap JSON snapshot → live Advisory template feed (keep access-control) | Integration | Advisory template API · HANDOVER §4d |
| ~~P3-I18N-TOASTS~~ | P3 | Move hardcoded toast strings into `$t()` / locale files | Tidy | ✅ **DONE 2026-07-03** — see Done table |
| FEAT-RBAC | P2 | Role hierarchy / RBAC enforcement (Mentor→Global→Group→Firm→Advisor→Client) | Feature | Q-ROLES · HANDOVER §6 |
| ~~FEAT-CROSSORG~~ | P2 | Cross-org wall — discovery/connect/outreach, default **closed/opt-in** (D1), seal at **office/branch** (Q6) | Feature | ✅ **DONE 2026-07-03** — see Done table |
| FEAT-CROSSORG-GROUPS | P2 | Cross-org gating for **groups & spaces** + the **manager toggle UI** to flip a firm open/closed | Feature | Blocked by FEAT-RBAC (Q-ROLES) · see Done note |
| ~~FEAT-AUDITLOG~~ | P2 | Audit logging — append-only trail + read API | Feature | ✅ **DONE 2026-07-03** — see Done table |
| FEAT-AUDIT-UI | P3 | Admin/compliance **audit viewer UI** (read route exists; needs the admin gate) | Feature | Blocked by FEAT-RBAC (Q-ROLES) |
| FEAT-BULKINVITE | P3 | Manager bulk-invite | Feature | — · HANDOVER §6 |
| ~~FEAT-GROUP-JOIN-APPROVAL~~ | P3 | Owner-side **approve/decline** of group-join requests (pending → member) | Feature | ✅ **DONE 2026-07-03** — see Done table |
| T1-SPACES | P2 | Collaboration "spaces" (chat + shared-content references) | Feature | **Deferred 2026-07-03** (owner) to a later phase · "Backlog" below |
| ~~T2-NOTIFICATIONS~~ | P2 | Notifications — in-app-only MVP | Feature | ✅ **DONE 2026-07-03** — see Done table |
| ~~T3-IP-GOVERNANCE~~ | P2 | IP governance MVP — 4-tier labels + locked-flag enforcement | Feature | ✅ **DONE 2026-07-03** — see Done table |
| ~~T4-ANTISPAM~~ | P3 | Outreach anti-spam — one-outreach-per-person enforced | Triage | ✅ **DONE 2026-07-03** — see Done table |
| T4-RATELIMIT | P3 | Outreach rate-limits + respect-availability (the rest of plan §4) | Feature | — (next-pass anti-spam) |
| T5-MARKET-SIGNALS | P3 | Marketplace "proven tools" signal + ratings (optional) | Triage | Owner decision · "Backlog" below |
| ~~T6-SKETCHES-DOC~~ | P3 | Repair truncated `design/ux-sketches.md` | Tidy | ✅ **DONE 2026-07-03** — see Done table |
| Q-JWTCLAIMS | P1 | Confirm JWT claim names + signing algorithm (HS256 vs RS256) | Decision | Advisory auth team · HANDOVER §8.2 |
| Q-PROFILE | P1 | Advisor profile API/source to read identity from | Decision | Master team · HANDOVER §8.3 |
| Q-ROLES | P2 | Role-hierarchy source of truth | Decision | Master team · HANDOVER §8.5 |
| Q5-GROUPIP | P3 | Confirm net-new group-IP edge cases (member's pre-existing personal IP) | Decision | Owner · plan §12.5 |
| ~~FEAT-MY-PURCHASES~~ | P2 | Marketplace "My tools" view + open-the-tool deep-link (URL pattern is a seam pending Q-PAGE-URL) | Feature | ✅ **DONE 2026-07-03** — see Done table |
| Q-PAGE-URL | P2 | Confirm the **Advisor-e page URL pattern** to open a tool from its `pageId` | Decision | Master team · "New ideas" below |
| Q-ACCESS-CASCADE | P2 | Define how **page access cascades** (section→subsection→parent→child, up to 4 levels): access to a parent grants child pages | Decision | Master team · "New ideas" below |
| ~~FEAT-GROUP-SHARED-CONTENT~~ | P2 | Group: creator **attaches shared pages/templates** (dropdown) for members to collaborate/edit; members see the group's **template list** on the group page | Feature | ✅ **DONE 2026-07-03** (display + add-a-tool) — see Done · actual editing is Advisor-e's hand-off (out of scope) |
| ~~FEAT-SHARED-WORKSPACE-ATTACH~~ | P2 | The **"+ Add a tool"** picker so a group member can add Advisor-e pages to the Shared workspace | Feature | ✅ **DONE 2026-07-03** — see Done table |
| FEAT-SHARED-WORKSPACE-1TO1-ATTACH | P3 | Extend "+ Add a tool" to the **1:1 conversation** pane (groups done; 1:1 shows shared pages read-only for now) | Feature | — (same route/picker, needs a per-thread add endpoint) |
| ~~FEAT-VOICE-EVERYWHERE~~ | P3 | Voice-to-text in **Messages** + group message box (generic mixin) | Feature | ✅ **core DONE 2026-07-03** — see Done table |
| FEAT-VOICE-MORE | P3 | Add 🎤 to the remaining composers (outreach modal, create-group, list-a-tool forms) | Feature | — (uses the new generic `toggleVoiceInput`) |
| ~~Q-CHAT-AUDIENCE~~ | P2 | Decide **messaging audience model**: group-wide vs contact-only, per-message choice; who controls group-chat membership | Decision | ✅ **DONE 2026-07-03** (Model A) — see Done table |
| ~~FEAT-CHAT-AUDIENCE~~ | P2 | Implement the chosen **message-audience / group-chat membership** controls | Feature | ✅ **DONE 2026-07-03** (Model A already built) — see Done table |
| FEAT-CHAT-SUBGROUPS | P3 | Model B fast-follow — hand-picked **sub-group side-chats** within a group + add/remove-participant controls | Feature | Blocked by FEAT-RBAC (Q-ROLES) · see Done note |
| FEAT-MARKET-HELP | P3 | Add **purchase/access/cascade guidance** to the marketplace "How to use this page" help | Tidy | After Q-ACCESS-CASCADE · "New ideas" below |
| Q-MENTOR-SCOPE | P2 | Define the **mentor's view + controls** over the advisors/members below them | Decision | Owner + master team · "New ideas" below |
| FEAT-MENTOR-CONSOLE | P2 | **Mentor console** — see & set controls for advisors/members below | Feature | Blocked by FEAT-RBAC (Q-ROLES) + Q-MENTOR-SCOPE · "New ideas" below |
| ~~Q-CONN-MSG-IA~~ | P2 | Decide how far to **combine Connections + Messages** + the at-scale pattern (100+ connections) | Decision | ✅ **DONE 2026-07-03** (Option B — unified inbox "Connecting") — see Done table |
| ~~FEAT-CONNECTING~~ | P2 | Build the unified **"Connecting"** inbox (Option B) — conversations + connections in one screen; supersedes the standalone Connections page | Feature | ✅ **DONE 2026-07-03** (all 4 phases) — see Done table |
| ~~FEAT-CONNECT-MESSAGE~~ | P2 | Message a connection directly + connection search — **core done**; fuller unify pending Q-CONN-MSG-IA | Feature | ✅ **core DONE 2026-07-03** — see Done table |

> **Resolved 2026-07-03 (owner decisions — now in the Done table + plan §13):** D1-POSTURE →
> closed/opt-in · D2-GROUPVIS → live immediately · Q6-ONEORG → seal at individual office (branch).
> These unblock FEAT-CROSSORG and turned T2/T3 into build tasks (T1 deferred).

---

## Open

| ID | P | Title | Notes / next step |
|----|---|-------|-------------------|
| P1-TOOLCHAIN | P1 | Dev-toolchain Node-floor drift | Per CLAUDE.md: `engine-strict` is `false` pending two transitive `overrides`; some build tools declare a Node floor above 14.15. Audit `.npmrc` overrides, document, and aim to re-enable `engine-strict`. |
| SEC-THREAD-ACL | P2 | Message endpoints do no participant/member authorization | Found during the Q-CHAT-AUDIENCE (Model A) verification, 2026-07-03. `getThread` ([server/routes/people.js](../server/routes/people.js)) returns **any** thread by id; `replyThread` lets anyone post to **any** thread id; `listThreads` ([server/data/repository.js](../server/data/repository.js)) ignores its `ownerId` and returns **all** threads. Harmless in the single-user mock, but once real multi-user auth + MySQL land this lets a user read/post into conversations (incl. group rooms) they are not part of — a **privacy/data-leak bug**. Enforcement is the point that makes the owner's **Model A** ("1:1 = the two parties; group room = members only") actually safe. **Do at the INT-AUTH / INT-MYSQL wiring:** filter `listThreads` by participant/membership, and reject `getThread`/`replyThread` when the caller is not a participant (1:1) or group member (group). `AUTH SEAM` markers added at all three spots. Added 2026-07-03. |
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
| FEAT-VOICE-EVERYWHERE | P3 | Voice-to-text in Messages (core) | 2026-07-03 — **core built.** Generalised `speechMixin` with `toggleVoiceInput(field)` (dictate into any top-level data field) + a matching `onresult` branch. Wired a 🎤 into the **Messages reply box** and the **group message box** (`groups/_id.vue`). Profile + Discover search already had voice. Tests: mixin unit (toggle + generic transcript routing); **296 passing.** **Residual FEAT-VOICE-MORE:** the outreach modal + create-group + list-a-tool composers (now a one-liner each with the generic helper). |
| FEAT-MY-PURCHASES | P2 | Marketplace "My tools" + open the tool | 2026-07-03 — **built.** Marketplace now has an **All tools / My tools** toggle (My tools shows only what you've bought, with a count + empty state). Owned listings show an **"Open tool"** deep-link to the Advisor-e-hosted page. The URL is a **seam** — `config/integration.js → ADVISOR_E.pageBaseUrl` (placeholder) + the listing's `pageId`; the backend returns `openUrl` only for owned listings. **Depends on Q-PAGE-URL** (master team: the real page URL/SSO) and **Q-ACCESS-CASCADE** (Advisor-e enforces the actual access, incl. parent→child). Demo seed listings given real catalogue `pageId`s so "Open tool" is visible. Tests: route (`openUrl` present only when owned) + `marketplace.vue` (My-tools filter + Open-tool link). **294 passing.** |
| FEAT-CONNECT-MESSAGE | P2 | Message a connection directly (core) | 2026-07-03 — **core built.** Connections page now has a **"Message"** button on each connected adviser **and** each group member (opens/reuses a 1:1 thread via new `POST /api/people/advisors/:id/thread` → `repo.findOrCreateDirectThread`, then jumps to it in Messages) — so you view **and** act in one place. Added a **connection search** box (client-side filter by name/firm/strengths) so a 100+ network stays navigable. Tests: route + `connections.vue` component (**292 passing**). **Still open (Q-CONN-MSG-IA):** the fuller Connections↔Messages unification + filter-by-type/sort/pagination — a design call for the owner. |
| P3-I18N-TOASTS | P3 | Hardcoded toast strings | 2026-07-03 — **done.** All 21 frontend toast literals across `AppHeader.vue` + 6 pages now go through `$t()` with new `toast.*` keys (and `outreach.needReason`) in `locales/en.json`. Backend `error.message` surfacing is left as-is (it's a backend envelope, not a frontend literal). No hardcoded English toasts remain. |
| T4-ANTISPAM | P3 | Outreach anti-spam guardrails | 2026-07-03 — **done (core).** Verified first: the "one outreach per person" hint was **UI-only, not enforced**. Now enforced — `sendOutreach` returns `409 ONE_OUTREACH` on a repeat outgoing outreach to the same person (`repo.hasOutgoingOutreach` seam), audited as `outreach.blocked` (reason: duplicate); the frontend already surfaces the message. **Residual logged as T4-RATELIMIT:** rate-limits + respect-availability (the other two plan §4 guards). |
| T6-SKETCHES-DOC | P3 | Truncated ux-sketches.md | 2026-07-03 — **done.** Removed the dangling unclosed ```` ```text ```` fence at EOF and refreshed the stale "screens still to sketch" list — split into "built since" (create-a-group, notifications bell, cross-firm indicator) and genuinely-remaining (dashboard, group space=T1, bulk-invite, audit viewer). `lint:md` clean. |
| FEAT-AUDITLOG | P2 | Audit logging | 2026-07-03 — **built.** New **append-only** seam `server/data/auditLog.js` (`record`/`list` only — no update/delete). Wired into the significant actions in `server/routes/people.js`: profile update, group create/join/invite/accept/decline, connection request/accept/decline, outreach send, listing create, purchase — plus the **security events** `connection.blocked` / `outreach.blocked` (cross-firm) and `listing.locked_blocked` (locked IP). Read API `GET /api/people/audit` (filter by actor/action, newest-first, capped). `audit_log` table added to `config/db-schema.sql` (INSERT-only). Entries hold IDs/labels only — no PII. Tests: `auditLog.test.js` + route wiring (**288 passing**). **Deferred (FEAT-AUDIT-UI):** the admin/compliance viewer UI + the read-route admin gate need FEAT-RBAC (Q-ROLES). |
| T3-IP-GOVERNANCE | P2 | IP governance MVP (4-tier labels + locked flag) | 2026-07-03 — **built.** New classification seam `server/data/ipClassification.js` (`classify` → tier/label/locked) keyed by catalogue page ID — a **separate layer; the source JSON is never edited**. **Locked-flag enforcement:** a locked Tier-2 framework can't be listed — refused in `createListing` (`LOCKED_IP` 400) and blocked at the picker. **Tier labels:** marketplace listings tagged **Group-owned (Tier 4)** with a badge; the tool picker flags 🔒 locked frameworks (templates route enriches each row with tier/locked). `config/db-schema.sql` gains `ip_register` + `marketplace_listing.ip_tier`. Tests: `ipClassification.test.js` + route/component coverage (**278 passing**). **Deferred:** per-space terms-acceptance (depends on T1 spaces). |
| FEAT-CROSSORG | P2 | Cross-org engagement wall (person-to-person) | 2026-07-03 — **built.** Default posture **closed/opt-in** (`config/integration.js → CROSS_ORG.defaultPosture`, D1); boundary = the advisor's **firm/office** (Q6); **both-sides consent** (a cross-firm interaction needs both firms open). Enforced on **discovery** (`listAdvisors` hides sealed advisers), **connection** (`requestConnection` → `CROSS_ORG_BLOCKED`), **outreach** and **profile view** (403). Per-firm posture is a seam (`getOrgPosture`/`setOrgPosture`); demo firms seeded open so the show-home is navigable. Read-only posture indicator on the Profile page. Frontend now surfaces the block message (Discover connect/outreach no longer fail silently). Tests: `crossOrg.test.js` + route guards (**269 passing**). **Deferred (logged as FEAT-CROSSORG-GROUPS):** group/space-level gating and the manager toggle UI — both need FEAT-RBAC (Q-ROLES). |
| T2-NOTIFICATIONS | P2 | Notifications — in-app-only MVP | 2026-07-03 — **built.** Bell in `AppHeader.vue` (unread badge + dropdown, all strings via `$t`/`locales/en.json`); `GET /api/people/notifications` + `POST /api/people/notifications/read`; a per-recipient `notifications` store + `pushNotification` seam in `repository.js`, wired into all four events (connection request, group invitation, message, purchase) with `notification` table added to `config/db-schema.sql`. Text is rendered from `type` + `params` via i18n (no English stored server-side). Tests: repo + routes + `AppHeader` component (**257 passing**). Group-chat fan-out and email delivery remain future work (noted in code). |
| D1-POSTURE | P2 | Default cross-org posture (open vs closed) | 2026-07-03 — owner: **closed / opt-in**. New members start sealed to their own organisation and opt in to reach across firms — the recommended posture for a high-IP network. Remains a config flip (both paths switchable). Feeds FEAT-CROSSORG; recorded in plan §12/§13. |
| D2-GROUPVIS | P2 | New-group approval/visibility default | 2026-07-03 — owner: **live immediately**. A new specialty group is listed and can recruit the moment it's created; no manager pre-approval step. Recorded in plan §12/§13. |
| Q6-ONEORG | P2 | "One organisation" boundary for the cross-org policy | 2026-07-03 — owner: seal at the **individual office (branch / Firm tier)** — two offices of the same firm are treated as cross-org and need opt-in. Maps directly onto Advisory's existing `branch`; needs no extra master data. Feeds FEAT-CROSSORG; recorded in plan §12/§13. |
| FIX-CONNECTING-GROUP-CLICK | P2 | Clicking a group in Connecting was inconsistent | 2026-07-03 — **fixed (owner-reported).** Clicking a group opened its **chat** if one existed (hiding the group page, so no way to reach Add-a-tool / members) but opened the **group page** if it had no chat yet — two different destinations for the same action. Now a group row **always opens the group page** (owner decision), where the chat is reachable via "Message the group". `openRow` moves the group branch ahead of the has-thread branch. Test added (a group with a chat now opens the page). 325 pass. |
| FEAT-SHARED-WORKSPACE-ADD | P2 | Members can add a tool to a group's Shared workspace | 2026-07-03 — **built (owner-requested).** A group member gets a **"+ Add a tool"** button on the group page; it opens the **Advisor-e catalogue picker** (the same one the marketplace's "List a tool" uses), and the chosen tool is attached to the group's Shared workspace with a real **"Open in Advisor-e ↗"** deep-link. **Collaboration only — explicitly separate from on-selling** (the marketplace listing, which goes to advisers *outside* the group; the owner confirmed this distinction). Backend: `POST /api/people/groups/:id/shared-pages` → `repo.addGroupSharedPage` (members-only, validates the tool is in the catalogue, dedupes, audits `group.shared_page_added`). "Member = may add" (RBAC seam). Verified live (added a real catalogue tool; non-member → 403). Tests: route (add / missing / unknown / non-member) + group-detail picker flow. **324 pass.** **Remains (FEAT-SHARED-WORKSPACE-1TO1-ATTACH, P3):** the same picker on the 1:1 pane. |
| FEAT-SHARED-WORKSPACE | P2 | Advisor-e "Shared workspace" links on groups + 1:1s | 2026-07-03 — **built (display slice, owner-requested).** A **"Shared workspace"** section now shows the Advisor-e pages/tools a **group** co-creates (on the group page) and that **two people** work on together (in the 1:1 conversation pane), each an **"Open in Advisor-e ↗"** deep-link. Reuses the marketplace seam (`config/integration.js → pageBaseUrl + pageId`) — this app stores only the page ID; the link opens Advisor-e, which enforces access (**Q-PAGE-URL / Q-ACCESS-CASCADE**). Single `enrichShared` helper builds the `openUrl` for both groups (`getGroupById`) and threads (`getThreadById`/`appendMessage`). **Demo page IDs are fake** (`ae-*`) and clearly marked; real IDs come from Advisor-e. Seeded on the demo groups + the 1:1 with Anna. Verified live (group shows 2 links, 1:1 shows 1). Tests: route (group + thread openUrl) + group-detail + conversation-pane render. **321 pass.** **Remains (FEAT-SHARED-WORKSPACE-ATTACH):** the picker to *add* a page. |
| FEAT-GROUP-JOIN-APPROVAL | P3 | Owner-side approve/decline of join requests | 2026-07-03 — **built.** A group's manager sees a **"Requests to join"** section on the group page (`pages/groups/_id.vue`) and can **Approve** (adds the requester as a member + notifies them `group_join_accepted`) or **Decline** (clears it). Backend: `listGroupJoinRequests` + `respondJoinRequest` + routes `GET /groups/:id/requests`, `POST /group-requests/:id/{accept,decline}`. **"Manage" = membership** — the same approximation `inviteToGroup` already uses (**RBAC SEAM**, tighten to owner/admin when Q-ROLES lands). Demo seed: the dev user owns **"Cashflow Clinic"** with a pending request from Anna, so the approval UI is visible in the show-home. Verified live end-to-end (approve → Anna becomes a member; list clears). Tests: route (list/accept/decline/404/403), owner→requester notify, group-detail component — **317 pass.** This closes the FIX-GROUP-JOIN-VISIBILITY follow-up. |
| FIX-GROUP-JOIN-VISIBILITY | P2 | Group-join requests were invisible | 2026-07-03 — **fixed (owner-reported).** `requestJoinGroup` was a no-op stub — a "Request to join" recorded nothing and showed nowhere, so a group only appeared once you were a member. Now: the request is **persisted** (`groupJoinRequests` seam), groups carry a per-viewer **`joinStatus`** (`member`/`requested`/`none`) so Discover + the group page show **"⏳ Request Pending"** (and block a double-request), pending requests appear in **Connecting under Requests** as a **"Group request · Request Pending"** row, and the **group owner is notified** (`group_join_request`). Verified live end-to-end (join → status `requested` → pending row + card badge). Tests: route (joinStatus/dedupe/already-member), connecting row, owner-notify, Discover + group-detail optimistic update — **311 pass.** **Deferred (FEAT-GROUP-JOIN-APPROVAL, P3):** the owner-side approve/decline that turns pending → member (needs manage-group/RBAC). |
| FEAT-CONNECTING | P2 | Unified "Connecting" inbox (Option B) | 2026-07-03 — **built, all 4 phases, verified.** Merged Connections + Messages into one screen named **"Connecting"** (owner decision Q-CONN-MSG-IA), superseding both old pages. **①** `GET /api/people/connecting` + `repo.listConnecting` — one `type`-tagged list (chat/group/invitation/connection/request) + counts, de-duping a person who is both a connection and a 1:1 thread. **②** `pages/connecting.vue` — search + filter tabs (**All · Chats · Groups · Connections · Requests**) + Recent/Name sort. **③** extracted `components/shared/ConversationPane.vue` (shared by Messages + Connecting); Connecting is side-by-side (list left, conversation right) with inline Accept/Decline on requests. **④** nav now shows a single **Connecting** (Connections + Messages removed); `pages/connections.vue` + `pages/messages.vue` are redirect stubs → `/connecting` (preserving `?thread=`); home pillar, Discover/Groups deep-links and notification link targets all repointed. Tests: `connecting` + `conversationPane` suites, redirect tests, updated nav/home/notif tests — **303 Jest pass**; **8 Playwright journeys pass** (incl. redirect + side-by-side). ESLint 0 · markdownlint clean · coverage met. Real activity-timestamp sort is a MySQL seam (mock has no timestamps). |
| Q-CHAT-AUDIENCE / FEAT-CHAT-AUDIENCE | P2 | Message audience model | 2026-07-03 — owner decision: **Model A** — conversations are either a **private 1:1** with a contact or a **single shared room per group** open to all its members; **no** per-message audience choice and **no** sub-group huddles. **Shape verified as built** in `server/data/repository.js` (`findOrCreateDirectThread` = 1:1; `findOrCreateGroupThread` = one shared thread per group) — no per-message picker, no sub-group mechanism, all correct for Model A. **Caveat (verified 2026-07-03):** the *members-only enforcement* that makes Model A safe is **not built** — `getThread`/`replyThread` and `listThreads` do **no** participant/member authorization (fine in the single-user mock, a **privacy leak once real multi-user auth+MySQL land**). Logged separately as **SEC-THREAD-ACL (P2)** with `AUTH SEAM` markers in the code. **Residual (FEAT-CHAT-SUBGROUPS, P3):** Model B — sub-group side-chats + participant controls — fast-follow, blocked by FEAT-RBAC (Q-ROLES). Recorded in plan §13. |
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
| T4-ANTISPAM | P3 | Outreach anti-spam guardrails (plan §4) | ✅ **DONE 2026-07-03 — see Done table.** Verified the one-per-person hint was UI-only; now enforced (`409 ONE_OUTREACH`). **Residual T4-RATELIMIT:** rate-limits + respect-availability. |
| T5-MARKET-SIGNALS | P3 | Marketplace "proven tools" signal + ratings (plan §7, marked optional) | Keep as a future nicety, or drop. |
| T6-SKETCHES-DOC | P3 | Repair `design/ux-sketches.md` | ✅ **DONE 2026-07-03 — see Done table.** Removed the unclosed fence; refreshed the "built since" vs "still to sketch" lists. |
| T7-FONT-OPENSANS | P2 | Global font → **Open Sans Light** (app-wide) | ✅ **DONE 2026-07-02 — see the Done table above.** Was a confirmed owner requirement (2026-07-01). Use **Open Sans, Light (weight 300)** for **all** text across the whole app, replacing the current Inter (body) + Poppins (headings). Load the webfont in `nuxt.config.js` head (where Inter/Poppins load today) and set the base `font-family` in `assets/css/theme.css` so Buefy/Bulma inherit. At build time, confirm whether headings should also be Light or a slightly heavier Open Sans weight for legibility. |

**Already-tracked unbuilt scope (bring to the same review, no duplication):** role hierarchy /
RBAC, cross-org engagement policy, manager bulk-invite, and audit logging are in `HANDOVER.md`
§6; the deferred UX defaults **D1** (open-vs-closed) / **D2** (new-group visibility) and open
questions **Q5** / **Q6** are in the plan §12. Review those alongside T1–T6.

---

## New ideas — advisor feedback (2026-07-03)

> Captured from an advisor-experience review. **Logged, not yet built or designed.**
> Several need an owner decision or master-team input before implementation; those are
> flagged. Grouped by the four themes raised.

### Theme A — After I buy from the marketplace

- **FEAT-MY-PURCHASES (P2).** An advisor who buys/licences a tool needs a way to **see what
  they own** and to **open the tool**. Today the marketplace only shows an "Owned" tag on the
  card — there's no "my purchases/library" view and no way to open the underlying tool. Build:
  a purchased-tools view (or filter) + an **"Open in Advisor-e"** action that deep-links to the
  hosted page using the stored `pageId`. Depends on **Q-PAGE-URL**.
- **Q-PAGE-URL (P2 · master team).** What is the **URL pattern** that turns a `pageId` (the
  catalogue `link`) into the live Advisor-e page URL? This app stores only the page ID (by
  design) and must not bypass Advisory auth — so the deep-link opens Advisor-e, which enforces
  its own access. Need the pattern (and whether a token/SSO hop is required).
- **Q-ACCESS-CASCADE (P2 · master team).** Advisor-e pages cascade **section → sub-section →
  parent → child**, sometimes **4 levels deep**. The advisor's question: *if I'm granted access
  to a parent page, do I get its child pages too?* We need Advisory's **entitlement model** —
  does buying a parent grant the whole subtree, or is each page licensed individually? This app
  records the purchase (a `pageId`); **Advisor-e enforces the actual access**, so the rule lives
  there. Confirm before we display "what you can open".
- **FEAT-MARKET-HELP (P3).** Once the above are answered, add plain-English notes to the
  marketplace **"How to use this page"** help: how to view purchases, how access works, and how
  the parent→child cascade grants child pages. *(Wording to be confirmed with the owner.)*

### Theme B — Group shared content / collaboration

- **FEAT-GROUP-SHARED-CONTENT (P2 · part of the deferred T1-SPACES).** As a group **creator**,
  pick pages/templates from a **dropdown** to **share with members** so they can collaborate/edit
  the models. As a **member** (once accepted), the **group page shows the list of templates being
  developed** in that group. Note: the actual editing is Advisor-e's existing Google/clone tooling
  (plan §5 hand-off) — this app attaches references and shows the list; it does not build an editor.
  **This is the "shared content" half of T1-SPACES (deferred 2026-07-03)** — logging it may mean
  **un-deferring T1** or building this as its concrete first slice. Owner to steer.

### Theme C — Voice-to-text everywhere

- **FEAT-VOICE-EVERYWHERE (P3).** Extend the existing `speechMixin` 🎤 voice-input (already on
  Profile + Discover search) to the **Messages** reply/compose boxes and **any remaining text
  fields** across the site. *Verify current coverage first, then fill the gaps.*

### Theme D — Message audience / who's in the chat

- **Q-CHAT-AUDIENCE (P2 · owner + design). ✅ DECIDED 2026-07-03 — Model A.** The owner chose the
  simplest, clearest model: a conversation is either a **private 1:1** with a contact **or** a
  **single shared room per group** open to all its members — **no** per-message audience choice and
  **no** sub-selected member sub-chats. See the Done table. Relates to T1-SPACES and FEAT-RBAC.
- **FEAT-CHAT-AUDIENCE (P2). ✅ DONE 2026-07-03.** Model A is already implemented in
  `server/data/repository.js` (1:1 direct threads + one shared thread per group) — no new build,
  verification only. **Residual FEAT-CHAT-SUBGROUPS (P3):** Model B (sub-group side-chats +
  participant controls) is logged as a fast-follow, blocked by FEAT-RBAC (Q-ROLES).

### Theme E — Mentor view & controls

- **Q-MENTOR-SCOPE (P2 · owner + master team).** The advisor's question: *as a **mentor**, what is
  my view, and how do I set controls for the advisors/members below me?* We need the model — what a
  mentor can **see** (their downline's profiles, groups, activity?) and **control** (settings,
  permissions, cross-org posture, approvals?) over each tier below them (plan §5 hierarchy:
  Mentor → Global → Group → Firm → Advisor → Client). This depends on the role model, so it must be
  settled alongside **Q-ROLES** (master team).
- **FEAT-MENTOR-CONSOLE (P2).** Build the mentor's **console** — a view of the advisors/members
  below them plus the controls decided in Q-MENTOR-SCOPE. **Blocked by FEAT-RBAC (Q-ROLES) +
  Q-MENTOR-SCOPE** — a mentor console can't be safely built before "who is below me and what may I
  do to them" is defined by the role hierarchy.

### Theme F — Combine Connections + Messages (+ scale)

- **Q-CONN-MSG-IA (P2 · owner + design).** The advisor's problem: Connections shows *who* you're
  linked with, but you can't act on them there — you have to switch to Messages and find them again;
  and *with 100+ connections, how do I find and message someone easily?* Decide the information
  architecture: **(a)** keep two sections but add a **"Message" action + search/filter** on
  Connections, **(b)** a **unified inbox** where connections and conversations live together, or
  **(c)** a hybrid. Include the **at-scale pattern**: search, filter by type (1:1 / group / firm),
  sort, and pagination for large networks.
- **FEAT-CONNECT-MESSAGE (P2).** Implement the chosen approach — at minimum a **Message** action
  from each connection (opens/creates the thread directly) and **connection search/filter** so a
  large network is navigable; optionally the fuller Connections↔Messages unification. Paired with
  **Q-CONN-MSG-IA**.

---

## How to use

- Add a row to **Open** the moment a deviation or gap is found; never leave it implicit.
- Move it to **In progress** when started, **Done** (with a date) when resolved.
- Stack-Constitution deviations are always **P1** and only ever reconciled *toward* the
  spec — never by relaxing the spec (CLAUDE.md one-directional rule).
