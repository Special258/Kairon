import React from 'react';
import { CountUp } from './CountUp';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RiskGaugeProps {
  probability: number; // 0 to 100
  riskTier: 'Low' | 'Moderate' | 'High' | 'Critical';
  riskColor: string;
  predictedChurn: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  probability,
  riskTier,
  riskColor,
  predictedChurn
}) => {
  const clampedProb = Math.min(100, Math.max(0, probability));
  const angle = -90 + (clampedProb / 100) * 180;

  const badgeClass = {
    Low: 'badge-risk-low',
    Moderate: 'badge-risk-moderate',
    High: 'badge-risk-high',
    Critical: 'badge-risk-critical'
  }[riskTier] || 'badge-risk-moderate';

  const glowColor = {
    Low: 'rgba(16, 185, 129, 0.25)',
    Moderate: 'rgba(229, 169, 60, 0.25)',
    High: 'rgba(249, 115, 22, 0.25)',
    Critical: 'rgba(239, 68, 68, 0.35)'
  }[riskTier] || 'rgba(91, 134, 229, 0.2)';

  return (
    <div className="relative glass-panel p-6 flex flex-col items-center justify-center overflow-hidden border border-[#293548]">
      {/* Dynamic Ambient Risk Aura */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-30 transition-all duration-700"
        style={{ backgroundColor: riskColor }}
      />

      {/* Top Header Strip */}
      <div className="w-full flex items-center justify-between mb-3 z-10">
        <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8] flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#5B86E5]" />
          Real-Time Churn Propensity
        </span>
        <span className={`px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full uppercase shadow-sm ${badgeClass}`}>
          {riskTier} Risk
        </span>
      </div>

      {/* SVG Radial Neon Gauge */}
      <div className="relative w-72 h-40 flex items-end justify-center my-2 z-10">
        <svg viewBox="0 0 220 125" className="w-full h-full overflow-visible">
          <defs>
            {/* Gradients */}
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="35%" stopColor="#E5A93C" />
              <stop offset="70%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>

            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Outer Ring */}
          <path
            d="M 25 110 A 85 85 0 0 1 195 110"
            fill="none"
            stroke="#161D27"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Glowing Colored Sectors */}
          {/* Low Risk Arc */}
          <path
            d="M 25 110 A 85 85 0 0 1 50 49.9"
            fill="none"
            stroke="#10B981"
            strokeWidth="12"
            strokeLinecap="round"
            className="opacity-80"
          />
          {/* Moderate Risk Arc */}
          <path
            d="M 50 49.9 A 85 85 0 0 1 110 25"
            fill="none"
            stroke="#E5A93C"
            strokeWidth="12"
            className="opacity-80"
          />
          {/* High Risk Arc */}
          <path
            d="M 110 25 A 85 85 0 0 1 170 49.9"
            fill="none"
            stroke="#F97316"
            strokeWidth="12"
            className="opacity-80"
          />
          {/* Critical Risk Arc */}
          <path
            d="M 170 49.9 A 85 85 0 0 1 195 110"
            fill="none"
            stroke="#EF4444"
            strokeWidth="12"
            strokeLinecap="round"
            className="opacity-80"
          />

          {/* Scale Markers & Numbers */}
          <line x1="25" y1="110" x2="15" y2="110" stroke="#64748B" strokeWidth="1.5" />
          <text x="8" y="113" fill="#94A3B8" fontSize="8" fontFamily="IBM Plex Mono" textAnchor="end">0%</text>

          <line x1="110" y1="25" x2="110" y2="15" stroke="#64748B" strokeWidth="1.5" />
          <text x="110" y="10" fill="#94A3B8" fontSize="8" fontFamily="IBM Plex Mono" textAnchor="middle">50%</text>

          <line x1="195" y1="110" x2="205" y2="110" stroke="#64748B" strokeWidth="1.5" />
          <text x="210" y="113" fill="#94A3B8" fontSize="8" fontFamily="IBM Plex Mono" textAnchor="start">100%</text>

          {/* Animated Needle */}
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '110px 110px', transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <line
              x1="110"
              y1="110"
              x2="110"
              y2="32"
              stroke="#F3EFE6"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 6px rgba(243, 239, 230, 0.6))"
            />
            <polygon
              points="105,46 115,46 110,26"
              fill={riskColor}
            />
          </g>

          {/* Pivot Glow */}
          <circle cx="110" cy="110" r="10" fill="#0D1117" stroke="#F3EFE6" strokeWidth="2.5" />
          <circle cx="110" cy="110" r="4" fill={riskColor} />
        </svg>

        {/* Big Number Readout with CountUp */}
        <div className="absolute bottom-0 text-center flex flex-col items-center">
          <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-[#F3EFE6] flex items-baseline">
            <CountUp value={clampedProb} decimals={1} duration={800} />
            <span className="text-base font-normal text-[#94A3B8] ml-1">%</span>
          </div>
        </div>
      </div>

      {/* Outcome Banner */}
      <div className="w-full mt-4 pt-3 border-t border-[#242E40] flex items-center justify-between text-xs z-10">
        <span className="text-[#94A3B8] font-mono">Classification Status:</span>
        <div className="flex items-center gap-1.5 font-mono font-semibold">
          {predictedChurn ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-[#F87171]" />
              <span className="text-[#F87171]">Churn Anticipated</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
              <span className="text-[#34D399]">Account Retained</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
