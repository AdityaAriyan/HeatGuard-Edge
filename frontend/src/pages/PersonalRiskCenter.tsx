import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { useAuth } from '../context/AuthContext';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { WhyAmIAtRisk } from '../components/risk/WhyAmIAtRisk';
import {
  Activity,
  Flame,
  Droplets,
  Wind,
  Moon,
  HeartPulse,
  AlertOctagon,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from 'lucide-react';

export const PersonalRiskCenter: React.FC = () => {
  const { currentPacket, currentRisk } = useSimulator();
  const { baseline } = useAuth();
  const [selectedVector, setSelectedVector] = useState<string>('HEAT');

  const vectorDetails: Record<
    string,
    {
      title: string;
      icon: any;
      score: number;
      level: string;
      color: string;
      description: string;
      inputs: { name: string; value: string; note: string }[];
      baselineComparison: { metric: string; current: string; baseline: string; delta: string }[];
    }
  > = {
    HEAT: {
      title: 'Heat Stress Risk',
      icon: Flame,
      score: currentRisk.risks.heat,
      level: currentRisk.levels.heat,
      color: 'text-orange-400',
      description:
        'Calculates real-time risk of heat exhaustion and hyperthermia by evaluating ambient heat index, skin temperature rise, and heart rate elevation.',
      inputs: [
        { name: 'Ambient Temp', value: `${currentPacket.ambientTemperature}°C`, note: 'Measured by SHT31' },
        { name: 'Relative Humidity', value: `${currentPacket.humidity}%`, note: 'Measured by SHT31' },
        { name: 'Skin Temperature', value: `${currentPacket.skinTemperature}°C`, note: 'Measured by MLX90614' },
        { name: 'Heat Exposure Duration', value: `${currentPacket.exposureMinutes} mins`, note: 'Wearable timer' },
      ],
      baselineComparison: [
        {
          metric: 'Skin Temperature',
          current: `${currentPacket.skinTemperature}°C`,
          baseline: `${baseline?.baseline_skin_temp || 36.4}°C`,
          delta: `+${currentRisk.baselineDeltas.skinTempDelta}°C`,
        },
        {
          metric: 'Heart Rate',
          current: `${currentPacket.heartRate} BPM`,
          baseline: `${baseline?.baseline_heart_rate || 72} BPM`,
          delta: `+${currentRisk.baselineDeltas.heartRateDelta} BPM`,
        },
      ],
    },
    DEHYDRATION: {
      title: 'Dehydration Risk Indicator',
      icon: Droplets,
      score: currentRisk.risks.dehydration,
      level: currentRisk.levels.dehydration,
      color: 'text-amber-400',
      description:
        'Correlates prolonged heat exposure and physical workload with cardiovascular drift (rising resting HR without proportional muscle recovery).',
      inputs: [
        { name: 'Heart Rate Trend', value: `${currentPacket.heartRate} BPM`, note: 'PPG Sensor' },
        { name: 'Workload Intensity', value: currentPacket.activityState, note: 'MPU6050 Motion' },
        { name: 'Continuous Outdoor Time', value: `${currentPacket.exposureMinutes} mins`, note: 'Session Duration' },
      ],
      baselineComparison: [
        {
          metric: 'Heart Rate Drift',
          current: `${currentPacket.heartRate} BPM`,
          baseline: `${baseline?.baseline_heart_rate || 72} BPM`,
          delta: `+${currentRisk.baselineDeltas.heartRateDelta} BPM`,
        },
      ],
    },
    RESPIRATORY: {
      title: 'Respiratory Stress Indicator',
      icon: Wind,
      score: currentRisk.risks.respiratory,
      level: currentRisk.levels.respiratory,
      color: 'text-purple-400',
      description:
        'Evaluates vulnerability to particulate pollution by comparing environmental AQI & PM2.5 with personal SpO₂ baseline drops.',
      inputs: [
        { name: 'Air Quality Index', value: `${currentPacket.aqi} AQI`, note: 'Optical PM Sensor / Grid' },
        { name: 'PM2.5 Concentration', value: `${currentPacket.pm25} µg/m³`, note: 'Hazardous threshold >250' },
        { name: 'Blood Oxygen (SpO₂)', value: `${currentPacket.spo2}%`, note: 'MAX30102 PPG' },
      ],
      baselineComparison: [
        {
          metric: 'SpO₂ Oxygenation',
          current: `${currentPacket.spo2}%`,
          baseline: `${baseline?.baseline_spo2 || 98.5}%`,
          delta: `${currentRisk.baselineDeltas.spo2Delta}%`,
        },
      ],
    },
    FATIGUE: {
      title: 'Fatigue & Strain Score',
      icon: Moon,
      score: currentRisk.risks.fatigue,
      level: currentRisk.levels.fatigue,
      color: 'text-blue-400',
      description:
        'Estimates fatigue using cumulative sleep deprivation from baseline and continuous work hours without rest periods.',
      inputs: [
        { name: 'Sleep Duration (Est.)', value: '7h 10m', note: 'Estimated from motion' },
        { name: 'Typical Baseline Sleep', value: `${(baseline?.typical_sleep_minutes || 450) / 60} hours`, note: 'User Calibration' },
        { name: 'Continuous Physical Load', value: `${currentPacket.exposureMinutes} mins`, note: 'Active Shift' },
      ],
      baselineComparison: [
        {
          metric: 'Estimated Sleep Deficit',
          current: '7h 10m',
          baseline: '7h 30m',
          delta: '-20 mins',
        },
      ],
    },
    CARDIO: {
      title: 'Cardiovascular Stress',
      icon: HeartPulse,
      score: currentRisk.risks.cardiovascular,
      level: currentRisk.levels.cardiovascular,
      color: 'text-rose-400',
      description:
        'Evaluates acute cardiovascular load by assessing heart rate spikes and blood pressure variation against resting baseline.',
      inputs: [
        { name: 'Heart Rate', value: `${currentPacket.heartRate} BPM`, note: 'MAX30102' },
        { name: 'Blood Pressure', value: `${currentPacket.systolic}/${currentPacket.diastolic} mmHg`, note: 'Estimated BP' },
      ],
      baselineComparison: [
        {
          metric: 'Heart Rate',
          current: `${currentPacket.heartRate} BPM`,
          baseline: `${baseline?.baseline_heart_rate || 72} BPM`,
          delta: `+${currentRisk.baselineDeltas.heartRateDelta} BPM`,
        },
        {
          metric: 'Systolic BP',
          current: `${currentPacket.systolic} mmHg`,
          baseline: `${baseline?.baseline_systolic || 120} mmHg`,
          delta: `+${currentRisk.baselineDeltas.systolicDelta} mmHg`,
        },
      ],
    },
    FALL: {
      title: 'Fall / Emergency Status',
      icon: AlertOctagon,
      score: currentRisk.risks.fallEmergency,
      level: currentRisk.levels.fallEmergency,
      color: 'text-red-400',
      description:
        'Monitors 3-axis accelerometer and gyroscope for sudden gravitational spike (>2.8g), horizontal tilt change, and post-impact inactivity.',
      inputs: [
        { name: 'Acceleration Vector', value: '1.02g (Nominal)', note: 'MPU6050 3-axis' },
        { name: 'Gyro Angular Rate', value: '12 deg/s', note: 'MPU6050 Gyro' },
        { name: 'Activity State', value: currentPacket.activityState, note: 'Motion classifier' },
      ],
      baselineComparison: [
        {
          metric: 'Motion State',
          current: currentPacket.activityState,
          baseline: 'Normal Walking / Active',
          delta: currentPacket.activityState === 'POSSIBLE_FALL' ? 'IMPACT DETECTED' : 'Normal',
        },
      ],
    },
  };

  const selected = vectorDetails[selectedVector];
  const Icon = selected.icon;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Personal Risk Center</h1>
          <p className="text-xs text-zinc-400">
            Multi-vector Edge-AI physiological & environmental early-warning indicators
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">Composite Risk:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold badge-risk-${currentRisk.overallLevel.toLowerCase()}`}>
            {currentRisk.overallLevel} ({currentRisk.overallScore}/100)
          </span>
        </div>
      </div>

      <MedicalDisclaimer />

      {/* Vector Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(vectorDetails).map(([key, item]) => {
          const ItemIcon = item.icon;
          const isCurrent = selectedVector === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedVector(key)}
              className={`p-3 rounded-2xl glass-panel text-left flex flex-col justify-between border transition-all ${
                isCurrent
                  ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-950/30 scale-105'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <ItemIcon className={`w-5 h-5 ${item.color}`} />
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded badge-risk-${item.level.toLowerCase()}`}>
                  {item.level}
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-200 truncate">{item.title.split(' ')[0]}</div>
                <div className="text-xl font-bold font-display text-white">{item.score}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Vector Deep Dive */}
      <div className="glass-panel p-6 border border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <Icon className={`w-7 h-7 ${selected.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">{selected.title}</h2>
              <p className="text-xs text-zinc-400 max-w-xl">{selected.description}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-zinc-500">Vector Score</div>
            <div className="text-3xl font-extrabold font-display text-white">{selected.score} / 100</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Sensor Inputs */}
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sensor Feature Inputs</span>
            </h3>
            <div className="space-y-2.5">
              {selected.inputs.map((inp, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-zinc-200">{inp.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{inp.note}</div>
                  </div>
                  <div className="text-sm font-bold font-mono text-white">{inp.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Baseline Comparison */}
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Personal Baseline Comparison</span>
            </h3>
            <div className="space-y-2.5">
              {selected.baselineComparison.map((comp, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
                    <span>{comp.metric}</span>
                    <span className="font-mono text-amber-400 font-bold">{comp.delta}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1 border-t border-white/5">
                    <span>Current: <strong className="text-white">{comp.current}</strong></span>
                    <span>Baseline: <strong className="text-zinc-300">{comp.baseline}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Explainable AI Analysis */}
      <WhyAmIAtRisk risk={currentRisk} />
    </div>
  );
};
