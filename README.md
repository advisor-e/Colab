# Advisor-e Collaborate

The advisor collaboration platform — the **people layer** that lets advisers across the
Advisory.com network find each other, reach out, and form specialty groups. A standalone
sibling of the Virt Advisor app, built to the same Stack Constitution (see [`CLAUDE.md`](CLAUDE.md)).

Planning docs live in [`design/`](design/) — start with
[`design/advisor-collaboration-platform-plan.md`](design/advisor-collaboration-platform-plan.md).

> **Integrating this into Advisory.com? → read [`HANDOVER.md`](HANDOVER.md) first.** It covers
> how to run the app, the login + MySQL connection seams, required env vars, and what's
> built vs mocked vs to-do.

## Stack (locked — see CLAUDE.md)

- **Frontend:** Nuxt 2 / Vue 2 (Options API, Pug, Buefy + Bulma), vue-i18n — port 3000.
- **Backend:** Node.js 14.15 + Restify, raw MySQL via `mysql2` — port 4000.
- Frontend talks to the backend only over HTTP; all business logic and third-party calls
  live on the backend.

## Run (development)

Requires **Node 14.15** (via nvm: `nvm use 14.15.0`).

```bash
npm install
npm run dev:all     # Nuxt (3000) + Restify backend (4000) together
```

Then open http://localhost:3000.

> The people-layer data is currently **in-memory mock data** and the routes are
> unauthenticated. MySQL persistence and Advisory login/profile integration wire in later
> (see `design/…-plan.md` §12). Voice input and live translation reuse the Virt Advisor
> `speechMixin` and translate route.
