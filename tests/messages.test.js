/**
 * @jest-environment jsdom
 */
'use strict'
/* eslint-env browser, jest */

/**
 * Component tests for pages/messages.vue — thread list (requests vs chats),
 * per-message translation, invitation accept/decline, and replies. fetch is
 * URL-aware; $i18n/$route/$buefy mocked; this.$set stays real (mount).
 */

import { mount, createLocalVue } from '@vue/test-utils'
import Messages from '../pages/messages.vue'

const localVue = createLocalVue()
const Stub = { render (h) { return h('div', this.$slots.default) } }
;['b-message', 'b-tag', 'b-switch', 'b-button', 'page-help'].forEach(n => localVue.component(n, Stub))

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const THREADS = {
  threads: [
    { id: 't-bob', kind: 'outreach', withId: 'bob', withName: 'Bob Lindt', status: 'request', direction: 'incoming', lastText: 'Hallo' },
    { id: 't-chat', kind: 'outreach', withId: 'sara', withName: 'Sara Okafor', status: 'active', direction: 'outgoing', lastText: 'Sure' },
    { id: 't-inv', kind: 'invitation', withId: 'grp', withName: 'Seafood', status: 'request', direction: 'incoming', lastText: 'Join us' }
  ]
}
const CURRENT = { id: 't-bob', kind: 'outreach', withName: 'Bob Lindt', status: 'active', direction: 'incoming', messages: [{ from: 'Bob Lindt', text: 'Gerne!', lang: 'de' }] }
const REPLIED = { ...CURRENT, messages: [...CURRENT.messages, { from: 'Me', text: 'Thanks', lang: 'en' }] }

function mockApi () {
  global.fetch = jest.fn((url) => {
    let payload = {}
    if (url.includes('/reply')) { payload = REPLIED } else if (url.includes('/invitations/')) { payload = { success: true } } else if (url === '/api/translate/locale') { payload = { t: 'Willingly!' } } else if (url.startsWith('/api/people/messages/')) { payload = CURRENT } else if (url === '/api/people/messages') { payload = THREADS }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(payload) })
  })
}

function factory (routeQuery) {
  return mount(Messages, {
    localVue,
    mocks: {
      $t: key => key,
      $i18n: { locale: 'en' },
      $route: { query: routeQuery || {} },
      $buefy: { toast: { open: jest.fn() } }
    }
  })
}

describe('messages page', () => {
  afterEach(() => { delete global.fetch })

  test('loads threads and splits them into requests vs chats', async () => {
    mockApi()
    const w = factory()
    await flush(); await w.vm.$nextTick()
    expect(w.vm.threads).toHaveLength(3)
    expect(w.vm.requests.map(t => t.id)).toEqual(['t-bob', 't-inv'])
    expect(w.vm.chats.map(t => t.id)).toEqual(['t-chat'])
  })

  test('auto-selects the thread named in the route query', async () => {
    mockApi()
    const w = factory({ thread: 't-bob' })
    await flush(); await w.vm.$nextTick()
    expect(w.vm.selectedId).toBe('t-bob')
    expect(w.vm.current.id).toBe('t-bob')
  })

  test('select() loads a conversation', async () => {
    mockApi()
    const w = factory()
    await flush()
    await w.vm.select('t-bob')
    await flush()
    expect(global.fetch).toHaveBeenCalledWith('/api/people/messages/t-bob')
    expect(w.vm.current.withName).toBe('Bob Lindt')
  })

  test('send() posts a reply, updates the conversation and clears the box', async () => {
    mockApi()
    const w = factory()
    await flush()
    w.vm.current = { ...CURRENT }
    w.vm.reply = 'Thanks'
    await w.vm.send()
    await flush()
    expect(global.fetch).toHaveBeenCalledWith('/api/people/messages/t-bob/reply', expect.objectContaining({ method: 'POST' }))
    expect(w.vm.reply).toBe('')
    expect(w.vm.current.messages).toHaveLength(2)
  })

  test('send() does nothing with an empty message', async () => {
    mockApi()
    const w = factory()
    await flush(); global.fetch.mockClear()
    w.vm.current = { ...CURRENT }
    w.vm.reply = '   '
    await w.vm.send()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('respondInvite() accepts, toasts, and reloads', async () => {
    mockApi()
    const w = factory()
    await flush()
    w.vm.current = { id: 't-inv', kind: 'invitation', direction: 'incoming', status: 'request', messages: [] }
    await w.vm.respondInvite(true)
    await flush()
    expect(global.fetch).toHaveBeenCalledWith('/api/people/invitations/t-inv/accept', expect.objectContaining({ method: 'POST' }))
    expect(w.vm.$buefy.toast.open).toHaveBeenCalledWith(expect.objectContaining({ type: 'is-success' }))
  })

  test('translateMsg() fetches a translation and stores it', async () => {
    mockApi()
    const w = factory()
    await flush()
    w.vm.current = { ...CURRENT }
    await w.vm.translateMsg({ text: 'Gerne!', lang: 'de' }, 0)
    await flush()
    expect(global.fetch).toHaveBeenCalledWith('/api/translate/locale', expect.objectContaining({ method: 'POST' }))
    expect(w.vm.translations['t-bob:0']).toBe('Willingly!')
    expect(w.vm.translating['t-bob:0']).toBe(false)
  })

  test('isForeign flags a message only when its lang differs from the reader', () => {
    mockApi()
    const { vm } = factory()
    expect(vm.isForeign({ lang: 'de' })).toBe(true) // reader is 'en'
    expect(vm.isForeign({ lang: 'en' })).toBe(false)
    expect(vm.isForeign({})).toBe(false)
  })

  test('turning on auto-translate translates foreign messages', async () => {
    mockApi()
    const w = factory()
    await flush()
    w.vm.current = { ...CURRENT }
    global.fetch.mockClear()
    w.vm.autoTranslate = true
    await w.vm.$nextTick(); await flush()
    expect(global.fetch).toHaveBeenCalledWith('/api/translate/locale', expect.objectContaining({ method: 'POST' }))
  })
})
