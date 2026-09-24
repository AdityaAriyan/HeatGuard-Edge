"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sensorSimulator = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
const simulatedSensors_1 = require("../edge/sensors/simulatedSensors");
const EdgeRiskEngine_1 = require("../edge/risk-engine/EdgeRiskEngine");
const server_1 = require("../websocket/server");
class SimulationManager {
    userStates = new Map();
    timer = null;
    intervalMs = 3000;
    isRunning = false;
    async initialize() {
        const users = await (0, db_1.queryRows)('SELECT id FROM users');
        for (const u of users) {
            this.userStates.set(u.id, {
                userId: u.id,
                scenario: 'NORMAL',
                isActive: true,
                lat: 28.6139 + (Math.random() - 0.5) * 0.05,
                lng: 77.2090 + (Math.random() - 0.5) * 0.05,
            });
        }
    }
    setScenario(userId, scenario) {
        const existing = this.userStates.get(userId);
        if (existing) {
            existing.scenario = scenario;
        }
        else {
            this.userStates.set(userId, {
                userId,
                scenario,
                isActive: true,
                lat: 28.6139,
                lng: 77.2090,
            });
        }
    }
    getSimulationState() {
        return {
            isRunning: this.isRunning,
            intervalMs: this.intervalMs,
            users: Array.from(this.userStates.values()),
        };
    }
    start(intervalMs = 3000) {
        if (this.timer)
            clearInterval(this.timer);
        this.intervalMs = intervalMs;
        this.isRunning = true;
        this.timer = setInterval(() => this.tick(), this.intervalMs);
        console.log(`📡 Simulation engine started with tick interval ${this.intervalMs}ms`);
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isRunning = false;
        console.log('Simulation engine stopped');
    }
    async tick() {
        for (const [userId, state] of this.userStates.entries()) {
            if (!state.isActive)
                continue;
            try {
                const packet = (0, simulatedSensors_1.generateSyntheticReading)(state.scenario, userId, `DEV-${userId.substring(4)}`, {
                    lat: state.lat,
                    lng: state.lng,
                });
                const baselineRow = await (0, db_1.queryRow)('SELECT * FROM baselines WHERE user_id = ?', [userId]);
                const userBaseline = {
                    userId,
                    baselineHeartRate: baselineRow?.baseline_heart_rate || 72,
                    baselineSpo2: baselineRow?.baseline_spo2 || 98.0,
                    baselineSkinTemp: baselineRow?.baseline_skin_temp || 36.4,
                    baselineSystolic: baselineRow?.baseline_systolic || 120,
                    baselineDiastolic: baselineRow?.baseline_diastolic || 80,
                    typicalSleepMinutes: baselineRow?.typical_sleep_minutes || 450,
                };
                const risk = EdgeRiskEngine_1.EdgeRiskEngine.assessRisk(packet, userBaseline, 'SIMULATED_GRID', 'BACKEND_CLOUD');
                const readingId = (0, uuid_1.v4)();
                await (0, db_1.runQuery)(`INSERT INTO sensor_readings (
            id, user_id, device_id, heart_rate, spo2, skin_temperature,
            ambient_temperature, humidity, systolic, diastolic, is_bp_estimated,
            accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z,
            activity_state, aqi, pm25, exposure_minutes, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    readingId,
                    userId,
                    packet.deviceId,
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
                    packet.activityState,
                    packet.aqi,
                    packet.pm25,
                    packet.exposureMinutes,
                    packet.timestamp,
                ]);
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
                    'BACKEND_CLOUD',
                    packet.timestamp,
                ]);
                (0, server_1.broadcastSensorPacket)(packet, risk);
            }
            catch (err) {
                // ignore tick cycle errors
            }
        }
    }
}
exports.sensorSimulator = new SimulationManager();
