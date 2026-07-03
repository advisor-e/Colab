'use strict'

/**
 * Critical-journey e2e: each main section loads and renders its data from the
 * backend end to end. Structural selectors keep these locale-independent.
 */

const { test, expect } = require('@playwright/test')

test('Connecting loads the unified list and opens a conversation side-by-side', async ({ page }) => {
  await page.goto('/connecting')
  await expect(page.locator('.section-banner--connecting')).toBeVisible()
  const firstRow = page.locator('.cx-row').first()
  await expect(firstRow).toBeVisible()
  await firstRow.click()
  await expect(page.locator('.conversation')).toBeVisible()
})

test('the retired /connections and /messages routes redirect into Connecting', async ({ page }) => {
  await page.goto('/connections')
  await expect(page).toHaveURL(/\/connecting/)
  await page.goto('/messages')
  await expect(page).toHaveURL(/\/connecting/)
})

test('Marketplace lists group-owned tools', async ({ page }) => {
  await page.goto('/marketplace')
  await expect(page.locator('.section-banner--market')).toBeVisible()
  await expect(page.locator('.listing').first()).toBeVisible()
})

test('Profile loads the advisor identity from the backend', async ({ page }) => {
  await page.goto('/profile')
  await expect(page.locator('.section-banner--profile')).toBeVisible()
  // The "advertised" fields box renders once /api/people/me resolves.
  await expect(page.locator('.box').first()).toBeVisible()
})
