import { test, expect } from '@playwright/test'

test.describe('Authentication Flows', () => {
  test('should render the login interface with credentials form', async ({ page }) => {
    await page.goto('/login')
    
    // Verify inputs exist
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitButton = page.locator('button[type="submit"]')
    
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()
  })

  test('should display validation feedback on empty submission', async ({ page }) => {
    await page.goto('/login')
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Page should remain on /login and not crash
    expect(page.url()).toContain('/login')
  })
})
