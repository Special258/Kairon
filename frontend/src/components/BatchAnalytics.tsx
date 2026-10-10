import React, { useState } from 'react';
import { BatchPredictResponse } from '../types';
import { uploadBatchCSV } from '../services/api';
import { Upload, FileSpreadsheet, Download, Search, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { CountUp } from './CountUp';

export const BatchAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BatchPredictResponse | null>(null);
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selected = e.target.files[0];
    setError(null);
    setLoading(true);

    try {
      const data = await uploadBatchCSV(selected);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to score CSV batch.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "customer_id,company_name,tenure_months,monthly_charges,contract_type,payment_method,has_tech_support,feature_adoption_rate,support_tickets_90d,late_payments_count,usage_trend_pct,nps_score\n" +
      "CUST-901,Alpha Logistics,6,350.0,Month-to-Month,Electronic Check,False,30.0,5,2,-25.0,4\n" +
      "CUST-902,Beta Health,36,890.0,Two-Year,Bank Transfer,True,88.0,0,0,15.0,9\n" +
      "CUST-903,Gamma Cloud,14,240.0,One-Year,Credit Card,False,55.0,2,0,5.0,7\n" +
      "CUST-904,Delta Systems,2,150.0,Month-to-Month,Electronic Check,False,20.0,4,1,-40.0,3\n" +
      "CUST-905,Epsilon Tech,48,1200.0,Two-Year,Bank Transfer,True,95.0,1,0,30.0,10\n" +
      "CUST-906,Zeta Retail,18,520.0,Month-to-Month,Credit Card,True,60.0,3,1,-10.0,6\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customer_cohort_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadScoredCSV = () => {
    if (!result) return;
    const header = "customer_id,company_name,churn_probability,risk_tier,monthly_charges,revenue_at_risk,contract_type,support_tickets_90d,nps_score\n";
    const rows = result.predictions.map(r => 
      `"${r.customer_id}","${r.company_name}",${r.churn_probability},"${r.risk_tier}",${r.monthly_charges},${r.revenue_at_risk},"${r.contract_type}",${r.support_tickets_90d},${r.nps_score}`
    ).join("\n");

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "scored_retention_risk_dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPredictions = result ? result.predictions.filter(item => {
    const matchesTier = filterTier === 'ALL' || item.risk_tier === filterTier;
    const matchesSearch = item.company_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.customer_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  }) : [];

  return (
    <div className="space-y-6">
      {/* Upload Zone & Header */}
      <div className="glass-panel p-5 border border-[#293548]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg text-[#F3EFE6] font-medium flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#5B86E5]" />
              Cohort Batch Prediction & Portfolio Scoring
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Upload customer account datasets in CSV format to calculate churn propensity and aggregate portfolio revenue at risk.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadSampleTemplate}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Sample CSV Template</span>
            </button>

            <label className="primary-button text-xs py-2 px-4 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>{loading ? 'Processing Batch...' : 'Upload & Score CSV'}</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#F87171] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Scored Batch Portfolio Summary */}
      {result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 border border-[#293548]">
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
                Total Cohort Accounts
              </span>
              <div className="font-mono text-2xl font-bold text-[#F3EFE6] mt-1">
                <CountUp value={result.total_records} />
              </div>
              <span className="text-[10px] text-[#64748B] mt-0.5 block">Scored via ML Model</span>
            </div>

            <div className="glass-panel p-4 border border-[#293548]">
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
                High & Critical Risk
              </span>
              <div className="font-mono text-2xl font-bold text-[#F87171] mt-1 flex items-baseline gap-1">
                <CountUp value={result.high_risk_count} />
                <span className="text-xs font-normal text-[#94A3B8]">
                  ({((result.high_risk_count / result.total_records) * 100).toFixed(1)}%)
                </span>
              </div>
              <span className="text-[10px] text-[#64748B] mt-0.5 block">Accounts requiring intervention</span>
            </div>

            <div className="glass-panel p-4 border border-[#293548]">
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
                Total Annual MRR at Risk
              </span>
              <div className="font-mono text-2xl font-bold text-[#F87171] mt-1">
                <CountUp value={result.total_revenue_at_risk} prefix="$" decimals={0} />
              </div>
              <span className="text-[10px] text-[#64748B] mt-0.5 block">Potential portfolio loss</span>
            </div>

            <div className="glass-panel p-4 border border-[#293548]">
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#94A3B8] block">
                Avg Churn Propensity
              </span>
              <div className="font-mono text-2xl font-bold text-[#E5A93C] mt-1">
                <CountUp value={result.avg_churn_probability} decimals={1} suffix="%" />
              </div>
              <span className="text-[10px] text-[#64748B] mt-0.5 block">Portfolio-wide mean</span>
            </div>
          </div>

          {/* Risk Distribution Breakdown Bar */}
          <div className="glass-panel p-4 space-y-2 border border-[#293548]">
            <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
              <span>Cohort Risk Distribution Breakdown</span>
              <div className="flex items-center gap-4">
                <span className="text-[#34D399]">Low: {result.risk_distribution.Low}</span>
                <span className="text-[#FBBF24]">Moderate: {result.risk_distribution.Moderate}</span>
                <span className="text-[#FB923C]">High: {result.risk_distribution.High}</span>
                <span className="text-[#F87171]">Critical: {result.risk_distribution.Critical}</span>
              </div>
            </div>

            <div className="h-3 w-full bg-[#0D1117] rounded-full flex overflow-hidden">
              <div style={{ width: `${(result.risk_distribution.Low / result.total_records) * 100}%` }} className="bg-[#10B981] transition-all duration-700" title="Low Risk" />
              <div style={{ width: `${(result.risk_distribution.Moderate / result.total_records) * 100}%` }} className="bg-[#E5A93C] transition-all duration-700" title="Moderate Risk" />
              <div style={{ width: `${(result.risk_distribution.High / result.total_records) * 100}%` }} className="bg-[#F97316] transition-all duration-700" title="High Risk" />
              <div style={{ width: `${(result.risk_distribution.Critical / result.total_records) * 100}%` }} className="bg-[#EF4444] transition-all duration-700" title="Critical Risk" />
            </div>
          </div>

          {/* Scored Data Table & Filters */}
          <div className="glass-panel p-5 space-y-4 border border-[#293548]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search account or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-xs py-1.5 w-56 font-mono"
                  />
                </div>

                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="text-xs py-1.5 font-mono"
                >
                  <option value="ALL">All Risk Tiers ({result.predictions.length})</option>
                  <option value="Critical">Critical Risk ({result.risk_distribution.Critical})</option>
                  <option value="High">High Risk ({result.risk_distribution.High})</option>
                  <option value="Moderate">Moderate Risk ({result.risk_distribution.Moderate})</option>
                  <option value="Low">Low Risk ({result.risk_distribution.Low})</option>
                </select>
              </div>

              <button
                onClick={downloadScoredCSV}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#5B86E5]" />
                <span>Export Scored CSV ({filteredPredictions.length} rows)</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-[#242E40] rounded-md">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#111622] border-b border-[#242E40] font-mono text-[#94A3B8]">
                    <th className="py-2.5 px-3">Account ID</th>
                    <th className="py-2.5 px-3">Company Name</th>
                    <th className="py-2.5 px-3 text-right">MRR ($)</th>
                    <th className="py-2.5 px-3 text-right">Risk Score</th>
                    <th className="py-2.5 px-3">Risk Tier</th>
                    <th className="py-2.5 px-3 text-right">Annual Exposure</th>
                    <th className="py-2.5 px-3">Contract</th>
                    <th className="py-2.5 px-3 text-right">Tickets (90d)</th>
                    <th className="py-2.5 px-3 text-right">NPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2736] font-mono">
                  {filteredPredictions.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#161D27] transition-colors">
                      <td className="py-2 px-3 text-[#5B86E5]">{row.customer_id}</td>
                      <td className="py-2 px-3 font-sans font-medium text-[#F3EFE6]">{row.company_name}</td>
                      <td className="py-2 px-3 text-right text-[#F3EFE6]">${row.monthly_charges.toFixed(0)}</td>
                      <td className="py-2 px-3 text-right font-bold" style={{ color: row.risk_color }}>
                        {row.churn_probability}%
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 text-[10px] rounded font-semibold ${
                          row.risk_tier === 'Critical' ? 'badge-risk-critical' :
                          row.risk_tier === 'High' ? 'badge-risk-high' :
                          row.risk_tier === 'Moderate' ? 'badge-risk-moderate' : 'badge-risk-low'
                        }`}>
                          {row.risk_tier}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-[#F87171]">
                        ${row.revenue_at_risk.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-[#94A3B8]">{row.contract_type}</td>
                      <td className="py-2 px-3 text-right text-[#F3EFE6]">{row.support_tickets_90d}</td>
                      <td className="py-2 px-3 text-right text-[#F3EFE6]">{row.nps_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPredictions.length > 50 && (
              <div className="text-center text-[11px] font-mono text-[#94A3B8] pt-2">
                Showing top 50 of {filteredPredictions.length} matching records. Export CSV to view complete list.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
