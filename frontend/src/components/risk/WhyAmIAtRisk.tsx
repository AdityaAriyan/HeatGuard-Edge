import React from 'react';
import { HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { RiskAssessmentResult } from '../../edge/risk-engine/EdgeRiskEngine';

interface WhyAmIAtRiskProps {
  risk: RiskAssessmentResult | null;
}

export const WhyAmIAtRisk: React.FC<WhyAmIAtRiskProps> = ({ risk }) => {
  if (!risk) return null;

  const reasons = risk.reasons || [];
  const recommendations = risk.recommendations || [];
  const isHighRisk = risk.overallLevel === 'HIGH' || risk.overallLevel === 'CRITICAL';

  return (
    <div className={`glass-panel p-6 border ${isHighRisk ? 'border-amber-500/40 bg-amber-950/10' : 'border-white/10'}`}>
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Why Am I At Risk?</h3>
            <p className="text-xs text-zinc-400">Feature-attributed Edge-AI physiological & environmental analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400">Analysis Mode:</span>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            Local Edge First
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Contributing Reasons */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase font-mono tracking-wider text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Detected Risk Contributors</span>
          </div>

          <div className="space-y-2.5">
            {reasons.length === 0 ? (
              <div className="p-3 rounded-xl bg-white/5 text-xs text-zinc-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>No major physiological or environmental deviations detected.</span>
              </div>
            ) : (
              reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-xs text-zinc-200 flex items-start gap-2.5 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>{reason}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Actionable Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase font-mono tracking-wider text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Personalized Safety Actions</span>
          </div>

          <div className="space-y-2.5">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-100 flex items-start gap-2.5 leading-relaxed"
              >
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
