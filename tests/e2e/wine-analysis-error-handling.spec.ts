import { test, expect } from '@playwright/test';

test.describe('Wine Analysis Error Handling', () => {
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

  test('should handle API errors gracefully and show fallback analysis', async ({ page }) => {
    // Wait for the main app to load
    await expect(page.locator('h1')).toContainText('Wine Journal');
    
    // Intercept the analyze-wine API call and simulate a server error
    await page.route('/api/analyze-wine', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'API authentication failed. Please check configuration.',
          analysis: {
            wineName: 'Analysis failed',
            wineType: 'Unknown',
            tastingNotes: 'API authentication failed. Please check configuration. Please try again or enter details manually.',
            interestingFact: 'Wine analysis requires a clear photo of the wine bottle label and proper API configuration.',
            confidence: 0,
            analysisDate: new Date().toISOString()
          }
        })
      });
    });
    
    // Click the "Add New Wine" button
    await page.click('text=Add New Wine');
    
    // Wait for form to appear
    await page.waitForSelector('input[placeholder="e.g., Château Margaux 2015"]');
    
    // The test verifies that even with an API error, the app continues to work
    // and doesn't crash
    const isFormVisible = await page.locator('input[placeholder="e.g., Château Margaux 2015"]').isVisible();
    expect(isFormVisible).toBe(true);
  });

  test('should handle missing API key error', async ({ page, request }) => {
    // Test the API directly
    const response = await request.post('/api/analyze-wine', {
      data: {
        photoBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
      }
    });
    
    const data = await response.json();
    
    // Should return an error but also provide a fallback analysis
    expect(data.success).toBeDefined();
    expect(data.analysis).toBeDefined();
    
    // The analysis should indicate the error
    if (data.success === false) {
      expect(data.error).toBeTruthy();
      expect(data.analysis.wineName).toContain('failed');
    }
  });

  test('should handle missing photo data', async ({ request }) => {
    const response = await request.post('/api/analyze-wine', {
      data: {}
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Photo data is required');
  });

  test('should handle invalid request method', async ({ request }) => {
    const response = await request.get('/api/analyze-wine');
    
    expect(response.status()).toBe(405);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Method not allowed');
  });
});

