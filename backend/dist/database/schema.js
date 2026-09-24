"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSchema = initSchema;
const db_1 = require("./db");
async function initSchema() {
    const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('WORKER', 'USER', 'CAREGIVER', 'ADMIN')),
      phone TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      age INTEGER,
      gender TEXT,
      occupation TEXT,
      work_environment TEXT,
      known_health_conditions TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      blood_group TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS caregiver_relationships (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      caregiver_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'REVOKED')),
      permission_level TEXT NOT NULL CHECK (permission_level IN ('FULL', 'EMERGENCY_ONLY', 'READ_ONLY')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(caregiver_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS baselines (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      baseline_heart_rate REAL NOT NULL DEFAULT 72,
      baseline_spo2 REAL NOT NULL DEFAULT 98,
      baseline_skin_temp REAL NOT NULL DEFAULT 36.4,
      baseline_systolic REAL NOT NULL DEFAULT 120,
      baseline_diastolic REAL NOT NULL DEFAULT 80,
      typical_sleep_minutes INTEGER NOT NULL DEFAULT 450,
      calibrated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      device_name TEXT NOT NULL,
      device_model TEXT NOT NULL,
      hardware_platform TEXT NOT NULL, -- e.g. 'Qualcomm Dragonwing', 'Arduino UNO Q', 'ESP32', 'Virtual Simulator'
      firmware_version TEXT,
      status TEXT NOT NULL CHECK (status IN ('ONLINE', 'OFFLINE', 'PAIRING')),
      last_sync_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS device_connections (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL,
      connection_type TEXT NOT NULL, -- 'BLE', 'WIFI', 'CELLULAR', 'MQTT', 'SIMULATED_WS'
      signal_strength INTEGER,
      battery_percentage INTEGER,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(device_id) REFERENCES devices(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sensor_readings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      device_id TEXT,
      heart_rate REAL NOT NULL,
      spo2 REAL NOT NULL,
      skin_temperature REAL NOT NULL,
      ambient_temperature REAL NOT NULL,
      humidity REAL NOT NULL,
      systolic REAL NOT NULL,
      diastolic REAL NOT NULL,
      is_bp_estimated INTEGER NOT NULL DEFAULT 1,
      accel_x REAL,
      accel_y REAL,
      accel_z REAL,
      gyro_x REAL,
      gyro_y REAL,
      gyro_z REAL,
      activity_state TEXT NOT NULL DEFAULT 'RESTING',
      aqi REAL NOT NULL DEFAULT 50,
      pm25 REAL NOT NULL DEFAULT 15,
      exposure_minutes INTEGER NOT NULL DEFAULT 0,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS risk_assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      reading_id TEXT,
      overall_score INTEGER NOT NULL,
      overall_level TEXT NOT NULL CHECK (overall_level IN ('LOW', 'CAUTION', 'HIGH', 'CRITICAL')),
      heat_risk INTEGER NOT NULL,
      dehydration_risk INTEGER NOT NULL,
      respiratory_risk INTEGER NOT NULL,
      fatigue_risk INTEGER NOT NULL,
      cardiovascular_risk INTEGER NOT NULL,
      fall_risk INTEGER NOT NULL,
      reasons TEXT NOT NULL, -- JSON array
      recommendations TEXT NOT NULL, -- JSON array
      is_fall_suspected INTEGER NOT NULL DEFAULT 0,
      engine_location TEXT NOT NULL CHECK (engine_location IN ('EDGE_DEVICE_LOCAL', 'BACKEND_CLOUD')),
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS risk_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      risk_type TEXT NOT NULL, -- 'HEAT_STRESS', 'DEHYDRATION', 'RESPIRATORY', 'FATIGUE', 'CARDIO', 'FALL'
      severity TEXT NOT NULL CHECK (severity IN ('LOW', 'CAUTION', 'HIGH', 'CRITICAL')),
      description TEXT NOT NULL,
      resolved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      alert_type TEXT NOT NULL, -- 'HIGH_HEAT_RISK', 'RESPIRATORY_RISK', 'ABNORMAL_HEART_RATE', 'LOW_SPO2', 'ABNORMAL_BP', 'HIGH_TEMPERATURE', 'FALL_DETECTED', 'PROLONGED_INACTIVITY', 'DISASTER_ALERT', 'SOS'
      severity TEXT NOT NULL CHECK (severity IN ('INFO', 'CAUTION', 'HIGH', 'CRITICAL')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      sensor_context TEXT, -- JSON
      acknowledged INTEGER NOT NULL DEFAULT 0,
      acknowledged_by TEXT,
      acknowledged_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS emergency_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK (event_type IN ('SOS_TRIGGERED', 'FALL_DETECTED', 'MANUAL_PANIC', 'CRITICAL_VITAL_FAILURE')),
      status TEXT NOT NULL CHECK (status IN ('PENDING_CONFIRMATION', 'BROADCASTED', 'RESPONDED', 'RESOLVED', 'CANCELLED')),
      latitude REAL,
      longitude REAL,
      vital_snapshot TEXT, -- JSON
      caregiver_notified INTEGER NOT NULL DEFAULT 1,
      resolved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS location_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy REAL NOT NULL DEFAULT 5.0,
      source TEXT NOT NULL DEFAULT 'SIMULATOR',
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS environmental_readings (
      id TEXT PRIMARY KEY,
      latitude REAL,
      longitude REAL,
      ambient_temperature REAL NOT NULL,
      humidity REAL NOT NULL,
      heat_index REAL NOT NULL,
      aqi REAL NOT NULL,
      pm25 REAL NOT NULL,
      uv_index REAL DEFAULT 5,
      weather_condition TEXT NOT NULL DEFAULT 'Sunny',
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS disaster_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL CHECK (event_type IN ('HEAT_WAVE', 'FLOOD', 'CYCLONE', 'AIR_POLLUTION', 'EXTREME_WEATHER')),
      title TEXT NOT NULL,
      severity TEXT NOT NULL CHECK (severity IN ('ADVISORY', 'WARNING', 'SEVERE', 'EMERGENCY')),
      affected_region TEXT NOT NULL,
      description TEXT NOT NULL,
      guidelines TEXT NOT NULL, -- JSON array
      is_active INTEGER NOT NULL DEFAULT 1,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sleep_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      is_estimated INTEGER NOT NULL DEFAULT 1,
      sleep_quality TEXT NOT NULL DEFAULT 'Good',
      consistency_score INTEGER NOT NULL DEFAULT 85,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      active_minutes INTEGER NOT NULL DEFAULT 0,
      step_count INTEGER NOT NULL DEFAULT 0,
      inactivity_minutes INTEGER NOT NULL DEFAULT 0,
      strenuous_work_minutes INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exposure_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_type TEXT NOT NULL CHECK (session_type IN ('HEAT_EXPOSURE', 'OUTDOOR_WORK', 'AIR_POLLUTION_EXPOSURE')),
      start_time TEXT NOT NULL DEFAULT (datetime('now')),
      end_time TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 0,
      peak_heat_index REAL,
      average_heart_rate REAL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS privacy_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      local_edge_ai_only INTEGER NOT NULL DEFAULT 0,
      cloud_health_sync INTEGER NOT NULL DEFAULT 1,
      location_sharing INTEGER NOT NULL DEFAULT 1,
      caregiver_access INTEGER NOT NULL DEFAULT 1,
      emergency_location_broadcast INTEGER NOT NULL DEFAULT 1,
      anonymous_analytics INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_queues (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      payload_type TEXT NOT NULL, -- 'SENSOR_BATCH', 'RISK_LOG', 'ALERT_LOG', 'OFFLINE_SOS'
      payload_json TEXT NOT NULL,
      queued_at TEXT NOT NULL,
      synced_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
    await (0, db_1.execSql)(schemaSql);
}
