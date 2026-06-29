<template lang="pug">
  div
    app-header
    nuxt
</template>

<script>
import AppHeader from '~/components/AppHeader.vue'

export default {
  name: 'DefaultLayout',
  components: { AppHeader }
}
</script>
