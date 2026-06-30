'use strict'

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],

  // Files whose coverage we care about as the suite grows. The self-listening
  // server entrypoint is excluded (it binds a port on require).
  collectCoverageFrom: [
    'server/**/*.js',
    'server-middleware/**/*.js',
    '!server/restify-server.js',
    '!node_modules/**'
  ]

  // NOTE — coverageThreshold gates are intentionally NOT set yet.
  // The suite is being built up from zero (see design/ACTIONS.md → P1-TEST).
  // The previous config enforced 100% on server/utils/validateAIResponse.js and
  // server/utils/sanitiseInput.js, which DO NOT EXIST — that broke
  // `jest --coverage` with a "coverage data not found" error. Restore strict
  // per-file thresholds (CLAUDE.md §Testing) once those security functions and
  // their tests land (design/ACTIONS.md → P1-SEC-UTILS).
}
