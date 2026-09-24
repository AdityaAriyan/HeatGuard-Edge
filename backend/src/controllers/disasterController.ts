import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryRow, queryRows, runQuery } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { broadcastDisasterAlert } from '../websocket/server';

export async function getActiveDisasters(req: Request, res: Response): Promise<void> {
  try {
    const disasters = await queryRows(
      'SELECT * FROM disaster_events WHERE is_active = 1 ORDER BY started_at DESC'
    );
    res.json(
      disasters.map((d: any) => ({
        ...d,
        guidelines: JSON.parse(d.guidelines || '[]'),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch disaster events', details: err.message });
  }
}

export async function simulateDisasterEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      event_type,
      title,
      severity = 'SEVERE',
      affected_region = 'Delhi NCR & Northern States',
      description,
      guidelines,
    } = req.body;

    if (!event_type || !title) {
      res.status(400).json({ error: 'event_type and title are required' });
      return;
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const defaultGuidelines: Record<string, string[]> = {
      HEAT_WAVE: [
        'Enforce mandatory 15-minute shaded rest breaks every 45 minutes.',
        'Drink at least 500ml water/electrolytes every hour of outdoor activity.',
        'Move to active cooling areas if heart rate or skin temp rises sharply.',
      ],
      FLOOD: [
        'Move to higher ground immediately; avoid walking or driving through moving water.',
        'Keep battery life preserved on wearable edge device.',
        'Check emergency contacts and enable emergency location sharing.',
      ],
      CYCLONE: [
        'Seek sturdy masonry shelter away from windows and coastal fringes.',
        'Secure emergency rations, clean water, and communication beacons.',
        'Monitor Edge-AI vital alerts for high acute stress.',
      ],
      AIR_POLLUTION: [
        'Wear N95/FFP2 respirators when outdoors.',
        'Minimize intense outdoor cardiovascular exercise.',
        'Monitor SpO2 drops below 95%.',
      ],
      EXTREME_WEATHER: [
        'Stay indoors and stay tuned to official civil defense bulletins.',
        'Maintain power bank backup for medical and wearable devices.',
      ],
    };

    const effectiveGuidelines = guidelines || defaultGuidelines[event_type] || ['Follow civil defense instructions.'];

    await runQuery(
      `INSERT INTO disaster_events (id, event_type, title, severity, affected_region, description, guidelines, is_active, started_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        id,
        event_type,
        title,
        severity,
        affected_region,
        description || `Active ${event_type} emergency declared.`,
        JSON.stringify(effectiveGuidelines),
        now,
      ]
    );

    const disasterPayload = {
      id,
      event_type,
      title,
      severity,
      affected_region,
      description: description || `Active ${event_type} emergency declared.`,
      guidelines: effectiveGuidelines,
      started_at: now,
    };

    broadcastDisasterAlert(disasterPayload);

    res.status(201).json({
      message: 'Disaster event simulated and broadcasted to all units',
      disaster: disasterPayload,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to simulate disaster event', details: err.message });
  }
}
