<template lang="pug">
  section.section
    .container
      .section-banner.section-banner--market
        span.ico 🛒
        h1 {{ $t('market.title') }}
        page-help(help-key="marketplace")
      .level.is-mobile.mb-3
        .level-left
          p.has-text-grey {{ $t('market.intro') }}
        .level-right
          b-button(type="is-warning" @click="openCreate") ＋ {{ $t('market.list') }}

      b-message(v-if="loading" type="is-info") Loading…
      .columns.is-multiline(v-else)
        .column.is-half(v-for="l in listings" :key="l.id")
          .box.listing
            .is-flex.is-justify-content-space-between.is-align-items-flex-start
              p.is-size-5.has-text-weight-semibold {{ l.title }}
              span.tag.price {{ l.price }}
            p.mt-2 {{ l.summary }}
            .tags.mt-2
              span.tag(v-for="t in (l.tags || [])" :key="t") {{ t }}
            p.has-text-grey.is-size-7.mt-2 {{ $t('market.by') }} {{ l.createdBy }} · {{ l.groupName }}
            p.has-text-grey.is-size-7 ⓘ {{ $t('market.licence') }}
            .mt-3
              b-button(v-if="!l.owned" type="is-success" size="is-small" @click="buy(l)") {{ $t('market.get') }}
              span.tag.is-success.is-light(v-else) ✓ {{ $t('market.owned') }}

      b-modal(v-model="createOpen" has-modal-card)
        .modal-card
          header.modal-card-head
            p.modal-card-title {{ $t('market.list') }}
          section.modal-card-body
            b-field(:label="$t('market.fTool')" :message="$t('market.toolHint')")
              b-autocomplete(
                v-model="toolQuery"
                :data="filteredTools"
                field="title"
                :placeholder="$t('market.toolPlaceholder')"
                :loading="toolsLoading"
                open-on-focus
                clearable
                @select="onToolSelect"
              )
                template(slot-scope="props")
                  .is-flex.is-justify-content-space-between.is-align-items-center
                    span {{ props.option.title }}
                    small.has-text-grey.ml-2 {{ props.option.subSection }}
                template(slot="empty") {{ $t('market.noTool') }}
            b-field(v-if="form.pageId" :label="$t('market.fToolId')")
              .tags.has-addons.mb-0
                span.tag.is-dark {{ form.pageId }}
                span.tag.is-info.is-light 🔒 {{ $t('market.readOnly') }}
            b-field(:label="$t('market.fTitle')")
              b-input(v-model="form.title")
            b-field(:label="$t('market.fSummary')")
              b-input(type="textarea" v-model="form.summary")
            b-field(:label="$t('market.fTags')")
              b-taginput(v-model="form.tags" ellipsis)
            b-field(:label="$t('market.fPrice')" :message="$t('market.priceHint')")
              b-input(v-model="form.price" placeholder="Free")
          footer.modal-card-foot
            b-button(type="is-warning" @click="create") {{ $t('market.list') }}
            b-button(@click="createOpen = false") {{ $t('common.cancel') }}
</template>

<script>
export default {
  name: 'MarketplacePage',
  data () {
    return {
      listings: [],
      loading: true,
      createOpen: false,
      form: { title: '', summary: '', tags: [], price: 'Free', pageId: '' },
      tools: [],
      toolsLoading: false,
      toolQuery: '',
      selectedTool: null
    }
  },
  computed: {
    // Client-side filter over the loaded catalogue; capped so the dropdown stays
    // snappy with 200+ tools. Matches title, sub-section and tags.
    filteredTools () {
      const q = (this.toolQuery || '').trim().toLowerCase()
      const base = q
        ? this.tools.filter((t) => {
          const hay = (t.title + ' ' + (t.subSection || '') + ' ' + (t.tags || []).join(' ')).toLowerCase()
          return hay.includes(q)
        })
        : this.tools
      return base.slice(0, 40)
    }
  },
  watch: {
    // If the picker text no longer matches the confirmed selection, the advisor is
    // re-searching — drop the link until they pick again (create() then blocks).
    toolQuery (val) {
      if (this.selectedTool && val !== this.selectedTool.title) {
        this.selectedTool = null
        this.form.pageId = ''
      }
    }
  },
  async mounted () {
    await this.load()
  },
  methods: {
    async load () {
      this.loading = true
      try {
        const res = await fetch('/api/people/marketplace')
        if (!res.ok) { throw new Error('HTTP ' + res.status) }
        this.listings = await res.json()
      } catch (e) {
        // Keep listings as [] so the grid stays empty rather than crashing.
        this.$buefy.toast.open({ message: 'Could not load the marketplace — is the backend running?', type: 'is-danger' })
      } finally {
        this.loading = false
      }
    },
    async buy (l) {
      try {
        const res = await fetch('/api/people/marketplace/' + l.id + '/purchase', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
        })
        const data = await res.json()
        if (data.success) {
          l.owned = true
          this.$buefy.toast.open({ message: this.$t('market.gotIt'), type: 'is-success' })
        }
      } catch (e) {
        this.$buefy.toast.open({ message: 'Failed', type: 'is-danger' })
      }
    },
    // Load the Advisor-e tool catalogue once, the first time the form opens.
    async loadTools () {
      if (this.tools.length) { return }
      this.toolsLoading = true
      try {
        const res = await fetch('/api/templates')
        if (res.ok) { this.tools = await res.json() }
      } catch (e) {
        // leave empty; the picker just shows no options
      } finally {
        this.toolsLoading = false
      }
    },
    // Fill the form from the chosen tool. The page ID is the read-only link; the
    // title/summary/tags pre-fill from the master record and stay editable.
    onToolSelect (option) {
      if (!option) { return }
      this.selectedTool = option
      this.form.pageId = option.pageId
      this.form.title = option.title
      this.form.summary = option.purpose || ''
      this.form.tags = (option.tags || []).slice()
      this.toolQuery = option.title
    },
    openCreate () {
      this.form = { title: '', summary: '', tags: [], price: 'Free', pageId: '' }
      this.toolQuery = ''
      this.selectedTool = null
      this.createOpen = true
      this.loadTools()
    },
    async create () {
      // A listing must link to a real Advisor-e tool (page ID). The backend
      // re-checks this, but block early for a clear message.
      if (!this.form.pageId) {
        this.$buefy.toast.open({ message: this.$t('market.toolRequired'), type: 'is-warning' })
        return
      }
      if (!this.form.title.trim()) {
        this.$buefy.toast.open({ message: this.$t('market.fTitle') + '?', type: 'is-warning' })
        return
      }
      try {
        const res = await fetch('/api/people/marketplace', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.form)
        })
        const l = await res.json()
        if (l && l.id) {
          this.createOpen = false
          await this.load()
          this.$buefy.toast.open({ message: this.$t('market.listed'), type: 'is-success' })
        }
      } catch (e) {
        this.$buefy.toast.open({ message: 'Failed', type: 'is-danger' })
      }
    }
  }
}
</script>

<style scoped>
.listing { height: 100%; }
.price { background: #fff0e8; color: #c0451f; font-weight: 300; }
</style>
