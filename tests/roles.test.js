'use strict'
/* eslint-env jest */

/**
 * Unit tests for server/data/roles.js — the Q-ROLES role/tier resolver.
 *
 * This is an AUTHORIZATION surface, so the "who may manage whom" matrix is covered
 * exhaustively (every tier × same/other firm/country). roles.js keeps module-level
 * state (the interim ROLE_OVERRIDES table), so each test requires it fresh via
 * jest.resetModules() and never leaks an override into the next.
 */

const { AUTH } = require('../config/integration')

function fresh () {
  jest.resetModules()
  return require('../server/data/roles')
}

// Minimal advisor records — only the fields the resolver reads.
const firmMgr = { id: 'fm', firm: 'Acme', country: 'DE', firmManager: true }
const acmeDE = { id: 'a1', firm: 'Acme', country: 'DE' }
const otherDE = { id: 'a2', firm: 'Other DE', country: 'DE' }
const acmeIE = { id: 'a3', firm: 'Acme', country: 'IE' }

describe('resolveTier — precedence', () => {
  test('explicit record.tier wins over everything', () => {
    const roles = fresh()
    roles.setOverride('x', 'group_manager')
    const rec = { id: 'x', tier: 'global_manager', firmManager: true }
    expect(roles.resolveTier(rec, { role: AUTH.managerRole })).toBe('global_manager')
  })

  test('override table beats the JWT claim and the seed flag', () => {
    const roles = fresh()
    roles.setOverride('x', 'group_manager')
    expect(roles.resolveTier({ id: 'x', firmManager: true }, { role: AUTH.adminRole })).toBe('group_manager')
  })

  test('JWT role claim is used when there is no record tier / override', () => {
    const roles = fresh()
    expect(roles.resolveTier({ id: 'x' }, { role: AUTH.managerRole })).toBe('firm_manager')
    expect(roles.resolveTier({ id: 'x' }, { role: AUTH.adminRole })).toBe('mentor')
  })

  test('legacy firmManager seed flag maps to firm_manager', () => {
    const roles = fresh()
    expect(roles.resolveTier({ id: 'x', firmManager: true })).toBe('firm_manager')
  })

  test('defaults to advisor (unknown / missing)', () => {
    const roles = fresh()
    expect(roles.resolveTier({ id: 'x' })).toBe('advisor')
    expect(roles.resolveTier(null)).toBe('advisor')
    expect(roles.resolveTier({ id: 'x' }, { role: 'something-unmapped' })).toBe('advisor')
  })

  test('setOverride ignores an unknown tier value', () => {
    const roles = fresh()
    roles.setOverride('x', 'not-a-tier')
    expect(roles.resolveTier({ id: 'x' })).toBe('advisor')
  })
})

describe('tierFromRoleClaim', () => {
  test('maps the configured Advisory roles', () => {
    const roles = fresh()
    expect(roles.tierFromRoleClaim(AUTH.managerRole)).toBe('firm_manager')
    expect(roles.tierFromRoleClaim(AUTH.adminRole)).toBe('mentor')
    expect(roles.tierFromRoleClaim(AUTH.mentorRole)).toBe('mentor')
  })
  test('returns null for absent / unknown roles', () => {
    const roles = fresh()
    expect(roles.tierFromRoleClaim('')).toBeNull()
    expect(roles.tierFromRoleClaim(undefined)).toBeNull()
    expect(roles.tierFromRoleClaim('random')).toBeNull()
  })
})

describe('isManagerTier', () => {
  test('managing tiers are managers; advisor/client are not', () => {
    const roles = fresh()
    ;['mentor', 'global_manager', 'group_manager', 'firm_manager'].forEach(t =>
      expect(roles.isManagerTier(t)).toBe(true))
    ;['advisor', 'client'].forEach(t =>
      expect(roles.isManagerTier(t)).toBe(false))
  })
})

describe('canManage — the scope matrix', () => {
  test('firm_manager reaches only their own firm (not another firm in the same country)', () => {
    const roles = fresh()
    expect(roles.canManage(firmMgr, acmeDE)).toBe(true) // same firm
    expect(roles.canManage(firmMgr, otherDE)).toBe(false) // same country, other firm
  })

  test('group_manager reaches everyone in their country, across firms', () => {
    const roles = fresh()
    const gm = { id: 'gm', firm: 'Acme', country: 'DE', tier: 'group_manager' }
    expect(roles.canManage(gm, acmeDE)).toBe(true) // same firm, same country
    expect(roles.canManage(gm, otherDE)).toBe(true) // OTHER firm, same country
    expect(roles.canManage(gm, acmeIE)).toBe(false) // other country
  })

  test('global_manager and mentor reach everyone', () => {
    const roles = fresh()
    const glob = { id: 'g', tier: 'global_manager', firm: 'HQ', country: 'DE' }
    const mentor = { id: 'm', tier: 'mentor', firm: 'HQ', country: 'DE' }
    ;[acmeDE, otherDE, acmeIE].forEach((t) => {
      expect(roles.canManage(glob, t)).toBe(true)
      expect(roles.canManage(mentor, t)).toBe(true)
    })
  })

  test('advisor and client manage no-one', () => {
    const roles = fresh()
    const advisor = { id: 'ad', firm: 'Acme', country: 'DE' }
    const client = { id: 'cl', firm: 'Acme', country: 'DE', tier: 'client' }
    expect(roles.canManage(advisor, acmeDE)).toBe(false)
    expect(roles.canManage(client, acmeDE)).toBe(false)
  })

  test('null manager or target is never manageable', () => {
    const roles = fresh()
    expect(roles.canManage(null, acmeDE)).toBe(false)
    expect(roles.canManage(firmMgr, null)).toBe(false)
  })
})
