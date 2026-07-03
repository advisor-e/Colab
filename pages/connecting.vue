<template lang="pug">
  section.section
    .container
      .section-banner.section-banner--connecting
        span.ico 🔗
        h1 {{ $t('connecting.title') }}
        page-help(help-key="connecting")
      b-message(v-if="loading" type="is-info") {{ $t('connecting.loading') }}
      template(v-else)
        .cx-controls
          b-input.cx-search(v-model="search" :placeholder="$t('connecting.searchPlaceholder')" rounded)
          .cx-sort
            span.cx-sort__label.has-text-grey.is-size-7 {{ $t('connecting.sortBy') }}
            .buttons.has-addons.mb-0
              button.button.is-small(:class="{ 'is-primary': sort === 'recent' }" @click="sort = 'recent'") {{ $t('connecting.sortRecent') }}
              button.button.is-small(:class="{ 'is-primary': sort === 'name' }" @click="sort = 'name'") {{ $t('connecting.sortName') }}

        .cx-tabs
          button.cx-tab(
            v-for="t in tabs"
            :key="t.key"
            :class="{ 'is-active': tab === t.key }"
            @click="tab = t.key"
          )
            | {{ $t('connecting.tab.' + t.key) }}
            span.cx-tab__count {{ t.count }}

        p.has-text-grey.mt-4(v-if="!visibleRows.length") {{ $t('connecting.empty') }}
        a.cx-row(v-for="r in visibleRows" :key="r.rowKey" @click="openRow(r)")
          .avatar.cx-avatar(:style="avatarStyle(r)") {{ rowIcon(r) }}
          .cx-row__text
            p.cx-row__name
              span.has-text-weight-semibold {{ r.name }}
              span.tag.is-light.ml-2 {{ $t('connecting.type.' + r.type) }}
            p.cx-row__sub.has-text-grey.is-size-7.truncate {{ rowSubtitle(r) }}
</template>

<script>
/**
 * Connecting — the unified inbox (Q-CONN-MSG-IA → Option B).
 *
 * ONE screen blending conversations (1:1 + group) and connections, driven by
 * the merged backend feed GET /api/people/connecting (see server/data/
 * repository.js listConnecting). Display + navigation only — every action reuses
 * an existing route/page:
 *   - a row with a thread  -> open it in Messages (/messages?thread=…)
 *   - a connection w/o thread -> create the 1:1 thread, then open it
 *   - a group w/o thread   -> open the group page (its "Message the group" seam)
 *   - a connection request -> the Connections page (inline accept/decline is Phase 3)
 *
 * Phase 2 of FEAT-CONNECTING: this new page is previewable at /connecting and
 * does NOT touch the existing Connections/Messages pages or the nav — those are
 * retired in Phase 4. Inline conversation pane + inline request actions land in
 * Phase 3. See design/ACTIONS.md.
 */
export default {
  name: 'ConnectingPage',
  data () {
    return { rows: [], loading: true, search: '', tab: 'all', sort: 'recent' }
  },
  computed: {
    // Tab a row belongs to: connection requests AND group invitations both fall
    // under "Requests" (anything awaiting a decision) — the owner-chosen grouping.
    // (returns one of: chats | groups | connections | requests)
    // NB: kept as a method-style map in filteredRows/tabs so both stay in sync.
    tabs () {
      const keys = ['all', 'chats', 'groups', 'connections', 'requests']
      return keys.map(key => ({
        key,
        count: key === 'all' ? this.rows.length : this.rows.filter(r => this.tabOf(r.type) === key).length
      }))
    },
    // Rows for the active tab, then narrowed by the search box.
    filteredRows () {
      const byTab = this.tab === 'all' ? this.rows : this.rows.filter(r => this.tabOf(r.type) === this.tab)
      const q = (this.search || '').trim().toLowerCase()
      if (!q) { return byTab }
      return byTab.filter((r) => {
        const hay = (r.name + ' ' + (r.firm || '') + ' ' + (r.subtitle || '')).toLowerCase()
        return hay.includes(q)
      })
    },
    // Sorted for display. 'recent' keeps the backend order (conversations first);
    // 'name' is alphabetical. Real activity-time sort is a MySQL seam (no
    // timestamps in the mock) — see listConnecting.
    visibleRows () {
      if (this.sort !== 'name') { return this.filteredRows }
      return this.filteredRows.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }
  },
  async mounted () {
    await this.load()
  },
  methods: {
    tabOf (type) {
      if (type === 'chat') { return 'chats' }
      if (type === 'group') { return 'groups' }
      if (type === 'connection') { return 'connections' }
      return 'requests' // invitation, request-incoming, request-outgoing
    },
    async load () {
      this.loading = true
      try {
        const res = await fetch('/api/people/connecting')
        if (!res.ok) { throw new Error('HTTP ' + res.status) }
        const data = await res.json()
        this.rows = data.rows || []
      } catch (e) {
        // Tell the user rather than showing a silently empty page.
        this.$buefy.toast.open({ message: this.$t('toast.loadConnections'), type: 'is-danger' })
      } finally {
        this.loading = false
      }
    },
    initials (name) {
      return (name || '').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    },
    avatarStyle (r) {
      const colors = ['#6C5CE7', '#00C2A8', '#FF6B9D', '#14B8D8', '#FFB020', '#FF7A59']
      let h = 0
      const id = r.advisorId || r.groupId || r.rowKey || ''
      for (let i = 0; i < id.length; i++) { h = (h * 31 + id.charCodeAt(i)) >>> 0 }
      const c = colors[h % colors.length]
      return { background: 'linear-gradient(135deg, ' + c + ', ' + c + 'cc)' }
    },
    // Group/invitation rows show an emoji; people show their initials.
    rowIcon (r) {
      if (r.type === 'group') { return r.icon || '👥' }
      if (r.type === 'invitation') { return '✉️' }
      return this.initials(r.name)
    },
    rowSubtitle (r) {
      return r.subtitle || r.firm || ''
    },
    // Open a row by reusing an existing route (no new conversation UI in Phase 2).
    async openRow (r) {
      if (r.threadId) { this.$router.push('/messages?thread=' + r.threadId); return }
      if (r.type === 'group' && r.groupId) { this.$router.push('/groups/' + r.groupId); return }
      if (r.type === 'connection' && r.advisorId) {
        try {
          const res = await fetch('/api/people/advisors/' + r.advisorId + '/thread', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
          })
          const data = await res.json()
          if (data.success) { this.$router.push('/messages?thread=' + data.threadId); return }
          this.$buefy.toast.open({ message: this.$t('toast.failed'), type: 'is-warning' })
        } catch (e) {
          this.$buefy.toast.open({ message: this.$t('toast.failed'), type: 'is-danger' })
        }
        return
      }
      // Connection requests have no thread yet — inline accept/decline is Phase 3;
      // for now hand off to the existing Connections page.
      this.$router.push('/connections')
    }
  }
}
</script>

<style scoped>
.cx-controls { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
.cx-search { flex: 1; min-width: 14rem; }
.cx-sort { display: flex; flex-direction: column; gap: .25rem; }
.cx-sort__label { margin-left: .1rem; }

.cx-tabs { display: flex; flex-wrap: wrap; gap: .5rem; border-bottom: 1px solid #eee; padding-bottom: .75rem; }
.cx-tab {
  border: 1px solid transparent; background: #f4f3ff; color: var(--brand);
  border-radius: 999px; padding: .35rem .9rem; font-size: .85rem; cursor: pointer; font-weight: 300;
}
.cx-tab:hover { background: #efeafe; }
.cx-tab.is-active { background: var(--brand); color: #fff; }
.cx-tab__count { margin-left: .4rem; opacity: .75; font-size: .78rem; }

.cx-row { display: flex; align-items: center; gap: .7rem; padding: .6rem .5rem; border-radius: 12px; color: inherit; cursor: pointer; }
.cx-row:hover { background: #f4f3ff; }
.cx-row__text { min-width: 0; }
.cx-row__name { margin-bottom: .1rem; }
.cx-avatar { width: 42px; height: 42px; border-radius: 12px; margin: 0; font-size: .82rem; }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 22rem; }
</style>
