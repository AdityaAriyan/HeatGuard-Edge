import React from 'react';
import { EdgeSensorPacket } from '../../edge/sensors/interfaces';
import { RiskAssessmentResult } from '../../edge/risk-engine/EdgeRiskEngine';
import { Cpu, WifiOff } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';

interface OledVirtualPreviewProps {
  packet: EdgeSensorPacket;
  risk: RiskAssessmentResult;
}

export const OledVirtualPreview: React.FC<OledVirtualPreviewProps> = ({ packet, risk }) => {
  const { isEffectiveOffline } = useOffline();

  return (
    <div className="glass-panel p-4 flex flex-col items-center justify-center">
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>VIRTUAL WEARABLE OLED PREVIEW (128×64)</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">ESP32 / DRAGONWING</span>
      </div>

      {/* OLED Physical Screen Mock */}
      <div className="oled-screen w-full max-w-sm p-3.5 min-h-[140px] flex flex-col justify-between select-none">
        {/* Top OLED Status Bar */}
        <div className="flex items-center justify-between text-[11px] border-b border-[#00f2fe]/30 pb-1 mb-1.5 font-mono">
          <span className="font-bold">HEATGUARD-EDGE</span>
          <div className="flex items-center gap-1.5">
            {isEffectiveOffline && <span className="text-[10px] text-amber-300">OFFLINE</span>}
            <span className="text-[10px]">BAT: 88%</span>
          </div>
        </div>

        {/* Middle OLED Vitals Grid */}
        <div className="grid grid-cols-3 gap-1 text-center py-1 font-mono">
          <div className="p-1 rounded bg-[#00f2fe]/5 border border-[#00f2fe]/20">
            <div className="text-[9px] text-[#00f2fe]/70">HR</div>
            <div className="text-base font-bold text-[#00f2fe]">{packet.heartRate}</div>
          </div>
          <div className="p-1 rounded bg-[#00f2fe]/5 border border-[#00f2fe]/20">
            <div className="text-[9px] text-[#00f2fe]/70">SpO2</div>
            <div className="text-base font-bold text-[#00f2fe]">{packet.spo2}%</div>
          </div>
          <div className="p-1 rounded bg-[#00f2fe]/5 border border-[#00f2fe]/20">
            <div className="text-[9px] text-[#00f2fe]/70">SKIN</div>
            <div className="text-base font-bold text-[#00f2fe]">{packet.skinTemperature}°</div>
          </div>
        </div>

        {/* Bottom OLED Alert / Risk Indicator */}
        <div className="mt-1 pt-1 border-t border-[#00f2fe]/30 flex items-center justify-between text-[10px] font-mono">
          <span>RISK: {risk.overallLevel} ({risk.overallScore})</span>
          <span className="truncate max-w-[140px]">
            {risk.overallLevel === 'CRITICAL'
              ? 'ALARM: SEEK COOLING'
              : risk.overallLevel === 'HIGH'
              ? 'WARNING: TAKE REST'
              : 'STATUS: NORMAL'}
          </span>
        </div>
      </div>
    </div>
  );
};
