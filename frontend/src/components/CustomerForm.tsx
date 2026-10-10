import React from 'react';
import { CustomerProfile } from '../types';
import { Sparkles, ShieldCheck, AlertTriangle, UserCheck, Flame, Zap, Check } from 'lucide-react';

interface CustomerFormProps {
  profile: CustomerProfile;
  onChange: (updated: CustomerProfile) => void;
  onPredict: () => void;
  loading: boolean;
  autoPredict: boolean;
  setAutoPredict: (auto: boolean) => void;
  selectedPreset: string;
  setSelectedPreset: (preset: string) => void;
}

const PRESETS = [
  {
    id: 'safe',
    name: 'Enterprise Loyal',
    subtitle: 'Stable multi-year tier',
    riskTag: 'Low Risk',
    riskColor: '#10B981',
    icon: ShieldCheck,
    data: {
      customer_id: 'CUST-1092',
      company_name: 'Stratos Global Corp',
      tenure_months: 48,
      monthly_charges: 650,
      contract_type: 'Two-Year' as const,
      payment_method: 'Bank Transfer' as const,
      support_tickets_90d: 0,
      feature_adoption_rate: 85,
      late_payments_count: 0,
      nps_score: 9,
      has_tech_support: true,
      usage_trend_pct: 25.0
    }
  },
  {
    id: 'renewal_cliff',
    name: 'Critical Renewal Cliff',
    subtitle: 'High friction & drop-off',
    riskTag: 'Critical Risk',
    riskColor: '#EF4444',
    icon: Flame,
    data: {
      customer_id: 'CUST-4819',
      company_name: 'Nexus Dynamics LLC',
      tenure_months: 8,
      monthly_charges: 380,
      contract_type: 'Month-to-Month' as const,
      payment_method: 'Electronic Check' as const,
      support_tickets_90d: 6,
      feature_adoption_rate: 28,
      late_payments_count: 2,
      nps_score: 3,
      has_tech_support: false,
      usage_trend_pct: -45.0
    }
  },
  {
    id: 'new_starter',
    name: 'Onboarding At-Risk',
    subtitle: 'Early adoption struggle',
    riskTag: 'High Risk',
    riskColor: '#F97316',
    icon: AlertTriangle,
    data: {
      customer_id: 'CUST-7210',
      company_name: 'Aero Labs Tech',
      tenure_months: 3,
      monthly_charges: 220,
      contract_type: 'Month-to-Month' as const,
      payment_method: 'Credit Card' as const,
      support_tickets_90d: 4,
      feature_adoption_rate: 35,
      late_payments_count: 1,
      nps_score: 5,
      has_tech_support: false,
      usage_trend_pct: -15.0
    }
  },
  {
    id: 'midmarket_stable',
    name: 'Mid-Market Regular',
    subtitle: 'Moderate engagement',
    riskTag: 'Moderate Risk',
    riskColor: '#E5A93C',
    icon: UserCheck,
    data: {
      customer_id: 'CUST-3311',
      company_name: 'Synthetix Solutions',
      tenure_months: 24,
      monthly_charges: 450,
      contract_type: 'One-Year' as const,
      payment_method: 'Credit Card' as const,
      support_tickets_90d: 2,
      feature_adoption_rate: 62,
      late_payments_count: 0,
      nps_score: 7,
      has_tech_support: true,
      usage_trend_pct: 5.0
    }
  }
];

export const CustomerForm: React.FC<CustomerFormProps> = ({
  profile,
  onChange,
  onPredict,
  loading,
  autoPredict,
  setAutoPredict,
  selectedPreset,
  setSelectedPreset
}) => {
  const updateField = (key: keyof CustomerProfile, value: any) => {
    setSelectedPreset('custom');
    onChange({
      ...profile,
      [key]: value
    });
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset.id);
    onChange({ ...preset.data });
  };

  return (
    <div className="glass-panel p-5 flex flex-col gap-5 border border-[#293548]">
      {/* Archetype Persona Selection Cards */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#E5A93C]" />
            Select Account Archetype Persona
          </span>
          <label className="text-xs text-[#94A3B8] cursor-pointer flex items-center gap-1.5 font-mono">
            <input
              type="checkbox"
              checked={autoPredict}
              onChange={(e) => setAutoPredict(e.target.checked)}
              className="rounded accent-[#5B86E5] cursor-pointer"
            />
            Live Recalculate
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPreset === preset.id;

            return (
              <div
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`persona-card ${isSelected ? 'active' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon
                    className="w-4 h-4"
                    style={{ color: preset.riskColor }}
                  />
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E5A93C]" />}
                </div>
                <div className="font-medium text-xs text-[#F3EFE6] truncate">
                  {preset.name}
                </div>
                <div className="text-[10px] text-[#94A3B8] truncate">
                  {preset.subtitle}
                </div>
                <div className="mt-1.5 pt-1 border-t border-[#242E40]">
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase"
                    style={{
                      color: preset.riskColor,
                      backgroundColor: `${preset.riskColor}18`
                    }}
                  >
                    {preset.riskTag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#242E40]" />

      {/* Account Metadata Form Fields */}
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[#94A3B8] mb-1 font-mono">Account ID</label>
            <input
              type="text"
              value={profile.customer_id || ''}
              onChange={(e) => updateField('customer_id', e.target.value)}
              className="w-full font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-[#94A3B8] mb-1 font-mono">Company / Entity Name</label>
            <input
              type="text"
              value={profile.company_name || ''}
              onChange={(e) => updateField('company_name', e.target.value)}
              className="w-full text-xs font-medium"
            />
          </div>
        </div>

        {/* Contract & Payment Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[#94A3B8] mb-1 font-mono">Contract Term</label>
            <select
              value={profile.contract_type}
              onChange={(e) => updateField('contract_type', e.target.value as any)}
              className="w-full text-xs font-mono"
            >
              <option value="Month-to-Month">Month-to-Month (Rolling)</option>
              <option value="One-Year">1-Year Fixed Commitment</option>
              <option value="Two-Year">2-Year Multi-Year Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-[#94A3B8] mb-1 font-mono">Payment Mechanism</label>
            <select
              value={profile.payment_method}
              onChange={(e) => updateField('payment_method', e.target.value as any)}
              className="w-full text-xs font-mono"
            >
              <option value="Electronic Check">Electronic Check (Direct Debit)</option>
              <option value="Credit Card">Credit Card (Automated)</option>
              <option value="Bank Transfer">Bank Wire Transfer</option>
              <option value="Manual Invoice">Manual Invoice (Net 30)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5 pt-1">
          {/* MRR Slider */}
          <div className="range-slider-container">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#94A3B8] font-mono">Monthly Recurring Revenue</label>
              <span className="font-mono text-[#F3EFE6] font-semibold text-xs bg-[#161D27] px-2 py-0.5 rounded border border-[#242E40]">
                ${profile.monthly_charges.toFixed(0)}/mo
              </span>
            </div>
            <input
              type="range"
              min="29"
              max="1500"
              step="10"
              value={profile.monthly_charges}
              onChange={(e) => updateField('monthly_charges', Number(e.target.value))}
            />
          </div>

          {/* Tenure Slider */}
          <div className="range-slider-container">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#94A3B8] font-mono">Account Tenure</label>
              <span className="font-mono text-[#F3EFE6] font-semibold text-xs bg-[#161D27] px-2 py-0.5 rounded border border-[#242E40]">
                {profile.tenure_months} months
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="72"
              value={profile.tenure_months}
              onChange={(e) => updateField('tenure_months', Number(e.target.value))}
            />
          </div>

          {/* Support Tickets Slider */}
          <div className="range-slider-container">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#94A3B8] font-mono">Support Tickets (90d)</label>
              <span className={`font-mono font-semibold text-xs px-2 py-0.5 rounded border ${
                profile.support_tickets_90d >= 4 
                  ? 'text-[#F87171] bg-[#EF4444]/15 border-[#EF4444]/30' 
                  : 'text-[#F3EFE6] bg-[#161D27] border-[#242E40]'
              }`}>
                {profile.support_tickets_90d} tickets
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={profile.support_tickets_90d}
              onChange={(e) => updateField('support_tickets_90d', Number(e.target.value))}
            />
          </div>

          {/* Usage Velocity Trend Slider */}
          <div className="range-slider-container">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#94A3B8] font-mono">Usage Velocity Trend</label>
              <span className={`font-mono font-semibold text-xs px-2 py-0.5 rounded border ${
                profile.usage_trend_pct < 0 
                  ? 'text-[#F87171] bg-[#EF4444]/15 border-[#EF4444]/30' 
                  : 'text-[#34D399] bg-[#10B981]/15 border-[#10B981]/30'
              }`}>
                {profile.usage_trend_pct > 0 ? `+${profile.usage_trend_pct}` : profile.usage_trend_pct}%
              </span>
            </div>
            <input
              type="range"
              min="-80"
              max="80"
              step="5"
              value={profile.usage_trend_pct}
              onChange={(e) => updateField('usage_trend_pct', Number(e.target.value))}
            />
          </div>

          {/* Feature Adoption % Slider */}
          <div className="range-slider-container">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#94A3B8] font-mono">Feature Adoption Rate</label>
              <span className="font-mono text-[#F3EFE6] font-semibold text-xs bg-[#161D27] px-2 py-0.5 rounded border border-[#242E40]">
                {profile.feature_adoption_rate}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={profile.feature_adoption_rate}
              onChange={(e) => updateField('feature_adoption_rate', Number(e.target.value))}
            />
          </div>

          {/* NPS Score Slider */}
          <div className="range-slider-container">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#94A3B8] font-mono">Net Promoter Score (NPS)</label>
              <span className={`font-mono font-semibold text-xs px-2 py-0.5 rounded border ${
                profile.nps_score <= 4 
                  ? 'text-[#F87171] bg-[#EF4444]/15 border-[#EF4444]/30' 
                  : profile.nps_score >= 8 
                  ? 'text-[#34D399] bg-[#10B981]/15 border-[#10B981]/30' 
                  : 'text-[#FBBF24] bg-[#E5A93C]/15 border-[#E5A93C]/30'
              }`}>
                {profile.nps_score} / 10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={profile.nps_score}
              onChange={(e) => updateField('nps_score', Number(e.target.value))}
            />
          </div>

          {/* Late Invoices Slider */}
          <div className="range-slider-container">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#94A3B8] font-mono">Late Invoices (Past 12m)</label>
              <span className={`font-mono font-semibold text-xs px-2 py-0.5 rounded border ${
                profile.late_payments_count > 0 
                  ? 'text-[#F87171] bg-[#EF4444]/15 border-[#EF4444]/30' 
                  : 'text-[#F3EFE6] bg-[#161D27] border-[#242E40]'
              }`}>
                {profile.late_payments_count} late
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              value={profile.late_payments_count}
              onChange={(e) => updateField('late_payments_count', Number(e.target.value))}
            />
          </div>

          {/* Dedicated Technical Support Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-md bg-[#161D27] border border-[#242E40]">
            <div>
              <span className="text-xs text-[#F3EFE6] font-medium block">Dedicated Technical Support Tier</span>
              <span className="text-[10px] text-[#94A3B8] block">Assigned Solutions Architect</span>
            </div>
            <input
              type="checkbox"
              checked={profile.has_tech_support}
              onChange={(e) => updateField('has_tech_support', e.target.checked)}
              className="w-4 h-4 rounded accent-[#5B86E5] cursor-pointer"
            />
          </div>
        </div>

        {/* Calculation Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onPredict}
            disabled={loading}
            className="primary-button w-full py-3"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>{loading ? 'Evaluating Model Inference...' : 'Calculate Predictive Risk Score'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
