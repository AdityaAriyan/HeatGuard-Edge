import React, { useState } from 'react';
import { Shield, Siren, User as UserIcon, Bell, ChevronDown, Check, LogOut, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSimulator } from '../../context/SimulatorContext';
import { OfflineStatusChip } from './OfflineStatusChip';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentRoute }) => {
  const { user, quickLogin, logout } = useAuth();
  const { setScenario, currentScenario, playBuzzerSound } = useSimulator();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);

  const demoProfiles = [
    { email: 'user@heatguard.demo', label: 'Arun Sharma (Worker - Delhi Site)', role: 'WORKER' },
    { email: 'caregiver@heatguard.demo', label: 'Dr. Priya Nair (Lead Caregiver)', role: 'CAREGIVER' },
    { email: 'admin@heatguard.demo', label: 'Rajesh Verma (System Admin)', role: 'ADMIN' },
  ];

  const scenarios = [
    { key: 'NORMAL', label: '🟢 Normal Baseline' },
    { key: 'HEAT_WAVE', label: '🔥 Heat Wave (High Strain)' },
    { key: 'DEHYDRATION', label: '💧 Dehydration Risk' },
    { key: 'AIR_POLLUTION', label: '🌫️ Smog / AQI Hazard' },
    { key: 'FATIGUE', label: '😴 Severe Fatigue Deficit' },
    { key: 'FALL', label: '🚨 Fall & Inactivity Event' },
    { key: 'CRITICAL', label: '⚠️ Multi-Factor Critical' },
    { key: 'FLOOD', label: '🌊 Inundation / Flood Mode' },
    { key: 'CYCLONE', label: '🌪️ Cyclonic Storm Mode' },
  ];

  const handleSosClick = () => {
    playBuzzerSound('CRITICAL');
    onNavigate('/emergency');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090e]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('/dashboard')}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="text-left">
            <div className="font-display font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              <span>HEATGUARD</span>
              <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                EDGE
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono tracking-wider">
              PRIVACY-FIRST HEALTH & DISASTER AI
            </div>
          </div>
        </button>
      </div>

      {/* Center: Live Edge Status Chip */}
      <div className="hidden md:flex items-center">
        <OfflineStatusChip />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Simulator Scenario Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsScenarioMenuOpen(!isScenarioMenuOpen)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-300 hover:bg-zinc-800 transition"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Scenario: {currentScenario}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {isScenarioMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-900 border border-zinc-700 p-1.5 shadow-2xl z-50 animate-fadeIn">
              <div className="px-2.5 py-1 text-[10px] uppercase font-mono text-zinc-400">
                Inject Sensor Scenario
              </div>
              {scenarios.map((sc) => (
                <button
                  key={sc.key}
                  onClick={() => {
                    setScenario(sc.key as any);
                    setIsScenarioMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                    currentScenario === sc.key
                      ? 'bg-cyan-950 text-cyan-300 font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span>{sc.label}</span>
                  {currentScenario === sc.key && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Emergency SOS Quick Button */}
        <button
          onClick={handleSosClick}
          className="btn-danger !py-1.5 !px-3.5 !text-xs !rounded-lg"
          title="Open Emergency SOS center"
        >
          <Siren className="w-4 h-4 animate-spin" />
          <span className="font-bold tracking-wide">SOS</span>
        </button>

        {/* User Account / Role Fast Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-semibold text-white leading-tight truncate max-w-[110px]">
                {user?.full_name || 'Guest User'}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">{user?.role || 'WORKER'}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-zinc-900 border border-zinc-700 p-2 shadow-2xl z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-zinc-800 mb-2">
                <div className="text-xs font-semibold text-white">{user?.full_name}</div>
                <div className="text-[11px] text-zinc-400 font-mono">{user?.email}</div>
                <div className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/50">
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
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between mb-1 transition ${
                    user?.email === p.email
                      ? 'bg-cyan-950 text-cyan-300 font-medium'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div>
                    <div className="font-medium text-white">{p.label}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{p.role}</div>
                  </div>
                  {user?.email === p.email && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}

              <div className="border-t border-zinc-800 mt-2 pt-1">
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                    onNavigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2 transition"
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
