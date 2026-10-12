import React, { useState } from 'react';
import {
  X, ArrowUpCircle, Stethoscope, Building2, UserCheck,
  CheckCircle, AlertCircle, Send, Phone, MapPin,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export type ReferralFromRole = 'nurse' | 'gp' | 'specialist' | 'hospital';
export type ReferralToType = 'gp' | 'specialist' | 'hospital';

export interface ReferralResult {
  id: string;
  to_type: ReferralToType;
  to_name: string;
  specialty?: string;
  patient_name: string;
  reason: string;
  urgency: string;
  referral_type?: string;
  procedure_name?: string;
  status: string;
  created_at: string;
}

interface ReferralOption {
  id: ReferralToType;
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
}

interface ReferralModalProps {
  fromRole: ReferralFromRole;
  patientId?: string;
  patientName?: string;
  onClose: () => void;
  onSuccess?: (result: ReferralResult) => void;
}

const specialties = [
  'قلب وأوعية دموية', 'جهاز هضمي وكبد', 'أعصاب', 'أطفال', 'نساء وولادة',
  'عظام ومفاصل', 'جلدية', 'عيون', 'أنف وأذن وحنجرة', 'مسالك بولية',
  'غدد صماء', 'رئة وصدر', 'طب نفسي', 'أورام', 'جراحة عامة',
];

const hospitals = [
  'مستشفى الجمهوري', 'مستشفى الثورة', 'المستشفى السعودي الألماني',
  'مستشفى حدة الدولي', 'مستشفى اليمني الألماني', 'مركز الأورام',
  'مستشفى العيون', 'مستشفى دار الشفاء',
];

const gpClinics = [
  'د. أحمد العمري — طب عام', 'د. سالم المقطري — طب عام', 'د. عمر الزبيدي — طب عام',
  'مركز الصحة الأساسية — حدة', 'مركز الجراف الصحي',
];

const procedureTypes = [
  { id: 'consultation', label: 'استشارة طبية' },
  { id: 'procedure', label: 'إجراء طبي' },
  { id: 'operation', label: 'عملية جراحية' },
];

const procedureNames: Record<string, string[]> = {
  procedure: [
    'قسطرة قلبية', 'منظار معدة', 'منظار قولون', 'خزعة', 'صرف خراج',
    'جبيرة جصية', 'غسيل كلوي', 'تخطيط كهربائي للقلب', 'أشعة مقطعية',
    'رنين مغناطيسي', 'غسيل برفق للجرح', 'شفط سوائل',
  ],
  operation: [
    'استئصال زائدة', 'قيصرية', 'استئصال مرارة', 'إصلاح فتق', 'شريان بالون',
    'زراعة دعامة', 'استئصال ورم', 'تجميل جرح', 'جراحة عظام',
    'استئصال غدة درقية', 'جراحة قلب مفتوح', 'زراعة كلى',
  ],
};

const urgencyOptions = [
  { id: 'routine', label: 'روتيني', cls: 'bg-gray-100 text-gray-700', border: 'border-gray-300' },
  { id: 'urgent', label: 'عاجل', cls: 'bg-amber-100 text-amber-700', border: 'border-amber-400' },
  { id: 'emergency', label: 'طارئ', cls: 'bg-red-100 text-red-700', border: 'border-red-400' },
];

const referralOptions: Record<ReferralFromRole, ReferralOption[]> = {
  nurse: [
    { id: 'gp', icon: Stethoscope, label: 'طبيب عام', color: 'text-green-700', bg: 'bg-green-50 border-green-300' },
    { id: 'specialist', icon: UserCheck, label: 'أخصائي', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300' },
    { id: 'hospital', icon: Building2, label: 'مستشفى', color: 'text-red-700', bg: 'bg-red-50 border-red-300' },
  ],
  gp: [
    { id: 'specialist', icon: UserCheck, label: 'أخصائي', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300' },
    { id: 'hospital', icon: Building2, label: 'مستشفى', color: 'text-red-700', bg: 'bg-red-50 border-red-300' },
  ],
  specialist: [
    { id: 'specialist', icon: UserCheck, label: 'أخصائي آخر', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300' },
    { id: 'hospital', icon: Building2, label: 'مستشفى', color: 'text-red-700', bg: 'bg-red-50 border-red-300' },
  ],
  hospital: [
    { id: 'hospital', icon: Building2, label: 'مستشفى آخر', color: 'text-red-700', bg: 'bg-red-50 border-red-300' },
  ],
};

const fromRoleLabel: Record<ReferralFromRole, string> = {
  nurse: 'ممرض', gp: 'طبيب عام', specialist: 'أخصائي', hospital: 'مستشفى',
};

export function ReferralModal({ fromRole, patientId = 'demo', patientName, onClose, onSuccess }: ReferralModalProps) {
  const [toType, setToType] = useState<ReferralToType | null>(null);
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState<'routine' | 'urgent' | 'emergency'>('routine');
  const [specialty, setSpecialty] = useState('');
  const [toName, setToName] = useState('');
  const [hospitalReferralType, setHospitalReferralType] = useState('');
  const [procedureName, setProcedureName] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [savedResult, setSavedResult] = useState<ReferralResult | null>(null);

  const options = referralOptions[fromRole];
  const needsHospitalType = toType === 'hospital' && (fromRole === 'gp' || fromRole === 'specialist' || fromRole === 'hospital');
  const canSave = toType && reason.trim()
    && (toType !== 'specialist' || specialty)
    && (toType !== 'hospital' || toName)
    && (toType !== 'gp' || toName);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const result: ReferralResult = {
      id: `ref-${Date.now()}`,
      to_type: toType!,
      to_name: toType === 'specialist' ? specialty : toName,
      specialty: toType === 'specialist' ? specialty : undefined,
      patient_name: patientName || 'غير محدد',
      reason,
      urgency,
      referral_type: hospitalReferralType || undefined,
      procedure_name: procedureName || undefined,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    try {
      const { data } = await supabase.from('referrals').insert({
        from_role: fromRole, to_type: toType!, to_name: result.to_name,
        specialty: toType === 'specialist' ? specialty : null,
        patient_id: patientId, patient_name: patientName || 'غير محدد',
        reason, referral_type: hospitalReferralType || null,
        procedure_name: procedureName || null,
        urgency, notes, status: 'pending',
      }).select('id').single();
      if (data?.id) result.id = data.id;
      // Send notification to patient
      await supabase.from('notifications').insert({
        user_id: patientId, type: 'info',
        title: 'تم تحويلك',
        message: `تم إرسال تحويل طبي إلى ${toType === 'specialist' ? `أخصائي ${specialty}` : toName} — درجة الاستعجال: ${urgencyOptions.find(u => u.id === urgency)?.label}`,
      });
    } catch {}
    setSaving(false);
    setSavedResult(result);
    setDone(true);
    onSuccess?.(result);
  };

  const urgCfg = urgencyOptions.find(u => u.id === urgency);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <X size={18} className="text-gray-500" />
          </button>
          <div className="text-center">
            <h2 className="font-bold text-gray-800 text-base">تحويل طبي</h2>
            <p className="text-xs text-gray-400">من: {fromRoleLabel[fromRole]}{patientName ? ` • ${patientName}` : ''}</p>
          </div>
          <div className="w-9" />
        </div>

        {done && savedResult ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center overflow-y-auto">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">تم إرسال التحويل</h3>
            <p className="text-gray-500 text-sm mb-4">سيتم إشعار المريض والجهة المحوَّل إليها فوراً</p>
            {/* Summary card */}
            <div className="w-full bg-gray-50 rounded-2xl p-4 text-right space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-gray-700">{savedResult.to_type === 'specialist' ? `أخصائي ${savedResult.specialty}` : savedResult.to_name}</span>
                <span className="text-gray-500">التحويل إلى</span>
              </div>
              {savedResult.procedure_name && (
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-blue-700">{savedResult.procedure_name}</span>
                  <span className="text-gray-500">{savedResult.referral_type === 'operation' ? 'العملية' : 'الإجراء'}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${urgCfg?.cls}`}>{urgCfg?.label}</span>
                <span className="text-gray-500">الاستعجال</span>
              </div>
            </div>
            <button onClick={onClose} className="w-full bg-[#2196F3] text-white py-4 rounded-2xl font-bold">إغلاق</button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-8 space-y-5">
            {/* Step 1 — To type */}
            <div>
              <p className="font-bold text-gray-700 text-sm mb-3 text-right">التحويل إلى *</p>
              <div className={`grid gap-2 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {options.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button key={opt.id} onClick={() => { setToType(opt.id); setToName(''); setSpecialty(''); setHospitalReferralType(''); setProcedureName(''); }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${toType === opt.id ? `${opt.bg} shadow-md` : 'bg-gray-50 border-gray-200'}`}>
                      <Icon size={26} className={toType === opt.id ? opt.color : 'text-gray-400'} />
                      <span className={`text-xs font-bold text-center leading-tight ${toType === opt.id ? opt.color : 'text-gray-500'}`}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 — Specialty */}
            {toType === 'specialist' && (
              <div>
                <p className="font-bold text-gray-700 text-sm mb-2 text-right">التخصص المطلوب *</p>
                <div className="flex flex-wrap gap-2 justify-end">
                  {specialties.map(s => (
                    <button key={s} onClick={() => setSpecialty(s)}
                      className={`text-sm px-3 py-2 rounded-xl border transition-all ${specialty === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — GP */}
            {toType === 'gp' && (
              <div>
                <p className="font-bold text-gray-700 text-sm mb-2 text-right">طبيب عام *</p>
                <div className="space-y-2">
                  {gpClinics.map(c => (
                    <button key={c} onClick={() => setToName(c)}
                      className={`w-full text-right px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 justify-end ${toName === c ? 'bg-green-50 border-green-400 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Hospital */}
            {toType === 'hospital' && (
              <div>
                <p className="font-bold text-gray-700 text-sm mb-2 text-right">المستشفى *</p>
                <div className="space-y-2">
                  {hospitals.map(h => (
                    <button key={h} onClick={() => setToName(h)}
                      className={`w-full text-right px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${toName === h ? 'bg-red-50 border-red-400 text-red-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                      <MapPin size={14} className={toName === h ? 'text-red-500' : 'text-gray-300'} />
                      <span>{h}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 — Hospital referral type (gp/specialist/hospital → hospital) */}
            {needsHospitalType && toName && (
              <div>
                <p className="font-bold text-gray-700 text-sm mb-2 text-right">نوع التحويل للمستشفى *</p>
                <div className="grid grid-cols-3 gap-2">
                  {procedureTypes.map(pt => (
                    <button key={pt.id} onClick={() => { setHospitalReferralType(pt.id); setProcedureName(''); }}
                      className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${hospitalReferralType === pt.id ? 'bg-[#2196F3] text-white border-[#2196F3]' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>{pt.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 — Procedure / Operation name */}
            {needsHospitalType && (hospitalReferralType === 'procedure' || hospitalReferralType === 'operation') && (
              <div>
                <p className="font-bold text-gray-700 text-sm mb-2 text-right">
                  {hospitalReferralType === 'procedure' ? 'نوع الإجراء' : 'نوع العملية'} *
                </p>
                <div className="flex flex-wrap gap-2 justify-end mb-2">
                  {procedureNames[hospitalReferralType].map(p => (
                    <button key={p} onClick={() => setProcedureName(p)}
                      className={`text-sm px-3 py-2 rounded-xl border transition-all ${procedureName === p ? 'bg-[#2196F3] text-white border-[#2196F3]' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>{p}</button>
                  ))}
                </div>
                <input type="text" value={procedureName} onChange={e => setProcedureName(e.target.value)}
                  placeholder="أو اكتب اسم الإجراء يدوياً..." dir="rtl"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3]" />
              </div>
            )}

            {/* Urgency */}
            {toType && (
              <div>
                <p className="font-bold text-gray-700 text-sm mb-2 text-right">درجة الاستعجال</p>
                <div className="grid grid-cols-3 gap-2">
                  {urgencyOptions.map(u => (
                    <button key={u.id} onClick={() => setUrgency(u.id as any)}
                      className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${urgency === u.id ? `${u.cls} ${u.border}` : 'bg-gray-50 border-gray-200 text-gray-500'}`}>{u.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Reason */}
            {toType && (
              <div>
                <p className="font-bold text-gray-700 text-sm mb-2 text-right">سبب التحويل *</p>
                <textarea value={reason} onChange={e => setReason(e.target.value)}
                  rows={3} dir="rtl" placeholder="اشرح سبب التحويل بالتفصيل..."
                  className="w-full p-3.5 rounded-xl border border-gray-200 resize-none text-sm outline-none focus:border-[#2196F3]" />
              </div>
            )}

            {/* Notes */}
            {toType && (
              <div>
                <p className="font-bold text-gray-700 text-sm mb-2 text-right">ملاحظات للجهة المستقبِلة</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  rows={2} dir="rtl" placeholder="معلومات إضافية مساعدة..."
                  className="w-full p-3.5 rounded-xl border border-gray-200 resize-none text-sm outline-none" />
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSave} disabled={!canSave || saving}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${canSave ? 'bg-[#2196F3] text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
              {saving
                ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                : <><Send size={18} />إرسال التحويل</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
