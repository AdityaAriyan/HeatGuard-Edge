"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncOfflineData = syncOfflineData;
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
const EdgeRiskEngine_1 = require("../edge/risk-engine/EdgeRiskEngine");
async function syncOfflineData(req, res) {
    try {
        const userId = req.body.userId || req.user?.id;
        if (!userId) {
            res.status(400).json({ error: 'userId required for synchronization' });
            return;
        }
        const { readings = [], offlineSosEvents = [] } = req.body;
        // Fetch baseline for re-evaluating or validating
        const baseline = await (0, db_1.queryRow)('SELECT * FROM baselines WHERE user_id = ?', [userId]);
        const userBaseline = {
            userId,
            baselineHeartRate: baseline?.baseline_heart_rate || 72,
            baselineSpo2: baseline?.baseline_spo2 || 98.0,
            baselineSkinTemp: baseline?.baseline_skin_temp || 36.4,
            baselineSystolic: baseline?.baseline_systolic || 120,
            baselineDiastolic: baseline?.baseline_diastolic || 80,
            typicalSleepMinutes: baseline?.typical_sleep_minutes || 450,
        };
        let processedCount = 0;
        // 1. Process each queued sensor reading
        for (const packet of readings) {
            const readingId = (0, uuid_1.v4)();
            const timestamp = packet.timestamp || new Date().toISOString();
            await (0, db_1.runQuery)(`INSERT INTO sensor_readings (
          id, user_id, device_id, heart_rate, spo2, skin_temperature,
          ambient_temperature, humidity, systolic, diastolic, is_bp_estimated,
          accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z,
          activity_state, aqi, pm25, exposure_minutes, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                readingId,
                userId,
                packet.deviceId || 'DEV-OFFLINE-SYNC',
                packet.heartRate,
                packet.spo2,
                packet.skinTemperature,
                packet.ambientTemperature,
                packet.humidity,
                packet.systolic,
                packet.diastolic,
                packet.isBpEstimated ? 1 : 0,
                packet.accelX,
                packet.accelY,
                packet.accelZ,
                packet.gyroX,
                packet.gyroY,
                packet.gyroZ,
                packet.activityState || 'RESTING',
                packet.aqi || 50,
                packet.pm25 || 15,
                packet.exposureMinutes || 0,
                timestamp,
            ]);
            const risk = EdgeRiskEngine_1.EdgeRiskEngine.assessRisk(packet, userBaseline, 'OFFLINE_RECONCILIATION', 'EDGE_DEVICE_LOCAL');
            await (0, db_1.runQuery)(`INSERT INTO risk_assessments (
          id, user_id, reading_id, overall_score, overall_level,
          heat_risk, dehydration_risk, respiratory_risk, fatigue_risk,
          cardiovascular_risk, fall_risk, reasons, recommendations,
          is_fall_suspected, engine_location, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                (0, uuid_1.v4)(),
                userId,
                readingId,
                risk.overallScore,
                risk.overallLevel,
                risk.risks.heat,
                risk.risks.dehydration,
                risk.risks.respiratory,
                risk.risks.fatigue,
                risk.risks.cardiovascular,
                risk.risks.fallEmergency,
                JSON.stringify(risk.reasons),
                JSON.stringify(risk.recommendations),
                risk.isFallSuspected ? 1 : 0,
                'EDGE_DEVICE_LOCAL',
                timestamp,
            ]);
            processedCount++;
        }
        // 2. Process Offline SOS events if any occurred during disconnection
        for (const sos of offlineSosEvents) {
            await (0, db_1.runQuery)(`INSERT INTO emergency_events (id, user_id, event_type, status, latitude, longitude, vital_snapshot, caregiver_notified, created_at)
         VALUES (?, ?, 'SOS_TRIGGERED', 'BROADCASTED', ?, ?, ?, 1, ?)`, [(0, uuid_1.v4)(), userId, sos.latitude || null, sos.longitude || null, JSON.stringify(sos.vitalSnapshot || {}), sos.timestamp || new Date().toISOString()]);
        }
        // 3. Log into Sync Queue audit
        await (0, db_1.runQuery)(`INSERT INTO sync_queues (id, user_id, payload_type, payload_json, queued_at, status)
       VALUES (?, ?, 'SENSOR_BATCH', ?, datetime('now'), 'PROCESSED')`, [(0, uuid_1.v4)(), userId, JSON.stringify({ count: processedCount })]);
        // Update device last sync
        await (0, db_1.runQuery)(`UPDATE devices SET last_sync_at = datetime('now') WHERE user_id = ?`, [userId]);
        res.json({
            message: 'Synchronization successful',
            synchronizedCount: processedCount,
            syncedAt: new Date().toISOString(),
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Data synchronization failed', details: err.message });
    }
}
