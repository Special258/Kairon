import React from 'react';
import { ModelMetrics, DatasetSummary } from '../types';
import { Cpu, Layers, BarChart, Database } from 'lucide-react';
import { CountUp } from './CountUp';

interface ModelAnalyticsProps {
  metrics: ModelMetrics | null;
  datasetSummary: DatasetSummary | null;
}

export const ModelAnalytics: React.FC<ModelAnalyticsProps> = ({
  metrics,
  datasetSummary
}) => {
  if (!metrics) {
    return (
      <div className="glass-panel p-8 text-center font-mono text-xs text-[#94A3B8] border border-[#293548]">
        Loading model telemetry and diagnostics...
      </div>
    );
  }

  const { confusion_matrix: cm, roc_curve, feature_importances } = metrics;
  const totalCm = cm.true_negatives + cm.false_positives + cm.false_negatives + cm.true_positives;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-5 border border-[#293548]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg text-[#F3EFE6] font-medium flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#5B86E5]" />
              Model Diagnostics & ML Evaluation Lab
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Statistical performance metrics, discriminative power (ROC-AUC), Confusion Matrix, and Global Feature Importance hierarchy.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-md bg-[#161D27] border border-[#242E40] text-xs font-mono">
            <span className="text-[#94A3B8]">Algorithm: </span>
            <span className="text-[#E5A93C] font-semibold">{metrics.model_name}</span>
          </div>
        </div>
      </div>

      {/* Model Benchmark Metric Cards with CountUp */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-panel p-3.5 border border-[#293548]">
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
            ROC-AUC Score
          </span>
          <div className="font-mono text-2xl font-bold text-[#E5A93C] mt-1">
            <CountUp value={metrics.roc_auc} decimals={3} />
          </div>
          <span className="text-[10px] text-[#34D399] font-mono mt-0.5 block">High Discrimination</span>
        </div>

        <div className="glass-panel p-3.5 border border-[#293548]">
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
            Accuracy
          </span>
          <div className="font-mono text-2xl font-bold text-[#F3EFE6] mt-1">
            <CountUp value={metrics.accuracy * 100} decimals={1} suffix="%" />
          </div>
          <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5 block">Holdout Test Set</span>
        </div>

        <div className="glass-panel p-3.5 border border-[#293548]">
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
            Precision
          </span>
          <div className="font-mono text-2xl font-bold text-[#F3EFE6] mt-1">
            <CountUp value={metrics.precision * 100} decimals={1} suffix="%" />
          </div>
          <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5 block">Positive Predictive Val</span>
        </div>

        <div className="glass-panel p-3.5 border border-[#293548]">
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
            Recall (Sensitivity)
          </span>
          <div className="font-mono text-2xl font-bold text-[#F3EFE6] mt-1">
            <CountUp value={metrics.recall * 100} decimals={1} suffix="%" />
          </div>
          <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5 block">True Positive Rate</span>
        </div>

        <div className="glass-panel p-3.5 border border-[#293548]">
          <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
            F1-Score
          </span>
          <div className="font-mono text-2xl font-bold text-[#5B86E5] mt-1">
            <CountUp value={metrics.f1_score * 100} decimals={1} suffix="%" />
          </div>
          <span className="text-[10px] text-[#94A3B8] font-mono mt-0.5 block">Harmonic Mean</span>
        </div>
      </div>

      {/* Visual Analytics Grid: Confusion Matrix & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Heatmap */}
        <div className="glass-panel p-5 space-y-4 border border-[#293548]">
          <div className="flex items-center justify-between border-b border-[#242E40] pb-2">
            <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8]">
              Holdout Confusion Matrix ({totalCm} samples)
            </span>
            <span className="text-[11px] font-mono text-[#5B86E5]">20% Test Split</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* True Negatives */}
            <div className="p-4 rounded-md bg-[#10B981]/15 border border-[#10B981]/40 flex flex-col justify-between glass-card">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#34D399] font-semibold block">
                  True Negative (TN)
                </span>
                <span className="text-[10px] text-[#94A3B8] block">Correctly Predicted Retained</span>
              </div>
              <div className="font-mono text-2xl font-bold text-[#34D399] mt-3">
                <CountUp value={cm.true_negatives} />
                <span className="text-xs text-[#94A3B8] font-normal ml-1">
                  ({((cm.true_negatives / totalCm) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* False Positives */}
            <div className="p-4 rounded-md bg-[#E5A93C]/15 border border-[#E5A93C]/40 flex flex-col justify-between glass-card">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#FBBF24] font-semibold block">
                  False Positive (FP)
                </span>
                <span className="text-[10px] text-[#94A3B8] block">False Alarm (Type I Error)</span>
              </div>
              <div className="font-mono text-2xl font-bold text-[#FBBF24] mt-3">
                <CountUp value={cm.false_positives} />
                <span className="text-xs text-[#94A3B8] font-normal ml-1">
                  ({((cm.false_positives / totalCm) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* False Negatives */}
            <div className="p-4 rounded-md bg-[#EF4444]/15 border border-[#EF4444]/40 flex flex-col justify-between glass-card">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#F87171] font-semibold block">
                  False Negative (FN)
                </span>
                <span className="text-[10px] text-[#94A3B8] block">Missed Churn (Type II Error)</span>
              </div>
              <div className="font-mono text-2xl font-bold text-[#F87171] mt-3">
                <CountUp value={cm.false_negatives} />
                <span className="text-xs text-[#94A3B8] font-normal ml-1">
                  ({((cm.false_negatives / totalCm) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* True Positives */}
            <div className="p-4 rounded-md bg-[#10B981]/15 border border-[#10B981]/40 flex flex-col justify-between glass-card">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#34D399] font-semibold block">
                  True Positive (TP)
                </span>
                <span className="text-[10px] text-[#94A3B8] block">Correctly Predicted Churn</span>
              </div>
              <div className="font-mono text-2xl font-bold text-[#34D399] mt-3">
                <CountUp value={cm.true_positives} />
                <span className="text-xs text-[#94A3B8] font-normal ml-1">
                  ({((cm.true_positives / totalCm) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Receiver Operating Characteristic (ROC) Curve */}
        <div className="glass-panel p-5 space-y-4 border border-[#293548]">
          <div className="flex items-center justify-between border-b border-[#242E40] pb-2">
            <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8]">
              ROC Curve (AUC = {metrics.roc_auc.toFixed(3)})
            </span>
            <span className="text-[11px] font-mono text-[#E5A93C]">Sensitivity vs 1 - Specificity</span>
          </div>

          {/* SVG ROC Plot */}
          <div className="relative w-full h-52 flex items-center justify-center pt-2">
            <svg viewBox="0 0 240 180" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="220" y2="20" stroke="#1F2736" strokeDasharray="3,3" />
              <line x1="30" y1="60" x2="220" y2="60" stroke="#1F2736" strokeDasharray="3,3" />
              <line x1="30" y1="100" x2="220" y2="100" stroke="#1F2736" strokeDasharray="3,3" />
              <line x1="30" y1="140" x2="220" y2="140" stroke="#293548" />

              <line x1="30" y1="20" x2="30" y2="140" stroke="#293548" />
              <line x1="77.5" y1="20" x2="77.5" y2="140" stroke="#1F2736" strokeDasharray="3,3" />
              <line x1="125" y1="20" x2="125" y2="140" stroke="#1F2736" strokeDasharray="3,3" />
              <line x1="172.5" y1="20" x2="172.5" y2="140" stroke="#1F2736" strokeDasharray="3,3" />
              <line x1="220" y1="20" x2="220" y2="140" stroke="#293548" />

              {/* Axis Labels */}
              <text x="30" y="152" fill="#94A3B8" fontSize="7" fontFamily="IBM Plex Mono">0.0</text>
              <text x="125" y="152" fill="#94A3B8" fontSize="7" fontFamily="IBM Plex Mono" textAnchor="middle">0.5</text>
              <text x="220" y="152" fill="#94A3B8" fontSize="7" fontFamily="IBM Plex Mono" textAnchor="end">1.0</text>
              <text x="125" y="166" fill="#94A3B8" fontSize="8" fontFamily="IBM Plex Mono" textAnchor="middle">False Positive Rate</text>

              <text x="22" y="143" fill="#94A3B8" fontSize="7" fontFamily="IBM Plex Mono" textAnchor="end">0.0</text>
              <text x="22" y="83" fill="#94A3B8" fontSize="7" fontFamily="IBM Plex Mono" textAnchor="end">0.5</text>
              <text x="22" y="23" fill="#94A3B8" fontSize="7" fontFamily="IBM Plex Mono" textAnchor="end">1.0</text>

              {/* Diagonal Random Guess Baseline */}
              <line x1="30" y1="140" x2="220" y2="20" stroke="#64748B" strokeWidth="1" strokeDasharray="4,4" />

              {/* ROC Curve Path */}
              {(() => {
                const points = roc_curve.map(pt => {
                  const x = 30 + pt.fpr * 190;
                  const y = 140 - pt.tpr * 120;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <>
                    <polygon
                      points={`30,140 ${points} 220,140`}
                      fill="rgba(229, 169, 60, 0.12)"
                    />
                    <polyline
                      points={points}
                      fill="none"
                      stroke="#E5A93C"
                      strokeWidth="2.5"
                    />
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      </div>

      {/* Global Feature Importance Hierarchy */}
      <div className="glass-panel p-5 space-y-4 border border-[#293548]">
        <div className="flex items-center justify-between border-b border-[#242E40] pb-2">
          <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8]">
            Global Feature Importance Ranking
          </span>
          <span className="text-[11px] font-mono text-[#5B86E5]">Relative Model Weight</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 pt-1">
          {feature_importances.slice(0, 10).map((feat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#F3EFE6] truncate max-w-[200px]">{feat.display_name}</span>
                <span className="text-[#E5A93C] font-semibold">{feat.importance_pct}%</span>
              </div>
              <div className="w-full bg-[#0D1117] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#5B86E5] to-[#36D1DC] rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, feat.importance_pct * 3.5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Cohort Historical Distributions */}
      {datasetSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-5 space-y-3 border border-[#293548]">
            <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8] block">
              Historical Churn Rate by Contract Type
            </span>
            <div className="space-y-2.5 pt-1">
              {Object.entries(datasetSummary.churn_by_contract).map(([contract, rate]) => (
                <div key={contract} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#F3EFE6]">{contract}</span>
                    <span className={`font-semibold ${rate > 35 ? 'text-[#F87171]' : 'text-[#34D399]'}`}>
                      {rate}% churn
                    </span>
                  </div>
                  <div className="w-full bg-[#0D1117] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${rate > 35 ? 'bg-[#EF4444]' : rate > 15 ? 'bg-[#E5A93C]' : 'bg-[#10B981]'}`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5 space-y-3 border border-[#293548]">
            <span className="text-xs uppercase tracking-wider font-mono text-[#94A3B8] block">
              Historical Churn Rate by Payment Method
            </span>
            <div className="space-y-2.5 pt-1">
              {Object.entries(datasetSummary.churn_by_payment).map(([pm, rate]) => (
                <div key={pm} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#F3EFE6]">{pm}</span>
                    <span className={`font-semibold ${rate > 30 ? 'text-[#F87171]' : 'text-[#34D399]'}`}>
                      {rate}% churn
                    </span>
                  </div>
                  <div className="w-full bg-[#0D1117] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${rate > 30 ? 'bg-[#EF4444]' : 'bg-[#5B86E5]'}`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
