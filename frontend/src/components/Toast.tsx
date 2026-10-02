import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

export function showToast(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('kairon-toast', {
        detail: {
          id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type,
          message,
          timestamp: Date.now()
        }
      })
    );
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function handleNewToast(e: Event) {
      const customEvent = e as CustomEvent<ToastItem>;
      if (customEvent.detail) {
        setToasts(prev => [...prev.slice(-4), customEvent.detail]);
      }
    }

    window.addEventListener('kairon-toast', handleNewToast);
    return () => window.removeEventListener('kairon-toast', handleNewToast);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setToasts(prev => prev.filter(t => now - t.timestamp < 3800));
    }, 500);
    return () => clearInterval(timer);
  }, [toasts]);

  function removeToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="kairon-toast-container" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className={`kairon-toast kairon-toast-${toast.type}`}>
          <div className="kairon-toast-icon">
            {toast.type === 'success' && <CheckCircle2 size={16} />}
            {toast.type === 'warning' && <AlertTriangle size={16} />}
            {toast.type === 'error' && <XCircle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
          </div>
          <span className="kairon-toast-msg">{toast.message}</span>
          <button
            type="button"
            className="kairon-toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
