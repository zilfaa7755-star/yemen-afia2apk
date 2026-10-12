import { useState, useEffect, useRef } from 'react';
import {
  X,
  Pill,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  FlaskConical,
  TrendingUp,
  Plus,
  Stethoscope,
  Syringe,
  FileText,
  AlertTriangle,
  ChevronDown,
  Activity,
  Thermometer,
  HeartPulse,
  Droplet,
  Wind,
  ClipboardList,
  Stethoscope as StethoscopeIcon,
  Calendar,
  User,
  FileSignature,
  ArrowLeftRight,
  Filter,
  X as XIcon,
} from 'lucide-react';
import type { Medication, Problem, Allergy, LabResult, Surgery, Visit, AllergyFormData, PrescribedMed } from '../types';
import { facilities, creatinineTrend, hba1cTrend } from '../data/clinicalData';
import { QRCode } from './QRCode';

export type DrawerType = 'meds' | 'labs' | 'allergies' | 'problems' | 'surgeries' | 'visits' | 'emergency' | null;

interface DrawerProps {
  type: DrawerType;
  onClose: () => void;
  medications: Medication[];
  problems: Problem[];
  allergies: Allergy[];
  labResults: LabResult[];
  surgeries: Surgery[];
  visits: Visit[];
  onAddAllergy?: (data: AllergyFormData) => void;
  readOnly?: boolean;
}

export function Drawer(props: DrawerProps) {
  if (!props.type) return null;
  return <DrawerContent {...props} />;
}

function DrawerContent({ type, onClose, medications, problems, allergies, labResults, surgeries, visits, onAddAllergy, readOnly }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const titles: Record<NonNullable<DrawerType>, { title: string; icon: typeof Pill }> = {
    meds: { title: 'سجل الأدوية الكامل', icon: Pill },
    labs: { title: 'شجرة التحاليل المخبرية (LOINC)', icon: FlaskConical },
    allergies: { title: 'الحساسيات والتنبيهات السريرية', icon: AlertTriangle },
    problems: { title: 'المشاكل والتشخيصات', icon: Stethoscope },
    surgeries: { title: 'سجل العمليات والإجراءات', icon: Syringe },
    visits: { title: 'الزيارات السابقة', icon: FileText },
    emergency: { title: 'بطاقة الطوارئ وسلسلة النجاة', icon: ShieldAlert },
  };

  const config = titles[type!];
  const Icon = config.icon;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full sm:w-[560px] bg-white shadow-2xl z-[101] animate-slide-in-right flex flex-col"
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-200 bg-gradient-to-l from-primary-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{config.title}</h2>
              <p className="text-xs text-slate-400">أمل سعود أمين | 01010049281</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {type === 'meds' && <MedsContent medications={medications} readOnly={readOnly} />}
          {type === 'labs' && <LabsContent labResults={labResults} />}
          {type === 'allergies' && <AllergiesContent allergies={allergies} onAddAllergy={onAddAllergy || (() => {})} />}
          {type === 'problems' && <ProblemsContent problems={problems} />}
          {type === 'surgeries' && <SurgeriesContent surgeries={surgeries} />}
          {type === 'visits' && <VisitsContent visits={visits} />}
          {type === 'emergency' && <EmergencyContent />}
        </div>
      </div>
    </>
  );
}

// --- CDSS Tester (Meds) ---
function MedsContent({ medications, readOnly }: { medications: Medication[]; readOnly?: boolean }) {
  const [testInput, setTestInput] = useState('Voltaren 75mg');
  const [result, setResult] = useState<
    { type: 'safe' | 'danger' | 'anaphylaxis'; message: string; alternative?: string } | null
  >(null);

  const runSafetyCheck = () => {
    const input = testInput.toLowerCase().trim();
    const nsaids = ['voltaren', 'ibuprofen', 'diclofenac', 'brufen', 'advil', 'cataflam'];
    const penicillins = ['augmentin', 'amoxicillin', 'penicillin', 'ampicillin', 'amoxil'];

    if (nsaids.some((n) => input.includes(n))) {
      setResult({
        type: 'danger',
        message:
          'إيقاف سريري إجباري: المريضة تعاني من قصور كلوي م4 (eGFR: 22) - يمنع صرف مضادات الالتهاب تجنباً للفشل الكلوي الحاد',
        alternative: 'Paracetamol 1g كل 6 ساعات (آمن للقصور الكلوي)',
      });
    } else if (penicillins.some((p) => input.includes(p))) {
      setResult({
        type: 'anaphylaxis',
        message:
          'تحذير تأقية حرج: المريضة لديها حساسية مفرطة من البنسلين (صدمة تأقية موثقة 2024) - يمنع المنع كلياً',
        alternative: 'Azithromycin 500mg يومياً (بديل آمن)',
      });
    } else if (input.includes('paracetamol') || input.includes('acetaminophen') || input.includes('panadol')) {
      setResult({
        type: 'safe',
        message: 'دواء آمن - لا توجد تعارضات مع الحالة الصحية للمريضة',
      });
    } else {
      setResult({
        type: 'safe',
        message: 'لا توجد تعارضات مسجلة - يُنصح بمراجعة الجرعة حسب وظائف الكلى',
      });
    }
  };

  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = [...new Set(medications.map((m) => m.category))];
  const filtered = medications.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* CDSS Tester */}
      <div className="rounded-2xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary-800">نظام دعم القرار السريري (CDSS)</h3>
            <p className="text-xs text-primary-600">فحص أمان الدواء قبل الصرف</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSafetyCheck()}
            placeholder="أدخل اسم الدواء..."
            className="flex-1 px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium focus:border-primary-500 focus:outline-none transition-colors"
          />
          <button
            onClick={runSafetyCheck}
            className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm shrink-0"
          >
            فحص الأمان
          </button>
        </div>

        {result && (
          <div
            className={`mt-3 p-4 rounded-xl border-2 animate-scale-in ${
              result.type === 'safe'
                ? 'bg-success-50 border-success-300'
                : result.type === 'danger'
                ? 'bg-danger-50 border-danger-300'
                : 'bg-danger-50 border-danger-500'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.type === 'safe' ? (
                <ShieldCheck className="w-6 h-6 text-success-600 shrink-0" />
              ) : result.type === 'danger' ? (
                <ShieldX className="w-6 h-6 text-danger-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-danger-600 shrink-0" />
              )}
              <div className="flex-1">
                <p
                  className={`text-sm font-bold ${
                    result.type === 'safe' ? 'text-success-700' : 'text-danger-700'
                  }`}
                >
                  {result.type === 'safe'
                    ? '✓ تم التحقق من الأمان'
                    : result.type === 'danger'
                    ? '⛔ إيقاف سريري إجباري'
                    : '⛔ تحذير تأقية حرج'}
                </p>
                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    result.type === 'safe' ? 'text-success-600' : 'text-danger-600'
                  }`}
                >
                  {result.message}
                </p>
                {result.alternative && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-white border border-success-200">
                    <p className="text-xs font-bold text-success-700">البديل الآمن المقترح:</p>
                    <p className="text-xs text-success-600 mt-0.5">{result.alternative}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {['Voltaren 75mg', 'Augmentin 1g', 'Paracetamol 1g', 'Ibuprofen 400mg'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setTestInput(suggestion);
              }}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Meds list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">السجل الكامل</h3>
          <ResultCount count={filtered.length} total={medications.length} label="دواء" />
        </div>
        <FilterBar
          label="الحالة"
          active={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'الكل' },
            { value: 'active', label: 'نشط' },
            { value: 'stopped', label: 'متوقف' },
          ]}
        />
        <FilterBar
          label="الفئة"
          active={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: 'all', label: 'الكل' },
            ...categories.map((c) => ({ value: c, label: c })),
          ]}
        />
        {filtered.length === 0 && <EmptyState />}
        {filtered.map((med) => (
          <div
            key={med.id}
            className={`p-3 rounded-xl border transition-all ${
              med.status === 'active'
                ? 'border-slate-200 bg-white hover:shadow-sm'
                : 'border-slate-100 bg-slate-50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary-500 shrink-0" />
                  <p className="text-sm font-bold text-slate-800">{med.name}</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      med.status === 'active'
                        ? 'bg-success-100 text-success-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {med.status === 'active' ? 'نشط' : 'متوقف'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 mt-2 text-xs">
                  <p className="text-slate-500">الجرعة: <span className="font-semibold text-slate-700">{med.dosage}</span></p>
                  <p className="text-slate-500">التكرار: <span className="font-semibold text-slate-700">{med.frequency}</span></p>
                  <p className="text-slate-500">الطريق: <span className="font-semibold text-slate-700">{med.route}</span></p>
                  <p className="text-slate-500">الفئة: <span className="font-semibold text-slate-700">{med.category}</span></p>
                  <p className="text-slate-500">البداية: <span className="font-semibold text-slate-700">{med.startDate}</span></p>
                  <p className="text-slate-500">الواصف: <span className="font-semibold text-slate-700">{med.prescriber}</span></p>
                </div>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-1 rounded-md text-white shrink-0"
                style={{ backgroundColor: facilities.find((f) => f.id === med.facility)?.color }}
              >
                {facilities.find((f) => f.id === med.facility)?.shortName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
        <XIcon className="w-6 h-6 text-slate-300" />
      </div>
      <p className="text-sm text-slate-400 font-medium">لا توجد نتائج مطابقة للفلتر</p>
    </div>
  );
}

// --- Labs Content ---
function LabsContent({ labResults }: { labResults: LabResult[] }) {
  const [showTrend, setShowTrend] = useState<'creatinine' | 'hba1c'>('creatinine');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [flagFilter, setFlagFilter] = useState('all');

  const categories = [...new Set(labResults.map((l) => l.category))];
  const filtered = labResults.filter((l) => {
    if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
    if (flagFilter !== 'all') {
      if (flagFilter === 'abnormal' && l.flag === 'normal') return false;
      if (flagFilter === 'critical' && l.flag !== 'critical') return false;
      if (flagFilter === 'normal' && l.flag !== 'normal') return false;
    }
    return true;
  });
  const trendData = showTrend === 'creatinine' ? creatinineTrend : hba1cTrend;
  const maxVal = Math.max(...trendData.map((d) => d.value));
  const minVal = Math.min(...trendData.map((d) => d.value));

  return (
    <div className="space-y-4">
      {/* Trend Graph */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-primary-600" />
            <h3 className="text-sm font-bold text-slate-800">منحنى الاتجاه الزمني</h3>
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-slate-100">
            <button
              onClick={() => setShowTrend('creatinine')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                showTrend === 'creatinine' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              الكرياتينين
            </button>
            <button
              onClick={() => setShowTrend('hba1c')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                showTrend === 'hba1c' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              HbA1c
            </button>
          </div>
        </div>

        <TrendGraph data={trendData} maxVal={maxVal} minVal={minVal} label={showTrend === 'creatinine' ? 'mg/dL' : '%'} />
      </div>

      {/* LOINC Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">جدول LOINC التفصيلي</h3>
          <ResultCount count={filtered.length} total={labResults.length} label="تحليل" />
        </div>
        <FilterBar
          label="الفئة"
          active={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: 'all', label: 'الكل' },
            ...categories.map((c) => ({ value: c, label: c })),
          ]}
        />
        <FilterBar
          label="الحالة"
          active={flagFilter}
          onChange={setFlagFilter}
          options={[
            { value: 'all', label: 'الكل' },
            { value: 'critical', label: 'حرج' },
            { value: 'abnormal', label: 'غير طبيعي' },
            { value: 'normal', label: 'طبيعي' },
          ]}
        />
        {filtered.length === 0 && <EmptyState />}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500">
                <th className="text-right py-2 px-2 font-semibold">التحليل</th>
                <th className="text-right py-2 px-2 font-semibold">LOINC</th>
                <th className="text-center py-2 px-2 font-semibold">القيمة</th>
                <th className="text-right py-2 px-2 font-semibold">المرجع</th>
                <th className="text-center py-2 px-2 font-semibold">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lab) => (
                <tr key={lab.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-2 font-semibold text-slate-700">{lab.name}</td>
                  <td className="py-2 px-2 font-mono text-slate-400">{lab.loinc}</td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`font-bold ${
                        lab.flag === 'critical'
                          ? 'text-danger-600'
                          : lab.flag === 'high'
                          ? 'text-amber-600'
                          : lab.flag === 'low'
                          ? 'text-amber-600'
                          : 'text-success-600'
                      }`}
                    >
                      {lab.value} {lab.unit}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-400">{lab.refRange}</td>
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        lab.flag === 'critical'
                          ? 'bg-danger-100 text-danger-700'
                          : lab.flag === 'high' || lab.flag === 'low'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-success-100 text-success-700'
                      }`}
                    >
                      {lab.flag === 'critical' ? 'حرج' : lab.flag === 'high' ? 'مرتفع' : lab.flag === 'low' ? 'منخفض' : 'طبيعي'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TrendGraph({ data, maxVal, minVal, label }: { data: { year: string; value: number }[]; maxVal: number; minVal: number; label: string }) {
  const width = 480;
  const height = 160;
  const padding = 35;
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: height - padding - ((d.value - minVal) / range) * (height - padding * 2),
    value: d.value,
    year: d.year,
  }));

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((r) => (
        <line
          key={r}
          x1={padding}
          x2={width - padding}
          y1={padding + r * (height - padding * 2)}
          y2={padding + r * (height - padding * 2)}
          stroke="#E2E8F0"
          strokeDasharray="3,3"
        />
      ))}
      <path d={areaPath} fill="url(#trendGrad)" />
      <path d={path} fill="none" stroke="#0284C7" strokeWidth="2.5" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#0284C7" stroke="white" strokeWidth="2" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px] fill-primary-700 font-bold">
            {p.value}
          </text>
          <text x={p.x} y={height - 12} textAnchor="middle" className="text-[9px] fill-slate-500 font-semibold">
            {p.year}
          </text>
        </g>
      ))}
      <text x={5} y={padding + 4} className="text-[9px] fill-slate-400 font-semibold">
        {maxVal} {label}
      </text>
      <text x={5} y={height - padding + 4} className="text-[9px] fill-slate-400 font-semibold">
        {minVal} {label}
      </text>
    </svg>
  );
}

// --- Allergies Content ---
function AllergiesContent({ allergies, onAddAllergy }: { allergies: Allergy[]; onAddAllergy: (d: AllergyFormData) => void }) {
  const [substance, setSubstance] = useState('');
  const [severity, setSeverity] = useState<AllergyFormData['severity']>('moderate');
  const [reaction, setReaction] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = [...new Set(allergies.map((a) => a.category))];
  const filtered = allergies.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
    return true;
  });

  const handleSubmit = () => {
    if (!substance.trim()) return;
    onAddAllergy({ substance, severity, reaction: reaction || 'تفاعل جلدي' });
    setSubstance('');
    setReaction('');
    setSeverity('moderate');
    setShowForm(false);
  };

  const severityConfig = {
    anaphylaxis: { label: 'تأقية', color: 'bg-danger-500 text-white', border: 'border-danger-500' },
    severe: { label: 'شديدة', color: 'bg-danger-100 text-danger-700', border: 'border-danger-300' },
    moderate: { label: 'متوسطة', color: 'bg-amber-100 text-amber-700', border: 'border-amber-300' },
    mild: { label: 'خفيفة', color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-300' },
  };

  return (
    <div className="space-y-4">
      {/* Add allergy form */}
      <div className="rounded-2xl border-2 border-primary-200 bg-primary-50/50 p-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center gap-2 text-sm font-bold text-primary-700"
        >
          <Plus className="w-4 h-4" />
          توثيق حساسية سريرية جديدة
        </button>

        {showForm && (
          <div className="mt-3 space-y-3 animate-scale-in">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">المادة المسببة</label>
              <input
                type="text"
                value={substance}
                onChange={(e) => setSubstance(e.target.value)}
                placeholder="مثال: الأسبرين، المكسرات..."
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">درجة الخطورة</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AllergyFormData['severity'])}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="mild">خفيفة</option>
                <option value="moderate">متوسطة</option>
                <option value="severe">شديدة</option>
                <option value="anaphylaxis">تأقية (مهدد للحياة)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">التفاعل الموثق</label>
              <input
                type="text"
                value={reaction}
                onChange={(e) => setReaction(e.target.value)}
                placeholder="مثال: طفح جلدي، تورم..."
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors"
            >
              حفظ وتوثيق الحساسية
            </button>
          </div>
        )}
      </div>

      {/* Allergy list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">قائمة الحساسيات</h3>
          <ResultCount count={filtered.length} total={allergies.length} label="حساسية" />
        </div>
        <FilterBar
          label="الخطورة"
          active={severityFilter}
          onChange={setSeverityFilter}
          options={[
            { value: 'all', label: 'الكل' },
            { value: 'anaphylaxis', label: 'تأقية' },
            { value: 'severe', label: 'شديدة' },
            { value: 'moderate', label: 'متوسطة' },
            { value: 'mild', label: 'خفيفة' },
          ]}
        />
        <FilterBar
          label="الفئة"
          active={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: 'all', label: 'الكل' },
            ...categories.map((c) => ({ value: c, label: c })),
          ]}
        />
        {filtered.length === 0 && <EmptyState />}
        {filtered.map((allergy) => {
          const cfg = severityConfig[allergy.severity];
          return (
            <div key={allergy.id} className={`p-3 rounded-xl border-2 ${cfg.border} bg-white`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 flex-1">
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 ${
                      allergy.severity === 'anaphylaxis'
                        ? 'text-danger-600 fill-danger-100'
                        : allergy.severity === 'severe'
                        ? 'text-danger-500'
                        : 'text-amber-500'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{allergy.substance}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{allergy.reaction}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {allergy.category} | موثق: {allergy.documentedDate} | {facilities.find((f) => f.id === allergy.facility)?.name}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${cfg.color} shrink-0`}>
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Problems Content ---
function ProblemsContent({ problems }: { problems: Problem[] }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filtered = problems.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (severityFilter !== 'all' && p.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">قائمة التشخيصات</h3>
        <ResultCount count={filtered.length} total={problems.length} label="تشخيص" />
      </div>
      <FilterBar
        label="الحالة"
        active={statusFilter}
        onChange={setStatusFilter}
        options={[
          { value: 'all', label: 'الكل' },
          { value: 'active', label: 'نشط' },
          { value: 'chronic', label: 'مزمن' },
          { value: 'resolved', label: 'متحسن' },
        ]}
      />
      <FilterBar
        label="الخطورة"
        active={severityFilter}
        onChange={setSeverityFilter}
        options={[
          { value: 'all', label: 'الكل' },
          { value: 'شديد', label: 'شديد' },
          { value: 'متوسط', label: 'متوسط' },
          { value: 'خفيف', label: 'خفيف' },
        ]}
      />
      {filtered.length === 0 && <EmptyState />}
      {filtered.map((prob) => (
        <div key={prob.id} className="p-3 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    prob.status === 'active'
                      ? 'bg-danger-500'
                      : prob.status === 'chronic'
                      ? 'bg-amber-500'
                      : 'bg-slate-300'
                  }`}
                />
                <p className="text-sm font-bold text-slate-800">{prob.name}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 mt-2 text-xs pr-0 sm:pr-5">
                <p className="text-slate-500">ICD-11: <span className="font-mono font-semibold text-slate-700">{prob.icd11}</span></p>
                <p className="text-slate-500">الخطورة: <span className="font-semibold text-slate-700">{prob.severity}</span></p>
                <p className="text-slate-500">التشخيص: <span className="font-semibold text-slate-700">{prob.diagnosedDate}</span></p>
                <p className="text-slate-500">المنشأة: <span className="font-semibold text-slate-700">{facilities.find((f) => f.id === prob.facility)?.shortName}</span></p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                prob.status === 'active'
                  ? 'bg-danger-100 text-danger-700'
                  : prob.status === 'chronic'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-success-100 text-success-700'
              }`}
            >
              {prob.status === 'active' ? 'نشط' : prob.status === 'chronic' ? 'مزمن' : 'متحسن'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Surgeries Content ---
function SurgeriesContent({ surgeries }: { surgeries: Surgery[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');

  const years = [...new Set(surgeries.map((s) => s.date.split('-')[0]))].sort();
  const filtered = surgeries.filter((s) => {
    if (yearFilter !== 'all' && s.date.split('-')[0] !== yearFilter) return false;
    if (facilityFilter !== 'all' && s.facility !== facilityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">سجل العمليات</h3>
        <ResultCount count={filtered.length} total={surgeries.length} label="عملية" />
      </div>
      <FilterBar
        label="السنة"
        active={yearFilter}
        onChange={setYearFilter}
        options={[
          { value: 'all', label: 'الكل' },
          ...years.map((y) => ({ value: y, label: y })),
        ]}
      />
      <FilterBar
        label="المنشأة"
        active={facilityFilter}
        onChange={setFacilityFilter}
        options={[
          { value: 'all', label: 'الكل' },
          ...facilities.map((f) => ({ value: f.id, label: f.shortName })),
        ]}
      />
      {filtered.length === 0 && <EmptyState />}
      {filtered.map((surg) => {
        const isOpen = expanded === surg.id;
        return (
          <div
            key={surg.id}
            className={`rounded-xl border transition-all overflow-hidden ${
              isOpen ? 'border-primary-300 shadow-md' : 'border-slate-200 bg-white hover:shadow-sm'
            }`}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : surg.id)}
              className="w-full p-3 flex items-start gap-3 text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Syringe className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{surg.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {surg.date}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md text-white"
                    style={{ backgroundColor: facilities.find((f) => f.id === surg.facility)?.color }}
                  >
                    {facilities.find((f) => f.id === surg.facility)?.shortName}
                  </span>
                  <span className="text-[10px] font-semibold text-success-700 bg-success-50 px-1.5 py-0.5 rounded-md">
                    {surg.outcome}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3 animate-fade-in">
                {/* Pre-op & Post-op */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <InfoBlock label="التشخيص قبل العملية" value={surg.preOpDiagnosis} icon={ClipboardList} color="amber" />
                  <InfoBlock label="التشخيص بعد العملية" value={surg.postOpDiagnosis} icon={ClipboardList} color="primary" />
                </div>

                {/* Anesthesia & Procedure */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <SectionLabel icon={Activity}>تفاصيل العملية</SectionLabel>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 text-xs">
                    <p className="text-slate-500">التخدير: <span className="font-semibold text-slate-700">{surg.anesthesia}</span></p>
                    <p className="text-slate-500">الجراح: <span className="font-semibold text-slate-700">{surg.surgeon}</span></p>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{surg.procedureDetails}</p>
                </div>

                {/* Complications */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <SectionLabel icon={AlertTriangle} color="amber">المضاعفات</SectionLabel>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{surg.complications}</p>
                </div>

                {/* Discharge Summary */}
                <div className="p-3 rounded-xl bg-primary-50 border border-primary-200">
                  <SectionLabel icon={FileSignature} color="primary">ملخص الخروج</SectionLabel>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{surg.dischargeSummary}</p>
                </div>

                {/* Discharge Meds */}
                {surg.dischargeMeds.length > 0 && (
                  <div className="p-3 rounded-xl bg-success-50 border border-success-200">
                    <SectionLabel icon={Pill} color="success">الأدوية وقت الخروج ({surg.dischargeMeds.length})</SectionLabel>
                    <div className="mt-2 space-y-1.5">
                      {surg.dischargeMeds.map((med, i) => (
                        <MedRow key={i} med={med} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <SectionLabel icon={Calendar} color="slate">المتابعة</SectionLabel>
                  <p className="text-xs text-slate-600 mt-1.5">{surg.followUp}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Visits Content ---
function VisitsContent({ visits }: { visits: Visit[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');

  const typeConfig = {
    outpatient: { label: 'عيادي', color: 'bg-primary-100 text-primary-700' },
    inpatient: { label: 'تنويم', color: 'bg-amber-100 text-amber-700' },
    emergency: { label: 'طوارئ', color: 'bg-danger-100 text-danger-700' },
    icu: { label: 'عناية مركزة', color: 'bg-danger-500 text-white' },
  };

  const years = [...new Set(visits.map((v) => v.date.split('-')[0]))].sort();
  const filtered = visits.filter((v) => {
    if (typeFilter !== 'all' && v.type !== typeFilter) return false;
    if (yearFilter !== 'all' && v.date.split('-')[0] !== yearFilter) return false;
    if (facilityFilter !== 'all' && v.facility !== facilityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">سجل الزيارات</h3>
        <ResultCount count={filtered.length} total={visits.length} label="زيارة" />
      </div>
      <FilterBar
        label="النوع"
        active={typeFilter}
        onChange={setTypeFilter}
        options={[
          { value: 'all', label: 'الكل' },
          { value: 'outpatient', label: 'عيادي' },
          { value: 'inpatient', label: 'تنويم' },
          { value: 'emergency', label: 'طوارئ' },
          { value: 'icu', label: 'عناية مركزة' },
        ]}
      />
      <FilterBar
        label="السنة"
        active={yearFilter}
        onChange={setYearFilter}
        options={[
          { value: 'all', label: 'الكل' },
          ...years.map((y) => ({ value: y, label: y })),
        ]}
      />
      <FilterBar
        label="المنشأة"
        active={facilityFilter}
        onChange={setFacilityFilter}
        options={[
          { value: 'all', label: 'الكل' },
          ...facilities.map((f) => ({ value: f.id, label: f.shortName })),
        ]}
      />
      {filtered.length === 0 && <EmptyState />}
      {filtered.map((visit) => {
        const cfg = typeConfig[visit.type];
        const isOpen = expanded === visit.id;
        const isInpatient = visit.type === 'inpatient' || visit.type === 'icu' || visit.type === 'emergency';
        return (
          <div
            key={visit.id}
            className={`rounded-xl border transition-all overflow-hidden ${
              isOpen ? 'border-primary-300 shadow-md' : 'border-slate-200 bg-white hover:shadow-sm'
            }`}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : visit.id)}
              className="w-full p-3 flex items-start justify-between gap-2 text-right"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-xs font-bold text-slate-600">
                  {visit.date.split('-')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{visit.department}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{visit.reason} → {visit.diagnosis}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {visit.date}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: facilities.find((f) => f.id === visit.facility)?.color }}
                    >
                      {facilities.find((f) => f.id === visit.facility)?.shortName}
                    </span>
                    {isInpatient && visit.duration && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                        مدة التنويم: {visit.duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${cfg.color}`}>{cfg.label}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3 animate-fade-in">
                {/* Complaint */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <SectionLabel icon={ClipboardList} color="slate">الشكوى والأعراض</SectionLabel>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{visit.complaint}</p>
                </div>

                {/* Vital Signs */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <SectionLabel icon={Activity} color="primary">العلامات الحيوية</SectionLabel>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                    <VitalCard icon={HeartPulse} label="ضغط" value={visit.vitalSigns.bp} color="text-danger-600" />
                    <VitalCard icon={Activity} label="نبض" value={visit.vitalSigns.hr} color="text-primary-600" />
                    <VitalCard icon={Thermometer} label="حرارة" value={visit.vitalSigns.temp} color="text-amber-600" />
                    <VitalCard icon={Wind} label="تنفس" value={visit.vitalSigns.rr} color="text-slate-600" />
                    <VitalCard icon={Droplet} label="أكسجة" value={visit.vitalSigns.spo2} color="text-success-600" />
                  </div>
                </div>

                {/* Examination */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <SectionLabel icon={StethoscopeIcon} color="slate">الفحص السريري</SectionLabel>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{visit.examination}</p>
                </div>

                {/* Investigation */}
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <SectionLabel icon={FlaskConical} color="indigo">الفحوصات والتحاليل</SectionLabel>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{visit.investigation}</p>
                </div>

                {/* Prescribed Meds */}
                {visit.prescribedMeds.length > 0 && (
                  <div className="p-3 rounded-xl bg-primary-50 border border-primary-200">
                    <SectionLabel icon={Pill} color="primary">الأدوية المصروفة وقت الزيارة ({visit.prescribedMeds.length})</SectionLabel>
                    <div className="mt-2 space-y-1.5">
                      {visit.prescribedMeds.map((med, i) => (
                        <MedRow key={i} med={med} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Plan */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <SectionLabel icon={ClipboardList} color="amber">الخطة العلاجية</SectionLabel>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{visit.plan}</p>
                </div>

                {/* Inpatient discharge info */}
                {isInpatient && visit.dischargeSummary && (
                  <>
                    <div className="p-3 rounded-xl bg-success-50 border border-success-200">
                      <SectionLabel icon={FileSignature} color="success">ملخص الخروج</SectionLabel>
                      <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{visit.dischargeSummary}</p>
                      {visit.admissionDate && visit.dischargeDate && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span>الدخول: <span className="font-semibold text-slate-700">{visit.admissionDate}</span></span>
                          <span className="text-slate-300">←</span>
                          <span>الخروج: <span className="font-semibold text-slate-700">{visit.dischargeDate}</span></span>
                        </div>
                      )}
                    </div>

                    {visit.dischargeMeds && visit.dischargeMeds.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <SectionLabel icon={Pill} color="success">الأدوية وقت الخروج ({visit.dischargeMeds.length})</SectionLabel>
                        <div className="mt-2 space-y-1.5">
                          {visit.dischargeMeds.map((med, i) => (
                            <MedRow key={i} med={med} highlight />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Attending physician */}
                <div className="flex items-center gap-2 px-1 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5" />
                  الطبيب المعالج: <span className="font-semibold text-slate-700">{visit.attendingPhysician}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Shared filter components ---
function FilterBar({
  label,
  options,
  active,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  active: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
        <Filter className="w-3 h-3" />
        {label}:
      </div>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value === active && active !== 'all' ? 'all' : opt.value)}
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
            active === opt.value
              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
              : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300 hover:text-primary-600'
          }`
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ResultCount({ count, total, label }: { count: number; total: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <span className="font-bold text-slate-600">{count}</span>
      <span>/</span>
      <span>{total}</span>
      <span>{label}</span>
    </div>
  );
}

// --- Shared helper components ---
function SectionLabel({ icon: Icon, children, color = 'slate' }: { icon: typeof Activity; children: React.ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    slate: 'text-slate-600',
    primary: 'text-primary-700',
    amber: 'text-amber-700',
    success: 'text-success-700',
    danger: 'text-danger-700',
    indigo: 'text-indigo-700',
  };
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`w-3.5 h-3.5 ${colorMap[color] || colorMap.slate}`} />
      <span className={`text-xs font-bold ${colorMap[color] || colorMap.slate}`}>{children}</span>
    </div>
  );
}

function InfoBlock({ label, value, icon: Icon, color = 'slate' }: { label: string; value: string; icon: typeof Activity; color?: string }) {
  const colorMap: Record<string, string> = {
    slate: 'bg-slate-50 border-slate-100',
    primary: 'bg-primary-50 border-primary-100',
    amber: 'bg-amber-50 border-amber-100',
  };
  return (
    <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.slate}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs text-slate-700 leading-relaxed">{value}</p>
    </div>
  );
}

function VitalCard({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg bg-white border border-slate-100">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className="text-[9px] text-slate-400 font-medium">{label}</span>
      <span className={`text-xs font-bold ${color}`}>{value}</span>
    </div>
  );
}

function MedRow({ med, highlight }: { med: PrescribedMed; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${highlight ? 'bg-white border border-success-200' : 'bg-white border border-slate-100'}`}>
      <Pill className={`w-3.5 h-3.5 shrink-0 ${highlight ? 'text-success-600' : 'text-primary-500'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">{med.name}</p>
        <p className="text-[10px] text-slate-400">{med.dosage} | {med.frequency} | {med.route}</p>
      </div>
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${highlight ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-500'}`}>
        {med.duration}
      </span>
    </div>
  );
}

// --- Emergency Content ---
function EmergencyContent() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-danger-300 bg-gradient-to-br from-danger-50 to-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="w-8 h-8 text-danger-600" />
          <div>
            <h3 className="text-base font-extrabold text-danger-700">بطاقة الطوارئ الرقمية (ICE)</h3>
            <p className="text-xs text-danger-600">سلسلة النجاة - معلومات حرجة للطوارئ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border-2 border-slate-200">
            <QRCode size={140} value="YEMEN-AFIA-ICE:01010049281:O+:PENICILLIN-ANAPHYLAXIS:CKD4-EGFR22:771234567" />
            <p className="text-[10px] text-slate-400 mt-2 font-mono">01010049281</p>
          </div>

          {/* Patient details */}
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <p className="text-[10px] text-slate-400 font-semibold">الاسم</p>
              <p className="text-sm font-bold text-slate-800">أمل سعود أمين</p>
            </div>
            <div className="p-2.5 rounded-lg bg-danger-50 border border-danger-200">
              <p className="text-[10px] text-danger-600 font-semibold">فصيلة الدم</p>
              <p className="text-lg font-extrabold text-danger-700">O+</p>
            </div>
            <div className="p-2.5 rounded-lg bg-red-950 border border-danger-500">
              <p className="text-[10px] text-red-300 font-semibold">وظائف الكلى</p>
              <p className="text-sm font-bold text-danger-300">eGFR: 22 mL/min</p>
              <p className="text-[10px] text-red-400">قصور كلوي م4</p>
            </div>
          </div>
        </div>

        {/* Critical alerts */}
        <div className="mt-4 space-y-2">
          <div className="p-3 rounded-xl bg-danger-600 text-white">
            <p className="text-sm font-bold flex items-center gap-2">
              ⛔ حساسية مفرطة: البنسلين (صدمة تأقية 2024)
            </p>
          </div>
          <div className="p-3 rounded-xl bg-danger-100 border border-danger-300">
            <p className="text-xs font-bold text-danger-700 flex items-center gap-2">
              ⚠️ ممنوع: مضادات الالتهاب (NSAIDs) - قصور كلوي م4
            </p>
          </div>
        </div>

        {/* Next of kin */}
        <div className="mt-4 p-3 rounded-xl bg-primary-50 border border-primary-200">
          <p className="text-xs font-semibold text-primary-700">أقرب الأقارب (للتواصل الطارئ)</p>
          <a
            href="tel:771234567"
            className="flex items-center gap-2 mt-1.5 text-lg font-bold text-primary-700 hover:underline"
          >
            <span className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm">📞</span>
            771234567
          </a>
          <p className="text-[10px] text-primary-600 mt-1">سعود أمين (الزوج)</p>
        </div>
      </div>
    </div>
  );
}
