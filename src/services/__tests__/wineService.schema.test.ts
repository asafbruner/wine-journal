import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WineService } from '../wineService';

describe('WineService - Schema Validation', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should include location field when adding wine', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        wine: {
          id: '123',
          name: 'Test Wine',
          vintage: 2020,
          rating: 4,
          notes: 'Great wine',
          location: 'Napa Valley',
          dateAdded: '2025-01-01',
          dateModified: '2025-01-01'
        }
      })
    });
    global.fetch = mockFetch;

    const wineData = {
      name: 'Test Wine',
      vintage: 2020,
      rating: 4,
      notes: 'Great wine',
      location: 'Napa Valley'
    };

    await WineService.addWine('user123', wineData);

    // Verify the API was called with location field
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/wines',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
    
    // Verify the body contains the location
    const callArgs = mockFetch.mock.calls[0];
    const bodyData = JSON.parse(callArgs[1].body);
    expect(bodyData.wineData.location).toBe('Napa Valley');
  });

  it('should handle wines without location field', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        wine: {
          id: '456',
          name: 'Test Wine No Location',
          vintage: 2021,
          rating: 5,
          notes: 'Excellent',
          dateAdded: '2025-01-01',
          dateModified: '2025-01-01'
        }
      })
    });
    global.fetch = mockFetch;

    const wineData = {
      name: 'Test Wine No Location',
      vintage: 2021,
      rating: 5,
      notes: 'Excellent'
      // location is intentionally omitted
    };

    const result = await WineService.addWine('user456', wineData);

    // Should succeed even without location
    expect(result.success).toBe(true);
    expect(result.wine).toBeDefined();
  });

  it('should include all schema fields in response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        wine: {
          id: '789',
          name: 'Complete Wine',
          vintage: 2019,
          rating: 5,
          notes: 'Perfect wine',
          location: 'Bordeaux, France',
          photo: 'base64-data',
          dateAdded: '2025-01-01T00:00:00Z',
          dateModified: '2025-01-01T00:00:00Z'
        }
      })
    });
    global.fetch = mockFetch;

    const wineData = {
      name: 'Complete Wine',
      vintage: 2019,
      rating: 5,
      notes: 'Perfect wine',
      location: 'Bordeaux, France',
      photo: 'base64-data'
    };

    const result = await WineService.addWine('user789', wineData);

    // Verify all fields are present
    expect(result.success).toBe(true);
    expect(result.wine).toMatchObject({
      id: expect.any(String),
      name: 'Complete Wine',
      vintage: 2019,
      rating: 5,
      notes: 'Perfect wine',
      location: 'Bordeaux, France',
      photo: expect.any(String),
      dateAdded: expect.any(String),
      dateModified: expect.any(String)
    });
  });

  it('should return clear error for database schema issues', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        error: 'Internal server error',
        details: 'column "location" of relation "wines" does not exist'
      })
    });
    global.fetch = mockFetch;

    const wineData = {
      name: 'Test Wine',
      rating: 4,
      notes: 'Test',
      location: 'Test Location'
    };

    const result = await WineService.addWine('user123', wineData);

    // Should return error with details
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    // The error should indicate a schema issue
    expect(result.error).toMatch(/server error|column|location/i);
  });
});

