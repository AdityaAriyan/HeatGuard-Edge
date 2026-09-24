import React from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { useAuth } from '../context/AuthContext';
import { VitalCard } from '../components/vitals/VitalCard';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { Heart, Activity, Thermometer, Droplets, Cpu, Navigation, Compass } from 'lucide-react';

export const VitalsPage: React.FC = () => {
  const { currentPacket, currentRisk } = useSimulator();
  const { baseline } = useAuth();

  const motionVector = Math.round(
    Math.sqrt(
      currentPacket.accelX * currentPacket.accelX +
      currentPacket.accelY * currentPacket.accelY +
      currentPacket.accelZ * currentPacket.accelZ
    ) * 100
  ) / 100;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Vitals & Deep Sensor Telemetry</h1>
        <p className="text-xs text-zinc-400">
          Raw hardware-abstracted streaming signals from MAX30102, MLX90614, MPU6050, and BP Estimator
        </p>
      </div>

      <MedicalDisclaimer />

      {/* Primary 4 Vitals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <VitalCard
          type="HEART_RATE"
          label="Heart Rate (MAX30102 PPG)"
          value={currentPacket.heartRate}
          unit="BPM"
          baselineValue={baseline?.baseline_heart_rate ? `${baseline.baseline_heart_rate} BPM` : '72 BPM'}
          delta={currentRisk.baselineDeltas.heartRateDelta}
          status={currentPacket.heartRate > 110 ? 'CRITICAL' : currentPacket.heartRate > 90 ? 'ELEVATED' : 'NORMAL'}
        />

        <VitalCard
          type="SPO2"
          label="Blood Oxygen (SpO₂)"
          value={`${currentPacket.spo2}%`}
          unit="%"
          baselineValue={baseline?.baseline_spo2 ? `${baseline.baseline_spo2}%` : '98.5%'}
          delta={currentRisk.baselineDeltas.spo2Delta}
          status={currentPacket.spo2 < 92 ? 'CRITICAL' : currentPacket.spo2 < 95 ? 'ELEVATED' : 'NORMAL'}
        />

        <VitalCard
          type="SKIN_TEMP"
          label="Skin Temp (MLX90614 Infrared)"
          value={`${currentPacket.skinTemperature}°C`}
          unit="°C"
          baselineValue={baseline?.baseline_skin_temp ? `${baseline.baseline_skin_temp}°C` : '36.4°C'}
          delta={currentRisk.baselineDeltas.skinTempDelta}
          status={currentPacket.skinTemperature > 38.0 ? 'CRITICAL' : currentPacket.skinTemperature > 37.2 ? 'ELEVATED' : 'NORMAL'}
        />

        <VitalCard
          type="BLOOD_PRESSURE"
          label="Blood Pressure (Modular)"
          value={`${currentPacket.systolic}/${currentPacket.diastolic}`}
          unit="mmHg"
          isEstimated={true}
          baselineValue={baseline?.baseline_systolic ? `${baseline.baseline_systolic}/${baseline.baseline_diastolic}` : '120/80'}
          status={currentPacket.systolic > 140 ? 'CRITICAL' : currentPacket.systolic > 130 ? 'ELEVATED' : 'NORMAL'}
        />
      </div>

      {/* MPU6050 Motion, Acceleration & Gyroscope 3-Axis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MPU6050 Accelerometer */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">MPU6050 3-Axis Accelerometer</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Vector: {motionVector}g
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="text-[10px] text-zinc-500 font-mono">Accel X</div>
              <div className="text-lg font-bold font-mono text-cyan-400">{currentPacket.accelX} g</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="text-[10px] text-zinc-500 font-mono">Accel Y</div>
              <div className="text-lg font-bold font-mono text-cyan-400">{currentPacket.accelY} g</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="text-[10px] text-zinc-500 font-mono">Accel Z</div>
              <div className="text-lg font-bold font-mono text-cyan-400">{currentPacket.accelZ} g</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-zinc-900/40 border border-white/5 font-mono">
            <span className="text-zinc-400">Classified Activity State:</span>
            <span className="text-emerald-400 font-bold">{currentPacket.activityState}</span>
          </div>
        </div>

        {/* MPU6050 Gyroscope */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">MPU6050 3-Axis Gyroscope</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Orientation Tilt Rate</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="text-[10px] text-zinc-500 font-mono">Gyro X</div>
              <div className="text-lg font-bold font-mono text-indigo-400">{currentPacket.gyroX}°/s</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="text-[10px] text-zinc-500 font-mono">Gyro Y</div>
              <div className="text-lg font-bold font-mono text-indigo-400">{currentPacket.gyroY}°/s</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
              <div className="text-[10px] text-zinc-500 font-mono">Gyro Z</div>
              <div className="text-lg font-bold font-mono text-indigo-400">{currentPacket.gyroZ}°/s</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-zinc-900/40 border border-white/5 font-mono">
            <span className="text-zinc-400">Fall Detection Filter:</span>
            <span className={currentPacket.activityState === 'POSSIBLE_FALL' ? 'text-red-400 font-bold animate-pulse' : 'text-zinc-300'}>
              {currentPacket.activityState === 'POSSIBLE_FALL' ? '⚠️ IMPACT TRIGGERED' : 'ARMED & MONITORING'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
