import { test, expect } from '@playwright/test'

test.describe('RBAC Simulator Sandbox', () => {
  test('should render the RBAC Simulator with persona switches', async ({ page }) => {
    await page.goto('/rbac-simulator')
    
    // Check page title / heading
    const heading = page.locator('h1, h2, h3').first()
    await expect(heading).toBeVisible()
    
    // Check persona switch buttons
    const personaButton = page.locator('button').filter({ hasText: /perms/i }).first()
    await expect(personaButton).toBeVisible()
  })
})
