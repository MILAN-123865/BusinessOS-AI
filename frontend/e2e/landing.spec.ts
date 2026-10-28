import { test, expect } from '@playwright/test'

test.describe('Landing Page & Marketing Cockpit', () => {
  test('should render the landing page hero and branding', async ({ page }) => {
    await page.goto('/landing')
    
    // Check page title / branding presence
    await expect(page).toHaveTitle(/BusinessOS/i)
    
    // Verify hero text
    const heroHeading = page.locator('h1')
    await expect(heroHeading).toBeVisible()
    
    // Check Navigation bar links
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('should display pricing tiers', async ({ page }) => {
    await page.goto('/landing')
    
    // Locate pricing or plan cards
    const pricingSection = page.locator('text=Pricing').first()
    await expect(pricingSection).toBeVisible()
  })
})
