/**
 * @jest-environment jsdom
 */
'use strict'
/* eslint-env browser, jest */

/**
 * Component tests for pages/messages.vue — now just the LEFT RAIL (requests vs
 * chats + selection). The conversation view moved to components/shared/
 * ConversationPane (Phase 3 of FEAT-CONNECTING) and is covered by
 * tests/conversationPane.test.js. <conversation-pane> is stubbed here.
 */

import { mount, createLocalVue } from '@vue/test-utils'
import Messages from '../pages/messages.vue'

const localVue = createLocalVue()
const Stub = { render (h) { return h('div', this.$slots.default) } }
;['b-message', 'page-help', 'conversation-pane'].forEach(n => localVue.component(n, Stub))

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const THREADS = {
  threads: [
    { id: 't-bob', kind: 'outreach', withId: 'bob', withName: 'Bob Lindt', status: 'request', direction: 'incoming', lastText: 'Hallo' },
    { id: 't-chat', kind: 'outreach', withId: 'sara', withName: 'Sara Okafor', status: 'active', direction: 'outgoing', lastText: 'Sure' },
    { id: 't-inv', kind: 'invitation', withId: 'grp', withName: 'Seafood', status: 'request', direction: 'incoming', lastText: 'Join us' }
  ]
}

function mockApi () {
  global.fetch = jest.fn((url) => {
    const payload = url === '/api/people/messages' ? THREADS : {}
    return Promise.resolve({ ok: true, json: () => Promise.resolve(payload) })
  })
}

function factory (routeQuery) {
  return mount(Messages, {
    localVue,
    mocks: {
      $t: key => key,
      $route: { query: routeQuery || {} },
      $buefy: { toast: { open: jest.fn() } }
    }
  })
}

describe('messages page (left rail)', () => {
  afterEach(() => { delete global.fetch })

  test('loads threads and splits them into requests vs chats', async () => {
    mockApi()
    const w = factory()
    await flush(); await w.vm.$nextTick()
    expect(w.vm.threads).toHaveLength(3)
    expect(w.vm.requests.map(t => t.id)).toEqual(['t-bob', 't-inv'])
    expect(w.vm.chats.map(t => t.id)).toEqual(['t-chat'])
  })

  test('select() sets the selected thread id (the pane loads it)', async () => {
    mockApi()
    const w = factory()
    await flush()
    w.vm.select('t-bob')
    expect(w.vm.selectedId).toBe('t-bob')
  })

  test('auto-selects the thread named in the route query', async () => {
    mockApi()
    const w = factory({ thread: 't-chat' })
    await flush(); await w.vm.$nextTick()
    expect(w.vm.selectedId).toBe('t-chat')
  })
})
