# Advisor-e Collaborate — Handover for the Master Coding Team

> **Purpose.** Everything the Advisor-e master team needs to (a) run this app, (b) wire it
> into the Advisory.com platform (login + MySQL + advisor profiles), and (c) understand what
> is built, what is mocked, and what remains. Pairs with the design docs in
> [`design/`](design/) (start with `advisor-collaboration-platform-plan.md`, which has a dated
> decision log).
>
> **Status:** working UI prototype on a dev fallback. **No real persistence or real auth yet** —
> all data is in-memory and resets on restart. The integration *seams* are built and tested
> (see §4). **Last updated:** 2026-07-07 (role hierarchy / RBAC consoles, the three-level
> cross-org **ceiling**, and the admin-gated **audit viewer** are now built — §6).
>
> **Delivery standard.** This app is a *"show home with the plumbing and wiring clearly
> labelled"* — built and runnable on mock data, with every real-system connection pre-built as a
> labelled **seam** (§4) for the master team to connect to Advisor-e.com. See `CLAUDE.md` →
> *Definition of Done & the Daily-Clean Rule*.

---

## 1. What this app is

The **people layer** of the advisor collaboration network: advisers find each other, advertise
their interests, reach out (purposeful cold outreach), form specialty **groups**, and **message**
each other. It is a **standalone sibling** of the Virt Advisor app, paired to Advisory.com, built
to the same **Stack Constitution** (`CLAUDE.md`).

**Out of scope (handled by existing Advisory):** the Google document cascade (per-level
accounts, clone-down, translation, lock/override, archive). This app does **not** rebuild it.

---

## 2. Where it lives & how to run it

- **Repo:** `https://github.com/advisor-e/Colab` (private).
- **Local path:** must be on the **C: drive, never inside a sync folder** — Dropbox/OneDrive/
  Google Drive are refused at startup (gotcha G7). The canonical working copy is
  `C:\Users\Mike Barnes\Projects\Advisor Collaborate`, in sync with GitHub `origin/main`. Earlier
  duplicate copies (a Dropbox copy and an `E:` copy) were removed on 2026-07-02 — `design/ACTIONS.md`
  P1-CANON. (An earlier note's `C:\Users\mb\…` path was a typo for the real `Mike Barnes` folder.)

**Run (development):**

```bash
nvm use 14.15.0                 # see G1 — machine default is Node 20, which will NOT work
npm install                     # see G2 — corporate TLS cert needed on this network
npm run dev:all                 # Nuxt (:3000) + Restify backend (:4000) together
# open http://localhost:3000
```

The backend reads `ALLOW_DEV_AUTH=true` in dev (already in the `dev:all`/`backend` scripts) to
bypass real auth. The committed config defaults to **:3000 / :4000**.

**One-click option (Windows):** double-click **`start-app.cmd`** (or the "Advisor-e Collaborate"
desktop shortcut) — it runs `npm run dev:all` in its own window and opens the browser once the app
is ready. A VS Code Run-and-Debug entry does the same from the editor.

---

## 3. Architecture (as built)

```text
Browser ──HTTP──> Nuxt 2 (frontend, :3000) ──/api/* thin proxy──> Restify (backend, :4000)
                  pages/, components/, mixins/           server/routes/people.js   (thin HTTP handlers)
                                                         server/data/repository.js (DATA LAYER — the MySQL seam)
                                                         server/data/advisoryTemplates.js (tool-catalogue seam — §4d)
                                                         server/middleware/auth.js  (Advisory login)
                                                         server/utils/db.js          (MySQL pool)
                                                         config/integration.js       (AUTH + DB config)
                                                         config/db-schema.sql         (schema to provision)
```

- **Frontend (Nuxt 2 / Vue 2 / Pug / Buefy):** pages `index, profile, discover, connecting,
  groups/_id, groups/new, marketplace, firm, audit` (+ dev-only console previews `group, global,
  mentor`; `messages` + `connections` are redirect stubs → `connecting`); `components/AppHeader.vue`,
  shared components (`ManagerConsole, ConsoleNode, AuditViewer, ConversationPane`);
  `mixins/localeMixin.js` (i18n + on-demand translation), `mixins/speechMixin.js` (voice). All
  `/api/*` calls go through
  `server-middleware/api.js` (a generic thin proxy that forwards method/headers/body — **including
  cookies** — to the backend).
- **Backend (Node 14.15 + Restify, CommonJS, raw `mysql2`):** all routes in
  `server/routes/people.js`; protected by `server/middleware/auth.js`.

---

## 4. Integration seams — what the master team wires in

The connection points are built and isolated. Each is a small, well-marked seam.

### 4a. Advisory login (auth)  ·  `server/middleware/auth.js` + `config/integration.js`

- The middleware verifies an Advisory JWT from the **`Authorization: Bearer` header or a `token`
  cookie**, using the claim names + secret in `config/integration.js → AUTH`.
- **To go live:**
  1. Set `JWT_SECRET` (env) to the Advisory signing secret. *If Advisory uses RS256 (asymmetric),*
     put the public key in `AUTH.secret` and switch the `jwt.verify()` call.
  2. Confirm the claim names (`advisorIdClaim`, `firmIdClaim`, `roleClaim`, `emailClaim`) match
     Advisory's token. (Currently `advisorId / firmId / role / email`.)
  3. Confirm how the Advisory **session reaches this app** (same-domain cookie / embedded / token
     hand-off). The Nuxt proxy already forwards cookies; verify the cookie name (`token`) or adjust
     `extractToken()`.
- **Dev bypass:** with `ALLOW_DEV_AUTH=true`, an unauthenticated request gets a fixed dev identity
  (`advisorId: 'me'`). With it off (production), no/invalid token → **401** (verified).
- ⚠ **TODO before production:** add a startup guard that refuses to boot if
  `ALLOW_DEV_AUTH=true` while `NODE_ENV=production` (Virt Advisor has this pattern in its
  `restify-server.js` — copy it).

### 4b. MySQL persistence  ·  `config/db-schema.sql` + `server/utils/db.js`

- **Provision** `config/db-schema.sql` into the Advisor-e MySQL instance.
- **Configure** the connection via env (`MYSQL_HOST/PORT/DATABASE/USER/PASSWORD`) or
  `config/integration.js → DB`. `server/utils/db.js` is a ready `mysql2/promise` pool
  (`pool.execute(sql, params)`).
- On boot the backend **probes** MySQL and logs `MySQL connected` or
  `MySQL unavailable — using in-memory dev store` (non-fatal).
- ⚠ **The data layer is in-memory, isolated to ONE file: `server/data/repository.js`.** This is
  the single file to change to connect MySQL. Every data operation is an `async` function with a
  `// SQL SEAM:` note showing the query to run (against `config/db-schema.sql`, via the
  `server/utils/db.js` pool). Keep the function names, parameters, and return shapes — the routes
  (`server/routes/people.js`) and the frontend then need no changes. Wrap the SQL in try/catch and
  return safe errors (CLAUDE.md error rule).

### 4c. Advisor identity & profiles  ·  `server/routes/people.js` (`advisors[]`)

- Advisor **identity** (name, title, firm, email, phone, location) is **Advisory's system of
  record** — do not store it here. The mock `advisors[]` stands in for it.
- Replace `getMe / getAdvisor / listAdvisors` to read identity from Advisory's profile API/store,
  **joined with** this app's `advisor_interest` + `advisor_tag` tables (the platform-owned
  extension: availability, about, strengths/industries/topics).

### 4d. Advisor-e tool catalogue (marketplace "List a tool" linkage)  ·  `server/data/advisoryTemplates.js`

Every Marketplace listing links to a real Advisor-e **tool page**. When listing a tool, the
advisor picks it from a type-to-search dropdown ("Choose the Advisor-e tool"), which stores the
tool's **page ID** — the catalogue `link` field, e.g. `id-4466260146` — on the listing. That ID is
generated by Advisory when an advisor loads a tool; it is **never generated or edited by this app**.

- **Source seam — one file: `server/data/advisoryTemplates.js`.** Today it reads a **read-only
  JSON snapshot** exported from the master app (`design/reference/search_content_*.json`). It
  exposes two `async` functions — `list(q)` (feeds the picker) and `exists(pageId)` (validates a
  submitted ID). **To go live:** replace the file read with a call to Advisory's live template
  API/DB, keeping the return shapes identical — the route (`server/routes/templates.js`,
  `GET /api/templates`), the marketplace create-validation, and the frontend picker then need **no
  changes** (same drop-in pattern as the MySQL seam in §4b).
- **HARD RULE (CLAUDE.md):** the snapshot's IDs and content are master data and must **never** be
  edited, renumbered, or generated here. The app only *reads* the catalogue. To refresh, drop in a
  newer export and update the filename constant in the seam (or switch to the live feed). Note the
  same `link` can appear on more than one catalogue entry — that is master data, left exactly as-is.
- **Validation (never trust the client):** `server/routes/people.js → createListing` rejects a
  listing whose `pageId` is missing or not in the catalogue (**400**). The frontend also blocks
  early, but the backend is the authority.
- ⚠ **Access control is Advisory's responsibility.** A listing shares a *link* to an
  Advisory-hosted page; sharing it must **not** bypass Advisory's own login/permissions. The page
  must stay gated by Advisory — this app only stores and displays the page ID. **Enforce this when
  wiring the live feed** (tracked in `design/ACTIONS.md` → P2-TEMPLATE-FEED).

---

## 5. Environment variables

| Var | Purpose | Dev | Production |
|---|---|---|---|
| `JWT_SECRET` | Advisory token signing secret | placeholder | **required** |
| `MYSQL_HOST/PORT/DATABASE/USER/PASSWORD` | MySQL connection | placeholder → fallback | **required** |
| `API_BASE_URL` | Backend URL the Nuxt proxy targets | `http://localhost:4000` | backend URL |
| `ALLOW_DEV_AUTH` | Dev auth bypass | `true` | **must be unset/false** |
| `BACKEND_PORT` | Restify port | `4000` | as deployed |

---

## 6. Status — done / mocked / to-do

**Built & working (on dev fallback):**

- UI + theme: Home, **Profile** (incl. email/phone from Advisory), **Discover** (two-sided
  search, people/groups), **Groups** (detail, create, request-to-join), **Messages** (two-pane
  chat, replies). Section colour-coding; history-based back navigation.
- **Connections** (1:1 connect → mutual accept; status-aware Discover buttons; Connections page
  showing individuals **and** your groups with their members).
- **Marketplace** (group-owned IP listings; **record-only** purchases — no Advisory fee;
  unlimited-client licence + ongoing updates). **"List a tool"** links each listing to a real
  Advisor-e tool via a type-to-search picker fed by the master catalogue; title/summary/tags
  pre-fill from the chosen tool and stay editable, while the linked page ID is read-only (see §4d).
- Cross-cutting: **multi-language** (i18n + on-demand translation), **in-chat translation**
  (any language → the reader's language), and **voice input**.
- **Per-page help:** a "How to use this page" button in each page banner opens a pop-up of
  page-specific guidance (copy drawn from the design docs; `components/base/PageHelp.vue`, strings
  in `locales/en.json` under `help.*`).
- **Role hierarchy / RBAC** (Q-ROLES; §5): a single role-tier seam
  (`server/data/roles.js` — `resolveTier` + `canManage`) drives a **shared management console**
  (`components/shared/ManagerConsole.vue`) with **view-as**, scoped to a manager's branch
  (Firm→branch, Group→country, Global/Mentor→all). Higher tiers show a **cascading org-tree
  roll-up** (`ConsoleNode.vue`); dev-only preview pages `/group /global /mentor` demo each tier.
- **Cross-org engagement policy** (plan §8): the wall is **enforced** on discovery/connection/
  outreach/profile, **the marketplace** (sealed org can't see/buy other orgs' listings) **and
  groups** (browse stays open; joining + the group chat are refused by the group-owner rule;
  member names hidden, counts kept; existing members untouched — owner decisions 2026-07-15),
  with a **three-level ceiling** (brand → country → branch, most-closed-wins; a lower level may
  only tighten) set per manager tier from the console. Default posture is a **config flip**
  (`config/integration.js → CROSS_ORG`, closed/opt-in).
- **Audit logging + viewer**: an **append-only** trail (`server/data/auditLog.js`) records
  significant + security events; an **admin-gated viewer** (`components/shared/AuditViewer.vue`,
  Mentor super-admin only) with filters. Plus **notifications** (in-app bell) and **IP
  governance MVP** (4-tier labels + locked-flag enforcement).
- Integration seams: **auth middleware** (verified), **DB schema + probe + fallback**, a
  **single data-layer seam** (`server/data/repository.js`), the **role-tier seam**
  (`server/data/roles.js`), and the **tool-catalogue seam**
  (`server/data/advisoryTemplates.js` — §4d) feeding the marketplace tool-picker.

**Mocked (in-memory, resets on restart):** all advisors, groups, threads/messages; outreach,
join requests, audit entries, postures and role overrides are held in memory only.

**Not yet built (in the plan, not in code):** collaboration **spaces** (T1, deferred — chat
exists, the space-with-shared-content concept doesn't); the remaining RBAC slices that need the
master team — real **Client-token rejection** (needs live auth) and wiring the real Advisory
**`role` claim** to retire the interim override table. (Manager **bulk-invite** is built for the
Firm tier; higher-tier bulk-invite from the cascading tree is a later slice.) Full outstanding
list: `design/ACTIONS.md`.

---

## 7. Dev-environment gotchas (hard-won — keep these)

- **G1 · Node 14.15 only.** The machine default is Node 20, which breaks the build. Use
  `nvm use 14.15.0` (installed under `…\AppData\Local\nvm\v14.15.0`).
- **G2 · npm install needs the corporate TLS cert.** Installs fail with
  `UNABLE_TO_VERIFY_LEAF_SIGNATURE` unless Node trusts the DigiCert bundle
  (`NODE_EXTRA_CA_CERTS=./certs/digicert-bundle.pem`). `certs/` is gitignored — supply your own.
- **G3 · `@nuxt/friendly-errors-webpack-plugin` is pinned to `2.5.2`** (in `package.json`).
  Newer versions bundle `consola@3`, whose `node:`-prefixed requires crash on Node 14.15.
- **G4 · Ports.** Config defaults 3000/4000; I used 3010/4100 locally to avoid conflicts.
- **G5 · Don't run from a slow drive.** Installing/running off a slow external disk made
  `npm install` take hours; keep the project (and `node_modules`) on a fast local disk.
- **G6 · Dev data resets** on every backend restart (in-memory). This is expected until §4b.
- **G7 · Don't run from a sync folder.** The app **refuses to start** from Dropbox/OneDrive/Google
  Drive (`scripts/check-run-location.js`, wired as a `pre` hook on the run scripts) — background
  sync can corrupt `.git` and mask a stale copy. Keep the repo on a plain C: path. Override (not
  recommended): `ALLOW_SYNC_FOLDER=true`. See `design/ACTIONS.md` P1-CANON.

---

## 8. Open questions for the master team

See `design/advisor-collaboration-platform-plan.md` §12. Status (resolved 2026-07-01 with the
product owner) and what remains:

1. ✅ Advisory **session mechanics** — **shared cookie/token** on a common parent domain; validate
   on this backend, never trust the frontend (matches the implemented auth seam). *Remaining: items
   2–3 below — the exact claim names/algorithm and profile source.*
2. ⏳ Confirm the **JWT claim names** and signing algorithm (HS256 vs RS256).
3. ⏳ The **advisor profile API/source** to read identity from.
4. ✅ **Service lines / specialty tags** — **NEW; not in Advisory.** Owned by this app's own tables;
   the master profile is untouched. **`branch` = the firm/office** (→ Firm tier) and
   **`country-address` → the Group/country tier**, so much of the hierarchy derives from existing
   master fields.
5. ⏳ The **role hierarchy** (Mentor→Global→Group→Firm→Advisor→Client) source of truth.
   **Model resolved 2026-07-06 (owner, Q-ROLES; plan §13)** — **hybrid source:** derive
   **Firm** from `branch` + **Group/country** from `country-address` (item 4 / Q3); read
   **manager/mentor** designations from a **`role` claim** in the Advisory JWT
   (`AUTH.roleClaim`), with a **local override table** as the interim seam. Each manager tier
   sees/controls only its own branch (same console + view-as as the Firm tier); the cross-org
   toggle follows a **ceiling model** (Global sets the limit; Group/Firm may only tighten);
   Mentor = platform super-admin; Client = **no access** to this app. **Remaining for the
   master team:** confirm the exact **`role` values** Advisory issues (and whether roles ever
   arrive via a profile API instead of the token) — the app builds against the seam either way.

> **Future / optional — promote `service_line` to the master profile.** A *service line* (Tax,
> Audit, Corporate Finance…) is a core professional attribute other apps may also want, so it is a
> candidate to add to the Advisory.com master profile later. If promoted, this app would *consume*
> it read-only (like title/bio/branch) and retire its local `service_line` storage. The free-form
> *interest/specialty tags* stay app-owned regardless — they are not master data. Not required now.

---

## 9. How changes have been tracked

- **Git history** — every change is a descriptive commit (the primary change log).
- **CI** — `.github/workflows/ci.yml` runs `npm ci` + lint + test + `nuxt build` on Node 14.15 for
  every push/PR to `main`. A **Husky pre-commit hook** (`.husky/pre-commit`) runs lint + test
  locally before each commit (the audit portion is deferred — see `ACTIONS.md` P1-AUDIT-GATE).
- **`design/ACTIONS.md`** — reconcile/remediation tracker: every Stack-Constitution deviation and
  governance gap, logged as a P1 and only ever reconciled *toward* the spec.
- **`design/SECURITY-AUDIT-NOTES.md`** — the accepted `npm audit` risk register.
- **`design/advisor-collaboration-platform-plan.md`** — the product/design decisions, with a
  dated **decision log** (§13).
- **This document** — kept updated as integration-relevant changes land.
