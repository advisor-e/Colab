<template lang="pug">
  section.section
    .container
      .section-banner.section-banner--messages
        span.ico 💬
        h1 {{ $t('messages.title') }}
        page-help(help-key="messages")
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
          //- Shared conversation view; reloads the thread list when a reply is
          //- sent or an invitation is handled inside the pane.
          conversation-pane(:thread-id="selectedId" @changed="load")
</template>

<script>
/**
 * Messages — the thread list (requests vs chats) with the shared ConversationPane
 * on the right. The conversation logic lives in components/shared/ConversationPane
 * (extracted in Phase 3 of FEAT-CONNECTING) so this page only owns the left rail.
 */
export default {
  name: 'MessagesPage',
  data () {
    return { threads: [], selectedId: null }
  },
  computed: {
    requests () { return this.threads.filter(t => t.status === 'request') },
    chats () { return this.threads.filter(t => t.status !== 'request') }
  },
  async mounted () {
    await this.load()
    const q = this.$route.query.thread
    if (q) { this.selectedId = q }
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
    select (id) { this.selectedId = id }
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
</style>
