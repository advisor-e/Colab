# SECURITY AUDIT NOTES — accepted risk register

> The record mandated by `CLAUDE.md` (§Dependency and Version Governance, §Security).
> `CLAUDE.md` references this file as the place where `npm audit` risk is **formally
> accepted and reviewed** — it had been referenced but never created, so this file closes
> that gap. **Nothing here is silently swallowed:** every high/critical finding is listed,
> classified, and given a reason. Findings that need action are also logged in
> `design/ACTIONS.md`.
>
> **Created:** 2026-07-01 · **Corrected 2026-07-02** — the toolchain first recorded here
> (npm 6.14.8 / Node 14.15.0) was **not** what the local machine runs. See the correction box
> at the top of §2.

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

> **⚠️ CORRECTION (2026-07-02) — the local toolchain stated in this section was wrong.**
> This file originally recorded the local environment as *npm 6.14.8 / Node 14.15.0*. In
> fact the **developer machine runs Node 20.20.2 / npm 10.8.2** (`.nvmrc` pins `20`). The
> **Node-14.15 lock is still enforced where it ships:** CI (`.github/workflows/ci.yml`)
> installs Node 14.15 and runs lint + test + build on it, and `package-lock.json` is
> `lockfileVersion 1` — so the *deployed* artifact is proven on the locked runtime. But the
> *local* npm-6 claims below (including the npm-6 `--production` caveat) **do not describe
> this machine.** The drift is logged as **P1-NODE-ENV** in `design/ACTIONS.md`;
> reconciliation sets `.nvmrc` → 14.15.
>
> **npm 10 audit snapshot (2026-07-02):** 3 critical · 35 high · 90 moderate · 20 low ·
> 148 total. (npm 10 counts per package; npm 6 counted per dependency path, which is why the
> 2026-07-01 totals below look larger — they are not directly comparable.) The single root
> critical is still **`ejs <3.1.7` (GHSA-phwq-j96m-2c2q)** pulled in via
> `webpack-bundle-analyzer` — build-time only, classification unchanged.

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
>
> *(2026-07-02: this caveat is moot for **local** runs — the machine is actually npm 10, where
> `--omit=dev` works. But it does not help anyway: `nuxt` is a **production** dependency, so a
> runtime-scoped audit still reports the `webpack-bundle-analyzer → ejs` chain. Confirmed by
> `npm audit --omit=dev` on 2026-07-02 → still 3 criticals. See P1-NODE-ENV.)*

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

## 3. ✅ RESOLVED (2026-07-02) — the pre-commit audit gate (allow-listed criticals)

`CLAUDE.md` §Enforcement defines the blocking pre-commit gate as
`npm audit --audit-level=critical`. That threshold was chosen deliberately so the
**unavoidable Nuxt 2 build-tool _highs_** would not block every commit.

**As of 2026-07-01 there are now build-tool _criticals_ (`ejs`), so that gate would block
every commit** — and the finding cannot be fixed without a semver-major bump that breaks the
Node 14.15 / Nuxt 2 lock (forbidden by the one-directional rule). Runtime-scoping the audit
does not help either — `nuxt` is a production dependency, so the `ejs` chain is reported even
by `npm audit --omit=dev` (verified 2026-07-02; the earlier "npm 6 cannot scope" wording is
superseded — local is npm 10, see the §2 correction box and P1-NODE-ENV).

**Resolved without relaxing the spec (2026-07-02).** The gate is now implemented as
`scripts/audit-gate.js`, wired into `.husky/pre-commit` and CI (`npm run audit:gate`). It blocks
on any **critical** finding **except** a short, explicit **allow-list** of reviewed
build-time-only advisories, and **reports every high for review without blocking** (unchanged
policy). The allow-list currently holds exactly one entry — `ejs` / `GHSA-phwq-j96m-2c2q` (the
build-time bundle-analyzer chain above). Matching requires **both** the GHSA id and the module,
so a *different* future critical — even in the same package — still blocks until a human reviews
it; the gate also warns if an allow-list entry stops matching, so it can't rot. The pure decision
logic is unit-tested (`tests/auditGate.test.js`, 15 cases). Adding an allow-list entry is a
deliberate, auditable act and must be mirrored in this file. This is the sanctioned `ejs`
allow-list resolution — **not** a spec relaxation (the one-directional rule governs stack
versions, not the audit threshold). See `design/ACTIONS.md` **P1-AUDIT-GATE** (closed).

---

## 4. Review cadence

Re-run `npm audit` at the start of each working session; reconcile this file and
`design/ACTIONS.md`. Never run `npm audit fix --force`.
