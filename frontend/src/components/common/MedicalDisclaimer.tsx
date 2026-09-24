import React from 'react';
import { AlertCircle, Shield } from 'lucide-react';

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-200/90 font-mono">
        <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>HeatGuard-Edge is a disaster health & heat-safety prototype. Not a certified clinical medical device.</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#090d18] border border-cyan-500/25 text-xs text-zinc-300 shadow-md">
      <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex-shrink-0 mt-0.5">
        <Shield className="w-4 h-4" />
      </div>
      <div className="space-y-0.5 leading-relaxed">
        <div className="font-semibold text-white flex items-center gap-1.5 font-display text-[13px]">
          <span>HeatGuard-Edge Health & Disaster Monitoring Notice</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            PROTOTYPE v2.4
          </span>
        </div>
        <p className="text-[11px] text-zinc-400">
          Wearable physiological telemetry (MAX30102, MLX90614, MPU6050, Estimated BP) and Edge-AI risk scores provide early hazard warnings during heatwaves, floods, and pollution emergencies. Always seek professional medical attention in acute emergencies.
        </p>
      </div>
    </div>
  );
};
