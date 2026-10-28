import { test, expect } from '@playwright/test'

test.describe('Finance & Corporate Invoicing', () => {
  test('should render the finance cockpit and invoice ledger', async ({ page }) => {
    await page.goto('/finance')
    
    // Check main page heading
    const heading = page.locator('h1').first()
    await expect(heading).toContainText(/Financial|Ledger|Invoice/i)
    
    // Check invoice table exists
    const table = page.locator('table').first()
    await expect(table).toBeVisible()
    
    // Check export or action buttons exist
    const actionBtn = page.locator('button').filter({ hasText: /Export|Create Invoice/i }).first()
    await expect(actionBtn).toBeVisible()
  })
})
