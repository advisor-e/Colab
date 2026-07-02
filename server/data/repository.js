'use strict'

/**
 * repository — the SINGLE data-access layer for the people layer.
 *
 * ▶ MASTER TEAM: this is the ONLY file to change to connect MySQL. Every function
 *   runs against an in-memory store today (dev fallback). To go live, replace each
 *   function body with the query in its "SQL SEAM" note, using the pool from
 *   server/utils/db.js and the schema in config/db-schema.sql. Keep the function
 *   names, parameters, and return shapes identical — the routes
 *   (server/routes/people.js) and the frontend then need no changes.
 *
 * All functions are async, so swapping in `await pool.execute(...)` is drop-in.
 * Wrap the SQL versions in try/catch and return safe errors (CLAUDE.md error rule).
 *
 * NOTE: advisor IDENTITY (name/title/firm/email/phone/location) is Advisory's
 * system of record — the in-memory `advisors` list stands in for it. In
 * production, read identity from Advisory and JOIN this app's advisor_interest /
 * advisor_tag tables for the advertised fields (available, about, strengths,
 * industries, topics).
 */

// const pool = require('../utils/db')   // <-- uncomment when wiring SQL

const { CROSS_ORG } = require('../../config/integration')

// ── In-memory dev store ──────────────────────────────────────────────────────

const advisors = [
  {
    id: 'me', name: 'Mike Barnes', title: 'Partner', firm: 'Advisor-e',
    city: 'Munich', country: 'DE', timezone: 'CET',
    linkedin: 'https://linkedin.com/in/mikebarnes', email: 'mike@advisor-e.com', phone: '+49 89 5550 1234',
    available: true, strengths: ['capital raising', 'tax'], industries: ['seafood', 'hospitality'],
    topics: ['M&A', 'valuations'], about: '20 yrs helping owner-managed firms with growth and exit.'
  },
  {
    id: 'bob-lindt', name: 'Bob Lindt', title: 'Partner', firm: 'Lindt & Co',
    city: 'Zürich', country: 'CH', timezone: 'CET', linkedin: '',
    available: true, strengths: ['capital raising', 'debt structuring'], industries: ['manufacturing'],
    topics: ['funding rounds'], about: 'Corporate finance specialist focused on growth funding.'
  },
  {
    id: 'anna-r', name: 'Anna Richter', title: 'Director', firm: 'BDO Germany',
    city: 'Hamburg', country: 'DE', timezone: 'CET', linkedin: '',
    available: false, strengths: ['financial modelling', 'valuation'], industries: ['seafood', 'food production'],
    topics: ['forecasting'], about: 'Builds valuation models for food-production businesses.'
  },
  {
    id: 'sara-okafor', name: 'Sara Okafor', title: 'Senior Adviser', firm: 'Okafor Advisory',
    city: 'Dublin', country: 'IE', timezone: 'GMT', linkedin: '',
    available: true, strengths: ['business coaching', 'succession'], industries: ['hospitality', 'retail'],
    topics: ['exit planning'], about: 'Coaches owner-managers through scale-up and succession.'
  }
]

const groups = [
  {
    id: 'seafood-modelling', name: 'Seafood Financial Modelling', icon: '🐟',
    createdBy: 'Anna Richter (BDO DE)', firms: 5, memberCount: 12,
    visibility: 'listed', joinPolicy: 'request-approval',
    tags: ['seafood', 'valuation', 'capital raising'],
    summary: 'Building a shared valuation + capital-raising model for seafood processors. We would love capital-raising experience.',
    members: [{ id: 'me', name: 'Mike Barnes' }, { id: 'anna-r', name: 'Anna Richter' }, { id: 'sara-okafor', name: 'Sara Okafor' }, { id: 'bob-lindt', name: 'Bob Lindt' }]
  },
  {
    id: 'hospitality-turnaround', name: 'Hospitality Turnaround Toolkit', icon: '🍽️',
    createdBy: 'Sara Okafor (Okafor Advisory)', firms: 3, memberCount: 7,
    visibility: 'listed', joinPolicy: 'request-approval',
    tags: ['hospitality', 'turnaround', 'cashflow'],
    summary: 'Templates and playbooks for rescuing struggling hospitality businesses.',
    members: [{ id: 'sara-okafor', name: 'Sara Okafor' }]
  },
  {
    id: 'tax-automation', name: 'Tax Automation Lab', icon: '🧮',
    createdBy: 'Bob Lindt (Lindt & Co)', firms: 4, memberCount: 9,
    visibility: 'listed', joinPolicy: 'request-approval',
    tags: ['tax', 'automation', 'workflow'],
    summary: 'Building shared tax-automation workflows and templates.',
    members: [{ id: 'bob-lindt', name: 'Bob Lindt' }]
  }
]

const threads = [
  { id: 't-bob', kind: 'outreach', withId: 'bob-lindt', withName: 'Bob Lindt', status: 'request', direction: 'incoming', messages: [{ from: 'Bob Lindt', text: 'Gerne! Wann passt es Ihnen?', lang: 'de' }] },
  { id: 't-anna', kind: 'outreach', withId: 'anna-r', withName: 'Anna Richter', status: 'request', direction: 'incoming', messages: [{ from: 'Anna Richter', text: 'Would you be open to joining the seafood modelling group?', lang: 'en' }] },
  { id: 't-seafood-grp', kind: 'group', withId: 'seafood-modelling', withName: 'Seafood Financial Modelling', status: 'active', direction: 'outgoing', messages: [{ from: 'Anna Richter', text: 'Welcome — glad to have you looking at this!', lang: 'en' }] },
  // Incoming group invitations (someone invited "me" to join) — Accept joins the group.
  { id: 't-inv-hosp', kind: 'invitation', withId: 'hospitality-turnaround', withName: 'Hospitality Turnaround Toolkit', groupId: 'hospitality-turnaround', inviterName: 'Sara Okafor', status: 'request', direction: 'incoming', messages: [{ from: 'Sara Okafor', text: 'We would love your capital-raising experience on the Hospitality Turnaround group — would you join us?', lang: 'en' }] },
  { id: 't-inv-tax', kind: 'invitation', withId: 'tax-automation', withName: 'Tax Automation Lab', groupId: 'tax-automation', inviterName: 'Bob Lindt', status: 'request', direction: 'incoming', messages: [{ from: 'Bob Lindt', text: 'Would you like to join the Tax Automation Lab? Your workflow experience would help.', lang: 'en' }] }
]
let threadSeq = 1

const connections = [
  { id: 'c-anna', requesterId: 'anna-r', addresseeId: 'me', status: 'pending' },     // Anna -> me (incoming request)
  { id: 'c-sara', requesterId: 'me', addresseeId: 'sara-okafor', status: 'accepted' } // me <-> Sara (connected)
]
let connSeq = 1

const listings = [
  { id: 'm-trucking', title: 'Trucking Firm Valuation Model', summary: 'A valuation + capital-raising model built by five firms for road-transport businesses.', groupId: 'seafood-modelling', groupName: 'Seafood Financial Modelling', tags: ['trucking', 'valuation'], price: '€450', createdBy: 'Anna Richter (BDO DE)', createdById: 'anna-r' },
  { id: 'm-hospitality', title: 'Hospitality Turnaround Toolkit', summary: 'Templates and playbooks for rescuing struggling hospitality businesses.', groupId: 'hospitality-turnaround', groupName: 'Hospitality Turnaround Toolkit', tags: ['hospitality', 'turnaround'], price: 'Free', createdBy: 'Sara Okafor', createdById: 'sara-okafor' }
]
const purchases = []
let listingSeq = 1

// ── Notifications (in-app; strictly per recipient) ───────────────────────────
// Each notification targets ONE recipient (userId); a route only ever returns
// the caller's own rows, so no cross-user data is exposed. The frontend renders
// the visible text from `type` + `params` via i18n (locale keys), so no English
// string lives here. Event functions below call pushNotification(recipientId, …)
// at the moment the event happens — in production each becomes an INSERT.
const notifications = []
let notifSeq = 1

function advisorName (id) {
  const a = advisors.find(x => x.id === id)
  return a ? a.name : id
}

/**
 * Record an in-app notification for a single recipient.
 * @param {string} userId recipient advisor id
 * @param {'connection_request'|'group_invitation'|'message'|'purchase'} type event type
 * @param {object} params interpolation values for the i18n string (e.g. { name })
 * @param {string} link in-app route to open when the notification is clicked
 * @returns {object} the created notification
 */
function pushNotification (userId, type, params, link) {
  // SQL SEAM: INSERT INTO notification (user_id, type, params_json, link, is_read=0, created_at=NOW())
  const n = { id: 'n-' + (notifSeq++), userId: userId, type: type, params: params || {}, link: link, read: false }
  notifications.unshift(n)
  return n
}

// Seed a few unread notifications for the dev user so the bell is demonstrable
// in the show-home. These mirror the pre-seeded incoming state (a connection
// request, two group invitations, a message) plus one illustrative marketplace
// purchase. In production the store starts empty and fills from live events —
// this is clearly seed/demo data, not business logic.
;(function seedNotifications () {
  pushNotification('me', 'connection_request', { name: 'Anna Richter' }, '/connections')
  pushNotification('me', 'group_invitation', { inviter: 'Sara Okafor', group: 'Hospitality Turnaround Toolkit' }, '/messages')
  pushNotification('me', 'group_invitation', { inviter: 'Bob Lindt', group: 'Tax Automation Lab' }, '/messages')
  pushNotification('me', 'message', { name: 'Bob Lindt' }, '/messages')
  pushNotification('me', 'purchase', { buyer: 'Sara Okafor', tool: 'Trucking Firm Valuation Model' }, '/marketplace')
}())

// ── Cross-org engagement postures (per office/firm) ──────────────────────────
// Keyed by the advisor's `firm` (= office/branch, Q6). The default is CLOSED /
// opt-in (config/integration.js → CROSS_ORG.defaultPosture, D1). The demo firms
// below have OPTED IN so the show-home network is navigable; an unknown firm
// falls back to the closed default.
//
// SQL SEAM: a per-org row (org_id, posture); the manager UI to flip it is
// deferred with FEAT-RBAC (see design/ACTIONS.md). Group/space-level cross-org
// gating (plan §8) is also future work — the wall here covers the person-to-person
// surfaces (discovery, connection, outreach).
const orgPostures = {
  'Advisor-e': 'open',
  'Lindt & Co': 'open',
  'BDO Germany': 'open',
  'Okafor Advisory': 'open'
}

function orgPostureFor (firm) {
  return orgPostures[firm] || CROSS_ORG.defaultPosture
}

// Both-sides consent (plan §8): a cross-firm interaction needs BOTH firms open.
// Same firm is always allowed.
function canReachAcross (firmA, firmB) {
  if (!firmA || !firmB) { return false }
  if (firmA === firmB) { return true }
  return orgPostureFor(firmA) === 'open' && orgPostureFor(firmB) === 'open'
}

function connectionStatusFor (myId, otherId) {
  const c = connections.find(x => (x.requesterId === myId && x.addresseeId === otherId) || (x.requesterId === otherId && x.addresseeId === myId))
  if (!c) { return 'none' }
  if (c.status === 'accepted') { return 'connected' }
  if (c.status === 'pending') { return c.requesterId === myId ? 'pending_out' : 'pending_in' }
  return 'none'
}

function matchesQuery (a, q) {
  if (!q) { return true }
  const hay = [a.name, a.firm, a.city, a.about].concat(a.strengths || [], a.industries || [], a.topics || [], a.tags || []).join(' ').toLowerCase()
  return q.toLowerCase().split(/\s+/).every(term => hay.includes(term))
}

function threadSummary (t) {
  const last = t.messages[t.messages.length - 1] || null
  return { id: t.id, kind: t.kind, withId: t.withId, withName: t.withName, status: t.status, direction: t.direction, lastText: last ? last.text : '', lastFrom: last ? last.from : '' }
}

// ── Advisors ─────────────────────────────────────────────────────────────────

async function getAdvisorById (id) {
  // SQL SEAM: advisor identity from Advisory + LEFT JOIN advisor_interest/advisor_tag WHERE advisor_id = ?
  return advisors.find(a => a.id === id) || null
}

async function listAdvisors (opts) {
  // SQL SEAM: SELECT … WHERE id<>? AND (search match) AND (available=1 if filtered) — joined w/ Advisory
  //           identity; LEFT JOIN connection to derive each advisor's status vs the viewer.
  const o = opts || {}
  const viewer = o.myId || o.excludeId
  const viewerAdvisor = advisors.find(a => a.id === viewer)
  const viewerFirm = viewerAdvisor ? viewerAdvisor.firm : null
  return advisors
    .filter(a => a.id !== o.excludeId)
    // Cross-org wall (plan §8; D1/Q6): hide advisers your firm can't reach.
    // A viewer with no known firm (e.g. an unresolved dev identity) is not filtered.
    .filter(a => (viewerFirm ? canReachAcross(viewerFirm, a.firm) : true))
    .filter(a => matchesQuery(a, o.q))
    .filter(a => (o.availableOnly ? a.available : true))
    .map(a => Object.assign({}, a, { connectionStatus: connectionStatusFor(viewer, a.id) }))
}

async function updateAdvisorInterest (id, fields) {
  // SQL SEAM: UPSERT advisor_interest(available, about); REPLACE advisor_tag rows for strengths/industries/topics
  const a = advisors.find(x => x.id === id)
  if (!a) { return null }
  ;['available', 'strengths', 'industries', 'topics', 'about'].forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(fields, k)) { a[k] = fields[k] }
  })
  return a
}

// ── Groups ───────────────────────────────────────────────────────────────────

async function listGroups (opts) {
  // SQL SEAM: SELECT * FROM `group` (+ group_tag) WHERE visibility='listed' AND (search match)
  return groups.filter(g => matchesQuery(g, (opts || {}).q))
}

async function getGroupById (id) {
  // SQL SEAM: SELECT `group` + group_tag + group_member WHERE id = ?
  return groups.find(g => g.id === id) || null
}

async function createGroup (input, creator) {
  // SQL SEAM: INSERT INTO `group` (…); INSERT group_tag rows; INSERT group_member (owner)
  const name = (input.name || '').trim()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
  const group = {
    id: slug + '-' + (groups.length + 1), name: name, icon: input.icon || '✨',
    createdBy: creator.name + ' (' + creator.firm + ')', firms: 1, memberCount: 1,
    visibility: input.visibility || 'listed', joinPolicy: input.joinPolicy || 'request-approval',
    tags: Array.isArray(input.tags) ? input.tags : [], summary: (input.summary || '').trim(),
    members: [{ id: creator.id, name: creator.name }]
  }
  groups.unshift(group)
  return group
}

async function requestJoinGroup (groupId, advisorId) {
  // SQL SEAM: INSERT INTO group_join_request (group_id, advisor_id, 'requested') ON DUPLICATE KEY UPDATE …
  const g = groups.find(x => x.id === groupId)
  if (!g) { return null }
  return { status: 'requested', groupId: g.id, joinPolicy: g.joinPolicy }
}

// ── Group invitations (group owner/manager → adviser; consent required) ───────
// The mirror of requestJoinGroup: here the group side invites a person it found.
// No top-down placement — the invitee must ACCEPT before they become a member
// (plan §"invitation + consent"). "Manage" is approximated as membership in the
// mock until per-member roles + RBAC land (see design/ACTIONS.md).

async function listManageableGroups (advisorId) {
  // SQL SEAM: SELECT g.* FROM `group` g JOIN group_member m ON m.group_id=g.id
  //           WHERE m.advisor_id=? AND m.role IN ('owner','admin')
  return groups
    .filter(g => (g.members || []).some(m => m.id === advisorId))
    .map(g => ({ id: g.id, name: g.name, icon: g.icon }))
}

async function inviteToGroup (groupId, inviter, inviteeId, note) {
  // SQL SEAM: verify inviter manages the group; INSERT INTO group_invitation
  //   (group_id, advisor_id, invited_by, note, 'invited'); create an incoming
  //   'invitation' thread for the invitee. Returns {error} sentinels the route maps.
  const g = groups.find(x => x.id === groupId)
  if (!g) { return { error: 'GROUP_NOT_FOUND' } }
  if (!(g.members || []).some(m => m.id === inviter.id)) { return { error: 'NOT_MANAGER' } }
  if ((g.members || []).some(m => m.id === inviteeId)) { return { error: 'ALREADY_MEMBER' } }

  const invitee = advisors.find(a => a.id === inviteeId) || { id: inviteeId, name: inviteeId }
  const text = (note && note.trim()) ? note.trim() : ('We would love you to join ' + g.name + '.')
  const t = {
    id: 't-inv-' + (threadSeq++), kind: 'invitation', withId: groupId, withName: g.name,
    groupId: groupId, inviterName: inviter.name, inviteeName: invitee.name,
    status: 'active', direction: 'outgoing',
    messages: [{ from: 'Me', text: text, lang: 'en' }]
  }
  threads.unshift(t)
  // Notify the invitee (recipient = the person being invited).
  pushNotification(inviteeId, 'group_invitation', { inviter: inviter.name, group: g.name }, '/messages')
  return { success: true, threadId: t.id, group: { id: g.id, name: g.name }, invitee: { id: invitee.id, name: invitee.name } }
}

async function respondInvitation (threadId, advisorId, accept) {
  // SQL SEAM: UPDATE group_invitation SET status=? WHERE id=? AND advisor_id=? AND
  //   status='invited'; if accepted INSERT INTO group_member (group_id, advisor_id, 'member')
  const t = threads.find(x => x.id === threadId && x.kind === 'invitation' && x.direction === 'incoming')
  if (!t || t.status !== 'request') { return null }
  t.status = 'active'
  if (accept) {
    const g = groups.find(x => x.id === t.groupId)
    if (g && !(g.members || []).some(m => m.id === advisorId)) {
      const me = advisors.find(a => a.id === advisorId) || { id: advisorId, name: advisorId }
      g.members.push({ id: advisorId, name: me.name })
      g.memberCount = (g.memberCount || 0) + 1
    }
  }
  return { success: true, accepted: !!accept, groupId: t.groupId, groupName: t.withName }
}

// ── Threads / messages ───────────────────────────────────────────────────────

async function listThreads (ownerId) {
  // SQL SEAM: SELECT thread (+ last message) WHERE owner_id = ? ORDER BY created_at DESC
  return threads.map(threadSummary)
}

async function getThreadById (id) {
  // SQL SEAM: SELECT thread + messages WHERE thread.id = ? ORDER BY message.created_at
  return threads.find(t => t.id === id) || null
}

async function appendMessage (threadId, msg) {
  // SQL SEAM: INSERT INTO message (thread_id, sender_id, sender_name, body, lang); UPDATE thread.status if 'request'
  const t = threads.find(x => x.id === threadId)
  if (!t) { return null }
  t.messages.push({ from: msg.from, text: msg.text, lang: msg.lang || 'en' })
  if (t.status === 'request') { t.status = 'active' }
  // Notify the 1:1 counterpart of a new inbound message. Group fan-out (one
  // notification per member) is future work — see design/ACTIONS.md T2.
  if (t.kind === 'outreach' && t.withId) {
    pushNotification(t.withId, 'message', { name: msg.fromName || msg.from }, '/messages')
  }
  return t
}

async function createOutreachThread (input) {
  // SQL SEAM: INSERT INTO thread (kind='outreach', direction='outgoing', …); INSERT first message
  const t = {
    id: 't-out-' + (threadSeq++), kind: 'outreach', withId: input.toId, withName: input.toName,
    status: 'active', direction: 'outgoing', messages: [{ from: 'Me', text: input.text, lang: 'en' }]
  }
  threads.unshift(t)
  // Notify the recipient of the new incoming outreach.
  pushNotification(input.toId, 'message', { name: input.fromName || 'Someone' }, '/messages')
  return t
}

async function findOrCreateGroupThread (group) {
  // SQL SEAM: SELECT thread WHERE kind='group' AND with_id=? ; INSERT if none
  let t = threads.find(x => x.kind === 'group' && x.withId === group.id)
  if (!t) {
    t = { id: 't-grp-' + (threadSeq++), kind: 'group', withId: group.id, withName: group.name, status: 'active', direction: 'outgoing', messages: [] }
    threads.unshift(t)
  }
  return t
}

// ── Connections (1:1, mutual accept) ─────────────────────────────────────────

// Can `fromId` initiate contact with `toId` under the cross-org policy? Same firm
// is always allowed; an unknown recipient (e.g. an external id) is not blocked in
// the mock. Used by the connection/outreach/profile guards.
async function canReachAdvisor (fromId, toId) {
  const from = advisors.find(a => a.id === fromId)
  const to = advisors.find(a => a.id === toId)
  if (!from || !to) { return true }
  return canReachAcross(from.firm, to.firm)
}

async function getOrgPosture (firm) {
  // SQL SEAM: SELECT posture FROM org_posture WHERE org_id = ? (default from config)
  return orgPostureFor(firm)
}

async function setOrgPosture (firm, posture) {
  // SQL SEAM: UPSERT org_posture(org_id, posture). GUARD (future): only a Firm/
  // Global manager may call this — enforced once FEAT-RBAC lands (Q-ROLES).
  if (posture !== 'open' && posture !== 'closed') { return { error: 'BAD_POSTURE' } }
  orgPostures[firm] = posture
  return { firm: firm, posture: posture }
}

async function requestConnection (fromId, toId) {
  // SQL SEAM: INSERT INTO connection (requester_id, addressee_id, 'pending') ON DUPLICATE KEY UPDATE …
  if (fromId === toId) { return null }
  // Cross-org wall: refuse a new cross-firm request unless both firms have opted in.
  if (!(await canReachAdvisor(fromId, toId))) { return { error: 'CROSS_ORG_BLOCKED' } }
  let c = connections.find(x => (x.requesterId === fromId && x.addresseeId === toId) || (x.requesterId === toId && x.addresseeId === fromId))
  if (!c) {
    c = { id: 'c-' + (connSeq++), requesterId: fromId, addresseeId: toId, status: 'pending' }
    connections.push(c)
    // Notify the addressee of the new request (recipient = the OTHER party).
    pushNotification(toId, 'connection_request', { name: advisorName(fromId) }, '/connections')
  }
  return c
}

async function listConnections (myId) {
  // SQL SEAM: SELECT * FROM connection WHERE requester_id=? OR addressee_id=? (join Advisory identity)
  const enrich = (c) => {
    const otherId = c.requesterId === myId ? c.addresseeId : c.requesterId
    return { id: c.id, status: c.status, advisor: advisors.find(x => x.id === otherId) || { id: otherId, name: otherId } }
  }
  const mine = connections.filter(c => c.requesterId === myId || c.addresseeId === myId)
  // Groups the user belongs to, each with its OTHER members (so they can see who
  // else is in a group they've joined). 1:1 connections are separate (above).
  const myGroups = groups
    .filter(g => (g.members || []).some(m => m.id === myId))
    .map(g => ({ id: g.id, name: g.name, icon: g.icon, members: (g.members || []).filter(m => m.id !== myId) }))
  return {
    incoming: mine.filter(c => c.status === 'pending' && c.addresseeId === myId).map(enrich),
    outgoing: mine.filter(c => c.status === 'pending' && c.requesterId === myId).map(enrich),
    connected: mine.filter(c => c.status === 'accepted').map(enrich),
    groups: myGroups
  }
}

async function respondConnection (connId, myId, accept) {
  // SQL SEAM: UPDATE connection SET status=? WHERE id=? AND addressee_id=? AND status='pending'
  const c = connections.find(x => x.id === connId)
  if (!c || c.addresseeId !== myId || c.status !== 'pending') { return null }
  c.status = accept ? 'accepted' : 'declined'
  return c
}

// ── Marketplace (group-owned IP; record-only transactions, no Advisory fee) ───

async function listListings (myId) {
  // SQL SEAM: SELECT listing (+ tags) ; owned = EXISTS(purchase by myId)
  return listings.map(l => Object.assign({}, l, { owned: purchases.some(p => p.listingId === l.id && p.buyerId === myId) }))
}

async function getListing (id, myId) {
  // SQL SEAM: SELECT listing WHERE id=? (+ owned flag)
  const l = listings.find(x => x.id === id)
  if (!l) { return null }
  return Object.assign({}, l, { owned: purchases.some(p => p.listingId === l.id && p.buyerId === myId) })
}

async function createListing (input, creator) {
  // SQL SEAM: INSERT INTO marketplace_listing (…, page_id); INSERT marketplace_listing_tag rows
  const title = (input.title || '').trim()
  if (!title) { return null }
  const l = {
    id: 'm-' + (listingSeq++), title: title, summary: (input.summary || '').trim(),
    // Read-only link to the Advisor-e-hosted page (the `link`/page ID from the
    // master catalogue). The route validates it exists before we get here.
    pageId: (input.pageId || '').trim() || null,
    groupId: input.groupId || null, groupName: input.groupName || '',
    tags: Array.isArray(input.tags) ? input.tags : [],
    price: ((input.price || '').trim()) || 'Free',
    createdBy: creator.name + ' (' + creator.firm + ')'
  }
  listings.unshift(l)
  return l
}

async function recordPurchase (listingId, buyerId) {
  // SQL SEAM: INSERT INTO marketplace_purchase (listing_id, buyer_id) ON DUPLICATE KEY UPDATE …
  //   Record-only: Advisory takes no fee and is not party to the transaction — this row is the
  //   analytics record. The buyer gains an unlimited-client usage licence + ongoing updates;
  //   ownership stays with the group (plan §3d).
  const l = listings.find(x => x.id === listingId)
  if (!l) { return null }
  if (!purchases.some(p => p.listingId === listingId && p.buyerId === buyerId)) {
    purchases.push({ id: 'p-' + (purchases.length + 1), listingId: listingId, buyerId: buyerId })
    // Notify the listing's creator (the seller) — record-only, informational.
    if (l.createdById) {
      pushNotification(l.createdById, 'purchase', { buyer: advisorName(buyerId), tool: l.title }, '/marketplace')
    }
  }
  return { success: true, owned: true }
}

// ── Notifications (read side) ────────────────────────────────────────────────

async function listNotifications (userId) {
  // SQL SEAM: SELECT * FROM notification WHERE user_id=? ORDER BY created_at DESC LIMIT 50
  const mine = notifications.filter(n => n.userId === userId)
  return { items: mine, unread: mine.filter(n => !n.read).length }
}

async function markNotificationsRead (userId) {
  // SQL SEAM: UPDATE notification SET is_read=1 WHERE user_id=? AND is_read=0
  let marked = 0
  notifications.forEach((n) => {
    if (n.userId === userId && !n.read) { n.read = true; marked++ }
  })
  return { success: true, marked: marked }
}

module.exports = {
  getAdvisorById, listAdvisors, updateAdvisorInterest,
  listGroups, getGroupById, createGroup, requestJoinGroup,
  listManageableGroups, inviteToGroup, respondInvitation,
  listThreads, getThreadById, appendMessage, createOutreachThread, findOrCreateGroupThread,
  requestConnection, listConnections, respondConnection,
  listListings, getListing, createListing, recordPurchase,
  listNotifications, markNotificationsRead,
  canReachAdvisor, getOrgPosture, setOrgPosture
}
