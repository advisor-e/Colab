import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from '../locales/en.json'

Vue.use(VueI18n)

// English is the base/source language bundled at build time. Every other
// language is generated on demand by translating the base strings via the
// backend translate route and cached in localStorage (see mixins/localeMixin.js
// + server/routes/translate.js). This is how the app supports many languages
// without hand-authoring a locale file per language.
export default ({ app }) => {
  app.i18n = new VueI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: { en }
  })
}
