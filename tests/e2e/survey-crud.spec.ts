import { test, expect } from '@playwright/test'

test.describe('Phase 3: Admin Survey Management Lifecycle E2E', () => {
  test('redirects unauthenticated user from /admin/survey/create to /admin/login', async ({ page }) => {
    await page.goto('/admin/survey/create')
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator('h1')).toContainText('Admin Login')
  })

  test('redirects unauthenticated user from survey sub-routes to /admin/login', async ({ page }) => {
    await page.goto('/admin/survey/test-id-123/edit')
    await expect(page).toHaveURL(/\/admin\/login/)

    await page.goto('/admin/survey/test-id-123/analytics')
    await expect(page).toHaveURL(/\/admin\/login/)

    await page.goto('/admin/survey/test-id-123/responses')
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
