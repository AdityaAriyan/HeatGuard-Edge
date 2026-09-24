import { Response } from 'express';
import { queryRow, queryRows } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export async function getPersonalDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    // 1. Fetch User Profile & Baseline
    const user = await queryRow('SELECT id, email, full_name, role, phone FROM users WHERE id = ?', [userId]);
    const profile = await queryRow('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    const baseline = await queryRow('SELECT * FROM baselines WHERE user_id = ?', [userId]);

    // 2. Fetch Latest Sensor Reading
    const latestReading = await queryRow(
      'SELECT * FROM sensor_readings WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
      [userId]
    );

    // 3. Fetch Latest Risk Assessment
    const latestRisk = await queryRow(
      'SELECT * FROM risk_assessments WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
      [userId]
    );

    // 4. Fetch Latest Location
    const latestLocation = await queryRow(
      'SELECT latitude, longitude, accuracy, timestamp FROM location_records WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
      [userId]
    );

    // 5. Fetch Active Alerts
    const activeAlerts = await queryRows(
      'SELECT * FROM alerts WHERE user_id = ? AND acknowledged = 0 ORDER BY created_at DESC LIMIT 5',
      [userId]
    );

    // 6. Fetch Active Disaster Event
    const activeDisaster = await queryRow(
      'SELECT * FROM disaster_events WHERE is_active = 1 ORDER BY started_at DESC LIMIT 1'
    );

    // 7. Fetch Recent Sleep & Activity
    const recentSleep = await queryRow(
      'SELECT * FROM sleep_records WHERE user_id = ? ORDER BY date DESC LIMIT 1',
      [userId]
    );
    const recentActivity = await queryRow(
      'SELECT * FROM activity_records WHERE user_id = ? ORDER BY date DESC LIMIT 1',
      [userId]
    );

    // 8. Dynamic AI Insight Generation
    let aiInsight = 'Your current risk is low. All physiological readings are within normal calibrated baseline.';
    let recommendations: string[] = ['Maintain hydration.', 'Continue normal activity.'];

    if (latestRisk) {
      const parsedReasons = JSON.parse(latestRisk.reasons || '[]');
      const parsedRecs = JSON.parse(latestRisk.recommendations || '[]');
      if (parsedReasons.length > 0) {
        aiInsight = `Status: ${latestRisk.overall_level} Risk. ${parsedReasons[0]}`;
      }
      if (parsedRecs.length > 0) {
        recommendations = parsedRecs;
      }
    }

    res.json({
      user,
      profile,
      baseline,
      vitals: latestReading
        ? {
            heartRate: latestReading.heart_rate,
            spo2: latestReading.spo2,
            skinTemperature: latestReading.skin_temperature,
            systolic: latestReading.systolic,
            diastolic: latestReading.diastolic,
            isBpEstimated: !!latestReading.is_bp_estimated,
            activityState: latestReading.activity_state,
            exposureMinutes: latestReading.exposure_minutes,
            timestamp: latestReading.timestamp,
          }
        : null,
      environment: latestReading
        ? {
            ambientTemperature: latestReading.ambient_temperature,
            humidity: latestReading.humidity,
            aqi: latestReading.aqi,
            pm25: latestReading.pm25,
          }
        : null,
      riskAssessment: latestRisk
        ? {
            ...latestRisk,
            reasons: JSON.parse(latestRisk.reasons || '[]'),
            recommendations: JSON.parse(latestRisk.recommendations || '[]'),
          }
        : null,
      location: latestLocation,
      aiInsight,
      recommendations,
      activeAlerts: activeAlerts.map((a: any) => ({
        ...a,
        sensor_context: JSON.parse(a.sensor_context || '{}'),
      })),
      activeDisaster: activeDisaster
        ? {
            ...activeDisaster,
            guidelines: JSON.parse(activeDisaster.guidelines || '[]'),
          }
        : null,
      sleep: recentSleep,
      activity: recentActivity,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch personal dashboard', details: err.message });
  }
}

export async function getCaregiverDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const caregiverId = req.user!.id;
    const isCaregiverOrAdmin = req.user?.role === 'CAREGIVER' || req.user?.role === 'ADMIN';

    if (!isCaregiverOrAdmin) {
      res.status(403).json({ error: 'Access restricted to authorized caregivers and coordinators' });
      return;
    }

    // 1. Fetch Authorized Monitored Users (based on ACL and user privacy toggles)
    let userQuery = `
      SELECT u.id, u.email, u.full_name, u.role, u.phone,
             p.occupation, p.work_environment, p.age, p.blood_group,
             b.baseline_heart_rate, b.baseline_spo2, b.baseline_skin_temp,
             b.baseline_systolic, b.baseline_diastolic,
             priv.location_sharing, priv.caregiver_access
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN baselines b ON u.id = b.user_id
      LEFT JOIN privacy_settings priv ON u.id = priv.user_id
    `;

    if (req.user?.role !== 'ADMIN') {
      userQuery += `
        INNER JOIN caregiver_relationships cr ON u.id = cr.user_id
        WHERE cr.caregiver_id = '${caregiverId}' AND cr.status = 'ACTIVE' AND (priv.caregiver_access IS NULL OR priv.caregiver_access = 1)
      `;
    } else {
      userQuery += ` WHERE u.role != 'ADMIN' `;
    }

    const rawUsers = await queryRows(userQuery);

    // 2. Fetch Latest Telemetry and Risk for each user
    const monitoredPeople = [];
    let lowCount = 0;
    let cautionCount = 0;
    let highCount = 0;
    let criticalCount = 0;

    for (const u of rawUsers) {
      const reading = await queryRow(
        'SELECT * FROM sensor_readings WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
        [u.id]
      );
      const risk = await queryRow(
        'SELECT * FROM risk_assessments WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
        [u.id]
      );
      const loc = u.location_sharing
        ? await queryRow('SELECT latitude, longitude, accuracy, timestamp FROM location_records WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1', [u.id])
        : null;

      const unacknowledgedAlerts = await queryRows(
        'SELECT * FROM alerts WHERE user_id = ? AND acknowledged = 0 ORDER BY created_at DESC',
        [u.id]
      );

      const overallLevel = risk?.overall_level || 'LOW';
      if (overallLevel === 'LOW') lowCount++;
      else if (overallLevel === 'CAUTION') cautionCount++;
      else if (overallLevel === 'HIGH') highCount++;
      else if (overallLevel === 'CRITICAL') criticalCount++;

      monitoredPeople.push({
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        phone: u.phone,
        occupation: u.occupation,
        workEnvironment: u.work_environment,
        age: u.age,
        bloodGroup: u.blood_group,
        baseline: {
          heartRate: u.baseline_heart_rate,
          spo2: u.baseline_spo2,
          skinTemp: u.baseline_skin_temp,
          systolic: u.baseline_systolic,
          diastolic: u.baseline_diastolic,
        },
        currentVitals: reading
          ? {
              heartRate: reading.heart_rate,
              spo2: reading.spo2,
              skinTemperature: reading.skin_temperature,
              systolic: reading.systolic,
              diastolic: reading.diastolic,
              isBpEstimated: !!reading.is_bp_estimated,
              activityState: reading.activity_state,
              ambientTemperature: reading.ambient_temperature,
              humidity: reading.humidity,
              aqi: reading.aqi,
              pm25: reading.pm25,
              exposureMinutes: reading.exposure_minutes,
              timestamp: reading.timestamp,
            }
          : null,
        risk: risk
          ? {
              overallScore: risk.overall_score,
              overallLevel: risk.overall_level,
              heatRisk: risk.heat_risk,
              dehydrationRisk: risk.dehydration_risk,
              respiratoryRisk: risk.respiratory_risk,
              fatigueRisk: risk.fatigue_risk,
              cardiovascularRisk: risk.cardiovascular_risk,
              fallRisk: risk.fall_risk,
              reasons: JSON.parse(risk.reasons || '[]'),
              recommendations: JSON.parse(risk.recommendations || '[]'),
              timestamp: risk.timestamp,
            }
          : null,
        location: loc,
        activeAlertsCount: unacknowledgedAlerts.length,
        hasEmergency: unacknowledgedAlerts.some((a: any) => a.severity === 'CRITICAL' || a.alert_type === 'FALL_DETECTED'),
      });
    }

    // Sort: Critical first, then High, then Caution, then Low
    const severityWeight: Record<string, number> = { CRITICAL: 4, HIGH: 3, CAUTION: 2, LOW: 1 };
    monitoredPeople.sort((a, b) => {
      const wA = severityWeight[a.risk?.overallLevel || 'LOW'];
      const wB = severityWeight[b.risk?.overallLevel || 'LOW'];
      return wB - wA || (b.risk?.overallScore || 0) - (a.risk?.overallScore || 0);
    });

    // 3. Fetch System-wide unacknowledged alerts
    const allAlerts = await queryRows(`
      SELECT a.*, u.full_name as user_name
      FROM alerts a
      JOIN users u ON a.user_id = u.id
      WHERE a.acknowledged = 0
      ORDER BY a.created_at DESC
      LIMIT 20
    `);

    // 4. Fetch Active Disasters
    const activeDisasters = await queryRows(
      'SELECT * FROM disaster_events WHERE is_active = 1 ORDER BY started_at DESC'
    );

    res.json({
      summary: {
        totalMonitored: monitoredPeople.length,
        lowCount,
        cautionCount,
        highCount,
        criticalCount,
      },
      people: monitoredPeople,
      alerts: allAlerts.map((a: any) => ({
        ...a,
        sensor_context: JSON.parse(a.sensor_context || '{}'),
      })),
      activeDisasters: activeDisasters.map((d: any) => ({
        ...d,
        guidelines: JSON.parse(d.guidelines || '[]'),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch caregiver dashboard', details: err.message });
  }
}
