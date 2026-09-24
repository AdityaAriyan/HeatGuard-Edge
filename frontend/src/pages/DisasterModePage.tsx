import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { useAuth } from '../context/AuthContext';
import { Flame, Waves, Tornado, Wind, CloudLightning, ShieldAlert, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

export const DisasterModePage: React.FC = () => {
  const { currentPacket, currentRisk, setScenario, currentScenario } = useSimulator();
  const { user } = useAuth();
  const [activeDisasterType, setActiveDisasterType] = useState<'HEAT_WAVE' | 'FLOOD' | 'CYCLONE' | 'AIR_POLLUTION' | 'EXTREME_WEATHER'>('HEAT_WAVE');

  const disasterPresets = {
    HEAT_WAVE: {
      title: 'HEAT WAVE EMERGENCY PROTOCOL',
      icon: Flame,
      severity: 'SEVERE ADVISORY (RED ALERT)',
      color: 'border-orange-500/50 bg-orange-950/20 text-orange-400',
      description: 'Surface temperatures exceed 41°C with severe thermal radiation. Direct sunlight exposure causes acute hyperthermia and dehydration.',
      guidelines: [
        'Mandatory 15-minute shaded rest break every 45 minutes of physical labor.',
        'Drink at least 500ml water with electrolytes every 60 minutes.',
        'Immediately seek cooler shelter if resting heart rate exceeds 110 BPM.',
        'Keep continuous Edge-AI monitoring active on your wearable device.',
      ],
      scenarioKey: 'HEAT_WAVE',
    },
    FLOOD: {
      title: 'FLOOD & INUNDATION DISASTER MODE',
      icon: Waves,
      severity: 'FLASH FLOOD WARNING',
      color: 'border-blue-500/50 bg-blue-950/20 text-blue-400',
      description: 'Riverine or urban inundation. Waterborne pathogen risks, power outage, high physical fatigue from wading.',
      guidelines: [
        'Move immediately to higher ground masonry structures.',
        'Avoid contact with rapid flood waters or submerged electric lines.',
        'Preserve device battery by maintaining offline local monitoring mode.',
        'Verify emergency location sharing is enabled in Privacy Settings.',
      ],
      scenarioKey: 'FLOOD',
    },
    CYCLONE: {
      title: 'CYCLONIC STORM & HIGH WIND PROTOCOL',
      icon: Tornado,
      severity: 'EXTREME WEATHER EMERGENCY',
      color: 'border-cyan-500/50 bg-cyan-950/20 text-cyan-400',
      description: 'Sustained gale winds >100 km/h with torrential rain and structural collapse hazards.',
      guidelines: [
        'Remain inside designated cyclone shelter away from glass panels.',
        'Keep emergency supplies, dry rations, and communication beacons ready.',
        'Check vital signs regularly to manage acute psychological & physical stress.',
      ],
      scenarioKey: 'CYCLONE',
    },
    AIR_POLLUTION: {
      title: 'SEVERE AIR QUALITY & SMOG EMERGENCY',
      icon: Wind,
      severity: 'HAZARDOUS SMOG EPISODE (AQI > 300)',
      color: 'border-purple-500/50 bg-purple-950/20 text-purple-400',
      description: 'Extremely high concentrations of PM2.5 and PM10 particulates leading to acute respiratory and cardiovascular stress.',
      guidelines: [
        'Wear certified N95 or FFP2 respirators whenever outdoors.',
        'Avoid high-intensity outdoor running or cardiovascular exertion.',
        'Monitor wearable SpO₂ readings for early desaturation (<94%).',
      ],
      scenarioKey: 'AIR_POLLUTION',
    },
    EXTREME_WEATHER: {
      title: 'EXTREME WEATHER & LIGHTNING ALERT',
      icon: CloudLightning,
      severity: 'CIVIL DEFENSE ADVISORY',
      color: 'border-yellow-500/50 bg-yellow-950/20 text-yellow-400',
      description: 'Violent thunderstorm activity and severe temperature fluctuations.',
      guidelines: [
        'Seek indoor shelter and avoid tall metal poles or open trees.',
        'Keep power banks charged for all vital safety devices.',
      ],
      scenarioKey: 'NORMAL',
    },
  };

  const currentDisaster = disasterPresets[activeDisasterType];
  const DisasterIcon = currentDisaster.icon;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Disaster Mode & Personal Synthesis</h1>
          <p className="text-xs text-zinc-400">
            Synthesizing environmental disaster hazards with your individual physiological baseline
          </p>
        </div>

        <button
          onClick={() => setScenario(currentDisaster.scenarioKey as any)}
          className="btn-primary !text-xs !py-1.5"
        >
          <span>Simulate Active {activeDisasterType.replace('_', ' ')}</span>
        </button>
      </div>

      <MedicalDisclaimer />

      {/* Disaster Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(disasterPresets).map(([key, item]) => {
          const Icon = item.icon;
          const isActive = activeDisasterType === key;
          return (
            <button
              key={key}
              onClick={() => setActiveDisasterType(key as any)}
              className={`p-3 rounded-2xl glass-panel text-left flex flex-col justify-between border transition-all ${
                isActive
                  ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-950/30 scale-105'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${isActive ? 'text-cyan-400' : 'text-zinc-400'}`} />
              <div className="text-xs font-semibold text-white truncate">{key.replace('_', ' ')}</div>
            </button>
          );
        })}
      </div>

      {/* Active Disaster Protocol Banner */}
      <div className={`glass-panel p-6 border rounded-2xl ${currentDisaster.color} shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
              <DisasterIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold tracking-wider uppercase mb-1">
                {currentDisaster.severity}
              </div>
              <h2 className="text-xl font-bold font-display text-white">{currentDisaster.title}</h2>
            </div>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-black/40 border border-white/20 text-white font-bold">
            ACTIVE REGION: DELHI-NCR
          </span>
        </div>

        <p className="text-sm text-zinc-200 mb-6 leading-relaxed max-w-3xl">{currentDisaster.description}</p>

        {/* Guidelines */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-xs font-bold uppercase font-mono tracking-wider text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Authorized Safety Directives</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentDisaster.guidelines.map((g, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-zinc-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <span>{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CRITICAL CORE FEATURE: DISASTER + PERSONAL HEALTH SYNTHESIS (USER A vs USER B) */}
      <div className="glass-panel p-6 border border-white/10">
        <div className="pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-400">
              Core Architectural Principle
            </span>
          </div>
          <h2 className="text-lg font-bold font-display text-white">
            Disaster Condition + Personal Baseline = Personalized Individual Risk
          </h2>
          <p className="text-xs text-zinc-400">
            Two individuals experiencing the exact same 41°C Heat Wave receive completely different personalized risk assessments based on their physiological response and baseline calibration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User A: Arun Sharma (Controlled / Low-Moderate Risk) */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Person A: Arun Sharma (Hydrated / Resting)</span>
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">Ambient Temp: 41°C (Heatwave)</span>
              </div>
              <span className="badge-risk-low px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                LOW RISK (22/100)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[9px] text-zinc-500">Heart Rate</div>
                <div className="font-bold text-white">76 BPM</div>
                <div className="text-[9px] text-emerald-400">+4 vs base</div>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[9px] text-zinc-500">Skin Temp</div>
                <div className="font-bold text-white">36.6°C</div>
                <div className="text-[9px] text-emerald-400">+0.2°C base</div>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[9px] text-zinc-500">SpO₂</div>
                <div className="font-bold text-white">98%</div>
                <div className="text-[9px] text-emerald-400">Optimal</div>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              Physiological compensation is stable. Body is effectively dissipating heat through normal sweating. Safe to continue light activity.
            </p>
          </div>

          {/* User B: Suresh Patel (High Risk in the Same Heat Wave) */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-red-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Person B: Suresh Patel (Active / Strained)</span>
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">Ambient Temp: 41°C (Same Heatwave)</span>
              </div>
              <span className="badge-risk-high px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                HIGH RISK (78/100)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[9px] text-zinc-500">Heart Rate</div>
                <div className="font-bold text-amber-400">114 BPM</div>
                <div className="text-[9px] text-red-400">+39 vs base</div>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[9px] text-zinc-500">Skin Temp</div>
                <div className="font-bold text-amber-400">38.4°C</div>
                <div className="text-[9px] text-red-400">+1.9°C base</div>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[9px] text-zinc-500">SpO₂</div>
                <div className="font-bold text-white">96%</div>
                <div className="text-[9px] text-amber-400">-1.5% base</div>
              </div>
            </div>

            <p className="text-xs text-red-200">
              Thermally overwhelmed. High cardiovascular strain and elevated skin temperature indicate early heat exhaustion. Immediate rest required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
