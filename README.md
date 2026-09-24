# HEATGUARD-EDGE

### Privacy-Preserving Personal Health Companion + Edge-AI Disaster Monitoring Platform

> **“Understand your health. Understand your environment. Detect risk early. Stay protected even when connectivity fails.”**

---

## 🛡️ Executive Summary & Product Vision

**HeatGuard-Edge** is a privacy-preserving Personal Health Companion and Edge-AI monitoring platform designed specifically for vulnerable populations during extreme weather and environmental emergencies across India and global climate hot-zones:

* **Extreme Heat Waves & Hyperthermia**
* **Urban & Rural Inundation / Floods**
* **Severe Cyclonic Storms**
* **Hazardous Smog & Severe Air Pollution (AQI > 300)**
* **Disaster Response & Occupational Labor Safety**

Unlike generic fitness dashboards or cloud-only health trackers, HeatGuard-Edge features an **on-device Edge-AI Risk Engine** that computes real-time physiological stress scores directly on wearable hardware or client devices without requiring internet connectivity.

---

## ⚡ Core Pillars & Answers to the 4 Fundamental Questions

1. **How am I doing?**
   * Real-time physiological status: Heart Rate, SpO₂, Skin Temperature, Blood Pressure (Measured/Estimated), Motion activity, and Sleep recovery.
2. **Why might I be at risk?**
   * Feature-attributed explainable AI showing exact contributions: Personal baseline deviation (+30 BPM above baseline), ambient Heat Index (48°C apparent feel), continuous outdoor exposure time, and particulate pollution.
3. **What should I do?**
   * Context-aware personalized safety recommendations: *"Take a 15-minute shaded rest break, hydrate with 500ml electrolytes, and wear an N95 respirator."*
4. **What happens if something goes wrong?**
   * Immediate local OLED/buzzer alarm, 15-second fall-detection cancellation countdown ("Are you okay? [I'M OK] [SEND SOS]"), and automatic distress dispatch to authorized caregivers with live GPS coordinates.

---

## 🏥 Important Medical & Regulatory Disclaimers

> **IMPORTANT NOTICE:** HeatGuard-Edge is an experimental early-warning and safety-monitoring prototype. It is **not a medical diagnostic device** and should not replace professional medical evaluation or clinical triage. Risk scores and hazard indicators represent prototype safety estimations.
> 
> * **Blood Pressure**: Computed via modular `BloodPressureSensor` interface. Any estimates derived from PPG/PTT are explicitly labeled **`Estimated BP`**.
> * **Motion & Falls**: MPU6050 is utilized exclusively for 3-axis motion, orientation tilt, inactivity, and impact detection (never as GPS).
> * **Sleep Duration**: Estimated from overnight stillness and motion heuristics.

---

## 🏗️ System Architecture

```
                       WEARABLE SENSORS / SIMULATOR
   MAX30102 (HR/SpO2) | MLX90614 (Skin Temp) | SHT31/DHT22 (Ambient) | MPU6050 (3-Axis)
                                    │
                                    ▼
                     EDGE-AI / LOCAL RISK ENGINE
        • Personal Baseline Deviation Model (HR, SpO2, Temp, BP vs Calib)
        • Multi-Factor Risk Assessment (Heat, Dehydration, Resp, Fatigue)
        • MPU6050 Fall Detection & Inactivity State Machine (15s Window)
        • Local OLED + Audio Buzzer Alert (Immediate On-Device Alarm)
        • Offline Local Storage Queue (Zero-Latency Protection)
                                    │
                                    ▼ (Optional / When Online)
                     REST API + WEBSOCKET DATA LAYER
        • Node.js + Express + TypeScript + SQLite Relational Database (19 Entities)
        • Realtime Telemetry Broadcast & Emergency Distress Dispatch
        • Privacy Permission & Caregiver Access Control List (ACL)
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
         PERSONAL COMPANION                  CARE & SAFETY MONITOR
    • "Am I Safe Right Now?" Hero       • Multi-Person Triage Summary
    • Personal Risk Center (6 Vectors)  • Live Searchable Roster Table
    • Disaster Mode (User A vs B)       • Person Deep-Dive Telemetry
    • Emergency SOS & GPS Broadcast     • Priority Alert Acknowledgement
    • Granular Privacy Center           • Longitudinal Health Analytics
```

---

## 🔬 Mathematical Risk Models & Edge Algorithms

The `EdgeRiskEngine` executes zero-dependency deterministic and heuristic models:

### 1. Personal Baseline Normalization
Every user possesses a personalized baseline calibrated during onboarding:
$$\Delta \text{HR} = \text{HR}_{\text{current}} - \text{HR}_{\text{baseline}}$$
$$\Delta \text{SkinTemp} = \text{Temp}_{\text{current}} - \text{Temp}_{\text{baseline}}$$
$$\Delta \text{SpO}_2 = \text{SpO}_{2,\text{baseline}} - \text{SpO}_{2,\text{current}}$$

### 2. Apparent Heat Index & Heat Stress
Calculates apparent thermal load based on ambient dry-bulb temperature ($T$) and relative humidity ($R$):
$$\text{Heat Risk Score} = f(\text{Heat Index}, \Delta\text{SkinTemp}, \Delta\text{HR}, \text{Exposure Minutes})$$

### 3. Dehydration Risk Index
Correlates elevated heart rate drift without muscular recovery under sustained high ambient heat and vigorous work output.

### 4. Respiratory Stress Indicator
Correlates environmental particulate concentration ($\text{AQI}, \text{PM2.5}$) with personal blood oxygen saturation drops ($\Delta\text{SpO}_2 \ge 3\%$).

### 5. Fall Impact & Inactivity State Machine
Evaluates instantaneous 3-axis accelerometer vector magnitude:
$$\|a\| = \sqrt{a_x^2 + a_y^2 + a_z^2} > 2.8g$$
Followed by angular gyroscope tilt change $> 60^\circ$ and subsequent immobility $< 0.15g$ for $> 5$ seconds.

---

## 🗄️ Database Architecture (19 Relational Entities)

Implemented with SQLite / WebAssembly for rock-solid zero-compilation local execution:
1. `users` – User identity and role (`WORKER`, `CAREGIVER`, `ADMIN`).
2. `user_profiles` – Demographics, occupation, emergency contacts, blood group.
3. `caregiver_relationships` – ACL access permissions between workers and supervisors.
4. `baselines` – Calibrated personal baseline values (HR, SpO2, Temp, BP, Sleep).
5. `devices` – Wearable hardware profiles (Dragonwing, Arduino UNO Q, ESP32).
6. `device_connections` – Connection telemetry (BLE, WiFi, Battery %, Signal).
7. `sensor_readings` – High-frequency raw sensor packets (MAX30102, MLX90614, MPU6050, BP, SHT31).
8. `risk_assessments` – Processed Edge-AI risk scores and level classifications.
9. `risk_events` – Escalated hazard events.
10. `alerts` – In-app and on-device safety notifications with acknowledgment tracking.
11. `emergency_events` – SOS triggers, fall events, resolution state.
12. `location_records` – GPS/GNSS coordinates with privacy timestamps.
13. `environmental_readings` – Hyperlocal ambient weather and AQI records.
14. `disaster_events` – Active regional disaster declarations (Heat Wave, Flood, Cyclone, AQI).
15. `sleep_records` – Estimated sleep duration and consistency scores.
16. `activity_records` – Steps, active minutes, and inactivity metrics.
17. `exposure_sessions` – Cumulative outdoor environmental exposure logs.
18. `privacy_settings` – Granular user-controlled privacy toggles.
19. `sync_queues` – Offline-first transaction logs and batch sync auditing.

---

## 🔑 Demo Personas & Credentials

| Role | Name | Email | Password | Scenario |
| :--- | :--- | :--- | :--- | :--- |
| **Worker (User)** | Arun Sharma | `user@heatguard.demo` | `HeatGuard@123` | Normal Healthy Baseline |
| **Caregiver** | Dr. Priya Nair | `caregiver@heatguard.demo` | `HeatGuard@123` | Disaster Lead / Triage Ops |
| **Admin** | Rajesh Verma | `admin@heatguard.demo` | `HeatGuard@123` | Grid Architect & Dispatch |
| **Worker** | Suresh Patel | `suresh.patel@heatguard.demo` | `HeatGuard@123` | Extreme Heat Wave (High Risk) |
| **Worker** | Manoj Kumar | `manoj.kumar@heatguard.demo` | `HeatGuard@123` | Dehydration Risk |
| **Worker** | Sunita Rao | `sunita.rao@heatguard.demo` | `HeatGuard@123` | Air Pollution / Smog (AQI 345) |
| **Worker** | Dilip Verma | `dilip.verma@heatguard.demo` | `HeatGuard@123` | Fall & Inactivity Event |
| **Worker** | Ananya Roy | `ananya.roy@heatguard.demo` | `HeatGuard@123` | Multi-Factor Critical Emergency |
| **Worker** | Vikram Singh | `vikram.singh@heatguard.demo` | `HeatGuard@123` | Urban Flood Inundation |
| **Worker** | Meera Devi | `meera.devi@heatguard.demo` | `HeatGuard@123` | Cyclonic Storm Advisory |

---

## 🚀 Quickstart & Running Locally

### Prerequisites
* Node.js v18+ (tested on Node v24.11.1)
* npm v10+

### 1. Start Backend Server
```bash
cd backend
npm install
npm run seed     # Seeds database with 10 demo profiles & 24h history
npm run dev      # Starts HTTP server on port 5000 + WebSocket on ws://localhost:5000/ws
```

### 2. Start Frontend Web Application
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

### 3. Run Backend Unit Tests
```bash
cd backend
npm test         # Executes Jest test suite covering EdgeRiskEngine mathematical models
```

---

## 📱 Hardware Integration Guide (Qualcomm Dragonwing / Arduino UNO Q / ESP32)

Real microcontrollers stream JSON packets directly to the ingestion API:

```http
POST /api/sensors/readings
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "deviceId": "DEV-ESP32-Q01",
  "userId": "usr-demo-worker-01",
  "heartRate": 108,
  "spo2": 96.5,
  "skinTemperature": 38.2,
  "ambientTemperature": 41.0,
  "humidity": 68,
  "systolic": 132,
  "diastolic": 84,
  "isBpEstimated": true,
  "accelX": 0.05,
  "accelY": 0.12,
  "accelZ": 0.98,
  "gyroX": 15,
  "gyroY": 10,
  "gyroZ": 8,
  "activityState": "ACTIVE_WORK",
  "aqi": 185,
  "pm25": 140,
  "latitude": 28.6139,
  "longitude": 77.2090,
  "exposureMinutes": 120
}
```

---

## 📄 License & Intellectual Property
Designed and developed for privacy-first disaster resilience and occupational health monitoring.
Experimental early-warning architecture.
