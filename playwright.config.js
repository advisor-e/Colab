'use strict'

/**
 * Playwright config — critical-journey end-to-end tests (CLAUDE.md §Testing).
 *
 * Drives a real Chromium against the full running app. `webServer` boots the app
 * via `npm run dev:all` (Nuxt on :3000 + the Restify backend on :4000, which
 * falls back to the in-memory dev store), so the journeys exercise the real
 * frontend → proxy → backend path end to end.
 *
 * Pinned to @playwright/test@1.34.3 — the last line that supports the locked
 * Node 14.15 runtime (1.35+ requires Node 16). Node-14 / CommonJS.
 *
 * Separate from Jest: e2e specs live in ./e2e as .spec.js files; Jest only runs
 * the tests/ suites. Run with `npm run test:e2e`.
 */

const { defineConfig, devices } = require('@playwright/test')

const CI = !!process.env.CI

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: Object.assign({}, devices['Desktop Chrome']) }
  ],
  webServer: {
    command: 'npm run dev:all',
    url: 'http://localhost:3000',
    timeout: 240000,
    reuseExistingServer: !CI
  }
})
