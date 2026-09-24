import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CaregiverDashboardData, CaregiverMonitoredPerson, SafetyAlert } from '../types';
import {
  Users,
  AlertTriangle,
  Siren,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Heart,
  Thermometer,
  Activity,
  X,
  ShieldCheck,
} from 'lucide-react';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

export const CaregiverSafetyMonitor: React.FC = () => {
  const [data, setData] = useState<CaregiverDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [selectedPerson, setSelectedPerson] = useState<CaregiverMonitoredPerson | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.getCaregiverDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load caregiver dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const timer = setInterval(fetchDashboard, 4000); // 4-second live polling fallback
    return () => clearInterval(timer);
  }, []);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId);
      await fetchDashboard();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const filteredPeople = (data?.people || []).filter((person) => {
    const matchesSearch =
      person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.workEnvironment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk =
      riskFilter === 'ALL' || (person.risk && person.risk.overallLevel === riskFilter);

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
              CAREGIVER & SUPERVISOR OPERATIONS
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Care & Safety Monitor</h1>
          <p className="text-xs text-zinc-400">
            Real-time occupational triage and physiological hazard monitoring for vulnerable personnel
          </p>
        </div>

        <button onClick={fetchDashboard} className="btn-outline !text-xs !py-1.5">
          <span>Refresh Live Grid</span>
        </button>
      </div>

      <MedicalDisclaimer />

      {/* Triage Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Monitored */}
        <div className="glass-panel p-4 border border-white/10 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-zinc-400">Total Monitored</div>
          <div className="text-3xl font-extrabold font-display text-white mt-1">
            {data?.summary.totalMonitored || 10}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-1">Active Personnel</div>
        </div>

        {/* Low Risk */}
        <div className="glass-panel p-4 border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-emerald-300">🟢 Low Risk</div>
          <div className="text-3xl font-extrabold font-display text-emerald-400 mt-1">
            {data?.summary.lowCount || 4}
          </div>
          <div className="text-[10px] text-emerald-500/80 font-mono mt-1">Nominal Vitals</div>
        </div>

        {/* Caution */}
        <div className="glass-panel p-4 border border-amber-500/30 bg-amber-950/10 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-amber-300">🟡 Caution</div>
          <div className="text-3xl font-extrabold font-display text-amber-400 mt-1">
            {data?.summary.cautionCount || 3}
          </div>
          <div className="text-[10px] text-amber-500/80 font-mono mt-1">Mild Elevation</div>
        </div>

        {/* High Risk */}
        <div className="glass-panel p-4 border border-orange-500/30 bg-orange-950/10 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-orange-300">🟠 High Risk</div>
          <div className="text-3xl font-extrabold font-display text-orange-400 mt-1">
            {data?.summary.highCount || 2}
          </div>
          <div className="text-[10px] text-orange-500/80 font-mono mt-1">Thermal / Resp Strain</div>
        </div>

        {/* Critical Risk */}
        <div className="glass-panel p-4 border border-red-500/40 bg-red-950/20 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-red-300">🔴 Critical Risk</div>
          <div className="text-3xl font-extrabold font-display text-red-400 mt-1">
            {data?.summary.criticalCount || 1}
          </div>
          <div className="text-[10px] text-red-400 font-mono mt-1 animate-pulse">Immediate Triage</div>
        </div>
      </div>

      {/* Active Unacknowledged Alerts Banner */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="glass-panel p-5 border border-red-500/40 bg-red-950/20">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-red-300 uppercase tracking-wider mb-3">
            <Siren className="w-4 h-4 animate-spin" />
            <span>Active Priority Safety Alerts ({data.alerts.length})</span>
          </div>

          <div className="space-y-2.5">
            {data.alerts.slice(0, 3).map((al) => (
              <div
                key={al.id}
                className="p-3 rounded-xl bg-black/40 border border-red-500/30 flex items-center justify-between text-xs gap-3"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="text-red-400 font-mono">{al.title}</span>
                    <span className="text-zinc-400">({al.user_name || 'Worker'})</span>
                  </div>
                  <div className="text-zinc-300 text-[11px]">{al.message}</div>
                </div>

                <button
                  onClick={() => handleAcknowledgeAlert(al.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold flex-shrink-0 transition"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Monitoring Table Section */}
      <div className="glass-panel p-6 border border-white/10">
        {/* Search & Risk Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search person name, occupation, or site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Risk Level Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            {['ALL', 'CRITICAL', 'HIGH', 'CAUTION', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  riskFilter === lvl
                    ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Person Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 font-mono uppercase text-[10px]">
                <th className="pb-3 font-semibold">Person</th>
                <th className="pb-3 font-semibold">Overall Risk</th>
                <th className="pb-3 font-semibold">Heart Rate</th>
                <th className="pb-3 font-semibold">SpO₂</th>
                <th className="pb-3 font-semibold">Skin Temp</th>
                <th className="pb-3 font-semibold">Environment</th>
                <th className="pb-3 font-semibold">Activity</th>
                <th className="pb-3 font-semibold">Location</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPeople.map((person) => {
                const overallLevel = person.risk?.overallLevel || 'LOW';
                const isCrit = overallLevel === 'CRITICAL';
                return (
                  <tr
                    key={person.id}
                    className={`hover:bg-white/5 transition-colors cursor-pointer ${
                      isCrit ? 'bg-red-950/10' : ''
                    }`}
                    onClick={() => setSelectedPerson(person)}
                  >
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-white">{person.fullName}</div>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[140px]">
                        {person.occupation || 'Field Personnel'}
                      </div>
                    </td>

                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono badge-risk-${overallLevel.toLowerCase()}`}>
                        {overallLevel} ({person.risk?.overallScore || 0})
                      </span>
                    </td>

                    <td className="py-3 pr-4 font-mono font-semibold text-white">
                      {person.currentVitals?.heartRate || '--'} <span className="text-[10px] text-zinc-500">BPM</span>
                    </td>

                    <td className="py-3 pr-4 font-mono font-semibold text-white">
                      {person.currentVitals?.spo2 || '--'}%
                    </td>

                    <td className="py-3 pr-4 font-mono font-semibold text-white">
                      {person.currentVitals?.skinTemperature || '--'}°C
                    </td>

                    <td className="py-3 pr-4 font-mono text-zinc-300">
                      {person.currentVitals?.ambientTemperature || '--'}°C / AQI {person.currentVitals?.aqi || '--'}
                    </td>

                    <td className="py-3 pr-4 text-zinc-400 font-mono text-[11px]">
                      {person.currentVitals?.activityState || 'NORMAL'}
                    </td>

                    <td className="py-3 pr-4 text-zinc-400 text-[11px]">
                      {person.location ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono">
                          <MapPin className="w-3 h-3" /> Live
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-mono">Private</span>
                      )}
                    </td>

                    <td className="py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPerson(person);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-[11px] font-mono transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Person Deep Dive Drawer / Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel max-w-3xl w-full p-6 border-white/20 bg-[#090d16] max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedPerson(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                {selectedPerson.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-white">{selectedPerson.fullName}</h2>
                <p className="text-xs text-zinc-400">
                  {selectedPerson.occupation} | {selectedPerson.workEnvironment} | Age: {selectedPerson.age || 38}
                </p>
              </div>
            </div>

            {/* Risk Breakdown */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5">
                  <div className="text-[10px] text-zinc-500 font-mono">Heat Risk</div>
                  <div className="text-xl font-bold text-orange-400">{selectedPerson.risk?.heatRisk || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5">
                  <div className="text-[10px] text-zinc-500 font-mono">Dehydration</div>
                  <div className="text-xl font-bold text-amber-400">{selectedPerson.risk?.dehydrationRisk || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5">
                  <div className="text-[10px] text-zinc-500 font-mono">Respiratory</div>
                  <div className="text-xl font-bold text-purple-400">{selectedPerson.risk?.respiratoryRisk || 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5">
                  <div className="text-[10px] text-zinc-500 font-mono">Cardio Stress</div>
                  <div className="text-xl font-bold text-rose-400">{selectedPerson.risk?.cardiovascularRisk || 0}</div>
                </div>
              </div>

              {/* Reasons */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2 text-xs">
                <div className="font-bold text-white">Contributing Physiological Factors:</div>
                {(selectedPerson.risk?.reasons || []).map((r, i) => (
                  <div key={i} className="text-zinc-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
