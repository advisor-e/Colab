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
    members: [{ id: 'anna-r', name: 'Anna Richter' }, { id: 'sara-okafor', name: 'Sara Okafor' }, { id: 'bob-lindt', name: 'Bob Lindt' }]
  },
  {
    id: 'hospitality-turnaround', name: 'Hospitality Turnaround Toolkit', icon: '🍽️',
    createdBy: 'Sara Okafor (Okafor Advisory)', firms: 3, memberCount: 7,
    visibility: 'listed', joinPolicy: 'request-approval',
    tags: ['hospitality', 'turnaround', 'cashflow'],
    summary: 'Templates and playbooks for rescuing struggling hospitality businesses.',
    members: [{ id: 'sara-okafor', name: 'Sara Okafor' }]
  }
]

const threads = [
  { id: 't-bob', kind: 'outreach', withId: 'bob-lindt', withName: 'Bob Lindt', status: 'request', direction: 'incoming', messages: [{ from: 'Bob Lindt', text: 'Gerne! Wann passt es Ihnen?', lang: 'de' }] },
  { id: 't-anna', kind: 'outreach', withId: 'anna-r', withName: 'Anna Richter', status: 'request', direction: 'incoming', messages: [{ from: 'Anna Richter', text: 'Would you be open to joining the seafood modelling group?', lang: 'en' }] },
  { id: 't-seafood-grp', kind: 'group', withId: 'seafood-modelling', withName: 'Seafood Financial Modelling', status: 'active', direction: 'outgoing', messages: [{ from: 'Anna Richter', text: 'Welcome — glad to have you looking at this!', lang: 'en' }] }
]
let threadSeq = 1

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
  // SQL SEAM: SELECT … WHERE id<>? AND (search match) AND (available=1 if filtered) — joined w/ Advisory identity
  const o = opts || {}
  return advisors
    .filter(a => a.id !== o.excludeId)
    .filter(a => matchesQuery(a, o.q))
    .filter(a => (o.availableOnly ? a.available : true))
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
  return t
}

async function createOutreachThread (input) {
  // SQL SEAM: INSERT INTO thread (kind='outreach', direction='outgoing', …); INSERT first message
  const t = {
    id: 't-out-' + (threadSeq++), kind: 'outreach', withId: input.toId, withName: input.toName,
    status: 'active', direction: 'outgoing', messages: [{ from: 'Me', text: input.text, lang: 'en' }]
  }
  threads.unshift(t)
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

module.exports = {
  getAdvisorById, listAdvisors, updateAdvisorInterest,
  listGroups, getGroupById, createGroup, requestJoinGroup,
  listThreads, getThreadById, appendMessage, createOutreachThread, findOrCreateGroupThread
}
