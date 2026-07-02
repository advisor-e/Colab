'use strict'

/**
 * ADVISOR-E INTEGRATION CONFIG
 * ─────────────────────────────────────────────────────────────────────────────
 * The single place the integration team edits to align this app with Advisor-e.
 * Every other file imports its constants from here.
 *
 *   1. AUTH — match the JWT claim names + signing secret used by Advisory.com.
 *   2. DB   — point at the Advisor-e MySQL instance (or set the env vars).
 *
 * Prefer the env vars (JWT_SECRET, MYSQL_*) in real environments; the literals
 * here are dev placeholders. The backend refuses to boot in production while the
 * placeholders are still in place (see server/restify-server.js startup guard —
 * TODO: add when going live).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Auth ─────────────────────────────────────────────────────────────────────
// Names of the claims as they appear in the decoded Advisory.com JWT payload.
const AUTH = {
  firmIdClaim: 'firmId',
  advisorIdClaim: 'advisorId', // TODO: confirm with the Advisory auth team
  roleClaim: 'role',
  emailClaim: 'email',

  managerRole: 'firm_manager', // role granting Firm Manager access
  adminRole: 'platform_admin', // role granting platform-wide access
  mentorRole: 'platform_admin', // interim until a real 'mentor' role lands upstream

  // Signing secret used to verify tokens. For RS256 (asymmetric), put the public
  // key string here and switch the jwt.verify() call in server/middleware/auth.js.
  // TODO: replace with the shared secret from the Advisory auth service.
  secret: process.env.JWT_SECRET || 'REPLACE_ME_WITH_ADVISOR_E_JWT_SECRET'
}

// ── Database ─────────────────────────────────────────────────────────────────
// MySQL connection settings. Prefer the env vars in production.
const DB = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  database: process.env.MYSQL_DATABASE || 'advisor_collaborate',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'REPLACE_ME',
  connectionLimit: 10,
  connectTimeout: 2000 // fail fast in dev when MySQL is not running
}

// ── Cross-organisation engagement policy (plan §8; owner decisions D1 + Q6) ────
// D1 (2026-07-03): the default posture is CLOSED / opt-in — a firm's members are
// sealed to their own organisation until the firm opts in to reach across. Q6
// (2026-07-03): the boundary is the individual office — the advisor's `firm`
// (= branch). Both paths stay switchable: flip `defaultPosture` to 'open' for an
// open-network default (a config flip, not a rebuild).
//
// NOTE: per plan §8 the open/closed toggle is a MANAGER-level control. The admin
// UI to flip a firm's posture is deferred with FEAT-RBAC (blocked on Q-ROLES —
// see design/ACTIONS.md). Enforcement (the wall) is LIVE now; the per-firm
// posture is a seam in server/data/repository.js (getOrgPosture / setOrgPosture).
const CROSS_ORG = {
  defaultPosture: 'closed' // 'closed' = opt-in (D1) · 'open' = open network
}

module.exports = { AUTH, DB, CROSS_ORG }
