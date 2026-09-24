import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, UserCheck, ShieldAlert, Cpu } from 'lucide-react';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, quickLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    }
  };

  const handleQuick = async (demoEmail: string) => {
    setError('');
    try {
      await quickLogin(demoEmail);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-panel p-8 border border-white/10 shadow-2xl relative z-10 space-y-6 animate-scaleUp">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold font-display text-white tracking-tight">HEATGUARD-EDGE</h1>
          <p className="text-xs text-zinc-400 font-mono">Privacy-Preserving Personal Health & Disaster AI</p>
        </div>

        <MedicalDisclaimer compact={true} />

        {/* 1-Click Fast Demo Login Buttons */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase font-mono text-zinc-400 font-bold tracking-wider text-center">
            Fast 1-Click Demo Login
          </div>

          <button
            onClick={() => handleQuick('user@heatguard.demo')}
            className="w-full p-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-left flex items-center justify-between transition group"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                Arun Sharma (Worker - Delhi Site)
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">user@heatguard.demo</div>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleQuick('caregiver@heatguard.demo')}
            className="w-full p-3 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-left flex items-center justify-between transition group"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                Dr. Priya Nair (Lead Caregiver)
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">caregiver@heatguard.demo</div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleQuick('admin@heatguard.demo')}
            className="w-full p-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-left flex items-center justify-between transition group"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                Rajesh Verma (System Admin)
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">admin@heatguard.demo</div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#090d16] px-3 text-[10px] font-mono text-zinc-500 uppercase">or custom login</span>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleManualLogin} className="space-y-4 text-xs font-mono">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="text-zinc-400 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@heatguard.demo"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary justify-center !py-2.5 !text-xs !font-bold mt-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In with HeatGuard ID'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
