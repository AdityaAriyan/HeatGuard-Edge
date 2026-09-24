/**
 * HeatGuard-Edge Hardware Abstraction Layer
 * Sensor interfaces designed for modular hardware compatibility
 * (MAX30102, MLX90614, SHT31/DHT22, MPU6050, BP, GPS/GNSS, Air Quality)
 */

export interface HeartRateSpO2Reading {
  heartRate: number; // BPM (beats per minute)
  spo2: number; // Percentage (e.g. 97.5%)
  confidence: number; // Signal quality index 0.0 - 1.0
  perfusionIndex?: number;
  timestamp: string;
}

export interface SkinTemperatureReading {
  skinTemperature: number; // Celsius (e.g. 36.6)
  ambientObjectTemp?: number; // Celsius
  sensorStatus: 'VALID' | 'CALIBRATING' | 'ERROR';
  timestamp: string;
}

export interface AmbientEnvironmentReading {
  ambientTemperature: number; // Celsius (e.g. 38.5)
  humidity: number; // Relative Humidity % (e.g. 75.0)
  heatIndex?: number; // Calculated Heat Index (°C)
  wetBulbTemp?: number; // Estimated WBGT (°C)
  timestamp: string;
}

export interface MotionMotionReading {
  accelX: number; // g (e.g. 0.02)
  accelY: number; // g
  accelZ: number; // g (e.g. 0.98)
  gyroX: number; // deg/s
  gyroY: number; // deg/s
  gyroZ: number; // deg/s
  magnitude: number; // Vector magnitude sqrt(x^2 + y^2 + z^2)
  activityState: 'RESTING' | 'NORMAL_WALK' | 'ACTIVE_WORK' | 'VIGOROUS' | 'INACTIVITY' | 'POSSIBLE_FALL';
  stepCount?: number;
  fallEventDetected?: boolean;
  timestamp: string;
}

export interface BloodPressureReading {
  systolic: number; // mmHg (e.g. 120)
  diastolic: number; // mmHg (e.g. 80)
  isEstimated: boolean; // MUST be true if estimated from PPG/Pulse Transit Time
  estimationMethod?: 'OSCILLOMETRIC_CUFF' | 'PPG_PTT_ESTIMATE' | 'CALIBRATED_WAVEFORM';
  label: 'Measured BP' | 'Estimated BP';
  timestamp: string;
}

export interface LocationReading {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number; // meters
  speed?: number; // m/s
  source: 'GPS_GNSS' | 'CELL_TOWER' | 'BROWSER_GEOLOCATION' | 'SIMULATOR';
  timestamp: string;
}

export interface AirQualityReading {
  aqi: number; // 0-500 scale
  pm25: number; // ug/m3
  pm10?: number; // ug/m3
  co2?: number; // ppm
  category: 'GOOD' | 'MODERATE' | 'UNHEALTHY_FOR_SENSITIVE' | 'UNHEALTHY' | 'VERY_UNHEALTHY' | 'HAZARDOUS';
  timestamp: string;
}

/**
 * Unified Raw Sensor Packet from Wearable Edge
 */
export interface EdgeSensorPacket {
  deviceId: string;
  userId: string;
  timestamp: string;
  heartRate: number;
  spo2: number;
  skinTemperature: number;
  ambientTemperature: number;
  humidity: number;
  systolic: number;
  diastolic: number;
  isBpEstimated: boolean;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  activityState: 'RESTING' | 'NORMAL_WALK' | 'ACTIVE_WORK' | 'VIGOROUS' | 'INACTIVITY' | 'POSSIBLE_FALL';
  aqi: number;
  pm25: number;
  latitude: number;
  longitude: number;
  exposureMinutes: number;
  sleepMinutesEstimated?: number;
}
