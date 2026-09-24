"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestSensorReading = ingestSensorReading;
exports.getLatestSensorReading = getLatestSensorReading;
exports.getSensorHistory = getSensorHistory;
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
const auth_1 = require("../middleware/auth");
const EdgeRiskEngine_1 = require("../edge/risk-engine/EdgeRiskEngine");
const server_1 = require("../websocket/server");
async function ingestSensorReading(req, res) {
    try {
        const packet = req.body;
        const targetUserId = packet.userId || req.user?.id;
        if (!targetUserId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }
        const readingId = (0, uuid_1.v4)();
        const timestamp = packet.timestamp || new Date().toISOString();
        // 1. Insert Raw Sensor Reading
        await (0, db_1.runQuery)(`INSERT INTO sensor_readings (
        id, user_id, device_id, heart_rate, spo2, skin_temperature,
        ambient_temperature, humidity, systolic, diastolic, is_bp_estimated,
        accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z,
        activity_state, aqi, pm25, exposure_minutes, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            readingId,
            targetUserId,
            packet.deviceId || 'DEV-HARDWARE-01',
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
        // 2. Update Location if provided
        if (packet.latitude && packet.longitude) {
            await (0, db_1.runQuery)(`INSERT INTO location_records (id, user_id, latitude, longitude, accuracy, source, timestamp)
         VALUES (?, ?, ?, ?, 5.0, 'GPS_GNSS', ?)`, [(0, uuid_1.v4)(), targetUserId, packet.latitude, packet.longitude, timestamp]);
        }
        // 3. Retrieve Baseline for Risk Calculation
        let baseline = await (0, db_1.queryRow)('SELECT * FROM baselines WHERE user_id = ?', [targetUserId]);
        const userBaseline = {
            userId: targetUserId,
            baselineHeartRate: baseline?.baseline_heart_rate || 72,
            baselineSpo2: baseline?.baseline_spo2 || 98.0,
            baselineSkinTemp: baseline?.baseline_skin_temp || 36.4,
            baselineSystolic: baseline?.baseline_systolic || 120,
            baselineDiastolic: baseline?.baseline_diastolic || 80,
            typicalSleepMinutes: baseline?.typical_sleep_minutes || 450,
        };
        // 4. Calculate Risk via EdgeRiskEngine
        const risk = EdgeRiskEngine_1.EdgeRiskEngine.assessRisk(packet, userBaseline, 'ACTIVE_MONITORING', 'BACKEND_CLOUD');
        // 5. Insert Risk Assessment
        const riskAssessmentId = (0, uuid_1.v4)();
        await (0, db_1.runQuery)(`INSERT INTO risk_assessments (
        id, user_id, reading_id, overall_score, overall_level,
        heat_risk, dehydration_risk, respiratory_risk, fatigue_risk,
        cardiovascular_risk, fall_risk, reasons, recommendations,
        is_fall_suspected, engine_location, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            riskAssessmentId,
            targetUserId,
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
            'BACKEND_CLOUD',
            timestamp,
        ]);
        // 6. Handle Alerts & Fall / Emergency triggers
        if (risk.isFallSuspected) {
            const alertId = (0, uuid_1.v4)();
            await (0, db_1.runQuery)(`INSERT INTO alerts (id, user_id, alert_type, severity, title, message, sensor_context, created_at)
         VALUES (?, ?, 'FALL_DETECTED', 'CRITICAL', '⚠️ Possible Fall Detected', 'Sudden impact and inactivity pattern registered from MPU6050.', ?, ?)`, [alertId, targetUserId, JSON.stringify({ hr: packet.heartRate, accel: [packet.accelX, packet.accelY, packet.accelZ] }), timestamp]);
            (0, server_1.broadcastAlert)({
                id: alertId,
                userId: targetUserId,
                alertType: 'FALL_DETECTED',
                severity: 'CRITICAL',
                title: '⚠️ Possible Fall Detected',
                message: 'Sudden impact and inactivity pattern registered from MPU6050.',
                timestamp,
            });
        }
        else if (risk.overallLevel === 'HIGH' || risk.overallLevel === 'CRITICAL') {
            const alertId = (0, uuid_1.v4)();
            await (0, db_1.runQuery)(`INSERT INTO alerts (id, user_id, alert_type, severity, title, message, sensor_context, created_at)
         VALUES (?, ?, 'HIGH_HEAT_RISK', ?, ?, ?, ?, ?)`, [
                alertId,
                targetUserId,
                risk.overallLevel,
                `⚠️ ${risk.overallLevel} Risk Alert: Heat/Vital Strain`,
                risk.reasons[0] || 'Abnormal physiological state detected.',
                JSON.stringify({ hr: packet.heartRate, temp: packet.skinTemperature, riskScore: risk.overallScore }),
                timestamp,
            ]);
            (0, server_1.broadcastAlert)({
                id: alertId,
                userId: targetUserId,
                alertType: 'HIGH_HEAT_RISK',
                severity: risk.overallLevel,
                title: `⚠️ ${risk.overallLevel} Risk Alert: Heat/Vital Strain`,
                message: risk.reasons[0] || 'Abnormal physiological state detected.',
                timestamp,
            });
        }
        // 7. Broadcast Telemetry over Real-time WebSockets
        (0, server_1.broadcastSensorPacket)(packet, risk);
        res.status(201).json({
            message: 'Sensor reading and risk processed successfully',
            readingId,
            riskAssessment: risk,
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Sensor ingestion failed', details: err.message });
    }
}
async function getLatestSensorReading(req, res) {
    try {
        const userId = req.params.userId || req.user?.id;
        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }
        const authorized = await (0, auth_1.canAccessUserData)(req.user.id, userId);
        if (!authorized) {
            res.status(403).json({ error: 'Access denied due to privacy permissions' });
            return;
        }
        const reading = await (0, db_1.queryRow)('SELECT * FROM sensor_readings WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1', [userId]);
        const location = await (0, db_1.queryRow)('SELECT latitude, longitude, timestamp FROM location_records WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1', [userId]);
        res.json({ reading, location });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch latest reading', details: err.message });
    }
}
async function getSensorHistory(req, res) {
    try {
        const userId = req.params.userId || req.user?.id;
        const limit = parseInt(req.query.limit) || 30;
        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }
        const authorized = await (0, auth_1.canAccessUserData)(req.user.id, userId);
        if (!authorized) {
            res.status(403).json({ error: 'Access denied due to privacy permissions' });
            return;
        }
        const history = await (0, db_1.queryRows)('SELECT * FROM sensor_readings WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?', [userId, limit]);
        res.json(history.reverse());
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch history', details: err.message });
    }
}
