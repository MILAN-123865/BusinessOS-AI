import { test, expect } from '@playwright/test'

test.describe('Dashboard Navigation & Workspaces', () => {
  test('should load the dashboard and navigation sidebar', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check main layout container
    const main = page.locator('main, [role="main"]').first()
    await expect(main).toBeVisible()
    
    // Check sidebar navigation links
    const sidebar = page.locator('aside, nav').first()
    await expect(sidebar).toBeVisible()
  })
})
