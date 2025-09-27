import type { User, UserCredentials, SignUpData, StoredUser } from '../types/auth';

const CURRENT_USER_KEY = 'wine-journal-current-user';

export class AuthService {
  static async signUp(userData: SignUpData): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signup',
          ...userData,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  }

  static async login(credentials: UserCredentials): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          ...credentials,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading current user:', error);
      return null;
    }
  }

  static setCurrentUser(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (error) {
      console.error('Error saving current user:', error);
    }
  }

  static logout(): void {
    this.setCurrentUser(null);
  }

  static clearAllUsers(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  // Admin functionality
  static async adminLogin(credentials: UserCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'admin-login',
          ...credentials,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: 'Admin login failed' };
    }
  }

  static async getAllUsersForAdmin(): Promise<StoredUser[]> {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-all-users',
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  }
}
