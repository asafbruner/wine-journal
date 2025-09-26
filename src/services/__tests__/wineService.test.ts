import { describe, it, expect, beforeEach } from 'vitest';
import { WineService } from '../wineService';
import type { WineFormData } from '../../types/wine';

describe('WineService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    WineService.clearAllWines();
  });

  describe('addWine', () => {
    it('should add a new wine and return it with generated id and timestamps', () => {
      const wineData: WineFormData = {
        name: 'Château Margaux',
        vintage: 2015,
        rating: 5,
        notes: 'Exceptional vintage with complex flavors'
      };

      const result = WineService.addWine(wineData);

      expect(result).toMatchObject(wineData);
      expect(result.id).toBeDefined();
      expect(result.dateAdded).toBeDefined();
      expect(result.dateModified).toBeDefined();
      expect(result.dateAdded).toBe(result.dateModified);
    });

    it('should persist wine to localStorage', () => {
      const wineData: WineFormData = {
        name: 'Test Wine',
        rating: 3,
        notes: 'Test notes'
      };

      WineService.addWine(wineData);
      const wines = WineService.getAllWines();

      expect(wines).toHaveLength(1);
      expect(wines[0].name).toBe('Test Wine');
    });
  });

  describe('getAllWines', () => {
    it('should return empty array when no wines exist', () => {
      const wines = WineService.getAllWines();
      expect(wines).toEqual([]);
    });

    it('should return all wines from localStorage', () => {
      const wine1 = WineService.addWine({ name: 'Wine 1', rating: 4, notes: 'Notes 1' });
      const wine2 = WineService.addWine({ name: 'Wine 2', rating: 3, notes: 'Notes 2' });

      const wines = WineService.getAllWines();

      expect(wines).toHaveLength(2);
      expect(wines).toContainEqual(wine1);
      expect(wines).toContainEqual(wine2);
    });
  });

  describe('updateWine', () => {
    it('should update existing wine and modify timestamp', async () => {
      const originalWine = WineService.addWine({
        name: 'Original Wine',
        rating: 3,
        notes: 'Original notes'
      });

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const updateData: WineFormData = {
        name: 'Updated Wine',
        rating: 5,
        notes: 'Updated notes'
      };

      const updatedWine = WineService.updateWine(originalWine.id, updateData);

      expect(updatedWine).not.toBeNull();
      expect(updatedWine!.name).toBe('Updated Wine');
      expect(updatedWine!.rating).toBe(5);
      expect(updatedWine!.notes).toBe('Updated notes');
      expect(updatedWine!.dateAdded).toBe(originalWine.dateAdded);
      expect(updatedWine!.dateModified).not.toBe(originalWine.dateModified);
    });

    it('should return null for non-existent wine', () => {
      const result = WineService.updateWine('non-existent-id', {
        name: 'Test',
        rating: 3,
        notes: 'Test'
      });

      expect(result).toBeNull();
    });
  });

  describe('deleteWine', () => {
    it('should delete existing wine and return true', () => {
      const wine = WineService.addWine({
        name: 'Wine to Delete',
        rating: 2,
        notes: 'Will be deleted'
      });

      const result = WineService.deleteWine(wine.id);
      const wines = WineService.getAllWines();

      expect(result).toBe(true);
      expect(wines).toHaveLength(0);
    });

    it('should return false for non-existent wine', () => {
      const result = WineService.deleteWine('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getWine', () => {
    it('should return wine by id', () => {
      const wine = WineService.addWine({
        name: 'Specific Wine',
        rating: 4,
        notes: 'Specific notes'
      });

      const result = WineService.getWine(wine.id);

      expect(result).toEqual(wine);
    });

    it('should return undefined for non-existent wine', () => {
      const result = WineService.getWine('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('clearAllWines', () => {
    it('should remove all wines from localStorage', () => {
      WineService.addWine({ name: 'Wine 1', rating: 3, notes: 'Notes 1' });
      WineService.addWine({ name: 'Wine 2', rating: 4, notes: 'Notes 2' });

      WineService.clearAllWines();
      const wines = WineService.getAllWines();

      expect(wines).toHaveLength(0);
    });
  });
});
