'use strict'

/**
 * Nuxt server-middleware — THIN generic proxy for /api/*.
 *
 * Forwards every request under /api to the Restify backend (port 4000) and
 * pipes the response straight back. All real logic, DB access, and third-party
 * calls live on the backend (CLAUDE.md architecture boundary) — this file only
 * relays. Registered at path '/api', so req.url here is the sub-path
 * (e.g. '/people/advisors' for '/api/people/advisors').
 *
 * NOTE: No optional chaining / nullish coalescing — the Nuxt 2.14
 * server-middleware loader cannot parse `?.`/`??`. Keep this file plain.
 */

const http = require('http')
const https = require('https')
const { URL } = require('url')

const BACKEND = process.env.API_BASE_URL || 'http://localhost:4000'

module.exports = function apiProxy (req, res, next) {
  let target
  try {
    target = new URL('/api' + req.url, BACKEND)
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ success: false, error: { code: 'BAD_BACKEND_URL', message: 'Invalid backend URL' }, timestamp: new Date().toISOString() }))
    return
  }

  const lib = target.protocol === 'https:' ? https : http
  const opts = {
    hostname: target.hostname,
    port: target.port || (target.protocol === 'https:' ? 443 : 80),
    path: target.pathname + (target.search || ''),
    method: req.method,
    headers: req.headers
  }

  const backendReq = lib.request(opts, function (backendRes) {
    res.writeHead(backendRes.statusCode || 502, backendRes.headers)
    backendRes.pipe(res)
  })

  backendReq.on('error', function (err) {
    console.error('[api-proxy] backend error:', err.message)
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: false, error: { code: 'BACKEND_UNAVAILABLE', message: 'API backend unavailable' }, timestamp: new Date().toISOString() }))
    } else {
      try { res.end() } catch (e) {}
    }
  })

  req.pipe(backendReq)
}
