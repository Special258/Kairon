import React from 'react';
import { FeatureImpact as IFeatureImpact } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Layers } from 'lucide-react';
import { CountUp } from './CountUp';

interface FeatureImpactProps {
  drivers: IFeatureImpact[];
  revenueAtRisk: number;
  estimatedClv: number;
}

export const FeatureImpact: React.FC<FeatureImpactProps> = ({
  drivers,
  revenueAtRisk,
  estimatedClv
}) => {
  return (
    <div className="glass-panel p-5 flex flex-col gap-4 border border-[#293548]">
      {/* Financial Exposure Cards with CountUp */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-md bg-[#161D27] border border-[#242E40] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#EF4444]/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
            Annual MRR at Risk
          </span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#F87171] mt-0.5 flex items-baseline">
            <CountUp value={revenueAtRisk} prefix="$" decimals={2} duration={700} />
          </div>
          <span className="text-[10px] text-[#64748B] mt-0.5 block">12-month expected contract loss</span>
        </div>

        <div className="p-3.5 rounded-md bg-[#161D27] border border-[#242E40] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#5B86E5]/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
            Expected Lifetime Value
          </span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#F3EFE6] mt-0.5 flex items-baseline">
            <CountUp value={estimatedClv} prefix="$" decimals={2} duration={700} />
          </div>
          <span className="text-[10px] text-[#64748B] mt-0.5 block">Projected horizon revenue</span>
        </div>
      </div>

      {/* Feature Explainability Waterfall Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#5B86E5]" />
            Key Risk Drivers & Local Feature Impact
          </span>
          <span className="text-[10px] text-[#64748B] font-mono">Marginal Propensity Delta</span>
        </div>

        <div className="space-y-2.5">
          {drivers.map((driver, idx) => {
            const isRisk = driver.impact_type === 'risk_increasing';
            const barWidth = Math.min(100, Math.abs(driver.impact_score) * 3.2);

            return (
              <div
                key={idx}
                className="p-3 rounded-md bg-[#161D27] border border-[#242E40] hover:border-[#5B86E5]/50 transition-all text-xs animate-slide-up"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    {isRisk ? (
                      <TrendingUp className="w-3.5 h-3.5 text-[#F87171] shrink-0" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                    )}
                    <span className="font-medium text-[#F3EFE6] truncate">{driver.display_name}</span>
                  </div>

                  <span
                    className={`font-mono font-semibold px-1.5 py-0.2 rounded text-[11px] shrink-0 ${
                      isRisk ? 'text-[#F87171] bg-[#EF4444]/10' : 'text-[#34D399] bg-[#10B981]/10'
                    }`}
                  >
                    {driver.impact_score > 0 ? `+${driver.impact_score}%` : `${driver.impact_score}%`}
                  </span>
                </div>

                {/* Micro Progress Bar */}
                <div className="w-full bg-[#0D1117] h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: isRisk ? '#EF4444' : '#10B981'
                    }}
                  />
                </div>

                <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-2">
                  {driver.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pt-1.5 border-t border-[#242E40]">
                  <span>Observed: <strong className="text-[#F3EFE6]">{String(driver.current_value)}</strong></span>
                  <span>Benchmark: <span className="text-[#94A3B8]">{String(driver.benchmark_value)}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
