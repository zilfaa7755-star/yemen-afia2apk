import React, { useState, useEffect, useRef } from 'react';
import {
  Search, FlaskConical, AlertTriangle, CheckCircle, Clock,
  FileText, Upload, Save, Zap, ChevronLeft, Activity, User,
  Stethoscope, Hash, Filter, Bell, Home,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Priority = 'stat' | 'urgent' | 'routine';
type OrderStatus = 'pending' | 'in_progress' | 'completed';

interface LabTest {
  id: string;
  name: string;
  loinc?: string;
  unit: string;
  normalLow: number;
  normalHigh: number;
  panicHigh?: number;
  panicLow?: number;
  value: string;
  isPanic: boolean;
  isAbnormal: boolean;
}

interface LabOrder {
  id: string;
  mrn: string;
  patientName: string;
  patientAge: number;
  doctorName: string;
  department: string;
  priority: Priority;
  status: OrderStatus;
  createdAt: string;
  tests: LabTest[];
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const TEST_DEFINITIONS: Omit<LabTest, 'value' | 'isPanic' | 'isAbnormal'>[] = [
  { id: 'creat', name: 'كرياتينين المصل', loinc: '2160-0', unit: 'mg/dL', normalLow: 0.70, normalHigh: 1.30 },
  { id: 'bun', name: 'يوريا الدم (BUN)', unit: 'mg/dL', normalLow: 7.0, normalHigh: 20.0 },
  { id: 'k', name: 'البوتاسيوم (K+)', loinc: '2823-3', unit: 'mmol/L', normalLow: 3.5, normalHigh: 5.1, panicHigh: 6.2 },
  { id: 'na', name: 'الصوديوم (Na+)', unit: 'mmol/L', normalLow: 135.0, normalHigh: 145.0 },
];

const DEMO_ORDERS: LabOrder[] = [
  {
    id: 'lo1',
    mrn: '10-0942-882',
    patientName: 'عبدالكريم ناصر الحيمي',
    patientAge: 54,
    doctorName: 'د. سامي النجار',
    department: 'باطنية',
    priority: 'stat',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    tests: TEST_DEFINITIONS.map(t => ({ ...t, value: '', isPanic: false, isAbnormal: false })),
  },
  {
    id: 'lo2',
    mrn: '10-0731-451',
    patientName: 'فاطمة علي المقطري',
    patientAge: 38,
    doctorName: 'د. نجيب المتوكل',
    department: 'جراحة',
    priority: 'urgent',
    status: 'pending',
    createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
    tests: TEST_DEFINITIONS.map(t => ({ ...t, value: '', isPanic: false, isAbnormal: false })),
  },
  {
    id: 'lo3',
    mrn: '10-0518-337',
    patientName: 'سالم عبدالله الشامي',
    patientAge: 45,
    doctorName: 'د. سامي النجار',
    department: 'باطنية',
    priority: 'routine',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    tests: TEST_DEFINITIONS.map(t => ({ ...t, value: '', isPanic: false, isAbnormal: false })),
  },
  {
    id: 'lo4',
    mrn: '10-0342-219',
    patientName: 'نورا يحيى الحيمي',
    patientAge: 29,
    doctorName: 'د. إلهام الشامي',
    department: 'نساء وولادة',
    priority: 'routine',
    status: 'pending',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    tests: TEST_DEFINITIONS.map(t => ({ ...t, value: '', isPanic: false, isAbnormal: false })),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'منذ أقل من دقيقة';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  return `منذ ${hrs} ساعة و ${mins % 60} دقيقة`;
}

function evaluateTest(test: LabTest): { isPanic: boolean; isAbnormal: boolean } {
  const v = parseFloat(test.value);
  if (isNaN(v)) return { isPanic: false, isAbnormal: false };
  let isPanic = false;
  let isAbnormal = false;
  if (test.panicHigh && v >= test.panicHigh) isPanic = true;
  if (test.panicLow && v <= test.panicLow) isPanic = true;
  if (v < test.normalLow || v > test.normalHigh) isAbnormal = true;
  return { isPanic, isAbnormal };
}

// ─── Component ────────────────────────────────────────────────────────────────
interface LiteLabPortalViewProps {
  onBack?: () => void;
}

export function LiteLabPortalView({ onBack }: LiteLabPortalViewProps) {
  const [orders, setOrders] = useState<LabOrder[]>(DEMO_ORDERS);
  const [mrnInput, setMrnInput] = useState('');
  const [activeOrder, setActiveOrder] = useState<LabOrder | null>(null);
  const [filter, setFilter] = useState<'all' | 'stat' | 'routine'>('all');
  const [showPanicBanner, setShowPanicBanner] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const mrnRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F9' && activeOrder) { e.preventDefault(); handleCommitResults(); }
      if (e.key === 'Enter' && document.activeElement === mrnRef.current) { e.preventDefault(); handleFetchByMrn(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Check for panic values
  useEffect(() => {
    if (activeOrder) {
      const hasPanic = activeOrder.tests.some(t => t.isPanic);
      setShowPanicBanner(hasPanic);
    } else {
      setShowPanicBanner(false);
    }
  }, [activeOrder]);

  const handleFetchByMrn = () => {
    const mrn = mrnInput.trim();
    if (!mrn) return;
    // Find latest pending order for this MRN
    const found = orders
      .filter(o => o.mrn === mrn && o.status !== 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    if (found) {
      setActiveOrder(found);
    } else if (mrn === '10-0942-882') {
      // Default test MRN
      const demoOrder = orders.find(o => o.mrn === mrn);
      if (demoOrder) setActiveOrder(demoOrder);
    } else {
      // Create a new order for unknown MRN
      const newOrder: LabOrder = {
        id: `lo-${Date.now()}`,
        mrn,
        patientName: 'مريض جديد',
        patientAge: 0,
        doctorName: '—',
        department: 'عام',
        priority: 'routine',
        status: 'pending',
        createdAt: new Date().toISOString(),
        tests: TEST_DEFINITIONS.map(t => ({ ...t, value: '', isPanic: false, isAbnormal: false })),
      };
      setOrders(prev => [newOrder, ...prev]);
      setActiveOrder(newOrder);
    }
  };

  const handleSelectOrder = (order: LabOrder) => {
    setActiveOrder(order);
    setMrnInput(order.mrn);
  };

  const handleTestValueChange = (testId: string, value: string) => {
    if (!activeOrder) return;
    const updatedTests = activeOrder.tests.map(t => {
      if (t.id !== testId) return t;
      const updated = { ...t, value };
      const { isPanic, isAbnormal } = evaluateTest(updated);
      return { ...updated, isPanic, isAbnormal };
    });
    setActiveOrder({ ...activeOrder, tests: updatedTests });
  };

  const handleSaveDraft = () => {
    if (!activeOrder) return;
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...activeOrder, status: 'in_progress' as OrderStatus } : o));
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleCommitResults = () => {
    if (!activeOrder) return;
    const hasAllValues = activeOrder.tests.every(t => t.value.trim() !== '');
    if (!hasAllValues) return;
    setOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...activeOrder, status: 'completed' as OrderStatus } : o));
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
    setActiveOrder(null);
    setMrnInput('');
    setAttachedFile(null);
  };

  const handleAttachFile = () => {
    setAttachedFile(`تقرير_${Date.now()}.pdf`);
  };

  const filteredOrders = filter === 'all'
    ? orders.filter(o => o.status !== 'completed')
    : orders.filter(o => o.priority === filter && o.status !== 'completed');

  const priorityConfig: Record<Priority, { label: string; cls: string; dot: string }> = {
    stat:    { label: 'طوارئ حرجة STAT', cls: 'bg-red-100 text-red-700',    dot: 'bg-red-500 animate-pulse' },
    urgent:  { label: 'عاجل',             cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    routine: { label: 'عادي',             cls: 'bg-gray-100 text-gray-600',  dot: 'bg-gray-400' },
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-l from-indigo-700 to-indigo-900 px-4 py-3 shadow-lg">
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
              <h1 className="text-white font-bold text-base">مختبر الفحوصات والنتائج</h1>
              <p className="text-white/60 text-xs">نظام رصد النتائج بالرقم الطبي</p>
            </div>
            <FlaskConical size={22} className="text-white/80" />
          </div>
        </div>
      </div>

      {/* Success toast */}
      {showSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-slide-down">
          <CheckCircle size={20} />
          <span className="font-bold">تم اعتماد النتائج ورفعها لملف المريض</span>
        </div>
      )}
      {showSavedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#199A8E] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-slide-down">
          <Save size={20} />
          <span className="font-bold">تم حفظ النتائج كمسودة</span>
        </div>
      )}

      {/* MRN Fetcher */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
            <Hash size={16} className="text-indigo-600" />
            أدخل الرقم الطبي الموحد (MRN) أو امسح الباركود
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleFetchByMrn}
              className="px-5 py-3 rounded-xl bg-[#104C48] text-white font-bold text-sm flex-shrink-0 hover:bg-[#0d3f3c] transition-colors flex items-center gap-2"
            >
              <Search size={16} />
              جلب الفحص الأخير
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
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-center font-mono font-bold text-lg outline-none focus:border-indigo-400 tracking-wider"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">الرقم الطبي الافتراضي للاختبار: 10-0942-882</p>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex gap-4 px-4 pt-4 pb-12" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* Right sidebar - Live Queue (30%) */}
        <div className="w-full lg:w-[30%] flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 justify-end">
                <Activity size={16} className="text-indigo-600" />
                الطابور المباشر
              </h3>
            </div>
            {/* Filter tabs */}
            <div className="flex border-b border-gray-100">
              {([
                { id: 'all' as const, label: 'الكل' },
                { id: 'stat' as const, label: 'طوارئ حرجة' },
                { id: 'routine' as const, label: 'عادي' },
              ]).map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                    filter === f.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {/* Queue items */}
            <div className="max-h-[500px] overflow-y-auto">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-10">
                  <FlaskConical size={36} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-400 text-sm">لا توجد طلبات معلقة</p>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const pri = priorityConfig[order.priority];
                  const isActive = activeOrder?.id === order.id;
                  return (
                    <button
                      key={order.id}
                      onClick={() => handleSelectOrder(order)}
                      className={`w-full text-right px-4 py-3 border-b border-gray-50 transition-colors hover:bg-[#E8F5F4] ${
                        isActive ? 'bg-[#E8F5F4] border-r-4 border-r-[#199A8E]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${pri.dot}`} />
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${pri.cls}`}>{pri.label}</span>
                        </div>
                        <p className="font-bold text-gray-800 text-sm">{order.patientName}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{relativeTime(order.createdAt)}</span>
                        <span className="text-xs font-mono text-gray-500">{order.mrn}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Left form - Dynamic Test Results (70%) */}
        <div className="flex-1">
          {!activeOrder ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20">
              <FlaskConical size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">أدخل رقم طبي أو اختر طلباً من الطابور لبدء إدخال النتائج</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Patient info banner */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${priorityConfig[activeOrder.priority].cls}`}>
                      {priorityConfig[activeOrder.priority].label}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {relativeTime(activeOrder.createdAt)}
                    </span>
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-gray-800 text-lg">{activeOrder.patientName}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 justify-end mt-1">
                      <span className="flex items-center gap-1"><Stethoscope size={12} /> {activeOrder.doctorName}</span>
                      <span>{activeOrder.department}</span>
                      <span>{activeOrder.patientAge} سنة</span>
                      <span className="font-mono">{activeOrder.mrn}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panic banner */}
              {showPanicBanner && (
                <div className="bg-red-600 text-white rounded-2xl p-4 flex items-center gap-3 animate-pulse shadow-lg">
                  <AlertTriangle size={28} className="flex-shrink-0" />
                  <div>
                    <p className="font-black text-base">إنذار سريري حرج: هبوط/ارتفاع مهدد للحياة!</p>
                    <p className="text-sm text-white/90">سيتم إخطار الطبيب فورياً عند الاعتماد</p>
                  </div>
                </div>
              )}

              {/* Test results form */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 justify-end">
                    <FileText size={16} className="text-indigo-600" />
                    إدخال نتائج الفحوصات
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {activeOrder.tests.map(test => {
                    const v = parseFloat(test.value);
                    const hasValue = !isNaN(v);
                    return (
                      <div key={test.id} className={`px-4 py-4 transition-colors ${test.isPanic ? 'bg-red-50' : test.isAbnormal ? 'bg-amber-50' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {test.isPanic && <AlertTriangle size={18} className="text-red-600 animate-pulse" />}
                            {hasValue && !test.isPanic && !test.isAbnormal && <CheckCircle size={16} className="text-green-500" />}
                            <span className="text-xs text-gray-400">
                              الطبيعي: {test.normalLow} - {test.normalHigh} {test.unit}
                            </span>
                            {test.loinc && <span className="text-xs font-mono text-gray-300">LOINC: {test.loinc}</span>}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800 text-sm">{test.name}</p>
                            <p className="text-xs text-gray-400">{test.unit}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            step="0.01"
                            value={test.value}
                            onChange={e => handleTestValueChange(test.id, e.target.value)}
                            placeholder="أدخل النتيجة"
                            className={`flex-1 px-4 py-3 rounded-xl border-2 text-center font-bold text-lg outline-none transition-all ${
                              test.isPanic
                                ? 'border-red-500 bg-red-100 text-red-700 animate-pulse'
                                : test.isAbnormal
                                ? 'border-amber-400 bg-amber-50 text-amber-700'
                                : 'border-gray-200 focus:border-indigo-400'
                            }`}
                          />
                          {test.panicHigh && (
                            <span className="text-xs text-red-500 font-medium whitespace-nowrap">
                              إنذار: &ge; {test.panicHigh}
                            </span>
                          )}
                        </div>
                        {test.isPanic && (
                          <p className="text-xs text-red-600 font-bold mt-2 text-right">
                            قيمة حرجة! يتطلب إخطاراً فورياً للطبيب المعالج
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attached file indicator */}
              {attachedFile && (
                <div className="bg-[#E8F5F4] rounded-xl p-3 flex items-center gap-2 border border-[#199A8E]/20">
                  <FileText size={16} className="text-[#199A8E]" />
                  <span className="text-sm text-[#104C48] font-medium">{attachedFile}</span>
                  <button onClick={() => setAttachedFile(null)} className="mr-auto text-xs text-red-500">إزالة</button>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handleAttachFile}
                  className="py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <Upload size={18} />
                  إرفاق تقرير / PDF
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="py-3.5 rounded-2xl bg-amber-100 text-amber-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-200 transition-colors"
                >
                  <Save size={18} />
                  حفظ كمسودة
                </button>
                <button
                  onClick={handleCommitResults}
                  className="py-3.5 rounded-2xl bg-gradient-to-l from-indigo-600 to-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  <CheckCircle size={18} />
                  اعتماد ورفع فوري
                  <kbd className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">F9</kbd>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
