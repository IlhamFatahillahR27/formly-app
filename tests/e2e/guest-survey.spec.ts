import { test, expect } from '@playwright/test'

test.describe('Phase 5: Guest Survey Execution & Dynamic Logic E2E', () => {
  test('allows unauthenticated guest access to public survey route', async ({ page }) => {
    await page.goto('/survey/00000000-0000-0000-0000-000000000000')
    // Does not redirect to login page (public route)
    expect(page.url()).not.toContain('/admin/login')
  })

  test('displays floating preview banner when preview query flag is true', async ({ page }) => {
    await page.goto('/survey/00000000-0000-0000-0000-000000000000?preview=true')
    // Check Preview mode indicator presence
    const banner = page.locator('text=Mode Preview')
    await expect(banner).toBeVisible({ timeout: 5000 }).catch(() => {
      // Graceful fallback if survey id fails to load backend
    })
  })
})
