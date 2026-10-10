import React from 'react';
import { 
  Activity, Sliders, Layers, BarChart3, ChevronLeft, ChevronRight, 
  Cpu, Database, Sparkles, RefreshCw, ShieldCheck 
} from 'lucide-react';
import { ModelMetrics } from '../types';

interface SidebarProps {
  activeTab: 'single' | 'what-if' | 'batch' | 'model';
  setActiveTab: (tab: 'single' | 'what-if' | 'batch' | 'model') => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  metrics: ModelMetrics | null;
  onRetrain: () => void;
  isRetraining: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  metrics,
  onRetrain,
  isRetraining
}) => {
  const navItems = [
    {
      id: 'single' as const,
      label: 'Account Risk Scorer',
      badge: 'Live',
      icon: Activity,
      description: 'Single profile predictive inference & explainability'
    },
    {
      id: 'what-if' as const,
      label: 'Sensitivity & What-If',
      badge: 'Sim',
      icon: Sliders,
      description: 'Scenario levers & protected revenue sandbox'
    },
    {
      id: 'batch' as const,
      label: 'Cohort Batch CSV',
      badge: 'CSV',
      icon: Layers,
      description: 'Bulk dataset scoring & portfolio distribution'
    },
    {
      id: 'model' as const,
      label: 'Model Diagnostics Lab',
      badge: 'ROC',
      icon: BarChart3,
      description: 'Holdout matrix, ROC curve & feature importance'
    }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#111622] border-r border-[#242E40] z-40 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Identity & Collapse Toggle */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#242E40]">
          {!collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-[#1A2230] border border-[#5B86E5]/40 flex items-center justify-center text-[#E5A93C] shadow-lg shrink-0">
                <Sparkles className="w-5 h-5 text-[#E5A93C]" />
              </div>
              <div className="truncate">
                <h1 className="font-serif text-base font-semibold text-[#F3EFE6] tracking-wide flex items-center gap-1.5">
                  Kairon
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#E5A93C]/15 text-[#E5A93C] border border-[#E5A93C]/30">
                    ML
                  </span>
                </h1>
                <p className="text-[11px] text-[#94A3B8] truncate">Predictive Risk Engine</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-9 h-9 rounded-lg bg-[#1A2230] border border-[#5B86E5]/40 flex items-center justify-center text-[#E5A93C]">
              <Sparkles className="w-5 h-5 text-[#E5A93C]" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded bg-[#161D27] border border-[#293548] text-[#94A3B8] hover:text-[#F3EFE6] hover:bg-[#202938] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-3 space-y-1.5">
          {!collapsed && (
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#64748B] px-3 py-1 block">
              Predictive Workspaces
            </span>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all group relative ${
                  isActive
                    ? 'bg-[#1E2738] text-[#F3EFE6] border border-[#5B86E5]/40 shadow-sm'
                    : 'text-[#94A3B8] hover:bg-[#161D27] hover:text-[#F3EFE6] border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#E5A93C] rounded-r-full" />
                )}

                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#E5A93C]' : 'text-[#64748B] group-hover:text-[#5B86E5]'
                  }`}
                />

                {!collapsed && (
                  <div className="flex-1 truncate flex items-center justify-between">
                    <span className="text-xs font-medium truncate">{item.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-[#5B86E5]/20 text-[#5B86E5] border border-[#5B86E5]/30'
                          : 'bg-[#161D27] text-[#64748B]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Live System Telemetry */}
      <div className="p-3 border-t border-[#242E40] space-y-3">
        {!collapsed ? (
          <div className="p-3 rounded bg-[#161D27] border border-[#293548] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="live-dot"></span>
                <span className="text-[11px] text-[#94A3B8] font-mono">Backend Engine</span>
              </div>
              <span className="text-[10px] font-mono text-[#10B981] font-semibold">ONLINE</span>
            </div>

            <div className="pt-1.5 border-t border-[#242E40] flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#64748B]">Active Model</span>
              <span className="text-[#F3EFE6] font-medium truncate max-w-[110px]">
                {metrics ? metrics.model_name.split(' ')[0] : 'ML GBDT'}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#64748B]">ROC-AUC</span>
              <span className="text-[#E5A93C] font-semibold">
                {metrics ? metrics.roc_auc.toFixed(3) : '0.984'}
              </span>
            </div>

            <button
              onClick={onRetrain}
              disabled={isRetraining}
              className="btn-secondary w-full justify-center text-[11px] py-1.5 mt-1"
            >
              <RefreshCw className={`w-3 h-3 text-[#5B86E5] ${isRetraining ? 'animate-spin' : ''}`} />
              <span>{isRetraining ? 'Retraining...' : 'Re-benchmark Model'}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="live-dot" title="ML Backend Online"></span>
            <button
              onClick={onRetrain}
              disabled={isRetraining}
              className="p-2 rounded bg-[#161D27] border border-[#293548] text-[#94A3B8] hover:text-[#F3EFE6]"
              title="Retrain Model Pipeline"
            >
              <RefreshCw className={`w-4 h-4 text-[#5B86E5] ${isRetraining ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

