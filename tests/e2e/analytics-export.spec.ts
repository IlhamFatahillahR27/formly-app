import { test, expect } from '@playwright/test'

test.describe('Phase 7: Analytics & Responses Protection & UI Navigation', () => {
  test('redirects unauthenticated user from analytics page to login', async ({ page }) => {
    await page.goto('/admin/survey/mock-survey-id/analytics')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('redirects unauthenticated user from responses page to login', async ({ page }) => {
    await page.goto('/admin/survey/mock-survey-id/responses')
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
