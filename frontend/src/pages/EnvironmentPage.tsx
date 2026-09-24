import React from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { CloudSun, Wind, Droplets, Sun, AlertTriangle, ShieldCheck, Gauge } from 'lucide-react';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

export const EnvironmentPage: React.FC = () => {
  const { currentPacket } = useSimulator();

  const heatIndex = Math.round(
    currentPacket.ambientTemperature + (currentPacket.humidity > 60 ? (currentPacket.humidity - 60) * 0.15 : 0)
  );

  const getAqiCategory = (aqi: number) => {
    if (aqi > 300) return { label: 'Hazardous (Severe Smog)', color: 'text-rose-400 bg-rose-950/60 border-rose-500/40' };
    if (aqi > 200) return { label: 'Very Unhealthy', color: 'text-purple-400 bg-purple-950/60 border-purple-500/40' };
    if (aqi > 150) return { label: 'Unhealthy', color: 'text-red-400 bg-red-950/60 border-red-500/40' };
    if (aqi > 100) return { label: 'Moderate', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40' };
    return { label: 'Good / Clean', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' };
  };

  const aqiInfo = getAqiCategory(currentPacket.aqi);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Environmental Awareness</h1>
        <p className="text-xs text-zinc-400">
          Hyperlocal ambient temperature, humidity, calculated Heat Index, and air particulate pollution tracking
        </p>
      </div>

      <MedicalDisclaimer />

      {/* Main Environmental Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ambient Temperature */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Ambient Temperature</span>
            <Sun className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-display text-white">{currentPacket.ambientTemperature}°C</div>
          <div className="text-[11px] text-zinc-500 font-mono mt-2">SHT31 Environmental Sensor</div>
        </div>

        {/* Humidity */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Relative Humidity</span>
            <Droplets className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-display text-white">{currentPacket.humidity}%</div>
          <div className="text-[11px] text-zinc-500 font-mono mt-2">Moisture Saturation</div>
        </div>

        {/* Calculated Heat Index */}
        <div className="glass-panel p-5 border border-amber-500/30 bg-amber-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-300 font-medium">Calculated Heat Index</span>
            <Gauge className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-display text-amber-400">{heatIndex}°C</div>
          <div className="text-[11px] text-amber-300/70 font-mono mt-2">Apparent Thermal Feel</div>
        </div>

        {/* Air Quality Index */}
        <div className="glass-panel p-5 border border-purple-500/30 bg-purple-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-purple-300 font-medium">Air Quality (AQI)</span>
            <Wind className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold font-display text-purple-400">{currentPacket.aqi}</div>
          <div className="text-[11px] text-purple-300/70 font-mono mt-2">PM2.5: {currentPacket.pm25} µg/m³</div>
        </div>
      </div>

      {/* Environmental Impact Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thermal Strain Guidance */}
        <div className="glass-panel p-6 border border-white/10">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-4">
            <Sun className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold font-display text-white">Thermal Load on Your Body</h2>
          </div>

          <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
            <p>
              When ambient temperature exceeds 38°C combined with humidity above 60%, the body's natural evaporative cooling through sweat becomes significantly hindered.
            </p>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-zinc-400">Continuous Exposure:</span>
                <span className="text-amber-400 font-bold">{currentPacket.exposureMinutes} Minutes</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-zinc-400">Recommended Rest Cycle:</span>
                <span className="text-cyan-400 font-bold">15 min rest every 45 min work</span>
              </div>
            </div>
          </div>
        </div>

        {/* Air Quality Guidance */}
        <div className="glass-panel p-6 border border-white/10">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <Wind className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold font-display text-white">Particulate Pollution Severity</h2>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${aqiInfo.color}`}>
              {aqiInfo.label}
            </span>
          </div>

          <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
            <p>
              High fine particulate matter (PM2.5) enters deep into lung alveoli and can cause acute airway inflammation, reflected as early SpO₂ oxygen saturation decreases on your MAX30102 sensor.
            </p>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-zinc-400">Current SpO₂ Telemetry:</span>
                <span className="text-white font-bold">{currentPacket.spo2}%</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-zinc-400">Respirator Advisory:</span>
                <span className="text-purple-300 font-bold">{currentPacket.aqi > 150 ? 'Mandatory N95 / FFP2' : 'Optional'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
