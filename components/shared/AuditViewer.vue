<template lang="pug">
  section.section
    .container
      .section-banner.section-banner--audit
        span.ico 🗂️
        h1 {{ $t('audit.title') }}

      template(v-if="preview")
        b-message.preview-msg(type="is-warning") {{ $t('audit.previewRibbon') }}

      b-message(v-if="loading" type="is-info") Loading…
      b-message(v-else-if="failed" type="is-danger") {{ $t('audit.loadFailed') }}
      template(v-else)
        p.has-text-grey.mb-4 {{ $t('audit.subtitle') }}

        .box
          .av-filters
            b-input.av-search(v-model="search" :placeholder="$t('audit.search')" size="is-small" rounded expanded)
            //- Narrow to a single action code. Options are the distinct actions present.
            b-select.av-action(v-model="actionFilter" size="is-small")
              option(value="") {{ $t('audit.allActions') }}
              option(v-for="a in actionOptions" :key="a" :value="a") {{ humanize(a) }}
          p.has-text-grey.is-size-7.mt-2 {{ $t('audit.showing', { shown: filtered.length, total: entries.length }) }}

          p.has-text-grey.is-size-7.mt-3(v-if="!entries.length") {{ $t('audit.empty') }}
          p.has-text-grey.is-size-7.mt-3(v-else-if="!filtered.length") {{ $t('audit.noMatch') }}
          .table-wrap.mt-2(v-else)
            table.table.is-fullwidth.is-hoverable
              thead
                tr
                  th {{ $t('audit.colWhen') }}
                  th {{ $t('audit.colPerson') }}
                  th {{ $t('audit.colAction') }}
                  th {{ $t('audit.colDetail') }}
              tbody
                tr(v-for="e in filtered" :key="e.id")
                  td.has-text-grey.is-size-7.av-when {{ formatWhen(e.at) }}
                  td {{ e.actorName }}
                  td
                    span {{ humanize(e.action) }}
                    span.av-code {{ e.action }}
                    span.tag.is-warning.is-light.ml-2(v-if="e.meta && e.meta.reason") {{ e.meta.reason }}
                  td.has-text-grey.is-size-7 {{ detailOf(e) }}
</template>

<script>
/**
 * AuditViewer — the admin/compliance audit-log viewer (FEAT-AUDIT-UI). Reads the
 * append-only trail (WHO did WHAT, WHEN, to WHICH target) newest-first and lets an
 * administrator filter it by free text or a single action code.
 *
 * ACCESS: the real endpoint (/api/people/audit) is server-gated to the platform
 * super-admin (Mentor tier) and re-checked every request — the page is never the
 * gate. The show-home page (pages/audit.vue) points at the dev-only /preview
 * endpoint so it can be demonstrated without a real super-admin login.
 *
 * Filtering is client-side over the loaded page (the endpoint also accepts
 * actorId/action/limit — a server-side seam for very large volumes).
 *
 * Props:
 *   endpoint — the audit API to read (default the real, admin-gated route).
 *   preview  — show-home mode: adds the "demo data" ribbon.
 */
export default {
  name: 'AuditViewer',
  props: {
    endpoint: { type: String, default: '/api/people/audit' },
    preview: { type: Boolean, default: false }
  },
  data () {
    return { entries: [], loading: true, failed: false, search: '', actionFilter: '' }
  },
  computed: {
    // The distinct action codes present, for the filter dropdown (sorted).
    actionOptions () {
      return Array.from(new Set(this.entries.map(e => e.action))).sort()
    },
    // Client-side filter: the action dropdown + a free-text match over person,
    // action and target — keeps a large trail navigable without a round-trip.
    filtered () {
      const q = (this.search || '').trim().toLowerCase()
      return this.entries.filter((e) => {
        if (this.actionFilter && e.action !== this.actionFilter) { return false }
        if (!q) { return true }
        const hay = (e.actorName + ' ' + e.action + ' ' + (e.targetId || '') + ' ' + (e.targetType || '')).toLowerCase()
        return hay.includes(q)
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
        const res = await fetch(this.endpoint + '?limit=200')
        if (res.ok) {
          const data = await res.json()
          this.entries = data.entries || []
        } else {
          this.failed = true
        }
      } catch (e) {
        this.failed = true
      } finally {
        this.loading = false
      }
    },
    // Turn an action code ('group.shared_page_added') into readable words; the code
    // itself stays visible as a tag for exact-event auditing.
    humanize (action) {
      return (action || '').replace(/[._]/g, ' ')
    },
    // A short target description ("group · seafood-modelling").
    detailOf (e) {
      if (!e.targetType && !e.targetId) { return '—' }
      return [e.targetType, e.targetId].filter(Boolean).join(' · ')
    },
    formatWhen (at) {
      if (!at) { return '' }
      const d = new Date(at)
      return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.section-banner--audit { background: #002b64; }

.preview-msg { margin-bottom: .75rem; }

.av-filters { display: flex; gap: .6rem; align-items: center; flex-wrap: wrap; }
.av-search { flex: 1 1 16rem; }

/* Scroll a large trail inside the panel, sticky header. */
.table-wrap { overflow-x: auto; max-height: 34rem; overflow-y: auto; }
.table-wrap thead th { position: sticky; top: 0; background: var(--surface, #fff); z-index: 1; }
.av-when { white-space: nowrap; min-width: 6.5rem; }
.av-code { font-size: .68rem; color: var(--muted); background: #f4f4f8; border: 1px solid #eee; border-radius: 6px; padding: 0 .35rem; margin-left: .45rem; }
</style>
