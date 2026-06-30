<template lang="pug">
  section.section
    .container
      .section-banner.section-banner--discover
        span.ico 🔎
        h1 {{ $t('discover.title') }}

      b-tabs(v-model="tab")
        b-tab-item(:label="$t('discover.people')" value="people")
        b-tab-item(:label="$t('discover.groups')" value="groups")

      .field.has-addons
        .control.is-expanded
          input.input(v-model="inputText" :placeholder="$t('discover.placeholder')" @keyup.enter="search")
        .control(v-if="speechSupported")
          button.button(@click="toggleListening" :class="{ 'is-danger': isListening }" title="Voice input") 🎤
        .control
          button.button.is-primary(@click="search") {{ $t('common.search') }}

      b-field(v-if="tab === 'people'")
        b-checkbox(v-model="availableOnly" @input="search") {{ $t('discover.availableOnly') }}

      b-message(v-if="loading" type="is-info") Loading…

      template(v-else-if="tab === 'people'")
        p.has-text-grey(v-if="!people.length") {{ $t('discover.noResults') }}
        .box(v-for="p in people" :key="p.id")
          .level.is-mobile
            .level-left
              .avatar(:style="avatarStyle(p)") {{ initials(p.name) }}
              div
                p.is-size-5.has-text-weight-semibold
                  | {{ p.name }} · {{ p.title }} · {{ p.city }}, {{ p.country }}
                  b-tag.ml-2(v-if="p.available" type="is-success") {{ $t('common.available') }}
                p.has-text-grey Strengths: {{ (p.strengths || []).join(', ') }}
            .level-right
              button.button.is-primary.is-small(@click="openOutreach(p)") {{ $t('common.reachOut') }}

      template(v-else)
        .buttons.is-right.mb-2
          nuxt-link.button.is-warning(to="/groups/new") ＋ {{ $t('group.create') }}
        p.has-text-grey(v-if="!groups.length") {{ $t('discover.noResults') }}
        .box(v-for="g in groups" :key="g.id")
          nuxt-link.group-head.is-flex.is-align-items-center.mb-2(:to="'/groups/' + g.id")
            span.group-badge {{ g.icon }}
            div
              p.is-size-5.has-text-weight-semibold.has-text-dark {{ g.name }}
              p.has-text-grey.is-size-7 {{ g.firms }} {{ $t('discover.firms') }} · {{ g.memberCount }} {{ $t('discover.members') }}
          p {{ g.summary }}
          .tags.mt-2
            span.tag(v-for="t in (g.tags || [])" :key="t") {{ t }}
          .buttons.mt-2
            nuxt-link.button.is-small.is-light(:to="'/groups/' + g.id") {{ $t('common.view') }}
            button.button.is-warning.is-small(@click="requestJoin(g)") {{ $t('common.requestToJoin') }}

      b-modal(v-model="outreachOpen" has-modal-card)
        .modal-card
          header.modal-card-head
            p.modal-card-title
              | {{ $t('outreach.title') }}
              span(v-if="outreachTarget")  · {{ outreachTarget.name }}
          section.modal-card-body
            b-message(type="is-info" size="is-small") {{ $t('outreach.hint') }}
            b-field(:label="$t('outreach.context')")
              b-input(type="textarea" v-model="outreach.context")
            b-field(:label="$t('outreach.ask')")
              b-input(v-model="outreach.ask")
          footer.modal-card-foot
            b-button(type="is-primary" @click="sendOutreach") {{ $t('outreach.send') }}
            span.has-text-grey.is-size-7.ml-2 {{ $t('outreach.onePerPerson') }}
</template>

<script>
import speechMixin from '~/mixins/speechMixin'

export default {
  name: 'DiscoverPage',
  mixins: [speechMixin],
  data () {
    return {
      tab: this.$route.query.tab === 'groups' ? 'groups' : 'people',
      inputText: '',
      availableOnly: false,
      people: [],
      groups: [],
      loading: false,
      outreachOpen: false,
      outreachTarget: null,
      outreach: { context: '', ask: '' }
    }
  },
  watch: {
    tab (val) {
      // Keep the active tab in the URL so "back" from a group returns here
      // on the same tab, instead of resetting to People.
      if (this.$route.query.tab !== val) {
        this.$router.replace({ query: { ...this.$route.query, tab: val } }).catch(() => {})
      }
      this.search()
    }
  },
  mounted () {
    this.search()
  },
  methods: {
    initials (name) {
      return (name || '').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    },
    avatarStyle (p) {
      const colors = ['#6C5CE7', '#00C2A8', '#FF6B9D', '#14B8D8', '#FFB020', '#FF7A59']
      let h = 0
      const id = p.id || ''
      for (let i = 0; i < id.length; i++) { h = (h * 31 + id.charCodeAt(i)) >>> 0 }
      const c = colors[h % colors.length]
      return { background: 'linear-gradient(135deg, ' + c + ', ' + c + 'cc)' }
    },
    async requestJoin (g) {
      try {
        const res = await fetch('/api/people/groups/' + g.id + '/join', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
        })
        const data = await res.json()
        if (data.success) { this.$buefy.toast.open({ message: this.$t('group.requested'), type: 'is-success' }) }
      } catch (e) {
        this.$buefy.toast.open({ message: 'Request failed', type: 'is-danger' })
      }
    },
    async search () {
      this.loading = true
      try {
        if (this.tab === 'people') {
          const params = new URLSearchParams({ q: this.inputText, available: this.availableOnly ? 'true' : 'false' })
          const res = await fetch('/api/people/advisors?' + params.toString())
          this.people = await res.json()
        } else {
          const params = new URLSearchParams({ q: this.inputText })
          const res = await fetch('/api/people/groups?' + params.toString())
          this.groups = await res.json()
        }
      } catch (e) {
        this.$buefy.toast.open({ message: 'Search failed — is the backend running?', type: 'is-danger' })
      } finally {
        this.loading = false
      }
    },
    openOutreach (p) {
      this.outreachTarget = p
      this.outreach = { context: '', ask: '' }
      this.outreachOpen = true
    },
    async sendOutreach () {
      if (!this.outreach.context) {
        this.$buefy.toast.open({ message: 'Please say why you are reaching out.', type: 'is-warning' })
        return
      }
      try {
        const res = await fetch('/api/people/outreach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toId: this.outreachTarget.id, context: this.outreach.context, ask: this.outreach.ask })
        })
        const data = await res.json()
        if (data.success) {
          this.outreachOpen = false
          this.$buefy.toast.open({ message: this.$t('outreach.sent'), type: 'is-success' })
          this.$router.push('/messages?thread=' + data.threadId)
        }
      } catch (e) {
        this.$buefy.toast.open({ message: 'Send failed', type: 'is-danger' })
      }
    }
  }
}
</script>
