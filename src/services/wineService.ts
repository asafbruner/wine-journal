import type { Wine, WineFormData } from '../types/wine';

const STORAGE_KEY = 'wine-journal-data';

export class WineService {
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static getAllWines(): Wine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading wines from localStorage:', error);
      return [];
    }
  }

  static saveWines(wines: Wine[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wines));
    } catch (error) {
      console.error('Error saving wines to localStorage:', error);
      throw new Error('Failed to save wine data');
    }
  }

  static addWine(wineData: WineFormData): Wine {
    const wines = this.getAllWines();
    const now = new Date().toISOString();
    
    const newWine: Wine = {
      id: this.generateId(),
      ...wineData,
      dateAdded: now,
      dateModified: now,
    };

    wines.push(newWine);
    this.saveWines(wines);
    return newWine;
  }

  static updateWine(id: string, wineData: WineFormData): Wine | null {
    const wines = this.getAllWines();
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
    this.saveWines(wines);
    return updatedWine;
  }

  static deleteWine(id: string): boolean {
    const wines = this.getAllWines();
    const filteredWines = wines.filter(wine => wine.id !== id);
    
    if (filteredWines.length === wines.length) {
      return false; // Wine not found
    }

    this.saveWines(filteredWines);
    return true;
  }

  static getWine(id: string): Wine | undefined {
    const wines = this.getAllWines();
    return wines.find(wine => wine.id === id);
  }

  static clearAllWines(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
