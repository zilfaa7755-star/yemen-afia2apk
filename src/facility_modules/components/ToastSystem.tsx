import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { useStore } from '../store';
import type { ToastType } from '../types';

const styles: Record<ToastType, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200' },
  error: { icon: AlertCircle, className: 'border-rose-500/40 bg-rose-950/90 text-rose-200' },
  warning: { icon: AlertTriangle, className: 'border-amber-500/40 bg-amber-950/90 text-amber-200' },
  info: { icon: Info, className: 'border-sky-500/40 bg-sky-950/90 text-sky-200' },
};

export function ToastSystem() {
  const { toasts, removeToast } = useStore();
  return (
    <div className="fixed bottom-5 left-5 z-[100] flex w-[min(380px,calc(100vw-40px))] flex-col gap-3">
      {toasts.map((toast) => {
        const style = styles[toast.type];
        const Icon = style.icon;
        return (
          <div key={toast.id} className={`animate-slide-in-right flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-xl ${style.className}`}>
            <Icon size={19} className="shrink-0" />
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="rounded p-1 opacity-60 transition hover:bg-white/10 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
