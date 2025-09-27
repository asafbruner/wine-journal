import { test, expect } from '@playwright/test';

test.describe('Wine Journal Application', () => {
  test.beforeEach(async ({ page }) => {
    // Initialize database and clear localStorage before each test
    await page.goto('/api/init-db');
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Sign up a new user for each test
    const timestamp = Date.now();
    const testEmail = `winetest${timestamp}@example.com`;
    
    await page.click('text=Sign up');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[placeholder="Enter your name"]', 'Wine Test User');
    await page.fill('input[placeholder="Enter your password"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for successful signup and redirect to main app
    await expect(page).toHaveURL(/\/(?!login|signup)/);
    await expect(page.locator('h1')).toContainText('Wine Journal');
  });

  test('should display the main page with title and add button', async ({ page }) => {
    // Check page title and header
    await expect(page).toHaveTitle('wine-journal');
    await expect(page.locator('h1')).toContainText('🍷 Wine Journal');
    await expect(page.locator('text=Keep track of your wine tastings and discoveries')).toBeVisible();
    
    // Check add button is visible
    await expect(page.locator('button:has-text("Add New Wine")')).toBeVisible();
  });

  test('should show empty state when no wines exist', async ({ page }) => {
    await expect(page.locator('text=No wines yet')).toBeVisible();
    await expect(page.locator('text=Start building your wine journal')).toBeVisible();
  });

  test('should allow adding a new wine', async ({ page }) => {
    // Click add wine button
    await page.click('button:has-text("Add New Wine")');
    
    // Verify form is displayed
    await expect(page.locator('h2:has-text("Add New Wine")')).toBeVisible();
    
    // Fill out the form
    await page.fill('input[placeholder*="Château Margaux"]', 'Test Wine 2023');
    await page.fill('input[placeholder*="2018"]', '2023');
    
    // Click on 4th star for rating
    await page.click('[aria-label="Rate 4 stars"]');
    
    // Fill tasting notes
    await page.fill('textarea[placeholder*="Describe the wine"]', 'Excellent wine with complex flavors and a long finish.');
    
    // Submit the form
    await page.click('button:has-text("Add Wine")');
    
    // Verify wine was added
    await expect(page.locator('text=Test Wine 2023')).toBeVisible();
    await expect(page.locator('text=Vintage: 2023')).toBeVisible();
    await expect(page.locator('text=Excellent wine with complex flavors')).toBeVisible();
    
    // Verify collection count
    await expect(page.locator('text=My Wine Collection (1)')).toBeVisible();
  });

  test('should allow editing a wine', async ({ page }) => {
    // First add a wine
    await page.click('button:has-text("Add New Wine")');
    await page.fill('input[placeholder*="Château Margaux"]', 'Original Wine');
    await page.click('[aria-label="Rate 3 stars"]');
    await page.fill('textarea[placeholder*="Describe the wine"]', 'Original notes');
    await page.click('button:has-text("Add Wine")');
    
    // Click edit button
    await page.click('[aria-label="Edit wine"]');
    
    // Verify edit form is displayed
    await expect(page.locator('h2:has-text("Edit Wine")')).toBeVisible();
    
    // Update the wine
    await page.fill('input[value="Original Wine"]', 'Updated Wine');
    await page.click('[aria-label="Rate 5 stars"]');
    await page.fill('textarea', 'Updated tasting notes with more details.');
    
    // Submit the update
    await page.click('button:has-text("Update Wine")');
    
    // Verify wine was updated
    await expect(page.locator('text=Updated Wine')).toBeVisible();
    await expect(page.locator('text=Updated tasting notes')).toBeVisible();
  });

  test('should allow deleting a wine', async ({ page }) => {
    // First add a wine
    await page.click('button:has-text("Add New Wine")');
    await page.fill('input[placeholder*="Château Margaux"]', 'Wine to Delete');
    await page.click('[aria-label="Rate 2 stars"]');
    await page.click('button:has-text("Add Wine")');
    
    // Verify wine exists
    await expect(page.locator('text=Wine to Delete')).toBeVisible();
    
    // Set up dialog handler for confirmation
    page.on('dialog', dialog => dialog.accept());
    
    // Click delete button
    await page.click('[aria-label="Delete wine"]');
    
    // Verify wine was deleted
    await expect(page.locator('text=Wine to Delete')).not.toBeVisible();
    await expect(page.locator('text=No wines yet')).toBeVisible();
  });

  test('should persist wines in localStorage', async ({ page }) => {
    // Add a wine
    await page.click('button:has-text("Add New Wine")');
    await page.fill('input[placeholder*="Château Margaux"]', 'Persistent Wine');
    await page.click('[aria-label="Rate 4 stars"]');
    await page.click('button:has-text("Add Wine")');
    
    // Verify wine is visible
    await expect(page.locator('text=Persistent Wine')).toBeVisible();
    
    // Reload the page
    await page.reload();
    
    // Verify wine is still there
    await expect(page.locator('text=Persistent Wine')).toBeVisible();
    await expect(page.locator('text=My Wine Collection (1)')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify responsive design
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Add New Wine")')).toBeVisible();
    
    // Add a wine on mobile
    await page.click('button:has-text("Add New Wine")');
    await page.fill('input[placeholder*="Château Margaux"]', 'Mobile Wine');
    await page.click('[aria-label="Rate 3 stars"]');
    await page.click('button:has-text("Add Wine")');
    
    // Verify wine card is properly displayed on mobile
    await expect(page.locator('text=Mobile Wine')).toBeVisible();
  });

  test('should sort wines correctly', async ({ page }) => {
    // Add multiple wines
    const wines = [
      { name: 'Zinfandel 2020', rating: 5 },
      { name: 'Cabernet 2019', rating: 3 },
      { name: 'Merlot 2021', rating: 4 }
    ];
    
    for (const wine of wines) {
      await page.click('button:has-text("Add New Wine")');
      await page.fill('input[placeholder*="Château Margaux"]', wine.name);
      await page.click(`[aria-label="Rate ${wine.rating} star${wine.rating !== 1 ? 's' : ''}"]`);
      await page.click('button:has-text("Add Wine")');
    }
    
    // Test sorting by name A-Z
    await page.selectOption('select', 'name-asc');
    
    const wineCards = page.locator('.card h3');
    await expect(wineCards.first()).toContainText('Cabernet');
    
    // Test sorting by highest rated
    await page.selectOption('select', 'rating-desc');
    await expect(wineCards.first()).toContainText('Zinfandel');
  });
});
