'use strict'

/**
 * People-layer routes — DEV mock implementation.
 *
 * Serves in-memory mock advisors, groups, and messages so the UI can be built
 * and clicked through before MySQL + Advisory profile/auth integration lands.
 * Replace the in-memory stores with raw-SQL queries (mysql2) once the schema +
 * Advisory identity are wired — the handler shapes stay the same.
 */

// ── Mock data ──────────────────────────────────────────────────────────────

const advisors = [
  {
    id: 'me',
    name: 'Mike Barnes',
    title: 'Partner',
    firm: 'Advisor-e',
    city: 'Munich',
    country: 'DE',
    timezone: 'CET',
    linkedin: 'https://linkedin.com/in/mikebarnes',
    email: 'mike@advisor-e.com',
    phone: '+49 89 5550 1234',
    available: true,
    strengths: ['capital raising', 'tax'],
    industries: ['seafood', 'hospitality'],
    topics: ['M&A', 'valuations'],
    about: '20 yrs helping owner-managed firms with growth and exit.'
  },
  {
    id: 'bob-lindt',
    name: 'Bob Lindt',
    title: 'Partner',
    firm: 'Lindt & Co',
    city: 'Zürich',
    country: 'CH',
    timezone: 'CET',
    linkedin: '',
    available: true,
    strengths: ['capital raising', 'debt structuring'],
    industries: ['manufacturing'],
    topics: ['funding rounds'],
    about: 'Corporate finance specialist focused on growth funding.'
  },
  {
    id: 'anna-r',
    name: 'Anna Richter',
    title: 'Director',
    firm: 'BDO Germany',
    city: 'Hamburg',
    country: 'DE',
    timezone: 'CET',
    linkedin: '',
    available: false,
    strengths: ['financial modelling', 'valuation'],
    industries: ['seafood', 'food production'],
    topics: ['forecasting'],
    about: 'Builds valuation models for food-production businesses.'
  },
  {
    id: 'sara-okafor',
    name: 'Sara Okafor',
    title: 'Senior Adviser',
    firm: 'Okafor Advisory',
    city: 'Dublin',
    country: 'IE',
    timezone: 'GMT',
    linkedin: '',
    available: true,
    strengths: ['business coaching', 'succession'],
    industries: ['hospitality', 'retail'],
    topics: ['exit planning'],
    about: 'Coaches owner-managers through scale-up and succession.'
  }
]

const groups = [
  {
    id: 'seafood-modelling',
    name: 'Seafood Financial Modelling',
    icon: '🐟',
    createdBy: 'Anna Richter (BDO DE)',
    firms: 5,
    memberCount: 12,
    visibility: 'listed',
    joinPolicy: 'request-approval',
    tags: ['seafood', 'valuation', 'capital raising'],
    summary: 'Building a shared valuation + capital-raising model for seafood processors. We would love capital-raising experience.',
    members: [
      { id: 'anna-r', name: 'Anna Richter' },
      { id: 'sara-okafor', name: 'Sara Okafor' },
      { id: 'bob-lindt', name: 'Bob Lindt' }
    ]
  },
  {
    id: 'hospitality-turnaround',
    name: 'Hospitality Turnaround Toolkit',
    icon: '🍽️',
    createdBy: 'Sara Okafor (Okafor Advisory)',
    firms: 3,
    memberCount: 7,
    visibility: 'listed',
    joinPolicy: 'request-approval',
    tags: ['hospitality', 'turnaround', 'cashflow'],
    summary: 'Templates and playbooks for rescuing struggling hospitality businesses.',
    members: [
      { id: 'sara-okafor', name: 'Sara Okafor' }
    ]
  }
]

// Mock message threads + incoming requests for the current user.
const messages = {
  requests: [
    { id: 'req-1', fromId: 'bob-lindt', fromName: 'Bob Lindt', preview: 'Gerne! Wann passt es Ihnen?', lang: 'de' },
    { id: 'req-2', fromId: 'anna-r', fromName: 'Anna Richter', preview: 'Would you join the seafood group?', lang: 'en' }
  ],
  chats: [
    { id: 'chat-seafood', name: 'Seafood Financial Modelling', kind: 'group' }
  ]
}

let currentUser = advisors[0]

// ── Helpers ────────────────────────────────────────────────────────────────

function matchesQuery (a, q) {
  if (!q) { return true }
  const hay = [a.name, a.firm, a.city, a.about]
    .concat(a.strengths || [], a.industries || [], a.topics || [], a.tags || [])
    .join(' ')
    .toLowerCase()
  return q.toLowerCase().split(/\s+/).every(term => hay.includes(term))
}

function ok (res, data) { res.send(200, data); return }

// ── Handlers ───────────────────────────────────────────────────────────────

function getMe (req, res, next) {
  ok(res, currentUser)
  return next()
}

function updateMe (req, res, next) {
  const body = req.body || {}
  const editable = ['available', 'strengths', 'industries', 'topics', 'about']
  editable.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(body, k)) { currentUser[k] = body[k] }
  })
  ok(res, currentUser)
  return next()
}

function listAdvisors (req, res, next) {
  const q = (req.query && req.query.q) || ''
  const availableOnly = req.query && (req.query.available === 'true' || req.query.available === '1')
  const results = advisors
    .filter(a => a.id !== 'me')
    .filter(a => matchesQuery(a, q))
    .filter(a => (availableOnly ? a.available : true))
  ok(res, results)
  return next()
}

function getAdvisor (req, res, next) {
  const a = advisors.find(x => x.id === req.params.id)
  if (!a) { res.send(404, { success: false, error: { code: 'NOT_FOUND', message: 'Advisor not found' } }); return next() }
  ok(res, a)
  return next()
}

function listGroups (req, res, next) {
  const q = (req.query && req.query.q) || ''
  ok(res, groups.filter(g => matchesQuery(g, q)))
  return next()
}

function getGroup (req, res, next) {
  const g = groups.find(x => x.id === req.params.id)
  if (!g) { res.send(404, { success: false, error: { code: 'NOT_FOUND', message: 'Group not found' } }); return next() }
  ok(res, g)
  return next()
}

function createGroup (req, res, next) {
  const body = req.body || {}
  const name = (body.name || '').trim()
  if (!name) {
    res.send(400, { success: false, error: { code: 'MISSING_NAME', message: 'A group needs a name.' } })
    return next()
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
  const group = {
    id: slug + '-' + (groups.length + 1),
    name: name,
    icon: body.icon || '✨',
    createdBy: currentUser.name + ' (' + currentUser.firm + ')',
    firms: 1,
    memberCount: 1,
    visibility: body.visibility || 'listed',
    joinPolicy: body.joinPolicy || 'request-approval',
    tags: Array.isArray(body.tags) ? body.tags : [],
    summary: (body.summary || '').trim(),
    members: [{ id: currentUser.id, name: currentUser.name }]
  }
  groups.unshift(group)
  ok(res, group)
  return next()
}

function joinGroup (req, res, next) {
  const g = groups.find(x => x.id === req.params.id)
  if (!g) { res.send(404, { success: false, error: { code: 'NOT_FOUND', message: 'Group not found' } }); return next() }
  // DEV: record a join request only. Real impl = pending request -> manager/owner
  // approval (consent-based membership; no auto-join), per the engagement model.
  ok(res, { success: true, status: 'requested', groupId: g.id, joinPolicy: g.joinPolicy })
  return next()
}

function sendOutreach (req, res, next) {
  const body = req.body || {}
  // Purposeful cold-outreach: a reason ("context") is required by design.
  if (!body.toId || !body.context) {
    res.send(400, { success: false, error: { code: 'MISSING_REASON', message: 'An outreach must name a recipient and explain why you are reaching out.' } })
    return next()
  }
  // DEV: record only. Real impl enforces one-pending-per-recipient + rate limits.
  ok(res, { success: true, sent: true, toId: body.toId })
  return next()
}

function listMessages (req, res, next) {
  ok(res, messages)
  return next()
}

module.exports = {
  getMe,
  updateMe,
  listAdvisors,
  getAdvisor,
  listGroups,
  getGroup,
  createGroup,
  joinGroup,
  sendOutreach,
  listMessages
}
