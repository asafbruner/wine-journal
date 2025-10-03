import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Wine, WineFormData, WineWithUser } from '../src/types/wine';

const sql = neon(process.env.DATABASE_URL!);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { action, userId, wineId, wineData } = req.body;

    const requiresUserId = ['get-wines', 'add-wine', 'update-wine', 'delete-wine'].includes(action);
    if (requiresUserId && !userId) {
      return res.status(400).json({ error: 'User ID is required' });
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
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetWines(req: VercelRequest, res: VercelResponse, userId: string) {
  const wines = await sql`
    SELECT * FROM wines 
    WHERE user_id = ${userId} 
    ORDER BY date_created DESC
  `;
  
  const wineList: Wine[] = wines.map(wine => ({
    id: wine.id,
    name: wine.name,
    vintage: wine.vintage,
    rating: wine.rating,
    notes: wine.notes,
    photo: wine.photo,
    location: wine.location,
    dateAdded: wine.date_created,
    dateModified: wine.date_created, // Use same date for now
  }));

  return res.status(200).json(wineList);
}

async function handleGetAllWines(req: VercelRequest, res: VercelResponse) {
  const wines = await sql`
    SELECT w.*, u.email as user_email, u.name as user_name
    FROM wines w
    LEFT JOIN users u ON u.id = w.user_id
    ORDER BY w.date_created DESC
  `;

  const wineList: WineWithUser[] = wines.map(wine => ({
    id: wine.id,
    name: wine.name,
    vintage: wine.vintage,
    rating: wine.rating,
    notes: wine.notes,
    photo: wine.photo,
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
  const wineId = generateId();
  
  await sql`
    INSERT INTO wines (id, user_id, name, vintage, rating, notes, photo, location)
    VALUES (${wineId}, ${userId}, ${wineData.name}, ${wineData.vintage}, ${wineData.rating}, ${wineData.notes}, ${wineData.photo}, ${wineData.location})
  `;

  const wine: Wine = {
    id: wineId,
    name: wineData.name,
    vintage: wineData.vintage,
    rating: wineData.rating,
    notes: wineData.notes,
    photo: wineData.photo,
    location: wineData.location,
    dateAdded: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };

  return res.status(200).json({ success: true, wine });
}

async function handleUpdateWine(req: VercelRequest, res: VercelResponse, wineId: string, userId: string, wineData: WineFormData) {
  // First check if wine exists and belongs to user
  const existingWine = await sql`
    SELECT id FROM wines WHERE id = ${wineId} AND user_id = ${userId}
  `;

  if (existingWine.length === 0) {
    return res.status(404).json({ success: false, error: 'Wine not found or unauthorized' });
  }

  await sql`
    UPDATE wines 
    SET name = ${wineData.name}, vintage = ${wineData.vintage}, rating = ${wineData.rating}, 
        notes = ${wineData.notes}, photo = ${wineData.photo}, location = ${wineData.location}
    WHERE id = ${wineId} AND user_id = ${userId}
  `;

  return res.status(200).json({ success: true });
}

async function handleDeleteWine(req: VercelRequest, res: VercelResponse, wineId: string, userId: string) {
  // First check if wine exists and belongs to user
  const existingWine = await sql`
    SELECT id FROM wines WHERE id = ${wineId} AND user_id = ${userId}
  `;

  if (existingWine.length === 0) {
    return res.status(404).json({ success: false, error: 'Wine not found or unauthorized' });
  }

  await sql`
    DELETE FROM wines 
    WHERE id = ${wineId} AND user_id = ${userId}
  `;

  return res.status(200).json({ success: true });
}
