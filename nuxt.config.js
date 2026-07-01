// ── Node version guard ────────────────────────────────────────────────────────
// Locked runtime is Node 14.15 (CLAUDE.md Stack Constitution). Warn on drift so
// it is always visible; never recommend a different version.
;(function checkNodeVersion () {
  const major = Number(process.version.slice(1).split('.')[0])
  if (major >= 22) {
    process.stderr.write(
      '\n[STARTUP ERROR] Node ' + process.version + ' is not supported.\n' +
      'Node 22+ breaks Restify via a missing spdy binding.\n' +
      'The locked runtime is Node 14.15 — run: nvm use 14.15.0\n\n'
    )
    process.exit(1)
  }
  if (major !== 14) {
    process.stderr.write(
      '\n[WARNING] Node ' + process.version + ' is not the locked runtime (Node 14.15).\n' +
      'Run: nvm use 14.15.0\n\n'
    )
  }
}())

export default {
  target: 'server',
  telemetry: false,

  server: {
    port: 3000,
    host: 'localhost'
  },

  head: {
    title: 'Advisor-e Collaborate',
    htmlAttrs: { lang: 'en' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400&display=swap' }
    ]
  },

  css: [
    'buefy/dist/buefy.css',
    '~/assets/css/theme.css'
  ],

  plugins: [
    '~/plugins/buefy.js',
    '~/plugins/i18n.js'
  ],

  components: true,
  buildModules: [],
  modules: [],

  // Thin proxy: forward all /api/* traffic to the Restify backend (port 4000).
  serverMiddleware: [
    { path: '/api', handler: '~/server-middleware/api.js' }
  ],

  env: {
    apiBaseUrl: process.env.API_BASE_URL || ''
  },

  build: {
    cache: true,
    parallel: false,
    extend (config, { isDev }) {
      if (isDev) {
        config.optimization = config.optimization || {}
        config.optimization.splitChunks = { chunks: 'async' }
        config.devtool = 'eval-cheap-module-source-map'
      }
    }
  },

  watchers: {
    webpack: {
      aggregateTimeout: 300,
      poll: false
    }
  }
}
