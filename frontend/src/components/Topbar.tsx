import React from 'react';
import { Search, Sparkles, Database, TrendingUp, ShieldAlert, Zap } from 'lucide-react';
import { DatasetSummary, ModelMetrics } from '../types';
import { CountUp } from './CountUp';

interface TopbarProps {
  activeTab: 'single' | 'what-if' | 'batch' | 'model';
  datasetSummary: DatasetSummary | null;
  metrics: ModelMetrics | null;
  onQuickScan: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  collapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  datasetSummary,
  metrics,
  onQuickScan,
  searchQuery,
  setSearchQuery,
  collapsed
}) => {
  const titles = {
    'single': { title: 'Live Account Churn Propensity & Explainability', sub: 'Individual customer risk scoring and AI retention playbook' },
    'what-if': { title: 'Sensitivity Sandbox & Intervention Modeling', sub: 'Real-time commercial levers and protected revenue simulation' },
    'batch': { title: 'Portfolio Cohort Batch CSV Scoring', sub: 'Mass dataset evaluation, high-risk detection, and cohort analytics' },
    'model': { title: 'Model Diagnostics Lab & Statistical Metrics', sub: 'ROC-AUC performance curve, holdout confusion matrix, and feature hierarchy' }
  };

  const current = titles[activeTab];

  return (
    <header className="h-16 bg-[#111622]/95 backdrop-blur border-b border-[#242E40] sticky top-0 z-30 px-6 flex items-center justify-between gap-4">
      {/* Left: Section Title & Breadcrumb */}
      <div className="flex items-center gap-4 overflow-hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono text-[#5B86E5] font-semibold">
              Kairon
            </span>
            <span className="text-[#64748B] text-xs">/</span>
            <h2 className="font-serif text-sm md:text-base font-medium text-[#F3EFE6] truncate">
              {current.title}
            </h2>
          </div>
          <p className="text-[11px] text-[#94A3B8] hidden sm:block truncate">
            {current.sub}
          </p>
        </div>
      </div>

      {/* Center/Right: Live KPI Quick-Ticker */}
      {datasetSummary && (
        <div className="hidden xl:flex items-center gap-5 px-4 py-1.5 rounded-md bg-[#161D27] border border-[#293548] text-xs font-mono">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[#5B86E5]" />
            <span className="text-[#94A3B8]">Cohort:</span>
            <CountUp value={datasetSummary.total_customers} className="text-[#F3EFE6] font-semibold" />
          </div>

          <span className="text-[#293548]">|</span>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span className="text-[#94A3B8]">Avg Churn:</span>
            <CountUp value={datasetSummary.overall_churn_rate} decimals={1} suffix="%" className="text-[#E5A93C] font-semibold" />
          </div>

          <span className="text-[#293548]">|</span>

          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[#94A3B8]">MRR Base:</span>
            <CountUp value={datasetSummary.avg_mrr} prefix="$" decimals={0} className="text-[#F3EFE6] font-semibold" />
          </div>
        </div>
      )}

      {/* Right: Quick Inference Action Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onQuickScan}
          className="btn-laser-calc text-xs py-1.5 px-3.5"
          title="Run Predictive Analysis on current parameters"
        >
          <Sparkles className="w-4 h-4 text-[#0D1117]" />
          <span className="hidden sm:inline">Evaluate Model Inference</span>
          <span className="sm:hidden">Run</span>
        </button>
      </div>
    </header>
  );
};

