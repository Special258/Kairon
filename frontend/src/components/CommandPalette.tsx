import React, { useState, useEffect, useRef } from 'react';
import {
  Search, LayoutDashboard, Gauge, SlidersHorizontal, Users,
  MessageSquare, FlaskConical, Settings, Moon, Sun, Sparkles,
  Layers, Download, Key, ShieldCheck, ArrowRight, CornerDownLeft, X,
  FileSpreadsheet, Terminal, Cpu
} from 'lucide-react';
import type { Page } from '../types';
import type { ScoredAccountRecord } from '../services/userData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
  onOpenAI: () => void;
  onOpenTour: () => void;
  onLoadSampleCohort: () => void;
  onDownloadTemplate: () => void;
  onExportKey: () => void;
  workspaceAccounts: ScoredAccountRecord[];
  onSelectAccount?: (acc: ScoredAccountRecord) => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'Accounts';
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onToggleTheme,
  theme,
  onOpenAI,
  onOpenTour,
  onLoadSampleCohort,
  onDownloadTemplate,
  onExportKey,
  workspaceAccounts,
  onSelectAccount
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct items
  const baseItems: CommandItem[] = [
    {
      id: 'nav-overview',
      category: 'Navigation',
      icon: LayoutDashboard,
      title: 'Overview Dashboard',
      subtitle: 'Portfolio health, protected ARR & churn distribution',
      badge: 'G 1',
      action: () => { onNavigate('overview'); onClose(); }
    },
    {
      id: 'nav-scorer',
      category: 'Navigation',
      icon: Gauge,
      title: 'Account Scorer',
      subtitle: 'Individual customer risk scoring & explainability',
      badge: 'G 2',
      action: () => { onNavigate('scorer'); onClose(); }
    },
    {
      id: 'nav-whatif',
      category: 'Navigation',
      icon: SlidersHorizontal,
      title: 'What-If Sandbox',
      subtitle: 'Commercial levers & retention ROI sensitivity',
      badge: 'G 3',
      action: () => { onNavigate('whatif'); onClose(); }
    },
    {
      id: 'nav-cohorts',
      category: 'Navigation',
      icon: FileSpreadsheet,
      title: 'Cohorts & Accounts',
      subtitle: 'Universal CSV batch scoring & portfolio filters',
      badge: 'G 4',
      action: () => { onNavigate('customers'); onClose(); }
    },
    {
      id: 'nav-reviews',
      category: 'Navigation',
      icon: MessageSquare,
      title: 'Team Reviews',
      subtitle: 'Zero-knowledge E2EE customer review queue',
      badge: 'G 5',
      action: () => { onNavigate('reviews'); onClose(); }
    },
    {
      id: 'nav-model',
      category: 'Navigation',
      icon: FlaskConical,
      title: 'Model Diagnostics',
      subtitle: 'ROC-AUC curve, confusion matrix & feature weights',
      badge: 'G 6',
      action: () => { onNavigate('model'); onClose(); }
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      icon: Settings,
      title: 'Settings & Security',
      subtitle: 'Workspace preferences, visual themes & E2EE cipher keys',
      badge: 'G 7',
      action: () => { onNavigate('settings'); onClose(); }
    },
    {
      id: 'act-theme',
      category: 'Actions',
      icon: theme === 'dark' ? Sun : Moon,
      title: `Switch to ${theme === 'dark' ? 'Emerald Mist (Light)' : 'Midnight Obsidian (Dark)'}`,
      subtitle: 'Toggle global interface visual atmosphere',
      badge: 'THEME',
      action: () => { onToggleTheme(); onClose(); }
    },
    {
      id: 'act-ai',
      category: 'Actions',
      icon: Sparkles,
      title: 'Launch AI Copilot',
      subtitle: 'Root-cause diagnosis, executive drafts & turnaround playbooks',
      badge: 'COPILOT',
      action: () => { onOpenAI(); onClose(); }
    },
    {
      id: 'act-tour',
      category: 'Actions',
      icon: Layers,
      title: 'Platform Architecture Slides',
      subtitle: 'Interactive 5-pillar tour of Kairon system design',
      badge: 'SLIDES',
      action: () => { onOpenTour(); onClose(); }
    },
    {
      id: 'act-sample',
      category: 'Actions',
      icon: Users,
      title: 'Load Enterprise Sample Cohort (25 Accounts)',
      subtitle: 'Populate workspace with real-world enterprise test accounts',
      badge: 'COHORT',
      action: () => { onLoadSampleCohort(); onNavigate('customers'); onClose(); }
    },
    {
      id: 'act-template',
      category: 'Actions',
      icon: Download,
      title: 'Download CSV Cohort Template',
      subtitle: 'Get standard CSV template for batch customer uploads',
      badge: 'CSV',
      action: () => { onDownloadTemplate(); onClose(); }
    },
    {
      id: 'act-export-key',
      category: 'Actions',
      icon: Key,
      title: 'Export E2EE Master Key Backup',
      subtitle: 'Copy client-side AES-256-GCM device key to clipboard',
      badge: 'SECURITY',
      action: () => { onExportKey(); onClose(); }
    }
  ];

  // Dynamic account items if any exist
  const accountItems: CommandItem[] = workspaceAccounts.slice(0, 15).map(acc => ({
    id: `acc-${acc.customer_id}`,
    category: 'Accounts',
    icon: Terminal,
    title: acc.company_name,
    subtitle: `${acc.customer_id} • $${acc.monthly_charges}/mo • ${acc.risk_tier} Risk (${acc.churn_probability.toFixed(1)}%)`,
    badge: acc.risk_tier.toUpperCase(),
    action: () => {
      if (onSelectAccount) onSelectAccount(acc);
      onNavigate('scorer');
      onClose();
    }
  }));

  const allItems = [...baseItems, ...accountItems];

  const filteredItems = allItems.filter(item => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Handle keyboard navigation inside the palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  // Keep selected item in view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('.cmd-item.selected') as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-modal" onClick={e => e.stopPropagation()}>
        {/* Tech Header / Search Input */}
        <div className="cmd-search-wrap">
          <div className="cmd-search-icon">
            <Search size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Type a command, jump to page, or search accounts..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="cmd-shortcut-tag">
            <kbd>ESC</kbd> to close
          </div>
        </div>

        {/* Command List */}
        <div className="cmd-list" ref={listRef}>
          {filteredItems.length === 0 ? (
            <div className="cmd-empty">
              <Cpu size={24} style={{ opacity: 0.5, marginBottom: 8 }} />
              <p>No matching commands or accounts found for "<b>{query}</b>"</p>
              <small>Try typing "scorer", "whatif", "dark", or an account name.</small>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`cmd-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="cmd-item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="cmd-item-content">
                    <div className="cmd-item-title-row">
                      <span className="cmd-item-title">{item.title}</span>
                      <span className="cmd-item-category">{item.category}</span>
                    </div>
                    <span className="cmd-item-subtitle">{item.subtitle}</span>
                  </div>
                  {item.badge && (
                    <span className={`cmd-item-badge ${item.badge.toLowerCase()}`}>
                      {item.badge}
                    </span>
                  )}
                  {isSelected && (
                    <span className="cmd-enter-hint">
                      <CornerDownLeft size={12} />
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Techy HUD Footer */}
        <div className="cmd-footer">
          <div className="cmd-footer-left">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>ESC</kbd> Exit</span>
          </div>
          <div className="cmd-footer-right">
            <span className="cmd-status-indicator">
              <i className="status-ping-dot" /> KAIRON_CORE_V1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
