<template lang="pug">
  div
    view-as-banner
    app-header
    nuxt
</template>

<script>
import AppHeader from '~/components/AppHeader.vue'
import ViewAsBanner from '~/components/ViewAsBanner.vue'

export default {
  name: 'DefaultLayout',
  components: { AppHeader, ViewAsBanner }
}
</script>
