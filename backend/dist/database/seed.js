"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const db_1 = require("./db");
const schema_1 = require("./schema");
const simulatedSensors_1 = require("../edge/sensors/simulatedSensors");
const EdgeRiskEngine_1 = require("../edge/risk-engine/EdgeRiskEngine");
async function seedDatabase() {
    console.log('🌱 Initializing schema & seeding database...');
    await (0, schema_1.initSchema)();
    // Clear existing data to ensure clean reproducible demo state
    await (0, db_1.execSql)(`
    DELETE FROM sync_queues;
    DELETE FROM privacy_settings;
    DELETE FROM exposure_sessions;
    DELETE FROM activity_records;
    DELETE FROM sleep_records;
    DELETE FROM disaster_events;
    DELETE FROM environmental_readings;
    DELETE FROM location_records;
    DELETE FROM emergency_events;
    DELETE FROM alerts;
    DELETE FROM risk_events;
    DELETE FROM risk_assessments;
    DELETE FROM sensor_readings;
    DELETE FROM device_connections;
    DELETE FROM devices;
    DELETE FROM baselines;
    DELETE FROM caregiver_relationships;
    DELETE FROM user_profiles;
    DELETE FROM users;
  `);
    const salt = await bcryptjs_1.default.genSalt(10);
    const defaultPasswordHash = await bcryptjs_1.default.hash('HeatGuard@123', salt);
    // 1. Core Demo Accounts
    const primaryUserId = 'usr-demo-worker-01';
    const caregiverId = 'usr-demo-caregiver-01';
    const adminId = 'usr-demo-admin-01';
    const demoAccounts = [
        {
            id: primaryUserId,
            email: 'user@heatguard.demo',
            full_name: 'Arun Sharma',
            role: 'WORKER',
            phone: '+91 98765 43210',
            profile: {
                age: 38,
                gender: 'Male',
                occupation: 'Outdoor Infrastructure Technician',
                work_environment: 'Urban Construction Site / Street Patrol',
                known_health_conditions: 'Mild seasonal allergies',
                emergency_contact_name: 'Kavita Sharma (Spouse)',
                emergency_contact_phone: '+91 98765 11223',
                blood_group: 'B+',
            },
            baseline: {
                hr: 72,
                spo2: 98.5,
                temp: 36.4,
                sys: 118,
                dia: 78,
                sleep: 450,
            },
            scenario: 'NORMAL',
            lat: 28.6139,
            lng: 77.2090,
        },
        {
            id: caregiverId,
            email: 'caregiver@heatguard.demo',
            full_name: 'Dr. Priya Nair',
            role: 'CAREGIVER',
            phone: '+91 98111 22334',
            profile: {
                age: 44,
                gender: 'Female',
                occupation: 'Disaster Health Response Lead & Occupational Caregiver',
                work_environment: 'Emergency Coordination Center',
                known_health_conditions: 'None',
                emergency_contact_name: 'National Emergency Dispatch',
                emergency_contact_phone: '112',
                blood_group: 'O+',
            },
            baseline: { hr: 68, spo2: 99.0, temp: 36.3, sys: 115, dia: 75, sleep: 480 },
            scenario: 'NORMAL',
            lat: 28.6289,
            lng: 77.2185,
        },
        {
            id: adminId,
            email: 'admin@heatguard.demo',
            full_name: 'Rajesh Verma',
            role: 'ADMIN',
            phone: '+91 99000 11223',
            profile: {
                age: 49,
                gender: 'Male',
                occupation: 'Systems Administrator & Sensor Grid Architect',
                work_environment: 'HQ Control Room',
                known_health_conditions: 'None',
                emergency_contact_name: 'Admin HQ',
                emergency_contact_phone: '+91 99000 99999',
                blood_group: 'A+',
            },
            baseline: { hr: 70, spo2: 98.0, temp: 36.4, sys: 120, dia: 80, sleep: 420 },
            scenario: 'NORMAL',
            lat: 28.6350,
            lng: 77.2250,
        },
        // Monitored Persons under Dr. Priya Nair
        {
            id: 'usr-demo-02',
            email: 'suresh.patel@heatguard.demo',
            full_name: 'Suresh Patel',
            role: 'WORKER',
            phone: '+91 98765 43211',
            profile: {
                age: 52,
                gender: 'Male',
                occupation: 'Highway Asphalt Worker',
                work_environment: 'Open Road Exposure',
                known_health_conditions: 'Borderline Hypertension',
                emergency_contact_name: 'Geeta Patel',
                emergency_contact_phone: '+91 98765 00001',
                blood_group: 'O+',
            },
            baseline: { hr: 75, spo2: 97.5, temp: 36.5, sys: 124, dia: 82, sleep: 420 },
            scenario: 'HEAT_WAVE',
            lat: 28.5800,
            lng: 77.2300,
        },
        {
            id: 'usr-demo-03',
            email: 'manoj.kumar@heatguard.demo',
            full_name: 'Manoj Kumar',
            role: 'WORKER',
            phone: '+91 98765 43212',
            profile: {
                age: 29,
                gender: 'Male',
                occupation: 'Warehouse & Logistics Courier',
                work_environment: 'Non-AC Cargo Hub',
                known_health_conditions: 'None',
                emergency_contact_name: 'Anita Kumar',
                emergency_contact_phone: '+91 98765 00002',
                blood_group: 'A+',
            },
            baseline: { hr: 70, spo2: 98.5, temp: 36.4, sys: 116, dia: 76, sleep: 440 },
            scenario: 'DEHYDRATION',
            lat: 28.6500,
            lng: 77.1800,
        },
        {
            id: 'usr-demo-04',
            email: 'sunita.rao@heatguard.demo',
            full_name: 'Sunita Rao',
            role: 'WORKER',
            phone: '+91 98765 43213',
            profile: {
                age: 41,
                gender: 'Female',
                occupation: 'Traffic Police Inspector',
                work_environment: 'High Traffic Junction',
                known_health_conditions: 'Mild Asthma',
                emergency_contact_name: 'Kishore Rao',
                emergency_contact_phone: '+91 98765 00003',
                blood_group: 'AB+',
            },
            baseline: { hr: 74, spo2: 98.0, temp: 36.4, sys: 118, dia: 78, sleep: 450 },
            scenario: 'AIR_POLLUTION',
            lat: 28.6250,
            lng: 77.2150,
        },
        {
            id: 'usr-demo-05',
            email: 'ramesh.gupta@heatguard.demo',
            full_name: 'Ramesh Gupta',
            role: 'WORKER',
            phone: '+91 98765 43214',
            profile: {
                age: 46,
                gender: 'Male',
                occupation: 'Night Shift Disaster Guard',
                work_environment: 'Outdoor Compound',
                known_health_conditions: 'Chronic sleep disruption',
                emergency_contact_name: 'Meena Gupta',
                emergency_contact_phone: '+91 98765 00004',
                blood_group: 'B-',
            },
            baseline: { hr: 72, spo2: 98.0, temp: 36.4, sys: 120, dia: 80, sleep: 420 },
            scenario: 'FATIGUE',
            lat: 28.6050,
            lng: 77.2450,
        },
        {
            id: 'usr-demo-06',
            email: 'dilip.verma@heatguard.demo',
            full_name: 'Dilip Verma',
            role: 'WORKER',
            phone: '+91 98765 43215',
            profile: {
                age: 58,
                gender: 'Male',
                occupation: 'Senior Grid Inspector',
                work_environment: 'Roof & Tower Installations',
                known_health_conditions: 'Mild Joint Stiffness',
                emergency_contact_name: 'Ravi Verma',
                emergency_contact_phone: '+91 98765 00005',
                blood_group: 'O-',
            },
            baseline: { hr: 76, spo2: 97.0, temp: 36.5, sys: 126, dia: 82, sleep: 400 },
            scenario: 'FALL',
            lat: 28.5900,
            lng: 77.2200,
        },
        {
            id: 'usr-demo-07',
            email: 'ananya.roy@heatguard.demo',
            full_name: 'Ananya Roy',
            role: 'WORKER',
            phone: '+91 98765 43216',
            profile: {
                age: 33,
                gender: 'Female',
                occupation: 'Emergency Drainage Engineer',
                work_environment: 'Underground Culvert & Pump Stations',
                known_health_conditions: 'None',
                emergency_contact_name: 'Deb Roy',
                emergency_contact_phone: '+91 98765 00006',
                blood_group: 'A-',
            },
            baseline: { hr: 70, spo2: 98.5, temp: 36.3, sys: 116, dia: 76, sleep: 450 },
            scenario: 'CRITICAL',
            lat: 28.5700,
            lng: 77.1950,
        },
        {
            id: 'usr-demo-08',
            email: 'vikram.singh@heatguard.demo',
            full_name: 'Vikram Singh',
            role: 'WORKER',
            phone: '+91 98765 43217',
            profile: {
                age: 36,
                gender: 'Male',
                occupation: 'Flood Relief Boat Navigator',
                work_environment: 'Riverine Inundation Zone',
                known_health_conditions: 'None',
                emergency_contact_name: 'Pooja Singh',
                emergency_contact_phone: '+91 98765 00007',
                blood_group: 'B+',
            },
            baseline: { hr: 68, spo2: 98.8, temp: 36.4, sys: 118, dia: 78, sleep: 460 },
            scenario: 'FLOOD',
            lat: 28.6700,
            lng: 77.2300,
        },
        {
            id: 'usr-demo-09',
            email: 'meera.devi@heatguard.demo',
            full_name: 'Meera Devi',
            role: 'WORKER',
            phone: '+91 98765 43218',
            profile: {
                age: 62,
                gender: 'Female',
                occupation: 'Coastal Community Caretaker',
                work_environment: 'Cyclone Shelter Perimeter',
                known_health_conditions: 'Mild Osteoarthritis',
                emergency_contact_name: 'Rohan Devi',
                emergency_contact_phone: '+91 98765 00008',
                blood_group: 'O+',
            },
            baseline: { hr: 78, spo2: 97.0, temp: 36.5, sys: 128, dia: 84, sleep: 410 },
            scenario: 'CYCLONE',
            lat: 28.6400,
            lng: 77.2600,
        },
    ];
    for (const acc of demoAccounts) {
        // 1. Insert User
        await (0, db_1.runQuery)(`INSERT INTO users (id, email, password_hash, full_name, role, phone)
       VALUES (?, ?, ?, ?, ?, ?)`, [acc.id, acc.email, defaultPasswordHash, acc.full_name, acc.role, acc.phone]);
        // 2. Insert User Profile
        await (0, db_1.runQuery)(`INSERT INTO user_profiles (id, user_id, age, gender, occupation, work_environment, known_health_conditions, emergency_contact_name, emergency_contact_phone, blood_group)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            (0, uuid_1.v4)(),
            acc.id,
            acc.profile.age,
            acc.profile.gender,
            acc.profile.occupation,
            acc.profile.work_environment,
            acc.profile.known_health_conditions,
            acc.profile.emergency_contact_name,
            acc.profile.emergency_contact_phone,
            acc.profile.blood_group,
        ]);
        // 3. Insert Baseline
        await (0, db_1.runQuery)(`INSERT INTO baselines (id, user_id, baseline_heart_rate, baseline_spo2, baseline_skin_temp, baseline_systolic, baseline_diastolic, typical_sleep_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            (0, uuid_1.v4)(),
            acc.id,
            acc.baseline.hr,
            acc.baseline.spo2,
            acc.baseline.temp,
            acc.baseline.sys,
            acc.baseline.dia,
            acc.baseline.sleep,
        ]);
        // 4. Insert Device
        const devId = `DEV-${acc.id.substring(4)}`;
        await (0, db_1.runQuery)(`INSERT INTO devices (id, user_id, device_name, device_model, hardware_platform, firmware_version, status, last_sync_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`, [
            devId,
            acc.id,
            `${acc.full_name}'s HeatGuard Band`,
            'HG-Edge-Pro-v2',
            'Qualcomm Dragonwing / ESP32',
            'v2.4.1-edge',
            'ONLINE',
        ]);
        // 5. Insert Privacy Settings
        await (0, db_1.runQuery)(`INSERT INTO privacy_settings (id, user_id, local_edge_ai_only, cloud_health_sync, location_sharing, caregiver_access, emergency_location_broadcast)
       VALUES (?, ?, 0, 1, 1, 1, 1)`, [(0, uuid_1.v4)(), acc.id]);
        // 6. If not caregiver/admin, grant caregiver relationship to Dr. Priya Nair
        if (acc.id !== caregiverId && acc.id !== adminId) {
            await (0, db_1.runQuery)(`INSERT INTO caregiver_relationships (id, user_id, caregiver_id, status, permission_level)
         VALUES (?, ?, ?, 'ACTIVE', 'FULL')`, [(0, uuid_1.v4)(), acc.id, caregiverId]);
        }
        // 7. Insert Location Record
        await (0, db_1.runQuery)(`INSERT INTO location_records (id, user_id, latitude, longitude, accuracy, source)
       VALUES (?, ?, ?, ?, 4.5, 'GPS_GNSS')`, [(0, uuid_1.v4)(), acc.id, acc.lat, acc.lng]);
        // 8. Generate Realistic Sensor Readings & 24h Time Series
        const profile = simulatedSensors_1.SCENARIO_PRESETS[acc.scenario];
        const now = Date.now();
        for (let i = 24; i >= 0; i--) {
            const timestamp = new Date(now - i * 3600 * 1000).toISOString();
            const hrVariance = (Math.random() - 0.5) * 4;
            const readingId = (0, uuid_1.v4)();
            const reading = {
                hr: Math.round(profile.baseHeartRate + hrVariance),
                spo2: Math.min(100, Math.round((profile.baseSpo2 + (Math.random() - 0.5) * 0.5) * 10) / 10),
                skinTemp: Math.round((profile.skinTemp + (Math.random() - 0.5) * 0.2) * 10) / 10,
                ambientTemp: Math.round((profile.ambientTemp + (Math.random() - 0.5) * 0.5) * 10) / 10,
                humidity: Math.round(profile.humidity),
                sys: profile.systolic + Math.round((Math.random() - 0.5) * 4),
                dia: profile.diastolic + Math.round((Math.random() - 0.5) * 2),
                activity: profile.activityState,
                aqi: profile.aqi,
                pm25: profile.pm25,
                exposure: Math.min(300, profile.exposureMinutes + (24 - i) * 5),
            };
            await (0, db_1.runQuery)(`INSERT INTO sensor_readings (id, user_id, device_id, heart_rate, spo2, skin_temperature, ambient_temperature, humidity, systolic, diastolic, is_bp_estimated, accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, activity_state, aqi, pm25, exposure_minutes, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                readingId,
                acc.id,
                devId,
                reading.hr,
                reading.spo2,
                reading.skinTemp,
                reading.ambientTemp,
                reading.humidity,
                reading.sys,
                reading.dia,
                profile.accelX,
                profile.accelY,
                profile.accelZ,
                profile.gyroX,
                profile.gyroY,
                profile.gyroZ,
                reading.activity,
                reading.aqi,
                reading.pm25,
                reading.exposure,
                timestamp,
            ]);
            // Compute Risk Assessment via EdgeRiskEngine
            const packet = {
                deviceId: devId,
                userId: acc.id,
                timestamp,
                heartRate: reading.hr,
                spo2: reading.spo2,
                skinTemperature: reading.skinTemp,
                ambientTemperature: reading.ambientTemp,
                humidity: reading.humidity,
                systolic: reading.sys,
                diastolic: reading.dia,
                isBpEstimated: true,
                accelX: profile.accelX,
                accelY: profile.accelY,
                accelZ: profile.accelZ,
                gyroX: profile.gyroX,
                gyroY: profile.gyroY,
                gyroZ: profile.gyroZ,
                activityState: reading.activity,
                aqi: reading.aqi,
                pm25: reading.pm25,
                latitude: acc.lat,
                longitude: acc.lng,
                exposureMinutes: reading.exposure,
                sleepMinutesEstimated: profile.sleepMinutes,
            };
            const userBaseline = {
                userId: acc.id,
                baselineHeartRate: acc.baseline.hr,
                baselineSpo2: acc.baseline.spo2,
                baselineSkinTemp: acc.baseline.temp,
                baselineSystolic: acc.baseline.sys,
                baselineDiastolic: acc.baseline.dia,
                typicalSleepMinutes: acc.baseline.sleep,
            };
            const risk = EdgeRiskEngine_1.EdgeRiskEngine.assessRisk(packet, userBaseline, 'DISASTER_HEAT_WAVE', 'EDGE_DEVICE_LOCAL');
            await (0, db_1.runQuery)(`INSERT INTO risk_assessments (id, user_id, reading_id, overall_score, overall_level, heat_risk, dehydration_risk, respiratory_risk, fatigue_risk, cardiovascular_risk, fall_risk, reasons, recommendations, is_fall_suspected, engine_location, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                (0, uuid_1.v4)(),
                acc.id,
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
            // Create alert if high or critical on the latest reading
            if (i === 0 && (risk.overallLevel === 'HIGH' || risk.overallLevel === 'CRITICAL' || acc.scenario === 'FALL')) {
                await (0, db_1.runQuery)(`INSERT INTO alerts (id, user_id, alert_type, severity, title, message, sensor_context, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                    (0, uuid_1.v4)(),
                    acc.id,
                    acc.scenario === 'FALL' ? 'FALL_DETECTED' : 'HIGH_HEAT_RISK',
                    risk.overallLevel === 'CRITICAL' || acc.scenario === 'FALL' ? 'CRITICAL' : 'HIGH',
                    acc.scenario === 'FALL' ? '⚠️ Possible Fall & Inactivity Event' : `⚠️ Elevated ${risk.overallLevel} Risk Alert`,
                    risk.reasons[0] || 'Abnormal physiological state detected.',
                    JSON.stringify({ hr: reading.hr, spo2: reading.spo2, temp: reading.skinTemp, risk: risk.overallScore }),
                    timestamp,
                ]);
                if (acc.scenario === 'FALL') {
                    await (0, db_1.runQuery)(`INSERT INTO emergency_events (id, user_id, event_type, status, latitude, longitude, vital_snapshot, caregiver_notified)
             VALUES (?, ?, 'FALL_DETECTED', 'PENDING_CONFIRMATION', ?, ?, ?, 1)`, [
                        (0, uuid_1.v4)(),
                        acc.id,
                        acc.lat,
                        acc.lng,
                        JSON.stringify({ hr: reading.hr, spo2: reading.spo2, temp: reading.skinTemp }),
                    ]);
                }
            }
        }
        // Insert 7-day sleep records
        for (let day = 7; day >= 1; day--) {
            const dateStr = new Date(now - day * 86400 * 1000).toISOString().split('T')[0];
            const duration = Math.round(profile.sleepMinutes + (Math.random() - 0.5) * 40);
            await (0, db_1.runQuery)(`INSERT INTO sleep_records (id, user_id, date, duration_minutes, is_estimated, sleep_quality, consistency_score)
         VALUES (?, ?, ?, ?, 1, ?, ?)`, [(0, uuid_1.v4)(), acc.id, dateStr, duration, duration > 400 ? 'Good' : 'Restless', duration > 400 ? 88 : 62]);
            await (0, db_1.runQuery)(`INSERT INTO activity_records (id, user_id, date, active_minutes, step_count, inactivity_minutes, strenuous_work_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [(0, uuid_1.v4)(), acc.id, dateStr, 220 + Math.round(Math.random() * 80), 8400 + Math.round(Math.random() * 2000), 320, 95]);
        }
    }
    // 2. Active Disaster Events
    await (0, db_1.runQuery)(`INSERT INTO disaster_events (id, event_type, title, severity, affected_region, description, guidelines, is_active)
     VALUES (?, 'HEAT_WAVE', 'IMD Red Heatwave Advisory', 'SEVERE', 'National Capital Region & Northern Plains',
     'Extreme surface temperatures exceeding 42°C with high afternoon humidity index. High risk of heat-exhaustion and thermal stroke for outdoor workforce.',
     ?, 1)`, [
        (0, uuid_1.v4)(),
        JSON.stringify([
            'Mandatory 15-minute shaded rest breaks every 45 minutes of heavy outdoor labor.',
            'Drink at least 3-4 liters of water/electrolytes throughout the shift.',
            'Immediately seek shade or air-conditioned shelter if heart rate exceeds 115 BPM resting.',
            'Keep wearable Edge-AI monitor active for real-time heat strain early warnings.',
        ]),
    ]);
    await (0, db_1.runQuery)(`INSERT INTO disaster_events (id, event_type, title, severity, affected_region, description, guidelines, is_active)
     VALUES (?, 'AIR_POLLUTION', 'Severe Air Quality Alert (Smog Event)', 'WARNING', 'Delhi-NCR & Gangetic Belt',
     'AQI exceeding 320 (PM2.5 > 250 µg/m³). High particulate concentration posing respiratory hazards for sensitive individuals and field workers.',
     ?, 1)`, [
        (0, uuid_1.v4)(),
        JSON.stringify([
            'Wear certified N95 / FFP2 respirators during all outdoor exposure.',
            'Avoid strenuous outdoor cardiovascular exertion during peak morning/evening smog hours.',
            'Keep SpO2 wearable monitoring active to detect early oxygenation drops.',
        ]),
    ]);
    // 3. Environmental Readings
    await (0, db_1.runQuery)(`INSERT INTO environmental_readings (id, latitude, longitude, ambient_temperature, humidity, heat_index, aqi, pm25, uv_index, weather_condition)
     VALUES (?, 28.6139, 77.2090, 41.2, 68.0, 48.5, 310, 240.0, 9.2, 'Intense Heat / Smog')`, [(0, uuid_1.v4)()]);
    console.log('✅ Database seeded successfully with 10 demo profiles, baselines, and historical time-series.');
}
if (require.main === module) {
    seedDatabase().catch((err) => {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    });
}
