'use strict'

/**
 * People-layer routes — thin HTTP handlers over server/data/repository.js.
 *
 * Identity comes from req.identity (set by server/middleware/auth.js), never the
 * request body. All data access goes through the repository, which is the single
 * seam for connecting MySQL (see server/data/repository.js).
 *
 * NOTE: these are async handlers. Restify 9 requires async handlers to take
 * (req, res) only — it advances the chain when the promise resolves. Do NOT add
 * a `next` argument here (that triggers a startup assertion).
 */

const repo = require('../data/repository')
const templates = require('../data/advisoryTemplates')
const { sendApiError } = require('../utils/sendError')

function ok (res, data) { res.send(200, data) }
// Standard error envelope (incl. the mandated timestamp) — see server/utils/sendError.js.
function fail (res, status, code, message) { sendApiError(res, status, code, message) }

// Resolve the logged-in advisor (dev identity = 'me' under ALLOW_DEV_AUTH).
async function currentAdvisor (req) {
  const id = (req.identity && req.identity.advisorId) || 'me'
  return (await repo.getAdvisorById(id)) || { id, name: 'You', firm: 'Advisor-e' }
}

async function getMe (req, res) {
  ok(res, await currentAdvisor(req))
}

async function updateMe (req, res) {
  const me = await currentAdvisor(req)
  const updated = await repo.updateAdvisorInterest(me.id, req.body || {})
  ok(res, updated || me)
}

async function listAdvisors (req, res) {
  const q = (req.query && req.query.q) || ''
  const availableOnly = req.query && (req.query.available === 'true' || req.query.available === '1')
  const me = await currentAdvisor(req)
  ok(res, await repo.listAdvisors({ q, availableOnly, excludeId: me.id, myId: me.id }))
}

async function getAdvisor (req, res) {
  const a = await repo.getAdvisorById(req.params.id)
  if (!a) { fail(res, 404, 'NOT_FOUND', 'Advisor not found'); return }
  ok(res, a)
}

async function listGroups (req, res) {
  ok(res, await repo.listGroups({ q: (req.query && req.query.q) || '' }))
}

async function getGroup (req, res) {
  const g = await repo.getGroupById(req.params.id)
  if (!g) { fail(res, 404, 'NOT_FOUND', 'Group not found'); return }
  ok(res, g)
}

async function createGroup (req, res) {
  const body = req.body || {}
  if (!(body.name || '').trim()) { fail(res, 400, 'MISSING_NAME', 'A group needs a name.'); return }
  const me = await currentAdvisor(req)
  ok(res, await repo.createGroup(body, me))
}

async function joinGroup (req, res) {
  const me = await currentAdvisor(req)
  const r = await repo.requestJoinGroup(req.params.id, me.id)
  if (!r) { fail(res, 404, 'NOT_FOUND', 'Group not found'); return }
  // Consent-based: a request is recorded; no auto-join. Owner/manager approves.
  ok(res, Object.assign({ success: true }, r))
}

// Groups the viewer can invite people into (owner/manager).
async function listMyGroups (req, res) {
  const me = await currentAdvisor(req)
  ok(res, await repo.listManageableGroups(me.id))
}

// Invite a found specialist into one of my groups. Consent-based — they accept.
async function inviteToGroup (req, res) {
  const me = await currentAdvisor(req)
  const body = req.body || {}
  const inviteeId = body.advisorId || body.toId
  if (!inviteeId) { fail(res, 400, 'MISSING_ADVISOR', 'Choose who to invite.'); return }
  const r = await repo.inviteToGroup(req.params.id, me, inviteeId, body.note)
  if (r.error === 'GROUP_NOT_FOUND') { fail(res, 404, 'NOT_FOUND', 'Group not found.'); return }
  if (r.error === 'NOT_MANAGER') { fail(res, 403, 'NOT_MANAGER', 'You can only invite into a group you manage.'); return }
  if (r.error === 'ALREADY_MEMBER') { fail(res, 409, 'ALREADY_MEMBER', 'They are already in this group.'); return }
  ok(res, r)
}

// Recipient accepts/declines a group invitation. Accept joins the group.
async function acceptInvitation (req, res) {
  const me = await currentAdvisor(req)
  const r = await repo.respondInvitation(req.params.id, me.id, true)
  if (!r) { fail(res, 404, 'NOT_FOUND', 'Invitation not found.'); return }
  ok(res, r)
}

async function declineInvitation (req, res) {
  const me = await currentAdvisor(req)
  const r = await repo.respondInvitation(req.params.id, me.id, false)
  if (!r) { fail(res, 404, 'NOT_FOUND', 'Invitation not found.'); return }
  ok(res, r)
}

async function messageGroup (req, res) {
  const g = await repo.getGroupById(req.params.id)
  if (!g) { fail(res, 404, 'NOT_FOUND', 'Group not found'); return }
  const text = ((req.body || {}).text || '').trim()
  if (!text) { fail(res, 400, 'EMPTY', 'Message is empty.'); return }
  const t = await repo.findOrCreateGroupThread(g)
  await repo.appendMessage(t.id, { from: 'Me', text })
  ok(res, { success: true, threadId: t.id })
}

async function sendOutreach (req, res) {
  const body = req.body || {}
  // Purposeful cold-outreach: a reason ("context") is required by design.
  if (!body.toId || !body.context) { fail(res, 400, 'MISSING_REASON', 'An outreach must name a recipient and explain why you are reaching out.'); return }
  const advisor = await repo.getAdvisorById(body.toId)
  const text = body.context + (body.ask ? '\n\n' + body.ask : '')
  const t = await repo.createOutreachThread({ toId: body.toId, toName: advisor ? advisor.name : body.toId, text })
  ok(res, { success: true, sent: true, threadId: t.id })
}

async function listMessages (req, res) {
  const me = await currentAdvisor(req)
  ok(res, { threads: await repo.listThreads(me.id) })
}

async function getThread (req, res) {
  const t = await repo.getThreadById(req.params.id)
  if (!t) { fail(res, 404, 'NOT_FOUND', 'Conversation not found'); return }
  ok(res, t)
}

async function replyThread (req, res) {
  const text = ((req.body || {}).text || '').trim()
  if (!text) { fail(res, 400, 'EMPTY', 'Message is empty.'); return }
  const t = await repo.appendMessage(req.params.id, { from: 'Me', text })
  if (!t) { fail(res, 404, 'NOT_FOUND', 'Conversation not found'); return }
  ok(res, t)
}

async function listConnections (req, res) {
  const me = await currentAdvisor(req)
  ok(res, await repo.listConnections(me.id))
}

async function connect (req, res) {
  const me = await currentAdvisor(req)
  if (req.params.id === me.id) { fail(res, 400, 'SELF', 'You cannot connect with yourself.'); return }
  const c = await repo.requestConnection(me.id, req.params.id)
  if (!c) { fail(res, 400, 'BAD_REQUEST', 'Could not create the request.'); return }
  ok(res, { success: true, status: c.status })
}

async function acceptConnection (req, res) {
  const me = await currentAdvisor(req)
  const c = await repo.respondConnection(req.params.id, me.id, true)
  if (!c) { fail(res, 404, 'NOT_FOUND', 'Request not found.'); return }
  ok(res, { success: true, status: c.status })
}

async function declineConnection (req, res) {
  const me = await currentAdvisor(req)
  const c = await repo.respondConnection(req.params.id, me.id, false)
  if (!c) { fail(res, 404, 'NOT_FOUND', 'Request not found.'); return }
  ok(res, { success: true, status: c.status })
}

async function listMarketplace (req, res) {
  const me = await currentAdvisor(req)
  ok(res, await repo.listListings(me.id))
}

async function getListing (req, res) {
  const me = await currentAdvisor(req)
  const l = await repo.getListing(req.params.id, me.id)
  if (!l) { fail(res, 404, 'NOT_FOUND', 'Listing not found'); return }
  ok(res, l)
}

async function createListing (req, res) {
  const body = req.body || {}
  if (!(body.title || '').trim()) { fail(res, 400, 'MISSING_TITLE', 'A listing needs a title.'); return }
  // Every listing must link to a real Advisor-e tool (page ID from the master
  // catalogue). Reject a missing or unknown ID — never trust the client (CLAUDE.md
  // security rule). The ID itself is generated by Advisory, never by this app.
  if (!(body.pageId || '').trim()) { fail(res, 400, 'MISSING_TOOL', 'Choose the Advisor-e tool this listing is for.'); return }
  if (!(await templates.exists(body.pageId))) { fail(res, 400, 'UNKNOWN_TOOL', 'That tool is not in the Advisor-e catalogue.'); return }
  const me = await currentAdvisor(req)
  ok(res, await repo.createListing(body, me))
}

async function purchaseListing (req, res) {
  const me = await currentAdvisor(req)
  const r = await repo.recordPurchase(req.params.id, me.id)
  if (!r) { fail(res, 404, 'NOT_FOUND', 'Listing not found'); return }
  ok(res, r)
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
  messageGroup,
  listMyGroups,
  inviteToGroup,
  acceptInvitation,
  declineInvitation,
  sendOutreach,
  listMessages,
  getThread,
  replyThread,
  listConnections,
  connect,
  acceptConnection,
  declineConnection,
  listMarketplace,
  getListing,
  createListing,
  purchaseListing
}
