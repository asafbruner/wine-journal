import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WineService } from '../wineService';
import type { WineFormData, Wine } from '../../types/wine';

// Mock fetch globally
global.fetch = vi.fn();

describe('WineService', () => {
  const testUserId = 'test-user-123';
  const mockFetch = fetch as vi.MockedFunction<typeof fetch>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addWine', () => {
    it('should add a new wine and return it with generated id and timestamps', async () => {
      const wineData: WineFormData = {
        name: 'Château Margaux',
        vintage: 2015,
        rating: 5,
        notes: 'Exceptional vintage with complex flavors'
      };

      const mockWine: Wine = {
        id: 'wine-123',
        ...wineData,
        dateAdded: '2023-01-01T00:00:00.000Z',
        dateModified: '2023-01-01T00:00:00.000Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, wine: mockWine })
      } as Response);

      const result = await WineService.addWine(testUserId, wineData);

      expect(result.success).toBe(true);
      expect(result.wine).toMatchObject(wineData);
      expect(result.wine?.id).toBeDefined();
      expect(result.wine?.dateAdded).toBeDefined();
      expect(result.wine?.dateModified).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      const wineData: WineFormData = {
        name: 'Test Wine',
        rating: 3,
        notes: 'Test notes'
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await WineService.addWine(testUserId, wineData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to add wine');
    });

    it('should handle 500 server errors with error message', async () => {
      const wineData: WineFormData = {
        name: 'Test Wine',
        rating: 3,
        notes: 'Test notes'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ success: false, error: 'Database connection error' })
      } as Response);

      const result = await WineService.addWine(testUserId, wineData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection error');
    });

    it('should handle 400 validation errors', async () => {
      const wineData: WineFormData = {
        name: '',
        rating: 3,
        notes: 'Test notes'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ success: false, error: 'Wine name is required' })
      } as Response);

      const result = await WineService.addWine(testUserId, wineData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Wine name is required');
    });

    it('should handle server errors without error message', async () => {
      const wineData: WineFormData = {
        name: 'Test Wine',
        rating: 3,
        notes: 'Test notes'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({})
      } as Response);

      const result = await WineService.addWine(testUserId, wineData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Server error: 500');
    });
  });

  describe('getAllWines', () => {
    it('should return empty array when no wines exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const wines = await WineService.getAllWines(testUserId);
      expect(wines).toEqual([]);
    });

    it('should return all wines from API', async () => {
      const mockWines: Wine[] = [
        {
          id: 'wine-1',
          name: 'Wine 1',
          rating: 4,
          notes: 'Notes 1',
          dateAdded: '2023-01-01T00:00:00.000Z',
          dateModified: '2023-01-01T00:00:00.000Z'
        },
        {
          id: 'wine-2',
          name: 'Wine 2',
          rating: 3,
          notes: 'Notes 2',
          dateAdded: '2023-01-02T00:00:00.000Z',
          dateModified: '2023-01-02T00:00:00.000Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWines
      } as Response);

      const wines = await WineService.getAllWines(testUserId);

      expect(wines).toHaveLength(2);
      expect(wines).toEqual(mockWines);
    });

    it('should handle API errors and return empty array', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const wines = await WineService.getAllWines(testUserId);
      expect(wines).toEqual([]);
    });
  });

  describe('updateWine', () => {
    it('should update existing wine successfully', async () => {
      const updateData: WineFormData = {
        name: 'Updated Wine',
        rating: 5,
        notes: 'Updated notes'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response);

      const result = await WineService.updateWine(testUserId, 'wine-123', updateData);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/wines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-wine',
          userId: testUserId,
          wineId: 'wine-123',
          wineData: updateData,
        }),
      });
    });

    it('should handle update errors', async () => {
      const updateData: WineFormData = {
        name: 'Test',
        rating: 3,
        notes: 'Test'
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await WineService.updateWine(testUserId, 'wine-123', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update wine');
    });

    it('should handle 404 errors when wine not found', async () => {
      const updateData: WineFormData = {
        name: 'Test',
        rating: 3,
        notes: 'Test'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ success: false, error: 'Wine not found or unauthorized' })
      } as Response);

      const result = await WineService.updateWine(testUserId, 'non-existent', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Wine not found or unauthorized');
    });
  });

  describe('deleteWine', () => {
    it('should delete existing wine successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response);

      const result = await WineService.deleteWine(testUserId, 'wine-123');

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/wines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete-wine',
          userId: testUserId,
          wineId: 'wine-123',
        }),
      });
    });

    it('should handle delete errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await WineService.deleteWine(testUserId, 'wine-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete wine');
    });

    it('should handle 500 errors when deleting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ success: false, error: 'Database error' })
      } as Response);

      const result = await WineService.deleteWine(testUserId, 'wine-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getWine', () => {
    it('should return wine by id', async () => {
      const mockWine: Wine = {
        id: 'wine-123',
        name: 'Specific Wine',
        rating: 4,
        notes: 'Specific notes',
        dateAdded: '2023-01-01T00:00:00.000Z',
        dateModified: '2023-01-01T00:00:00.000Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockWine]
      } as Response);

      const result = await WineService.getWine(testUserId, 'wine-123');

      expect(result).toEqual(mockWine);
    });

    it('should return null for non-existent wine', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      } as Response);

      const result = await WineService.getWine(testUserId, 'non-existent-id');
      expect(result).toBeNull();
    });

    it('should handle errors and return null', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await WineService.getWine(testUserId, 'wine-123');
      expect(result).toBeNull();
    });
  });

  describe('clearAllWines', () => {
    it('should clear all wines by deleting them individually', async () => {
      const mockWines: Wine[] = [
        {
          id: 'wine-1',
          name: 'Wine 1',
          rating: 3,
          notes: 'Notes 1',
          dateAdded: '2023-01-01T00:00:00.000Z',
          dateModified: '2023-01-01T00:00:00.000Z'
        },
        {
          id: 'wine-2',
          name: 'Wine 2',
          rating: 4,
          notes: 'Notes 2',
          dateAdded: '2023-01-02T00:00:00.000Z',
          dateModified: '2023-01-02T00:00:00.000Z'
        }
      ];

      // Mock getAllWines call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWines
      } as Response);

      // Mock delete calls
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      } as Response);

      await WineService.clearAllWines(testUserId);

      // Should call getAllWines once and delete twice
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should handle errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect(WineService.clearAllWines(testUserId)).resolves.toBeUndefined();
    });
  });
});
