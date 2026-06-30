<template lang="pug">
  section.hero-wrap
    .container
      .hero-card
        h1.hero-title {{ $t('home.title') }}
        p.hero-sub {{ $t('home.subtitle') }}
        .pillar-grid
          nuxt-link.pillar.pillar--profile(to="/profile")
            .pillar__icon 👤
            h3 {{ $t('nav.profile') }}
            p {{ $t('home.profileDesc') }}
          nuxt-link.pillar.pillar--discover(to="/discover")
            .pillar__icon 🔎
            h3 {{ $t('nav.discover') }}
            p {{ $t('home.discoverDesc') }}
          nuxt-link.pillar.pillar--messages(to="/messages")
            .pillar__icon 💬
            h3 {{ $t('nav.messages') }}
            p {{ $t('home.messagesDesc') }}
</template>

<script>
export default {
  name: 'IndexPage'
}
</script>
