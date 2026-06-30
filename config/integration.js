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

module.exports = { AUTH, DB }
