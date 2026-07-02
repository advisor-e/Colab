<template lang="pug">
  section.section
    .container
      a.back-link(@click="$router.back()") ‹ {{ $t('common.back') }}
      b-message(v-if="loading" type="is-info") Loading…
      b-message(v-else-if="!group" type="is-danger") {{ $t('group.notFound') }}
      template(v-else)
        .section-banner.section-banner--groups
          span.ico {{ group.icon }}
          h1 {{ group.name }}
          page-help(help-key="groupDetail")
        .box
          p.has-text-grey.mb-4 {{ $t('group.createdBy') }} {{ group.createdBy }} · {{ group.firms }} {{ $t('discover.firms') }} · {{ group.memberCount }} {{ $t('discover.members') }}
          p.label {{ $t('group.about') }}
          p.mb-4 {{ group.summary }}
          .tags
            span.tag(v-for="t in (group.tags || [])" :key="t") {{ t }}
          p.label.mt-5 {{ $t('group.members') }}
          .members
            .member(v-for="m in (group.members || [])" :key="m.id")
              .avatar(:style="avatarStyle(m)") {{ initials(m) }}
              span {{ m.name }}
          .buttons.mt-5
            b-button(type="is-warning" :loading="joining" @click="join") {{ $t('common.requestToJoin') }}
            b-button(@click="messageGroup") {{ $t('group.message') }}

        b-modal(v-model="msgOpen" has-modal-card)
          .modal-card
            header.modal-card-head
              p.modal-card-title {{ $t('group.message') }} · {{ group.name }}
            section.modal-card-body
              b-input(type="textarea" v-model="msgText" :placeholder="$t('messages.type')")
            footer.modal-card-foot
              b-button(type="is-warning" @click="sendGroupMessage") {{ $t('messages.sendBtn') }}
              b-button(@click="msgOpen = false") {{ $t('common.cancel') }}
</template>

<script>
export default {
  name: 'GroupDetailPage',
  data () {
    return { group: null, loading: true, joining: false, msgOpen: false, msgText: '' }
  },
  async mounted () {
    try {
      const res = await fetch('/api/people/groups/' + this.$route.params.id)
      if (res.ok) { this.group = await res.json() }
    } catch (e) {
      // leave null -> not-found state
    } finally {
      this.loading = false
    }
  },
  methods: {
    initials (m) {
      return (m.name || '').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    },
    avatarStyle (m) {
      const colors = ['#6C5CE7', '#00C2A8', '#FF6B9D', '#14B8D8', '#FFB020', '#FF7A59']
      let h = 0
      const id = m.id || ''
      for (let i = 0; i < id.length; i++) { h = (h * 31 + id.charCodeAt(i)) >>> 0 }
      const c = colors[h % colors.length]
      return { background: 'linear-gradient(135deg, ' + c + ', ' + c + 'cc)' }
    },
    async join () {
      this.joining = true
      try {
        const res = await fetch('/api/people/groups/' + this.group.id + '/join', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
        })
        const data = await res.json()
        if (data.success) { this.$buefy.toast.open({ message: this.$t('group.requested'), type: 'is-success' }) }
      } catch (e) {
        this.$buefy.toast.open({ message: this.$t('toast.requestFailed'), type: 'is-danger' })
      } finally {
        this.joining = false
      }
    },
    messageGroup () {
      this.msgOpen = true
    },
    async sendGroupMessage () {
      const text = (this.msgText || '').trim()
      if (!text) { return }
      try {
        const res = await fetch('/api/people/groups/' + this.group.id + '/message', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text })
        })
        const data = await res.json()
        if (data.success) {
          this.msgOpen = false
          this.$router.push('/messages?thread=' + data.threadId)
        }
      } catch (e) {
        this.$buefy.toast.open({ message: this.$t('toast.sendFailed'), type: 'is-danger' })
      }
    }
  }
}
</script>
