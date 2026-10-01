import React, { useState, useEffect } from 'react';
import { CustomerProfile, WhatIfSimulationResponse } from '../types';
import { simulateWhatIf } from '../services/api';
import { Sliders, ArrowRight, DollarSign, Sparkles, CheckCircle2, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { RiskGauge } from './RiskGauge';
import { CountUp } from './CountUp';

interface WhatIfSimulatorProps {
  baselineProfile: CustomerProfile;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ baselineProfile }) => {
  const [simulatedProfile, setSimulatedProfile] = useState<CustomerProfile>({ ...baselineProfile });
  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSimulatedProfile({ ...baselineProfile });
  }, [baselineProfile]);

  const runSimulation = async (profileToSimulate: CustomerProfile) => {
    setLoading(true);
    try {
      const res = await simulateWhatIf(baselineProfile, profileToSimulate);
      setSimulationResult(res);
    } catch (e) {
      console.error('Simulation failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation(simulatedProfile);
  }, [simulatedProfile, baselineProfile]);

  const updateSimulated = (key: keyof CustomerProfile, value: any) => {
    setSimulatedProfile((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const applyInterventionPreset = (type: 'contract' | 'support' | 'retention_package') => {
    let updated = { ...simulatedProfile };
    if (type === 'contract') {
      updated.contract_type = 'One-Year';
      updated.nps_score = Math.min(10, updated.nps_score + 1);
    } else if (type === 'support') {
      updated.has_tech_support = true;
      updated.support_tickets_90d = Math.max(0, updated.support_tickets_90d - 3);
    } else if (type === 'retention_package') {
      updated.contract_type = 'Two-Year';
      updated.has_tech_support = true;
      updated.support_tickets_90d = 0;
      updated.usage_trend_pct = Math.max(15, updated.usage_trend_pct + 25);
      updated.nps_score = Math.min(10, updated.nps_score + 2);
    }
    setSimulatedProfile(updated);
  };

  const resetToBaseline = () => {
    setSimulatedProfile({ ...baselineProfile });
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="glass-panel p-5 border border-[#293548]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg text-[#F3EFE6] font-medium flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#E5A93C]" />
              Sensitivity Analysis & What-If Scenario Sandbox
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Simulate operational & contractual interventions to observe real-time risk mitigation and protected revenue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyInterventionPreset('contract')}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              + 1-Year Lock-in
            </button>
            <button
              onClick={() => applyInterventionPreset('support')}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              + Dedicated Tech Tier
            </button>
            <button
              onClick={() => applyInterventionPreset('retention_package')}
              className="btn-primary text-xs px-3.5 py-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>Full Retention Bundle</span>
            </button>
            <button
              onClick={resetToBaseline}
              className="btn-secondary text-xs px-2.5 py-1.5 text-[#94A3B8]"
              title="Reset to Baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Scoreboard */}
      {simulationResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Baseline Card */}
          <div className="glass-panel p-4 flex flex-col justify-between border border-[#293548]">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
                Current Baseline Risk
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <CountUp
                  value={simulationResult.baseline_prediction.churn_probability}
                  decimals={1}
                  suffix="%"
                  className="font-mono text-3xl font-bold text-[#F3EFE6]"
                />
                <span className={`px-2 py-0.5 text-xs font-mono font-medium rounded ${
                  simulationResult.baseline_prediction.risk_tier === 'Critical' ? 'badge-risk-critical' :
                  simulationResult.baseline_prediction.risk_tier === 'High' ? 'badge-risk-high' :
                  simulationResult.baseline_prediction.risk_tier === 'Moderate' ? 'badge-risk-moderate' : 'badge-risk-low'
                }`}>
                  {simulationResult.baseline_prediction.risk_tier}
                </span>
              </div>
              <div className="text-xs text-[#94A3B8] mt-2 font-mono flex items-center gap-1">
                <span>Exposure:</span>
                <CountUp
                  value={simulationResult.baseline_prediction.revenue_at_risk}
                  prefix="$"
                  decimals={2}
                  className="text-[#F87171] font-semibold"
                />
                <span>/yr</span>
              </div>
            </div>
            <div className="text-[11px] text-[#64748B] mt-3 pt-2 border-t border-[#242E40] truncate">
              Account: {baselineProfile.company_name || 'Acme Corp'}
            </div>
          </div>

          {/* Delta Transformation Card */}
          <div className="glass-panel p-4 bg-[#1E2636] border border-[#5B86E5]/50 flex flex-col justify-between relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#E5A93C] font-semibold block">
                Intervention Delta & Protection
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`font-mono text-3xl font-bold ${
                  simulationResult.probability_delta < 0 ? 'text-[#34D399]' : 'text-[#F87171]'
                }`}>
                  {simulationResult.probability_delta > 0 ? `+${simulationResult.probability_delta}` : simulationResult.probability_delta}%
                </span>
                <span className="text-xs text-[#94A3B8] font-mono">Risk Delta</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#34D399] mt-2 font-mono font-semibold">
                <DollarSign className="w-3.5 h-3.5" />
                <CountUp
                  value={simulationResult.revenue_saved}
                  prefix="$"
                  decimals={2}
                  suffix=" Protected MRR/yr"
                />
              </div>
            </div>
            <div className="text-[11px] text-[#94A3B8] mt-3 pt-2 border-t border-[#242E40]">
              {simulationResult.key_interventions_identified.length} active parameter adjustments
            </div>
          </div>

          {/* Simulated Result Card */}
          <div className="glass-panel p-4 flex flex-col justify-between border border-[#293548]">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
                Projected Post-Intervention Risk
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <CountUp
                  value={simulationResult.simulated_prediction.churn_probability}
                  decimals={1}
                  suffix="%"
                  className="font-mono text-3xl font-bold text-[#F3EFE6]"
                />
                <span className={`px-2 py-0.5 text-xs font-mono font-medium rounded ${
                  simulationResult.simulated_prediction.risk_tier === 'Critical' ? 'badge-risk-critical' :
                  simulationResult.simulated_prediction.risk_tier === 'High' ? 'badge-risk-high' :
                  simulationResult.simulated_prediction.risk_tier === 'Moderate' ? 'badge-risk-moderate' : 'badge-risk-low'
                }`}>
                  {simulationResult.simulated_prediction.risk_tier}
                </span>
              </div>
              <div className="text-xs text-[#94A3B8] mt-2 font-mono flex items-center gap-1">
                <span>Residual Exposure:</span>
                <CountUp
                  value={simulationResult.simulated_prediction.revenue_at_risk}
                  prefix="$"
                  decimals={2}
                  className="text-[#F3EFE6] font-semibold"
                />
                <span>/yr</span>
              </div>
            </div>
            <div className="text-[11px] text-[#34D399] mt-3 pt-2 border-t border-[#242E40] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Target State Optimized</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Controls & Simulated Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Interactive Sliders */}
        <div className="glass-panel p-5 space-y-4 border border-[#293548]">
          <div className="flex items-center justify-between border-b border-[#242E40] pb-2">
            <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8]">
              Simulated Lever Controls
            </span>
            <span className="text-[11px] text-[#5B86E5] font-mono">Live Sensitivity</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#94A3B8] mb-1 font-mono">Contract Term Intervention</label>
              <select
                value={simulatedProfile.contract_type}
                onChange={(e) => updateSimulated('contract_type', e.target.value)}
                className="w-full text-xs font-mono"
              >
                <option value="Month-to-Month">Month-to-Month (Unchanged)</option>
                <option value="One-Year">1-Year Fixed Commitment</option>
                <option value="Two-Year">2-Year Enterprise Term</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#94A3B8] font-mono">Target Support Tickets (90d)</label>
                <span className="font-mono text-[#F3EFE6] font-semibold">{simulatedProfile.support_tickets_90d} tickets</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={simulatedProfile.support_tickets_90d}
                onChange={(e) => updateSimulated('support_tickets_90d', Number(e.target.value))}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#94A3B8] font-mono">Target Usage Velocity Trend</label>
                <span className="font-mono text-[#F3EFE6] font-semibold">
                  {simulatedProfile.usage_trend_pct > 0 ? `+${simulatedProfile.usage_trend_pct}` : simulatedProfile.usage_trend_pct}%
                </span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                step="5"
                value={simulatedProfile.usage_trend_pct}
                onChange={(e) => updateSimulated('usage_trend_pct', Number(e.target.value))}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#94A3B8] font-mono">Target NPS Sentiment</label>
                <span className="font-mono text-[#F3EFE6] font-semibold">{simulatedProfile.nps_score} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={simulatedProfile.nps_score}
                onChange={(e) => updateSimulated('nps_score', Number(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-md bg-[#161D27] border border-[#242E40]">
              <div>
                <span className="text-xs text-[#F3EFE6] font-medium block">Dedicated Technical Support Tier</span>
                <span className="text-[10px] text-[#94A3B8] block">Assign senior engineer to account</span>
              </div>
              <input
                type="checkbox"
                checked={simulatedProfile.has_tech_support}
                onChange={(e) => updateSimulated('has_tech_support', e.target.checked)}
                className="w-4 h-4 rounded accent-[#5B86E5] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Projected Risk Gauge & Interventions Summary */}
        <div className="space-y-4">
          {simulationResult && (
            <RiskGauge
              probability={simulationResult.simulated_prediction.churn_probability}
              riskTier={simulationResult.simulated_prediction.risk_tier}
              riskColor={simulationResult.simulated_prediction.risk_color}
              predictedChurn={simulationResult.simulated_prediction.predicted_churn}
            />
          )}

          <div className="glass-panel p-4 border border-[#293548]">
            <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8] block mb-2">
              Identified Scenario Interventions
            </span>
            <ul className="space-y-1.5 text-xs text-[#F3EFE6]">
              {simulationResult?.key_interventions_identified.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 font-mono text-[11px] text-[#94A3B8]">
                  <ArrowRight className="w-3 h-3 text-[#E5A93C] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
