# Advisor Collaboration Platform — UX Sketches (v1)

> Low-fidelity wireframes of the **people layer** — the core of this app. These show *structure
> and flow*, not final visual design. Companion to `advisor-collaboration-platform-plan.md`.
> **Last updated:** 2026-06-30

**Two cross-cutting features appear on every relevant screen:**
- **🎤 Voice input** — talk instead of type, on any text field (reuse Virt Advisor `speechMixin`).
- **🌐 Language / translate** — multi-language UI + live chat translation (reuse Virt Advisor
  vue-i18n + the Node-14-safe translate route).

---

## 1 · My Profile (the "identifier") — what makes you findable

```
┌───────────────────────────────────────────────────────────────┐
│  Advisor-e Collaborate            🌐 EN ▾    🔔 3    ◍ Mike ▾  │
├───────────────────────────────────────────────────────────────┤
│  My Profile                                                     │
│  ┌── From Advisory (read-only) ─────────────────────────────┐  │
│  │ Mike Barnes · Partner · Advisor-e — Munich, DE           │  │
│  │ 🔗 linkedin/…   ☎ +49…   🕓 CET                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Availability    ●────  Open to collaborate ▾                   │
│  My strengths    [capital raising ✕][tax ✕]              [ + ]  │
│  Industries      [seafood ✕][hospitality ✕]             [ + ]  │
│  Topics/projects [M&A ✕][valuations ✕]                  [ + ]  │
│                                                                 │
│  About me (advertised to the network)                  🎤  🌐  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 20 yrs helping owner-managed firms with growth & exit…    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                            [ Save profile ]     │
└───────────────────────────────────────────────────────────────┘
```
*Separates Advisory's read-only profile data from the editable "advertised" identity (interests,
industries, strengths, availability) that powers discovery.*

---

## 2 · Discover — two-sided search (people AND groups)

```
┌───────────────────────────────────────────────────────────────┐
│  Discover                 ( People )   ( Groups )      🌐 EN ▾ │
├───────────────────────────────────────────────────────────────┤
│  🔎 [ seafood capital raising              ] 🎤   [ Search ]   │
│  Country ▾   Service line ▾   Specialty ▾   ☑ Available only   │
│                                                                 │
│  ┌── GROUP ─────────────────────────────────────────────────┐  │
│  │ 🐟 Seafood Financial Modelling     · 5 firms · 12 people │  │
│  │ Building a valuation model for seafood processors.       │  │
│  │ seafood · valuation · capital raising                    │  │
│  │                          [ View ]    [ Request to join ] │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌── PERSON ────────────────────────────────────────────────┐  │
│  │ ◍ Bob Lindt · Partner · Zürich, CH        ● Available    │  │
│  │ Strengths: capital raising, debt structuring             │  │
│  │                          [ View ]    [ Reach out ]       │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## 3 · Group page (the "advert") — how a group recruits

```
┌───────────────────────────────────────────────────────────────┐
│  ‹ Back to Discover                                   🌐 EN ▾ │
├───────────────────────────────────────────────────────────────┤
│  🐟  Seafood Financial Modelling                                │
│  by Anna R. (BDO DE) · 5 firms · 12 members · Listed            │
│                                                                 │
│  What we're doing                                               │
│  A shared valuation + capital-raising model for seafood         │
│  processors. We'd love capital-raising experience.              │
│                                                                 │
│  Specialty:  seafood · valuation · capital raising              │
│  Members:    ◍ ◍ ◍ ◍ ◍  +7                                      │
│                                                                 │
│        [ Request to join ]        [ Message the group ]         │
└───────────────────────────────────────────────────────────────┘
```

---

## 4 · Reach out — the *purposeful* cold-outreach composer

```
┌───────────────────────────────────────────────────────────────┐
│  Reach out to Bob Lindt                                    ✕   │
├───────────────────────────────────────────────────────────────┤
│  ⓘ A good first message says WHY you're reaching out.          │
│                                                                 │
│  Why them / context                                    🎤  🌐  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ We're building a seafood valuation model and saw your     │  │
│  │ capital-raising experience…                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  The ask                                               🎤  🌐  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Would you be open to a short chat about collaborating?    │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Attach:  ◉ This group: Seafood Modelling   ◯ Just connect     │
│                                                                 │
│  ⚠ One outreach per person — make it genuine.   [ Send ▸ ]     │
└───────────────────────────────────────────────────────────────┘
```
*Enforces "purpose, not permission" — a reason is prompted; the group context (e.g. the seafood
project) can be attached so the recipient has something concrete to consider.*

---

## 5 · Messages — requests + chat with live translation

```
┌───────────────────────────────────────────────────────────────┐
│  Messages                                             🌐 EN ▾ │
├───────────────┬───────────────────────────────────────────────┤
│ REQUESTS (2)  │  Bob Lindt · Zürich          🌐 Auto-translate ●│
│ ▸ Bob Lindt   │ ───────────────────────────────────────────── │
│   Anna R.     │  Bob:  Gerne! Wann passt es Ihnen?            │
│ ───────────   │        ⤷ EN “Happy to! When suits you?”       │
│ CHATS         │                                               │
│ ▸ Seafood grp │              Me: Thursday 3pm CET works.  ✓✓  │
│   Anna R.     │ ───────────────────────────────────────────── │
│               │  [ Type a message…             ] 🎤   [ Send ] │
│ [Accept][Skip]│                                               │
└───────────────┴───────────────────────────────────────────────┘
```
*Incoming cold outreach lands under **Requests** (Accept opens a thread; Skip dismisses).
Messages store their original language; each reader can auto-translate to their own.*

---

## Screens still to sketch (next pass)
- Home / dashboard (what a user is greeted with — feeds the deferred "open vs closed default").
- Notifications panel.
- Inside a group's collaboration space (chat + members + hand-off into Advisory's Google tooling).
- Create-a-group flow.
- Manager bulk-invite flow.
```
