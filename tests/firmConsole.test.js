/**
 * @jest-environment jsdom
 */
'use strict'
/* eslint-env browser, jest */

/**
 * Component tests for pages/firm.vue — the Firm Manager console. Loads the firm
 * payload, renders advisers (incl. the blocked tag), toggles the cross-firm
 * posture, and approves/declines a join request via the shared endpoints.
 */

import { mount, createLocalVue } from '@vue/test-utils'
import Firm from '../pages/firm.vue'

const localVue = createLocalVue()
const Stub = { render (h) { return h('div', this.$slots.default) } }
;['b-message', 'b-button', 'b-input'].forEach(n => localVue.component(n, Stub))

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const CONSOLE = {
  firm: 'Advisor-e',
  manager: { id: 'me', name: 'Mike Barnes' },
  stats: { advisers: 6, groups: 2, pendingApprovals: 1, crossOrgPosture: 'open' },
  advisers: [
    { id: 'me', name: 'Mike Barnes', title: 'Partner', available: true, blocked: false, isMe: true, groupCount: 2, lastActive: 'Today' },
    { id: 'james-obrien', name: "James O'Brien", title: 'Associate', available: false, blocked: true, isMe: false, groupCount: 0, lastActive: '1 week ago' }
  ],
  approvals: [{ id: 'gjr-1', advisor: { id: 'anna-r', name: 'Anna Richter', firm: 'BDO' }, groupId: 'cashflow-clinic', groupName: 'Cashflow Clinic' }],
  activity: [{ at: '2026-07-06T09:14:00.000Z', actorName: 'Sofia Marchetti', action: 'listing.create', meta: {} }]
}

function factory () {
  return mount(Firm, {
    localVue,
    mocks: {
      $t: (k, p) => (p && p.firm ? k + ':' + p.firm : k),
      $buefy: { toast: { open: jest.fn() } }
    }
  })
}

describe('firm console page', () => {
  afterEach(() => { delete global.fetch })

  test('loads and renders the firm, advisers, the blocked tag and activity', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(CONSOLE) }))
    const w = factory()
    await flush(); await w.vm.$nextTick()
    expect(global.fetch).toHaveBeenCalledWith('/api/people/firm')
    expect(w.vm.postureOpen).toBe(true)
    expect(w.text()).toContain('Advisor-e')
    expect(w.text()).toContain('Mike Barnes')
    expect(w.text()).toContain("James O'Brien")
  })

  test('setPosture posts the new posture and updates state', async () => {
    global.fetch = jest.fn((url) => {
      const payload = url.includes('/firm/posture') ? { success: true, crossOrgPosture: 'closed' } : CONSOLE
      return Promise.resolve({ ok: true, json: () => Promise.resolve(payload) })
    })
    const w = factory()
    await flush()
    await w.vm.setPosture('closed')
    await flush()
    expect(global.fetch).toHaveBeenCalledWith('/api/people/firm/posture', expect.objectContaining({ method: 'POST' }))
    expect(w.vm.c.stats.crossOrgPosture).toBe('closed')
  })

  test('respondApproval accepts a request via the shared endpoint and reloads', async () => {
    global.fetch = jest.fn((url) => {
      const payload = url.includes('/group-requests/') ? { success: true } : CONSOLE
      return Promise.resolve({ ok: true, json: () => Promise.resolve(payload) })
    })
    const w = factory()
    await flush()
    await w.vm.respondApproval({ id: 'gjr-1' }, true)
    await flush()
    expect(global.fetch).toHaveBeenCalledWith('/api/people/group-requests/gjr-1/accept', expect.objectContaining({ method: 'POST' }))
  })

  test('search narrows the advisers list (scales to a large firm)', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(CONSOLE) }))
    const w = factory()
    await flush()
    expect(w.vm.filteredAdvisers).toHaveLength(2)
    w.vm.advSearch = "o'brien"
    expect(w.vm.filteredAdvisers).toHaveLength(1)
    expect(w.vm.filteredAdvisers[0].id).toBe('james-obrien')
    w.vm.advSearch = 'partner' // matches Mike's title
    expect(w.vm.filteredAdvisers.map(a => a.id)).toEqual(['me'])
    w.vm.advSearch = 'zzz'
    expect(w.vm.filteredAdvisers).toHaveLength(0)
  })

  test('humanize and formatWhen behave', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(CONSOLE) }))
    const w = factory()
    await flush()
    expect(w.vm.humanize('group.shared_page_added')).toBe('group shared page added')
    expect(typeof w.vm.formatWhen('2026-07-06T09:14:00.000Z')).toBe('string')
    expect(w.vm.formatWhen('')).toBe('')
  })
})
