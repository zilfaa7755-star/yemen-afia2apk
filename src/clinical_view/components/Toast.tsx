import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'info' | 'error';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: { icon: CheckCircle2, bg: 'bg-success-50 border-success-500 text-success-700', iconColor: 'text-success-600' },
    warning: { icon: AlertTriangle, bg: 'bg-warning-50 border-warning-500 text-warning-700', iconColor: 'text-warning-600' },
    error: { icon: AlertTriangle, bg: 'bg-danger-50 border-danger-500 text-danger-700', iconColor: 'text-danger-600' },
    info: { icon: Info, bg: 'bg-primary-50 border-primary-500 text-primary-700', iconColor: 'text-primary-600' },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl border-2 shadow-lg animate-toast-in min-w-[320px] max-w-md ${config.bg}`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${config.iconColor}`} />
      <span className="text-sm font-semibold flex-1">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
