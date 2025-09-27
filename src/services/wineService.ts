import type { Wine, WineFormData } from '../types/wine';

export class WineService {
  static async getAllWines(userId: string): Promise<Wine[]> {
    try {
      const response = await fetch('/api/wines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-wines',
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wines');
      }

      const wines = await response.json();
      return wines;
    } catch (error) {
      console.error('Error loading wines from database:', error);
      return [];
    }
  }

  static async addWine(userId: string, wineData: WineFormData): Promise<{ success: boolean; error?: string; wine?: Wine }> {
    try {
      const response = await fetch('/api/wines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add-wine',
          userId,
          wineData,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error adding wine:', error);
      return { success: false, error: 'Failed to add wine' };
    }
  }

  static async updateWine(userId: string, wineId: string, wineData: WineFormData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/wines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-wine',
          userId,
          wineId,
          wineData,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating wine:', error);
      return { success: false, error: 'Failed to update wine' };
    }
  }

  static async deleteWine(userId: string, wineId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/wines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete-wine',
          userId,
          wineId,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting wine:', error);
      return { success: false, error: 'Failed to delete wine' };
    }
  }

  static async getWine(userId: string, wineId: string): Promise<Wine | null> {
    try {
      const wines = await this.getAllWines(userId);
      return wines.find(wine => wine.id === wineId) || null;
    } catch (error) {
      console.error('Error getting wine:', error);
      return null;
    }
  }

  // Legacy method for backward compatibility - now clears database data
  static async clearAllWines(userId: string): Promise<void> {
    try {
      const wines = await this.getAllWines(userId);
      for (const wine of wines) {
        await this.deleteWine(userId, wine.id);
      }
    } catch (error) {
      console.error('Error clearing wines:', error);
    }
  }
}
