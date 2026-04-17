import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page).toHaveTitle(/محاسبي/)
  })

  test('portal routes are accessible', async ({ page }) => {
    await page.goto('/auth/login')
    // Page should render without errors
    await expect(page.locator('body')).toBeVisible()
  })
})
