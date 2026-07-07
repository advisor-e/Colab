# Advisor-e Collaborate — Master Team: Start Here

> **One-page checklist** to take this app from a *show-home on mock data* to production.
> **Read these first:** [`HANDOVER.md`](HANDOVER.md) (seams + how to run) ·
> [`design/ACTIONS.md`](design/ACTIONS.md) (live task tracker) ·
> [`design/advisor-collaboration-platform-plan.md`](design/advisor-collaboration-platform-plan.md)
> §13 (decision log).
>
> **Status (2026-07-07):** everything buildable on mock data is done, tested (**425 tests**,
> Jest + Playwright), CI-green. What remains needs *your* credentials, *your* systems, and ~5
> decisions. Nothing is parked silently — the full list is `design/ACTIONS.md`.

## 1 · Provide (environment / credentials)

- [ ] `JWT_SECRET` (or the RS256 public key) — the Advisory token signing secret
- [ ] `MYSQL_HOST / PORT / DATABASE / USER / PASSWORD` — a provisioned MySQL instance
- [ ] `API_BASE_URL` — the backend URL the Nuxt proxy targets
- [ ] Set `ALLOW_DEV_AUTH=false` in production (a startup guard refuses to boot otherwise)

## 2 · Connect the seams (code is built + isolated — HANDOVER §4)

- [ ] **MySQL** (`INT-MYSQL`) — provision `config/db-schema.sql`; fill SQL into the single seam
      file `server/data/repository.js` (each fn has a `// SQL SEAM:` note; keep the names /
      params / return shapes and the routes + frontend need no change). HANDOVER §4b.
- [ ] **Advisory login** (`INT-AUTH`) — confirm how the session reaches the backend; set the
      secret; verify claim names in `config/integration.js → AUTH`. HANDOVER §4a.
- [ ] **Advisor profiles** — read identity from Advisory instead of the mock `advisors[]`,
      joined with this app's `advisor_interest` / `advisor_tag` tables. HANDOVER §4c.
- [ ] **Tool catalogue** (`P2-TEMPLATE-FEED`) — swap the JSON snapshot in
      `server/data/advisoryTemplates.js` for Advisory's live feed; keep tool links gated by
      Advisory's own access control. HANDOVER §4d.
- [ ] **Finish RBAC** (once INT-AUTH is live) — reject a Client-role token; wire the real
      Advisory `role` claim to retire the interim override table + the demo preview personas.

## 3 · Confirm (decisions — your team / the owner)

- [ ] JWT **claim names + signing algorithm** (HS256 vs RS256) — `Q-JWTCLAIMS`
- [ ] The **profile API / source** for identity — `Q-PROFILE`
- [ ] Exact **`role` claim values** Advisory issues — `Q-ROLES` (design builds to a seam either way)
- [ ] **Page URL pattern** to open a tool from its page ID — `Q-PAGE-URL`
- [ ] **Access cascade** — does buying a parent page grant its child pages? — `Q-ACCESS-CASCADE`

## 4 · Close at wiring (security)

- [ ] **SEC-THREAD-ACL** — enforce participant/member authorization on message read / reply /
      list. Harmless in the single-user mock; a privacy leak under real multi-user auth.
      `AUTH SEAM` markers are already in the code.

## 5 · Residual / optional (non-blocking, tracked)

- [ ] **P1-TOOLCHAIN** — re-enable strict Node-floor (`engine-strict`) after two transitive overrides
- [ ] Owner P3 calls — `Q-VIEWAS-MODE` (view-as: act-as vs read-only) · `Q5-GROUPIP`

## Run it (dev)

```bash
nvm use 14.15.0          # Node 14.15 ONLY — the machine default (Node 20) will not work (G1)
npm install              # needs the corporate TLS cert on this network (G2)
npm run dev:all          # Nuxt :3000 + Restify backend :4000
```

Full gotchas: HANDOVER §7. Locked stack (Nuxt 2 / Vue 2 / Restify / raw MySQL / Node 14.15) is
non-negotiable — see `CLAUDE.md`.

## Definition of done (please read)

This repo is a **show-home**: runnable on mock data with every real-system connection pre-built
as a labelled seam. **Real integration tests against live Advisory / MySQL are out of scope from
this repo by design** — that verification happens on your side once the seams above are
connected. The authoritative remaining-work list is the master to-do index at the top of
[`design/ACTIONS.md`](design/ACTIONS.md).
