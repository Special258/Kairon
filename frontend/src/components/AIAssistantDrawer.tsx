import React, { useState } from 'react';
import {
  Sparkles, X, AlertTriangle, Check, Copy, ArrowRight, ShieldCheck,
  Send, RefreshCw, ChevronRight, SlidersHorizontal, LockKeyhole, Mail,
  TrendingDown, FileText, Zap, HeartHandshake, UserX, Clock, DollarSign,
  RotateCcw, Info
} from 'lucide-react';
import { resolveCustomerProblem } from '../services/api';
import { e2ee } from '../services/e2ee';
import { addReviewNote, type ScoredAccountRecord } from '../services/userData';
import type { CustomerProfile, AIAssistantResolution } from '../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: CustomerProfile;
  workspaceAccounts?: ScoredAccountRecord[];
  onSelectAccount?: (profile: CustomerProfile) => void;
  onNavigateToWhatIf?: (simulatedProfile: CustomerProfile) => void;
  onRefreshReviewNotes?: () => void;
}

const PRESET_ISSUES = [
  {
    id: 'champion_left',
    icon: UserX,
    label: 'Champion Departed',
    detail: 'Internal advocate left or changed roles',
    color: '#d76d3c'
  },
  {
    id: 'usage_drop',
    icon: TrendingDown,
    label: 'Usage Contraction',
    detail: 'Activity dropped >20% over 90 days',
    color: '#c75252'
  },
  {
    id: 'pricing_friction',
    icon: DollarSign,
    label: 'Pricing Sensitivity',
    detail: 'Procurement or budget pushback',
    color: '#bb8118'
  },
  {
    id: 'renewal_cliff',
    icon: Clock,
    label: 'Renewal Cliff',
    detail: 'Month-to-month or contract ending soon',
    color: '#1f8060'
  },
  {
    id: 'onboarding_stalled',
    icon: Zap,
    label: 'Adoption Stalled',
    detail: 'Feature adoption <35% capacity',
    color: '#7060a8'
  }
];

export function AIAssistantDrawer({
  isOpen,
  onClose,
  currentProfile,
  workspaceAccounts = [],
  onSelectAccount,
  onNavigateToWhatIf,
  onRefreshReviewNotes
}: AIAssistantDrawerProps) {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [customQuery, setCustomQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resolution, setResolution] = useState<AIAssistantResolution | null>(null);
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  const [loggingE2EE, setLoggingE2EE] = useState<boolean>(false);
  const [e2eeLogged, setE2eeLogged] = useState<boolean>(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  // Real-world alert detection from the user's actual workspace accounts
  const highRiskAccounts = workspaceAccounts.filter(a => a.risk_tier === 'High' || a.risk_tier === 'Critical');

  async function runDiagnosis(issueType: string, query: string) {
    setLoading(true);
    setCopiedDraft(false);
    setE2eeLogged(false);
    setCheckedSteps({});
    try {
      const res = await resolveCustomerProblem({
        problem_type: issueType,
        custom_query: query,
        profile: currentProfile
      });
      setResolution(res);
      setSelectedIssue(issueType);
    } catch (err) {
      console.error('Failed to run AI problem resolution:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectPreset(id: string) {
    setSelectedIssue(id);
    void runDiagnosis(id, customQuery);
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customQuery.trim()) return;
    void runDiagnosis('custom', customQuery);
  }

  function handleReset() {
    setResolution(null);
    setSelectedIssue(null);
    setCustomQuery('');
    setCopiedDraft(false);
    setE2eeLogged(false);
  }

  async function handleCopyDraft() {
    if (!resolution?.executive_outreach_draft) return;
    const { subject, body } = resolution.executive_outreach_draft;
    const textToCopy = `Subject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2500);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  }

  function handleApplyWhatIf() {
    if (!resolution?.suggested_whatif_simulated) return;
    if (onNavigateToWhatIf) {
      onNavigateToWhatIf(resolution.suggested_whatif_simulated as CustomerProfile);
      onClose();
    }
  }

  async function handleLogToE2EE() {
    if (!resolution) return;
    setLoggingE2EE(true);
    try {
      const accountId = currentProfile.customer_id || 'ACCOUNT';
      const encryptedNote = `[AI Resolution: ${resolution.problem_title}]\n\nSummary: ${resolution.diagnosis_summary}\n\nInterventions:\n${resolution.recommended_interventions.map(i => `• ${i.title} (${i.impact})`).join('\n')}\n\nAction Plan:\n${(resolution.step_by_step_playbook || []).map((s: string, idx: number) => `${idx + 1}. ${s}`).join('\n')}`;
      
      await addReviewNote(
        accountId,
        encryptedNote
      );
      setE2eeLogged(true);
      if (onRefreshReviewNotes) onRefreshReviewNotes();
    } catch (err) {
      console.error('Failed to encrypt & log resolution:', err);
    } finally {
      setLoggingE2EE(false);
    }
  }

  function toggleStep(index: number) {
    setCheckedSteps(prev => ({ ...prev, [index]: !prev[index] }));
  }

  if (!isOpen) return null;

  return (
    <div className="ai-drawer-backdrop" onClick={onClose}>
      <aside className="ai-drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-drawer-header">
          <div className="ai-drawer-header-left">
            <div className="ai-copilot-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="ai-title-wrap">
                <h3>Kairon Retention Copilot</h3>
                <span className="ai-badge-live">On-Demand Guidance</span>
              </div>
              <p>Practical interventions for real-world customer relationship friction</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} title="Close AI Assistant">
            <X size={18} />
          </button>
        </div>

        {/* Real-World Workspace Alerts Banner */}
        <div className="ai-alerts-status-bar">
          {highRiskAccounts.length > 0 ? (
            <div className="ai-real-alert">
              <AlertTriangle size={15} color="#d76d3c" />
              <span>
                <b>{highRiskAccounts.length} account{highRiskAccounts.length > 1 ? 's' : ''}</b> flagged at high/critical risk in your workspace:
              </span>
              <div className="ai-risk-chips">
                {highRiskAccounts.slice(0, 3).map(acc => (
                  <button
                    key={acc.id}
                    className="ai-risk-chip"
                    onClick={() => {
                      if (onSelectAccount) onSelectAccount(acc.profile);
                      setSelectedIssue(null);
                      setResolution(null);
                    }}
                  >
                    {acc.company_name} ({acc.risk_tier})
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="ai-clean-alert">
              <Check size={14} color="var(--teal)" />
              <span>All accounts in your workspace are within normal health thresholds.</span>
            </div>
          )}
        </div>

        {/* Account Context Selection */}
        <div className="ai-context-strip">
          <div className="ai-context-account">
            <span className="ai-context-dot" />
            {workspaceAccounts.length > 0 ? (
              <select
                className="ai-account-dropdown"
                value={currentProfile.customer_id || 'active'}
                onChange={(e) => {
                  const target = workspaceAccounts.find(a => a.id === e.target.value);
                  if (target && onSelectAccount) {
                    onSelectAccount(target.profile);
                    setResolution(null);
                  }
                }}
              >
                <option value="active">
                  {currentProfile.company_name || 'Active Account Inputs'}
                </option>
                {workspaceAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.company_name} (${acc.monthly_charges}/mo • {acc.risk_tier})
                  </option>
                ))}
              </select>
            ) : (
              <b>{currentProfile.company_name || 'Active Customer Inputs'}</b>
            )}
            <small>{currentProfile.customer_id ? `(${currentProfile.customer_id})` : ''}</small>
          </div>
          <div className="ai-context-stats">
            <span>${currentProfile.monthly_charges}/mo</span>
            <span>•</span>
            <span>{currentProfile.contract_type}</span>
            <span>•</span>
            <span className={currentProfile.usage_trend_pct < 0 ? 'text-coral' : 'text-teal'}>
              {currentProfile.usage_trend_pct > 0 ? '+' : ''}{currentProfile.usage_trend_pct}% usage
            </span>
          </div>
        </div>

        {/* Preset Difficulty Pills */}
        <div className="ai-presets-section">
          <span className="eyebrow">Select a Specific Relationship Challenge</span>
          <div className="ai-preset-grid">
            {PRESET_ISSUES.map(issue => {
              const Icon = issue.icon;
              const isSelected = selectedIssue === issue.id;
              return (
                <button
                  key={issue.id}
                  className={`ai-preset-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(issue.id)}
                  type="button"
                >
                  <span className="ai-preset-icon" style={{ color: issue.color, background: `${issue.color}15` }}>
                    <Icon size={14} />
                  </span>
                  <div className="ai-preset-copy">
                    <b>{issue.label}</b>
                    <small>{issue.detail}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Problem Input */}
        <form className="ai-custom-input-wrap" onSubmit={handleCustomSubmit}>
          <input
            placeholder="Or describe a specific customer situation (e.g. competitor offer, budget cut)..."
            value={customQuery}
            onChange={e => setCustomQuery(e.target.value)}
          />
          <button className="primary-button ai-analyze-btn" type="submit" disabled={loading || !customQuery.trim()}>
            {loading ? <RefreshCw size={14} className="spin" /> : <ArrowRight size={15} />}
          </button>
        </form>

        {/* Resolution Content Area */}
        <div className="ai-drawer-body">
          {loading ? (
            <div className="ai-loading-state">
              <span className="spinner" />
              <b>Analyzing customer signals & formulating resolution...</b>
              <p>Evaluating real-world retention levers, financial exposure, and outreach strategy.</p>
            </div>
          ) : resolution ? (
            <div className="ai-resolution-pane">
              {/* Reset Bar */}
              <div className="ai-pane-top-actions">
                <span className="ai-resolution-badge">
                  <Check size={13} /> Resolution Plan Ready
                </span>
                <button className="text-button compact-btn" onClick={handleReset}>
                  <RotateCcw size={13} /> Ask Another Question
                </button>
              </div>

              {/* Problem Diagnosis Card */}
              <div className="ai-diagnosis-card" style={{ borderColor: `${resolution.severity_color}40` }}>
                <div className="ai-diag-head">
                  <div className="ai-diag-title">
                    <span className="ai-severity-badge" style={{ background: `${resolution.severity_color}18`, color: resolution.severity_color, borderColor: `${resolution.severity_color}35` }}>
                      <AlertTriangle size={12} /> {resolution.severity} Priority
                    </span>
                    <h4>{resolution.problem_title}</h4>
                  </div>
                  <div className="ai-exposure-badge">
                    <small>Revenue Exposure</small>
                    <strong>${resolution.estimated_revenue_at_risk.toLocaleString()}</strong>
                  </div>
                </div>
                <p className="ai-diag-summary">{resolution.diagnosis_summary}</p>

                {/* Root Causes List */}
                <div className="ai-root-causes">
                  <b>Identified Drivers:</b>
                  <ul>
                    {resolution.root_causes.map((cause, idx) => (
                      <li key={idx}>
                        <ChevronRight size={13} />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Interventions Grid */}
              <div className="ai-section">
                <div className="ai-section-title">
                  <Sparkles size={15} />
                  <h5>Prescriptive Real-World Solutions</h5>
                </div>
                <div className="ai-interventions-list">
                  {resolution.recommended_interventions.map(interv => (
                    <div className="ai-intervention-card" key={interv.id}>
                      <div className="ai-interv-top">
                        <span className="ai-category-tag">{interv.category}</span>
                        <span className="ai-impact-tag">{interv.impact}</span>
                      </div>
                      <b>{interv.title}</b>
                      <p>{interv.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Executive Outreach Draft */}
              <div className="ai-section">
                <div className="ai-section-title-between">
                  <div className="ai-section-title">
                    <Mail size={15} />
                    <h5>Ready-to-Send Executive Outreach</h5>
                  </div>
                  <button className="secondary-button compact-btn" onClick={handleCopyDraft}>
                    {copiedDraft ? <Check size={13} /> : <Copy size={13} />}
                    {copiedDraft ? 'Copied to Clipboard' : 'Copy Email Draft'}
                  </button>
                </div>
                <div className="ai-email-box">
                  <div className="ai-email-meta">
                    <div><span>To:</span> {resolution.executive_outreach_draft.recipient}</div>
                    <div><span>Subject:</span> {resolution.executive_outreach_draft.subject}</div>
                  </div>
                  <pre className="ai-email-body">{resolution.executive_outreach_draft.body}</pre>
                </div>
              </div>

              {/* Step-by-Step Action Checklist */}
              <div className="ai-section">
                <div className="ai-section-title">
                  <FileText size={15} />
                  <h5>Actionable Execution Checklist</h5>
                </div>
                <div className="ai-checklist">
                  {(resolution.step_by_step_playbook || []).map((step: string, idx: number) => (
                    <label key={idx} className={`ai-check-item ${checkedSteps[idx] ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={Boolean(checkedSteps[idx])}
                        onChange={() => toggleStep(idx)}
                      />
                      <span>{step}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bottom Quick-Action Buttons */}
              <div className="ai-bottom-actions">
                <button
                  className="secondary-button ai-action-btn"
                  onClick={handleApplyWhatIf}
                  title="Test this intervention in What-If Simulator"
                >
                  <SlidersHorizontal size={15} />
                  <span>Test in What-If Sandbox</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  className={`primary-button ai-action-btn ${e2eeLogged ? 'logged' : ''}`}
                  onClick={handleLogToE2EE}
                  disabled={loggingE2EE || e2eeLogged}
                  title="Encrypt resolution and log to customer review notes"
                >
                  <LockKeyhole size={15} />
                  <span>{loggingE2EE ? 'Encrypting...' : e2eeLogged ? 'Logged to E2EE Notes' : 'Save Encrypted Plan'}</span>
                  {e2eeLogged && <Check size={14} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="ai-empty-prompt-state">
              <div className="ai-empty-icon-wrap">
                <Sparkles size={28} color="var(--teal)" />
              </div>
              <h4>On-Demand Relationship Troubleshooting</h4>
              <p>
                Kairon Copilot is designed for real-world customer difficulties. Select a challenge above (like champion loss or pricing objections) or describe your customer's situation to generate a custom retention playbook and executive outreach draft.
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
