import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const MedicalDisclaimer: React.FC<{ compact?: boolean }> = ({ compact }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/20 text-blue-300 text-xs">
        <Info className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" />
        <span>Experimental early-warning system. Not a medical diagnostic device.</span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-3.5 my-3 flex items-start gap-3 border-amber-500/30 bg-amber-950/20 text-amber-200/90 text-xs leading-relaxed">
      <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
      <div>
        <strong className="text-amber-300 font-semibold block mb-0.5">IMPORTANT MEDICAL & SAFETY NOTICE:</strong>
        HeatGuard-Edge is an experimental early-warning and safety-monitoring system. It is not a medical diagnostic device and should not replace professional medical evaluation. Blood pressure estimates and sleep metrics are computed via sensor heuristics.
      </div>
    </div>
  );
};
