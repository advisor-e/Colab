'use strict'

/**
 * Critical-journey e2e: home → the main sections, driven through a real browser
 * against the running app (in-memory dev data). Selectors are structural
 * (section-banner / pillar / box classes) rather than translated text, so the
 * journeys stay stable across locale changes.
 */

const { test, expect } = require('@playwright/test')

test('home hero renders and shows the five pillar links', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.hero-title')).toBeVisible()
  await expect(page.locator('.pillar')).toHaveCount(5)
})

test('home → Discover shows advisor result cards', async ({ page }) => {
  await page.goto('/')
  await page.locator('.pillar--discover').click()
  await expect(page).toHaveURL(/\/discover/)
  await expect(page.locator('.section-banner--discover')).toBeVisible()
  // Cards are populated by a client-side fetch to the backend on mount.
  await expect(page.locator('.box').first()).toBeVisible()
})

test('Discover groups tab lists groups and opens a group detail page', async ({ page }) => {
  await page.goto('/discover?tab=groups')
  const firstGroup = page.locator('.group-head').first()
  await expect(firstGroup).toBeVisible()
  await firstGroup.click()
  await expect(page).toHaveURL(/\/groups\//)
  await expect(page.locator('.section-banner--groups')).toBeVisible()
})

test('create-group page is reachable from the groups tab', async ({ page }) => {
  await page.goto('/discover?tab=groups')
  await page.locator('a.button.is-warning', { hasText: /.+/ }).first().click()
  await expect(page).toHaveURL(/\/groups\/new/)
})
