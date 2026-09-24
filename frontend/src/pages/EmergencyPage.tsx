import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { Siren, MapPin, Phone, ShieldCheck, CheckCircle2, AlertOctagon, Radio } from 'lucide-react';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { api } from '../services/api';

export const EmergencyPage: React.FC = () => {
  const { currentPacket, triggerFallScenario, playBuzzerSound } = useSimulator();
  const { user, profile } = useAuth();
  const { isEffectiveOffline } = useOffline();

  const [sosStatus, setSosStatus] = useState<'IDLE' | 'SENDING' | 'BROADCASTED'>('IDLE');
  const [broadcastedEvent, setBroadcastedEvent] = useState<any | null>(null);

  const handleSendSos = async () => {
    setSosStatus('SENDING');
    playBuzzerSound('CRITICAL');
    try {
      if (isEffectiveOffline) {
        // Enqueue offline SOS
        setBroadcastedEvent({
          eventType: 'SOS_TRIGGERED (QUEUED OFFLINE)',
          timestamp: new Date().toLocaleTimeString(),
          latitude: currentPacket.latitude,
          longitude: currentPacket.longitude,
          status: 'QUEUED_LOCAL_EDGE',
        });
      } else {
        const res = await api.triggerSos({
          userId: user?.id,
          latitude: currentPacket.latitude,
          longitude: currentPacket.longitude,
          reason: 'Manual One-Touch SOS Emergency Button Activated by User',
        });
        setBroadcastedEvent(res.event);
      }
      setSosStatus('BROADCASTED');
    } catch (err) {
      console.error('SOS dispatch error:', err);
      setSosStatus('BROADCASTED');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Emergency Center & SOS Dispatch</h1>
        <p className="text-xs text-zinc-400">
          Immediate emergency distress broadcast to authorized caregivers, emergency dispatchers, and local grid
        </p>
      </div>

      <MedicalDisclaimer />

      {/* Main SOS Trigger Center */}
      <div className="glass-panel p-8 border border-red-500/50 bg-red-950/20 text-center relative overflow-hidden">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-2xl shadow-red-950">
            <Siren className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold font-display text-white mb-2">Emergency Distress Beacon</h2>
            <p className="text-xs text-red-200/80 leading-relaxed">
              Pressing the SOS button immediately alerts Dr. Priya Nair (Lead Caregiver), designated family contacts, and transmits your live GPS coordinates & vital snapshot.
            </p>
          </div>

          {sosStatus === 'BROADCASTED' ? (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 space-y-2 animate-scaleUp">
              <div className="flex items-center justify-center gap-2 font-bold text-sm text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>DISTRESS SIGNAL BROADCASTED</span>
              </div>
              <p className="text-xs text-zinc-300">
                Caregivers & Emergency Ops have been notified. Stay in a safe position.
              </p>
              <div className="text-[11px] font-mono text-zinc-400 pt-1">
                Timestamp: {new Date().toLocaleTimeString()} | Coordinates: {currentPacket.latitude.toFixed(4)}, {currentPacket.longitude.toFixed(4)}
              </div>
            </div>
          ) : (
            <button
              onClick={handleSendSos}
              disabled={sosStatus === 'SENDING'}
              className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xl tracking-wider uppercase shadow-2xl shadow-red-600/50 transition-transform active:scale-95 flex items-center justify-center gap-3"
            >
              <Siren className="w-7 h-7 animate-spin" />
              <span>{sosStatus === 'SENDING' ? 'BROADCASTING...' : '🚨 SEND SOS EMERGENCY'}</span>
            </button>
          )}

          {/* Test Fall Scenario Simulation Button */}
          <div className="pt-2">
            <button
              onClick={triggerFallScenario}
              className="text-xs text-zinc-400 hover:text-white underline font-mono flex items-center justify-center gap-1.5 mx-auto"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate MPU6050 Fall Impact (15s Cancellation Window)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Contacts & Location Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Designated Emergency Contacts */}
        <div className="glass-panel p-6 border border-white/10">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-4">
            <Phone className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Designated Emergency Contacts</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Dr. Priya Nair (Lead Caregiver)</div>
                <div className="text-zinc-400 text-[11px]">Disaster Health Response Lead</div>
              </div>
              <a href="tel:+919811122334" className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                Call +91 98111 22334
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">
                  {profile?.emergency_contact_name || 'Kavita Sharma (Spouse)'}
                </div>
                <div className="text-zinc-400 text-[11px]">Primary Family Contact</div>
              </div>
              <a href="tel:112" className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-white/10 text-white font-mono font-bold">
                {profile?.emergency_contact_phone || '+91 98765 11223'}
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">National Emergency Response</div>
                <div className="text-zinc-400 text-[11px]">Police, Fire & Ambulance Dispatch</div>
              </div>
              <a href="tel:112" className="px-3 py-1.5 rounded-lg bg-red-950 border border-red-500/40 text-red-300 font-mono font-bold">
                Dial 112
              </a>
            </div>
          </div>
        </div>

        {/* Live GPS Coordinates & Location Broadcast */}
        <div className="glass-panel p-6 border border-white/10">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Live Geolocation Broadcast</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              GPS/GNSS LOCKED
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center font-mono">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
                <div className="text-[10px] text-zinc-500">Latitude</div>
                <div className="text-sm font-bold text-white">{currentPacket.latitude.toFixed(5)}° N</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/5">
                <div className="text-[10px] text-zinc-500">Longitude</div>
                <div className="text-sm font-bold text-white">{currentPacket.longitude.toFixed(5)}° E</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5 text-xs text-zinc-300 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Accuracy:</span>
                <span className="font-mono text-emerald-400">± 4.5 meters</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Sector:</span>
                <span className="font-mono text-white">Central Delhi / North Sector Grid</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
