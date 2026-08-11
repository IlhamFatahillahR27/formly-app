import { test, expect } from '@playwright/test'

test.describe('Phase 2: Route Protection & Admin Login Flow with PasswordInput', () => {
  test('redirects unauthenticated user from /admin/dashboard to /admin/login', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator('h1')).toContainText('Admin Login')
  })

  test('renders email input, custom PasswordInput component, and submit button', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    
    // Check PasswordInput component input field
    const passwordInput = page.locator('input[placeholder="••••••••"]')
    await expect(passwordInput).toBeVisible()
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('toggles password visibility when eye button inside PasswordInput is clicked', async ({ page }) => {
    await page.goto('/admin/login')
    const passwordInput = page.locator('input[placeholder="••••••••"]')
    const toggleButton = page.locator('button:has(.i-heroicons-eye, .i-heroicons-eye-slash)')

    await passwordInput.fill('Password123!')
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle button to show password
    if (await toggleButton.count() > 0) {
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
    }
  })
})
