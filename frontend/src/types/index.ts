import { EdgeSensorPacket } from '../edge/sensors/interfaces';
import { RiskAssessmentResult, RiskLevel, UserBaseline } from '../edge/risk-engine/EdgeRiskEngine';
import { ScenarioType } from '../edge/sensors/simulatedSensors';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'WORKER' | 'USER' | 'CAREGIVER' | 'ADMIN';
  phone?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  age?: number;
  gender?: string;
  occupation?: string;
  work_environment?: string;
  known_health_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_group?: string;
}

export interface PrivacySettings {
  id: string;
  user_id: string;
  local_edge_ai_only: number;
  cloud_health_sync: number;
  location_sharing: number;
  caregiver_access: number;
  emergency_location_broadcast: number;
  anonymous_analytics: number;
}

export interface SafetyAlert {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  alert_type: string;
  severity: 'INFO' | 'CAUTION' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  sensor_context?: any;
  acknowledged: number;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

export interface DisasterEvent {
  id: string;
  event_type: 'HEAT_WAVE' | 'FLOOD' | 'CYCLONE' | 'AIR_POLLUTION' | 'EXTREME_WEATHER';
  title: string;
  severity: 'ADVISORY' | 'WARNING' | 'SEVERE' | 'EMERGENCY';
  affected_region: string;
  description: string;
  guidelines: string[];
  is_active: number;
  started_at: string;
  ended_at?: string;
}

export interface PersonalDashboardData {
  user: User;
  profile: UserProfile;
  baseline: {
    baseline_heart_rate: number;
    baseline_spo2: number;
    baseline_skin_temp: number;
    baseline_systolic: number;
    baseline_diastolic: number;
    typical_sleep_minutes: number;
  };
  vitals: {
    heartRate: number;
    spo2: number;
    skinTemperature: number;
    systolic: number;
    diastolic: number;
    isBpEstimated: boolean;
    activityState: string;
    exposureMinutes: number;
    timestamp: string;
  } | null;
  environment: {
    ambientTemperature: number;
    humidity: number;
    aqi: number;
    pm25: number;
  } | null;
  riskAssessment: {
    overall_score: number;
    overall_level: RiskLevel;
    heat_risk: number;
    dehydration_risk: number;
    respiratory_risk: number;
    fatigue_risk: number;
    cardiovascular_risk: number;
    fall_risk: number;
    reasons: string[];
    recommendations: string[];
    timestamp: string;
  } | null;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  };
  aiInsight: string;
  recommendations: string[];
  activeAlerts: SafetyAlert[];
  activeDisaster: DisasterEvent | null;
  sleep?: any;
  activity?: any;
}

export interface CaregiverMonitoredPerson {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  occupation?: string;
  workEnvironment?: string;
  age?: number;
  bloodGroup?: string;
  baseline: {
    heartRate: number;
    spo2: number;
    skinTemp: number;
    systolic: number;
    diastolic: number;
  };
  currentVitals: {
    heartRate: number;
    spo2: number;
    skinTemperature: number;
    systolic: number;
    diastolic: number;
    isBpEstimated: boolean;
    activityState: string;
    ambientTemperature: number;
    humidity: number;
    aqi: number;
    pm25: number;
    exposureMinutes: number;
    timestamp: string;
  } | null;
  risk: {
    overallScore: number;
    overallLevel: RiskLevel;
    heatRisk: number;
    dehydrationRisk: number;
    respiratoryRisk: number;
    fatigueRisk: number;
    cardiovascularRisk: number;
    fallRisk: number;
    reasons: string[];
    recommendations: string[];
    timestamp: string;
  } | null;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  } | null;
  activeAlertsCount: number;
  hasEmergency: boolean;
}

export interface CaregiverDashboardData {
  summary: {
    totalMonitored: number;
    lowCount: number;
    cautionCount: number;
    highCount: number;
    criticalCount: number;
  };
  people: CaregiverMonitoredPerson[];
  alerts: SafetyAlert[];
  activeDisasters: DisasterEvent[];
}
