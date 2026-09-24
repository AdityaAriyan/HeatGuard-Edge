import React from 'react';
import { Heart, Activity, Thermometer, Droplets, Wind, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface VitalCardProps {
  type: 'HEART_RATE' | 'SPO2' | 'SKIN_TEMP' | 'BLOOD_PRESSURE' | 'HEAT_INDEX' | 'AQI';
  value: string | number;
  unit: string;
  label: string;
  baselineValue?: string | number;
  delta?: number;
  isEstimated?: boolean;
  status?: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  icon?: React.ReactNode;
}

export const VitalCard: React.FC<VitalCardProps> = ({
  type,
  value,
  unit,
  label,
  baselineValue,
  delta,
  isEstimated,
  status = 'NORMAL',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'HEART_RATE':
        return <Heart className="w-5 h-5 text-rose-400 animate-heartbeat" />;
      case 'SPO2':
        return <Activity className="w-5 h-5 text-cyan-400" />;
      case 'SKIN_TEMP':
        return <Thermometer className="w-5 h-5 text-amber-400" />;
      case 'BLOOD_PRESSURE':
        return <Droplets className="w-5 h-5 text-indigo-400" />;
      case 'AQI':
        return <Wind className="w-5 h-5 text-purple-400" />;
      default:
        return <Activity className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'CRITICAL':
        return 'border-red-500/40 bg-red-950/20 text-red-400';
      case 'ELEVATED':
        return 'border-amber-500/40 bg-amber-950/20 text-amber-400';
      default:
        return 'border-white/10 bg-zinc-900/60 text-emerald-400';
    }
  };

  return (
    <div className={`glass-panel p-4 flex flex-col justify-between border ${getStatusColor()} hover:scale-[1.02] transition-transform`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">{getIcon()}</div>
          <span className="text-xs font-medium text-zinc-300">{label}</span>
        </div>
        {isEstimated && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300">
            Estimated
          </span>
        )}
      </div>

      <div className="my-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold font-display tracking-tight text-white">{value}</span>
          <span className="text-xs font-mono text-zinc-400">{unit}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
        <span className="text-zinc-500">Baseline: {baselineValue || '--'}</span>
        {delta !== undefined && delta !== 0 ? (
          <span
            className={`flex items-center gap-0.5 font-semibold ${
              delta > 0 ? (type === 'SPO2' ? 'text-emerald-400' : 'text-amber-400') : 'text-cyan-400'
            }`}
          >
            {delta > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {delta > 0 ? `+${delta}` : delta} {unit}
          </span>
        ) : (
          <span className="text-zinc-500 flex items-center gap-0.5">
            <Minus className="w-3 h-3" /> In range
          </span>
        )}
      </div>
    </div>
  );
};
