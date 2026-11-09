import React from 'react';
import { CountUp } from './CountUp';
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

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

  // 2026 Warm Opportune Moment Tier Mapping with Distinct Accessible Shapes & Icons
  const tierConfig = {
    Low: {
      color: '#9B7BD1', // Orchid
      bg: 'rgba(155, 123, 209, 0.16)',
      border: 'rgba(155, 123, 209, 0.35)',
      shape: '◆',
      label: 'Low Risk',
      icon: ShieldCheck
    },
    Moderate: {
      color: '#F4B13E', // Saffron
      bg: 'rgba(244, 177, 62, 0.16)',
      border: 'rgba(244, 177, 62, 0.35)',
      shape: '▲',
      label: 'Moderate Risk',
      icon: AlertTriangle
    },
    High: {
      color: '#E4572E', // Persimmon
      bg: 'rgba(228, 87, 46, 0.16)',
      border: 'rgba(228, 87, 46, 0.35)',
      shape: '⬡',
      label: 'High Risk',
      icon: ShieldAlert
    },
    Critical: {
      color: '#9E1A36', // Crimson-Mulberry
      bg: 'rgba(158, 26, 54, 0.18)',
      border: 'rgba(158, 26, 54, 0.35)',
      shape: '⯄',
      label: 'Critical Risk',
      icon: AlertOctagon
    }
  }[riskTier] || {
    color: '#F4B13E',
    bg: 'rgba(244, 177, 62, 0.16)',
    border: 'rgba(244, 177, 62, 0.35)',
    shape: '▲',
    label: `${riskTier} Risk`,
    icon: AlertTriangle
  };

  const TierIcon = tierConfig.icon;

  return (
    <div className="relative panel p-6 flex flex-col items-center justify-center overflow-hidden" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
      {/* Dynamic Ambient Risk Aura */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-20 transition-all duration-700"
        style={{ backgroundColor: tierConfig.color }}
      />

      {/* Top Header Strip */}
      <div className="w-full flex items-center justify-between mb-3 z-10">
        <span className="text-xs uppercase tracking-wider font-mono flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
          <ShieldAlert className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
          Churn Propensity Signal
        </span>
        <span
          className="px-2.5 py-1 text-xs font-mono font-semibold rounded-full uppercase flex items-center gap-1.5 shadow-sm"
          style={{
            color: tierConfig.color,
            backgroundColor: tierConfig.bg,
            border: `1px solid ${tierConfig.border}`
          }}
        >
          <span className="text-sm leading-none" aria-hidden="true">{tierConfig.shape}</span>
          <TierIcon className="w-3 h-3" />
          <span>{tierConfig.label}</span>
        </span>
      </div>

      {/* SVG Radial Warm Editorial Gauge */}
      <div className="relative w-72 h-40 flex items-end justify-center my-2 z-10">
        <svg viewBox="0 0 220 125" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="warmGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9B7BD1" />
              <stop offset="35%" stopColor="#F4B13E" />
              <stop offset="70%" stopColor="#E4572E" />
              <stop offset="100%" stopColor="#9E1A36" />
            </linearGradient>
          </defs>

          {/* Background Outer Ring */}
          <path
            d="M 25 110 A 85 85 0 0 1 195 110"
            fill="none"
            stroke="var(--line)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Glowing Colored Sectors (Orchid -> Saffron -> Persimmon -> Crimson) */}
          {/* Low Risk Arc (0% - 25%) */}
          <path
            d="M 25 110 A 85 85 0 0 1 50 49.9"
            fill="none"
            stroke="#9B7BD1"
            strokeWidth="12"
            strokeLinecap="round"
            className="opacity-90"
          />
          {/* Moderate Risk Arc (25% - 50%) */}
          <path
            d="M 50 49.9 A 85 85 0 0 1 110 25"
            fill="none"
            stroke="#F4B13E"
            strokeWidth="12"
            className="opacity-90"
          />
          {/* High Risk Arc (50% - 75%) */}
          <path
            d="M 110 25 A 85 85 0 0 1 170 49.9"
            fill="none"
            stroke="#E4572E"
            strokeWidth="12"
            className="opacity-90"
          />
          {/* Critical Risk Arc (75% - 100%) */}
          <path
            d="M 170 49.9 A 85 85 0 0 1 195 110"
            fill="none"
            stroke="#9E1A36"
            strokeWidth="12"
            strokeLinecap="round"
            className="opacity-90"
          />

          {/* Scale Markers & Numbers */}
          <line x1="25" y1="110" x2="15" y2="110" stroke="var(--faint)" strokeWidth="1.5" />
          <text x="8" y="113" fill="var(--muted)" fontSize="8" fontFamily="IBM Plex Mono" textAnchor="end">0%</text>

          <line x1="110" y1="25" x2="110" y2="15" stroke="var(--faint)" strokeWidth="1.5" />
          <text x="110" y="10" fill="var(--muted)" fontSize="8" fontFamily="IBM Plex Mono" textAnchor="middle">50%</text>

          <line x1="195" y1="110" x2="205" y2="110" stroke="var(--faint)" strokeWidth="1.5" />
          <text x="210" y="113" fill="var(--muted)" fontSize="8" fontFamily="IBM Plex Mono" textAnchor="start">100%</text>

          {/* Animated Needle */}
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '110px 110px', transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <line
              x1="110"
              y1="110"
              x2="110"
              y2="32"
              stroke="var(--ink)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <polygon
              points="105,46 115,46 110,26"
              fill={tierConfig.color}
            />
          </g>

          {/* Pivot Center */}
          <circle cx="110" cy="110" r="10" fill="var(--paper-warm)" stroke="var(--ink)" strokeWidth="2" />
          <circle cx="110" cy="110" r="4" fill={tierConfig.color} />
        </svg>

        {/* Big Number Readout with CountUp */}
        <div className="absolute bottom-0 text-center flex flex-col items-center">
          <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight flex items-baseline" style={{ color: 'var(--ink)' }}>
            <CountUp value={clampedProb} decimals={1} duration={800} />
            <span className="text-base font-normal ml-1" style={{ color: 'var(--muted)' }}>%</span>
          </div>
        </div>
      </div>

      {/* Outcome Banner */}
      <div className="w-full mt-4 pt-3 flex items-center justify-between text-xs z-10" style={{ borderTop: '1px solid var(--line)' }}>
        <span className="font-mono" style={{ color: 'var(--muted)' }}>Classification Status:</span>
        <div className="flex items-center gap-1.5 font-mono font-semibold">
          {predictedChurn ? (
            <>
              <AlertOctagon className="w-3.5 h-3.5" style={{ color: '#E4572E' }} />
              <span style={{ color: '#E4572E' }}>Churn Anticipated</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#9B7BD1' }} />
              <span style={{ color: '#9B7BD1' }}>Account Retained</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
