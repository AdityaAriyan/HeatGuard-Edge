import React from 'react';
import { AlertOctagon, CheckCircle2, Siren } from 'lucide-react';
import { useSimulator } from '../../context/SimulatorContext';

export const FallAlertModal: React.FC = () => {
  const { isFallModalOpen, fallCountdownSeconds, dismissFallModal, confirmFallSos } = useSimulator();

  if (!isFallModalOpen) return null;

  const progressPercent = Math.max(0, (fallCountdownSeconds / 15) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel max-w-lg w-full p-6 border-red-500/60 bg-red-950/40 text-center relative overflow-hidden shadow-2xl animate-scaleUp">
        {/* Top Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-red-950">
          <div
            className="h-full bg-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 animate-bounce">
          <AlertOctagon className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-bold font-display text-red-100 mb-1">
          Possible Fall & Inactivity Detected!
        </h2>
        <p className="text-red-200/80 text-sm mb-6">
          MPU6050 registered high-impact acceleration followed by complete immobility.
        </p>

        <div className="p-4 rounded-xl bg-black/50 border border-red-500/30 mb-6 inline-block">
          <div className="text-xs text-red-300 uppercase tracking-wider font-mono mb-1">
            Auto-Escalating to Caregivers In
          </div>
          <div className="text-5xl font-black font-mono text-red-400 animate-pulse">
            00:{fallCountdownSeconds < 10 ? `0${fallCountdownSeconds}` : fallCountdownSeconds}
          </div>
        </div>

        <p className="text-base font-semibold text-white mb-6">Are you okay?</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={dismissFallModal}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-900/30 transition-transform active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>I'M OK</span>
          </button>

          <button
            onClick={confirmFallSos}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-base shadow-lg shadow-red-900/40 transition-transform active:scale-95"
          >
            <Siren className="w-5 h-5" />
            <span>SEND SOS NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
};
