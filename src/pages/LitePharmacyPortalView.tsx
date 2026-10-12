import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Pill, AlertTriangle, CheckCircle, ShieldCheck,
  ChevronLeft, FileText, Hash, Printer, Lock, X,
  Package, Barcode, Clock, Bell, ChevronDown, Home,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type PrescriptionStatus = 'pending' | 'partial' | 'dispensed';
type DispenseMode = 'full' | 'partial';

interface DrugItem {
  id: string;
  genericName: string;
  brandName: string;
  dosage: string;
  instructions: string;
  brands: { name: string; manufacturer: string }[];
  selectedBrand: number;
  unavailable?: boolean;
}

interface Prescription {
  id: string;
  rxCode: string;
  mrn: string;
  patientName: string;
  patientAge: number;
  doctorName: string;
  doctorLicense: string;
  doctorCredential: string;
  status: PrescriptionStatus;
  createdAt: string;
  items: DrugItem[];
  interactionSafe: boolean;
  allergySafe: boolean;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx1',
    rxCode: 'RX-2026-009421',
    mrn: '10-0942-882',
    patientName: 'عبدالكريم ناصر الحيمي',
    patientAge: 54,
    doctorName: 'د. سامي النجار',
    doctorLicense: '1408-ص',
    doctorCredential: 'معتمد من المجلس الطبي اليمني',
    status: 'pending',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    interactionSafe: true,
    allergySafe: true,
    items: [
      {
        id: 'm1',
        genericName: 'Amoxicillin/Clavulanic 1g Tab (أوجمنتين)',
        brandName: 'أوجمنتين',
        dosage: 'قرص كل 12 ساعة لمدة 7 أيام',
        instructions: 'يؤخذ بعد الأكل مع كوب ماء كامل',
        brands: [
          { name: 'Augmentin 1g', manufacturer: 'GSK' },
          { name: 'Curam 1g', manufacturer: 'Sandoz' },
          { name: 'Klavox 1g', manufacturer: 'Spimaco' },
        ],
        selectedBrand: 0,
      },
      {
        id: 'm2',
        genericName: 'Paracetamol 500mg Tab (بنادول)',
        brandName: 'بنادول',
        dosage: 'قرصين عند اللزوم / الحرارة',
        instructions: 'لا يتجاوز 8 أقراص في اليوم',
        brands: [
          { name: 'Panadol Blue', manufacturer: 'GSK' },
          { name: 'Fevadol', manufacturer: 'Jamjoom' },
        ],
        selectedBrand: 0,
      },
      {
        id: 'm3',
        genericName: 'Omeprazole 20mg Cap (أوميبرازول)',
        brandName: 'أوميبرازول',
        dosage: 'كبسولة واحدة قبل الإفطار بنصف ساعة',
        instructions: 'يؤخذ صباحاً على معدة فارغة',
        brands: [
          { name: 'Omez 20mg', manufacturer: "Dr. Reddy's" },
          { name: 'Losec 20mg', manufacturer: 'AstraZeneca' },
        ],
        selectedBrand: 0,
      },
    ],
  },
  {
    id: 'rx2',
    rxCode: 'RX-2026-008877',
    mrn: '10-0731-451',
    patientName: 'فاطمة علي المقطري',
    patientAge: 38,
    doctorName: 'د. نجيب المتوكل',
    doctorLicense: '1192-ص',
    doctorCredential: 'معتمد من المجلس الطبي اليمني',
    status: 'pending',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    interactionSafe: true,
    allergySafe: true,
    items: [
      {
        id: 'm4',
        genericName: 'Metformin 500mg Tab (ميتفورمين)',
        brandName: 'ميتفورمين',
        dosage: 'قرص مرتين يومياً بعد الأكل',
        instructions: 'مراقبة سكر الدم بانتظام',
        brands: [
          { name: 'Glucophage 500', manufacturer: 'Merck' },
          { name: 'Glumetza 500', manufacturer: 'Bristol-Myers' },
        ],
        selectedBrand: 0,
      },
      {
        id: 'm5',
        genericName: 'Amlodipine 5mg Tab (أملوديبين)',
        brandName: 'أملوديبين',
        dosage: 'قرص واحد صباحاً',
        instructions: 'مراقبة ضغط الدم',
        brands: [
          { name: 'Norvasc 5mg', manufacturer: 'Pfizer' },
          { name: 'Amlor 5mg', manufacturer: 'Pfizer' },
        ],
        selectedBrand: 0,
      },
    ],
  },
  {
    id: 'rx3',
    rxCode: 'RX-2026-007654',
    mrn: '10-0518-337',
    patientName: 'سالم عبدالله الشامي',
    patientAge: 45,
    doctorName: 'د. سامي النجار',
    doctorLicense: '1408-ص',
    doctorCredential: 'معتمد من المجلس الطبي اليمني',
    status: 'partial',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    interactionSafe: true,
    allergySafe: true,
    items: [
      {
        id: 'm6',
        genericName: 'Atorvastatin 20mg Tab (أتورفاستاتين)',
        brandName: 'أتورفاستاتين',
        dosage: 'قرص مساءً',
        instructions: 'مراقبة وظائف الكبد',
        brands: [
          { name: 'Lipitor 20mg', manufacturer: 'Pfizer' },
          { name: 'Atorva 20mg', manufacturer: 'Jamjoom' },
        ],
        selectedBrand: 0,
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'منذ أقل من دقيقة';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  return `منذ ${hrs} ساعة`;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface LitePharmacyPortalViewProps {
  onBack?: () => void;
}

export function LitePharmacyPortalView({ onBack }: LitePharmacyPortalViewProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(DEMO_PRESCRIPTIONS);
  const [mrnInput, setMrnInput] = useState('');
  const [activeRx, setActiveRx] = useState<Prescription | null>(null);
  const [dispenseMode, setDispenseMode] = useState<DispenseMode>('full');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showAlreadyDispensedAlert, setShowAlreadyDispensedAlert] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [burnedRxCode, setBurnedRxCode] = useState<string | null>(null);
  const mrnRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F7 && activeRx') { e.preventDefault(); setShowPrintModal(true); }
      if (e.key === 'F10' && activeRx) { e.preventDefault(); handleBurnDispense(); }
      if (e.key === 'Enter' && document.activeElement === mrnRef.current) { e.preventDefault(); handleFetchByMrn(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const handleFetchByMrn = () => {
    const mrn = mrnInput.trim();
    if (!mrn) return;
    const found = prescriptions
      .filter(p => p.mrn === mrn && p.status !== 'dispensed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    if (found) {
      setActiveRx(found);
      setDispenseMode('full');
    } else {
      const dispensed = prescriptions.find(p => p.mrn === mrn && p.status === 'dispensed');
      if (dispensed) {
        setShowAlreadyDispensedAlert(true);
        setTimeout(() => setShowAlreadyDispensedAlert(false), 4000);
      } else if (mrn === '10-0942-882') {
        const demo = prescriptions.find(p => p.mrn === mrn);
        if (demo) { setActiveRx(demo); setDispenseMode('full'); }
      }
    }
  };

  const handleSelectRx = (rx: Prescription) => {
    setActiveRx(rx);
    setMrnInput(rx.mrn);
    setDispenseMode('full');
  };

  const handleBrandChange = (itemId: string, brandIdx: number) => {
    if (!activeRx) return;
    const updatedItems = activeRx.items.map(item =>
      item.id === itemId ? { ...item, selectedBrand: brandIdx } : item
    );
    setActiveRx({ ...activeRx, items: updatedItems });
  };

  const toggleItemUnavailable = (itemId: string) => {
    if (!activeRx || dispenseMode !== 'partial') return;
    const updatedItems = activeRx.items.map(item =>
      item.id === itemId ? { ...item, unavailable: !item.unavailable } : item
    );
    setActiveRx({ ...activeRx, items: updatedItems });
  };

  const handleBurnDispense = () => {
    if (!activeRx) return;
    const availableItems = dispenseMode === 'full'
      ? activeRx.items
      : activeRx.items.filter(i => !i.unavailable);
    if (availableItems.length === 0) return;
    const newStatus: PrescriptionStatus = dispenseMode === 'full' ? 'dispensed' : 'partial';
    setPrescriptions(prev => prev.map(p =>
      p.id === activeRx.id ? { ...activeRx, status: newStatus } : p
    ));
    setBurnedRxCode(activeRx.rxCode);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
    setActiveRx(null);
    setMrnInput('');
  };

  const statusConfig: Record<PrescriptionStatus, { label: string; cls: string }> = {
    pending:   { label: 'غير مصروفة',     cls: 'bg-amber-100 text-amber-700' },
    partial:   { label: 'صرف جزئي',       cls: 'bg-[#E8F5F4] text-[#104C48]' },
    dispensed: { label: 'مصروفة بالكامل', cls: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-l from-emerald-700 to-emerald-900 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack ? onBack : () => { window.dispatchEvent(new CustomEvent('nav-to-main')); }}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 shrink-0"
              title="العودة للقائمة الرئيسية"
            >
              <Home size={16} />
              <span>الرئيسية</span>
            </button>
            {onBack && (
              <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 text-white" title="رجوع">
                <ChevronLeft size={18} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-right">
            <div>
              <h1 className="text-white font-bold text-base">صيدلية صرف الروشتات</h1>
              <p className="text-white/60 text-xs">نظام الصرف بالرقم الطبي الموحد</p>
            </div>
            <Pill size={22} className="text-white/80" />
          </div>
        </div>
      </div>

      {/* Toasts */}
      {showSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-slide-down">
          <Lock size={20} />
          <div>
            <p className="font-bold">تم الصرف وحرق الروشتة نهائياً</p>
            <p className="text-xs text-white/80">{burnedRxCode} — لا يمكن إعادة صرفها</p>
          </div>
        </div>
      )}
      {showAlreadyDispensedAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-down">
          <AlertTriangle size={24} className="animate-pulse" />
          <div>
            <p className="font-black">تنبيه: هذه الوصفة تم صرفها بالكامل!</p>
            <p className="text-sm text-white/90">لا يمكن إعادة صرفها — الروشتة محروقة</p>
          </div>
        </div>
      )}

      {/* MRN Fetcher */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
            <Barcode size={16} className="text-emerald-600" />
            أدخل الرقم الطبي الموحد (MRN) أو امسح كود الروشتة QR
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleFetchByMrn}
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm flex-shrink-0 hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Search size={16} />
              جلب الروشتة المعلقة
              <kbd className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Enter</kbd>
            </button>
            <input
              ref={mrnRef}
              type="text"
              value={mrnInput}
              onChange={e => setMrnInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetchByMrn()}
              placeholder="10-0942-882"
              dir="ltr"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-center font-mono font-bold text-lg outline-none focus:border-emerald-400 tracking-wider"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">الرقم الطبي الافتراضي للاختبار: 10-0942-882</p>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex gap-4 px-4 pt-4 pb-12" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* Right sidebar - Prescription Queue (30%) */}
        <div className="w-full lg:w-[30%] flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 justify-end">
                <Clock size={16} className="text-emerald-600" />
                طابور الروشتات
              </h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {prescriptions.length === 0 ? (
                <div className="text-center py-10">
                  <Pill size={36} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-400 text-sm">لا توجد روشتات</p>
                </div>
              ) : (
                prescriptions.map(rx => {
                  const st = statusConfig[rx.status];
                  const isActive = activeRx?.id === rx.id;
                  return (
                    <button
                      key={rx.id}
                      onClick={() => rx.status !== 'dispensed' && handleSelectRx(rx)}
                      disabled={rx.status === 'dispensed'}
                      className={`w-full text-right px-4 py-3 border-b border-gray-50 transition-colors ${
                        rx.status === 'dispensed' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-50'
                      } ${isActive ? 'bg-emerald-50 border-r-4 border-r-emerald-600' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st.cls}`}>{st.label}</span>
                        <p className="font-bold text-gray-800 text-sm">{rx.patientName}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{relativeTime(rx.createdAt)}</span>
                        <span className="text-xs font-mono text-gray-500">{rx.rxCode}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Left area - Drug Verification & Substitution (70%) */}
        <div className="flex-1">
          {!activeRx ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20">
              <Pill size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">أدخل رقم طبي أو اختر روشتة من الطابور لبدء الصرف</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Patient & doctor info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${statusConfig[activeRx.status].cls}`}>
                      {statusConfig[activeRx.status].label}
                    </span>
                    <span className="text-xs font-mono text-gray-500">{activeRx.rxCode}</span>
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-gray-800 text-lg">{activeRx.patientName}</h3>
                    <p className="text-xs text-gray-500">{activeRx.patientAge} سنة · MRN: {activeRx.mrn}</p>
                  </div>
                </div>
                {/* Doctor credential badge */}
                <div className="mt-3 bg-green-50 rounded-xl px-3 py-2 flex items-center gap-2 border border-green-100">
                  <ShieldCheck size={16} className="text-green-600 flex-shrink-0" />
                  <div className="text-right flex-1">
                    <p className="text-sm font-bold text-green-800">{activeRx.doctorName}</p>
                    <p className="text-xs text-green-600">✓ {activeRx.doctorCredential} (ترخيص: {activeRx.doctorLicense})</p>
                  </div>
                </div>
              </div>

              {/* Safety checks banner */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3 text-right">فحوصات الأمان الدوائي</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-xl p-3 flex items-center gap-2 ${activeRx.interactionSafe ? 'bg-green-50' : 'bg-red-50'}`}>
                    <CheckCircle size={18} className={activeRx.interactionSafe ? 'text-green-600' : 'text-red-600'} />
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">فحص التداخلات الدوائية</p>
                      <p className={`text-xs ${activeRx.interactionSafe ? 'text-green-600' : 'text-red-600'}`}>
                        {activeRx.interactionSafe ? 'سليم — لا تداخلات' : 'تداخل محتمل!'}
                      </p>
                    </div>
                  </div>
                  <div className={`rounded-xl p-3 flex items-center gap-2 ${activeRx.allergySafe ? 'bg-green-50' : 'bg-red-50'}`}>
                    <CheckCircle size={18} className={activeRx.allergySafe ? 'text-green-600' : 'text-red-600'} />
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">فحص سجل الحساسية</p>
                      <p className={`text-xs ${activeRx.allergySafe ? 'text-green-600' : 'text-red-600'}`}>
                        {activeRx.allergySafe ? 'سليم — لا حساسية' : 'حساسية مسجلة!'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drug items */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 justify-end">
                    <Package size={16} className="text-emerald-600" />
                    أصناف الروشتة — التحقق والاستبدال
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {activeRx.items.map((item, idx) => (
                    <div key={item.id} className={`px-4 py-4 ${item.unavailable ? 'opacity-50' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {dispenseMode === 'partial' && (
                            <button
                              onClick={() => toggleItemUnavailable(item.id)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                !item.unavailable ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'
                              }`}
                            >
                              {!item.unavailable && <CheckCircle size={14} className="text-white" />}
                            </button>
                          )}
                          <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="font-black text-emerald-700 text-xs">{idx + 1}</span>
                          </span>
                        </div>
                        <div className="text-right flex-1 mr-3">
                          <p className="font-bold text-gray-800 text-sm">{item.genericName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.dosage}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.instructions}</p>
                        </div>
                      </div>
                      {/* Brand selector */}
                      {!item.unavailable && (
                        <div className="mr-11">
                          <label className="text-xs text-gray-500 mb-1.5 block text-right">العلامة التجارية المتوفرة:</label>
                          <div className="relative">
                            <select
                              value={item.selectedBrand}
                              onChange={e => handleBrandChange(item.id, parseInt(e.target.value))}
                              className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-emerald-400 bg-white text-right"
                            >
                              {item.brands.map((brand, bIdx) => (
                                <option key={bIdx} value={bIdx}>
                                  {brand.name} — {brand.manufacturer}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      )}
                      {item.unavailable && (
                        <div className="mr-11 bg-red-50 rounded-xl px-3 py-2">
                          <p className="text-xs text-red-600 font-bold">غير متوفر — سيتم صرف باقي الأصناف</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispense mode & actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
                {/* Radio selectors */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2 text-right">نوع الصرف:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDispenseMode('full')}
                      className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        dispenseMode === 'full' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${dispenseMode === 'full' ? 'border-white' : 'border-gray-400'}`}>
                        {dispenseMode === 'full' && <span className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </span>
                      صرف كامل لجميع الأصناف
                    </button>
                    <button
                      onClick={() => setDispenseMode('partial')}
                      className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        dispenseMode === 'partial' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${dispenseMode === 'partial' ? 'border-white' : 'border-gray-400'}`}>
                        {dispenseMode === 'partial' && <span className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </span>
                      صرف جزئي (تحديد غير المتوفر)
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <Printer size={18} />
                    طباعة لواصق الجرعات
                    <kbd className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded">F7</kbd>
                  </button>
                  <button
                    onClick={handleBurnDispense}
                    disabled={dispenseMode === 'partial' && activeRx.items.every(i => i.unavailable)}
                    className={`py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      dispenseMode === 'partial' && activeRx.items.every(i => i.unavailable)
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-gradient-to-l from-red-600 to-red-800 text-white shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <Lock size={18} />
                    تأكيد الصرف وحرق الروشتة نهائياً
                    <kbd className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">F10</kbd>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print stickers modal */}
      {showPrintModal && activeRx && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 animate-slide-down max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setShowPrintModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
              <div className="text-right">
                <h3 className="font-black text-gray-800">لواصق الجرعات</h3>
                <p className="text-xs text-gray-500">معاينة قبل الطباعة</p>
              </div>
              <Printer size={20} className="text-emerald-600" />
            </div>

            <div className="space-y-3">
              {activeRx.items.filter(i => !i.unavailable).map((item, idx) => {
                const brand = item.brands[item.selectedBrand];
                return (
                  <div key={item.id} className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-gray-400">{activeRx.rxCode}</span>
                      <p className="font-black text-gray-800 text-sm">{brand.name} — {brand.manufacturer}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-bold text-gray-700">{item.genericName}</p>
                      <p className="text-xs text-gray-500">المريض: {activeRx.patientName} · {activeRx.mrn}</p>
                      <p className="text-xs text-gray-600 font-medium">الجرعة: {item.dosage}</p>
                      <p className="text-xs text-gray-400">{item.instructions}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => window.print()}
              className="w-full mt-4 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
            >
              <Printer size={18} />
              طباعة اللواصق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
