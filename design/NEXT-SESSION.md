# Resume Notes — pick up here next session

> Quick-start for the next working session. Deeper detail in
> [`HANDOVER.md`](../HANDOVER.md) and
> [`advisor-collaboration-platform-plan.md`](advisor-collaboration-platform-plan.md).
> **Snapshot date:** 2026-07-15 · **Last change:** FEAT-CROSSORG-GROUPS final slice —
> the cross-org wall now covers groups (browse-yes / join-no; owner's 5 decisions in plan §13).
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
3. **Groups** — browse/detail/create, request-to-join (consent-based); cross-org wall:
   everyone can browse, but joining/chatting into an out-of-reach group is refused
   (member names hidden, counts kept; existing members untouched).
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

> The design-triage (T1–T6), the P1 governance backlog, the **FEAT-RBAC** build (role consoles,
> cross-org **ceiling**, audit viewer), the pre-handover review hardening, and the whole former
> "buildable now" list (marketplace wall, lazy console tree, bulk-invite, ToolPicker extract,
> **groups wall**) are **done** — see the `ACTIONS.md` Done table. Everything substantial that
> remains **needs the master team**; `START-HERE.md` is their checklist.

**Blocked on the master team (integration — needs creds/decisions):**

1. **Connect real MySQL** — provision `config/db-schema.sql`, then fill the SQL into the single
   seam file `server/data/repository.js` (each function has a `// SQL SEAM:` note). Needs DB creds.
2. **Wire real Advisory login** — set `JWT_SECRET`, confirm the JWT claim names/algorithm, and how
   the Advisory session reaches the app. Then the two remaining RBAC slices: real **Client-token
   rejection** and wiring the real Advisory **`role` claim** (retire the interim override table).
   At the same wiring, close **SEC-THREAD-ACL** (message participant/member authorization).
3. **P2-TEMPLATE-FEED** (live Advisory template feed) and the two URL/access decisions
   **Q-PAGE-URL** + **Q-ACCESS-CASCADE** (which also unblocks FEAT-MARKET-HELP).

**Owner decisions, if wanted (no build blocked without them):**

- **Q-VIEWAS-MODE** (view-as: act-as vs read-only) · **Q5-GROUPIP** (pre-existing personal IP
  edge cases) · **T5-MARKET-SIGNALS** (ratings/proven-tools signal).

**Smaller open items:** P1-TOOLCHAIN (re-enable `engine-strict`, needs 2 transitive `overrides`) ·
FEAT-CHAT-SUBGROUPS (Model B side-chats) · FEAT-MENTOR-CONSOLE higher-tier live wiring.

> **Live task tracker:** `design/ACTIONS.md` is authoritative — the master to-do index at the top
> lists everything outstanding, each row pointing to its detailed entry.

## Gotchas (the short list — full version in HANDOVER §7)

- Node **14.15** only (nvm). · npm install needs the **corp cert**. ·
  `@nuxt/friendly-errors-webpack-plugin` pinned to **2.5.2** (Node-14). · Keep off the **E:** drive
  **and out of Dropbox/OneDrive** (refused at startup). · Dev data **resets** on backend restart
  (in-memory).
