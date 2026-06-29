'use strict'

/**
 * Restify backend for Advisor-e Collaborate — runs on port 4000 (separate
 * process from Nuxt on 3000). Start: node server/restify-server.js (npm run backend).
 *
 * Locked runtime: Node 14.15 (CLAUDE.md Stack Constitution). Node 22+ breaks
 * Restify via a missing spdy binding. CommonJS only (no ESM).
 *
 * DEV NOTE: the people-layer routes currently serve in-memory mock data and are
 * unauthenticated. Real Advisory auth (firmAuth/JWT) + MySQL persistence wire in
 * later — see design/advisor-collaboration-platform-plan.md §12.
 */

;(function checkNodeVersion () {
  const major = Number(process.version.slice(1).split('.')[0])
  if (major >= 22) {
    process.stderr.write(
      '\n[STARTUP ERROR] Node ' + process.version + ' is not supported (Restify needs < 22). Use Node 14.15.\n\n'
    )
    process.exit(1)
  }
  if (major !== 14) {
    process.stderr.write(
      '\n[WARNING] Node ' + process.version + ' is not the locked runtime (Node 14.15).\n\n'
    )
  }
}())

const restify = require('restify')
const health = require('./routes/health')
const translate = require('./routes/translate')
const people = require('./routes/people')

const PORT = process.env.BACKEND_PORT || 4000

const server = restify.createServer({ name: 'advisor-collaborate-api', version: '1.0.0' })

// jsonBodyParser returns an ARRAY of handlers in Restify 9 — register each.
const jsonParsers = restify.plugins.jsonBodyParser({ mapParams: false })
;(Array.isArray(jsonParsers) ? jsonParsers : [jsonParsers]).forEach(function (fn) { server.use(fn) })
server.use(restify.plugins.queryParser())

// CORS — allow the Nuxt frontend on localhost during development.
server.use((req, res, next) => {
  const origin = req.headers.origin || ''
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  return next()
})
server.opts('/*', (req, res, next) => { res.send(204); return next() })

// ── Routes ──
server.get('/api/health', health.get)
server.post('/api/translate/locale', translate.post)

// People layer (DEV: mock data, unauthenticated)
server.get('/api/people/me', people.getMe)
server.put('/api/people/me', people.updateMe)
server.get('/api/people/advisors', people.listAdvisors)
server.get('/api/people/advisors/:id', people.getAdvisor)
server.get('/api/people/groups', people.listGroups)
server.get('/api/people/groups/:id', people.getGroup)
server.post('/api/people/outreach', people.sendOutreach)
server.get('/api/people/messages', people.listMessages)

server.listen(PORT, () => {
  console.error('[restify] advisor-collaborate-api listening on port ' + PORT)
})
