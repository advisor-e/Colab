'use strict'

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],

  // Coverage is collected on every run so the security thresholds below are
  // enforced by the pre-commit gate and CI, not left to memory.
  collectCoverage: true,
  coverageReporters: ['text-summary'],
  collectCoverageFrom: [
    'server/**/*.js',
    'server-middleware/**/*.js',
    '!server/restify-server.js',
    '!node_modules/**'
  ],

  // Security-critical utilities are held at 100% (CLAUDE.md §Testing — input
  // sanitisation + AI/third-party-response validation are must-test functions).
  // These files now exist and are fully covered (design/ACTIONS.md P1-SEC-UTILS).
  // Broader per-directory targets (routes ≥90%, mixins/actions ≥80%) are the
  // remaining work tracked under design/ACTIONS.md P1-TEST.
  coverageThreshold: {
    './server/utils/sanitiseInput.js': { statements: 100, branches: 100, functions: 100, lines: 100 },
    './server/utils/validateAIResponse.js': { statements: 100, branches: 100, functions: 100, lines: 100 },
    './server/utils/productionGuard.js': { statements: 100, branches: 100, functions: 100, lines: 100 }
  }
}
