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
    return { listings: [], loading: true, createOpen: false, form: { title: '', summary: '', tags: [], price: 'Free' } }
  },
  async mounted () {
    await this.load()
  },
  methods: {
    async load () {
      this.loading = true
      try {
        const res = await fetch('/api/people/marketplace')
        this.listings = await res.json()
      } catch (e) {
        // leave empty
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
    openCreate () {
      this.form = { title: '', summary: '', tags: [], price: 'Free' }
      this.createOpen = true
    },
    async create () {
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
.price { background: #fff0e8; color: #c0451f; font-weight: 700; }
</style>
