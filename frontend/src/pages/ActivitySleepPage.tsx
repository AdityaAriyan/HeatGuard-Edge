import React from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Activity, Flame, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

export const ActivitySleepPage: React.FC = () => {
  const { currentPacket, currentRisk } = useSimulator();
  const { baseline } = useAuth();

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Activity & Sleep Analysis</h1>
        <p className="text-xs text-zinc-400">
          Motion classification from MPU6050, estimated recovery periods, and fatigue indicators
        </p>
      </div>

      <MedicalDisclaimer />

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated Sleep Duration */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Estimated Sleep Duration</span>
            <Moon className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold font-display text-white">7h 20m</div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>Baseline: 7h 30m</span>
            <span className="text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/30 text-[10px]">
              Estimated
            </span>
          </div>
        </div>

        {/* Sleep Consistency */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Sleep Consistency</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-display text-emerald-400">88%</div>
          <div className="mt-2 text-[11px] font-mono text-zinc-500">Quality: Optimal Rest</div>
        </div>

        {/* Daily Active Steps */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Estimated Step Count</span>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-display text-white">8,450</div>
          <div className="mt-2 text-[11px] font-mono text-zinc-500">Active Work Shift</div>
        </div>

        {/* Fatigue Risk Score */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Fatigue Risk Score</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-display text-amber-400">{currentRisk.risks.fatigue} / 100</div>
          <div className="mt-2 text-[11px] font-mono text-zinc-500">Level: {currentRisk.levels.fatigue}</div>
        </div>
      </div>

      {/* Detailed Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep & Recovery Estimation Heuristics */}
        <div className="glass-panel p-6 border border-white/10">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-4">
            <Moon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold font-display text-white">Sleep & Recovery Estimation</h2>
          </div>

          <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
            <p>
              Sleep periods are estimated from overnight micro-motion and stillness tracked by the wearable MPU6050 accelerometer.
            </p>
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Sleep Window:</span>
                <span className="text-white font-semibold">10:45 PM – 06:05 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Deep Rest Period (Stillness):</span>
                <span className="text-emerald-400 font-semibold">5h 15m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Restless Micro-Awakenings:</span>
                <span className="text-zinc-300">3 events</span>
              </div>
            </div>
          </div>
        </div>

        {/* Physical Strain & Inactivity Monitor */}
        <div className="glass-panel p-6 border border-white/10">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-4">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-display text-white">Motion Intensity & Posture</h2>
          </div>

          <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
            <p>
              Continuous physical activity under heat increases cardiac workload. The system monitors for prolonged inactivity or sudden immobility events.
            </p>
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Current Motion State:</span>
                <span className="text-cyan-400 font-bold">{currentPacket.activityState}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Inactivity Warning Threshold:</span>
                <span className="text-zinc-300">120 mins continuous</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Posture Stability Index:</span>
                <span className="text-emerald-400 font-bold">Normal / Upright</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
