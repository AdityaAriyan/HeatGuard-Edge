import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryRow, runQuery } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export async function getPrivacySettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    let settings = await queryRow('SELECT * FROM privacy_settings WHERE user_id = ?', [userId]);

    if (!settings) {
      const id = uuidv4();
      await runQuery(
        `INSERT INTO privacy_settings (id, user_id, local_edge_ai_only, cloud_health_sync, location_sharing, caregiver_access, emergency_location_broadcast)
         VALUES (?, ?, 0, 1, 1, 1, 1)`,
        [id, userId]
      );
      settings = await queryRow('SELECT * FROM privacy_settings WHERE user_id = ?', [userId]);
    }

    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch privacy settings', details: err.message });
  }
}

export async function updatePrivacySettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const {
      local_edge_ai_only,
      cloud_health_sync,
      location_sharing,
      caregiver_access,
      emergency_location_broadcast,
      anonymous_analytics,
    } = req.body;

    await runQuery(
      `UPDATE privacy_settings
       SET local_edge_ai_only = COALESCE(?, local_edge_ai_only),
           cloud_health_sync = COALESCE(?, cloud_health_sync),
           location_sharing = COALESCE(?, location_sharing),
           caregiver_access = COALESCE(?, caregiver_access),
           emergency_location_broadcast = COALESCE(?, emergency_location_broadcast),
           anonymous_analytics = COALESCE(?, anonymous_analytics),
           updated_at = datetime('now')
       WHERE user_id = ?`,
      [
        local_edge_ai_only !== undefined ? (local_edge_ai_only ? 1 : 0) : null,
        cloud_health_sync !== undefined ? (cloud_health_sync ? 1 : 0) : null,
        location_sharing !== undefined ? (location_sharing ? 1 : 0) : null,
        caregiver_access !== undefined ? (caregiver_access ? 1 : 0) : null,
        emergency_location_broadcast !== undefined ? (emergency_location_broadcast ? 1 : 0) : null,
        anonymous_analytics !== undefined ? (anonymous_analytics ? 1 : 0) : null,
        userId,
      ]
    );

    const updated = await queryRow('SELECT * FROM privacy_settings WHERE user_id = ?', [userId]);
    res.json({ message: 'Privacy preferences updated successfully', settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update privacy preferences', details: err.message });
  }
}
