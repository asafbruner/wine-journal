export interface Wine {
  id: string;
  name: string;
  vintage?: number;
  rating: number; // 1-5 stars
  notes: string;
  dateAdded: string; // ISO date string
  dateModified: string; // ISO date string
}

export interface WineFormData {
  name: string;
  vintage?: number;
  rating: number;
  notes: string;
}

export interface WineContextType {
  wines: Wine[];
  addWine: (wineData: WineFormData) => void;
  updateWine: (id: string, wineData: WineFormData) => void;
  deleteWine: (id: string) => void;
  getWine: (id: string) => Wine | undefined;
}
