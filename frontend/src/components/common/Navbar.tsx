import React, { useState } from 'react';
import {
  Shield,
  Siren,
  Bell,
  ChevronDown,
  Check,
  LogOut,
  Radio,
  Sliders,
  User,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSimulator } from '../../context/SimulatorContext';
import { OfflineStatusChip } from './OfflineStatusChip';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentRoute }) => {
  const { user, quickLogin, logout } = useAuth();
  const { setScenario, currentScenario, playBuzzerSound, currentRisk } = useSimulator();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const demoProfiles = [
    { email: 'user@heatguard.demo', label: 'Arun Sharma', role: 'WORKER', site: 'Delhi Infrastructure Site' },
    { email: 'caregiver@heatguard.demo', label: 'Dr. Priya Nair', role: 'CAREGIVER', site: 'Disaster Health Response Lead' },
    { email: 'admin@heatguard.demo', label: 'Rajesh Verma', role: 'ADMIN', site: 'HQ Sensor Grid Control' },
  ];

  const scenarios = [
    { key: 'NORMAL', label: '🟢 Normal Baseline', desc: 'Nominal physiological vitals' },
    { key: 'HEAT_WAVE', label: '🔥 Extreme Heat Wave', desc: 'Ambient >41°C, high skin temp' },
    { key: 'DEHYDRATION', label: '💧 Dehydration Risk', desc: 'Heart rate drift under heat' },
    { key: 'AIR_POLLUTION', label: '🌫️ Hazardous AQI & Smog', desc: 'PM2.5 >250, SpO₂ decline' },
    { key: 'FATIGUE', label: '😴 Severe Sleep Deficit', desc: 'Overnight deficit & physical strain' },
    { key: 'FALL', label: '🚨 MPU6050 Fall Impact', desc: 'Impact spike >2.8g + immobility' },
    { key: 'CRITICAL', label: '⚠️ Multi-Factor Emergency', desc: 'Severe multi-system strain' },
    { key: 'FLOOD', label: '🌊 Flood Inundation Mode', desc: 'High humidity, water wading' },
    { key: 'CYCLONE', label: '🌪️ Cyclonic Storm Mode', desc: 'Barometric drop & high anxiety' },
  ];

  const handleSosClick = () => {
    playBuzzerSound('CRITICAL');
    onNavigate('/emergency');
  };

  const isAlertActive = currentRisk.overallLevel === 'HIGH' || currentRisk.overallLevel === 'CRITICAL';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090e]/95 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-xl">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#080d1a] rounded-[14px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="text-left">
            <div className="font-display font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
              <span>HEATGUARD</span>
              <span className="text-cyan-400 font-bold">EDGE</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                AI
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono tracking-wider">
              PRIVACY-PRESERVING HEALTH & DISASTER AI
            </div>
          </div>
        </button>
      </div>

      {/* Center: Live Edge Status & Synchronization */}
      <div className="hidden md:flex items-center gap-3">
        <OfflineStatusChip />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Simulator Scenario Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsScenarioMenuOpen(!isScenarioMenuOpen)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700 text-xs font-mono text-zinc-200 hover:bg-zinc-800 hover:border-cyan-500/40 transition shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-zinc-400">Scenario:</span>
            <span className="font-bold text-white truncate max-w-[130px]">{currentScenario}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {isScenarioMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0b101d] border border-zinc-700 p-2 shadow-2xl z-50 animate-scaleUp">
              <div className="px-3 py-1.5 text-[10px] uppercase font-mono font-bold text-zinc-400 border-b border-white/5 mb-1.5 flex items-center justify-between">
                <span>Inject Sensor Scenario</span>
                <Sliders className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1">
                {scenarios.map((sc) => (
                  <button
                    key={sc.key}
                    onClick={() => {
                      setScenario(sc.key as any);
                      setIsScenarioMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition ${
                      currentScenario === sc.key
                        ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{sc.label}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{sc.desc}</div>
                    </div>
                    {currentScenario === sc.key && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Priority Alerts Drawer Button */}
        <div className="relative">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className={`p-2 rounded-xl border transition relative ${
              isAlertActive
                ? 'bg-red-950/60 border-red-500/50 text-red-400 animate-pulse'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
            }`}
            title="Active Safety Alerts"
          >
            <Bell className="w-4 h-4" />
            {isAlertActive && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-black" />
            )}
          </button>

          {isAlertsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0b101d] border border-zinc-700 p-3 shadow-2xl z-50 animate-scaleUp text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Real-Time Anomaly Stream</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isAlertActive ? 'badge-risk-critical' : 'badge-risk-low'}`}>
                  {currentRisk.overallLevel}
                </span>
              </div>

              <div className="space-y-2">
                {currentRisk.reasons.length > 0 ? (
                  currentRisk.reasons.map((r, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-zinc-300 text-[11px] leading-relaxed">
                      {r}
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-zinc-400 text-[11px]">
                    All monitored parameters within safe personal baseline.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Emergency SOS Quick Button */}
        <button
          onClick={handleSosClick}
          className="btn-danger !py-1.5 !px-3.5 !text-xs !rounded-xl"
          title="Open Emergency SOS center"
        >
          <Siren className="w-4 h-4 animate-spin" />
          <span className="font-bold tracking-wide">SOS</span>
        </button>

        {/* User Account / Role Fast Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-cyan-500/50 transition shadow-sm"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-semibold text-white leading-tight truncate max-w-[120px]">
                {user?.full_name || 'Worker'}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono font-medium">{user?.role || 'WORKER'}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0b101d] border border-zinc-700 p-2 shadow-2xl z-50 animate-scaleUp">
              <div className="px-3 py-2.5 border-b border-zinc-800 mb-2">
                <div className="text-xs font-semibold text-white">{user?.full_name}</div>
                <div className="text-[11px] text-zinc-400 font-mono">{user?.email}</div>
                <div className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/50">
                  Role: {user?.role}
                </div>
              </div>

              <div className="px-3 py-1 text-[10px] uppercase font-mono text-zinc-400 font-bold">
                Fast Switch Demo Persona
              </div>

              {demoProfiles.map((p) => (
                <button
                  key={p.email}
                  onClick={async () => {
                    await quickLogin(p.email);
                    setIsUserMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between mb-1 transition ${
                    user?.email === p.email
                      ? 'bg-cyan-950 text-cyan-300 font-medium border border-cyan-500/30'
                      : 'text-zinc-300 hover:bg-zinc-800/80'
                  }`}
                >
                  <div>
                    <div className="font-medium text-white">{p.label}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{p.role} • {p.site}</div>
                  </div>
                  {user?.email === p.email && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}

              <div className="border-t border-zinc-800 mt-2 pt-1.5">
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                    onNavigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
