import { test, expect } from '@playwright/test';

test.describe('Simple Wine Test', () => {
  test('should initialize database and add a wine', async ({ page }) => {
    // First initialize the database
    await page.goto('/api/init-db');
    const content = await page.textContent('body');
    expect(content).toContain('success');
    
    // Now go to the app
    await page.goto('/');
    
    // Sign up a new user
    const timestamp = Date.now();
    const testEmail = `simpletest${timestamp}@example.com`;
    
    await page.click('text=Sign up');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[placeholder="Enter your name"]', 'Simple Test User');
    await page.fill('input[placeholder="Enter your password"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for successful signup
    await expect(page).toHaveURL(/\/(?!login|signup)/);
    await expect(page.locator('h1')).toContainText('Wine Journal');
    
    // Try to add a wine
    await page.click('text=Add New Wine');
    
    // Fill out the form with correct selectors
    await page.fill('input[placeholder="e.g., Château Margaux 2015"]', 'Simple Test Wine');
    await page.fill('input[placeholder="e.g., 2018"]', '2020');
    await page.fill('textarea[placeholder="Describe the wine\'s aroma, taste, finish, and your overall impression..."]', 'A simple test wine for testing purposes.');
    
    // Set rating
    await page.click('[data-testid="star-3"]');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait a bit for the wine to be added
    await page.waitForTimeout(2000);
    
    // Check if the wine appears in the list
    await expect(page.getByRole('heading', { name: 'Simple Test Wine' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=2020')).toBeVisible();
    await expect(page.locator('text=A simple test wine for testing purposes.')).toBeVisible();
  });
});
