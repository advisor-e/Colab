# SECURITY AUDIT NOTES — accepted risk register

> The record mandated by `CLAUDE.md` (§Dependency and Version Governance, §Security).
> `CLAUDE.md` references this file as the place where `npm audit` risk is **formally
> accepted and reviewed** — it had been referenced but never created, so this file closes
> that gap. **Nothing here is silently swallowed:** every high/critical finding is listed,
> classified, and given a reason. Findings that need action are also logged in
> `design/ACTIONS.md`.
>
> **Created / last reviewed:** 2026-07-01 · npm 6.14.8 · Node 14.15.0

---

## 1. Standing policy (from `CLAUDE.md`)

- High-severity findings originating in the **Nuxt 2 build toolchain** are accepted
  **build-time** risk: those packages (webpack, watchpack, the template compiler, bundle
  tooling, telemetry, generators, etc.) run only on developer machines during `npm run dev`
  / `npm run build`. **They are not present in, or reachable from, the deployed runtime.**
- Fixes are only ever taken **toward** the Stack Constitution. `npm audit fix --force` is
  **forbidden** (it performs semver-major bumps that would break the Nuxt 2 / Node 14.15
  lock). Plain `npm audit fix` (safe, no breaking change) is allowed, and only for packages
  **outside** the Nuxt 2 build toolchain.
- `npm audit` is still run every session and **every high/critical finding is reviewed** —
  protection is by review, not by silence.

---

## 2. Latest audit snapshot — 2026-07-01

Full tree: **498 findings** — 2 critical, 27 high, 457 moderate, 12 low (2100 packages).
`npm audit` reports that ~489 require semver-major updates (i.e. unfixable without breaking
the lock).

> **Dev-tooling delta (2026-07-01):** adding `markdownlint-cli@0.28.1` — the Node-14-safe doc
> linter now wired into the pre-commit hook and CI (`lint:md`) — raises the tree to ~507
> findings. Its extra transitive high-severity items are **build/lint tooling only**, never in
> the deployed runtime, and are accepted under the same policy above. (`markdownlint-cli2` was
> evaluated first and rejected: its ESM entrypoint crashes on Node 14.15.)
>
> **npm 6 caveat.** `npm audit --production` does **not** filter dev/build dependencies in
> npm 6.14.8 (a known npm-6 limitation — fixed only in npm 7+). It still reports the same
> build-tool findings, so it cannot be used to scope the gate to runtime deps on this stack.

### Critical (2) — build-time only, ACCEPTED

| Package | Advisory | Path (why it's build-time) |
|---|---|---|
| `ejs` `<3.1.7` | GHSA (template injection) | `nuxt > @nuxt/webpack > webpack-bundle-analyzer > ejs` — the bundle-size analyser, a dev/build tool. Not shipped, not runtime-reachable. |

*(Both criticals resolve to the same `ejs`-via-`webpack-bundle-analyzer` path.)*

### High (representative — all build/dev toolchain, ACCEPTED)

`braces` (webpack>micromatch), `defu` (@nuxt/static), `html-minifier` (@nuxt/generator),
`ip` (@nuxt/server), `nth-check` (cssnano>svgo), `parse-git-config` (@nuxt/telemetry),
`serialize-javascript` (@nuxt/builder), `tmp` (@nuxt/telemetry>inquirer),
`webpack-dev-middleware` (@nuxt/webpack). Each sits inside the Nuxt 2 build/dev chain and
does not reach the deployed runtime.

**Runtime (production) dependencies reviewed:** the direct runtime stack — `restify`,
`mysql2`, `isomorphic-dompurify` — carries only the transitive build-tool findings above
plus a moderate `uuid` bounds-check inside `restify` (patched only in `uuid>=11`, which
needs a restify major = blocked by the lock). No **runtime-exploitable** critical was
identified.

---

## 3. ⚠️ Open conflict — the pre-commit audit gate now fails

`CLAUDE.md` §Enforcement defines the blocking pre-commit gate as
`npm audit --audit-level=critical`. That threshold was chosen deliberately so the
**unavoidable Nuxt 2 build-tool _highs_** would not block every commit.

**As of 2026-07-01 there are now build-tool _criticals_ (`ejs`), so that gate would block
every commit** — and the finding cannot be fixed without a semver-major bump that breaks the
Node 14.15 / Nuxt 2 lock (forbidden by the one-directional rule). npm 6 cannot scope the
audit to runtime deps (see caveat above).

This is **not** something to resolve by relaxing the spec. It needs a team decision on how to
scope the gate (e.g. an explicit `ejs` allow-list entry, a runtime-only audit tool that works
on npm 6, or upgrading the local npm used only for auditing). Logged in `design/ACTIONS.md`
as **P1-AUDIT-GATE**. Until resolved, the audit portion of the pre-commit gate is **not**
installed (installing it would lock the team out of committing).

---

## 4. Review cadence

Re-run `npm audit` at the start of each working session; reconcile this file and
`design/ACTIONS.md`. Never run `npm audit fix --force`.
