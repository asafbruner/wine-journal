import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, UserCredentials, SignUpData, AuthContextType } from '../types/auth';
import { AuthService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load current user on mount
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials: UserCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await AuthService.login(credentials);
      
      if (result.success && result.user) {
        const u = result.user;
        const safeUser: User = {
          id: u.id || Date.now().toString(36),
          email: u.email || credentials.email,
          name: u.name,
          dateCreated: u.dateCreated || new Date().toISOString(),
        };
        setUser(safeUser);
        AuthService.setCurrentUser(safeUser);
        return true;
      } else {
        setError(result.error || 'Login failed');
        return false;
      }
    } catch {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: SignUpData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await AuthService.signUp(userData);
      
      if (result.success && result.user) {
        const u = result.user;
        const safeUser: User = {
          id: u.id || Date.now().toString(36),
          email: u.email || userData.email,
          name: u.name ?? userData.name,
          dateCreated: u.dateCreated || new Date().toISOString(),
        };
        setUser(safeUser);
        AuthService.setCurrentUser(safeUser);
        return true;
      } else {
        setError(result.error || 'Sign up failed');
        return false;
      }
    } catch {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    AuthService.logout();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    signUp,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
