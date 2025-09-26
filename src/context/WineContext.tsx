import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Wine, WineFormData, WineContextType } from '../types/wine';
import { WineService } from '../services/wineService';

const WineContext = createContext<WineContextType | undefined>(undefined);

export const useWineContext = () => {
  const context = useContext(WineContext);
  if (context === undefined) {
    throw new Error('useWineContext must be used within a WineProvider');
  }
  return context;
};

interface WineProviderProps {
  children: React.ReactNode;
}

export const WineProvider: React.FC<WineProviderProps> = ({ children }) => {
  const [wines, setWines] = useState<Wine[]>([]);

  // Load wines from localStorage on mount
  useEffect(() => {
    const loadedWines = WineService.getAllWines();
    setWines(loadedWines);
  }, []);

  const addWine = (wineData: WineFormData) => {
    const newWine = WineService.addWine(wineData);
    setWines(prevWines => [...prevWines, newWine]);
  };

  const updateWine = (id: string, wineData: WineFormData) => {
    const updatedWine = WineService.updateWine(id, wineData);
    if (updatedWine) {
      setWines(prevWines =>
        prevWines.map(wine => wine.id === id ? updatedWine : wine)
      );
    }
  };

  const deleteWine = (id: string) => {
    const success = WineService.deleteWine(id);
    if (success) {
      setWines(prevWines => prevWines.filter(wine => wine.id !== id));
    }
  };

  const getWine = (id: string): Wine | undefined => {
    return wines.find(wine => wine.id === id);
  };

  const value: WineContextType = {
    wines,
    addWine,
    updateWine,
    deleteWine,
    getWine,
  };

  return (
    <WineContext.Provider value={value}>
      {children}
    </WineContext.Provider>
  );
};
