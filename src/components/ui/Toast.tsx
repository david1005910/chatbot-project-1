'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300);
  };

  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const styles: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconStyles: Record<ToastType, string> = {
    success: 'bg-green-100 text-green-600',
    error: 'bg-red-100 text-red-600',
    warning: 'bg-yellow-100 text-yellow-600',
    info: 'bg-blue-100 text-blue-600',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300',
        styles[toast.type],
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      role="alert"
    >
      <span
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold',
          iconStyles[toast.type]
        )}
      >
        {icons[toast.type]}
      </span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
        aria-label="닫기"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Shorthand functions for common toast types
export function toast(message: string, type: ToastType = 'info', duration?: number) {
  // This is a placeholder - actual implementation needs the context
  console.warn('Toast called outside of ToastProvider context');
}
