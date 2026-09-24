import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EdgeSensorPacket } from '../edge/sensors/interfaces';
import { api } from '../services/api';

interface OfflineContextType {
  isOfflineSimulated: boolean;
  isEffectiveOffline: boolean;
  pendingCount: number;
  syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  lastSyncResult: { count: number; timestamp: string } | null;
  toggleOfflineMode: () => void;
  enqueueOfflinePacket: (packet: EdgeSensorPacket) => void;
  triggerManualSync: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(() => {
    return localStorage.getItem('hg_offline_simulated') === 'true';
  });
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(navigator.onLine);
  const [pendingQueue, setPendingQueue] = useState<EdgeSensorPacket[]>(() => {
    try {
      const stored = localStorage.getItem('hg_pending_sync_queue');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [lastSyncResult, setLastSyncResult] = useState<{ count: number; timestamp: string } | null>(null);

  // Monitor real browser network events
  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save pending queue to localStorage
  useEffect(() => {
    localStorage.setItem('hg_pending_sync_queue', JSON.stringify(pendingQueue));
  }, [pendingQueue]);

  const isEffectiveOffline = isOfflineSimulated || !isBrowserOnline;

  const toggleOfflineMode = async () => {
    const nextState = !isOfflineSimulated;
    setIsOfflineSimulated(nextState);
    localStorage.setItem('hg_offline_simulated', String(nextState));

    // If toggled back to online and there are pending records, trigger automatic sync!
    if (!nextState && pendingQueue.length > 0) {
      await triggerManualSync();
    }
  };

  const enqueueOfflinePacket = (packet: EdgeSensorPacket) => {
    setPendingQueue((prev) => [...prev, packet]);
  };

  const triggerManualSync = async () => {
    if (pendingQueue.length === 0) return;
    setSyncStatus('SYNCING');
    try {
      const res = await api.syncOfflineData({ readings: pendingQueue });
      setLastSyncResult({
        count: res.synchronizedCount,
        timestamp: new Date().toLocaleTimeString(),
      });
      setPendingQueue([]);
      setSyncStatus('SUCCESS');
      setTimeout(() => setSyncStatus('IDLE'), 4000);
    } catch (err) {
      console.error('Manual sync failed:', err);
      setSyncStatus('ERROR');
      setTimeout(() => setSyncStatus('IDLE'), 4000);
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOfflineSimulated,
        isEffectiveOffline,
        pendingCount: pendingQueue.length,
        syncStatus,
        lastSyncResult,
        toggleOfflineMode,
        enqueueOfflinePacket,
        triggerManualSync,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within an OfflineProvider');
  return context;
};
