<template lang="pug">
  section.section
    .container
      .section-banner.section-banner--firm
        span.ico 🧭
        h1 {{ $t('firm.title') }}
        span.firm-chip(v-if="c") 🏢 {{ c.firm }}

      b-message(v-if="loading" type="is-info") Loading…
      b-message(v-else-if="!c" type="is-danger") {{ $t('firm.loadFailed') }}
      template(v-else)
        p.has-text-grey.mb-4 {{ $t('firm.subtitle') }}

        //- At a glance
        .fm-tiles
          .fm-tile
            .k {{ $t('firm.advisers') }}
            .v {{ c.stats.advisers }}
          .fm-tile
            .k {{ $t('firm.groups') }}
            .v {{ c.stats.groups }}
          .fm-tile
            .k {{ $t('firm.pendingApprovals') }}
            .v {{ c.stats.pendingApprovals }}
          .fm-tile
            .k {{ $t('firm.crossFirm') }}
            .v
              span.tag.is-medium(:class="postureOpen ? 'is-success is-light' : 'is-danger is-light'") {{ postureOpen ? $t('firm.open') : $t('firm.closed') }}

        //- Cross-firm collaboration toggle (this firm manager controls it)
        .box
          p.label {{ $t('firm.collabTitle') }}
          p.has-text-grey.is-size-7.mb-3 {{ $t('firm.collabSub') }}
          .buttons.has-addons.mb-1
            b-button(:type="postureOpen ? 'is-success' : ''" :loading="savingPosture === 'open'" @click="setPosture('open')") {{ $t('firm.open') }}
            b-button(:type="!postureOpen ? 'is-danger' : ''" :loading="savingPosture === 'closed'" @click="setPosture('closed')") {{ $t('firm.closed') }}
          p.has-text-grey.is-size-7 {{ postureOpen ? $t('firm.openHint') : $t('firm.closedHint') }}

        .columns
          //- Advisers
          .column.is-two-thirds
            .box
              .is-flex.is-align-items-center.is-justify-content-space-between.mb-1
                p.label.mb-0 {{ $t('firm.advisersTitle') }}
                span.has-text-grey.is-size-7 {{ $t('firm.showing', { shown: filteredAdvisers.length, total: c.advisers.length }) }}
              p.has-text-grey.is-size-7.mb-2 {{ advisersSub }}
              b-input.mb-3(v-model="advSearch" :placeholder="$t('firm.searchAdvisers')" size="is-small" rounded)
              p.has-text-grey.is-size-7(v-if="!filteredAdvisers.length") {{ $t('firm.noAdviserMatch') }}
              .table-wrap(v-else)
                table.table.is-fullwidth.is-hoverable
                  thead
                    tr
                      th {{ $t('firm.colAdviser') }}
                      th {{ $t('firm.colStatus') }}
                      th {{ $t('firm.colGroups') }}
                      th {{ $t('firm.colActive') }}
                      th {{ $t('firm.colAction') }}
                  tbody
                    tr(v-for="a in filteredAdvisers" :key="a.id")
                      td
                        .who
                          .avatar.fm-av(:style="avatarStyle(a)") {{ initials(a.name) }}
                          div
                            span {{ a.name }}
                            span.tag.is-light.ml-2(v-if="a.isMe") {{ $t('firm.you') }}
                            span.tag.is-warning.is-light.ml-2(v-if="a.blocked") 🔒 {{ $t('firm.blockedTag') }}
                            p.has-text-grey.is-size-7 {{ a.title }}
                      td
                        span.tag(:class="a.available ? 'is-success is-light' : 'is-light'") {{ a.available ? $t('common.available') : $t('firm.unavailable') }}
                      td {{ a.groupCount }}
                      td.has-text-grey.is-size-7 {{ a.lastActive || '—' }}
                      td.has-text-right
                        b-button.is-small.is-light(v-if="!a.isMe && !a.blocked" :loading="viewingId === a.id" @click="viewAs(a)") {{ $t('firm.viewAs') }}
                        span.has-text-grey.is-size-7(v-else-if="a.blocked") 🔒

          //- Pending approvals
          .column
            .box
              p.label {{ $t('firm.approvalsTitle') }}
              p.has-text-grey.is-size-7.mb-3 {{ $t('firm.approvalsSub') }}
              p.has-text-grey.is-size-7(v-if="!c.approvals.length") {{ $t('firm.noApprovals') }}
              .fm-req(v-for="r in c.approvals" :key="r.id")
                .who
                  .avatar.fm-av(:style="avatarStyle(r.advisor)") {{ initials(r.advisor.name) }}
                  div
                    p {{ r.advisor.name }}
                    p.has-text-grey.is-size-7 {{ $t('firm.wantsToJoin') }} · {{ r.groupName }}
                .buttons.mt-2.mb-0
                  b-button(type="is-success" size="is-small" @click="respondApproval(r, true)") {{ $t('firm.approve') }}
                  b-button(size="is-small" @click="respondApproval(r, false)") {{ $t('firm.decline') }}

        //- Activity / audit
        .box
          p.label {{ $t('firm.activityTitle') }}
          p.has-text-grey.is-size-7.mb-3 {{ $t('firm.activitySub') }}
          p.has-text-grey.is-size-7(v-if="!c.activity.length") {{ $t('firm.noActivity') }}
          .fm-ev(v-for="(e, i) in c.activity" :key="i")
            span.fm-when {{ formatWhen(e.at) }}
            span
              span.has-text-weight-semibold {{ e.actorName }}
              |  {{ humanize(e.action) }}
              span.fm-code {{ e.action }}
</template>

<script>
/**
 * Firm Manager console (Stage 1 of the firm-manager feature).
 *
 * Reads GET /api/people/firm — the manager's firm, its advisers (with each one's
 * availability + whether they've blocked the manager view), headline stats,
 * pending join requests, and a recent-activity feed from the audit trail. The
 * page is manager-gated server-side (403 for a non-manager). The per-adviser
 * "view as" action arrives in Stage 3; the block toggle in Stage 2.
 */
export default {
  name: 'FirmConsolePage',
  data () {
    return { c: null, loading: true, savingPosture: null, advSearch: '', viewingId: null }
  },
  computed: {
    postureOpen () { return !!this.c && this.c.stats.crossOrgPosture === 'open' },
    advisersSub () { return this.c ? this.$t('firm.advisersSub', { firm: this.c.firm }) : '' },
    // Client-side search so a large firm (100+ advisers) stays navigable. For very
    // large firms this becomes server-side search + pagination — a repository seam
    // (the console endpoint would take q/offset/limit); the list stays scrollable.
    filteredAdvisers () {
      if (!this.c) { return [] }
      const q = (this.advSearch || '').trim().toLowerCase()
      if (!q) { return this.c.advisers }
      return this.c.advisers.filter((a) => {
        return (a.name + ' ' + (a.title || '')).toLowerCase().includes(q)
      })
    }
  },
  async mounted () {
    await this.load()
  },
  methods: {
    async load () {
      this.loading = true
      try {
        const res = await fetch('/api/people/firm')
        if (res.ok) { this.c = await res.json() }
      } catch (e) {
        // leave c null -> error state
      } finally {
        this.loading = false
      }
    },
    initials (name) {
      return (name || '').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    },
    avatarStyle (a) {
      const colors = ['#6C5CE7', '#00C2A8', '#FF6B9D', '#14B8D8', '#FFB020', '#FF7A59']
      let h = 0
      const id = a.id || ''
      for (let i = 0; i < id.length; i++) { h = (h * 31 + id.charCodeAt(i)) >>> 0 }
      const col = colors[h % colors.length]
      return { background: 'linear-gradient(135deg, ' + col + ', ' + col + 'cc)' }
    },
    // Turn an audit action code ('group.shared_page_added') into readable words.
    // The code itself stays visible as a tag for exact-event auditing.
    humanize (action) {
      return (action || '').replace(/[._]/g, ' ')
    },
    formatWhen (at) {
      if (!at) { return '' }
      const d = new Date(at)
      return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    async setPosture (posture) {
      if (this.savingPosture || (posture === 'open') === this.postureOpen) { return }
      this.savingPosture = posture
      try {
        const res = await fetch('/api/people/firm/posture', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ posture })
        })
        const data = await res.json()
        if (data.success) {
          this.$set(this.c.stats, 'crossOrgPosture', data.crossOrgPosture)
          this.$buefy.toast.open({ message: this.$t('firm.postureUpdated'), type: 'is-success' })
        } else {
          this.$buefy.toast.open({ message: this.$t('firm.actionFailed'), type: 'is-warning' })
        }
      } catch (e) {
        this.$buefy.toast.open({ message: this.$t('firm.actionFailed'), type: 'is-danger' })
      } finally {
        this.savingPosture = null
      }
    },
    // Isolated so tests can stub the reload without a jsdom navigation error.
    reloadTo (url) { window.location.href = url },
    // Assume an adviser's view. The server validates (manager, same firm, not
    // blocked) and sets the view-as cookie; a full reload re-fetches the whole app
    // as that adviser. The persistent banner (layout) offers the way back.
    async viewAs (a) {
      this.viewingId = a.id
      try {
        const res = await fetch('/api/people/firm/view-as', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ advisorId: a.id })
        })
        const data = await res.json()
        if (data.success) {
          this.reloadTo('/')
        } else {
          const msg = data.error && data.error.message ? data.error.message : this.$t('firm.actionFailed')
          this.$buefy.toast.open({ message: msg, type: 'is-warning' })
          this.viewingId = null
        }
      } catch (e) {
        this.$buefy.toast.open({ message: this.$t('firm.actionFailed'), type: 'is-danger' })
        this.viewingId = null
      }
    },
    // Reuse the existing group-join approve/decline endpoints, then refresh.
    async respondApproval (r, accept) {
      const verb = accept ? 'accept' : 'decline'
      try {
        const res = await fetch('/api/people/group-requests/' + r.id + '/' + verb, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
        })
        if (res.ok) {
          this.$buefy.toast.open({
            message: accept ? this.$t('firm.approvedToast') : this.$t('firm.declinedToast'),
            type: accept ? 'is-success' : 'is-light'
          })
          await this.load()
        }
      } catch (e) {
        this.$buefy.toast.open({ message: this.$t('firm.actionFailed'), type: 'is-danger' })
      }
    }
  }
}
</script>

<style scoped>
.section-banner--firm { background: #123a76; }
.firm-chip { margin-left: auto; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.24); color: #fff; padding: .35rem .8rem; border-radius: 999px; font-size: .82rem; }

.fm-tiles { display: grid; gap: .9rem; grid-template-columns: repeat(4, 1fr); margin-bottom: 1.25rem; }
@media (max-width: 720px) { .fm-tiles { grid-template-columns: repeat(2, 1fr); } }
.fm-tile { background: #fff; border: 1px solid #eee; border-left: 4px solid #123a76; border-radius: 14px; padding: .9rem 1rem; box-shadow: var(--shadow); }
.fm-tile .k { font-size: .72rem; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); }
.fm-tile .v { font-size: 1.9rem; font-weight: 300; margin-top: .25rem; }

/* Scroll a large firm's adviser list inside the panel (100+ advisers). */
.table-wrap { overflow-x: auto; max-height: 30rem; overflow-y: auto; }
.table-wrap thead th { position: sticky; top: 0; background: var(--surface, #fff); z-index: 1; }
.who { display: flex; align-items: center; gap: .6rem; }
.fm-av { width: 32px; height: 32px; border-radius: 9px; margin: 0; font-size: .72rem; color: #fff; display: grid; place-items: center; flex: none; }

.fm-req { padding: .5rem 0; border-bottom: 1px solid #eee; }
.fm-req:last-child { border-bottom: 0; }

.fm-ev { display: flex; gap: .7rem; align-items: baseline; padding: .5rem 0; border-bottom: 1px solid #eee; font-size: .88rem; }
.fm-ev:last-child { border-bottom: 0; }
.fm-when { color: var(--muted); font-size: .76rem; white-space: nowrap; min-width: 6.5rem; }
.fm-code { font-size: .68rem; color: var(--muted); background: #f4f4f8; border: 1px solid #eee; border-radius: 6px; padding: 0 .35rem; margin-left: .45rem; }
</style>
