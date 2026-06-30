<template lang="pug">
  section.section
    .container
      .section-banner.section-banner--messages
        span.ico 💬
        h1 {{ $t('messages.title') }}
      .columns
        .column.is-one-third
          p.heading {{ $t('messages.requests') }}
          p.has-text-grey.is-size-7.mb-2(v-if="!requests.length") —
          a.thread-item(v-for="t in requests" :key="t.id" :class="{ 'is-active': t.id === selectedId }" @click="select(t.id)")
            .avatar.avatar--sm(:style="avatarStyle(t)") {{ t.kind === 'group' ? '👥' : initials(t.withName) }}
            .thread-text
              p.has-text-weight-semibold {{ t.withName }}
              p.has-text-grey.is-size-7.truncate {{ t.lastText }}
          p.heading.mt-5 {{ $t('messages.chats') }}
          p.has-text-grey.is-size-7.mb-2(v-if="!chats.length") —
          a.thread-item(v-for="t in chats" :key="t.id" :class="{ 'is-active': t.id === selectedId }" @click="select(t.id)")
            .avatar.avatar--sm(:style="avatarStyle(t)") {{ t.kind === 'group' ? '👥' : initials(t.withName) }}
            .thread-text
              p.has-text-weight-semibold {{ t.withName }}
              p.has-text-grey.is-size-7.truncate {{ t.lastText }}

        .column
          b-message(v-if="!current" type="is-info") {{ $t('messages.empty') }}
          .conversation(v-else)
            .conv-head
              div
                span.has-text-weight-bold {{ current.withName }}
                b-tag.ml-2(v-if="current.kind === 'group'" type="is-warning") {{ $t('messages.groupTag') }}
              b-switch(v-model="autoTranslate" size="is-small") 🌐 {{ $t('messages.autoTranslate') }}
            .conv-body
              p.has-text-grey.has-text-centered(v-if="!current.messages.length") {{ $t('messages.noMessages') }}
              .msg(v-for="(m, i) in current.messages" :key="i" :class="{ 'msg--me': m.from === 'Me' }")
                .msg-bubble
                  span {{ m.text }}
                  p.msg-trans(v-if="translations[msgKey(i)]") ⤷ {{ translations[msgKey(i)] }}
                a.msg-translate(v-if="isForeign(m) && !translations[msgKey(i)]" @click="translateMsg(m, i)")
                  | {{ translating[msgKey(i)] ? '…' : ('🌐 ' + $t('messages.translate')) }}
                span.msg-from {{ m.from }}
            .conv-reply
              input.input(v-model="reply" :placeholder="$t('messages.type')" @keyup.enter="send")
              b-button(type="is-primary" @click="send") {{ $t('messages.sendBtn') }}
</template>

<script>
export default {
  name: 'MessagesPage',
  data () {
    return { threads: [], selectedId: null, current: null, reply: '', autoTranslate: false, translations: {}, translating: {} }
  },
  computed: {
    requests () { return this.threads.filter(t => t.status === 'request') },
    chats () { return this.threads.filter(t => t.status !== 'request') },
    readerLocale () { return this.$i18n.locale }
  },
  watch: {
    autoTranslate (on) { if (on) { this.translateAllForeign() } }
  },
  async mounted () {
    await this.load()
    const q = this.$route.query.thread
    if (q) { this.select(q) }
  },
  methods: {
    initials (name) {
      return (name || '').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    },
    avatarStyle (t) {
      const colors = ['#6C5CE7', '#00C2A8', '#FF6B9D', '#14B8D8', '#FFB020', '#FF7A59']
      let h = 0
      const id = t.withId || t.id || ''
      for (let i = 0; i < id.length; i++) { h = (h * 31 + id.charCodeAt(i)) >>> 0 }
      const c = colors[h % colors.length]
      return { background: 'linear-gradient(135deg, ' + c + ', ' + c + 'cc)' }
    },
    isForeign (m) { return !!m.lang && m.lang !== this.readerLocale },
    msgKey (i) { return (this.current ? this.current.id : '') + ':' + i },
    async load () {
      try {
        const res = await fetch('/api/people/messages')
        const data = await res.json()
        this.threads = data.threads || []
      } catch (e) {
        // leave empty
      }
    },
    async select (id) {
      this.selectedId = id
      try {
        const res = await fetch('/api/people/messages/' + id)
        if (res.ok) {
          this.current = await res.json()
          if (this.autoTranslate) { this.translateAllForeign() }
        }
      } catch (e) {
        this.current = null
      }
    },
    translateAllForeign () {
      if (!this.current) { return }
      this.current.messages.forEach((m, i) => { if (this.isForeign(m)) { this.translateMsg(m, i) } })
    },
    async translateMsg (m, i) {
      const key = this.msgKey(i)
      if (this.translations[key] || this.translating[key]) { return }
      this.$set(this.translating, key, true)
      try {
        const res = await fetch('/api/translate/locale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: { t: m.text }, langCode: this.readerLocale, from: m.lang })
        })
        const data = await res.json()
        if (data && data.t && data.t !== m.text) { this.$set(this.translations, key, data.t) }
      } catch (e) {
        this.$buefy.toast.open({ message: 'Translation failed', type: 'is-danger' })
      } finally {
        this.$set(this.translating, key, false)
      }
    },
    async send () {
      const text = (this.reply || '').trim()
      if (!text || !this.current) { return }
      try {
        const res = await fetch('/api/people/messages/' + this.current.id + '/reply', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text })
        })
        if (res.ok) {
          this.current = await res.json()
          this.reply = ''
          await this.load()
        }
      } catch (e) {
        this.$buefy.toast.open({ message: 'Send failed', type: 'is-danger' })
      }
    }
  }
}
</script>

<style scoped>
.thread-item { display: flex; align-items: center; gap: .6rem; padding: .55rem; border-radius: 12px; color: inherit; cursor: pointer; }
.thread-item:hover { background: #f4f3ff; }
.thread-item.is-active { background: #efeafe; }
.thread-text { min-width: 0; }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 14rem; }
.avatar--sm { width: 40px; height: 40px; border-radius: 12px; margin: 0; font-size: .8rem; }

.conversation { background: #fff; border-radius: 16px; box-shadow: var(--shadow); display: flex; flex-direction: column; min-height: 26rem; }
.conv-head { padding: 1rem 1.25rem; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.conv-body { flex: 1; padding: 1.25rem; display: flex; flex-direction: column; gap: .75rem; }
.msg { display: flex; flex-direction: column; align-items: flex-start; }
.msg--me { align-items: flex-end; }
.msg-bubble { background: #f1f0fb; padding: .55rem .9rem; border-radius: 14px; max-width: 80%; white-space: pre-wrap; }
.msg--me .msg-bubble { background: linear-gradient(120deg, var(--brand), var(--brand-2)); color: #fff; }
.msg-trans { font-size: .85em; opacity: .85; margin-top: .35rem; padding-top: .3rem; border-top: 1px solid rgba(0,0,0,.1); }
.msg-translate { font-size: .72rem; color: var(--brand); margin-top: .15rem; cursor: pointer; }
.msg-from { font-size: .7rem; color: #aaa; margin-top: .2rem; }
.conv-reply { display: flex; gap: .5rem; padding: 1rem 1.25rem; border-top: 1px solid #eee; }
.conv-reply .input { flex: 1; }
</style>
