import React from 'react';
import { Cpu, Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';

export const OfflineStatusChip: React.FC = () => {
  const {
    isOfflineSimulated,
    isEffectiveOffline,
    pendingCount,
    syncStatus,
    lastSyncResult,
    toggleOfflineMode,
    triggerManualSync,
  } = useOffline();

  return (
    <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
      {/* Edge AI Active Pill */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Cpu className="w-3.5 h-3.5" />
        <span className="font-semibold">EDGE AI ACTIVE</span>
      </div>

      {/* Connectivity & Offline Toggle Button */}
      <button
        onClick={toggleOfflineMode}
        title="Click to toggle simulated offline mode"
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
          isEffectiveOffline
            ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/40'
            : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40'
        }`}
      >
        {isEffectiveOffline ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>INTERNET: OFFLINE (LOCAL)</span>
          </>
        ) : (
          <>
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>INTERNET: CONNECTED</span>
          </>
        )}
      </button>

      {/* Sync Status / Pending Queue Pill */}
      {isEffectiveOffline ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
          <span className="text-amber-400 font-bold">{pendingCount}</span>
          <span>queued records</span>
        </div>
      ) : pendingCount > 0 ? (
        <button
          onClick={triggerManualSync}
          disabled={syncStatus === 'SYNCING'}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/70 border border-blue-500/40 text-blue-300 hover:bg-blue-900/40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
          <span>Sync {pendingCount} records</span>
        </button>
      ) : lastSyncResult ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{lastSyncResult.count} synced ({lastSyncResult.timestamp})</span>
        </div>
      ) : null}
    </div>
  );
};
