import React from 'react';
import { PrescriptiveAction } from '../types';
import { Target, Zap, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface RetentionPlaybookProps {
  playbook: PrescriptiveAction[];
}

export const RetentionPlaybook: React.FC<RetentionPlaybookProps> = ({ playbook }) => {
  return (
    <div className="glass-panel p-5 flex flex-col gap-3.5 border border-[#293548]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#E5A93C]" />
          <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8]">
            AI Prescriptive Retention Playbook
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#5B86E5] bg-[#5B86E5]/10 px-2 py-0.5 rounded border border-[#5B86E5]/30">
          {playbook.length} Actions Available
        </span>
      </div>

      <div className="space-y-2.5">
        {playbook.map((action, idx) => {
          const urgencyColor = {
            High: 'text-[#F87171] border-[#EF4444]/30 bg-[#EF4444]/10',
            Medium: 'text-[#FBBF24] border-[#E5A93C]/30 bg-[#E5A93C]/10',
            Low: 'text-[#34D399] border-[#10B981]/30 bg-[#10B981]/10'
          }[action.urgency] || 'text-[#94A3B8]';

          return (
            <div
              key={idx}
              className="p-3.5 rounded-md bg-[#161D27] border border-[#242E40] hover:border-[#E5A93C]/50 transition-all text-xs flex flex-col gap-2 glass-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded border ${urgencyColor}`}>
                    {action.urgency} Urgency
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#0D1117] text-[#94A3B8] border border-[#242E40]">
                    {action.category}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono text-[11px] text-[#34D399] font-semibold bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30 shrink-0">
                  <Zap className="w-3 h-3 text-[#34D399]" />
                  <span>-{action.estimated_risk_reduction_pct}% Risk</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#F3EFE6] mb-1">
                  {action.title}
                </h4>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
