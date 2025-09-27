import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from '../authService';
import type { SignUpData, UserCredentials, User } from '../../types/auth';

// Mock fetch globally
global.fetch = vi.fn();

describe('AuthService', () => {
  const mockFetch = fetch as vi.MockedFunction<typeof fetch>;

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

      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        dateCreated: '2023-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser })
      } as Response);

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(result.user?.name).toBe('Test User');
      expect(result.user?.id).toBeDefined();
      expect(result.user?.dateCreated).toBeDefined();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signup',
          ...userData,
        }),
      });
    });

    it('should reject duplicate email addresses', async () => {
      const userData: SignUpData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'User with this email already exists' })
      } as Response);

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User with this email already exists');
    });

    it('should reject invalid email format', async () => {
      const userData: SignUpData = {
        email: 'invalid-email',
        password: 'password123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Invalid email format' })
      } as Response);

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should reject weak passwords', async () => {
      const userData: SignUpData = {
        email: 'test@example.com',
        password: '123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Password must be at least 6 characters long' })
      } as Response);

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters long');
    });

    it('should handle case-insensitive email comparison', async () => {
      const userData: SignUpData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'User with this email already exists' })
      } as Response);

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User with this email already exists');
    });

    it('should handle network errors gracefully', async () => {
      const userData: SignUpData = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await AuthService.signUp(userData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create account');
    });
  });

  describe('login', () => {
    it('should successfully login with correct credentials', async () => {
      const credentials: UserCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        dateCreated: '2023-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser })
      } as Response);

      const result = await AuthService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
      expect(result.user?.name).toBe('Test User');
      expect(result.user?.id).toBeDefined();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          ...credentials,
        }),
      });
    });

    it('should reject login with incorrect email', async () => {
      const credentials: UserCredentials = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Invalid email or password' })
      } as Response);

      const result = await AuthService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should reject login with incorrect password', async () => {
      const credentials: UserCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Invalid email or password' })
      } as Response);

      const result = await AuthService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should handle case-insensitive email login', async () => {
      const credentials: UserCredentials = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      };

      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        dateCreated: '2023-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, user: mockUser })
      } as Response);

      const result = await AuthService.login(credentials);

      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('test@example.com');
    });

    it('should handle network errors gracefully', async () => {
      const credentials: UserCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await AuthService.login(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Login failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when stored', () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        dateCreated: '2023-01-01T00:00:00.000Z',
      };

      AuthService.setCurrentUser(mockUser);
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
    it('should store user in localStorage', () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        dateCreated: '2023-01-01T00:00:00.000Z',
      };

      AuthService.setCurrentUser(mockUser);
      const storedUser = AuthService.getCurrentUser();
      expect(storedUser).toEqual(mockUser);
    });

    it('should remove user from localStorage when null', () => {
      // First set a user
      const mockUser: User = {
        id: 'user-123',
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
      const mockUser: User = {
        id: 'user-123',
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
    it('should clear current user', () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        dateCreated: '2023-01-01T00:00:00.000Z',
      };

      // Set current user
      AuthService.setCurrentUser(mockUser);

      // Verify user is set
      expect(AuthService.getCurrentUser()).toBeDefined();

      // Logout
      AuthService.logout();

      // Verify user is cleared
      expect(AuthService.getCurrentUser()).toBeNull();
    });
  });

  describe('clearAllUsers', () => {
    it('should clear current user data', () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        dateCreated: '2023-01-01T00:00:00.000Z',
      };

      // Set current user
      AuthService.setCurrentUser(mockUser);

      // Verify data exists
      expect(AuthService.getCurrentUser()).toBeDefined();

      // Clear all data
      AuthService.clearAllUsers();

      // Verify all data is cleared
      expect(AuthService.getCurrentUser()).toBeNull();
    });
  });

  describe('adminLogin', () => {
    it('should successfully login with admin credentials', async () => {
      const credentials: UserCredentials = {
        email: 'admin',
        password: 'admin',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response);

      const result = await AuthService.adminLogin(credentials);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'admin-login',
          ...credentials,
        }),
      });
    });

    it('should reject invalid admin credentials', async () => {
      const credentials: UserCredentials = {
        email: 'wrong',
        password: 'wrong',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Invalid admin credentials' })
      } as Response);

      const result = await AuthService.adminLogin(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid admin credentials');
    });

    it('should handle network errors gracefully', async () => {
      const credentials: UserCredentials = {
        email: 'admin',
        password: 'admin',
      };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await AuthService.adminLogin(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Admin login failed');
    });
  });

  describe('getAllUsersForAdmin', () => {
    it('should return all users for admin', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User 1',
          passwordHash: 'hash1',
          dateCreated: '2023-01-01T00:00:00.000Z',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User 2',
          passwordHash: 'hash2',
          dateCreated: '2023-01-02T00:00:00.000Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      } as Response);

      const result = await AuthService.getAllUsersForAdmin();

      expect(result).toEqual(mockUsers);
      expect(mockFetch).toHaveBeenCalledWith('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-all-users',
        }),
      });
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await AuthService.getAllUsersForAdmin();

      expect(result).toEqual([]);
    });
  });
});
