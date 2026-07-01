'use strict'

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],

  // Resolve Nuxt's '~' root alias so frontend mixins/components can be imported
  // in tests the same way the app imports them.
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1'
  },

  // Coverage is collected on every run so the security thresholds below are
  // enforced by the pre-commit gate and CI, not left to memory.
  collectCoverage: true,
  coverageReporters: ['text-summary'],
  collectCoverageFrom: [
    'server/**/*.js',
    'server-middleware/**/*.js',
    'mixins/**/*.js',
    '!server/restify-server.js',
    '!node_modules/**'
  ],

  // Coverage gates (CLAUDE.md §Testing). Enforced on every `npm test` run — and
  // therefore in the pre-commit hook and CI — so coverage cannot silently regress.
  // Thresholds sit a little below current actuals to avoid brittleness while
  // still holding the standard. Current: global lines ~99%, routes lines 100%,
  // mixins lines 100%.
  //   - Restify routes ≥ 90%          (CLAUDE.md target)
  //   - mixins ≥ 80%                  (CLAUDE.md target)
  //   - security/AI-validation utils = 100% (must-test functions)
  coverageThreshold: {
    global: { statements: 88, branches: 78, functions: 88, lines: 88 },
    './server/routes/': { statements: 90, branches: 80, functions: 90, lines: 90 },
    './mixins/': { statements: 80, branches: 75, functions: 80, lines: 80 },
    './server/utils/sanitiseInput.js': { statements: 100, branches: 100, functions: 100, lines: 100 },
    './server/utils/validateAIResponse.js': { statements: 100, branches: 100, functions: 100, lines: 100 },
    './server/utils/productionGuard.js': { statements: 100, branches: 100, functions: 100, lines: 100 }
  }
}
