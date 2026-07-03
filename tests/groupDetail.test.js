/**
 * @jest-environment jsdom
 */
'use strict'
/* eslint-env browser, jest */

/**
 * Component tests for pages/groups/_id.vue — the group detail page: loads the
 * group by route id, join request, and a "message the group" modal that hands
 * off to the messages thread.
 */

import { mount, createLocalVue } from '@vue/test-utils'
import GroupDetail from '../pages/groups/_id.vue'

const localVue = createLocalVue()
const Stub = { render (h) { return h('div', this.$slots.default) } }
;['b-message', 'b-modal', 'b-input', 'b-button', 'page-help'].forEach(n => localVue.component(n, Stub))

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const GROUP = {
  id: 'seafood',
name: 'Seafood Modelling',
icon: '🐟',
createdBy: 'Anna Richter',
  firms: 5,
memberCount: 12,
summary: 'Shared valuation model',
tags: ['seafood', 'valuation'],
  members: [{ id: 'me', name: 'Mike Barnes' }, { id: 'anna-r', name: 'Anna Richter' }]
}

function mockApi (groupOk) {
  global.fetch = jest.fn((url) => {
    let payload = {}
    if (url.includes('/join')) { payload = { success: true } } else if (url.includes('/message')) { payload = { success: true, threadId: 't-grp' } } else { payload = GROUP }
    return Promise.resolve({ ok: groupOk !== false, json: () => Promise.resolve(payload) })
  })
}

function factory () {
  return mount(GroupDetail, {
    localVue,
    mocks: {
      $t: key => key,
      $route: { params: { id: 'seafood' } },
      $router: { push: jest.fn(), back: jest.fn() },
      $buefy: { toast: { open: jest.fn() } }
    }
  })
}

describe('group detail page', () => {
  afterEach(() => { delete global.fetch })

  test('loads the group by route id and renders it', async () => {
    mockApi()
    const w = factory()
    await flush(); await w.vm.$nextTick()
    expect(global.fetch).toHaveBeenCalledWith('/api/people/groups/seafood')
    expect(w.vm.loading).toBe(false)
    expect(w.vm.group.name).toBe('Seafood Modelling')
    expect(w.text()).toContain('Seafood Modelling')
    expect(w.text()).toContain('Anna Richter')
  })

  test('shows the not-found state when the group is missing', async () => {
    mockApi(false) // res.ok === false
    const w = factory()
    await flush(); await w.vm.$nextTick()
    expect(w.vm.group).toBeNull()
    expect(w.vm.loading).toBe(false)
  })

  test('join() posts a request and toasts success', async () => {
    mockApi()
    const w = factory()
    await flush(); global.fetch.mockClear()
    await w.vm.join()
    await flush()
    expect(global.fetch).toHaveBeenCalledWith('/api/people/groups/seafood/join', expect.objectContaining({ method: 'POST' }))
    expect(w.vm.joining).toBe(false)
    expect(w.vm.$buefy.toast.open).toHaveBeenCalledWith(expect.objectContaining({ type: 'is-success' }))
  })

  test('messageGroup opens the modal; sendGroupMessage posts and routes', async () => {
    mockApi()
    const w = factory()
    await flush()
    w.vm.messageGroup()
    expect(w.vm.msgOpen).toBe(true)

    w.vm.msgText = 'Hello team'
    await w.vm.sendGroupMessage()
    await flush()
    expect(global.fetch).toHaveBeenCalledWith('/api/people/groups/seafood/message', expect.objectContaining({ method: 'POST' }))
    expect(w.vm.msgOpen).toBe(false)
    expect(w.vm.$router.push).toHaveBeenCalledWith('/connecting?thread=t-grp')
  })

  test('a manager loads pending join requests and can approve one', async () => {
    global.fetch = jest.fn((url) => {
      let payload = {}
      if (url.includes('/group-requests/')) { payload = { success: true, status: 'accepted' } } else if (url.endsWith('/requests')) { payload = { requests: [{ id: 'gjr-1', advisor: { id: 'bob-lindt', name: 'Bob Lindt', firm: 'Lindt' } }] } } else { payload = Object.assign({}, GROUP, { joinStatus: 'member' }) }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(payload) })
    })
    const w = factory()
    await flush(); await w.vm.$nextTick()
    expect(w.vm.joinRequests).toHaveLength(1)
    expect(w.text()).toContain('Bob Lindt')
    await w.vm.respondRequest({ id: 'gjr-1' }, true)
    await flush()
    expect(global.fetch).toHaveBeenCalledWith('/api/people/group-requests/gjr-1/accept', expect.objectContaining({ method: 'POST' }))
  })

  test('renders the shared workspace links to Advisor-e', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(Object.assign({}, GROUP, {
        sharedPages: [{ pageId: 'ae-x', title: 'Cashflow Model', openUrl: 'https://app.advisor-e.com/p/ae-x' }]
      }))
    }))
    const w = factory()
    await flush(); await w.vm.$nextTick()
    expect(w.text()).toContain('Cashflow Model')
    expect(w.find('a[href="https://app.advisor-e.com/p/ae-x"]').exists()).toBe(true)
  })

  test('join flips the page to Request Pending', async () => {
    mockApi()
    const w = factory()
    await flush(); await w.vm.$nextTick()
    await w.vm.join()
    await flush()
    expect(global.fetch).toHaveBeenCalledWith('/api/people/groups/seafood/join', expect.objectContaining({ method: 'POST' }))
    expect(w.vm.group.joinStatus).toBe('requested')
  })

  test('sendGroupMessage does nothing when empty', async () => {
    mockApi()
    const w = factory()
    await flush(); global.fetch.mockClear()
    w.vm.msgText = '   '
    await w.vm.sendGroupMessage()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('initials and avatarStyle behave', async () => {
    mockApi()
    const w = factory()
    await flush()
    expect(w.vm.initials({ name: 'Anna Richter' })).toBe('AR')
    expect(w.vm.avatarStyle({ id: 'anna-r' }).background).toMatch(/linear-gradient/)
  })
})
