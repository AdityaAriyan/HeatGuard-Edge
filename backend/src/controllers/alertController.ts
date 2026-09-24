import { Response } from 'express';
import { queryRows, runQuery } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export async function getAlerts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.query.userId as string || (req.user?.role === 'WORKER' ? req.user.id : undefined);

    let sql = `
      SELECT a.*, u.full_name as user_name, u.email as user_email
      FROM alerts a
      JOIN users u ON a.user_id = u.id
    `;
    const params: any[] = [];

    if (userId) {
      sql += ` WHERE a.user_id = ? `;
      params.push(userId);
    }

    sql += ` ORDER BY a.created_at DESC LIMIT 50 `;

    const alerts = await queryRows(sql, params);
    res.json(
      alerts.map((a: any) => ({
        ...a,
        sensor_context: JSON.parse(a.sensor_context || '{}'),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch alerts', details: err.message });
  }
}

export async function acknowledgeAlert(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const acknowledgedBy = req.user?.full_name || req.user?.email || 'Authorized Caregiver';

    await runQuery(
      `UPDATE alerts
       SET acknowledged = 1, acknowledged_by = ?, acknowledged_at = datetime('now')
       WHERE id = ?`,
      [acknowledgedBy, id]
    );

    res.json({ message: 'Alert acknowledged successfully', id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to acknowledge alert', details: err.message });
  }
}
