import { test, expect } from '@playwright/test';

test.describe('Wine Management', () => {
  test.beforeEach(async ({ page }) => {
    // Initialize database and navigate to the app
    await page.goto('/api/init-db');
    await page.goto('/');
    
    // Sign up a new user for testing
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    // Click sign up link
    await page.click('text=Sign up');
    
    // Fill out sign up form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[placeholder="Enter your name"]', 'Test User');
    await page.fill('input[placeholder="Enter your password"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    
    // Submit sign up form
    await page.click('button[type="submit"]');
    
    // Wait for successful signup and redirect
    await expect(page).toHaveURL(/\/(?!login|signup)/);
  });

  test('should add a wine and display it in the list', async ({ page }) => {
    // Wait for the main app to load
    await expect(page.locator('h1')).toContainText('Wine Journal');
    
    // Click the "Add New Wine" button
    await page.click('text=Add New Wine');
    
    // Fill out the wine form
    await page.fill('input[placeholder="e.g., Château Margaux 2015"]', 'Test Cabernet Sauvignon');
    await page.fill('input[placeholder="e.g., 2018"]', '2020');
    await page.fill('textarea[placeholder="Describe the wine\'s aroma, taste, finish, and your overall impression..."]', 'Rich and full-bodied with notes of blackberry and oak.');
    
    // Set rating (click on 4th star)
    await page.click('[data-testid="star-4"]');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for the wine to appear in the list
    await expect(page.locator('text=Test Cabernet Sauvignon')).toBeVisible();
    await expect(page.locator('text=2020')).toBeVisible();
    await expect(page.locator('text=Rich and full-bodied with notes of blackberry and oak.')).toBeVisible();
    
    // Verify the rating is displayed (4 stars)
    const ratingStars = page.locator('[data-testid^="star-"]');
    await expect(ratingStars.nth(3)).toHaveClass(/filled/);
  });

  test('should persist wines after page reload', async ({ page }) => {
    // Add a wine first
    await page.click('text=Add New Wine');
    await page.fill('input[placeholder="e.g., Château Margaux 2015"]', 'Persistent Wine Test');
    await page.fill('input[placeholder="e.g., 2018"]', '2019');
    await page.fill('textarea[placeholder="Describe the wine\'s aroma, taste, finish, and your overall impression..."]', 'This wine should persist after reload.');
    await page.click('[data-testid="star-3"]');
    await page.click('button[type="submit"]');
    
    // Wait for wine to appear
    await expect(page.locator('text=Persistent Wine Test')).toBeVisible();
    
    // Reload the page
    await page.reload();
    
    // Wait for the app to load again
    await expect(page.locator('h1')).toContainText('Wine Journal');
    
    // Verify the wine is still there
    await expect(page.locator('text=Persistent Wine Test')).toBeVisible();
    await expect(page.locator('text=2019')).toBeVisible();
    await expect(page.locator('text=This wine should persist after reload.')).toBeVisible();
  });

  test('should update a wine entry', async ({ page }) => {
    // Add a wine first
    await page.click('text=Add New Wine');
    await page.fill('input[placeholder="e.g., Château Margaux 2015"]', 'Wine to Update');
    await page.fill('input[placeholder="e.g., 2018"]', '2018');
    await page.fill('textarea[placeholder="Describe the wine\'s aroma, taste, finish, and your overall impression..."]', 'Original notes.');
    await page.click('[data-testid="star-2"]');
    await page.click('button[type="submit"]');
    
    // Wait for wine to appear
    await expect(page.locator('text=Wine to Update')).toBeVisible();
    
    // Click edit button
    await page.click('[aria-label="Edit wine"]');
    
    // Update the wine
    await page.fill('input[placeholder="e.g., Château Margaux 2015"]', 'Updated Wine Name');
    await page.fill('textarea[placeholder="Describe the wine\'s aroma, taste, finish, and your overall impression..."]', 'Updated tasting notes.');
    await page.click('[data-testid="star-5"]');
    await page.click('button[type="submit"]');
    
    // Verify the updates
    await expect(page.locator('text=Updated Wine Name')).toBeVisible();
    await expect(page.locator('text=Updated tasting notes.')).toBeVisible();
    await expect(page.locator('text=Wine to Update')).not.toBeVisible();
  });

  test('should delete a wine entry', async ({ page }) => {
    // Add a wine first
    await page.click('text=Add New Wine');
    await page.fill('input[placeholder="e.g., Château Margaux 2015"]', 'Wine to Delete');
    await page.fill('input[placeholder="e.g., 2018"]', '2017');
    await page.fill('textarea[placeholder="Describe the wine\'s aroma, taste, finish, and your overall impression..."]', 'This will be deleted.');
    await page.click('[data-testid="star-1"]');
    await page.click('button[type="submit"]');
    
    // Wait for wine to appear
    await expect(page.locator('text=Wine to Delete')).toBeVisible();
    
    // Accept the confirmation dialog then click delete
    page.on('dialog', dialog => dialog.accept());
    await page.click('[aria-label="Delete wine"]');
    
    // Verify the wine is gone
    await expect(page.locator('text=Wine to Delete')).not.toBeVisible();
  });

  test('should show empty state when no wines exist', async ({ page }) => {
    // Wait for the main app to load
    await expect(page.locator('h1')).toContainText('Wine Journal');
    
    // Should show empty state message
    await expect(page.locator('text=No wines yet')).toBeVisible();
    await expect(page.locator('text=Start building your wine journal by adding your first wine!')).toBeVisible();
  });
});
