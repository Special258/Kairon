import React, { useState, useEffect } from 'react';
import {
  Sparkles, X, AlertTriangle, Check, Copy, ArrowRight, ShieldCheck,
  Send, RefreshCw, ChevronRight, SlidersHorizontal, LockKeyhole, Mail,
  TrendingDown, FileText, Zap, HeartHandshake, UserX, Clock, DollarSign
} from 'lucide-react';
import { resolveCustomerProblem } from '../services/api';
import { e2ee } from '../services/e2ee';
import { addReviewNote } from '../services/userData';
import type { CustomerProfile, AIAssistantResolution } from '../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: CustomerProfile;
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
  onNavigateToWhatIf,
  onRefreshReviewNotes
}: AIAssistantDrawerProps) {
  const [selectedIssue, setSelectedIssue] = useState<string>('champion_left');
  const [customQuery, setCustomQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resolution, setResolution] = useState<AIAssistantResolution | null>(null);
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  const [loggingE2EE, setLoggingE2EE] = useState<boolean>(false);
  const [e2eeLogged, setE2eeLogged] = useState<boolean>(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen && !resolution) {
      void runDiagnosis('champion_left', '');
    }
  }, [isOpen]);

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
      const summaryNote = `[AI Diagnostic Resolution] ${resolution.problem_title}\nSeverity: ${resolution.severity}\nAction Plan: ${resolution.step_by_step_playbook.join(' | ')}`;
      await addReviewNote(
        currentProfile.customer_id || 'ACC-01',
        summaryNote
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
                <h3>Kairon AI Resolution Engine</h3>
                <span className="ai-badge-live">Real-World Copilot</span>
              </div>
              <p>Prescriptive solutions for customer relationship friction & churn risks</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} title="Close AI Assistant">
            <X size={18} />
          </button>
        </div>

        {/* Account Context Badge */}
        <div className="ai-context-strip">
          <div className="ai-context-account">
            <span className="ai-context-dot" />
            <b>{currentProfile.company_name || 'Active Account Signals'}</b>
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
          <span className="eyebrow">Diagnose Common Difficulties</span>
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
            placeholder="Or describe a specific customer blocker (e.g. champion left, budget cuts)..."
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
              <b>Analyzing signals & formulating prescriptive resolution...</b>
              <p>Evaluating churn drivers, revenue exposure, and optimal retention levers.</p>
            </div>
          ) : resolution ? (
            <div className="ai-resolution-pane">
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
                  <b>Identified Root Causes:</b>
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

              {/* 1-Click Sandbox Execution Banner */}
              {resolution.suggested_whatif_simulated && (
                <div className="ai-execute-banner">
                  <div className="ai-banner-copy">
                    <div className="ai-banner-icon"><SlidersHorizontal size={18} /></div>
                    <div>
                      <b>Simulate Solution in Decision Sandbox</b>
                      <p>Pre-configure optimal contract & technical levers to project saved revenue</p>
                    </div>
                  </div>
                  <button className="primary-button ai-action-btn" onClick={handleApplyWhatIf}>
                    Apply to What-If Sandbox <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Executive Communication Draft */}
              {resolution.executive_outreach_draft && (
                <div className="ai-section">
                  <div className="ai-section-title">
                    <Mail size={15} />
                    <h5>Ready-to-Send Executive Communication</h5>
                  </div>
                  <div className="ai-draft-card">
                    <div className="ai-draft-head">
                      <div>
                        <span className="ai-draft-to">To: {resolution.executive_outreach_draft.recipient}</span>
                        <b className="ai-draft-subject">{resolution.executive_outreach_draft.subject}</b>
                      </div>
                      <button className="secondary-button ai-copy-btn" onClick={handleCopyDraft}>
                        {copiedDraft ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Draft</>}
                      </button>
                    </div>
                    <pre className="ai-draft-body">{resolution.executive_outreach_draft.body}</pre>
                  </div>
                </div>
              )}

              {/* Step-by-Step Resolution Roadmap */}
              <div className="ai-section">
                <div className="ai-section-title">
                  <FileText size={15} />
                  <h5>Team Resolution Roadmap</h5>
                </div>
                <div className="ai-playbook-steps">
                  {resolution.step_by_step_playbook.map((step, idx) => {
                    const isChecked = checkedSteps[idx] || false;
                    return (
                      <div
                        key={idx}
                        className={`ai-step-row ${isChecked ? 'completed' : ''}`}
                        onClick={() => toggleStep(idx)}
                      >
                        <div className={`ai-step-check ${isChecked ? 'checked' : ''}`}>
                          {isChecked ? <Check size={12} /> : <span>0{idx + 1}</span>}
                        </div>
                        <span className="ai-step-text">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* E2EE Audit Logging Action */}
              <div className="ai-e2ee-log-strip">
                <div className="ai-e2ee-copy">
                  <LockKeyhole size={15} />
                  <span>Log this diagnostic & action plan directly to client-side encrypted notes</span>
                </div>
                <button
                  className="secondary-button ai-e2ee-btn"
                  onClick={handleLogToE2EE}
                  disabled={loggingE2EE || e2eeLogged}
                >
                  {e2eeLogged ? (
                    <><Check size={14} /> Logged to E2EE Stream</>
                  ) : loggingE2EE ? (
                    'Encrypting...'
                  ) : (
                    <><ShieldCheck size={14} /> Encrypt & Save to Context</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="ai-empty-prompt">
              <Sparkles size={32} />
              <h4>Select a difficulty above to generate a prescriptive solution</h4>
              <p>The AI Resolution Engine calculates root causes, financial exposure, What-If simulation parameters, and personalized outreach.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
