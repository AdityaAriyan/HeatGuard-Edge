import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PrivacySettings } from '../types';
import { ShieldCheck, Lock, Eye, MapPin, Users, HardDrive, CheckCircle2, AlertCircle } from 'lucide-react';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

export const PrivacyCenterPage: React.FC = () => {
  const { privacy, refreshUserData } = useAuth();
  const [settings, setSettings] = useState<Partial<PrivacySettings>>({
    local_edge_ai_only: privacy?.local_edge_ai_only || 0,
    cloud_health_sync: privacy?.cloud_health_sync ?? 1,
    location_sharing: privacy?.location_sharing ?? 1,
    caregiver_access: privacy?.caregiver_access ?? 1,
    emergency_location_broadcast: privacy?.emergency_location_broadcast ?? 1,
    anonymous_analytics: privacy?.anonymous_analytics || 0,
  });
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');

  useEffect(() => {
    if (privacy) {
      setSettings(privacy);
    }
  }, [privacy]);

  const handleToggle = (key: keyof PrivacySettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1,
    }));
  };

  const handleSave = async () => {
    setSaveStatus('SAVING');
    try {
      await api.updatePrivacySettings(settings);
      await refreshUserData();
      setSaveStatus('SAVED');
      setTimeout(() => setSaveStatus('IDLE'), 3000);
    } catch (err) {
      console.error('Failed to save privacy preferences:', err);
      setSaveStatus('IDLE');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Privacy Center & Edge Controls</h1>
          <p className="text-xs text-zinc-400">
            Granular data sovereignty, on-device Edge-AI preferences, and caregiver access permissions
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saveStatus === 'SAVING'}
          className="btn-primary !text-xs !py-1.5"
        >
          {saveStatus === 'SAVED' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Preferences Saved</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{saveStatus === 'SAVING' ? 'Saving...' : 'Save Privacy Preferences'}</span>
            </>
          )}
        </button>
      </div>

      <MedicalDisclaimer />

      {/* Main Privacy Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local Edge-AI Execution Priority */}
        <div className="glass-panel p-6 border border-white/10 flex flex-col justify-between">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Local-Only Health Analysis (Edge First)</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Execute all physiological anomaly detection and risk scoring directly on the wearable or smartphone processor without sending raw waveforms to remote cloud servers.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-xs font-mono text-zinc-400">Edge Processing:</span>
            <button
              onClick={() => handleToggle('local_edge_ai_only')}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.local_edge_ai_only ? 'bg-cyan-600' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.local_edge_ai_only ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Cloud Health Telemetry Synchronization */}
        <div className="glass-panel p-6 border border-white/10 flex flex-col justify-between">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cloud Health Telemetry Sync</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Allow processed risk scores and sensor summary records to sync to secure backend database for historical longitudinal analysis.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-xs font-mono text-zinc-400">Cloud Sync:</span>
            <button
              onClick={() => handleToggle('cloud_health_sync')}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.cloud_health_sync ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.cloud_health_sync ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Real-time Location Sharing */}
        <div className="glass-panel p-6 border border-white/10 flex flex-col justify-between">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Continuous Location Sharing</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Share live coordinates with authorized disaster coordinators and field supervisors. If disabled, location is only broadcasted upon SOS.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-xs font-mono text-zinc-400">GPS Sharing:</span>
            <button
              onClick={() => handleToggle('location_sharing')}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.location_sharing ? 'bg-emerald-600' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.location_sharing ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Authorized Caregiver Access */}
        <div className="glass-panel p-6 border border-white/10 flex flex-col justify-between">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Authorized Caregiver Triage Access</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Grant permission for Dr. Priya Nair (Lead Caregiver) to inspect your vital safety telemetry during active working shifts.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-xs font-mono text-zinc-400">Caregiver Access:</span>
            <button
              onClick={() => handleToggle('caregiver_access')}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.caregiver_access ? 'bg-amber-600' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.caregiver_access ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
