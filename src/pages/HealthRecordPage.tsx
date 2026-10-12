import { ArrowRight } from 'lucide-react';
import { PatientRecord } from '../clinical_view/PatientRecord';

interface HealthRecordPageProps {
  onBack?: () => void;
}

export function HealthRecordPage({ onBack }: HealthRecordPageProps) {
  return (
    <div className="min-h-screen bg-canvas-dark" dir="rtl">
      {/* Back navigation bar for patient view */}
      {onBack && (
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 h-14 flex items-center shadow-sm">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            رجوع
          </button>
          <h1 className="text-base font-bold text-slate-800 mr-4">السجل الصحي الموحد</h1>
        </div>
      )}
      {/* PatientRecord in readOnly mode — hides doctor-only editing tools */}
      <PatientRecord readOnly />
    </div>
  );
}
