'use strict'

/**
 * Critical-journey e2e: each main section loads and renders its data from the
 * backend end to end. Structural selectors keep these locale-independent.
 */

const { test, expect } = require('@playwright/test')

test('Connections loads the incoming/connected buckets', async ({ page }) => {
  await page.goto('/connections')
  await expect(page.locator('.section-banner--connections')).toBeVisible()
  await expect(page.locator('.box').first()).toBeVisible()
})

test('Messages lists threads and opens a conversation', async ({ page }) => {
  await page.goto('/messages')
  await expect(page.locator('.section-banner--messages')).toBeVisible()
  const firstThread = page.locator('.thread-item').first()
  await expect(firstThread).toBeVisible()
  await firstThread.click()
  await expect(page.locator('.conversation')).toBeVisible()
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
