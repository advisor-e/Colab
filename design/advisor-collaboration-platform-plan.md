# Advisor Collaboration Platform — Development Plan (v1.0)

> **Status:** requirements consolidated — ready for Phase 0.
> **Last updated:** 2026-06-30
> A members-only network where advisors find each other across countries, service lines, and
> firms, connect, form specialty groups, and co-develop templates/tools/IP — built as a
> standalone sibling of the existing apps and paired to Advisory.com.

---

## Contents

1. [Vision](#1-vision)
2. [The three-app landscape & integration](#2-the-three-app-landscape--integration)
3. [Confirmed decisions (at a glance)](#3-confirmed-decisions-at-a-glance)
4. [Capability map — the six pillars](#4-capability-map--the-six-pillars)
5. [Role hierarchy & content cascade](#5-role-hierarchy--content-cascade)
6. [IP & ownership model](#6-ip--ownership-model)
7. [Marketplace model](#7-marketplace-model)
8. [Cross-organisation engagement policy](#8-cross-organisation-engagement-policy)
9. [Domain model](#9-domain-model)
10. [Architecture (Stack Constitution)](#10-architecture-stack-constitution)
11. [Phased roadmap](#11-phased-roadmap)
12. [Open questions & deferred decisions](#12-open-questions--deferred-decisions)
13. [Decision log](#13-decision-log)
14. [Parking lot](#14-parking-lot)

---

## 1. Vision

A members-only network where advisors in an advisory network can **find each other** (across
countries, service lines, and firms — same firm or different), **connect**, and **collaborate
privately** on the development of templates, tools, and IP. Communities of interest
(**specialty groups**, e.g. "financial modelling for seafood companies") can form, advertise
themselves, and recruit members. Groups that build their own IP can **license or sell** it to
the rest of the network.

**Target professions (design for):** accountants, financial planners, insurance advisers,
bankers, business coaches, lawyers.
**Current membership (build/pilot for first):** practising **accountants and small business
owners**.

---

## 2. The three-app landscape & integration

Three apps, all paired to the same master; this project is the new one and does **not** modify
the others.

| App | Role |
|---|---|
| **Advisory.com Network** | The **master app / system of record** for advisor identity & profiles. |
| **Virt Advisor** | An existing, near-complete app paired to Advisory.com. *Separate production codebase — out of scope; not modified by this project.* |
| **Collaboration Platform** *(this project)* | A **brand-new, standalone repo**, a sibling of Virt Advisor, paired to Advisory.com independently, built to the same Stack Constitution. |

The two sibling apps both authenticate against / draw identity from Advisory.com; they are not
nested in each other.

**Advisory.com is the profile system of record.** It already captures: adviser name, business
title, professional bio, LinkedIn URL, phone, country, state, city/town, branch, time zone.

**Integration implications:**
- **Inherit auth** — advisors already log in to Advisory.com; this platform reuses that
  session. No new login is built.
- **Consume, don't duplicate, the profile** (via API / SSO / shared user store — mechanism
  TBD, see §12).
- This platform **adds** collaboration-specific data on top: service lines, expertise/specialty
  tags, interest profiles, connections, group memberships, spaces, assets.
- Discovery search spans **both** existing profile fields (country, state, city, branch, title)
  **and** the new collaboration fields.

---

## 3. Confirmed decisions (at a glance)

| Dimension | Decision |
|-----------|----------|
| **Build approach** | Mostly custom build; orchestrate proven services (Google) rather than rebuild them. |
| **Codebase** | Separate, standalone repo — sibling of Virt Advisor, not nested in it. |
| **Stack** | Advisor-e **Stack Constitution**: Nuxt 2 / Vue 2 (Options API, Pug, Buefy) frontend; Node 14.15 + Restify + raw MySQL (`mysql2`) backend; JavaScript only; all third-party calls backend-only. |
| **Auth** | Inherited from Advisory.com — no new login. |
| **Document stack** | Google Workspace (Sheets/Slides/Docs/PDFs) — **orchestrate, don't build an editor**. |
| **Tenancy** | Multi-firm, one shared network, governed by a vertical role hierarchy (§5). |
| **Trust / IP** | High — co-created IP & confidentiality are critical; ownership follows a 4-tier model (§6). |
| **Marketplace** | Groups can license/sell group-owned IP; Advisory hosts, takes no fee, records the transaction only (§7). |

### Scope boundary — what we BUILD vs what we REUSE

**This platform builds the PEOPLE layer — and that is the core job:** how advisers are
**identified**, **find each other**, **reach out**, **message**, and **invite** one another into
groups and collaboration. Everything else is leverage.

**Already done in Advisory — we REUSE / hand off to, never rebuild:**
- Authentication & membership.
- Advisor profiles (system of record).
- The **entire Google document cascade** — per-level accounts, clone-down, translation,
  upstream-update → notify → **accept/decline**, **lock-to-prevent-override**, and archive
  recovery.

So co-creation of templates (pillar 5) happens inside **Advisory's existing Google tooling**;
this app's job is to get the right **people** into a group and talking, then hand off into that
tooling. Don't re-plan or re-build the document mechanics.

---

## 4. Capability map — the six pillars

| # | Pillar | What it does |
|---|--------|--------------|
| 1 | **Discovery (two-sided)** | Advisors advertise their strengths/interests AND search to find groups & people — recruitment flows both ways. |
| 2 | **Connection** | 1:1 connect request → mutual accept. |
| 3 | **Groups (SIGs)** | Specialty groups that advertise themselves and accept join requests. |
| 4 | **Collaboration spaces** | Private rooms — chat + shared work — for a connection or a group. |
| 5 | **Co-creation** | Jointly edit Google-hosted templates in a space; clone, then clone-and-share finished versions with clients. |
| 6 | **Marketplace / licensing** | A group can sell/license its group-owned IP to other network members (§7). |

**Key structural point:** a **group advertises and recruits**; a **space is where the work
happens**. A group owns a space once formed; a 1:1 connection also produces a space — same room
primitive, two ways in.

**Two-sided discovery.** Either side can initiate:
- **Advisor advertises themselves** — records the topics, industries, and projects they're
  interested in, plus their strengths. If they set themselves **available**, groups can
  approach *them*.
- **Advisor searches outward** — finds existing groups, sees who else they could reach out to,
  and identifies **who within a group** to contact to start or join a collaboration.

### Engagement & messaging model (confirmed 2026-06-30) — the core of this app

**Cold outreach is ALLOWED — that is the point of the network.** Advisers and groups can reach
out to people they don't yet know, because finding people *open to engage* is core value. The
safeguard is **purpose, not permission**: the first message must explain **why** you're reaching
out (no "must connect first" gate, no cold-spam either).

*Example of the intended pattern:* "Hi Bob — we're developing a model for the seafood industry.
We noticed your significant experience in capital raising, which many of our clients struggle
with. Would you be open to collaborating with us?"

**How it works:**
- **First contact = a purposeful outreach.** The composer **prompts for *why you* + *the ask*
  ** (guided by the example structure) so blank/spammy DMs aren't the norm.
- **Recipient stays in control** — they can **respond** (opens an ongoing thread), **dismiss /
  ignore**, or **block & report**.
- Outreach can carry a **group/project context** (e.g. "we're building a seafood model") so the
  recipient has something concrete to consider joining.

**Everything is by invitation + consent — NO top-down placement.** Even a manager cannot drop
someone into a group without their acceptance; placing an unwilling member won't make them
engage, so membership is *always* invite → accept.

**Invitation / request types** (the first-contact carriers):
- adviser → adviser (connect / collaborate)
- group → adviser (invite to join)
- adviser → group (request to join)
- manager (e.g. Firm Manager) → adviser(s): may invite/request **multiple** people to join a
  group — but **each invitee must still accept** (consent required; the per-recipient guardrails
  still apply).

**Anti-spam guardrails (recommended defaults — confirm):**
- **One pending outreach per recipient** — no repeat-messaging someone who hasn't replied; a
  dismiss / no-response means no further cold messages from that sender.
- **Rate limits** on outbound cold outreach (no bulk blasting).
- **Respect the availability flag** — if someone marks themselves unavailable, cold outreach is
  limited or off.
- **The §8 cross-org policy is the outer gate** — it decides whether you can reach outside your
  org at all, *before* any of this applies.

### Cross-cutting must-haves (confirmed 2026-06-30): multi-language & voice

Both are **required from the outset**, and both have **proven, reusable implementations in the
sibling Virt Advisor app**:

- **Multi-language (i18n) + live chat translation.** The UI is multi-language from day one
  (reuse Virt Advisor's **vue-i18n + 8 locales + `localeMixin`**). Because members span
  countries/languages, **messages and chat are translatable**: store each message in its
  **original language** and offer **per-reader translation** — a manual toggle or auto-translate
  to the reader's locale. Reuse Virt Advisor's **Node-14-safe backend translate route**
  (MyMemory API via the `https` module, exposed as a Restify route).
- **Voice input (speech-to-text).** Users can **talk instead of type** anywhere there's a text
  field (profile, search, outreach, chat) to speed things up. Reuse Virt Advisor's
  **`speechMixin`** (browser speech API, behind a mixin, SSR-safe).

Both honour the Stack Constitution (translation = a Restify route; speech = browser API behind a
mixin). They appear in the screen sketches (§ separate sketches file) as a 🌐 language control
and a 🎤 mic on text inputs.

---

## 5. Role hierarchy & content cascade

A **vertical hierarchy** governs who manages whom and how master content cascades down,
localised per country.

| Tier | Role | Example | Scope / job |
|---|---|---|---|
| 1 | **Mentor** | Mike (the creator) | Authors the **master** templates & documents; top of the tree. |
| 2 | **Global Manager** + **Global Coach** | BDO International | Adopts the app; **manages all countries**. |
| 3 | **Group Manager** | BDO Germany | Manages **one country**; **language/localisation happens here**. |
| → | *(clone to firms)* | individual German firms | Localised master content clones down to each firm. |
| 4 | **Firm Manager** | partner / associate director | Manages **just that firm**. |
| 5 | **Advisor** | a practising adviser | Uses the tools/templates with clients. |
| 6 | **Client** | the adviser's end client | Receives cloned/finished outputs. |

**The cascade:** Mentor authors masters → Global Manager oversees all countries → Group Manager
localises & manages a country → clones down to firms → Firm Manager tailors for the firm →
Advisor delivers to Client. Each tier customises **within its own scope**; localisation happens
at the country (Group) tier. *(Same shape as the Virt Advisor "distinctions cascade," extended
with Global and Group/country tiers.)*

The **vertical** hierarchy is about management & content cascade; the **horizontal** pillars
(§4) are about advisors collaborating across firms/countries. Whether the two cross is governed
by the cross-org policy in §8.

### Document cascade in Google — EXISTING Advisory capability (OUT OF SCOPE)

> **⚠️ This already exists and works in the current Advisory app. This project does NOT build,
> rebuild, or modify it.** Recorded only as context the collaboration platform hands off into.

How it already works in Advisory (for reference):
- One central Advisory account holds the Mentor masters; documents cascade down into **per-level
  Google accounts** (group → firm → adviser → client), each with its own archived, recoverable set.
- An upstream update **pushes down**; the lower level gets a **notification** and can **accept or
  decline** it.
- An adviser/firm can **LOCK** a perfected template so no upstream update can override it.
- Any superseded version is **recoverable from the archive**.

➡️ **Implication for this build:** templating, cloning, cascade, translation, versioning,
lock/override-protection and recovery are **Advisory's job, already done**. When a group formed
in this app wants to co-develop a template, they use **Advisory's existing Google tooling**. This
platform's scope is the **people layer** — see the Scope boundary in §3.

---

## 6. IP & ownership model

Ownership of templates/tools follows **four tiers**, decided by an asset's origin and what was
done to it. The tier is **derived from the asset's lineage** (clone-from) + edit history — which
is exactly why the platform tracks provenance.

| Tier | What it covers | Who owns it |
|---|---|---|
| 1. **Advisory-owned (base)** | Any template existing **in its current form within Advisory** | **Advisory** retains full IP. |
| 2. **Protected / locked frameworks** | Specific named proprietary frameworks | **Advisory only — locked, non-derivable.** Not available for co-development or shared rights. *(Ties to the Stack Constitution's "platform-locked IP".)* |
| 3. **Co-developed (shared)** | An Advisory template a group **modifies** | **Shared rights** — Advisory + the co-developers. |
| 4. **Group-owned (net-new / external-origin)** | Material built **from scratch**, or brought in from **outside Advisory** | **The group owns it.** Advisory holds a **hosting right only**; the group **may market/license** it (§7). |

**System implications:**
- Each **Asset** carries an **IP classification** derived from lineage + edit history.
- **Protected frameworks (Tier 2) need an explicit "locked / non-derivable" flag** so editing
  can't quietly downgrade them into shared or group IP.
- Per-space **terms acceptance** records which tier applies before work begins; the **audit
  log** records who modified what (the evidence for a shared-rights claim).
- **Hosting right (Tier 4):** placing group-owned material on the network grants Advisory a
  **non-exclusive hosting/distribution right** so it can host and facilitate a sale without
  infringing — ownership stays with the group.

---

## 7. Marketplace model

- **No Advisory fee.** Advisory takes **no commission or revenue-share**; it's the neutral
  environment where members find each other and transact.
- **Payment is OFF-platform, record-only.** Advisory is **not involved in the transaction** —
  members transact directly. The platform **only records that a deal occurred** (for
  analytics). No money flows through the app → no payment-processor / PCI / financial-services
  burden, and no refunds/disputes/escrow logic to build (deliberately light scope).
- **Buyer's licence = unlimited-client usage.** A buyer may use the model with **as many of
  their own clients as they like** (buyer-firm scope, perpetual use).
- **Ownership unchanged.** The creating group keeps ownership; the buyer gets **usage, not
  ownership** — and **cannot resell or redistribute** it.
- **Buyers receive ongoing updates.** A purchase is not a frozen snapshot — when the group
  publishes an update, buyers get it. *Build implication:* a purchase is a **tracked link**
  between buyer and source tool (so updates propagate / the buyer is notified), not a one-off
  clone.
- **(Optional, later)** reuse the transaction/usage data to surface a "most-used / proven
  tools" signal (and perhaps ratings) in Discovery.

---

## 8. Cross-organisation engagement policy

Whether an organisation's members may collaborate **outside** their own organisation is a
**strategic control held at Global Manager and Group (country) Manager level** — they own their
membership and carry the IP risk.

- **Allow** → members can connect, form/join groups, and collaborate across other firms,
  groups, and countries.
- **Block** → members are sealed to their own organisation.

**Design rules:**
- **Both-sides consent** — a cross-org interaction needs **both** organisations to permit it; a
  block on either side wins (mirrors the mutual-accept connection model).
- **Global sets the ceiling; Group can only tighten** — a country policy may be equal or more
  restrictive than Global's, never more open.
- **The toggle gates ALL cross-org reach** — discovery, connection, groups, spaces,
  co-creation, **and** marketplace — so a "closed" org is genuinely sealed.
- **(Optional middle setting)** "discoverable but join-by-approval" — members are findable
  externally, but a manager approves actual collaboration.
- **Default posture (open vs closed) is DEFERRED** — see §12 (D1). Build it as a **config flip**
  so the default is a switch, not a rebuild.

---

## 9. Domain model

- **Advisor** — *profile owned by Advisory.com* (name, title, bio, LinkedIn, phone, country,
  state, city/town, branch, time zone); extended here with firm link, service lines, expertise
  tags, role, vetting status.
- **Advisor Interest Profile** *(new)* — self-recorded **topics, industries, projects, and
  strengths** advertised to the network, plus an **availability flag** (may groups approach
  them?).
- **Firm** — organisation an advisor belongs to; a node in the role hierarchy (§5).
- **Org unit / hierarchy node** — Global / Group(country) / Firm, carrying the cross-org
  engagement policy (§8) and the content-cascade state.
- **Role** — Mentor / Global Manager / Global Coach / Group Manager / Firm Manager / Advisor /
  Client (§5).
- **Connection** — mutual 1:1 link between two advisors.
- **Group (SIG)** — name, specialty/topic tags, visibility, join policy. **Creatable by any
  role except Client**; membership is opt-in.
- **Membership** — request → approved → member; roles (owner / admin / member); used by groups
  and spaces.
- **Collaboration Space** — the room; one per connection or per group; holds chat + content.
- **Asset** — a **reference to a Google file** (Drive file ID) with state (master → working
  clone → client copy), owning space, access scope, **lineage** (clone-from), and **IP
  classification** (§6). Co-editing/versioning is Google-native.
- **Marketplace listing / licence** — a group's offer of a Tier-4 asset; a **purchase record**
  links buyer ↔ source tool for ongoing updates (§7).
- **IP / Governance layer** — terms-acceptance gates, per-space ownership terms, the
  "locked / non-derivable" flag, and the audit log.

---

## 10. Architecture (Stack Constitution)

This platform conforms to the existing Advisor-e / Virt Advisor **Stack Constitution**. The
*patterns* (relational membership model, Google orchestration rather than a custom editor,
inherited auth) are stable; only the named technologies are fixed by the Constitution.

**Mandated two-part architecture (strict boundary):**
- **Frontend — Nuxt 2 (port 3000):** Vue 2 Options API, Pug templates, Buefy + Bulma, vue-i18n
  ^8, JavaScript only. UI / routing / state display **only** — no business logic, DB, or
  third-party APIs.
- **Backend — Node 14.15 + Restify (port 4000), CommonJS:** all business logic, **raw MySQL via
  `mysql2`** (no ORM), and **all** third-party integrations (incl. **all Google API calls**).
  Every capability is a Restify route.
- Frontend ↔ backend **exclusively over HTTP** (`API_BASE_URL` only).

**How the pillars map:**
- **Identity:** inherit the Advisory.com session; firm/org stays a first-class permission scope.
- **Data:** relationship / membership / permission tables in MySQL, raw SQL on the backend.
- **Permissions:** RBAC scoped by org-hierarchy + group/space membership, enforced on the
  backend; every asset action maps to a **Google Drive permission grant/revoke** via a Restify
  route (never from Nuxt). The §8 cross-org toggle is evaluated on every cross-org action.
- **Co-creation:** **out of scope to build** — the document cascade/templating already exists in
  Advisory (§5). This app simply **hands off** a formed group into Advisory's existing Google
  tooling. At most, the collaboration platform stores a **link/reference** to the relevant doc(s)
  so a space can point at them; it does not orchestrate the Drive APIs or the cascade.
- **Assets (light):** the platform may hold **references** (Drive links) a group is working on,
  for context inside a space — not file storage, not versioning, not cascade (all Advisory's).
- **Cross-cutting (High-IP):** audit logging on asset access, terms gating before space entry,
  encryption in transit + at rest, explicit per-space IP terms; legal/IP terms run as a parallel
  workstream.

> **✅ Google-on-Node-14 — largely de-risked.** The sibling Virt Advisor app already runs Google
> Drive integration on **`googleapis@123.0.0` under Node 14.15**. Reuse that proven pin rather
> than building REST-direct. Phase 0 just confirms it covers the Docs/Sheets/Slides scopes we
> need; if a newer version is ever required, fall back to the OpenAI-style REST-direct pattern
> and log it as a P1.

---

## 11. Phased roadmap

Each phase is independently valuable; the app is demoable from Phase 1.

- **Phase 0 — Foundations.** Stand up the standalone repo with its own `CLAUDE.md` (seeded from
  the Stack Constitution + the working-style/when-blocked rules); confirm session inheritance
  from Advisory.com; confirm the `googleapis@123.0.0` Google approach; define the RBAC/role
  model (§5) and IP/data-governance terms.
- **Phase 1 — Directory + Connections.** Advisor profiles (consumed from Advisory.com) +
  Interest Profile and availability; firm/org scoping; two-sided search/filter; 1:1 connect →
  accept. *Usable and demoable on its own.*
- **Phase 2 — Spaces + Chat.** Private space per connection; real-time chat; file
  upload/download with access scoping; audit-logging foundation.
- **Phase 3 — Groups / SIGs + cross-org controls.** Group creation (any role except Client),
  discoverable group directory, topic tags, join-request → approval workflow, group roles and
  group space; the **§8 cross-org engagement toggle** (Global/Group level) built as a config
  flip.
- **Phase 4 — Co-creation hand-off (light).** **Not** rebuilding documents — when a group is
  ready to build a template, hand off into **Advisory's existing Google tooling/cascade** (§5).
  At most: store a doc **reference** in the space and apply per-space IP terms (§6).
- **Phase 5 — Marketplace / licensing.** List Tier-4 group-owned IP; off-platform, record-only
  transactions; buyer↔source **purchase link** for ongoing updates; transaction analytics.
- **Phase 6 — Hardening & governance.** Audit/compliance reporting, advanced permissions,
  notifications, moderation/admin tooling, security review; settle the deferred UX-feel defaults
  (§12).

---

## 12. Open questions & deferred decisions

**Open — to resolve before/within Phase 1:**
1. ~~Advisory.com integration mechanics~~ — **RESOLVED (2026-07-01).** Session inherited via a
   **shared cookie/token** across a common parent domain (reuse Virt Advisor's pattern). The
   cookie/token is **validated on this app's Restify backend**, never trusted on the frontend, then
   used to fetch the profile. *(Matches the implemented auth seam — `config/integration.js → AUTH`
   + `server/middleware/auth.js`. Remaining detail — exact JWT claim names + HS256/RS256 — tracked
   in `HANDOVER.md` §8; does not block.)*
2. ~~Service lines & specialty tags~~ — **RESOLVED (2026-07-01).** **New — not in Advisory.com.**
   This app owns service lines + skills/specialty/interest tags in its own MySQL tables; the master
   profile is untouched. `service_line` is flagged for **possible future promotion** to the master
   profile — see `HANDOVER.md` §8.
3. ~~Firm vs branch~~ — **RESOLVED (2026-07-01).** **`branch` = the firm/office** → maps directly
   to the **Firm** tier (§5). Bonus: **`country-address` → the Group/country tier**, so much of the
   hierarchy derives from existing master data.
4. ~~Google environment / cascade~~ — **RESOLVED + OUT OF SCOPE (2026-06-30).** The per-level
   Google accounts, clone-down, translation, upstream-update → **notify → accept/decline**,
   **lock-to-prevent-override**, and archive recovery **already exist and work in Advisory**.
   This app does not build any of it; it hands off into it (§5). No further questions for this
   build.
6. **Net-new group IP from scratch** is covered as Tier 4 (group-owned) — confirm no edge cases
   (e.g. a member contributing pre-existing personal IP into a group).
7. **What counts as "one organisation" for the cross-org policy (§8)?** Since `branch` =
   firm/office, a multi-office firm appears as several branches. Confirm whether the §8 toggle
   seals at the individual office (branch/Firm tier), the whole firm, or the country Group.
   *(Raised 2026-07-01; a "see-it-live" refinement, not blocking.)*

**Deferred — decide once we can see the app in action:**
- **D1 · Default cross-org posture (open vs closed).** A UX-feel call about what a user is first
  greeted with. Recommendation on record: lean **closed/opt-in** for a high-IP network. Build as
  a **config flip** (both paths switchable) — not a rebuild.
- **D2 · New-group approval/visibility default.** Whether a brand-new group is live immediately
  (assumed) or unlisted/pending a manager's OK. Likely also a "see-it-live" feel call.

---

## 13. Decision log

| Date | Decision |
|---|---|
| 2026-06-30 | Mostly custom build; orchestrate Google rather than build an editor. |
| 2026-06-30 | Co-creation output = documents/templates + files/knowledge assets (no code IDE). |
| 2026-06-30 | Multi-firm, one network; governed by a 6-tier role hierarchy. |
| 2026-06-30 | High-IP posture; 4-tier ownership model adopted. |
| 2026-06-30 | This is a **separate standalone repo**, sibling of Virt Advisor, not nested. |
| 2026-06-30 | Conform to the Advisor-e Stack Constitution (Nuxt 2 / Restify / MySQL / Node 14.15). |
| 2026-06-30 | Auth inherited from Advisory.com; Advisory.com is the profile system of record. |
| 2026-06-30 | Group creation open to every role **except Client**; membership opt-in. |
| 2026-06-30 | Marketplace: no Advisory fee; **off-platform, record-only**; buyer gets unlimited-client usage (no resale); **ongoing updates** included. |
| 2026-06-30 | Cross-org engagement controlled at Global/Group level; both-sides consent; Global sets ceiling. Default posture **deferred** (D1). |
| 2026-06-30 | `googleapis@123.0.0` confirmed as the Node-14-safe Google pin to reuse. |
| 2026-06-30 | Document cascade is **existing Advisory functionality — OUT OF SCOPE**; this app builds only the people layer. |
| 2026-06-30 | **Cold outreach ALLOWED** — purposeful (must state why), recipient-in-control (respond/dismiss/block), with anti-spam guardrails. No "connect-first" gate. |
| 2026-06-30 | **All membership is by invitation + consent — no top-down placement.** Managers may invite many, but every invitee must accept. |
| 2026-06-30 | Google model = **cascade of per-level accounts** (central Advisory → group → firm → advisor → client), each with its own archived/recoverable doc set; advisers edit their own clone. Orchestration spans many accounts, not one service account. |
| 2026-07-01 | **Q1 resolved** — Advisory.com session inherited via a **shared cookie/token** (same parent domain); cookie/token validated on this app's Restify backend, never trusted on the frontend. |
| 2026-07-01 | **Q2 resolved** — **service lines + skills/specialty/interest tags are NEW**, owned by this app (own MySQL tables); master untouched. `service_line` a candidate for future promotion to the master (see `HANDOVER.md` §8). |
| 2026-07-01 | **Q3 resolved** — **`branch` = firm/office** → maps to the Firm tier; **`country-address` → Group/country tier**. Hierarchy largely derivable from existing master data. |

---

## 14. Parking lot

_Additional ideas to be expanded as they come._
