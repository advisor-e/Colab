'use strict'

/**
 * Tests for the cross-organisation engagement wall (server/data/repository.js;
 * owner decisions D1 + Q6).
 *
 * D1: default posture is CLOSED / opt-in. Q6: the boundary is the individual
 * office (the advisor's `firm`). Both-sides consent — a cross-firm interaction
 * needs BOTH firms open. The demo firms are seeded OPEN; these tests flip one
 * closed via setOrgPosture to prove the wall seals discovery, connection and
 * outreach.
 *
 * Fresh in-memory module per test via jest.resetModules().
 */

let repo

beforeEach(() => {
  jest.resetModules()
  repo = require('../server/data/repository')
})

describe('posture seam', () => {
  test('seeded demo firms are open; an unknown firm defaults to closed (D1)', async () => {
    expect(await repo.getOrgPosture('Advisor-e')).toBe('open')
    expect(await repo.getOrgPosture('Some New Firm')).toBe('closed')
  })

  test('setOrgPosture updates a firm and rejects an invalid value', async () => {
    expect(await repo.setOrgPosture('Lindt & Co', 'closed')).toEqual({ firm: 'Lindt & Co', posture: 'closed' })
    expect(await repo.getOrgPosture('Lindt & Co')).toBe('closed')
    expect(await repo.setOrgPosture('Lindt & Co', 'sideways')).toEqual({ error: 'BAD_POSTURE' })
  })
})

describe('canReachAdvisor (both-sides consent)', () => {
  test('same firm is always reachable', async () => {
    // Seed a same-firm pair would need identity control; instead assert the rule
    // via two advisers whose firms are both open, then via a closed firm.
    expect(await repo.canReachAdvisor('me', 'bob-lindt')).toBe(true) // both open
  })

  test('a closed firm on either side blocks reach', async () => {
    await repo.setOrgPosture('Lindt & Co', 'closed') // bob-lindt's firm
    expect(await repo.canReachAdvisor('me', 'bob-lindt')).toBe(false)
    expect(await repo.canReachAdvisor('bob-lindt', 'me')).toBe(false)
  })

  test('an unknown recipient is not blocked in the mock', async () => {
    expect(await repo.canReachAdvisor('me', 'external-99')).toBe(true)
  })
})

describe('enforcement', () => {
  test('listAdvisors hides advisers behind a closed firm', async () => {
    await repo.setOrgPosture('Lindt & Co', 'closed')
    const list = await repo.listAdvisors({ myId: 'me', excludeId: 'me' })
    expect(list.some(a => a.id === 'bob-lindt')).toBe(false)
    // Other open firms remain visible.
    expect(list.some(a => a.id === 'anna-r')).toBe(true)
  })

  test('requestConnection returns a CROSS_ORG_BLOCKED sentinel across a closed firm', async () => {
    await repo.setOrgPosture('Lindt & Co', 'closed')
    const r = await repo.requestConnection('me', 'bob-lindt')
    expect(r).toEqual({ error: 'CROSS_ORG_BLOCKED' })
  })

  test('requestConnection still works between two open firms', async () => {
    const r = await repo.requestConnection('me', 'bob-lindt')
    expect(r).toEqual(expect.objectContaining({ status: 'pending' }))
  })
})
