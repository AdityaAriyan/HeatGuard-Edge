import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryRow, queryRows, runQuery } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { broadcastAlert, broadcastEmergencyEvent } from '../websocket/server';

export async function triggerSos(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.body.userId || req.user!.id;
    const { latitude, longitude, reason = 'Emergency SOS Button Activated' } = req.body;

    const eventId = uuidv4();
    const alertId = uuidv4();
    const now = new Date().toISOString();

    // Fetch latest vitals
    const latestReading = await queryRow(
      'SELECT heart_rate, spo2, skin_temperature, ambient_temperature FROM sensor_readings WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
      [userId]
    );

    const vitalSnapshot = latestReading
      ? {
          heartRate: latestReading.heart_rate,
          spo2: latestReading.spo2,
          skinTemp: latestReading.skin_temperature,
          ambientTemp: latestReading.ambient_temperature,
        }
      : null;

    // 1. Insert Emergency Event
    await runQuery(
      `INSERT INTO emergency_events (id, user_id, event_type, status, latitude, longitude, vital_snapshot, caregiver_notified, created_at)
       VALUES (?, ?, 'SOS_TRIGGERED', 'BROADCASTED', ?, ?, ?, 1, ?)`,
      [eventId, userId, latitude || null, longitude || null, JSON.stringify(vitalSnapshot), now]
    );

    // 2. Insert Critical Alert
    await runQuery(
      `INSERT INTO alerts (id, user_id, alert_type, severity, title, message, sensor_context, created_at)
       VALUES (?, ?, 'SOS', 'CRITICAL', '🚨 IMMEDIATE SOS EMERGENCY BROADCAST', ?, ?, ?)`,
      [alertId, userId, reason, JSON.stringify(vitalSnapshot), now]
    );

    const user = await queryRow<{ full_name: string; phone: string }>('SELECT full_name, phone FROM users WHERE id = ?', [userId]);

    const emergencyPayload = {
      eventId,
      userId,
      userName: user?.full_name || 'Monitored Person',
      userPhone: user?.phone,
      eventType: 'SOS_TRIGGERED',
      status: 'BROADCASTED',
      latitude,
      longitude,
      vitalSnapshot,
      timestamp: now,
    };

    broadcastEmergencyEvent(emergencyPayload);
    broadcastAlert({
      id: alertId,
      userId,
      alertType: 'SOS',
      severity: 'CRITICAL',
      title: '🚨 IMMEDIATE SOS EMERGENCY BROADCAST',
      message: `${user?.full_name || 'User'} triggered an emergency SOS broadcast!`,
      timestamp: now,
    });

    res.status(201).json({
      message: 'Emergency SOS broadcasted successfully to caregivers and responders',
      event: emergencyPayload,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to trigger SOS', details: err.message });
  }
}

export async function cancelEmergency(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { eventId } = req.params;
    const userId = req.user!.id;

    await runQuery(
      `UPDATE emergency_events
       SET status = 'CANCELLED', resolved_at = datetime('now')
       WHERE id = ? AND (user_id = ? OR EXISTS (SELECT 1 FROM users WHERE id = ? AND role IN ('CAREGIVER', 'ADMIN')))`,
      [eventId, userId, userId]
    );

    res.json({ message: 'Emergency event cancelled / resolved by user ("I\'M OK")' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to cancel emergency', details: err.message });
  }
}

export async function getEmergencyHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.params.userId || (req.user?.role === 'WORKER' ? req.user.id : undefined);

    let sql = `
      SELECT e.*, u.full_name as user_name, u.phone as user_phone
      FROM emergency_events e
      JOIN users u ON e.user_id = u.id
    `;
    const params: any[] = [];

    if (userId) {
      sql += ` WHERE e.user_id = ? `;
      params.push(userId);
    }

    sql += ` ORDER BY e.created_at DESC LIMIT 30 `;

    const events = await queryRows(sql, params);
    res.json(
      events.map((e: any) => ({
        ...e,
        vital_snapshot: JSON.parse(e.vital_snapshot || '{}'),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch emergency history', details: err.message });
  }
}
