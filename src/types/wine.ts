export interface TasteProfile {
  // Primary flavors (0-5 scale)
  fruit?: number;
  citrus?: number;
  floral?: number;
  herbal?: number;
  earthy?: number;
  mineral?: number;
  spice?: number;
  oak?: number;
  
  // Wine characteristics (0-5 scale)
  sweetness?: number;
  acidity?: number;
  tannin?: number;
  alcohol?: number;
  body?: number; // Light, Medium, Full (1-5)
  
  // Primary flavor descriptors
  primaryFlavors?: string[];
  secondaryFlavors?: string[];
}

export interface WineAnalysis {
  wineName?: string;
  wineType?: string;
  region?: string;
  vintage?: number;
  grapeVarieties?: string[];
  tastingNotes?: string;
  tasteProfile?: TasteProfile;
  interestingFact?: string;
  confidence?: number; // 0-1 scale
  analysisDate?: string;
}

export interface Wine {
  id: string;
  name: string;
  vintage?: number;
  rating: number; // 1-5 stars
  notes: string;
  photo?: string; // Base64 encoded image or URL
  analysis?: WineAnalysis; // AI analysis from Claude
  dateAdded: string; // ISO date string
  dateModified: string; // ISO date string
}

export interface WineWithUser extends Wine {
  userId: string;
  userEmail?: string;
  userName?: string;
}

export interface WineFormData {
  name: string;
  vintage?: number;
  rating: number;
  notes: string;
  photo?: string; // Base64 encoded image or URL
  analysis?: WineAnalysis; // AI analysis from Claude
}

export interface WineContextType {
  wines: Wine[];
  addWine: (wineData: WineFormData) => void;
  updateWine: (id: string, wineData: WineFormData) => void;
  deleteWine: (id: string) => void;
  getWine: (id: string) => Wine | undefined;
}
