'use strict'

/**
 * Tests for the people-layer routes (server/routes/people.js).
 *
 * Handlers are thin async wrappers over server/data/repository.js. They are called
 * directly with a mock req/res (no restify server is started) — the same pattern as
 * tests/templates.test.js. `res.send` records [status, body].
 *
 * The repository is an in-memory module with mutable seed data, so each test runs
 * against a FRESH copy via jest.resetModules() in beforeEach — tests are therefore
 * order-independent and never leak state into one another.
 *
 * Covers, for every handler, the success path plus each error/guard branch the
 * route maps (400/403/404/409). A page ID known to exist in the read-only Advisory
 * snapshot is used for the marketplace create-validation happy path.
 */

// A page ID known to exist in the Advisory snapshot (see tests/templates.test.js).
const KNOWN_PAGE_ID = 'id-4466260146'

let route

beforeEach(() => {
  jest.resetModules()
  route = require('../server/routes/people')
})

function mkRes () { return { send: jest.fn() } }
// Return [status, body] of the first res.send call.
function sent (res) { return res.send.mock.calls[0] }

describe('me', () => {
  test('getMe returns the logged-in advisor', async () => {
    const res = mkRes()
    await route.getMe({}, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body).toEqual(expect.objectContaining({ id: 'me', name: 'Mike Barnes' }))
  })

  test('getMe falls back to a placeholder when the identity is unknown', async () => {
    const res = mkRes()
    await route.getMe({ identity: { advisorId: 'ghost' } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    // The placeholder firm 'Advisor-e' is opted-in, so posture resolves to 'open'.
    expect(body).toEqual({ id: 'ghost', name: 'You', firm: 'Advisor-e', crossOrgPosture: 'open' })
  })

  test('updateMe applies advertised-interest fields and returns the updated advisor', async () => {
    const res = mkRes()
    await route.updateMe({ body: { available: false, about: 'Updated bio' } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body.available).toBe(false)
    expect(body.about).toBe('Updated bio')
  })

  test('updateMe returns the current advisor when there is nothing to update against', async () => {
    const res = mkRes()
    await route.updateMe({ identity: { advisorId: 'ghost' }, body: { available: true } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body).toEqual(expect.objectContaining({ id: 'ghost', name: 'You' }))
  })
})

describe('advisors', () => {
  test('listAdvisors excludes the viewer and carries a connectionStatus', async () => {
    const res = mkRes()
    await route.listAdvisors({ query: {} }, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body.some(a => a.id === 'me')).toBe(false)
    expect(body.every(a => typeof a.connectionStatus === 'string')).toBe(true)
  })

  test('listAdvisors filters by search term', async () => {
    const res = mkRes()
    await route.listAdvisors({ query: { q: 'seafood' } }, res)
    const [, body] = sent(res)
    expect(body.length).toBeGreaterThan(0)
    expect(body.some(a => a.id === 'anna-r')).toBe(true)
  })

  test('listAdvisors availableOnly hides unavailable advisors', async () => {
    const res = mkRes()
    await route.listAdvisors({ query: { available: 'true' } }, res)
    const [, body] = sent(res)
    expect(body.every(a => a.available === true)).toBe(true)
    expect(body.some(a => a.id === 'anna-r')).toBe(false) // anna is unavailable
  })

  test('getAdvisor returns a known advisor', async () => {
    const res = mkRes()
    await route.getAdvisor({ params: { id: 'bob-lindt' } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body.name).toBe('Bob Lindt')
  })

  test('getAdvisor 404s for an unknown id', async () => {
    const res = mkRes()
    await route.getAdvisor({ params: { id: 'nobody' } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(404)
    expect(body.error.code).toBe('NOT_FOUND')
  })
})

describe('groups', () => {
  test('listGroups returns listed groups and filters by q', async () => {
    const all = mkRes()
    await route.listGroups({ query: {} }, all)
    expect(sent(all)[1].length).toBeGreaterThan(0)

    const filtered = mkRes()
    await route.listGroups({ query: { q: 'tax' } }, filtered)
    expect(sent(filtered)[1].some(g => g.id === 'tax-automation')).toBe(true)
  })

  test('getGroup returns a group / 404s for unknown', async () => {
    const okRes = mkRes()
    await route.getGroup({ params: { id: 'seafood-modelling' } }, okRes)
    expect(sent(okRes)[0]).toBe(200)

    const missing = mkRes()
    await route.getGroup({ params: { id: 'no-group' } }, missing)
    expect(sent(missing)[0]).toBe(404)
  })

  test('createGroup requires a name', async () => {
    const res = mkRes()
    await route.createGroup({ body: { name: '   ' } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(400)
    expect(body.error.code).toBe('MISSING_NAME')
  })

  test('createGroup creates a group owned by the viewer', async () => {
    const res = mkRes()
    await route.createGroup({ body: { name: 'Coastal Cashflow', tags: ['cashflow'] } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body.name).toBe('Coastal Cashflow')
    expect(body.members).toEqual([{ id: 'me', name: 'Mike Barnes' }])
  })

  test('joinGroup records a consent-based request / 404s for unknown group', async () => {
    const okRes = mkRes()
    await route.joinGroup({ params: { id: 'tax-automation' } }, okRes)
    const [status, body] = sent(okRes)
    expect(status).toBe(200)
    expect(body).toEqual(expect.objectContaining({ success: true, status: 'requested' }))

    const missing = mkRes()
    await route.joinGroup({ params: { id: 'no-group' } }, missing)
    expect(sent(missing)[0]).toBe(404)
  })

  test('listMyGroups returns groups the viewer manages', async () => {
    const res = mkRes()
    await route.listMyGroups({}, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body.some(g => g.id === 'seafood-modelling')).toBe(true)
  })
})

describe('group invitations', () => {
  async function makeGroup () {
    const res = mkRes()
    await route.createGroup({ body: { name: 'Invite Test Group' } }, res)
    return sent(res)[1].id
  }

  test('inviteToGroup invites a non-member into a group the viewer owns', async () => {
    const gid = await makeGroup()
    const res = mkRes()
    await route.inviteToGroup({ params: { id: gid }, body: { advisorId: 'bob-lindt' } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.invitee).toEqual({ id: 'bob-lindt', name: 'Bob Lindt' })
  })

  test('inviteToGroup requires an invitee', async () => {
    const gid = await makeGroup()
    const res = mkRes()
    await route.inviteToGroup({ params: { id: gid }, body: {} }, res)
    expect(sent(res)[0]).toBe(400)
    expect(sent(res)[1].error.code).toBe('MISSING_ADVISOR')
  })

  test('inviteToGroup 404s for an unknown group', async () => {
    const res = mkRes()
    await route.inviteToGroup({ params: { id: 'no-group' }, body: { advisorId: 'bob-lindt' } }, res)
    expect(sent(res)[0]).toBe(404)
  })

  test('inviteToGroup 403s when the viewer does not manage the group', async () => {
    const res = mkRes()
    // tax-automation's only member is bob-lindt, not the viewer.
    await route.inviteToGroup({ params: { id: 'tax-automation' }, body: { advisorId: 'anna-r' } }, res)
    expect(sent(res)[0]).toBe(403)
    expect(sent(res)[1].error.code).toBe('NOT_MANAGER')
  })

  test('inviteToGroup 409s when the invitee is already a member', async () => {
    const res = mkRes()
    // seafood-modelling already contains bob-lindt, and the viewer is a member.
    await route.inviteToGroup({ params: { id: 'seafood-modelling' }, body: { advisorId: 'bob-lindt' } }, res)
    expect(sent(res)[0]).toBe(409)
    expect(sent(res)[1].error.code).toBe('ALREADY_MEMBER')
  })

  test('acceptInvitation joins the group / 404s for unknown', async () => {
    const okRes = mkRes()
    await route.acceptInvitation({ params: { id: 't-inv-hosp' } }, okRes)
    const [status, body] = sent(okRes)
    expect(status).toBe(200)
    expect(body).toEqual(expect.objectContaining({ success: true, accepted: true }))

    const missing = mkRes()
    await route.acceptInvitation({ params: { id: 'no-thread' } }, missing)
    expect(sent(missing)[0]).toBe(404)
  })

  test('declineInvitation records a decline / 404s for unknown', async () => {
    const okRes = mkRes()
    await route.declineInvitation({ params: { id: 't-inv-tax' } }, okRes)
    expect(sent(okRes)[1]).toEqual(expect.objectContaining({ success: true, accepted: false }))

    const missing = mkRes()
    await route.declineInvitation({ params: { id: 'no-thread' } }, missing)
    expect(sent(missing)[0]).toBe(404)
  })
})

describe('messages & outreach', () => {
  test('messageGroup posts to a group thread', async () => {
    const res = mkRes()
    await route.messageGroup({ params: { id: 'seafood-modelling' }, body: { text: 'Hello group' } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body).toEqual(expect.objectContaining({ success: true, threadId: expect.any(String) }))
  })

  test('messageGroup creates a fresh thread for a group that has none yet', async () => {
    // tax-automation has no seeded group thread, so this exercises the create path.
    const res = mkRes()
    await route.messageGroup({ params: { id: 'tax-automation' }, body: { text: 'First message' } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.threadId).toEqual(expect.any(String))
  })

  test('messageGroup 404s for unknown group and 400s for empty text', async () => {
    const missing = mkRes()
    await route.messageGroup({ params: { id: 'no-group' }, body: { text: 'hi' } }, missing)
    expect(sent(missing)[0]).toBe(404)

    const empty = mkRes()
    await route.messageGroup({ params: { id: 'seafood-modelling' }, body: { text: '   ' } }, empty)
    expect(sent(empty)[0]).toBe(400)
    expect(sent(empty)[1].error.code).toBe('EMPTY')
  })

  test('sendOutreach requires a recipient and a reason', async () => {
    const res = mkRes()
    await route.sendOutreach({ body: { toId: 'bob-lindt' } }, res) // no context
    expect(sent(res)[0]).toBe(400)
    expect(sent(res)[1].error.code).toBe('MISSING_REASON')
  })

  test('sendOutreach sends a purposeful outreach, including the optional ask', async () => {
    const res = mkRes()
    await route.sendOutreach({ body: { toId: 'bob-lindt', context: 'Building a seafood model', ask: 'Open to collaborate?' } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body).toEqual(expect.objectContaining({ success: true, sent: true, threadId: expect.any(String) }))
  })

  test('sendOutreach still works when the recipient is not a known advisor', async () => {
    const res = mkRes()
    await route.sendOutreach({ body: { toId: 'external-42', context: 'Intro' } }, res)
    expect(sent(res)[0]).toBe(200)
  })

  test('listMessages returns the viewer thread summaries', async () => {
    const res = mkRes()
    await route.listMessages({}, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(Array.isArray(body.threads)).toBe(true)
    expect(body.threads.length).toBeGreaterThan(0)
  })

  test('getThread returns a thread / 404s for unknown', async () => {
    const okRes = mkRes()
    await route.getThread({ params: { id: 't-bob' } }, okRes)
    expect(sent(okRes)[0]).toBe(200)

    const missing = mkRes()
    await route.getThread({ params: { id: 'no-thread' } }, missing)
    expect(sent(missing)[0]).toBe(404)
  })

  test('replyThread appends / 400s empty / 404s unknown', async () => {
    const okRes = mkRes()
    await route.replyThread({ params: { id: 't-bob' }, body: { text: 'Reply' } }, okRes)
    expect(sent(okRes)[0]).toBe(200)

    const empty = mkRes()
    await route.replyThread({ params: { id: 't-bob' }, body: { text: '' } }, empty)
    expect(sent(empty)[0]).toBe(400)

    const missing = mkRes()
    await route.replyThread({ params: { id: 'no-thread' }, body: { text: 'x' } }, missing)
    expect(sent(missing)[0]).toBe(404)
  })
})

describe('connections', () => {
  test('listConnections buckets incoming/outgoing/connected + groups', async () => {
    const res = mkRes()
    await route.listConnections({}, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body).toEqual(expect.objectContaining({
      incoming: expect.any(Array),
outgoing: expect.any(Array),
      connected: expect.any(Array),
groups: expect.any(Array)
    }))
    expect(body.connected.some(c => c.advisor.id === 'sara-okafor')).toBe(true)
  })

  test('connect rejects connecting to yourself', async () => {
    const res = mkRes()
    await route.connect({ params: { id: 'me' } }, res)
    expect(sent(res)[0]).toBe(400)
    expect(sent(res)[1].error.code).toBe('SELF')
  })

  test('connect creates a pending request', async () => {
    const res = mkRes()
    await route.connect({ params: { id: 'bob-lindt' } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body).toEqual({ success: true, status: 'pending' })
  })

  test('acceptConnection accepts an incoming request / 404s unknown', async () => {
    const okRes = mkRes()
    await route.acceptConnection({ params: { id: 'c-anna' } }, okRes) // anna -> me (incoming)
    expect(sent(okRes)[1]).toEqual({ success: true, status: 'accepted' })

    const missing = mkRes()
    await route.acceptConnection({ params: { id: 'c-none' } }, missing)
    expect(sent(missing)[0]).toBe(404)
  })

  test('declineConnection declines an incoming request / 404s unknown', async () => {
    const okRes = mkRes()
    await route.declineConnection({ params: { id: 'c-anna' } }, okRes)
    expect(sent(okRes)[1]).toEqual({ success: true, status: 'declined' })

    const missing = mkRes()
    await route.declineConnection({ params: { id: 'c-none' } }, missing)
    expect(sent(missing)[0]).toBe(404)
  })
})

describe('marketplace', () => {
  test('listMarketplace returns listings with an owned flag', async () => {
    const res = mkRes()
    await route.listMarketplace({}, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body.every(l => typeof l.owned === 'boolean')).toBe(true)
  })

  test('getListing returns a listing / 404s unknown', async () => {
    const okRes = mkRes()
    await route.getListing({ params: { id: 'm-trucking' } }, okRes)
    expect(sent(okRes)[0]).toBe(200)

    const missing = mkRes()
    await route.getListing({ params: { id: 'm-none' } }, missing)
    expect(sent(missing)[0]).toBe(404)
  })

  test('createListing requires a title', async () => {
    const res = mkRes()
    await route.createListing({ body: { pageId: KNOWN_PAGE_ID } }, res)
    expect(sent(res)[0]).toBe(400)
    expect(sent(res)[1].error.code).toBe('MISSING_TITLE')
  })

  test('createListing requires a linked tool', async () => {
    const res = mkRes()
    await route.createListing({ body: { title: 'My Tool' } }, res)
    expect(sent(res)[0]).toBe(400)
    expect(sent(res)[1].error.code).toBe('MISSING_TOOL')
  })

  test('createListing rejects a tool that is not in the catalogue', async () => {
    const res = mkRes()
    await route.createListing({ body: { title: 'My Tool', pageId: 'id-0000000000' } }, res)
    expect(sent(res)[0]).toBe(400)
    expect(sent(res)[1].error.code).toBe('UNKNOWN_TOOL')
  })

  test('createListing succeeds with a valid catalogue tool and tags it group-owned (Tier 4)', async () => {
    const res = mkRes()
    await route.createListing({ body: { title: 'Real Tool', pageId: KNOWN_PAGE_ID } }, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(body.pageId).toBe(KNOWN_PAGE_ID)
    expect(body.title).toBe('Real Tool')
    expect(body.ipTier).toBe(4)
  })

  test('createListing refuses a locked / non-derivable framework (LOCKED_IP)', async () => {
    const res = mkRes()
    // '8-profit-levers' is a real catalogue id classified as a locked Tier-2 framework.
    await route.createListing({ body: { title: 'Locked Tool', pageId: '8-profit-levers' } }, res)
    expect(sent(res)[0]).toBe(400)
    expect(sent(res)[1].error.code).toBe('LOCKED_IP')
  })

  test('purchaseListing records a purchase / 404s unknown', async () => {
    const okRes = mkRes()
    await route.purchaseListing({ params: { id: 'm-trucking' } }, okRes)
    expect(sent(okRes)[1]).toEqual({ success: true, owned: true })

    const missing = mkRes()
    await route.purchaseListing({ params: { id: 'm-none' } }, missing)
    expect(sent(missing)[0]).toBe(404)
  })
})

describe('cross-org wall', () => {
  test('connect is blocked (403) when the target firm has opted out', async () => {
    require('../server/data/repository').setOrgPosture('Lindt & Co', 'closed')
    const res = mkRes()
    await route.connect({ params: { id: 'bob-lindt' } }, res)
    expect(sent(res)[0]).toBe(403)
    expect(sent(res)[1].error.code).toBe('CROSS_ORG_BLOCKED')
  })

  test('getAdvisor is blocked (403) across a closed firm', async () => {
    require('../server/data/repository').setOrgPosture('BDO Germany', 'closed')
    const res = mkRes()
    await route.getAdvisor({ params: { id: 'anna-r' } }, res)
    expect(sent(res)[0]).toBe(403)
    expect(sent(res)[1].error.code).toBe('CROSS_ORG_BLOCKED')
  })

  test('sendOutreach is blocked (403) across a closed firm', async () => {
    require('../server/data/repository').setOrgPosture('Lindt & Co', 'closed')
    const res = mkRes()
    await route.sendOutreach({ body: { toId: 'bob-lindt', context: 'Hello' } }, res)
    expect(sent(res)[0]).toBe(403)
    expect(sent(res)[1].error.code).toBe('CROSS_ORG_BLOCKED')
  })

  test('listAdvisors hides advisers behind a closed firm', async () => {
    require('../server/data/repository').setOrgPosture('Lindt & Co', 'closed')
    const res = mkRes()
    await route.listAdvisors({ query: {} }, res)
    expect(sent(res)[1].some(a => a.id === 'bob-lindt')).toBe(false)
  })
})

describe('notifications', () => {
  test('listNotifications returns the viewer notifications with an unread count', async () => {
    const res = mkRes()
    await route.listNotifications({}, res)
    const [status, body] = sent(res)
    expect(status).toBe(200)
    expect(Array.isArray(body.items)).toBe(true)
    expect(body.items.length).toBeGreaterThan(0)
    expect(body.unread).toBe(body.items.filter(n => !n.read).length)
    expect(body.items.every(n => n.userId === 'me')).toBe(true)
  })

  test('markNotificationsRead clears the unread count for the viewer', async () => {
    const before = mkRes()
    await route.listNotifications({}, before)
    const unread = sent(before)[1].unread
    expect(unread).toBeGreaterThan(0)

    const mark = mkRes()
    await route.markNotificationsRead({}, mark)
    expect(sent(mark)[1]).toEqual({ success: true, marked: unread })

    const after = mkRes()
    await route.listNotifications({}, after)
    expect(sent(after)[1].unread).toBe(0)
  })
})

describe('audit trail', () => {
  test('a significant action writes an audit entry', async () => {
    const audit = require('../server/data/auditLog')
    await route.createGroup({ body: { name: 'Audited Group' } }, mkRes())
    const rows = await audit.list({ action: 'group.create' })
    expect(rows.length).toBe(1)
    expect(rows[0]).toEqual(expect.objectContaining({ actorId: 'me', targetType: 'group' }))
  })

  test('a blocked cross-firm connection is audited as a security event', async () => {
    require('../server/data/repository').setOrgPosture('Lindt & Co', 'closed')
    const audit = require('../server/data/auditLog')
    await route.connect({ params: { id: 'bob-lindt' } }, mkRes())
    const rows = await audit.list({ action: 'connection.blocked' })
    expect(rows.length).toBe(1)
    expect(rows[0].meta).toEqual({ reason: 'cross_org' })
  })

  test('a refused locked-IP listing is audited', async () => {
    const audit = require('../server/data/auditLog')
    await route.createListing({ body: { title: 'Locked', pageId: '8-profit-levers' } }, mkRes())
    expect((await audit.list({ action: 'listing.locked_blocked' })).length).toBe(1)
  })

  test('getAuditLog returns the trail newest-first, with an action filter', async () => {
    await route.createGroup({ body: { name: 'G1' } }, mkRes())
    await route.connect({ params: { id: 'bob-lindt' } }, mkRes())

    const all = mkRes()
    await route.getAuditLog({ query: {} }, all)
    const [status, body] = sent(all)
    expect(status).toBe(200)
    expect(Array.isArray(body.entries)).toBe(true)
    expect(body.entries.length).toBeGreaterThanOrEqual(2)
    // Newest first: the connection request was recorded after the group create.
    expect(body.entries[0].action).toBe('connection.request')

    const filtered = mkRes()
    await route.getAuditLog({ query: { action: 'group.create' } }, filtered)
    expect(sent(filtered)[1].entries.every(e => e.action === 'group.create')).toBe(true)
  })
})
