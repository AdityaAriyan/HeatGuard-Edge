import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSimulator } from '../context/SimulatorContext';
import { VitalCard } from '../components/vitals/VitalCard';
import { RiskScoreCard } from '../components/risk/RiskScoreCard';
import { WhyAmIAtRisk } from '../components/risk/WhyAmIAtRisk';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { OledVirtualPreview } from '../components/simulator/OledVirtualPreview';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  CloudSun,
  Clock,
  Radio,
  ExternalLink,
  Siren,
} from 'lucide-react';

interface PersonalDashboardProps {
  onNavigate: (route: string) => void;
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ onNavigate }) => {
  const { user, profile, baseline } = useAuth();
  const { currentPacket, currentRisk, setScenario, currentScenario } = useSimulator();

  const isCritical = currentRisk.overallLevel === 'CRITICAL';
  const isHigh = currentRisk.overallLevel === 'HIGH';
  const isCaution = currentRisk.overallLevel === 'CAUTION';

  const getStatusBanner = () => {
    if (isCritical) {
      return {
        bg: 'border-red-500/50 bg-gradient-to-r from-red-950/80 via-red-900/40 to-black',
        icon: <Siren className="w-8 h-8 text-red-400 animate-spin" />,
        badge: 'CRITICAL RISK DETECTED',
        badgeColor: 'badge-risk-critical',
        headline: 'Immediate Safety Hazard Alert',
        message: currentRisk.reasons[0] || 'Severe multi-system physiological strain detected.',
      };
    }
    if (isHigh) {
      return {
        bg: 'border-orange-500/50 bg-gradient-to-r from-orange-950/80 via-orange-900/40 to-black',
        icon: <AlertTriangle className="w-8 h-8 text-orange-400 animate-pulse" />,
        badge: 'HIGH RISK WARNING',
        badgeColor: 'badge-risk-high',
        headline: 'Early Warning: Heat & Physiological Strain',
        message: currentRisk.reasons[0] || 'Significant deviation from your calibrated baseline.',
      };
    }
    if (isCaution) {
      return {
        bg: 'border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-black',
        icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
        badge: 'CAUTIONARY ELEVATION',
        badgeColor: 'badge-risk-caution',
        headline: 'Mild Environmental & Cardiovascular Strain',
        message: currentRisk.reasons[0] || 'Monitor fluid intake and avoid prolonged sun exposure.',
      };
    }
    return {
      bg: 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-emerald-900/30 to-black',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
      badge: 'LOW RISK - OPTIMAL',
      badgeColor: 'badge-risk-low',
      headline: 'No Major Abnormality Detected',
      message: 'All physiological vitals and environmental metrics are within your healthy personal baseline.',
    };
  };

  const status = getStatusBanner();
  const heatIndex = Math.round(
    currentPacket.ambientTemperature + (currentPacket.humidity > 60 ? (currentPacket.humidity - 60) * 0.15 : 0)
  );

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Medical Disclaimer */}
      <MedicalDisclaimer />

      {/* 1. MAIN HERO: "AM I SAFE RIGHT NOW?" */}
      <div className={`glass-panel p-6 border rounded-2xl ${status.bg} shadow-2xl relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">Personal Safety Assessment</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${status.badgeColor}`}>
                {status.badge}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-3">
              <span>Good Day, {user?.full_name?.split(' ')[0] || 'Worker'}</span>
              <span className="text-base font-normal text-zinc-400">| Am I safe right now?</span>
            </h1>

            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">{status.message}</p>
          </div>

          {/* Large Overall Risk Score Display */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
            {status.icon}
            <div>
              <div className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">Overall Composite Risk</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-display text-white">{currentRisk.overallScore}</span>
                <span className="text-xs font-mono text-zinc-400">/ 100</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('/risk-center')}
              className="ml-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 transition"
              title="Open Personal Risk Center"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. REALTIME VITALS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold font-display text-white tracking-wide flex items-center gap-2">
            <span>Real-Time Physiological Telemetry</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </h2>
          <button
            onClick={() => onNavigate('/vitals')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            <span>Deep Sensor Stream</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <VitalCard
            type="HEART_RATE"
            label="Heart Rate"
            value={currentPacket.heartRate}
            unit="BPM"
            baselineValue={baseline?.baseline_heart_rate ? `${baseline.baseline_heart_rate} BPM` : '72 BPM'}
            delta={currentRisk.baselineDeltas.heartRateDelta}
            status={currentPacket.heartRate > 110 ? 'CRITICAL' : currentPacket.heartRate > 90 ? 'ELEVATED' : 'NORMAL'}
          />

          <VitalCard
            type="SPO2"
            label="SpO₂ Blood Oxygen"
            value={`${currentPacket.spo2}%`}
            unit="%"
            baselineValue={baseline?.baseline_spo2 ? `${baseline.baseline_spo2}%` : '98.5%'}
            delta={currentRisk.baselineDeltas.spo2Delta}
            status={currentPacket.spo2 < 92 ? 'CRITICAL' : currentPacket.spo2 < 95 ? 'ELEVATED' : 'NORMAL'}
          />

          <VitalCard
            type="SKIN_TEMP"
            label="Skin Temperature"
            value={`${currentPacket.skinTemperature}°C`}
            unit="°C"
            baselineValue={baseline?.baseline_skin_temp ? `${baseline.baseline_skin_temp}°C` : '36.4°C'}
            delta={currentRisk.baselineDeltas.skinTempDelta}
            status={currentPacket.skinTemperature > 38.0 ? 'CRITICAL' : currentPacket.skinTemperature > 37.2 ? 'ELEVATED' : 'NORMAL'}
          />

          <VitalCard
            type="BLOOD_PRESSURE"
            label="Blood Pressure"
            value={`${currentPacket.systolic}/${currentPacket.diastolic}`}
            unit="mmHg"
            isEstimated={true}
            baselineValue={baseline?.baseline_systolic ? `${baseline.baseline_systolic}/${baseline.baseline_diastolic}` : '120/80'}
            status={currentPacket.systolic > 140 ? 'CRITICAL' : currentPacket.systolic > 130 ? 'ELEVATED' : 'NORMAL'}
          />
        </div>
      </div>

      {/* 3. ENVIRONMENTAL CONTEXT & EXPOSURE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Local Environmental Stressors</h3>
            </div>
            <button
              onClick={() => onNavigate('/environment')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Awareness Details</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="text-xs text-zinc-400 mb-1">Ambient Temp</div>
              <div className="text-2xl font-bold font-display text-white">{currentPacket.ambientTemperature}°C</div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="text-xs text-zinc-400 mb-1">Humidity</div>
              <div className="text-2xl font-bold font-display text-white">{currentPacket.humidity}%</div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="text-xs text-zinc-400 mb-1">Air Quality (AQI)</div>
              <div className="text-2xl font-bold font-display text-purple-400">{currentPacket.aqi}</div>
              <div className="text-[10px] text-zinc-400 font-mono">PM2.5: {currentPacket.pm25} µg</div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="text-xs text-zinc-400 mb-1">Outdoor Exposure</div>
              <div className="text-2xl font-bold font-display text-cyan-400">{currentPacket.exposureMinutes}m</div>
              <div className="text-[10px] text-zinc-400 font-mono">Continuous</div>
            </div>
          </div>
        </div>

        {/* OLED Virtual Display Preview */}
        <OledVirtualPreview packet={currentPacket} risk={currentRisk} />
      </div>

      {/* 4. PERSONAL RISK CENTER 6-VECTOR OVERVIEW */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold font-display text-white tracking-wide">
            Personal Risk Center (Prototype Vectors)
          </h2>
          <button
            onClick={() => onNavigate('/risk-center')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            <span>Detailed Breakdown</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <RiskScoreCard
            title="Heat Stress Risk"
            score={currentRisk.risks.heat}
            level={currentRisk.levels.heat}
            description="Synthesis of Heat Index, skin temp delta (+1.2°C), and heart rate elevation."
            subFactors={[
              { label: 'Heat Index', value: `${heatIndex}°C` },
              { label: 'Skin Temp Delta', value: `+${currentRisk.baselineDeltas.skinTempDelta}°C` },
            ]}
            onClick={() => onNavigate('/risk-center')}
          />

          <RiskScoreCard
            title="Dehydration Risk"
            score={currentRisk.risks.dehydration}
            level={currentRisk.levels.dehydration}
            description="Continuous cardiovascular strain under prolonged high-temperature exposure."
            subFactors={[
              { label: 'Exposure', value: `${currentPacket.exposureMinutes} mins` },
              { label: 'Work Intensity', value: currentPacket.activityState },
            ]}
            onClick={() => onNavigate('/risk-center')}
          />

          <RiskScoreCard
            title="Respiratory Stress Indicator"
            score={currentRisk.risks.respiratory}
            level={currentRisk.levels.respiratory}
            description="Correlation between ambient PM2.5 particulate matter and SpO₂ oxygen trends."
            subFactors={[
              { label: 'AQI Index', value: currentPacket.aqi },
              { label: 'SpO2 Delta', value: `${currentRisk.baselineDeltas.spo2Delta}%` },
            ]}
            onClick={() => onNavigate('/risk-center')}
          />

          <RiskScoreCard
            title="Fatigue & Strain"
            score={currentRisk.risks.fatigue}
            level={currentRisk.levels.fatigue}
            description="Calculated from estimated sleep duration deficit and continuous physical load."
            subFactors={[
              { label: 'Sleep Est.', value: '7h 10m' },
              { label: 'Consistency', value: '88%' },
            ]}
            onClick={() => onNavigate('/activity')}
          />

          <RiskScoreCard
            title="Cardiovascular Stress"
            score={currentRisk.risks.cardiovascular}
            level={currentRisk.levels.cardiovascular}
            description="Evaluates acute heart rate and estimated blood pressure variance from baseline."
            subFactors={[
              { label: 'HR Delta', value: `+${currentRisk.baselineDeltas.heartRateDelta} BPM` },
              { label: 'BP Status', value: `${currentPacket.systolic}/${currentPacket.diastolic}` },
            ]}
            onClick={() => onNavigate('/vitals')}
          />

          <RiskScoreCard
            title="Fall & Emergency Status"
            score={currentRisk.risks.fallEmergency}
            level={currentRisk.levels.fallEmergency}
            description="MPU6050 3-axis motion vector impact & orientation state machine."
            subFactors={[
              { label: 'Motion Vector', value: '1.02g (Nominal)' },
              { label: 'State', value: currentPacket.activityState },
            ]}
            onClick={() => onNavigate('/emergency')}
          />
        </div>
      </div>

      {/* 5. "WHY AM I AT RISK?" EXPLAINABLE AI SECTION */}
      <WhyAmIAtRisk risk={currentRisk} />
    </div>
  );
};
