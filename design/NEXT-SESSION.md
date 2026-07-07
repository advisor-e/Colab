# Resume Notes — pick up here next session

> Quick-start for the next working session. Deeper detail in
> [`HANDOVER.md`](../HANDOVER.md) and
> [`advisor-collaboration-platform-plan.md`](advisor-collaboration-platform-plan.md).
> **Snapshot date:** 2026-07-07 · **Last commit:** `65e0f17` (FEAT-RBAC slice ④ — audit viewer).
>
> **The live task list is [`ACTIONS.md`](ACTIONS.md)** — this file is only a quick orientation;
> `ACTIONS.md` is authoritative for what's outstanding.

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
  folder (Dropbox/OneDrive are refused at startup). Canonical working copy is
  `C:\Users\Mike Barnes\Projects\Advisor Collaborate`, in sync with `origin/main`; duplicate
  copies were removed 2026-07-02 (`ACTIONS.md` P1-CANON).

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

> The design-triage (T1–T6), the P1 governance backlog (CI, hooks, audit gate, prod guard,
> branch protection, test coverage), and the **FEAT-RBAC** build (role consoles, cross-org
> **ceiling**, audit viewer) are all **done** — see the `ACTIONS.md` Done table. What remains
> splits into "needs the master team" and "buildable now".

**Blocked on the master team (integration — needs creds/decisions):**

1. **Connect real MySQL** — provision `config/db-schema.sql`, then fill the SQL into the single
   seam file `server/data/repository.js` (each function has a `// SQL SEAM:` note). Needs DB creds.
2. **Wire real Advisory login** — set `JWT_SECRET`, confirm the JWT claim names/algorithm, and how
   the Advisory session reaches the app. Then the two remaining RBAC slices: real **Client-token
   rejection** and wiring the real Advisory **`role` claim** (retire the interim override table).
   At the same wiring, close **SEC-THREAD-ACL** (message participant/member authorization).

**Buildable now (no external blocker):**

1. **SEC-MARKET-CROSSORG (P2)** — make the cross-org wall also gate the marketplace (plan §8).
2. **PERF-CONSOLE-TREE (P2)** — lazy-load a branch's advisers on expand (real-scale hardening).
3. **FEAT-BULKINVITE (P3)** — manager bulk-invite. Smaller nice-to-haves: FEAT-TOOLPICKER-EXTRACT,
   FEAT-MARKET-HELP.

> **Live task tracker:** `design/ACTIONS.md` is authoritative — the master to-do index at the top
> lists everything outstanding, each row pointing to its detailed entry.

## Gotchas (the short list — full version in HANDOVER §7)

- Node **14.15** only (nvm). · npm install needs the **corp cert**. ·
  `@nuxt/friendly-errors-webpack-plugin` pinned to **2.5.2** (Node-14). · Keep off the **E:** drive
  **and out of Dropbox/OneDrive** (refused at startup). · Dev data **resets** on backend restart
  (in-memory).
