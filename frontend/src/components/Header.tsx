import React from 'react';
import { Activity, Cpu, Sliders, Layers, BarChart3, Database, RefreshCw } from 'lucide-react';
import { ModelMetrics, DatasetSummary } from '../types';

interface HeaderProps {
  activeTab: 'single' | 'what-if' | 'batch' | 'model';
  setActiveTab: (tab: 'single' | 'what-if' | 'batch' | 'model') => void;
  metrics: ModelMetrics | null;
  datasetSummary: DatasetSummary | null;
  onRetrain: () => void;
  isRetraining: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  datasetSummary,
  onRetrain,
  isRetraining
}) => {
  return (
    <header className="analyst-panel border-b border-[#293444] rounded-none mb-6">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#222A36]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#1B212B] border border-[#5B7FA6]/40 flex items-center justify-center text-[#C9A227] shadow-inner">
            <Activity className="w-5 h-5 text-[#C9A227]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-medium tracking-wide text-[#EDE9DE]">
                Kairon <span className="text-[#C9A227] text-xs uppercase tracking-widest font-mono font-normal ml-1">v1.0.4 ML</span>
              </h1>
            </div>
            <p className="text-xs text-[#8F9CAE]">
              Enterprise Predictive Intelligence & Customer Retention Engine
            </p>
          </div>
        </div>

        {/* Live Model Badge & Retrain Action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-[#14181F] border border-[#293444] text-xs">
            <span className="live-indicator"></span>
            <span className="text-[#8F9CAE]">Active Model:</span>
            <span className="text-[#EDE9DE] font-mono font-medium">
              {metrics ? metrics.model_name : 'Gradient Boosting'}
            </span>
            <span className="text-[#606E80]">|</span>
            <span className="text-[#8F9CAE]">ROC-AUC:</span>
            <span className="text-[#C9A227] font-mono font-semibold">
              {metrics ? metrics.roc_auc.toFixed(3) : '0.865'}
            </span>
          </div>

          <button
            onClick={onRetrain}
            disabled={isRetraining}
            className="btn-secondary text-xs px-3 py-1.5"
            title="Retrain and re-benchmark model on latest synthetic cohort"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#5B7FA6] ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Retraining...' : 'Retrain Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Navigation & KPI Quick-Strip */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
        {/* Navigation Tabs */}
        <div className="flex gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('single')}
            className={`nav-tab ${activeTab === 'single' ? 'active' : ''}`}
          >
            <Activity className="w-4 h-4 text-[#5B7FA6]" />
            <span>Single Account Scorer</span>
          </button>

          <button
            onClick={() => setActiveTab('what-if')}
            className={`nav-tab ${activeTab === 'what-if' ? 'active' : ''}`}
          >
            <Sliders className="w-4 h-4 text-[#C9A227]" />
            <span>Sensitivity & What-If</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`nav-tab ${activeTab === 'batch' ? 'active' : ''}`}
          >
            <Layers className="w-4 h-4 text-[#7E9EB0]" />
            <span>Cohort Batch CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('model')}
            className={`nav-tab ${activeTab === 'model' ? 'active' : ''}`}
          >
            <BarChart3 className="w-4 h-4 text-[#8F9CAE]" />
            <span>Model Diagnostics Lab</span>
          </button>
        </div>

        {/* Global Dataset KPI Ticker */}
        {datasetSummary && (
          <div className="flex items-center gap-5 py-2 text-xs font-mono border-t md:border-t-0 border-[#222A36]">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#5B7FA6]" />
              <span className="text-[#8F9CAE]">Cohort:</span>
              <span className="text-[#EDE9DE] font-semibold">{datasetSummary.total_customers.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#8F9CAE]">Base Churn:</span>
              <span className="text-[#C9A227] font-semibold">{datasetSummary.overall_churn_rate}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#8F9CAE]">Avg MRR:</span>
              <span className="text-[#EDE9DE] font-semibold">${datasetSummary.avg_mrr.toFixed(0)}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

