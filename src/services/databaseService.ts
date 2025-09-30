import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import type { User, UserCredentials, SignUpData, StoredUser } from '../types/auth';
import type { Wine, WineFormData } from '../types/wine';

const sql = neon(process.env.DATABASE_URL!);

export class DatabaseService {
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // User operations
  static async signUp(userData: SignUpData): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // Check if user already exists
      const existingUsers = await sql`
        SELECT id FROM users WHERE email = ${userData.email.toLowerCase()}
      `;
      
      if (existingUsers.length > 0) {
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

      const userId = this.generateId();
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Insert new user
      await sql`
        INSERT INTO users (id, email, name, password_hash)
        VALUES (${userId}, ${userData.email.toLowerCase()}, ${userData.name}, ${passwordHash})
      `;

      const user: User = {
        id: userId,
        email: userData.email.toLowerCase(),
        name: userData.name,
        dateCreated: new Date().toISOString(),
      };

      return { success: true, user };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { success: false, error: 'Failed to create account' };
    }
  }

  static async login(credentials: UserCredentials): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const users = await sql`
        SELECT * FROM users WHERE email = ${credentials.email.toLowerCase()}
      `;
      
      if (users.length === 0) {
        return { success: false, error: 'Invalid email or password' };
      }

      const user = users[0] as { id: string; email: string; name?: string; password_hash: string; date_created: string };
      const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
      
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      const authenticatedUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        dateCreated: user.date_created,
      };

      return { success: true, user: authenticatedUser };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  static async getAllUsers(): Promise<StoredUser[]> {
    try {
      const users = await sql`
        SELECT id, email, name, password_hash, date_created 
        FROM users 
        ORDER BY date_created DESC
      `;
      
      return users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.password_hash,
        dateCreated: user.date_created,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Wine operations
  static async getWinesByUser(userId: string): Promise<Wine[]> {
    try {
      const wines = await sql`
        SELECT * FROM wines 
        WHERE user_id = ${userId} 
        ORDER BY date_created DESC
      `;
      
      return wines.map(wine => ({
        id: wine.id,
        name: wine.name,
        vintage: wine.vintage,
        rating: wine.rating,
        notes: wine.notes,
        photo: wine.photo,
        dateAdded: wine.date_created,
        dateModified: wine.date_created, // Use same date for now
      }));
    } catch (error) {
      console.error('Error fetching wines:', error);
      return [];
    }
  }

  static async addWine(userId: string, wineData: WineFormData): Promise<{ success: boolean; error?: string; wine?: Wine }> {
    try {
      const wineId = this.generateId();
      
      await sql`
        INSERT INTO wines (id, user_id, name, vintage, rating, notes, photo)
        VALUES (${wineId}, ${userId}, ${wineData.name}, ${wineData.vintage}, ${wineData.rating}, ${wineData.notes}, ${wineData.photo})
      `;

      const wine: Wine = {
        id: wineId,
        name: wineData.name,
        vintage: wineData.vintage,
        rating: wineData.rating,
        notes: wineData.notes,
        photo: wineData.photo,
        dateAdded: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      };

      return { success: true, wine };
    } catch (error) {
      console.error('Error adding wine:', error);
      return { success: false, error: 'Failed to add wine' };
    }
  }

  static async updateWine(wineId: string, userId: string, wineData: WineFormData): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if wine exists and belongs to user
      const existingWine = await sql`
        SELECT id FROM wines WHERE id = ${wineId} AND user_id = ${userId}
      `;

      if (existingWine.length === 0) {
        return { success: false, error: 'Wine not found or unauthorized' };
      }

      await sql`
        UPDATE wines 
        SET name = ${wineData.name}, vintage = ${wineData.vintage}, rating = ${wineData.rating}, 
            notes = ${wineData.notes}, photo = ${wineData.photo}
        WHERE id = ${wineId} AND user_id = ${userId}
      `;

      return { success: true };
    } catch (error) {
      console.error('Error updating wine:', error);
      return { success: false, error: 'Failed to update wine' };
    }
  }

  static async deleteWine(wineId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if wine exists and belongs to user
      const existingWine = await sql`
        SELECT id FROM wines WHERE id = ${wineId} AND user_id = ${userId}
      `;

      if (existingWine.length === 0) {
        return { success: false, error: 'Wine not found or unauthorized' };
      }

      await sql`
        DELETE FROM wines 
        WHERE id = ${wineId} AND user_id = ${userId}
      `;

      return { success: true };
    } catch (error) {
      console.error('Error deleting wine:', error);
      return { success: false, error: 'Failed to delete wine' };
    }
  }

  // Admin functionality
  static async adminLogin(credentials: UserCredentials): Promise<{ success: boolean; error?: string }> {
    // Simple admin check - in production, this should be more secure
    if (credentials.email === 'admin' && credentials.password === 'admin') {
      return { success: true };
    }
    return { success: false, error: 'Invalid admin credentials' };
  }
}
