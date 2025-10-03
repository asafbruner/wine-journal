import { test, expect } from '@playwright/test';

test.describe.skip('Database Schema Validation (requires production database)', () => {
  // These tests require a real database to properly test foreign key constraints
  // and schema validation. They are skipped in dev mode which uses in-memory mocks.
  test('should have location column in wines table', async ({ page, request }) => {
    // Initialize database
    await page.goto('/api/init-db');
    
    // Sign up via UI to get a real user
    await page.goto('/');
    await page.click('text=Sign up');
    
    const timestamp = Date.now();
    await page.fill('input[type="email"]', `schema-test-${timestamp}@example.com`);
    await page.fill('input[placeholder="Enter your name"]', 'Schema Test User');
    await page.fill('input[placeholder="Enter your password"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for successful signup
    await expect(page).toHaveURL(/\/(?!login|signup)/);
    
    // Get userId from localStorage
    const userDataString = await page.evaluate(() => localStorage.getItem('wine-journal-current-user'));
    const userData = JSON.parse(userDataString || '{}');
    const userId = userData.id;
    
    // Verify userId exists
    expect(userId).toBeTruthy();
    console.log('Test userId:', userId);
    
    // Add a wine with location data
    const wineResponse = await request.post('/api/wines', {
      data: {
        action: 'add-wine',
        userId: userId,
        wineData: {
          name: 'Location Test Wine',
          vintage: 2020,
          rating: 4,
          notes: 'Testing location field',
          location: 'Napa Valley, California'
        }
      }
    });
    
    const wineData = await wineResponse.json();
    console.log('Wine response:', JSON.stringify(wineData, null, 2));
    
    // Should succeed without database errors
    expect(wineResponse.ok()).toBeTruthy();
    expect(wineData.success).toBe(true);
    expect(wineData.wine).toBeDefined();
    expect(wineData.wine.location).toBe('Napa Valley, California');
  });

  test('should handle wines without location (nullable column)', async ({ page, request }) => {
    // Initialize database and sign up
    await page.goto('/api/init-db');
    await page.goto('/');
    await page.click('text=Sign up');
    
    const timestamp = Date.now();
    await page.fill('input[type="email"]', `no-location-${timestamp}@example.com`);
    await page.fill('input[placeholder="Enter your name"]', 'No Location Test');
    await page.fill('input[placeholder="Enter your password"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(?!login|signup)/);
    
    const userDataString = await page.evaluate(() => localStorage.getItem('wine_journal_user'));
    const userData = JSON.parse(userDataString || '{}');
    const userId = userData.id;
    
    // Add a wine WITHOUT location data
    const wineResponse = await request.post('/api/wines', {
      data: {
        action: 'add-wine',
        userId: userId,
        wineData: {
          name: 'No Location Wine',
          vintage: 2021,
          rating: 5,
          notes: 'No location specified'
          // location is intentionally omitted
        }
      }
    });
    
    const wineData = await wineResponse.json();
    
    // Should succeed - location is optional
    expect(wineResponse.ok()).toBeTruthy();
    expect(wineData.success).toBe(true);
    expect(wineData.wine).toBeDefined();
  });

  test('should have all required columns in wines table', async ({ page, request }) => {
    // Initialize database and sign up
    await page.goto('/api/init-db');
    await page.goto('/');
    await page.click('text=Sign up');
    
    const timestamp = Date.now();
    await page.fill('input[type="email"]', `all-fields-${timestamp}@example.com`);
    await page.fill('input[placeholder="Enter your name"]', 'All Fields Test');
    await page.fill('input[placeholder="Enter your password"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(?!login|signup)/);
    
    const userDataString = await page.evaluate(() => localStorage.getItem('wine_journal_user'));
    const userData = JSON.parse(userDataString || '{}');
    const userId = userData.id;
    
    // Add a wine with ALL fields
    const wineResponse = await request.post('/api/wines', {
      data: {
        action: 'add-wine',
        userId: userId,
        wineData: {
          name: 'Complete Wine Entry',
          vintage: 2019,
          rating: 5,
          notes: 'Testing all fields',
          location: 'Bordeaux, France',
          photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
      }
    });
    
    const wineData = await wineResponse.json();
    
    // Verify all fields are saved correctly
    expect(wineResponse.ok()).toBeTruthy();
    expect(wineData.success).toBe(true);
    expect(wineData.wine).toBeDefined();
    expect(wineData.wine.name).toBe('Complete Wine Entry');
    expect(wineData.wine.vintage).toBe(2019);
    expect(wineData.wine.rating).toBe(5);
    expect(wineData.wine.notes).toBe('Testing all fields');
    expect(wineData.wine.location).toBe('Bordeaux, France');
    expect(wineData.wine.photo).toBeDefined();
    expect(wineData.wine.dateAdded).toBeDefined();
    expect(wineData.wine.dateModified).toBeDefined();
  });

  test('should return proper error for missing required fields', async ({ page, request }) => {
    // Initialize database and sign up
    await page.goto('/api/init-db');
    await page.goto('/');
    await page.click('text=Sign up');
    
    const timestamp = Date.now();
    await page.fill('input[type="email"]', `missing-fields-${timestamp}@example.com`);
    await page.fill('input[placeholder="Enter your name"]', 'Missing Fields Test');
    await page.fill('input[placeholder="Enter your password"]', 'password123');
    await page.fill('input[placeholder="Confirm your password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/(?!login|signup)/);
    
    const userDataString = await page.evaluate(() => localStorage.getItem('wine_journal_user'));
    const userData = JSON.parse(userDataString || '{}');
    const userId = userData.id;
    
    // Try to add a wine WITHOUT required name field
    const wineResponse = await request.post('/api/wines', {
      data: {
        action: 'add-wine',
        userId: userId,
        wineData: {
          // name is missing!
          rating: 4,
          notes: 'Missing name field'
        }
      }
    });
    
    const wineData = await wineResponse.json();
    
    // Should fail with clear error message
    expect(wineResponse.status()).toBe(400);
    expect(wineData.success).toBe(false);
    expect(wineData.error).toContain('name');
  });
});

