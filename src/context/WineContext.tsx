import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Wine, WineFormData, WineContextType } from '../types/wine';
import { WineService } from '../services/wineService';
import { useAuthContext } from './AuthContext';

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
  const { user, isAuthenticated } = useAuthContext();
  const [wines, setWines] = useState<Wine[]>([]);

  // Load wines from localStorage when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const loadedWines = WineService.getAllWines(user.id);
      setWines(loadedWines);
    } else {
      setWines([]);
    }
  }, [user, isAuthenticated]);

  const addWine = (wineData: WineFormData) => {
    if (!user) return;
    
    const newWine = WineService.addWine(user.id, wineData);
    setWines(prevWines => [...prevWines, newWine]);
  };

  const updateWine = (id: string, wineData: WineFormData) => {
    if (!user) return;
    
    const updatedWine = WineService.updateWine(user.id, id, wineData);
    if (updatedWine) {
      setWines(prevWines =>
        prevWines.map(wine => wine.id === id ? updatedWine : wine)
      );
    }
  };

  const deleteWine = (id: string) => {
    if (!user) return;
    
    const success = WineService.deleteWine(user.id, id);
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
