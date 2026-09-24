import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { EdgeSensorPacket } from '../edge/sensors/interfaces';
import { generateSyntheticReading, ScenarioType, SCENARIO_PRESETS } from '../edge/sensors/simulatedSensors';
import { EdgeRiskEngine, RiskAssessmentResult, UserBaseline } from '../edge/risk-engine/EdgeRiskEngine';
import { useAuth } from './AuthContext';
import { useOffline } from './OfflineContext';
import { api } from '../services/api';

interface SimulatorContextType {
  currentScenario: ScenarioType;
  currentPacket: EdgeSensorPacket;
  currentRisk: RiskAssessmentResult;
  isFallModalOpen: boolean;
  fallCountdownSeconds: number;
  isSimulatingLive: boolean;
  setScenario: (scenario: ScenarioType) => void;
  updateParam: (key: keyof EdgeSensorPacket, val: any) => void;
  triggerFallScenario: () => void;
  dismissFallModal: () => void;
  confirmFallSos: () => Promise<void>;
  toggleLiveSimulation: () => void;
  playBuzzerSound: (type?: 'WARNING' | 'CRITICAL') => void;
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

export const SimulatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, baseline } = useAuth();
  const { isEffectiveOffline, enqueueOfflinePacket } = useOffline();

  const [currentScenario, setCurrentScenarioState] = useState<ScenarioType>('NORMAL');
  const [isSimulatingLive, setIsSimulatingLive] = useState<boolean>(true);

  // Active Live Packet State
  const [currentPacket, setCurrentPacket] = useState<EdgeSensorPacket>(() =>
    generateSyntheticReading('NORMAL', user?.id || 'usr-demo-worker-01')
  );

  // Fall Alert State Machine
  const [isFallModalOpen, setIsFallModalOpen] = useState<boolean>(false);
  const [fallCountdownSeconds, setFallCountdownSeconds] = useState<number>(15);
  const fallTimerRef = useRef<any>(null);

  // Web Audio Context for Wearable Hardware Buzzer Simulation
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBuzzerSound = (type: 'WARNING' | 'CRITICAL' = 'CRITICAL') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type === 'CRITICAL' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(type === 'CRITICAL' ? 880 : 440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(type === 'CRITICAL' ? 1760 : 880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio autoplay restrictions or unsupported
    }
  };

  const getEffectiveBaseline = (): UserBaseline => {
    return {
      userId: user?.id || 'usr-demo-worker-01',
      baselineHeartRate: baseline?.baseline_heart_rate || 72,
      baselineSpo2: baseline?.baseline_spo2 || 98.0,
      baselineSkinTemp: baseline?.baseline_skin_temp || 36.4,
      baselineSystolic: baseline?.baseline_systolic || 120,
      baselineDiastolic: baseline?.baseline_diastolic || 80,
      typicalSleepMinutes: baseline?.typical_sleep_minutes || 450,
    };
  };

  // Re-evaluate Edge Risk whenever packet or baseline changes
  const currentRisk = EdgeRiskEngine.assessRisk(
    currentPacket,
    getEffectiveBaseline(),
    currentScenario,
    isEffectiveOffline ? 'EDGE_DEVICE_LOCAL' : 'EDGE_DEVICE_LOCAL'
  );

  // Live Jitter Timer (every 2.5s)
  useEffect(() => {
    if (!isSimulatingLive) return;

    const timer = setInterval(() => {
      const updated = generateSyntheticReading(currentScenario, user?.id || 'usr-demo-worker-01', 'DEV-HG-EDGE-01', {
        lat: currentPacket.latitude,
        lng: currentPacket.longitude,
      });

      // Maintain manually tweaked overrides if not scenario default
      setCurrentPacket(updated);

      // If offline, enqueue packet locally
      if (isEffectiveOffline) {
        enqueueOfflinePacket(updated);
      } else {
        // Send to backend via hardware-ready ingestion API
        api.ingestSensorReading(updated).catch(() => {
          // If server happens to be unreachable, fallback to local queue
          enqueueOfflinePacket(updated);
        });
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [currentScenario, isSimulatingLive, isEffectiveOffline, user?.id]);

  // Fall Scenario detection trigger
  useEffect(() => {
    if (currentPacket.activityState === 'POSSIBLE_FALL' || currentScenario === 'FALL') {
      if (!isFallModalOpen) {
        setIsFallModalOpen(true);
        setFallCountdownSeconds(15);
        playBuzzerSound('CRITICAL');

        if (fallTimerRef.current) clearInterval(fallTimerRef.current);
        fallTimerRef.current = setInterval(() => {
          setFallCountdownSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(fallTimerRef.current!);
              confirmFallSos();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  }, [currentPacket.activityState, currentScenario]);

  const setScenario = (scenario: ScenarioType) => {
    setCurrentScenarioState(scenario);
    const newPacket = generateSyntheticReading(scenario, user?.id || 'usr-demo-worker-01');
    setCurrentPacket(newPacket);

    if (scenario === 'FALL') {
      triggerFallScenario();
    } else if (scenario === 'CRITICAL' || scenario === 'HEAT_WAVE') {
      playBuzzerSound('WARNING');
    }
  };

  const updateParam = (key: keyof EdgeSensorPacket, val: any) => {
    setCurrentPacket((prev) => ({
      ...prev,
      [key]: val,
      timestamp: new Date().toISOString(),
    }));
  };

  const triggerFallScenario = () => {
    const fallPacket = generateSyntheticReading('FALL', user?.id || 'usr-demo-worker-01');
    setCurrentPacket(fallPacket);
    setIsFallModalOpen(true);
    setFallCountdownSeconds(15);
    playBuzzerSound('CRITICAL');

    if (fallTimerRef.current) clearInterval(fallTimerRef.current);
    fallTimerRef.current = setInterval(() => {
      setFallCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(fallTimerRef.current!);
          confirmFallSos();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const dismissFallModal = () => {
    if (fallTimerRef.current) clearInterval(fallTimerRef.current);
    setIsFallModalOpen(false);
    // Reset back to Normal
    setCurrentScenarioState('NORMAL');
    setCurrentPacket(generateSyntheticReading('NORMAL', user?.id || 'usr-demo-worker-01'));
  };

  const confirmFallSos = async () => {
    if (fallTimerRef.current) clearInterval(fallTimerRef.current);
    setIsFallModalOpen(false);
    try {
      await api.triggerSos({
        userId: user?.id,
        latitude: currentPacket.latitude,
        longitude: currentPacket.longitude,
        reason: 'Automated MPU6050 Fall Impact & Unresponsiveness Escalation',
      });
      playBuzzerSound('CRITICAL');
    } catch (err) {
      console.error('Failed to broadcast SOS:', err);
    }
  };

  const toggleLiveSimulation = () => {
    setIsSimulatingLive((prev) => !prev);
  };

  return (
    <SimulatorContext.Provider
      value={{
        currentScenario,
        currentPacket,
        currentRisk,
        isFallModalOpen,
        fallCountdownSeconds,
        isSimulatingLive,
        setScenario,
        updateParam,
        triggerFallScenario,
        dismissFallModal,
        confirmFallSos,
        toggleLiveSimulation,
        playBuzzerSound,
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
};

export const useSimulator = (): SimulatorContextType => {
  const context = useContext(SimulatorContext);
  if (!context) throw new Error('useSimulator must be used within a SimulatorProvider');
  return context;
};
