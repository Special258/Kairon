import React, { useState, useEffect } from 'react';
import {
  X, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, SlidersHorizontal,
  Gauge, Users, LockKeyhole, ArrowRight, Zap, CheckCircle2, TrendingDown,
  Layers, LineChart, FileSpreadsheet, Eye
} from 'lucide-react';
import type { Page } from '../types';

interface PlatformTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPage: (page: Page) => void;
  onOpenAI: () => void;
}

interface SlideData {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: Array<{ label: string; value: string; desc: string }>;
  actionLabel: string;
  actionPage?: Page;
  actionTriggerAI?: boolean;
}

const TOUR_SLIDES: SlideData[] = [
  {
    id: 1,
    badge: 'Core Intelligence',
    badgeColor: '#1f8060',
    title: 'Predictive Relationship Health & Churn Scoring',
    subtitle: 'From lagging indicators to proactive relationship visibility',
    description: 'Kairon combines commercial fundamentals (MRR, tenure, payment reliability) with granular product behavioral telemetry (feature adoption %, 90-day usage velocity, support ticket density, NPS) to produce calibrated churn probability with complete explainability.',
    highlights: [
      { label: 'Multi-Signal Modeling', value: '10+ Signals', desc: 'Balances commercial commitments with daily customer behavior' },
      { label: 'Explainable AI', value: '100% Transparent', desc: 'Visualizes exact feature impact scores behind every assessment' },
      { label: 'Calibration', value: 'Calibrated Risk Tiers', desc: 'Categorizes accounts into Low, Moderate, High, and Critical tiers' }
    ],
    actionLabel: 'Launch Account Scorer',
    actionPage: 'scorer'
  },
  {
    id: 2,
    badge: 'Decision Sandbox',
    badgeColor: '#7060a8',
    title: 'What-If Simulation & Retention Modeling',
    subtitle: 'Test interventions before committing budget or customer conversations',
    description: 'Model the impact of customer success actions in real-time. Quantify the exact churn risk reduction and protected revenue achieved by offering multi-year commitments, assigning dedicated engineers, or running adoption workshops.',
    highlights: [
      { label: 'Live Scenario Engine', value: 'Instant Recalculation', desc: 'Compares baseline health against proposed commercial terms' },
      { label: 'Protected ARR', value: 'Quantified ROI', desc: 'Translates percentage risk reductions into exact dollar revenue saved' },
      { label: 'Quick Retention Bundles', value: '1-Click Levers', desc: 'Pre-packaged commercial & technical interventions ready to test' }
    ],
    actionLabel: 'Open What-If Sandbox',
    actionPage: 'whatif'
  },
  {
    id: 3,
    badge: 'AI Problem Engine',
    badgeColor: '#d76d3c',
    title: 'Real-World AI Copilot & Issue Resolution',
    subtitle: 'Operational solutions for customer friction, not just another chatbot',
    description: 'When real-world difficulties strike—internal champions depart, usage contracts sharply, pricing pushback occurs, or adoption stalls—the AI Resolution Engine produces root cause analysis, What-If simulation parameters, executive outreach email drafts, and step-by-step team playbooks.',
    highlights: [
      { label: 'Root Cause Diagnosis', value: 'Prescriptive', desc: 'Identifies core drivers and calculates revenue exposure' },
      { label: 'Executive Outreaches', value: 'Ready-to-Send', desc: 'Personalized stakeholder communication drafts with 1-click copy' },
      { label: 'Sandbox Integration', value: '1-Click Dispatch', desc: 'Transfers AI recommendations directly into the What-If sandbox' }
    ],
    actionLabel: 'Open AI Copilot Mode',
    actionTriggerAI: true
  },
  {
    id: 4,
    badge: 'Zero-Knowledge Security',
    badgeColor: '#1a6f50',
    title: 'Client-Side End-to-End Encryption (E2EE)',
    subtitle: 'Military-grade privacy for customer relationship context',
    description: 'Every internal review note, executive meeting summary, and sensitive churn intervention strategy is encrypted client-side using Web Cryptography AES-256-GCM. Decryption occurs only in authorized browser sessions; raw notes are never exposed in plaintext.',
    highlights: [
      { label: 'Cipher Algorithm', value: 'AES-256-GCM', desc: 'Authenticated encryption with 12-byte cryptographic nonces' },
      { label: 'Key Derivation', value: 'PBKDF2-SHA256', desc: '100,000 hash iterations with 16-byte cryptographically secure salts' },
      { label: 'Integrity Check', value: 'SHA-256 Fingerprint', desc: 'Audit fingerprint badges verify client-side key consistency' }
    ],
    actionLabel: 'View Security Specifications',
    actionPage: 'settings'
  },
  {
    id: 5,
    badge: 'Portfolio Scale',
    badgeColor: '#bb8118',
    title: 'Enterprise Cohort Telemetry & Team Reviews',
    subtitle: 'Scale proactive retention across thousands of customer accounts',
    description: 'Upload customer cohort CSVs to score accounts in bulk, filter by risk exposure, and route high-risk renewals to team review queues. Seamlessly collaborate on action plans and share successful intervention playbooks across customer success.',
    highlights: [
      { label: 'Bulk CSV Ingestion', value: '5,000+ Accounts', desc: 'Instant batch scoring and exposure breakdown in seconds' },
      { label: 'Review Queue', value: 'Auditable Stream', desc: 'Collaborative client-side encrypted notes per account' },
      { label: 'Model Lab', value: 'ROC-AUC & Accuracy', desc: 'Inspect confusion matrix and global feature importances anytime' }
    ],
    actionLabel: 'View Cohorts & Accounts',
    actionPage: 'customers'
  }
];

export function PlatformTourModal({
  isOpen,
  onClose,
  onNavigateToPage,
  onOpenAI
}: PlatformTourModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') {
        setCurrentSlideIndex(prev => (prev < TOUR_SLIDES.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : TOUR_SLIDES.length - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const slide = TOUR_SLIDES[currentSlideIndex];

  function handleAction() {
    if (slide.actionTriggerAI) {
      onClose();
      onOpenAI();
    } else if (slide.actionPage) {
      onClose();
      onNavigateToPage(slide.actionPage);
    }
  }

  return (
    <div className="platform-tour-backdrop" onClick={onClose}>
      <div className="platform-tour-modal" onClick={e => e.stopPropagation()}>
        {/* Header with Slide Tabs */}
        <div className="tour-modal-head">
          <div className="tour-brand">
            <div className="tour-icon-wrap">
              <Sparkles size={17} />
            </div>
            <div>
              <h3>Kairon Platform Tour & Architecture</h3>
              <p>Explore the 5 core pillars of customer relationship intelligence</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} title="Close Tour">
            <X size={18} />
          </button>
        </div>

        {/* Slide Navigation Tabs */}
        <div className="tour-nav-tabs">
          {TOUR_SLIDES.map((s, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <button
                key={s.id}
                className={`tour-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentSlideIndex(idx)}
              >
                <span className="tour-tab-num">0{s.id}</span>
                <span className="tour-tab-name">{s.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Active Slide Body */}
        <div className="tour-slide-body">
          <div className="tour-slide-main">
            <div className="tour-slide-header">
              <span
                className="tour-badge"
                style={{
                  background: `${slide.badgeColor}15`,
                  color: slide.badgeColor,
                  borderColor: `${slide.badgeColor}35`
                }}
              >
                Slide 0{slide.id} • {slide.badge}
              </span>
              <h2>{slide.title}</h2>
              <h4>{slide.subtitle}</h4>
              <p className="tour-description">{slide.description}</p>
            </div>

            {/* Highlights Grid */}
            <div className="tour-highlights-grid">
              {slide.highlights.map((h, i) => (
                <div className="tour-highlight-card" key={i}>
                  <div className="tour-highlight-top">
                    <CheckCircle2 size={15} style={{ color: slide.badgeColor }} />
                    <b>{h.label}</b>
                  </div>
                  <strong>{h.value}</strong>
                  <p>{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer with Controls */}
        <div className="tour-modal-footer">
          <div className="tour-pagination">
            <button
              className="icon-button tour-arrow-btn"
              onClick={() => setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : TOUR_SLIDES.length - 1))}
              title="Previous slide (Left Arrow)"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="tour-dots">
              {TOUR_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  className={`tour-dot ${idx === currentSlideIndex ? 'active' : ''}`}
                  onClick={() => setCurrentSlideIndex(idx)}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              className="icon-button tour-arrow-btn"
              onClick={() => setCurrentSlideIndex(prev => (prev < TOUR_SLIDES.length - 1 ? prev + 1 : 0))}
              title="Next slide (Right Arrow)"
            >
              <ChevronRight size={18} />
            </button>
            <span className="tour-counter">
              {currentSlideIndex + 1} of {TOUR_SLIDES.length}
            </span>
          </div>

          <div className="tour-actions">
            <button className="secondary-button" onClick={onClose}>
              Done Exploring
            </button>
            <button className="primary-button tour-action-btn" onClick={handleAction}>
              {slide.actionLabel} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
