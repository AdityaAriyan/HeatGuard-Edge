import { v4 as uuidv4 } from 'uuid';
import { queryRow, queryRows, runQuery } from '../database/db';
import { generateSyntheticReading, ScenarioType } from '../edge/sensors/simulatedSensors';
import { EdgeRiskEngine, UserBaseline } from '../edge/risk-engine/EdgeRiskEngine';
import { broadcastSensorPacket } from '../websocket/server';

interface UserSimulationState {
  userId: string;
  scenario: ScenarioType;
  isActive: boolean;
  lat: number;
  lng: number;
}

class SimulationManager {
  private userStates: Map<string, UserSimulationState> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private intervalMs: number = 3000;
  private isRunning: boolean = false;

  public async initialize(): Promise<void> {
    const users = await queryRows<{ id: string }>('SELECT id FROM users');
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

  public setScenario(userId: string, scenario: ScenarioType): void {
    const existing = this.userStates.get(userId);
    if (existing) {
      existing.scenario = scenario;
    } else {
      this.userStates.set(userId, {
        userId,
        scenario,
        isActive: true,
        lat: 28.6139,
        lng: 77.2090,
      });
    }
  }

  public getSimulationState(): { isRunning: boolean; intervalMs: number; users: UserSimulationState[] } {
    return {
      isRunning: this.isRunning,
      intervalMs: this.intervalMs,
      users: Array.from(this.userStates.values()),
    };
  }

  public start(intervalMs: number = 3000): void {
    if (this.timer) clearInterval(this.timer);
    this.intervalMs = intervalMs;
    this.isRunning = true;
    this.timer = setInterval(() => this.tick(), this.intervalMs);
    console.log(`📡 Simulation engine started with tick interval ${this.intervalMs}ms`);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('Simulation engine stopped');
  }

  public async tick(): Promise<void> {
    for (const [userId, state] of this.userStates.entries()) {
      if (!state.isActive) continue;

      try {
        const packet = generateSyntheticReading(state.scenario, userId, `DEV-${userId.substring(4)}`, {
          lat: state.lat,
          lng: state.lng,
        });

        const baselineRow = await queryRow<{
          baseline_heart_rate: number;
          baseline_spo2: number;
          baseline_skin_temp: number;
          baseline_systolic: number;
          baseline_diastolic: number;
          typical_sleep_minutes: number;
        }>('SELECT * FROM baselines WHERE user_id = ?', [userId]);

        const userBaseline: UserBaseline = {
          userId,
          baselineHeartRate: baselineRow?.baseline_heart_rate || 72,
          baselineSpo2: baselineRow?.baseline_spo2 || 98.0,
          baselineSkinTemp: baselineRow?.baseline_skin_temp || 36.4,
          baselineSystolic: baselineRow?.baseline_systolic || 120,
          baselineDiastolic: baselineRow?.baseline_diastolic || 80,
          typicalSleepMinutes: baselineRow?.typical_sleep_minutes || 450,
        };

        const risk = EdgeRiskEngine.assessRisk(packet, userBaseline, 'SIMULATED_GRID', 'BACKEND_CLOUD');

        const readingId = uuidv4();
        await runQuery(
          `INSERT INTO sensor_readings (
            id, user_id, device_id, heart_rate, spo2, skin_temperature,
            ambient_temperature, humidity, systolic, diastolic, is_bp_estimated,
            accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z,
            activity_state, aqi, pm25, exposure_minutes, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
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
          ]
        );

        await runQuery(
          `INSERT INTO risk_assessments (
            id, user_id, reading_id, overall_score, overall_level,
            heat_risk, dehydration_risk, respiratory_risk, fatigue_risk,
            cardiovascular_risk, fall_risk, reasons, recommendations,
            is_fall_suspected, engine_location, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
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
          ]
        );

        broadcastSensorPacket(packet, risk);
      } catch (err) {
        // ignore tick cycle errors
      }
    }
  }
}

export const sensorSimulator = new SimulationManager();
