import React, { useState } from 'react';
import { api } from '../services/api';
import { Server, Cpu, Flame, ShieldAlert, CheckCircle2, Radio, HardDrive } from 'lucide-react';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

export const AdminCenterPage: React.FC = () => {
  const [disasterType, setDisasterType] = useState<string>('HEAT_WAVE');
  const [disasterTitle, setDisasterTitle] = useState<string>('IMD Extreme Heatwave Red Alert');
  const [severity, setSeverity] = useState<string>('SEVERE');
  const [region, setRegion] = useState<string>('National Capital Region & Northern Plains');
  const [broadcastStatus, setBroadcastStatus] = useState<string>('');

  const handleTriggerDisaster = async () => {
    setBroadcastStatus('Broadcasting...');
    try {
      await api.simulateDisaster({
        event_type: disasterType,
        title: disasterTitle,
        severity,
        affected_region: region,
      });
      setBroadcastStatus('Disaster event broadcasted to all units!');
      setTimeout(() => setBroadcastStatus(''), 4000);
    } catch (err) {
      console.error('Failed to trigger disaster:', err);
      setBroadcastStatus('Failed to trigger disaster');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
            SYSTEM GRID & ADMIN OPS
          </span>
        </div>
        <h1 className="text-2xl font-bold font-display text-white">System Administration</h1>
        <p className="text-xs text-zinc-400">
          Sensor grid infrastructure, edge device telemetry gateway, and civil defense simulation manager
        </p>
      </div>

      <MedicalDisclaimer />

      {/* Grid Infrastructure Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Gateway Cluster</span>
            <Server className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">HG-GRID-NORTH-01</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Operational (10 Nodes)
          </div>
        </div>

        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Database Persistence</span>
            <HardDrive className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">SQLite WebAssembly</div>
          <div className="text-[11px] text-cyan-400 font-mono mt-2">19 Relational Entities</div>
        </div>

        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Edge Risk Engine</span>
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">v2.4.0 Zero-Latency</div>
          <div className="text-[11px] text-zinc-400 font-mono mt-2">Dual Edge/Cloud Evaluation</div>
        </div>
      </div>

      {/* Civil Defense Disaster Simulator Trigger */}
      <div className="glass-panel p-6 border border-white/10">
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-6">
          <Flame className="w-5 h-5 text-orange-400" />
          <div>
            <h2 className="text-base font-bold font-display text-white">Civil Defense Disaster Simulator</h2>
            <p className="text-xs text-zinc-400">Broadcast region-wide disaster warnings across all registered devices</p>
          </div>
        </div>

        <div className="space-y-4 max-w-2xl text-xs font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 block mb-1">Disaster Event Type:</label>
              <select
                value={disasterType}
                onChange={(e) => {
                  setDisasterType(e.target.value);
                  setDisasterTitle(`IMD ${e.target.value.replace('_', ' ')} Warning`);
                }}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="HEAT_WAVE">Heat Wave</option>
                <option value="FLOOD">Flash Flood</option>
                <option value="CYCLONE">Severe Cyclonic Storm</option>
                <option value="AIR_POLLUTION">Severe Air Pollution (Smog)</option>
                <option value="EXTREME_WEATHER">Extreme Weather Alert</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Severity Level:</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ADVISORY">Advisory</option>
                <option value="WARNING">Warning</option>
                <option value="SEVERE">Severe Alert</option>
                <option value="EMERGENCY">Emergency Declaration</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">Alert Headline / Title:</label>
            <input
              type="text"
              value={disasterTitle}
              onChange={(e) => setDisasterTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">Target Affected Region:</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex items-center gap-4">
            <button onClick={handleTriggerDisaster} className="btn-primary">
              <Radio className="w-4 h-4" />
              <span>Broadcast Disaster Warning</span>
            </button>
            {broadcastStatus && <span className="text-xs text-emerald-400 font-semibold">{broadcastStatus}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
