<template lang="pug">
  section.section
    .container
      .section-banner.section-banner--connections
        span.ico 🤝
        h1 {{ $t('connections.title') }}
        page-help(help-key="connections")
      b-message(v-if="loading" type="is-info") Loading…
      template(v-else)
        b-input.mb-4(v-model="search" :placeholder="$t('connections.searchPlaceholder')" rounded)

        p.heading {{ $t('connections.incoming') }}
        p.has-text-grey.mb-4(v-if="!data.incoming.length") {{ $t('connections.noIncoming') }}
        .box(v-for="c in data.incoming" :key="c.id")
          .level.is-mobile
            .level-left
              .avatar(:style="avatarStyle(c.advisor)") {{ initials(c.advisor.name) }}
              div
                p.has-text-weight-semibold {{ c.advisor.name }} · {{ c.advisor.firm }}
                p.has-text-grey.is-size-7 {{ (c.advisor.strengths || []).join(', ') }}
            .level-right
              .buttons
                b-button(type="is-success" size="is-small" @click="respond(c, true)") {{ $t('connections.accept') }}
                b-button(size="is-small" @click="respond(c, false)") {{ $t('connections.decline') }}

        p.heading.mt-5 {{ $t('connections.yourConnections') }}
        p.has-text-grey.mb-4(v-if="!data.connected.length") {{ $t('connections.noConnections') }}
        p.has-text-grey.mb-4(v-else-if="!filteredConnected.length") {{ $t('connections.noMatches') }}
        .box(v-for="c in filteredConnected" :key="c.id")
          .level.is-mobile
            .level-left
              .avatar(:style="avatarStyle(c.advisor)") {{ initials(c.advisor.name) }}
              div
                p.has-text-weight-semibold
                  | {{ c.advisor.name }} · {{ c.advisor.firm }}
                  span.tag.is-success.is-light.ml-2 ✓ {{ $t('common.connected') }}
                p.has-text-grey.is-size-7 {{ (c.advisor.strengths || []).join(', ') }}
            .level-right
              b-button(type="is-primary" size="is-small" @click="message(c.advisor)") {{ $t('common.message') }}

        template(v-if="data.groups && data.groups.length")
          p.heading.mt-5 {{ $t('connections.myGroups') }}
          .box(v-for="g in data.groups" :key="g.id")
            .is-flex.is-align-items-center.is-justify-content-space-between.mb-3
              nuxt-link.group-head.is-flex.is-align-items-center(:to="'/groups/' + g.id")
                span.group-badge {{ g.icon }}
                p.is-size-5.has-text-weight-semibold.has-text-dark {{ g.name }}
              nuxt-link.button.is-small.is-light(:to="'/groups/' + g.id") {{ $t('common.view') }}
            .members
              .member(v-for="m in g.members" :key="m.id")
                .avatar(:style="avatarStyle(m)") {{ initials(m.name) }}
                span {{ m.name }}
                b-button.ml-2(type="is-primary" size="is-small" @click="message(m)") {{ $t('common.message') }}

        template(v-if="data.outgoing.length")
          p.heading.mt-5 {{ $t('connections.pending') }}
          .box(v-for="c in data.outgoing" :key="c.id")
            .is-flex.is-align-items-center
              .avatar(:style="avatarStyle(c.advisor)") {{ initials(c.advisor.name) }}
              div
                p.has-text-weight-semibold {{ c.advisor.name }} · {{ c.advisor.firm }}
                p.has-text-grey.is-size-7 ⏳ {{ $t('connections.requestedLabel') }}
</template>

<script>
export default {
  name: 'ConnectionsPage',
  data () {
    return { data: { incoming: [], outgoing: [], connected: [], groups: [] }, loading: true, search: '' }
  },
  computed: {
    // Client-side filter so a large network (100+ connections) stays navigable
    // without a round-trip. Matches name, firm and strengths.
    filteredConnected () {
      const q = (this.search || '').trim().toLowerCase()
      if (!q) { return this.data.connected }
      return this.data.connected.filter((c) => {
        const a = c.advisor || {}
        const hay = (a.name + ' ' + (a.firm || '') + ' ' + (a.strengths || []).join(' ')).toLowerCase()
        return hay.includes(q)
      })
    }
  },
  async mounted () {
    await this.load()
  },
  methods: {
    initials (name) {
      return (name || '').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    },
    avatarStyle (a) {
      const colors = ['#6C5CE7', '#00C2A8', '#FF6B9D', '#14B8D8', '#FFB020', '#FF7A59']
      let h = 0
      const id = (a && a.id) || ''
      for (let i = 0; i < id.length; i++) { h = (h * 31 + id.charCodeAt(i)) >>> 0 }
      const c = colors[h % colors.length]
      return { background: 'linear-gradient(135deg, ' + c + ', ' + c + 'cc)' }
    },
    async load () {
      this.loading = true
      try {
        const res = await fetch('/api/people/connections')
        if (!res.ok) { throw new Error('HTTP ' + res.status) }
        this.data = await res.json()
      } catch (e) {
        // Keep the safe default shape (see data()) so the template never reads
        // .length of undefined; tell the user rather than showing a blank page.
        this.$buefy.toast.open({ message: this.$t('toast.loadConnections'), type: 'is-danger' })
      } finally {
        this.loading = false
      }
    },
    // Open (or reuse) a 1:1 conversation with a connection, then jump to it in
    // Messages — so an advisor can view AND message from one place.
    async message (advisor) {
      try {
        const res = await fetch('/api/people/advisors/' + advisor.id + '/thread', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
        })
        const data = await res.json()
        if (data.success) {
          this.$router.push('/messages?thread=' + data.threadId)
        } else {
          const msg = data.error && data.error.message ? data.error.message : this.$t('toast.failed')
          this.$buefy.toast.open({ message: msg, type: 'is-warning' })
        }
      } catch (e) {
        this.$buefy.toast.open({ message: this.$t('toast.failed'), type: 'is-danger' })
      }
    },
    async respond (c, accept) {
      try {
        const res = await fetch('/api/people/connections/' + c.id + '/' + (accept ? 'accept' : 'decline'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
        })
        if (res.ok) {
          await this.load()
          this.$buefy.toast.open({ message: accept ? this.$t('connections.acceptedToast') : this.$t('connections.declinedToast'), type: accept ? 'is-success' : 'is-light' })
        }
      } catch (e) {
        this.$buefy.toast.open({ message: this.$t('toast.failed'), type: 'is-danger' })
      }
    }
  }
}
</script>
