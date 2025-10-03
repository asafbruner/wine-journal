// Shared types for API functions
export interface TasteProfile {
  fruit?: number;
  citrus?: number;
  floral?: number;
  herbal?: number;
  earthy?: number;
  mineral?: number;
  spice?: number;
  oak?: number;
  sweetness?: number;
  acidity?: number;
  tannin?: number;
  alcohol?: number;
  body?: number;
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
  confidence?: number;
  analysisDate?: string;
}

export interface Wine {
  id: string;
  name: string;
  vintage?: number;
  rating: number;
  notes: string;
  photo?: string;
  analysis?: WineAnalysis;
  location?: string;
  dateAdded: string;
  dateModified: string;
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
  photo?: string;
  analysis?: WineAnalysis;
  location?: string;
}

