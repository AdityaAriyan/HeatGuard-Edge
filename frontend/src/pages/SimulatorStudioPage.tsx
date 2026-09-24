import React from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { useAuth } from '../context/AuthContext';
import { ScenarioType, SCENARIO_PRESETS } from '../edge/sensors/simulatedSensors';
import { OledVirtualPreview } from '../components/simulator/OledVirtualPreview';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import {
  Sliders,
  Radio,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Cpu,
  Flame,
  Droplets,
  Wind,
  Moon,
  AlertOctagon,
  Waves,
  Tornado,
  ShieldCheck,
} from 'lucide-react';

export const SimulatorStudioPage: React.FC = () => {
  const {
    currentScenario,
    currentPacket,
    currentRisk,
    setScenario,
    updateParam,
    isSimulatingLive,
    toggleLiveSimulation,
    playBuzzerSound,
    triggerFallScenario,
  } = useSimulator();
  const { user } = useAuth();

  const scenarioCards: { type: ScenarioType; label: string; icon: any; color: string; desc: string }[] = [
    { type: 'NORMAL', label: 'Normal Baseline', icon: ShieldCheck, color: 'text-emerald-400 border-emerald-500/30', desc: 'Resting/light activity in comfortable conditions.' },
    { type: 'HEAT_WAVE', label: 'Extreme Heat Wave', icon: Flame, color: 'text-orange-400 border-orange-500/30', desc: 'High ambient temperature (>41°C) and elevated skin temp.' },
    { type: 'DEHYDRATION', label: 'Dehydration Risk', icon: Droplets, color: 'text-amber-400 border-amber-500/30', desc: 'Heart rate drift under sustained heat and exertion.' },
    { type: 'AIR_POLLUTION', label: 'Severe Smog / AQI', icon: Wind, color: 'text-purple-400 border-purple-500/30', desc: 'Hazardous AQI (>340) with SpO2 oxygen desaturation.' },
    { type: 'FATIGUE', label: 'Fatigue & Sleep Deficit', icon: Moon, color: 'text-blue-400 border-blue-500/30', desc: 'Cumulative sleep deprivation (<3.5h) and continuous strain.' },
    { type: 'FALL', label: 'MPU6050 Fall Impact', icon: AlertOctagon, color: 'text-red-400 border-red-500/40', desc: 'Sudden gravitational impact spike followed by immobility.' },
    { type: 'CRITICAL', label: 'Multi-Factor Emergency', icon: Flame, color: 'text-rose-400 border-rose-500/40', desc: 'Critical combination of heat stroke, tachycardia & low SpO2.' },
    { type: 'FLOOD', label: 'Flood Inundation', icon: Waves, color: 'text-cyan-400 border-cyan-500/30', desc: 'Water immersion strain and physical exhaustion.' },
    { type: 'CYCLONE', label: 'Cyclonic Storm', icon: Tornado, color: 'text-teal-400 border-teal-500/30', desc: 'Barometric drop and acute cardiovascular anxiety.' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              HARDWARE & SENSOR EMULATION STUDIO
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Edge Device Simulator</h1>
          <p className="text-xs text-zinc-400">
            Inject realistic multi-variable scenarios or manually calibrate live physiological & environmental signals
          </p>
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLiveSimulation}
            className={`btn-outline !text-xs !py-1.5 ${isSimulatingLive ? 'border-emerald-500/50 text-emerald-300' : 'text-zinc-400'}`}
          >
            {isSimulatingLive ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Stream: ON</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-zinc-400" />
                <span>Live Stream: PAUSED</span>
              </>
            )}
          </button>

          <button
            onClick={() => setScenario('NORMAL')}
            className="btn-outline !text-xs !py-1.5"
            title="Reset to Normal Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <MedicalDisclaimer />

      {/* Scenario Presets Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold font-display text-white">Quick Inject Correlated Scenarios</h2>
          <span className="text-xs font-mono text-zinc-400">Active Scenario: <strong className="text-cyan-400">{currentScenario}</strong></span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          {scenarioCards.map((sc) => {
            const Icon = sc.icon;
            const isSelected = currentScenario === sc.type;
            return (
              <button
                key={sc.type}
                onClick={() => setScenario(sc.type)}
                className={`p-4 rounded-2xl glass-panel text-left flex flex-col justify-between border transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-950/30 scale-102 ring-1 ring-cyan-500'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${sc.color}`} />
                    <span className="text-xs font-bold text-white">{sc.label}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500 text-black">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{sc.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Sliders & OLED Hardware Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Manual Telemetry Sliders */}
        <div className="lg:col-span-2 glass-panel p-6 border border-white/10 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Live Manual Telemetry Sliders</h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">Direct Ingestion Bus</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-mono">
            {/* Heart Rate Slider */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Heart Rate (MAX30102):</span>
                <span className="font-bold text-rose-400">{currentPacket.heartRate} BPM</span>
              </div>
              <input
                type="range"
                min="45"
                max="180"
                value={currentPacket.heartRate}
                onChange={(e) => updateParam('heartRate', parseInt(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* SpO2 Slider */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Blood Oxygen (SpO₂):</span>
                <span className="font-bold text-cyan-400">{currentPacket.spo2}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="100"
                step="0.5"
                value={currentPacket.spo2}
                onChange={(e) => updateParam('spo2', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Skin Temp Slider */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Skin Temp (MLX90614):</span>
                <span className="font-bold text-amber-400">{currentPacket.skinTemperature}°C</span>
              </div>
              <input
                type="range"
                min="34"
                max="42"
                step="0.1"
                value={currentPacket.skinTemperature}
                onChange={(e) => updateParam('skinTemperature', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Ambient Temp Slider */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Ambient Temp (SHT31):</span>
                <span className="font-bold text-orange-400">{currentPacket.ambientTemperature}°C</span>
              </div>
              <input
                type="range"
                min="18"
                max="50"
                step="0.5"
                value={currentPacket.ambientTemperature}
                onChange={(e) => updateParam('ambientTemperature', parseFloat(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            {/* Humidity Slider */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Relative Humidity:</span>
                <span className="font-bold text-blue-400">{currentPacket.humidity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={currentPacket.humidity}
                onChange={(e) => updateParam('humidity', parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* AQI Slider */}
            <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Air Quality Index (AQI):</span>
                <span className="font-bold text-purple-400">{currentPacket.aqi} AQI</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                value={currentPacket.aqi}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updateParam('aqi', val);
                  updateParam('pm25', Math.round(val * 0.8));
                }}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Col: OLED Screen Preview & Audio Buzzer Test */}
        <div className="space-y-4">
          <OledVirtualPreview packet={currentPacket} risk={currentRisk} />

          {/* Audio Buzzer Tester */}
          <div className="glass-panel p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>On-Device Audio Buzzer</span>
              </span>
              <span className="text-[10px] text-zinc-400">Web Audio API</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => playBuzzerSound('WARNING')}
                className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-amber-900/40 transition"
              >
                Beep: Warning
              </button>
              <button
                onClick={() => playBuzzerSound('CRITICAL')}
                className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono font-bold hover:bg-red-900/40 transition"
              >
                Alarm: Critical SOS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
