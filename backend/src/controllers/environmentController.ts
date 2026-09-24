import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryRow, queryRows, runQuery } from '../database/db';

export async function getCurrentEnvironment(req: Request, res: Response): Promise<void> {
  try {
    const reading = await queryRow(
      'SELECT * FROM environmental_readings ORDER BY timestamp DESC LIMIT 1'
    );
    res.json(reading);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch environmental data', details: err.message });
  }
}

export async function getEnvironmentHistory(req: Request, res: Response): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 30;
    const history = await queryRows(
      'SELECT * FROM environmental_readings ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
    res.json(history.reverse());
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch environmental history', details: err.message });
  }
}

export async function postEnvironmentalReading(req: Request, res: Response): Promise<void> {
  try {
    const { ambient_temperature, humidity, heat_index, aqi, pm25, uv_index = 5, weather_condition = 'Clear', latitude = 28.6139, longitude = 77.2090 } = req.body;
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    await runQuery(
      `INSERT INTO environmental_readings (id, latitude, longitude, ambient_temperature, humidity, heat_index, aqi, pm25, uv_index, weather_condition, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, latitude, longitude, ambient_temperature, humidity, heat_index, aqi, pm25, uv_index, weather_condition, timestamp]
    );

    res.status(201).json({ message: 'Environmental reading stored', id, timestamp });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to store reading', details: err.message });
  }
}
