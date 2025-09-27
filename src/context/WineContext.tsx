import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Wine, WineFormData, WineContextType } from '../types/wine';
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

  // Load wines from API when user changes
  useEffect(() => {
    const loadWines = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await fetch('/api/wines', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'get-wines',
              userId: user.id,
            }),
          });

          if (response.ok) {
            const loadedWines = await response.json();
            setWines(loadedWines);
          } else {
            console.error('Error loading wines:', response.statusText);
            setWines([]);
          }
        } catch (error) {
          console.error('Error loading wines:', error);
          setWines([]);
        }
      } else {
        setWines([]);
      }
    };

    loadWines();
  }, [user, isAuthenticated]);

  const addWine = async (wineData: WineFormData) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/wines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add-wine',
          userId: user.id,
          wineData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.wine) {
          setWines(prevWines => [...prevWines, result.wine]);
        }
      } else {
        console.error('Error adding wine:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding wine:', error);
    }
  };

  const updateWine = async (id: string, wineData: WineFormData) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/wines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-wine',
          userId: user.id,
          wineId: id,
          wineData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update the wine in local state
          setWines(prevWines =>
            prevWines.map(wine => 
              wine.id === id 
                ? { ...wine, ...wineData, dateModified: new Date().toISOString() }
                : wine
            )
          );
        }
      } else {
        console.error('Error updating wine:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating wine:', error);
    }
  };

  const deleteWine = async (id: string) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/wines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete-wine',
          userId: user.id,
          wineId: id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setWines(prevWines => prevWines.filter(wine => wine.id !== id));
        }
      } else {
        console.error('Error deleting wine:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting wine:', error);
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
