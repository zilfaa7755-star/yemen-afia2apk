import React, { useState } from 'react';
import {
  FileText,
  FlaskConical,
  Radiation,
  Download,
  Share2,
  ShieldCheck,
  Calendar,
  User,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Lock,
  Heart,
  Droplets,
  Building2,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PatientRecord } from '../clinical_view/PatientRecord';

interface HealthRecordPageProps {
  onBack?: () => void;
}

type RecordCategory = 'prescriptions' | 'labs' | 'radiology' | 'vitals';

export function HealthRecordPage({ onBack }: HealthRecordPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<RecordCategory>('prescriptions');
  const [showAdvancedEHR, setShowAdvancedEHR] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Mock Prescriptions
  const prescriptions = [
    {
      id: 'RX-9921',
      title: 'وصفة علاج ضغط الدم والكوليسترول',
      doctor: 'د. سامي المقطري (باطنية)',
      clinic: 'مستشفى الثورة التعليمي',
      date: '10 أكتوبر 2026',
      items: [
        { name: 'Amlodipine 5mg', dosage: 'قرص واحد يومياً صباحاً', duration: '30 يوماً' },
        { name: 'Atorvastatin 20mg', dosage: 'قرص واحد يومياً قبل النوم', duration: '30 يوماً' },
      ],
      dispensed: true,
      pharmacy: 'صيدلية السعيد الحديثة',
    },
    {
      id: 'RX-8840',
      title: 'وصفة علاج التهاب الجهاز التنفسي',
      doctor: 'د. محمد العولقي (باطنية)',
      clinic: 'المستشفى الكويتي التخصصي',
      date: '15 سبتمبر 2026',
      items: [
        { name: 'Amoxicillin/Clavulanate 1g', dosage: 'قرص مرتين يومياً بعد الأكل', duration: '7 أيام' },
        { name: 'Paracetamol 500mg', dosage: 'عند اللزوم كل 8 ساعات', duration: '5 أيام' },
      ],
      dispensed: true,
      pharmacy: 'صيدلية النور 24 ساعة',
    },
  ];

  // Mock Lab Reports
  const labReports = [
    {
      id: 'LAB-4412',
      title: 'فحص صورة الدم الكاملة (CBC)',
      facility: 'مختبرات الدقة الطبية — صنعاء',
      doctor: 'د. سامي المقطري',
      date: '08 أكتوبر 2026',
      status: 'معتمد رسمياً',
      results: [
        { test: 'Hemoglobin (Hb)', value: '14.2 g/dL', normal: '13.0 - 17.5', status: 'normal' },
        { test: 'WBC (White Blood Cells)', value: '6,800 /mcL', normal: '4,500 - 11,000', status: 'normal' },
        { test: 'Platelets', value: '260,000 /mcL', normal: '150,000 - 450,000', status: 'normal' },
      ],
    },
    {
      id: 'LAB-3920',
      title: 'فحص وظائف الكبد والكلى التراكمي',
      facility: 'مختبر الأمل التشخيصي',
      doctor: 'د. أحمد الصبري',
      date: '20 سبتمبر 2026',
      status: 'معتمد رسمياً',
      results: [
        { test: 'Creatinine', value: '0.9 mg/dL', normal: '0.7 - 1.3', status: 'normal' },
        { test: 'Blood Urea', value: '28 mg/dL', normal: '15 - 45', status: 'normal' },
        { test: 'SGPT / ALT', value: '24 U/L', normal: '7 - 56', status: 'normal' },
      ],
    },
  ];

  // Mock Radiology
  const radiologyReports = [
    {
      id: 'RAD-1092',
      title: 'أشعة رنين مغناطيسي للفقرات العنقية (MRI)',
      facility: 'مركز الأشعة التشخيصية — شارع تونس',
      doctor: 'د. محمد العولقي (جراحة عظام)',
      date: '02 أكتوبر 2026',
      findings: 'لا توجد انزلاقات غضروفية ضاغطة، محاذاة الفقرات طبيعية بدون تآكل عظمي.',
      hasDICOM: true,
    },
    {
      id: 'RAD-0831',
      title: 'أشعة سينية رقمية للصدر (Chest X-Ray)',
      facility: 'مستشفى الثورة التعليمي',
      doctor: 'د. سامي المقطري',
      date: '12 أغسطس 2026',
      findings: 'حقول الرئتين واضحة، حجم وشكل القلب ضمن المعدلات السليمة.',
      hasDICOM: true,
    },
  ];

  if (showAdvancedEHR) {
    return (
      <div className="min-h-screen bg-[#F8FAFB]" dir="rtl">
        <header className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] px-4 h-14 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setShowAdvancedEHR(false)}
            className="flex items-center gap-2 text-[#199A8E] hover:text-[#104C48] font-bold text-xs"
          >
            <ChevronRight className="w-5 h-5" />
            العودة لسجلاتي المبسطة
          </button>
          <span className="text-xs font-bold text-[#104C48]">منظومة السجل السريري المتقدم (DICOM & Timeline)</span>
        </header>
        <PatientRecord readOnly />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-32">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 inset-x-4 z-50 max-w-sm mx-auto bg-[#104C48] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between text-xs animate-slide-down">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-[#E8F5F4] text-[#199A8E] flex items-center justify-center transition active:scale-95"
            >
              <ChevronRight size={22} />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <h1 className="text-base font-bold text-[#104C48]">السجلات الطبية والتحاليل</h1>
          <button
            onClick={() => setShowAdvancedEHR(true)}
            className="text-[11px] font-bold text-[#199A8E] bg-[#E8F5F4] px-2.5 py-1.5 rounded-lg hover:bg-[#d8efed] transition"
            title="عرض السجل السريري التفاعلي"
          >
            عرض سريري
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Security & Health Vault Indicator Badge */}
        <section className="bg-gradient-to-r from-[#E8F5F4] to-white rounded-2xl p-3.5 border border-[#199A8E]/25 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#199A8E] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Lock size={18} />
          </div>
          <div className="text-right flex-1">
            <h4 className="text-xs font-bold text-[#104C48] flex items-center gap-1.5">
              <span>خزينة البيانات الصحية الوطنية الآمنة</span>
              <ShieldCheck size={14} className="text-[#199A8E]" />
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              جميع السجلات والتحاليل مشفرة طرفياً ومحفوظة بمركز البيانات الطبي اليمني.
            </p>
          </div>
        </section>

        {/* Category Tabs */}
        <div className="bg-[#E8F5F4]/70 p-1 rounded-2xl flex items-center border border-[#199A8E]/15">
          {[
            { id: 'prescriptions', label: 'الوصفات الطبية', count: prescriptions.length },
            { id: 'labs', label: 'التحاليل المخبرية', count: labReports.length },
            { id: 'radiology', label: 'تقارير الأشعة', count: radiologyReports.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-[#199A8E] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#104C48]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* ── 1. PRESCRIPTIONS TAB ── */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-3">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="bg-white rounded-[22px] p-4 border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(25,154,142,0.06)] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#E8F5F4] text-[#199A8E] flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="text-right">
                      <h4 className="text-sm font-bold text-[#104C48]">{rx.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{rx.doctor} · {rx.clinic}</p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-slate-400">{rx.id}</span>
                </div>

                {/* Medications List */}
                <div className="bg-[#F8FAFB] rounded-xl p-3 border border-[#E2E8F0] space-y-2 text-xs">
                  {rx.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                      <div>
                        <span className="font-bold text-slate-800">{it.name}</span>
                        <span className="text-[10px] text-slate-400 block">{it.dosage}</span>
                      </div>
                      <span className="text-[11px] text-[#199A8E] font-medium">{it.duration}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Actions: Download, Share, Date */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">{rx.date}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast('جاري إنشاء رابط مشاركة آمن للوصفة...')}
                      className="p-2 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-[#199A8E] hover:border-[#199A8E] transition active:scale-95 flex items-center gap-1"
                      title="مشاركة الوصفة"
                    >
                      <Share2 size={14} />
                      <span className="text-[11px]">مشاركة</span>
                    </button>

                    <button
                      onClick={() => showToast('جاري تحميل ملف الوصفة بصيغة PDF...')}
                      className="py-2 px-3 rounded-xl bg-[#E8F5F4] text-[#199A8E] hover:bg-[#199A8E] hover:text-white font-bold text-xs transition active:scale-95 flex items-center gap-1.5"
                      title="تحميل PDF"
                    >
                      <Download size={14} />
                      <span>تحميل</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 2. LAB REPORTS TAB ── */}
        {activeTab === 'labs' && (
          <div className="space-y-3">
            {labReports.map((lab) => (
              <div
                key={lab.id}
                className="bg-white rounded-[22px] p-4 border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(25,154,142,0.06)] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <FlaskConical size={20} />
                    </div>
                    <div className="text-right">
                      <h4 className="text-sm font-bold text-[#104C48]">{lab.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{lab.facility}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    {lab.status}
                  </span>
                </div>

                {/* Lab Measurements Matrix */}
                <div className="bg-[#F8FAFB] rounded-xl p-3 border border-[#E2E8F0] space-y-2 text-xs">
                  {lab.results.map((res, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                      <div>
                        <span className="font-bold text-slate-800">{res.test}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">طبيعي: {res.normal}</span>
                      </div>
                      <span className="font-mono font-bold text-[#104C48]">{res.value}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">{lab.date}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast('جاري مشاركة نتائج التحليل...')}
                      className="p-2 rounded-xl border border-[#E2E8F0] text-slate-600 hover:text-[#199A8E] hover:border-[#199A8E] transition active:scale-95 flex items-center gap-1"
                    >
                      <Share2 size={14} />
                      <span className="text-[11px]">مشاركة</span>
                    </button>

                    <button
                      onClick={() => showToast('جاري تحميل التقرير المخبري المعتمد...')}
                      className="py-2 px-3 rounded-xl bg-[#E8F5F4] text-[#199A8E] hover:bg-[#199A8E] hover:text-white font-bold text-xs transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Download size={14} />
                      <span>تحميل التقرير</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 3. RADIOLOGY REPORTS TAB ── */}
        {activeTab === 'radiology' && (
          <div className="space-y-3">
            {radiologyReports.map((rad) => (
              <div
                key={rad.id}
                className="bg-white rounded-[22px] p-4 border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(25,154,142,0.06)] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#199A8E] flex items-center justify-center shrink-0">
                      <Radiation size={20} />
                    </div>
                    <div className="text-right">
                      <h4 className="text-sm font-bold text-[#104C48]">{rad.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{rad.facility}</p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-slate-400">{rad.id}</span>
                </div>

                <div className="bg-[#F8FAFB] rounded-xl p-3 border border-[#E2E8F0] text-xs space-y-1">
                  <span className="font-bold text-slate-700 block">تقرير وخلاصة الأشعة:</span>
                  <p className="text-slate-600 leading-relaxed">{rad.findings}</p>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">{rad.date}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAdvancedEHR(true)}
                      className="py-2 px-3 rounded-xl bg-[#E8F5F4] text-[#104C48] font-bold text-xs flex items-center gap-1.5 hover:bg-[#199A8E] hover:text-white transition"
                    >
                      <Eye size={14} />
                      <span>معاينة DICOM</span>
                    </button>

                    <button
                      onClick={() => showToast('جاري تنزيل صور الأشعة الطبية...')}
                      className="py-2 px-3 rounded-xl bg-[#199A8E] text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                    >
                      <Download size={14} />
                      <span>تنزيل</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
