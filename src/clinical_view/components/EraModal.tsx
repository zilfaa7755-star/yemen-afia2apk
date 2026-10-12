import { useEffect } from 'react';
import { X, Calendar, Activity, AlertCircle } from 'lucide-react';
import type { TimelineEra } from '../types';

interface EraModalProps {
  era: TimelineEra | null;
  onClose: () => void;
}

export function EraModal({ era, onClose }: EraModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!era) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-white rounded-2xl shadow-2xl z-[111] animate-scale-in overflow-hidden">
        <div
          className={`px-5 py-4 ${
            era.isSpike
              ? 'bg-gradient-to-l from-danger-600 to-danger-500'
              : 'bg-gradient-to-l from-primary-600 to-primary-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{era.year}: {era.label}</h2>
                <p className="text-xs text-white/80">{era.visits} زيارة طبية</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {era.isSpike && (
            <div className="mb-3 p-3 rounded-xl bg-danger-50 border border-danger-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger-600 shrink-0" />
              <p className="text-xs font-semibold text-danger-700">
                فترة حرجة - نكس كلوي حاد وصدمة تأقية
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">الملخص السريري</p>
                <p className="text-sm text-slate-700 leading-relaxed">{era.summary}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                {era.hba1c}
              </div>
              <div>
                <p className="text-xs text-amber-600 font-semibold">HbA1c (السكر التراكمي)</p>
                <p className="text-sm font-bold text-amber-700">{era.hba1c}% {era.hba1c >= 9 ? '⚠️ غير متحكم' : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
