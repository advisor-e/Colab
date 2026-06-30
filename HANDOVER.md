# Advisor-e Collaborate — Handover for the Master Coding Team

> **Purpose.** Everything the Advisor-e master team needs to (a) run this app, (b) wire it
> into the Advisory.com platform (login + MySQL + advisor profiles), and (c) understand what
> is built, what is mocked, and what remains. Pairs with the design docs in
> [`design/`](design/) (start with `advisor-collaboration-platform-plan.md`, which has a dated
> decision log).
>
> **Status:** working UI prototype on a dev fallback. **No real persistence or real auth yet** —
> all data is in-memory and resets on restart. The integration *seams* are built and tested
> (see §4). **Last updated:** 2026-06-30.

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
- **Local path:** `C:\Users\Mike Barnes\Projects\Advisor Collaborate` (on the **C:** drive — see
  gotcha G5).

**Run (development):**
```bash
nvm use 14.15.0                 # see G1 — machine default is Node 20, which will NOT work
npm install                     # see G2 — corporate TLS cert needed on this network
npm run dev:all                 # Nuxt (:3000) + Restify backend (:4000) together
# open http://localhost:3000
```
The backend reads `ALLOW_DEV_AUTH=true` in dev (already in the `dev:all`/`backend` scripts) to
bypass real auth. During development I ran on **:3010 / :4100** to avoid clashing with other
local servers — the committed config defaults to **:3000 / :4000**.

---

## 3. Architecture (as built)

```
Browser ──HTTP──> Nuxt 2 (frontend, :3000) ──/api/* thin proxy──> Restify (backend, :4000)
                  pages/, components/, mixins/           server/routes/people.js   (thin HTTP handlers)
                                                         server/data/repository.js (DATA LAYER — the MySQL seam)
                                                         server/middleware/auth.js  (Advisory login)
                                                         server/utils/db.js          (MySQL pool)
                                                         config/integration.js       (AUTH + DB config)
                                                         config/db-schema.sql         (schema to provision)
```
- **Frontend (Nuxt 2 / Vue 2 / Pug / Buefy):** pages `index, profile, discover, messages,
  groups/_id, groups/new`; `components/AppHeader.vue`; `mixins/localeMixin.js` (i18n + on-demand
  translation), `mixins/speechMixin.js` (voice). All `/api/*` calls go through
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
  unlimited-client licence + ongoing updates; "list a tool" form).
- Cross-cutting: **multi-language** (i18n + on-demand translation), **in-chat translation**
  (any language → the reader's language), and **voice input**.
- Integration seams: **auth middleware** (verified), **DB schema + probe + fallback**, and a
  **single data-layer seam** (`server/data/repository.js`).

**Mocked (in-memory, resets on restart):** all advisors, groups, threads/messages; outreach &
join requests are recorded in memory only.

**Not yet built (in the plan, not in code):** **RBAC / role hierarchy** enforcement
(Mentor→Global→Group→Firm→Advisor); **cross-org engagement policy** enforcement; manager
**bulk-invite**; **audit logging**.

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

---

## 8. Open questions for the master team

See `design/advisor-collaboration-platform-plan.md` §12. Most relevant here:
1. Advisory **session mechanics** — how the login is shared with this app (cookie/embedded/token).
2. Confirm the **JWT claim names** and signing algorithm (HS256 vs RS256).
3. The **advisor profile API/source** to read identity from.
4. **Service lines / specialty tags** — do they exist in Advisory, or are they new here?
5. The **role hierarchy** (Mentor→Global→Group→Firm→Advisor→Client) source of truth.

---

## 9. How changes have been tracked

- **Git history** — every change is a descriptive commit (the primary change log).
- **`design/advisor-collaboration-platform-plan.md`** — the product/design decisions, with a
  dated **decision log** (§13).
- **This document** — kept updated as integration-relevant changes land.
