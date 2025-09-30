import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { User, UserCredentials, SignUpData, StoredUser } from '../src/types/auth';

interface InMemoryUser {
  id: string;
  email: string;
  name?: string;
  password_hash: string;
  date_created: string;
}

// Use in-memory storage for testing when no DATABASE_URL is available
const inMemoryUsers: InMemoryUser[] = [];
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { action, ...data } = req.body;

    try {
      switch (action) {
        case 'signup':
          return await handleSignUp(req, res, data as SignUpData);
        case 'login':
          return await handleLogin(req, res, data as UserCredentials);
        case 'admin-login':
          return await handleAdminLogin(req, res, data as UserCredentials);
        case 'get-all-users':
          return await handleGetAllUsers(req, res);
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error('Auth API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleSignUp(req: VercelRequest, res: VercelResponse, userData: SignUpData) {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    return res.status(400).json({ success: false, error: 'Invalid email format' });
  }

  // Validate password strength
  if (userData.password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
  }

  const userId = generateId();
  const passwordHash = await bcrypt.hash(userData.password, 10);

  if (sql) {
    // Use database
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${userData.email.toLowerCase()}
    `;
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    await sql`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (${userId}, ${userData.email.toLowerCase()}, ${userData.name}, ${passwordHash})
    `;
  } else {
    // Use in-memory storage for testing
    const existingUser = inMemoryUsers.find(u => u.email === userData.email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    inMemoryUsers.push({
      id: userId,
      email: userData.email.toLowerCase(),
      name: userData.name,
      password_hash: passwordHash,
      date_created: new Date().toISOString(),
    });
  }

  const user: User = {
    id: userId,
    email: userData.email.toLowerCase(),
    name: userData.name,
    dateCreated: new Date().toISOString(),
  };

  return res.status(200).json({ success: true, user });
}

async function handleLogin(req: VercelRequest, res: VercelResponse, credentials: UserCredentials) {
  let users: InMemoryUser[] = [];
  
  if (sql) {
    // Use database
    users = await sql`
      SELECT * FROM users WHERE email = ${credentials.email.toLowerCase()}
    `;
  } else {
    // Use in-memory storage for testing
    const user = inMemoryUsers.find(u => u.email === credentials.email.toLowerCase());
    if (user) {
      users = [user];
    }
  }
  
  if (users.length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid email or password' });
  }

  const user = users[0];
  const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
  
  if (!isValidPassword) {
    return res.status(400).json({ success: false, error: 'Invalid email or password' });
  }

  const authenticatedUser: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    dateCreated: user.date_created,
  };

  return res.status(200).json({ success: true, user: authenticatedUser });
}

async function handleAdminLogin(req: VercelRequest, res: VercelResponse, credentials: UserCredentials) {
  if (credentials.email === 'admin' && credentials.password === 'admin') {
    return res.status(200).json({ success: true });
  }
  return res.status(400).json({ success: false, error: 'Invalid admin credentials' });
}

async function handleGetAllUsers(req: VercelRequest, res: VercelResponse) {
  let users: InMemoryUser[] = [];
  
  if (sql) {
    // Use database
    users = await sql`
      SELECT id, email, name, password_hash, date_created 
      FROM users 
      ORDER BY date_created DESC
    `;
  } else {
    // Use in-memory storage for testing
    users = [...inMemoryUsers].sort((a, b) => 
      new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
    );
  }
  
  const storedUsers: StoredUser[] = users.map((user: InMemoryUser) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    passwordHash: user.password_hash,
    dateCreated: user.date_created,
  }));

  return res.status(200).json(storedUsers);
}
