import type { User, UserCredentials, SignUpData, StoredUser } from '../types/auth';

const USERS_STORAGE_KEY = 'wine-journal-users';
const CURRENT_USER_KEY = 'wine-journal-current-user';

export class AuthService {
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Simple hash function for password (in production, use proper bcrypt or similar)
  private static hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private static getAllUsers(): StoredUser[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading users from localStorage:', error);
      return [];
    }
  }

  private static saveUsers(users: StoredUser[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
      throw new Error('Failed to save user data');
    }
  }

  static async signUp(userData: SignUpData): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const users = this.getAllUsers();
      
      // Check if user already exists
      const existingUser = users.find(user => user.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Validate password strength
      if (userData.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      const now = new Date().toISOString();
      const newStoredUser: StoredUser = {
        id: this.generateId(),
        email: userData.email.toLowerCase(),
        name: userData.name,
        passwordHash: this.hashPassword(userData.password),
        dateCreated: now,
      };

      users.push(newStoredUser);
      this.saveUsers(users);

      const user: User = {
        id: newStoredUser.id,
        email: newStoredUser.email,
        name: newStoredUser.name,
        dateCreated: newStoredUser.dateCreated,
      };

      return { success: true, user };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { success: false, error: 'Failed to create account' };
    }
  }

  static async login(credentials: UserCredentials): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const users = this.getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      const passwordHash = this.hashPassword(credentials.password);
      if (user.passwordHash !== passwordHash) {
        return { success: false, error: 'Invalid email or password' };
      }

      const authenticatedUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        dateCreated: user.dateCreated,
      };

      return { success: true, user: authenticatedUser };
    } catch (error) {
      console.error('Error during login:', error);
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
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}
