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
              span.has-text-weight-bold {{ current.withName }}
              b-tag.ml-2(v-if="current.kind === 'group'" type="is-warning") {{ $t('messages.groupTag') }}
            .conv-body
              p.has-text-grey.has-text-centered(v-if="!current.messages.length") {{ $t('messages.noMessages') }}
              .msg(v-for="(m, i) in current.messages" :key="i" :class="{ 'msg--me': m.from === 'Me' }")
                .msg-bubble {{ m.text }}
                span.msg-from {{ m.from }}
            .conv-reply
              input.input(v-model="reply" :placeholder="$t('messages.type')" @keyup.enter="send")
              b-button(type="is-primary" @click="send") {{ $t('messages.sendBtn') }}
</template>

<script>
export default {
  name: 'MessagesPage',
  data () {
    return { threads: [], selectedId: null, current: null, reply: '' }
  },
  computed: {
    requests () { return this.threads.filter(t => t.status === 'request') },
    chats () { return this.threads.filter(t => t.status !== 'request') }
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
        if (res.ok) { this.current = await res.json() }
      } catch (e) {
        this.current = null
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
.conv-head { padding: 1rem 1.25rem; border-bottom: 1px solid #eee; }
.conv-body { flex: 1; padding: 1.25rem; display: flex; flex-direction: column; gap: .75rem; }
.msg { display: flex; flex-direction: column; align-items: flex-start; }
.msg--me { align-items: flex-end; }
.msg-bubble { background: #f1f0fb; padding: .55rem .9rem; border-radius: 14px; max-width: 80%; white-space: pre-wrap; }
.msg--me .msg-bubble { background: linear-gradient(120deg, var(--brand), var(--brand-2)); color: #fff; }
.msg-from { font-size: .7rem; color: #aaa; margin-top: .2rem; }
.conv-reply { display: flex; gap: .5rem; padding: 1rem 1.25rem; border-top: 1px solid #eee; }
.conv-reply .input { flex: 1; }
</style>
