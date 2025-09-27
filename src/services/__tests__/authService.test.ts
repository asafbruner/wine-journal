import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from '../authService';
import type { SignUpData, UserCredentials } from '../../types/auth';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    AuthService.clearAllUsers();
  });

  describe('signUp', () => {
    it('should successfully create a new user', async () => {
      const userData: SignUpData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(result.user?.name).toBe('Test User');
      expect(result.user?.id).toBeDefined();
      expect(result.user?.dateCreated).toBeDefined();
    });

    it('should reject duplicate email addresses', async () => {
      const userData: SignUpData = {
        email: 'test@example.com',
        password: 'password123',
      };

      // First create a user
      await AuthService.signUp(userData);

      // Try to create another user with same email
      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User with this email already exists');
    });

    it('should reject invalid email format', async () => {
      const userData: SignUpData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject weak passwords', async () => {
      const userData: SignUpData = {
        email: 'test@example.com',
        password: '123',
      };

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters long');
    });

    it('should handle case-insensitive email comparison', async () => {
      const userData1: SignUpData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const userData2: SignUpData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      // Create first user
      await AuthService.signUp(userData1);

      // Try to create second user with same email in different case
      const result = await AuthService.signUp(userData2);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User with this email already exists');
    });

    it('should handle localStorage errors gracefully', async () => {
      const userData: SignUpData = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to save user data');

      // Restore original method
      localStorage.setItem = originalSetItem;
    });
  });

  describe('login', () => {
    const testUser: SignUpData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    beforeEach(async () => {
      // Create a test user before each login test
      await AuthService.signUp(testUser);
    });

    it('should successfully login with correct credentials', async () => {
      const credentials: UserCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await AuthService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(result.user?.name).toBe('Test User');
      expect(result.user?.id).toBeDefined();
    });

    it('should reject login with incorrect email', async () => {
      const credentials: UserCredentials = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      const result = await AuthService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should reject login with incorrect password', async () => {
      const credentials: UserCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const result = await AuthService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should handle case-insensitive email login', async () => {
      const credentials: UserCredentials = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      const result = await AuthService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('test@example.com');
    });

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage.getItem to throw an error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      const credentials: UserCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await AuthService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Login failed');

      // Restore original method
      localStorage.getItem = originalGetItem;
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when stored', async () => {
      const userData: SignUpData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      // Create and set current user
      const signUpResult = await AuthService.signUp(userData);
      if (signUpResult.user) {
        AuthService.setCurrentUser(signUpResult.user);
      }

      const result = AuthService.getCurrentUser();

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
      expect(result?.name).toBe('Test User');
    });

    it('should return null when no user is stored', () => {
      const result = AuthService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should handle corrupted localStorage data', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem('wine-journal-current-user', 'invalid-json');

      const result = AuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('setCurrentUser', () => {
    it('should store user in localStorage', async () => {
      const userData: SignUpData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const signUpResult = await AuthService.signUp(userData);
      if (signUpResult.user) {
        AuthService.setCurrentUser(signUpResult.user);

        const storedUser = AuthService.getCurrentUser();
        expect(storedUser).toEqual(signUpResult.user);
      }
    });

    it('should remove user from localStorage when null', () => {
      // First set a user
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        dateCreated: '2023-01-01T00:00:00.000Z',
      };
      AuthService.setCurrentUser(mockUser);

      // Then set to null
      AuthService.setCurrentUser(null);

      const result = AuthService.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        dateCreated: '2023-01-01T00:00:00.000Z',
      };

      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => AuthService.setCurrentUser(mockUser)).not.toThrow();

      // Restore original method
      localStorage.setItem = originalSetItem;
    });
  });

  describe('logout', () => {
    it('should clear current user', async () => {
      const userData: SignUpData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      // Create and set current user
      const signUpResult = await AuthService.signUp(userData);
      if (signUpResult.user) {
        AuthService.setCurrentUser(signUpResult.user);
      }

      // Verify user is set
      expect(AuthService.getCurrentUser()).toBeDefined();

      // Logout
      AuthService.logout();

      // Verify user is cleared
      expect(AuthService.getCurrentUser()).toBeNull();
    });
  });

  describe('clearAllUsers', () => {
    it('should clear all user data', async () => {
      const userData: SignUpData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      // Create user and set as current
      const signUpResult = await AuthService.signUp(userData);
      if (signUpResult.user) {
        AuthService.setCurrentUser(signUpResult.user);
      }

      // Verify data exists
      expect(AuthService.getCurrentUser()).toBeDefined();

      // Clear all data
      AuthService.clearAllUsers();

      // Verify all data is cleared
      expect(AuthService.getCurrentUser()).toBeNull();
      
      // Try to login with the same credentials - should fail
      const loginResult = await AuthService.login({
        email: userData.email,
        password: userData.password,
      });
      expect(loginResult.success).toBe(false);
    });
  });
});
