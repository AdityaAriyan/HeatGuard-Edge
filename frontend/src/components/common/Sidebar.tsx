import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Heart,
  CloudSun,
  Moon,
  Flame,
  Siren,
  LineChart,
  ShieldLock,
  Users,
  Sliders,
  Server,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate }) => {
  const { user } = useAuth();
  const isCaregiverOrAdmin = user?.role === 'CAREGIVER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  const userNavItems = [
    { route: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Overview' },
    { route: '/risk-center', label: 'Risk Center', icon: Activity, badge: 'Edge AI' },
    { route: '/vitals', label: 'Vitals & Sensors', icon: Heart },
    { route: '/environment', label: 'Environment', icon: CloudSun },
    { route: '/activity', label: 'Activity & Sleep', icon: Moon },
    { route: '/disaster-mode', label: 'Disaster Mode', icon: Flame, alert: true },
    { route: '/emergency', label: 'Emergency & SOS', icon: Siren, isSos: true },
    { route: '/history', label: 'Trends & History', icon: LineChart },
    { route: '/privacy', label: 'Privacy Center', icon: ShieldLock },
  ];

  const toolsNavItems = [
    { route: '/simulator', label: 'Sensor Simulator', icon: Sliders, badge: 'Live Grid' },
  ];

  const caregiverNavItems = [
    { route: '/caregiver', label: 'Care & Safety Monitor', icon: Users, badge: 'Triage' },
  ];

  const adminNavItems = [
    { route: '/admin', label: 'Admin & Devices', icon: Server },
  ];

  return (
    <aside className="w-64 bg-[#090d16] border-r border-white/10 flex flex-col justify-between py-4 px-3 flex-shrink-0 min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        {/* Personal Companion Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Personal Health Companion
          </div>
          <nav className="space-y-1">
            {userNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : item.isSos ? 'text-red-400' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Caregiver & Management Section */}
        {isCaregiverOrAdmin && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-cyan-400/80 font-bold">
              Caregiver Triage & Ops
            </div>
            <nav className="space-y-1">
              {caregiverNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    onClick={() => onNavigate(item.route)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-950/80 to-blue-950/40 text-indigo-300 border border-indigo-500/40 shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/30 text-indigo-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Simulation & Admin Tools */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Hardware & Simulation
          </div>
          <nav className="space-y-1">
            {toolsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {isAdmin &&
              adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    onClick={() => onNavigate(item.route)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-950/80 to-blue-950/40 text-purple-300 border border-purple-500/40 shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-zinc-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
          </nav>
        </div>
      </div>

      {/* Footer Edge Hardware Badge */}
      <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/5 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center justify-between mb-1">
          <span className="text-zinc-300 font-semibold">Wearable Grid</span>
          <span className="text-emerald-400 text-[10px]">● SYNCED</span>
        </div>
        <div className="text-[10px] text-zinc-400 truncate">
          ID: {user?.id ? `DEV-${user.id.substring(4)}` : 'DEV-HG-EDGE-01'}
        </div>
      </div>
    </aside>
  );
};
