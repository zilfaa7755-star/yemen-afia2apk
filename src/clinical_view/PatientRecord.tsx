import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { SafetyBanner } from './components/SafetyBanner';
import { Sidebar, type NavCategory } from './components/Sidebar';
import { Timeline } from './components/Timeline';
import { WidgetGrid } from './components/WidgetGrid';
import { Drawer, type DrawerType } from './components/Drawer';
import { DICOMViewer } from './components/DICOMViewer';
import { EraModal } from './components/EraModal';
import { Toast, type ToastMessage, type ToastType } from './components/Toast';
import type { TimelineEra, Allergy, AllergyFormData } from './types';
import {
  medications as initialMeds,
  problems,
  allergies as initialAllergies,
  labResults,
  radiologyStudies,
  surgeries,
  visits,
} from './data/clinicalData';
import { Printer, Share2, FileText, Download } from 'lucide-react';

interface PatientRecordProps {
  readOnly?: boolean;
}

export function PatientRecord({ readOnly = false }: PatientRecordProps) {
  const [activeCategory, setActiveCategory] = useState<NavCategory>('summary');
  const [facilityFilter, setFacilityFilter] = useState<Set<string>>(new Set());
  const [drawerType, setDrawerType] = useState<DrawerType>(null);
  const [dicomOpen, setDicomOpen] = useState(false);
  const [eraModal, setEraModal] = useState<TimelineEra | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>(initialAllergies);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleFacilityToggle = (id: string) => {
    setFacilityFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCategoryClick = (cat: NavCategory) => {
    setActiveCategory(cat);
    if (cat === 'summary') {
      setDrawerType(null);
    } else if (cat === 'labs') setDrawerType('labs');
    else if (cat === 'radiology') setDrawerType(null);
    else if (cat === 'visits') setDrawerType('visits');
    else if (cat === 'surgeries') setDrawerType('surgeries');
    else if (cat === 'emergency') setDrawerType('emergency');
  };

  const handleAddAllergy = (data: AllergyFormData) => {
    if (readOnly) return;
    const newAllergy: Allergy = {
      id: `a${Date.now()}`,
      substance: data.substance,
      category: 'جديد',
      severity: data.severity,
      reaction: data.reaction,
      documentedDate: new Date().toISOString().split('T')[0],
      facility: 'azal',
    };
    setAllergies((prev) => [newAllergy, ...prev]);
    showToast(`تم توثيق حساسية جديدة: ${data.substance}`, 'success');
  };

  return (
    <div className="min-h-screen bg-canvas-dark" dir="rtl">
      <div className="max-w-[1440px] mx-auto bg-canvas-light min-h-screen flex flex-col shadow-2xl">
        <Header />
        <SafetyBanner onOpenEmergency={() => setDrawerType('emergency')} />

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto grid-bg order-2 lg:order-1">
            <div className="p-3 sm:p-4 space-y-3">
              {/* Top action bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">الملخص السريري الشامل</h2>
                  <p className="text-xs text-slate-400">آخر تحديث: 2026/09/11 - 14:32 | التزامن التلقائي مفعّل</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => showToast('جاري تجهيز تقرير PDF شامل...', 'info')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    طباعة PDF
                  </button>
                  <button
                    onClick={() => showToast('تم نسخ رابط المشاركة الآمن', 'success')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    مشاركة آمنة
                  </button>
                  {!readOnly && (
                    <button
                      onClick={() => showToast('جاري تصدير السجل بصيغة HL7 FHIR...', 'info')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      تصدير FHIR
                    </button>
                  )}
                  <button
                    onClick={() => showToast('تم فتح السجل الكامل في تبويب جديد', 'info')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    السجل الكامل
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <Timeline onEraClick={(era) => setEraModal(era)} />

              {/* Widget Grid */}
              <WidgetGrid
                medications={initialMeds}
                problems={problems}
                allergies={allergies}
                labResults={labResults}
                radiologyStudies={radiologyStudies}
                surgeries={surgeries}
                facilityFilter={facilityFilter}
                onOpenMeds={() => setDrawerType('meds')}
                onOpenProblems={() => setDrawerType('problems')}
                onOpenAllergies={() => setDrawerType('allergies')}
                onOpenLabs={() => setDrawerType('labs')}
                onOpenRadiology={() => showToast('استخدم زر عارض DICOM لفتح المعرض الكامل', 'info')}
                onOpenSurgeries={() => setDrawerType('surgeries')}
                onOpenDICOM={() => setDicomOpen(true)}
              />

              {/* Bottom footer */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 py-3 text-xs text-slate-400 text-center">
                <span>منصة يمن عافية الوطنية | السجل السريري الموحد (HIE)</span>
                <span>•</span>
                <span>متوافق مع HL7 FHIR R4 و ICD-11</span>
                <span>•</span>
                <span>تشفير AES-256 من طرف لطرف</span>
              </div>
            </div>
          </div>

          <Sidebar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onCategoryClick={handleCategoryClick}
            facilityFilter={facilityFilter}
            onFacilityToggle={handleFacilityToggle}
          />
        </div>
      </div>

      {/* Drawer */}
      <Drawer
        type={drawerType}
        onClose={() => setDrawerType(null)}
        medications={initialMeds}
        problems={problems}
        allergies={allergies}
        labResults={labResults}
        surgeries={surgeries}
        visits={visits}
        onAddAllergy={readOnly ? undefined : handleAddAllergy}
        readOnly={readOnly}
      />

      {/* DICOM Viewer */}
      {dicomOpen && <DICOMViewer onClose={() => setDicomOpen(false)} />}

      {/* Era Modal */}
      <EraModal era={eraModal} onClose={() => setEraModal(null)} />

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default PatientRecord;
