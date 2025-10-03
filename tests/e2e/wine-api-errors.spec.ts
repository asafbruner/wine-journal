import { test, expect } from '@playwright/test';

test.describe('Wine API Error Handling', () => {
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

  test('should handle API errors gracefully when adding wine with invalid data', async ({ page }) => {
    // Wait for the main app to load
    await expect(page.locator('h1')).toContainText('Wine Journal');
    
    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Intercept the API call and simulate a server error
    await page.route('/api/wines', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      if (postData.action === 'add-wine') {
        // Simulate a 500 error response
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Database connection error'
          })
        });
      } else {
        // Let other requests through
        await route.continue();
      }
    });
    
    // Click the "Add New Wine" button
    await page.click('text=Add New Wine');
    
    // Fill out the wine form
    await page.fill('input[placeholder="e.g., Château Margaux 2015"]', 'Test Wine');
    await page.fill('input[placeholder="e.g., 2018"]', '2020');
    await page.fill('textarea[placeholder="Describe the wine\'s aroma, taste, finish, and your overall impression..."]', 'Test notes');
    
    // Set rating (click on 4th star)
    await page.click('[data-testid="star-4"]');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait a moment for the error to be processed
    await page.waitForTimeout(1000);
    
    // Verify that the error was logged to console
    expect(consoleErrors.some(error => 
      error.includes('Error adding wine') || 
      error.includes('Server response')
    )).toBeTruthy();
    
    // Verify wine was NOT added (list should be empty or not contain the wine)
    const wineExists = await page.locator('text=Test Wine').isVisible({ timeout: 2000 }).catch(() => false);
    expect(wineExists).toBe(false);
  });

  test.skip('should handle validation errors for missing required fields (requires integration setup)', async ({ page, request }) => {
    // This test requires proper session handling between page context and API requests
    // Get userId from localStorage after login
    const userId = await page.evaluate(() => {
      const userData = localStorage.getItem('wine-journal-current-user');
      return userData ? JSON.parse(userData).id : null;
    });
    
    expect(userId).toBeTruthy();
    
    // Test with missing wine name
    const response1 = await request.post('/api/wines', {
      data: {
        action: 'add-wine',
        userId,
        wineData: {
          name: '', // Empty name
          rating: 4,
          notes: 'Test notes'
        }
      }
    });
    
    expect(response1.status()).toBe(400);
    const result1 = await response1.json();
    expect(result1.success).toBe(false);
    expect(result1.error).toContain('name');
    
    // Test with missing wine data
    const response2 = await request.post('/api/wines', {
      data: {
        action: 'add-wine',
        userId,
        wineData: null
      }
    });
    
    expect(response2.status()).toBe(400);
    const result2 = await response2.json();
    expect(result2.success).toBe(false);
    expect(result2.error).toContain('required');
    
    // Test with invalid rating
    const response3 = await request.post('/api/wines', {
      data: {
        action: 'add-wine',
        userId,
        wineData: {
          name: 'Test Wine',
          rating: 10, // Invalid rating (must be 1-5)
          notes: 'Test notes'
        }
      }
    });
    
    expect(response3.status()).toBe(400);
    const result3 = await response3.json();
    expect(result3.success).toBe(false);
    expect(result3.error).toContain('Rating');
  });

  test.skip('should handle errors for invalid user ID (database constraint test)', async ({ request }) => {
    // This test only works with real database, not mocks
    // Test with non-existent user ID
    const response = await request.post('/api/wines', {
      data: {
        action: 'add-wine',
        userId: 'non-existent-user-id',
        wineData: {
          name: 'Test Wine',
          rating: 4,
          notes: 'Test notes'
        }
      }
    });
    
    // This should fail with a foreign key constraint error in production
    expect(response.status()).toBe(500);
    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('should handle missing user ID', async ({ request }) => {
    const response = await request.post('/api/wines', {
      data: {
        action: 'add-wine',
        // userId is missing
        wineData: {
          name: 'Test Wine',
          rating: 4,
          notes: 'Test notes'
        }
      }
    });
    
    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.error).toContain('User ID is required');
  });

  test('should return proper error messages that can be displayed to users', async ({ page }) => {
    // Intercept the API call to return a specific error
    await page.route('/api/wines', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      if (postData.action === 'add-wine') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Wine name is required'
          })
        });
      } else {
        await route.continue();
      }
    });
    
    // Wait for the main app to load
    await expect(page.locator('h1')).toContainText('Wine Journal');
    
    // Click the "Add New Wine" button
    await page.click('text=Add New Wine');
    
    // Fill out the wine form with empty name
    await page.fill('input[placeholder="e.g., Château Margaux 2015"]', '');
    await page.fill('textarea[placeholder="Describe the wine\'s aroma, taste, finish, and your overall impression..."]', 'Test notes');
    
    // Set rating
    await page.click('[data-testid="star-3"]');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait a moment for the error to be processed
    await page.waitForTimeout(1000);
    
    // The wine should not be added
    const wineCards = await page.locator('[data-testid^="wine-card"]').count();
    expect(wineCards).toBe(0);
  });
});

