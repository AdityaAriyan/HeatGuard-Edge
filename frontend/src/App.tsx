import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { SimulatorProvider } from './context/SimulatorContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { FallAlertModal } from './components/common/FallAlertModal';

// HeatGuard-Edge Pages
import { PersonalDashboard } from './pages/PersonalDashboard';
import { PersonalRiskCenter } from './pages/PersonalRiskCenter';
import { VitalsPage } from './pages/VitalsPage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { ActivitySleepPage } from './pages/ActivitySleepPage';
import { DisasterModePage } from './pages/DisasterModePage';
import { EmergencyPage } from './pages/EmergencyPage';
import { HistoryTrendsPage } from './pages/HistoryTrendsPage';
import { PrivacyCenterPage } from './pages/PrivacyCenterPage';
import { CaregiverSafetyMonitor } from './pages/CaregiverSafetyMonitor';
import { SimulatorStudioPage } from './pages/SimulatorStudioPage';
import { AdminCenterPage } from './pages/AdminCenterPage';
import { LoginPage } from './pages/LoginPage';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<string>('/dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center font-mono text-cyan-400 text-xs select-none">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 shadow-2xl">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold tracking-wider uppercase">INITIALIZING HEATGUARD-EDGE PLATFORM...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => setCurrentRoute('/dashboard')} />;
  }

  const renderActivePage = () => {
    switch (currentRoute) {
      case '/dashboard':
        return <PersonalDashboard onNavigate={setCurrentRoute} />;
      case '/risk-center':
        return <PersonalRiskCenter />;
      case '/vitals':
        return <VitalsPage />;
      case '/environment':
        return <EnvironmentPage />;
      case '/activity':
        return <ActivitySleepPage />;
      case '/disaster-mode':
        return <DisasterModePage />;
      case '/emergency':
        return <EmergencyPage />;
      case '/history':
        return <HistoryTrendsPage />;
      case '/privacy':
        return <PrivacyCenterPage />;
      case '/caregiver':
        return <CaregiverSafetyMonitor />;
      case '/simulator':
        return <SimulatorStudioPage />;
      case '/admin':
        return <AdminCenterPage />;
      default:
        return <PersonalDashboard onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-[#f8fafc]">
      <Navbar currentRoute={currentRoute} onNavigate={setCurrentRoute} />
      <div className="flex flex-1">
        <Sidebar currentRoute={currentRoute} onNavigate={setCurrentRoute} />
        <main className="flex-1 p-4 lg:p-8 max-w-[1540px] mx-auto w-full min-w-0">
          {renderActivePage()}
        </main>
      </div>
      <FallAlertModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <SimulatorProvider>
          <MainApp />
        </SimulatorProvider>
      </OfflineProvider>
    </AuthProvider>
  );
}
