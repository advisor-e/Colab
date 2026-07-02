/**
 * @jest-environment jsdom
 */
'use strict'
/* eslint-env browser, jest */

/**
 * Component tests for pages/connections.vue.
 *
 * A data-driven page: it fetches /api/people/connections on mount, renders the
 * incoming/connected/pending buckets + groups, and responds to accept/decline.
 * fetch, $t and $buefy are mocked; Buefy/nuxt/custom tags are stubbed via a
 * localVue so the page's own markup renders without pulling in Buefy.
 */

import { mount, createLocalVue } from '@vue/test-utils'
import Connections from '../pages/connections.vue'

const localVue = createLocalVue()
const Stub = { render (h) { return h('div', this.$slots.default) } }
;['b-message', 'b-button', 'page-help', 'nuxt-link'].forEach(n => localVue.component(n, Stub))

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const PAYLOAD = {
  incoming: [{ id: 'c-anna', advisor: { id: 'anna-r', name: 'Anna Richter', firm: 'BDO', strengths: ['modelling'] } }],
  outgoing: [{ id: 'c-x', advisor: { id: 'x', name: 'Ex Person', firm: 'F' } }],
  connected: [{ id: 'c-sara', advisor: { id: 'sara', name: 'Sara Okafor', firm: 'Okafor', strengths: ['coaching'] } }],
  groups: [{ id: 'g1', name: 'Seafood Group', icon: '🐟', members: [{ id: 'm', name: 'Bob Lindt' }] }]
}

function mockFetch (payload, ok) {
  global.fetch = jest.fn(() => Promise.resolve({ ok: ok !== false, json: () => Promise.resolve(payload) }))
}

function factory () {
  return mount(Connections, {
    localVue,
    mocks: { $t: key => key, $buefy: { toast: { open: jest.fn() } } }
  })
}

describe('connections page', () => {
  afterEach(() => { delete global.fetch })

  test('fetches connections on mount and renders each bucket', async () => {
    mockFetch(PAYLOAD)
    const w = factory()
    await flush(); await w.vm.$nextTick()

    expect(global.fetch).toHaveBeenCalledWith('/api/people/connections')
    expect(w.vm.loading).toBe(false)
    const text = w.text()
    expect(text).toContain('Anna Richter') // incoming
    expect(text).toContain('Sara Okafor') // connected
    expect(text).toContain('Seafood Group') // group
    expect(text).toContain('Ex Person') // pending/outgoing
  })

  test('initials returns up to two uppercase letters', () => {
    mockFetch(PAYLOAD)
    const { vm } = factory()
    expect(vm.initials('Anna Richter')).toBe('AR')
    expect(vm.initials('Madonna')).toBe('M')
    expect(vm.initials('')).toBe('')
  })

  test('avatarStyle is deterministic per id and returns a gradient', () => {
    mockFetch(PAYLOAD)
    const { vm } = factory()
    const a = vm.avatarStyle({ id: 'anna-r' })
    expect(a).toEqual(vm.avatarStyle({ id: 'anna-r' }))
    expect(a.background).toMatch(/linear-gradient/)
  })

  test('respond() posts accept, reloads, and toasts', async () => {
    mockFetch(PAYLOAD)
    const w = factory()
    await flush()
    const toast = w.vm.$buefy.toast.open
    global.fetch.mockClear()

    await w.vm.respond({ id: 'c-anna' }, true)
    await flush()

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/people/connections/c-anna/accept',
      expect.objectContaining({ method: 'POST' })
    )
    expect(toast).toHaveBeenCalled()
  })

  test('respond() posts decline for a rejection', async () => {
    mockFetch(PAYLOAD)
    const w = factory()
    await flush()
    global.fetch.mockClear()

    await w.vm.respond({ id: 'c-anna' }, false)
    await flush()

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/people/connections/c-anna/decline',
      expect.objectContaining({ method: 'POST' })
    )
  })

  test('filteredConnected narrows the connected list by name/firm', async () => {
    mockFetch(PAYLOAD)
    const w = factory()
    await flush()
    expect(w.vm.filteredConnected.length).toBe(1)
    w.vm.search = 'sara'
    expect(w.vm.filteredConnected.length).toBe(1)
    w.vm.search = 'zzz-nobody'
    expect(w.vm.filteredConnected.length).toBe(0)
  })

  test('message() opens a thread and navigates to it in Messages', async () => {
    mockFetch(PAYLOAD)
    const push = jest.fn()
    const w = mount(Connections, {
      localVue,
      mocks: { $t: key => key, $buefy: { toast: { open: jest.fn() } }, $router: { push } }
    })
    await flush()
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, threadId: 't-dm-9' }) }))
    await w.vm.message({ id: 'sara', name: 'Sara Okafor' })
    await flush()
    expect(global.fetch).toHaveBeenCalledWith('/api/people/advisors/sara/thread', expect.objectContaining({ method: 'POST' }))
    expect(push).toHaveBeenCalledWith('/messages?thread=t-dm-9')
  })

  test('a failed load leaves the buckets empty and stops loading', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('offline')))
    const w = factory()
    await flush(); await w.vm.$nextTick()

    expect(w.vm.loading).toBe(false)
    expect(w.vm.data.incoming).toEqual([])
  })

  test('a non-OK response keeps the safe default shape and toasts (no crash)', async () => {
    // A 401/500 body is an error envelope with no incoming/connected arrays; the
    // page must NOT adopt it, or the template crashes on data.incoming.length.
    mockFetch({ success: false, error: { code: 'X' } }, false)
    const w = factory()
    await flush(); await w.vm.$nextTick()

    expect(w.vm.loading).toBe(false)
    expect(w.vm.data.incoming).toEqual([])
    expect(w.vm.data.groups).toEqual([])
    expect(w.vm.$buefy.toast.open).toHaveBeenCalledWith(expect.objectContaining({ type: 'is-danger' }))
  })
})
