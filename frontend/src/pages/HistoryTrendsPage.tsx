import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useSimulator } from '../context/SimulatorContext';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { LineChart as ChartIcon, Calendar, Clock, Activity, Flame, Wind } from 'lucide-react';

export const HistoryTrendsPage: React.FC = () => {
  const { currentPacket } = useSimulator();
  const [timeRange, setTimeRange] = useState<'TODAY' | '7D' | '30D'>('TODAY');

  // Generate realistic 24-hour time series
  const generateTodayData = () => {
    const data = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3600 * 1000);
      const hourStr = time.getHours() + ':00';
      const baseHr = i > 6 && i < 18 ? 85 : 68; // Higher HR during daytime work
      const baseTemp = i > 8 && i < 17 ? 38.5 : 28.0;
      data.push({
        time: hourStr,
        heartRate: Math.round(baseHr + (Math.random() - 0.5) * 8),
        spo2: Math.min(100, Math.round((98 + (Math.random() - 0.5) * 1.5) * 10) / 10),
        skinTemp: Math.round((36.4 + (i > 10 && i < 16 ? 1.2 : 0) + (Math.random() - 0.5) * 0.3) * 10) / 10,
        heatRisk: Math.round(Math.max(10, Math.min(90, (i > 10 && i < 16 ? 68 : 20) + (Math.random() - 0.5) * 10))),
        ambientTemp: Math.round(baseTemp + (Math.random() - 0.5) * 2),
        aqi: Math.round(180 + (Math.random() - 0.5) * 40),
      });
    }
    return data;
  };

  const chartData = generateTodayData();

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Health Trends & Analytics</h1>
          <p className="text-xs text-zinc-400">
            Longitudinal physiological telemetry and environmental correlation history
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono">
          <button
            onClick={() => setTimeRange('TODAY')}
            className={`px-3 py-1 rounded-lg transition ${
              timeRange === 'TODAY' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Today (24h)
          </button>
          <button
            onClick={() => setTimeRange('7D')}
            className={`px-3 py-1 rounded-lg transition ${
              timeRange === '7D' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30D')}
            className={`px-3 py-1 rounded-lg transition ${
              timeRange === '30D' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <MedicalDisclaimer />

      {/* 1. Heart Rate & SpO2 Dual Timeline Chart */}
      <div className="glass-panel p-6 border border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-sm font-bold font-display text-white">Heart Rate (BPM) & SpO₂ (%) Over Time</h2>
              <p className="text-[11px] text-zinc-400 font-mono">MAX30102 PPG Optical Telemetry</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Heart Rate
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> SpO₂
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2438" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" domain={[50, 150]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0c101a', borderColor: '#1c2438', borderRadius: '12px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="spo2" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Heat Risk vs Ambient Temperature Correlation */}
      <div className="glass-panel p-6 border border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-orange-400" />
            <div>
              <h2 className="text-sm font-bold font-display text-white">Heat Stress Risk Score vs Ambient Temperature</h2>
              <p className="text-[11px] text-zinc-400 font-mono">Edge-AI Risk Engine Computation</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Heat Risk Score
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Ambient Temp (°C)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="heatRiskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2438" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0c101a', borderColor: '#1c2438', borderRadius: '12px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="heatRisk" stroke="#f97316" fillOpacity={1} fill="url(#heatRiskGrad)" strokeWidth={2.5} />
              <Line type="monotone" dataKey="ambientTemp" stroke="#fcd34d" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
