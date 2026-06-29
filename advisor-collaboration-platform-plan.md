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
- **Co-creation:** Restify routes orchestrate the Drive / Docs / Sheets / Slides APIs (clone,
  scope access, organise per space, clone-and-share-to-client). Live editing is Google-native.
- **Assets:** Google-hosted; MySQL tracks file references, lineage, IP classification, and
  access scope — it does not store the files.
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
- **Phase 4 — Co-creation.** Google Drive orchestration: clone master templates into a space,
  grant members co-edit access, browse the template library, clone-and-share to clients; track
  **lineage** and **IP classification** (§6); per-space IP terms.
- **Phase 5 — Marketplace / licensing.** List Tier-4 group-owned IP; off-platform, record-only
  transactions; buyer↔source **purchase link** for ongoing updates; transaction analytics.
- **Phase 6 — Hardening & governance.** Audit/compliance reporting, advanced permissions,
  notifications, moderation/admin tooling, security review; settle the deferred UX-feel defaults
  (§12).

---

## 12. Open questions & deferred decisions

**Open — to resolve before/within Phase 1:**
1. **Advisory.com integration mechanics:** its stack, and how the session is inherited (shared
   cookie/JWT, embedded module, OAuth)?
2. **Service lines & specialty tags:** do these exist in Advisory.com already, or are they new
   here? (Central to discovery and to specialty groups.)
3. **Firm vs branch:** does the existing **branch** field already represent firm/office, and how
   does it map to the role hierarchy / multi-firm model? (Current members — accountants + small
   business owners — may be light on multi-firm structure today.)
4. **Google environment:** is the template library in a Workspace **Shared Drive** owned by
   Advisory.com? Do advisors act under their own Google identity or a service account? (Drives
   the permission/cloning model.)
5. **Client sharing:** is a client a Google user (Drive share) or do they get a link/PDF export?
   Are clients ever users of this platform, or always external?
6. **Net-new group IP from scratch** is covered as Tier 4 (group-owned) — confirm no edge cases
   (e.g. a member contributing pre-existing personal IP into a group).

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

---

## 14. Parking lot

_Additional ideas to be expanded as they come._
