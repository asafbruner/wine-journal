import { test, expect } from '@playwright/test';

test.describe('Database Migration Tests', () => {
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

  test('location column migration should be idempotent', async ({ request }) => {
    // Initialize database multiple times
    const response1 = await request.post('/api/init-db');
    expect(response1.ok()).toBeTruthy();
    
    const response2 = await request.post('/api/init-db');
    expect(response2.ok()).toBeTruthy();
    
    // Verify we can still add wines with location after multiple inits
    const signupResponse = await request.post('/api/auth', {
      data: {
        action: 'signup',
        credentials: {
          email: `migration-test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          name: 'Migration Test'
        }
      }
    });
    
    const signupData = await signupResponse.json();
    const userId = signupData.user.id;
    
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

