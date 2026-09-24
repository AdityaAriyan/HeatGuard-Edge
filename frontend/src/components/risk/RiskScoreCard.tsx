import React from 'react';
import { RiskLevel } from '../../edge/risk-engine/EdgeRiskEngine';
import { ShieldAlert, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RiskScoreCardProps {
  title: string;
  score: number; // 0 - 100
  level: RiskLevel;
  trend?: 'RISING' | 'FALLING' | 'STABLE';
  description?: string;
  subFactors?: { label: string; value: string | number }[];
  onClick?: () => void;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  title,
  score,
  level,
  trend = 'STABLE',
  description,
  subFactors,
  onClick,
}) => {
  const getLevelBadgeClass = () => {
    switch (level) {
      case 'CRITICAL':
        return 'badge-risk-critical';
      case 'HIGH':
        return 'badge-risk-high';
      case 'CAUTION':
        return 'badge-risk-caution';
      default:
        return 'badge-risk-low';
    }
  };

  const getScoreColor = () => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-400';
      case 'HIGH':
        return 'text-orange-400';
      case 'CAUTION':
        return 'text-amber-400';
      default:
        return 'text-emerald-400';
    }
  };

  const getProgressColor = () => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-gradient-to-r from-red-600 to-rose-500';
      case 'HIGH':
        return 'bg-gradient-to-r from-orange-500 to-amber-500';
      case 'CAUTION':
        return 'bg-gradient-to-r from-amber-400 to-yellow-500';
      default:
        return 'bg-gradient-to-r from-emerald-500 to-teal-400';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-4 flex flex-col justify-between cursor-pointer hover:border-cyan-500/40 transition-all ${
        level === 'CRITICAL' ? 'border-red-500/50 bg-red-950/20 shadow-red-950/20' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-200 tracking-wide">{title}</span>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider ${getLevelBadgeClass()}`}>
              {level}
            </span>
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-extrabold font-display ${getScoreColor()}`}>{score}</span>
            <span className="text-xs font-mono text-zinc-400">/ 100</span>
          </div>
          {trend === 'RISING' ? (
            <span className="text-[11px] font-mono text-rose-400 flex items-center gap-0.5 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> Rising
            </span>
          ) : trend === 'FALLING' ? (
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-0.5 font-semibold">
              <TrendingDown className="w-3.5 h-3.5" /> Easing
            </span>
          ) : (
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-0.5">
              <Minus className="w-3 h-3" /> Stable
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-500 rounded-full ${getProgressColor()}`}
            style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
          />
        </div>

        {description && <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{description}</p>}
      </div>

      {subFactors && subFactors.length > 0 && (
        <div className="pt-2.5 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] font-mono">
          {subFactors.map((sf, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-zinc-500 text-[10px] truncate">{sf.label}</span>
              <span className="text-zinc-300 font-semibold">{sf.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
