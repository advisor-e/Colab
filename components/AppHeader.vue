<template lang="pug">
  header.navbar.is-light(role="navigation" aria-label="main navigation")
    .navbar-brand
      nuxt-link.navbar-item.has-text-weight-bold(to="/") {{ $t('app.name') }}
    .navbar-menu.is-active
      .navbar-start
        nuxt-link.navbar-item.nav-link.nav--discover(to="/discover") {{ $t('nav.discover') }}
        nuxt-link.navbar-item.nav-link.nav--profile(to="/profile") {{ $t('nav.profile') }}
        nuxt-link.navbar-item.nav-link.nav--messages(to="/messages") {{ $t('nav.messages') }}
      .navbar-end
        .navbar-item
          .lang-picker(ref="langPicker")
            button.button.is-small(@click="toggleLangPicker") 🌐 {{ currentLanguageName }}
            .lang-dropdown(v-if="langPickerOpen")
              input.input.is-small(ref="langSearch" v-model="langSearch" :placeholder="$t('common.search')")
              p.help.is-danger(v-if="langError") {{ langError }}
              ul.lang-list
                li(v-for="lang in filteredLanguages" :key="lang.code")
                  button.button.is-small.is-white.is-fullwidth.lang-item(
                    @click="changeLocale(lang)"
                    :class="{ 'is-loading': loadingLang === lang.code }"
                  ) {{ lang.name }}
</template>

<script>
import localeMixin from '~/mixins/localeMixin'

export default {
  name: 'AppHeader',
  mixins: [localeMixin]
}
</script>

<style scoped>
.lang-picker { position: relative; }
.lang-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 30;
  width: 16rem;
  max-height: 20rem;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 6px;
  padding: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
.lang-list { margin-top: 0.5rem; list-style: none; }
.lang-item { justify-content: flex-start; }
</style>
