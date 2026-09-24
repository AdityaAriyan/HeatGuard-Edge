import { PersonalDashboardData, CaregiverDashboardData, SafetyAlert, DisasterEvent, PrivacySettings } from '../types';
import { EdgeSensorPacket } from '../edge/sensors/interfaces';
import { RiskAssessmentResult } from '../edge/risk-engine/EdgeRiskEngine';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('hg_auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('hg_auth_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('hg_auth_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network response was not ok' }));
    throw new Error(errorData.error || errorData.message || `Request failed (${response.status})`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<{ user: any; profile: any; baseline: any; privacy: any; device: any }>('/auth/me'),

  getDemoUsers: () => request<any[]>('/auth/demo-users'),

  // Dashboards
  getPersonalDashboard: () => request<PersonalDashboardData>('/dashboard/personal'),
  getCaregiverDashboard: () => request<CaregiverDashboardData>('/dashboard/caregiver'),

  // Sensors & Telemetry
  ingestSensorReading: (packet: EdgeSensorPacket) =>
    request<{ message: string; readingId: string; riskAssessment: RiskAssessmentResult }>('/sensors/readings', {
      method: 'POST',
      body: JSON.stringify(packet),
    }),

  getLatestSensorReading: (userId?: string) =>
    request<{ reading: any; location: any }>(userId ? `/sensors/latest/${userId}` : '/sensors/latest'),

  getSensorHistory: (userId?: string, limit = 30) =>
    request<any[]>(userId ? `/sensors/history/${userId}?limit=${limit}` : `/sensors/history?limit=${limit}`),

  // Risk
  getCurrentRisk: (userId?: string) =>
    request<any>(userId ? `/risk/current/${userId}` : '/risk/current'),

  getRiskHistory: (userId?: string, limit = 30) =>
    request<any[]>(userId ? `/risk/history/${userId}?limit=${limit}` : `/risk/history?limit=${limit}`),

  // Alerts
  getAlerts: (userId?: string) =>
    request<SafetyAlert[]>(userId ? `/alerts?userId=${userId}` : '/alerts'),

  acknowledgeAlert: (alertId: string) =>
    request<{ message: string; id: string }>(`/alerts/${alertId}/acknowledge`, { method: 'POST' }),

  // Emergency & SOS
  triggerSos: (payload: { latitude?: number; longitude?: number; reason?: string; userId?: string }) =>
    request<{ message: string; event: any }>('/emergency/sos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cancelEmergency: (eventId: string) =>
    request<{ message: string }>(`/emergency/cancel/${eventId}`, { method: 'POST' }),

  getEmergencyHistory: (userId?: string) =>
    request<any[]>(userId ? `/emergency/history?userId=${userId}` : '/emergency/history'),

  // Location
  updateLocation: (latitude: number, longitude: number) =>
    request<{ message: string }>('/location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    }),

  // Environment & Disaster
  getCurrentEnvironment: () => request<any>('/environment/current'),
  getActiveDisasters: () => request<DisasterEvent[]>('/disasters/active'),
  simulateDisaster: (payload: any) =>
    request<any>('/disasters/simulate', { method: 'POST', body: JSON.stringify(payload) }),

  // Privacy
  getPrivacySettings: () => request<PrivacySettings>('/privacy/settings'),
  updatePrivacySettings: (settings: Partial<PrivacySettings>) =>
    request<{ message: string; settings: PrivacySettings }>('/privacy/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Sync
  syncOfflineData: (payload: { readings: EdgeSensorPacket[]; offlineSosEvents?: any[] }) =>
    request<{ message: string; synchronizedCount: number; syncedAt: string }>('/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Simulator Controls
  getSimulatorStatus: () => request<any>('/simulator/status'),
  setSimulatorScenario: (userId: string, scenario: string) =>
    request<any>('/simulator/scenario', {
      method: 'POST',
      body: JSON.stringify({ userId, scenario }),
    }),
};
