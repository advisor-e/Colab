<template lang="pug">
  section.section
    .container
      h1.title {{ $t('app.name') }}
      p.subtitle The people layer — find advisers, reach out, form groups.
      .buttons
        nuxt-link.button.is-primary(to="/profile") {{ $t('nav.profile') }}
        nuxt-link.button(to="/discover") {{ $t('nav.discover') }}
        nuxt-link.button(to="/messages") {{ $t('nav.messages') }}
</template>

<script>
export default {
  name: 'IndexPage'
}
</script>
