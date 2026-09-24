import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryRow, queryRows, runQuery } from '../database/db';
import { AuthRequest, canAccessUserData } from '../middleware/auth';

export async function updateLocation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.body.userId || req.user!.id;
    const { latitude, longitude, accuracy = 5.0, source = 'GPS_GNSS' } = req.body;

    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: 'latitude and longitude are required' });
      return;
    }

    const id = uuidv4();
    const timestamp = new Date().toISOString();

    await runQuery(
      `INSERT INTO location_records (id, user_id, latitude, longitude, accuracy, source, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, latitude, longitude, accuracy, source, timestamp]
    );

    res.status(201).json({ message: 'Location updated', id, timestamp });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update location', details: err.message });
  }
}

export async function getLocation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = (req.params.userId as string) || req.user!.id;

    const authorized = await canAccessUserData(req.user!.id, userId);
    if (!authorized) {
      res.status(403).json({ error: 'Location sharing is disabled or permission not granted' });
      return;
    }

    const location = await queryRow(
      'SELECT * FROM location_records WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
      [userId]
    );

    res.json(location);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch location', details: err.message });
  }
}
