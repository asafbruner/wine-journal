import { test, expect } from '@playwright/test';

test.describe('Database Schema Validation', () => {
  test('should have location column in wines table', async ({ request }) => {
    // Initialize database
    const initResponse = await request.post('/api/init-db');
    expect(initResponse.ok()).toBeTruthy();
    
    // Try to add a wine with location data
    const testUserId = 'test-schema-user-' + Date.now();
    
    // First create a user
    const signupResponse = await request.post('/api/auth', {
      data: {
        action: 'signup',
        credentials: {
          email: `schema-test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          name: 'Schema Test User'
        }
      }
    });
    
    const signupData = await signupResponse.json();
    expect(signupData.success).toBe(true);
    const userId = signupData.user.id;
    
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
    
    // Should succeed without database errors
    expect(wineResponse.ok()).toBeTruthy();
    expect(wineData.success).toBe(true);
    expect(wineData.wine).toBeDefined();
    expect(wineData.wine.location).toBe('Napa Valley, California');
  });

  test('should handle wines without location (nullable column)', async ({ request }) => {
    // Create a user
    const signupResponse = await request.post('/api/auth', {
      data: {
        action: 'signup',
        credentials: {
          email: `no-location-test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          name: 'No Location Test'
        }
      }
    });
    
    const signupData = await signupResponse.json();
    expect(signupData.success).toBe(true);
    const userId = signupData.user.id;
    
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

  test('should have all required columns in wines table', async ({ request }) => {
    // Create a user
    const signupResponse = await request.post('/api/auth', {
      data: {
        action: 'signup',
        credentials: {
          email: `all-fields-test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          name: 'All Fields Test'
        }
      }
    });
    
    const signupData = await signupResponse.json();
    expect(signupData.success).toBe(true);
    const userId = signupData.user.id;
    
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

  test('should return proper error for missing required fields', async ({ request }) => {
    // Create a user
    const signupResponse = await request.post('/api/auth', {
      data: {
        action: 'signup',
        credentials: {
          email: `missing-fields-test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          name: 'Missing Fields Test'
        }
      }
    });
    
    const signupData = await signupResponse.json();
    expect(signupData.success).toBe(true);
    const userId = signupData.user.id;
    
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

