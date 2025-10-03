import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Wine, WineFormData, WineWithUser } from './types';

// Initialize sql connection lazily
let sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sql && process.env.DATABASE_URL) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { action, userId, wineId, wineData } = req.body;

    // Check if DATABASE_URL is configured before proceeding
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not configured');
      return res.status(500).json({ 
        success: false,
        error: 'Database is not configured. Please contact support.',
        details: 'DATABASE_URL environment variable is missing'
      });
    }

    const requiresUserId = ['get-wines', 'add-wine', 'update-wine', 'delete-wine'].includes(action);
    if (requiresUserId && !userId) {
      return res.status(400).json({ 
        success: false,
        error: 'User ID is required' 
      });
    }

    try {
      switch (action) {
        case 'get-wines':
          return await handleGetWines(req, res, userId);
        case 'add-wine':
          return await handleAddWine(req, res, userId, wineData as WineFormData);
        case 'update-wine':
          return await handleUpdateWine(req, res, wineId, userId, wineData as WineFormData);
        case 'delete-wine':
          return await handleDeleteWine(req, res, wineId, userId);
        case 'get-all-wines':
          return await handleGetAllWines(req, res);
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error('Wines API error:', error);
      
      // Provide more detailed error messages
      let errorMessage = 'Internal server error';
      let errorDetails = '';
      
      if (error instanceof Error) {
        errorDetails = error.message;
        
        // Check for common database errors
        if (error.message.includes('foreign key constraint') || error.message.includes('violates foreign key')) {
          errorMessage = 'Invalid user ID - user does not exist';
        } else if (error.message.includes('not-null constraint') || error.message.includes('null value')) {
          errorMessage = 'Missing required fields';
        } else if (error.message.includes('connection') || error.message.includes('DATABASE_URL')) {
          errorMessage = 'Database connection error';
        }
      }
      
      return res.status(500).json({ 
        success: false,
        error: errorMessage,
        details: errorDetails // Always return for debugging
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetWines(req: VercelRequest, res: VercelResponse, userId: string) {
  const sql = getSql();
  if (!sql) {
    return res.status(500).json({ success: false, error: 'Database connection not available' });
  }
  
  const wines = await sql`
    SELECT * FROM wines 
    WHERE user_id = ${userId} 
    ORDER BY date_created DESC
  `;
  
  const wineList: Wine[] = (wines as any[]).map((wine: any) => ({
    id: wine.id,
    name: wine.name,
    vintage: wine.vintage,
    rating: wine.rating,
    notes: wine.notes,
    photo: wine.photo,
    analysis: wine.analysis ? (typeof wine.analysis === 'string' ? JSON.parse(wine.analysis) : wine.analysis) : undefined,
    location: wine.location,
    dateAdded: wine.date_created,
    dateModified: wine.date_created, // Use same date for now
  }));

  return res.status(200).json(wineList);
}

async function handleGetAllWines(req: VercelRequest, res: VercelResponse) {
  const sql = getSql();
  if (!sql) {
    return res.status(500).json({ success: false, error: 'Database connection not available' });
  }
  
  const wines = await sql`
    SELECT w.*, u.email as user_email, u.name as user_name
    FROM wines w
    LEFT JOIN users u ON u.id = w.user_id
    ORDER BY w.date_created DESC
  `;

  const wineList: WineWithUser[] = (wines as any[]).map((wine: any) => ({
    id: wine.id,
    name: wine.name,
    vintage: wine.vintage,
    rating: wine.rating,
    notes: wine.notes,
    photo: wine.photo,
    analysis: wine.analysis ? (typeof wine.analysis === 'string' ? JSON.parse(wine.analysis) : wine.analysis) : undefined,
    location: wine.location,
    dateAdded: wine.date_created,
    dateModified: wine.date_created, // Use same date for now
    userId: wine.user_id,
    userEmail: wine.user_email,
    userName: wine.user_name,
  }));

  return res.status(200).json(wineList);
}

async function handleAddWine(req: VercelRequest, res: VercelResponse, userId: string, wineData: WineFormData) {
  // Validate required fields
  if (!wineData) {
    return res.status(400).json({ 
      success: false, 
      error: 'Wine data is required' 
    });
  }
  
  if (!wineData.name || wineData.name.trim() === '') {
    return res.status(400).json({ 
      success: false, 
      error: 'Wine name is required' 
    });
  }
  
  if (typeof wineData.rating !== 'number' || wineData.rating < 1 || wineData.rating > 5) {
    return res.status(400).json({ 
      success: false, 
      error: 'Rating must be a number between 1 and 5' 
    });
  }
  
  if (!wineData.notes) {
    wineData.notes = '';
  }
  
  const sql = getSql();
  if (!sql) {
    return res.status(500).json({ success: false, error: 'Database connection not available' });
  }
  
  const wineId = generateId();
  
  // Serialize analysis as JSON string for JSONB storage
  const analysisJson = wineData.analysis ? JSON.stringify(wineData.analysis) : null;
  
  await sql`
    INSERT INTO wines (id, user_id, name, vintage, rating, notes, photo, analysis, location)
    VALUES (${wineId}, ${userId}, ${wineData.name}, ${wineData.vintage || null}, ${wineData.rating}, ${wineData.notes}, ${wineData.photo || null}, ${analysisJson}, ${wineData.location || null})
  `;

  const wine: Wine = {
    id: wineId,
    name: wineData.name,
    vintage: wineData.vintage,
    rating: wineData.rating,
    notes: wineData.notes,
    photo: wineData.photo,
    analysis: wineData.analysis,
    location: wineData.location,
    dateAdded: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };

  return res.status(200).json({ success: true, wine });
}

async function handleUpdateWine(req: VercelRequest, res: VercelResponse, wineId: string, userId: string, wineData: WineFormData) {
  const sql = getSql();
  if (!sql) {
    return res.status(500).json({ success: false, error: 'Database connection not available' });
  }
  
  // First check if wine exists and belongs to user
  const existingWine = await sql`
    SELECT id FROM wines WHERE id = ${wineId} AND user_id = ${userId}
  ` as any[];

  if (existingWine.length === 0) {
    return res.status(404).json({ success: false, error: 'Wine not found or unauthorized' });
  }

  // Serialize analysis as JSON string for JSONB storage
  const analysisJson = wineData.analysis ? JSON.stringify(wineData.analysis) : null;
  
  await sql`
    UPDATE wines 
    SET name = ${wineData.name}, vintage = ${wineData.vintage}, rating = ${wineData.rating}, 
        notes = ${wineData.notes}, photo = ${wineData.photo}, analysis = ${analysisJson}, location = ${wineData.location}
    WHERE id = ${wineId} AND user_id = ${userId}
  `;

  return res.status(200).json({ success: true });
}

async function handleDeleteWine(req: VercelRequest, res: VercelResponse, wineId: string, userId: string) {
  const sql = getSql();
  if (!sql) {
    return res.status(500).json({ success: false, error: 'Database connection not available' });
  }
  
  // First check if wine exists and belongs to user
  const existingWine = await sql`
    SELECT id FROM wines WHERE id = ${wineId} AND user_id = ${userId}
  ` as any[];

  if (existingWine.length === 0) {
    return res.status(404).json({ success: false, error: 'Wine not found or unauthorized' });
  }

  await sql`
    DELETE FROM wines 
    WHERE id = ${wineId} AND user_id = ${userId}
  `;

  return res.status(200).json({ success: true });
}
