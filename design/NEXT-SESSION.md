# Resume Notes — pick up here next session

> Quick-start for the next working session. Deeper detail in
> [`HANDOVER.md`](../HANDOVER.md) and
> [`advisor-collaboration-platform-plan.md`](advisor-collaboration-platform-plan.md).
> **Snapshot date:** 2026-07-01 · **Last commit:** `92cba68`.

---

## Where things stand

A working **people-layer** prototype of Advisor-e Collaborate. **All six pillars function**
on in-memory demo data (resets on backend restart):

1. **Discovery** — two-sided search (people + groups), voice input, language switch.
2. **Connection** — 1:1 connect → mutual accept; Connections page shows individuals **and**
   your groups with their members.
3. **Groups** — browse/detail/create, request-to-join (consent-based).
4. **Messaging** — two-pane chat; purposeful outreach + group message create threads;
   **in-chat translation** (any language → reader's language).
5. **Co-creation** — out of scope (handled by Advisory's existing Google cascade).
6. **Marketplace** — group-owned IP listings; record-only purchases (no Advisory fee).

Plus: bright themed UI with section colour-coding; history-based back nav; the **login seam**
(auth middleware + dev bypass) and the **MySQL seam** (`server/data/repository.js` + schema +
probe) — both built and waiting on real Advisory credentials.

## Where it lives
- **Repo:** `https://github.com/advisor-e/Colab` (private). **Local:** on **C:**, never a sync
  folder (Dropbox/OneDrive are refused at startup). Master team's expected path
  `C:\Users\Mike Barnes\Projects\Advisor Collaborate`; the current working copy is
  `C:\Users\mb\Projects\Advisor Collaborate` (moved off Dropbox 2026-07-01 — `ACTIONS.md` P1-CANON).

## How to run it (dev)
```bash
nvm use 14.15.0          # the machine default is Node 20, which does NOT work
npm install              # only if node_modules is missing (needs the corp TLS cert — see HANDOVER G2)
npm run dev:all          # Nuxt :3000 + Restify backend :4000
```
> Defaults to **:3000 / :4000**. On Windows you can also just double-click **`start-app.cmd`** (or
> the "Advisor-e Collaborate" desktop shortcut), which runs `npm run dev:all` and opens the browser.
> The in-chat translation's outbound call needs the corp cert
> (`NODE_EXTRA_CA_CERTS=./certs/digicert-bundle.pem`). Dev backend needs `ALLOW_DEV_AUTH=true`
> (already in the scripts).

## What to do next (suggested priorities)
1. **Connect real MySQL** — provision `config/db-schema.sql`, then fill the SQL into the single
   seam file `server/data/repository.js` (each function has a `// SQL SEAM:` note). Needs DB creds.
2. **Wire real Advisory login** — set `JWT_SECRET`, confirm claim names in `config/integration.js`,
   confirm how the Advisory session reaches the app. Add the production startup guard (refuse
   `ALLOW_DEV_AUTH=true` when `NODE_ENV=production`).
3. **Role hierarchy / RBAC** — Mentor→Global→Group→Firm→Advisor→Client enforcement (not built).
4. **Cross-org engagement policy** enforcement; **manager bulk-invite**; **audit logging**.
5. Smaller: real advisor profiles from Advisory (replace the mock `advisors[]`).

> **Live task tracker:** `design/ACTIONS.md` holds the current P1 backlog — incl. **P1-AUDIT-GATE**
> (wire the audit half of the pre-commit gate without blocking commits), **P1-SEC-UTILS**
> (`sanitiseInput` / `validateAIResponse` + tests), **P1-PROD-GUARD** (production startup guard),
> **P1-PROTECT** (branch protection), and **P1-TEST** (grow coverage to the CLAUDE.md targets).

## Gotchas (the short list — full version in HANDOVER §7)
- Node **14.15** only (nvm). · npm install needs the **corp cert**. ·
  `@nuxt/friendly-errors-webpack-plugin` pinned to **2.5.2** (Node-14). · Keep off the **E:** drive
  **and out of Dropbox/OneDrive** (refused at startup). · Dev data **resets** on backend restart
  (in-memory).
