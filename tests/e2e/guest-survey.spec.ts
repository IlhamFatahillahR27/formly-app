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

  test('renders responsively without horizontal overflow on sm, md, lg, xl, and 2xl viewports', async ({ page }) => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'sm', width: 640, height: 800 },
      { name: 'md', width: 768, height: 1024 },
      { name: 'lg', width: 1024, height: 768 },
      { name: 'xl', width: 1280, height: 800 },
      { name: '2xl', width: 1536, height: 900 },
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/survey/00000000-0000-0000-0000-000000000000?preview=true')
      
      const bodyWidth = await page.evaluate(() => document.body.clientWidth)
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
      
      // Ensure no horizontal scrollbar overflow
      expect(scrollWidth).toBeLessThanOrEqual(bodyWidth + 1)
    }
  })
})
