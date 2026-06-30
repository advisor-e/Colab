<template lang="pug">
  section.section
    .container
      .section-banner.section-banner--messages
        span.ico 💬
        h1 {{ $t('messages.title') }}
      .columns
        .column.is-one-third
          p.heading {{ $t('messages.requests') }}
          .box(v-for="r in data.requests" :key="r.id")
            p.has-text-weight-semibold {{ r.fromName }}
            p.has-text-grey.is-size-7 {{ r.preview }}
            .buttons.mt-2
              b-button(size="is-small" type="is-primary") {{ $t('messages.accept') }}
              b-button(size="is-small") {{ $t('messages.skip') }}
          p.heading.mt-5 {{ $t('messages.chats') }}
          nuxt-link.box.is-block(v-for="c in data.chats" :key="c.id" to="/messages") {{ c.name }}
        .column
          b-message(type="is-info") {{ $t('messages.empty') }}
</template>

<script>
export default {
  name: 'MessagesPage',
  data () {
    return { data: { requests: [], chats: [] } }
  },
  async mounted () {
    try {
      const res = await fetch('/api/people/messages')
      this.data = await res.json()
    } catch (e) {
      // backend may be down in dev — leave the empty state
    }
  }
}
</script>
