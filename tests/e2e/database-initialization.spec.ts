import { test, expect } from '@playwright/test';

test.describe('Database Initialization', () => {
  test('should initialize database tables', async ({ page }) => {
    // Navigate to the init-db endpoint
    await page.goto('/api/init-db');
    
    // Check if the response indicates success
    const content = await page.textContent('body');
    expect(content).toContain('success');
  });

  test('should handle database operations after initialization', async ({ page }) => {
    // First initialize the database
    await page.goto('/api/init-db');
    const content = await page.textContent('body');
    expect(content).toContain('success');
    
    // Now test a simple signup to verify database is working
    await page.goto('/');
    
    // Click sign up link
    await page.click('text=Sign up');
    
    // Fill out sign up form
    const timestamp = Date.now();
    const testEmail = `dbtest${timestamp}@example.com`;
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[placeholder="Enter your name"]', 'DB Test User');
    await page.fill('input[placeholder="Enter your password"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    
    // Submit sign up form
    await page.click('button[type="submit"]');
    
    // Wait for successful signup and redirect
    await expect(page).toHaveURL(/\/(?!login|signup)/);
    
    // Verify we're logged in
    await expect(page.locator('h1')).toContainText('Wine Journal');
  });
});
