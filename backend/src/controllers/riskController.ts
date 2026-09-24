import { Response } from 'express';
import { queryRow, queryRows } from '../database/db';
import { AuthRequest, canAccessUserData } from '../middleware/auth';
import { EdgeRiskEngine, UserBaseline } from '../edge/risk-engine/EdgeRiskEngine';
import { EdgeSensorPacket } from '../edge/sensors/interfaces';

export async function getCurrentRisk(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = (req.params.userId as string) || req.user?.id;
    if (!userId) {
      res.status(400).json({ error: 'userId required' });
      return;
    }

    const authorized = await canAccessUserData(req.user!.id, userId);
    if (!authorized) {
      res.status(403).json({ error: 'Access denied due to privacy permissions' });
      return;
    }

    const risk = await queryRow(
      'SELECT * FROM risk_assessments WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
      [userId]
    );

    const baseline = await queryRow('SELECT * FROM baselines WHERE user_id = ?', [userId]);

    if (!risk) {
      res.status(404).json({ error: 'No risk assessment found for user' });
      return;
    }

    res.json({
      ...risk,
      reasons: JSON.parse(risk.reasons || '[]'),
      recommendations: JSON.parse(risk.recommendations || '[]'),
      baseline,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch current risk', details: err.message });
  }
}

export async function getRiskHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = (req.params.userId as string) || req.user?.id;
    const limit = parseInt(req.query.limit as string) || 30;

    if (!userId) {
      res.status(400).json({ error: 'userId required' });
      return;
    }

    const authorized = await canAccessUserData(req.user!.id, userId);
    if (!authorized) {
      res.status(403).json({ error: 'Access denied due to privacy permissions' });
      return;
    }

    const history = await queryRows(
      'SELECT * FROM risk_assessments WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
      [userId, limit]
    );

    const parsed = history.map((item: any) => ({
      ...item,
      reasons: JSON.parse(item.reasons || '[]'),
      recommendations: JSON.parse(item.recommendations || '[]'),
    }));

    res.json(parsed.reverse());
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch risk history', details: err.message });
  }
}

export async function calculateAdHocRisk(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { packet, baseline, disasterContext } = req.body as {
      packet: EdgeSensorPacket;
      baseline?: UserBaseline;
      disasterContext?: string;
    };

    if (!packet) {
      res.status(400).json({ error: 'packet is required' });
      return;
    }

    const effectiveBaseline: UserBaseline = baseline || {
      userId: packet.userId || 'adhoc-user',
      baselineHeartRate: 72,
      baselineSpo2: 98.0,
      baselineSkinTemp: 36.4,
      baselineSystolic: 120,
      baselineDiastolic: 80,
      typicalSleepMinutes: 450,
    };

    const assessment = EdgeRiskEngine.assessRisk(
      packet,
      effectiveBaseline,
      disasterContext || 'NONE',
      'BACKEND_CLOUD'
    );

    res.json(assessment);
  } catch (err: any) {
    res.status(500).json({ error: 'Ad-hoc calculation failed', details: err.message });
  }
}
