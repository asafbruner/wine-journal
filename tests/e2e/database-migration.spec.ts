import { test, expect } from '@playwright/test';

test.describe.skip('Database Migration Tests (requires production database)', () => {
  // These tests require a real database to properly test migrations.
  // They are skipped in dev mode which uses in-memory mocks.
  test('database initialization should be idempotent', async ({ request }) => {
    // Run init-db multiple times - should not fail
    for (let i = 0; i < 3; i++) {
      const response = await request.post('/api/init-db');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Database');
      expect(data.tables).toContain('users');
      expect(data.tables).toContain('wines');
    }
  });

  test('location column migration should be idempotent', async ({ page, request }) => {
    // Initialize database multiple times
    await page.goto('/api/init-db');
    await page.goto('/api/init-db');
    
    // Sign up via UI
    await page.goto('/');
    await page.click('text=Sign up');
    
    const timestamp = Date.now();
    await page.fill('input[type="email"]', `migration-${timestamp}@example.com`);
    await page.fill('input[placeholder="Enter your name"]', 'Migration Test');
    await page.fill('input[placeholder="Enter your password"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(?!login|signup)/);
    
    const userDataString = await page.evaluate(() => localStorage.getItem('wine-journal-current-user'));
    const userData = JSON.parse(userDataString || '{}');
    const userId = userData.id;
    
    const wineResponse = await request.post('/api/wines', {
      data: {
        action: 'add-wine',
        userId: userId,
        wineData: {
          name: 'Post Migration Wine',
          rating: 4,
          notes: 'Testing after migration',
          location: 'Tuscany, Italy'
        }
      }
    });
    
    const wineData = await wineResponse.json();
    expect(wineResponse.ok()).toBeTruthy();
    expect(wineData.success).toBe(true);
    expect(wineData.wine.location).toBe('Tuscany, Italy');
  });
});

