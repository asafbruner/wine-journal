import type { Wine, WineFormData } from '../types/wine';

const STORAGE_KEY_PREFIX = 'wine-journal-data';

export class WineService {
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static getStorageKey(userId: string): string {
    return `${STORAGE_KEY_PREFIX}-${userId}`;
  }

  static getAllWines(userId: string): Wine[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(userId));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading wines from localStorage:', error);
      return [];
    }
  }

  static saveWines(userId: string, wines: Wine[]): void {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(wines));
    } catch (error) {
      console.error('Error saving wines to localStorage:', error);
      throw new Error('Failed to save wine data');
    }
  }

  static addWine(userId: string, wineData: WineFormData): Wine {
    const wines = this.getAllWines(userId);
    const now = new Date().toISOString();
    
    const newWine: Wine = {
      id: this.generateId(),
      ...wineData,
      dateAdded: now,
      dateModified: now,
    };

    wines.push(newWine);
    this.saveWines(userId, wines);
    return newWine;
  }

  static updateWine(userId: string, id: string, wineData: WineFormData): Wine | null {
    const wines = this.getAllWines(userId);
    const wineIndex = wines.findIndex(wine => wine.id === id);
    
    if (wineIndex === -1) {
      return null;
    }

    const updatedWine: Wine = {
      ...wines[wineIndex],
      ...wineData,
      dateModified: new Date().toISOString(),
    };

    wines[wineIndex] = updatedWine;
    this.saveWines(userId, wines);
    return updatedWine;
  }

  static deleteWine(userId: string, id: string): boolean {
    const wines = this.getAllWines(userId);
    const filteredWines = wines.filter(wine => wine.id !== id);
    
    if (filteredWines.length === wines.length) {
      return false; // Wine not found
    }

    this.saveWines(userId, filteredWines);
    return true;
  }

  static getWine(userId: string, id: string): Wine | undefined {
    const wines = this.getAllWines(userId);
    return wines.find(wine => wine.id === id);
  }

  static clearAllWines(userId: string): void {
    localStorage.removeItem(this.getStorageKey(userId));
  }
}
