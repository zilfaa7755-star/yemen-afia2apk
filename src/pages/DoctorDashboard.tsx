import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar, Clock, Users, TrendingUp, AlertCircle, CheckCircle,
  FileText, Activity, Download, LogOut, Mic, MicOff, Pill,
  FlaskConical, Send, Plus, X, Stethoscope, Heart, Clipboard,
  QrCode, CheckSquare, Trash2, User, AlertTriangle,
  Save, Star, BarChart2, ChevronDown, ArrowUpCircle,
  MessageSquare, Users2, Eye, ThumbsUp, Zap, BookOpen,
} from 'lucide-react';
import { MedicalLibrary } from './MedicalLibrary';
import { DoctorMessages } from './DoctorMessages';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ReferralModal, type ReferralResult } from '../components/common/ReferralModal';
import { PatientRecord } from '../clinical_view/PatientRecord';
import type { Appointment } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DemoPatient {
  id: string; full_name: string; age: number; gender: 'male' | 'female';
  blood_type: string; weight?: number; height?: number; is_pregnant?: boolean;
  chronic_diseases: string[]; allergies: string[]; phone: string;
}
interface PrescriptionMed {
  id: string; name: string; dosage: string; frequency: string; duration: string; instructions: string;
}
interface LabReq { id: string; test_name: string; test_type: 'lab' | 'xray' | 'scan' | 'ecg' | 'other'; urgency: 'routine' | 'urgent' | 'stat'; }

const demoPatients: Record<string, DemoPatient> = {
  '1': { id: '1', full_name: 'أحمد محمد الأغبري', age: 45, gender: 'male', blood_type: 'A+', weight: 82, height: 172, chronic_diseases: ['ضغط الدم', 'سكري'], allergies: ['بنسلين'], phone: '777123456' },
  '2': { id: '2', full_name: 'فاطمة علي المقطري', age: 32, gender: 'female', blood_type: 'O+', weight: 64, height: 160, is_pregnant: false, chronic_diseases: ['ربو'], allergies: [], phone: '777234567' },
  '3': { id: '3', full_name: 'خالد عبدالله الشامي', age: 28, gender: 'male', blood_type: 'B+', weight: 75, height: 178, chronic_diseases: [], allergies: ['أسبرين'], phone: '777345678' },
  '4': { id: '4', full_name: 'نورا يحيى الحيمي', age: 55, gender: 'female', blood_type: 'AB-', weight: 70, height: 155, chronic_diseases: ['قلب', 'سكري'], allergies: ['سلفا'], phone: '777456789' },
  '5': { id: '5', full_name: 'عمر سالم الزبيدي', age: 19, gender: 'male', blood_type: 'O-', weight: 68, height: 180, chronic_diseases: [], allergies: [], phone: '777567890' },
};

const labTestOptions = [
  { name: 'صورة دم كاملة CBC', type: 'lab' as const }, { name: 'سكر الدم FBS', type: 'lab' as const },
  { name: 'HbA1c', type: 'lab' as const }, { name: 'وظائف الكلى', type: 'lab' as const },
  { name: 'وظائف الكبد', type: 'lab' as const }, { name: 'الغدة الدرقية TSH', type: 'lab' as const },
  { name: 'الدهون والكوليسترول', type: 'lab' as const }, { name: 'تحليل بول', type: 'lab' as const },
  { name: 'أشعة صدر X-Ray', type: 'xray' as const }, { name: 'سونار بطن', type: 'scan' as const },
  { name: 'رسم قلب ECG', type: 'ecg' as const }, { name: 'أشعة مقطعية CT', type: 'scan' as const },
  { name: 'رنين مغناطيسي MRI', type: 'scan' as const }, { name: 'أشعة عظام', type: 'xray' as const },
];

const commonMeds = [
  'باراسيتامول 500 مجم', 'أموكسيسيلين 500 مجم', 'إيبوبروفين 400 مجم',
  'أزيثرومايسين 500 مجم', 'أوميبرازول 20 مجم', 'ميتفورمين 500 مجم',
  'أملوديبين 5 مجم', 'أتورفاستاتين 20 مجم', 'كلارتين 10 مجم',
];
const frequencies = ['مرة يومياً', 'مرتين يومياً', '3 مرات يومياً', 'كل 6 ساعات', 'كل 8 ساعات', 'كل 12 ساعة', 'عند الحاجة'];
const durations = ['3 أيام', '5 أيام', '7 أيام', '10 أيام', '14 يوم', '30 يوم', 'مستمر'];

function genCode() { return `RX-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(6, '0')}`; }

// ─── Examination Panel ────────────────────────────────────────────────────────
function ExaminationPanel({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const [panel, setPanel] = useState<'main' | 'prescription' | 'lab' | 'record' | 'consult'>('main');
  const [isRecording, setIsRecording] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [meds, setMeds] = useState<PrescriptionMed[]>([]);
  const [prescNotes, setPrescNotes] = useState('');
  const [prescSaved, setPrescSaved] = useState(false);
  const [labReqs, setLabReqs] = useState<LabReq[]>([]);
  const [labSent, setLabSent] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [referralSent, setReferralSent] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<'diag' | 'med' | 'instruct' | 'notes'>('diag');
  const [showMedForm, setShowMedForm] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: 'مرتين يومياً', duration: '7 أيام', instructions: '' });
  const recRef = useRef<any>(null);
  const patient = demoPatients[appointment.patient_id];

  const startVoice = (target: typeof voiceTarget) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setVoiceTarget(target); setIsRecording(true);
    const rec = new SR(); rec.lang = 'ar-SA'; rec.continuous = false; rec.interimResults = false;
    rec.onresult = (e: any) => {
      const t: string = e.results[0][0].transcript;
      if (target === 'diag') setDiagnosis(p => (p + ' ' + t).trim());
      else if (target === 'med') setNewMed(p => ({ ...p, name: t }));
      else if (target === 'instruct') setNewMed(p => ({ ...p, instructions: t }));
      else if (target === 'notes') setPrescNotes(p => (p + ' ' + t).trim());
    };
    rec.onend = () => setIsRecording(false);
    rec.onerror = () => setIsRecording(false);
    recRef.current = rec; rec.start();
  };
  const stopVoice = () => { recRef.current?.stop(); setIsRecording(false); };

  const addMed = () => {
    if (!newMed.name.trim() || !newMed.dosage.trim()) return;
    setMeds(p => [...p, { id: Date.now().toString(), ...newMed }]);
    setNewMed({ name: '', dosage: '', frequency: 'مرتين يومياً', duration: '7 أيام', instructions: '' });
    setShowMedForm(false);
  };

  // Drug interaction check (demo)
  const getDrugWarning = (medName: string): { level: 'red' | 'yellow' | null; msg: string } => {
    if (patient?.allergies?.some(a => medName.toLowerCase().includes(a.toLowerCase()))) {
      return { level: 'red', msg: `تحذير: المريض لديه حساسية معروفة من مكونات هذا الدواء` };
    }
    if (medName.includes('أموكسيسيلين') && meds.some(m => m.name.includes('وارفارين'))) {
      return { level: 'yellow', msg: 'تداخل دوائي بسيط مع الأدوية الحالية' };
    }
    return { level: null, msg: '' };
  };

  const savePresc = async () => {
    if (meds.length === 0) return;
    const warning = meds.map(m => getDrugWarning(m.name)).find(w => w.level === 'red');
    if (warning) { alert(warning.msg); return; }
    try {
      await supabase.from('electronic_prescriptions').insert({
        code: genCode(), patient_id: appointment.patient_id,
        doctor_name: 'د. محمد العمري', doctor_specialization: 'باطنية',
        clinic_name: 'مركز اليمن الطبي',
        issue_date: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 30 * 86400000).toISOString(),
        status: 'active', diagnosis, medications: meds, notes: prescNotes,
      });
    } catch {}
    setPrescSaved(true);
  };

  const sendLab = async () => {
    if (labReqs.length === 0) return;
    try {
      await supabase.from('lab_requests').insert(
        labReqs.map(r => ({ patient_id: appointment.patient_id, appointment_id: appointment.id, test_name: r.test_name, test_type: r.test_type, urgency: r.urgency, status: 'pending', requested_at: new Date().toISOString() }))
      );
    } catch {}
    setLabSent(true);
  };

  const VoiceBtn = ({ target, active }: { target: typeof voiceTarget; active: boolean }) => (
    <button
      onMouseDown={() => startVoice(target)} onMouseUp={stopVoice}
      onTouchStart={() => startVoice(target)} onTouchEnd={stopVoice}
      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${active ? 'bg-red-500 shadow-lg' : 'bg-blue-100'}`}
    >
      {active ? <MicOff size={15} className="text-white" /> : <Mic size={15} className="text-[#2196F3]" />}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={onClose} className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-xl text-sm font-bold">
            <CheckCircle size={16} />إنهاء الكشف
          </button>
          <div className="text-center">
            <p className="font-bold text-gray-800 text-sm">{patient?.full_name || 'مريض'}</p>
            <p className="text-xs text-gray-400">رقم {appointment.queue_number} في الطابور</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        {/* Sub-tabs */}
        <div className="flex border-t border-gray-100">
          {([
            { id: 'main', icon: Stethoscope, label: 'المعاينة' },
            { id: 'prescription', icon: FileText, label: 'وصفة' },
            { id: 'lab', icon: FlaskConical, label: 'فحوصات' },
            { id: 'record', icon: Clipboard, label: 'الملف الطبي' },
            { id: 'consult', icon: MessageSquare, label: 'استشارة' },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setPanel(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium border-b-2 transition-colors ${panel === id ? 'border-[#2196F3] text-[#2196F3]' : 'border-transparent text-gray-400'}`}>
              <Icon size={17} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── MAIN ── */}
        {panel === 'main' && (
          <div className="px-4 py-4 space-y-4 pb-10">
            {patient && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User size={24} className="text-[#2196F3]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{patient.full_name}</p>
                    <p className="text-sm text-gray-500">{patient.age} سنة • {patient.gender === 'male' ? 'ذكر' : 'أنثى'} • <span className="font-bold text-red-500">{patient.blood_type}</span>{patient.weight && ` • ${patient.weight} كجم`}</p>
                  </div>
                </div>
                {patient.chronic_diseases.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {patient.chronic_diseases.map((d, i) => <span key={i} className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-lg">{d}</span>)}
                  </div>
                )}
                {patient.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <AlertTriangle size={13} className="text-red-500" />
                    {patient.allergies.map((a, i) => <span key={i} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-lg">حساسية: {a}</span>)}
                  </div>
                )}
              </div>
            )}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <p className="font-bold text-gray-700 text-sm mb-2 flex items-center gap-2"><Activity size={15} className="text-[#2196F3]" />الأعراض</p>
              <p className="text-gray-600 bg-blue-50 rounded-xl px-3 py-2.5 text-sm">{appointment.symptoms || 'لم يُذكر'}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <VoiceBtn target="diag" active={isRecording && voiceTarget === 'diag'} />
                <p className="font-bold text-gray-700 text-sm">التشخيص</p>
              </div>
              {isRecording && voiceTarget === 'diag' && <div className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2 mb-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /><span className="text-red-600 text-xs">تسجيل...</span></div>}
              <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="اكتب التشخيص أو استخدم الميكروفون..." rows={3} dir="rtl" className="w-full p-3 rounded-xl border border-gray-200 resize-none text-sm focus:border-[#2196F3] outline-none" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setPanel('prescription')} className="bg-[#2196F3] text-white rounded-2xl p-4 flex flex-col items-center gap-2">
                <FileText size={22} /><span className="text-xs font-bold">وصفة طبية</span>
              </button>
              <button onClick={() => setPanel('lab')} className="bg-emerald-600 text-white rounded-2xl p-4 flex flex-col items-center gap-2">
                <FlaskConical size={22} /><span className="text-xs font-bold">إرسال فحوصات</span>
              </button>
              <button onClick={() => setPanel('record')} className="bg-amber-500 text-white rounded-2xl p-4 flex flex-col items-center gap-2">
                <Clipboard size={22} /><span className="text-xs font-bold">الملف الطبي</span>
              </button>
            </div>

            {/* Referral button */}
            <button onClick={() => setShowReferral(true)}
              className={`w-full py-4 rounded-2xl border-2 border-dashed border-purple-200 flex items-center justify-center gap-2 ${referralSent ? 'bg-purple-50' : ''}`}>
              <ArrowUpCircle size={20} className={referralSent ? 'text-purple-400' : 'text-purple-500'} />
              <span className={`font-bold text-sm ${referralSent ? 'text-purple-400' : 'text-purple-600'}`}>
                {referralSent ? 'تم إرسال التحويل ✓' : 'تحويل المريض'}
              </span>
            </button>

            {showReferral && (
              <ReferralModal
                fromRole="specialist"
                patientId={appointment.patient_id}
                patientName={patient?.full_name}
                onClose={() => setShowReferral(false)}
                onSuccess={(_result: ReferralResult) => { setReferralSent(true); setShowReferral(false); }}
              />
            )}
          </div>
        )}

        {/* ── PRESCRIPTION ── */}
        {panel === 'prescription' && (
          <div className="px-4 py-4 pb-12 space-y-4">
            {prescSaved ? (
              <div className="text-center py-10 px-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={40} className="text-green-600" /></div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">تم حفظ الوصفة</h2>
                <p className="text-gray-500 text-sm mb-6">الوصفة الإلكترونية محفوظة في ملف المريض وجاهزة للصرف</p>
                <div className="bg-[#E3F2FD] rounded-2xl p-5 flex flex-col items-center mb-6"><QrCode size={64} className="text-[#2196F3] mb-2" /><p className="text-xs text-gray-500">رمز QR — يعرضه المريض للصيدلاني</p></div>
                <button onClick={() => { setPrescSaved(false); setMeds([]); setDiagnosis(''); }} className="w-full py-3 bg-[#2196F3] text-white rounded-2xl font-bold">إنشاء وصفة جديدة</button>
              </div>
            ) : (
              <>
                {/* Doctor header (read-only) */}
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-xs text-gray-400 text-right mb-1">بيانات الوصفة (تُعبأ تلقائياً — لا يمكن تعديلها)</p>
                  <div className="grid grid-cols-2 gap-2 text-right">
                    {[['الطبيب', 'د. محمد العمري'], ['التخصص', 'باطنية'], ['العيادة', 'مركز اليمن الطبي'], ['الترخيص', 'LIC-20345']].map(([k, v]) => (
                      <div key={k} className="bg-white rounded-xl px-3 py-2"><p className="text-[10px] text-gray-400">{k}</p><p className="text-xs font-bold text-gray-700">{v}</p></div>
                    ))}
                  </div>
                </div>
                {/* Patient data */}
                {patient && (
                  <div className="bg-gray-50 rounded-2xl p-4 text-right">
                    <p className="text-xs text-gray-400 mb-2">بيانات المريض</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white rounded-xl p-2"><p className="text-[10px] text-gray-400">الاسم</p><p className="text-xs font-bold text-gray-700 truncate">{patient.full_name}</p></div>
                      <div className="bg-white rounded-xl p-2"><p className="text-[10px] text-gray-400">العمر / الوزن</p><p className="text-xs font-bold text-gray-700">{patient.age}س / {patient.weight || '—'}كجم</p></div>
                      <div className="bg-white rounded-xl p-2"><p className="text-[10px] text-gray-400">فصيلة الدم</p><p className="text-xs font-bold text-red-600">{patient.blood_type}</p></div>
                    </div>
                  </div>
                )}
                {/* Diagnosis */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <VoiceBtn target="diag" active={isRecording && voiceTarget === 'diag'} />
                    <p className="font-bold text-gray-700 text-sm">التشخيص (ICD-10)</p>
                  </div>
                  <input type="text" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="التشخيص + الكود مثال: J06.9" dir="rtl" className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-[#2196F3] outline-none" />
                </div>
                {/* Medications */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => setShowMedForm(true)} className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center"><Plus size={16} className="text-[#2196F3]" /></button>
                    <p className="font-bold text-gray-700 text-sm flex items-center gap-2"><Pill size={15} className="text-[#2196F3]" />الأدوية ({meds.length})</p>
                  </div>
                  {meds.length === 0 && !showMedForm && (
                    <button onClick={() => setShowMedForm(true)} className="w-full border-2 border-dashed border-blue-200 rounded-xl py-5 flex flex-col items-center gap-2 text-blue-400"><Plus size={22} /><span className="text-sm">أضف دواءً</span></button>
                  )}
                  {meds.map((m, idx) => {
                    const warn = getDrugWarning(m.name);
                    return (
                      <div key={m.id} className={`border rounded-xl p-3 mb-2 ${warn.level === 'red' ? 'border-red-300 bg-red-50' : warn.level === 'yellow' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100'}`}>
                        {warn.level && <p className={`text-xs mb-1.5 font-medium ${warn.level === 'red' ? 'text-red-600' : 'text-yellow-600'}`}>{warn.level === 'red' ? '🔴' : '🟡'} {warn.msg}</p>}
                        <div className="flex items-start justify-between">
                          <button onClick={() => setMeds(p => p.filter(x => x.id !== m.id))} className="text-red-400 mt-0.5"><Trash2 size={13} /></button>
                          <div className="text-right flex-1 mr-2">
                            <p className="font-bold text-gray-800 text-sm">{m.name}</p>
                            <p className="text-xs text-gray-500">{m.dosage} • {m.frequency} • {m.duration}</p>
                            {m.instructions && <p className="text-xs text-amber-600 mt-0.5">{m.instructions}</p>}
                          </div>
                          <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-xs text-[#2196F3] font-bold flex-shrink-0">{idx + 1}</span>
                        </div>
                      </div>
                    );
                  })}
                  {showMedForm && (
                    <div className="bg-blue-50 rounded-2xl p-4 mt-3 space-y-3 border border-blue-100">
                      <div className="flex items-center justify-between"><button onClick={() => setShowMedForm(false)}><X size={16} className="text-gray-400" /></button><p className="font-bold text-sm text-gray-700">إضافة دواء</p></div>
                      <div>
                        <div className="flex gap-2 mb-1.5">
                          <VoiceBtn target="med" active={isRecording && voiceTarget === 'med'} />
                          <input type="text" value={newMed.name} onChange={e => setNewMed(p => ({ ...p, name: e.target.value }))} placeholder="اسم الدواء..." dir="rtl" className="flex-1 p-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none" />
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                          {commonMeds.map(m => <button key={m} onClick={() => setNewMed(p => ({ ...p, name: m }))} className={`flex-shrink-0 text-xs px-2 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${newMed.name === m ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}>{m}</button>)}
                        </div>
                      </div>
                      <input type="text" value={newMed.dosage} onChange={e => setNewMed(p => ({ ...p, dosage: e.target.value }))} placeholder="الجرعة (مثال: 500 مجم)" dir="rtl" className="w-full p-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none" />
                      <div className="grid grid-cols-2 gap-2">
                        <select value={newMed.frequency} onChange={e => setNewMed(p => ({ ...p, frequency: e.target.value }))} className="p-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none" dir="rtl">{frequencies.map(f => <option key={f}>{f}</option>)}</select>
                        <select value={newMed.duration} onChange={e => setNewMed(p => ({ ...p, duration: e.target.value }))} className="p-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none" dir="rtl">{durations.map(d => <option key={d}>{d}</option>)}</select>
                      </div>
                      <div className="flex gap-2">
                        <VoiceBtn target="instruct" active={isRecording && voiceTarget === 'instruct'} />
                        <input type="text" value={newMed.instructions} onChange={e => setNewMed(p => ({ ...p, instructions: e.target.value }))} placeholder="تعليمات (مثال: بعد الأكل)" dir="rtl" className="flex-1 p-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none" />
                      </div>
                      <button onClick={addMed} disabled={!newMed.name.trim() || !newMed.dosage.trim()} className={`w-full py-3 rounded-xl font-bold text-sm ${newMed.name.trim() && newMed.dosage.trim() ? 'bg-[#2196F3] text-white' : 'bg-gray-200 text-gray-400'}`}>إضافة الدواء</button>
                    </div>
                  )}
                </div>
                {/* Notes */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <VoiceBtn target="notes" active={isRecording && voiceTarget === 'notes'} />
                    <p className="font-bold text-gray-700 text-sm">ملاحظات للصيدلاني</p>
                  </div>
                  <textarea value={prescNotes} onChange={e => setPrescNotes(e.target.value)} placeholder="تعليمات خاصة..." rows={2} dir="rtl" className="w-full p-3 rounded-xl border border-gray-200 resize-none text-sm outline-none" />
                </div>
                <button onClick={savePresc} disabled={meds.length === 0} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${meds.length > 0 ? 'bg-[#2196F3] text-white' : 'bg-gray-200 text-gray-400'}`}><Save size={18} />حفظ وإصدار الوصفة</button>
              </>
            )}
          </div>
        )}

        {/* ── LAB ── */}
        {panel === 'lab' && (
          <div className="px-4 py-4 pb-12 space-y-4">
            {labSent ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={40} className="text-emerald-600" /></div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">تم إرسال طلبات الفحص</h2>
                <p className="text-gray-500 text-sm mb-6">ستظهر النتائج تلقائياً في الملف الطبي للمريض</p>
                <button onClick={() => { setLabSent(false); setLabReqs([]); }} className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold">إرسال طلبات جديدة</button>
              </div>
            ) : (
              <>
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                  <p className="font-bold text-gray-700 text-sm mb-3 text-right">اختر الفحوصات</p>
                  <div className="grid grid-cols-2 gap-2">
                    {labTestOptions.map(t => {
                      const sel = labReqs.some(r => r.test_name === t.name);
                      return (
                        <button key={t.name} onClick={() => setLabReqs(p => sel ? p.filter(r => r.test_name !== t.name) : [...p, { id: Date.now() + t.name, test_name: t.name, test_type: t.type, urgency: 'routine' }])} className={`flex items-center gap-2 p-3 rounded-xl border text-right text-xs font-medium transition-all ${sel ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                          {sel && <CheckSquare size={13} className="text-emerald-600 flex-shrink-0" />}
                          <span className="leading-tight">{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {labReqs.length > 0 && (
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                    <p className="font-bold text-gray-700 text-sm mb-3 text-right">الفحوصات المختارة ({labReqs.length})</p>
                    <div className="space-y-2 mb-4">
                      {labReqs.map(r => (
                        <div key={r.id} className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2.5">
                          <button onClick={() => setLabReqs(p => p.filter(x => x.id !== r.id))} className="text-red-400"><X size={13} /></button>
                          <div className="flex-1 text-right"><p className="text-sm font-medium text-gray-800">{r.test_name}</p></div>
                          <select value={r.urgency} onChange={e => setLabReqs(p => p.map(x => x.id === r.id ? { ...x, urgency: e.target.value as any } : x))} className="text-xs border border-emerald-200 rounded-lg px-1.5 py-1 bg-white outline-none">
                            <option value="routine">روتيني</option><option value="urgent">عاجل</option><option value="stat">فوري</option>
                          </select>
                        </div>
                      ))}
                    </div>
                    <button onClick={sendLab} className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"><Send size={17} />إرسال طلبات الفحص</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── RECORD ── */}
        {panel === 'record' && patient && (
          <PatientRecord readOnly={false} />
        )}

        {/* ── CONSULT ── */}
        {panel === 'consult' && (
          <ConsultationForm appointment={appointment} patient={patient} diagnosis={diagnosis} onSent={() => {}} />
        )}
      </div>
    </div>
  );
}

// ─── Consultation Form (inside examination) ─────────────────────────────────
function ConsultationForm({ appointment, patient, diagnosis, onSent }: {
  appointment: Appointment;
  patient: any;
  diagnosis: string;
  onSent: () => void;
}) {
  const { user } = useAuth();
  const [chiefComplaint, setChiefComplaint] = useState(appointment.symptoms || '');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [currentDiagnosis, setCurrentDiagnosis] = useState(diagnosis || '');
  const [treatmentsTried, setTreatmentsTried] = useState('');
  const [labResults, setLabResults] = useState('');
  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'normal' | 'high' | 'critical'>('high');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!chiefComplaint.trim() || !currentDiagnosis.trim()) return;
    setSending(true);
    const payload = {
      doctor_id: user?.id || 'demo-doctor',
      doctor_name: user?.full_name || 'د. أحمد المقطري',
      specialization_id: '1',
      specialization_name: 'باطنية عامة',
      patient_age: patient?.age || null,
      patient_gender: patient?.gender || null,
      patient_blood_type: patient?.blood_type || null,
      chief_complaint: chiefComplaint,
      symptoms: symptoms,
      duration: duration,
      current_diagnosis: currentDiagnosis,
      treatments_tried: treatmentsTried,
      lab_results: labResults,
      notes: notes,
      urgency: urgency,
      status: 'open',
    };
    try {
      const { data } = await supabase.from('case_consultations').insert(payload).select().single();
      // Send notifications to all doctors in same specialization
      await supabase.from('case_consultation_notifications').insert([
        { case_id: data?.id || 'demo', doctor_id: 'all-doctors', doctor_name: 'جميع أطباء الباطنية', specialization_id: '1', is_read: false },
      ]);
    } catch {}
    setSending(false);
    setSent(true);
    onSent();
    setTimeout(() => setSent(false), 4000);
  };

  if (sent) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h3 className="font-black text-gray-800 text-lg mb-2">تم رفع الحالة لغرفة الاستشارة</h3>
        <p className="text-gray-500 text-sm mb-4">تم إرسال إشعار لجميع أطباء نفس التخصص</p>
        <div className="bg-blue-50 rounded-2xl p-4 mx-4">
          <div className="flex items-center gap-2 justify-center text-blue-700">
            <Users2 size={18} />
            <span className="font-bold text-sm">سيصلك رد من الأطباء الآخرين قريباً</span>
          </div>
        </div>
      </div>
    );
  }

  const urgencyOptions = [
    { v: 'low', l: 'منخفض', cls: 'bg-gray-100 text-gray-700' },
    { v: 'normal', l: 'عادي', cls: 'bg-blue-100 text-blue-700' },
    { v: 'high', l: 'مستعصية', cls: 'bg-amber-100 text-amber-700' },
    { v: 'critical', l: 'حرجة', cls: 'bg-red-100 text-red-700' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <MessageSquare size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-right">
            <p className="font-bold text-amber-800 text-sm">رفع الحالة لغرفة استشارة الأطباء</p>
            <p className="text-amber-600 text-xs mt-1">عند رفع الحالة، سيصل إشعار لجميع أطباء نفس التخصص لمناقشة الحالة والوصول لتشخيص موحد</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">الشكوى الرئيسية *</label>
          <textarea value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} rows={2} dir="rtl" placeholder="اكتب الشكوى الرئيسية للمريض..."
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3] resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">مدة الأعراض</label>
            <input value={duration} onChange={e => setDuration(e.target.value)} dir="rtl" placeholder="مثال: 3 أيام"
              className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3]" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">العمر</label>
            <input value={patient?.age || ''} disabled dir="rtl" placeholder="العمر"
              className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none bg-gray-50" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">الأعراض التفصيلية</label>
          <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} dir="rtl" placeholder="صف الأعراض بالتفصيل..."
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3] resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">التشخيص الحالي *</label>
          <textarea value={currentDiagnosis} onChange={e => setCurrentDiagnosis(e.target.value)} rows={2} dir="rtl" placeholder="التشخيص المبدئي..."
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3] resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">العلاجات التي تم تجربتها</label>
          <textarea value={treatmentsTried} onChange={e => setTreatmentsTried(e.target.value)} rows={2} dir="rtl" placeholder="الأدوية والعلاجات السابقة..."
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3] resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">نتائج الفحوصات</label>
          <textarea value={labResults} onChange={e => setLabResults(e.target.value)} rows={2} dir="rtl" placeholder="نتائج المختبر والأشعة..."
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3] resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">ملاحظات إضافية</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} dir="rtl" placeholder="أي ملاحظات إضافية..."
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3] resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">درجة الاستعصاء</label>
          <div className="grid grid-cols-4 gap-2">
            {urgencyOptions.map(({ v, l, cls }) => (
              <button key={v} onClick={() => setUrgency(v as any)}
                className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${urgency === v ? `${cls} border-current` : 'bg-gray-50 text-gray-400 border-transparent'}`}>{l}</button>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!chiefComplaint.trim() || !currentDiagnosis.trim() || sending}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${chiefComplaint.trim() && currentDiagnosis.trim() ? 'bg-[#2196F3] text-white' : 'bg-gray-200 text-gray-400'}`}>
          {sending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><Send size={18} />رفع الحالة للاستشارة</>}
        </button>
      </div>
    </div>
  );
}

// ─── Consultation Room (main view) ─────────────────────────────────────────────
function ConsultationRoom() {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [replyBody, setReplyBody] = useState('');
  const [replyType, setReplyType] = useState<'diagnosis' | 'question' | 'suggestion' | 'differential'>('diagnosis');
  const [suggestedDiagnosis, setSuggestedDiagnosis] = useState('');
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => { loadCases(); }, []);

  const loadCases = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('case_consultations').select('*').order('created_at', { ascending: false }).limit(50);
      if (data && data.length > 0) setCases(data);
      else setCases(getDemoCases());
    } catch {
      setCases(getDemoCases());
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoCases = () => [
    {
      id: 'c1', doctor_id: '2', doctor_name: 'د. فاطمة الشامي', specialization_name: 'قسطرة قلبية',
      patient_age: 55, patient_gender: 'male', patient_blood_type: 'O+',
      chief_complaint: 'ألم صدري مستمر غير مستجيب للعلاج',
      symptoms: 'ألم ضاغط في الصدر ينتشر للذراع الأيسر، ضيق تنفس، تعرق بارد، غثيان',
      duration: '6 ساعات', current_diagnosis: 'احتشاء عضلة القلب الحاد (STEMI)',
      treatments_tried: 'أعطي أسبرين + نيتروجلسرين بدون تحسن كامل',
      lab_results: 'تروبونين مرتفع 8.5، تخطيط القلب يظهر ST elevation في الحاجز الأمامي',
      notes: 'المريض لديه سكري وضغط، يحتاج قرار سريع بشأن القسطرة',
      urgency: 'critical', status: 'discussing', created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'c2', doctor_id: '3', doctor_name: 'د. خالد الإرياني', specialization_name: 'أعصاب طرفية',
      patient_age: 32, patient_gender: 'female', patient_blood_type: 'A+',
      chief_complaint: 'تشنجات متكررة وتنميل في الأطراف',
      symptoms: 'نوبات تشنج 3-4 مرات أسبوعياً، تنميل في اليدين والقدمين، صداع مستمر',
      duration: '3 أشهر', current_diagnosis: 'اشتباه صرع جزئي مع اعتلال أعصاب محيطي',
      treatments_tried: 'كاربامازيبين 200mg مرتين — انخفاض النوبات لكن التنميل مستمر',
      lab_results: 'EEG يظهر نشاط كهربائي غير طبيعي في الفص الصدغي، EMG يظهر اعتلال أعصاب محيطي',
      notes: 'هل نزيد جرعة كاربامازيبين أم نضيف دواء آخر؟ وهل التنميل يحتاج علاج منفصل؟',
      urgency: 'high', status: 'open', created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'c3', doctor_id: '4', doctor_name: 'د. سمية الحوثي', specialization_name: 'أطفال عام',
      patient_age: 6, patient_gender: 'male', patient_blood_type: 'B+',
      chief_complaint: 'حمى مستمرة وطفح جلدي غير مستجيب للمضادات الحيوية',
      symptoms: 'حمى 39° لمدة 5 أيام، طفح جلدي أحمر، تضخم العقد اللمفاوية، احمرار العينين',
      duration: '5 أيام', current_diagnosis: 'اشتباه مرض كاواساكي',
      treatments_tried: 'أعطي مضاد حيوي واسع الطيف بدون تحسن',
      lab_results: 'CRP مرتفع 85، تعداد كريات بيض مرتفع، صفائح دموية مرتفعة',
      notes: 'هل الأعراض كافية لتشخيص كاواساكي وبدء العلاج بالغلوبيولين المناعي؟',
      urgency: 'high', status: 'open', created_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ];

  const loadReplies = async (caseId: string) => {
    try {
      const { data } = await supabase.from('case_consultation_replies').select('*').eq('case_id', caseId).order('created_at', { ascending: true });
      if (data && data.length > 0) setReplies(data);
      else if (caseId === 'c1') setReplies([
        { id: 'r1', doctor_id: '1', doctor_name: 'د. أحمد المقطري', doctor_specialization: 'باطنية عامة', reply_type: 'suggestion', body: 'الحالة واضحة كاحتشاء أمامي حاد. أنصح بنقل المريض فوراً لقسطرة طارئة ضمن أول 90 دقيقة.', suggested_diagnosis: 'STEMI - يتطلب قسطرة طارئة', confidence_level: 'high', is_helpful: true, created_at: new Date(Date.now() - 1800000).toISOString() },
        { id: 'r2', doctor_id: '3', doctor_name: 'د. خالد الإرياني', doctor_specialization: 'أعصاب', reply_type: 'diagnosis', body: 'موافق مع التشخيص. بالنظر لارتفاع التروبونين وتخطيط القلب، التشخيص واضح.', suggested_diagnosis: 'STEMI anterior', confidence_level: 'high', is_helpful: false, created_at: new Date(Date.now() - 900000).toISOString() },
      ]);
      else setReplies([]);
    } catch {
      setReplies([]);
    }
  };

  const openCase = (c: any) => {
    setSelectedCase(c);
    loadReplies(c.id);
  };

  const sendReply = async () => {
    if (!replyBody.trim() || !selectedCase) return;
    setSendingReply(true);
    const payload = {
      case_id: selectedCase.id,
      doctor_id: user?.id || 'demo-doctor',
      doctor_name: user?.full_name || 'د. أحمد المقطري',
      doctor_specialization: 'باطنية عامة',
      reply_type: replyType,
      body: replyBody,
      suggested_diagnosis: suggestedDiagnosis || null,
      confidence_level: confidence,
    };
    try {
      const { data } = await supabase.from('case_consultation_replies').insert(payload).select().single();
      if (data) setReplies(p => [...p, data]);
      else setReplies(p => [...p, { ...payload, id: `r${Date.now()}`, created_at: new Date().toISOString() }]);
    } catch {
      setReplies(p => [...p, { ...payload, id: `r${Date.now()}`, created_at: new Date().toISOString() }]);
    }
    setReplyBody(''); setSuggestedDiagnosis(''); setSendingReply(false);
  };

  const markHelpful = async (replyId: string) => {
    setReplies(p => p.map(r => r.id === replyId ? { ...r, is_helpful: true } : r));
    try { await supabase.from('case_consultation_replies').update({ is_helpful: true }).eq('id', replyId); } catch {}
  };

  const resolveCase = async () => {
    if (!selectedCase) return;
    setCases(p => p.map(c => c.id === selectedCase.id ? { ...c, status: 'resolved' } : c));
    setSelectedCase({ ...selectedCase, status: 'resolved' });
    try { await supabase.from('case_consultations').update({ status: 'resolved' }).eq('id', selectedCase.id); } catch {}
  };

  const urgencyConfig: Record<string, { label: string; cls: string }> = {
    low: { label: 'منخفض', cls: 'bg-gray-100 text-gray-600' },
    normal: { label: 'عادي', cls: 'bg-blue-100 text-blue-700' },
    high: { label: 'مستعصية', cls: 'bg-amber-100 text-amber-700' },
    critical: { label: 'حرجة', cls: 'bg-red-100 text-red-700' },
  };
  const statusConfig: Record<string, { label: string; cls: string }> = {
    open: { label: 'مفتوحة', cls: 'bg-blue-100 text-blue-700' },
    discussing: { label: 'قيد المناقشة', cls: 'bg-amber-100 text-amber-700' },
    resolved: { label: 'تم حلها', cls: 'bg-green-100 text-green-700' },
    closed: { label: 'مغلقة', cls: 'bg-gray-100 text-gray-600' },
  };
  const replyTypeConfig: Record<string, { label: string; cls: string }> = {
    diagnosis: { label: 'تشخيص', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    question: { label: 'سؤال', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    suggestion: { label: 'اقتراح', cls: 'bg-green-50 text-green-700 border-green-200' },
    differential: { label: 'تشخيص تفريقي', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  };
  const confidenceConfig: Record<string, string> = { low: 'text-gray-400', medium: 'text-amber-500', high: 'text-green-500' };

  if (selectedCase) {
    const uc = urgencyConfig[selectedCase.urgency] || urgencyConfig.normal;
    const sc = statusConfig[selectedCase.status] || statusConfig.open;
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 h-16">
            <button onClick={() => setSelectedCase(null)} className="text-sm text-gray-500 font-medium">عودة</button>
            <h1 className="text-base font-bold text-gray-800">تفاصيل الحالة</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Case header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className={`px-4 py-3 ${selectedCase.urgency === 'critical' ? 'bg-red-50' : selectedCase.urgency === 'high' ? 'bg-amber-50' : 'bg-blue-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${sc.cls}`}>{sc.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${uc.cls}`}>{uc.label}</span>
                  <h3 className="font-black text-gray-800 text-sm">{selectedCase.chief_complaint}</h3>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{new Date(selectedCase.created_at).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' })}</span>
                <span>•</span>
                <span>بواسطة {selectedCase.doctor_name}</span>
                <span>•</span>
                <span>{selectedCase.specialization_name}</span>
              </div>

              {selectedCase.patient_age && (
                <div className="flex gap-2 flex-wrap">
                  {selectedCase.patient_age && <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">العمر: {selectedCase.patient_age}</span>}
                  {selectedCase.patient_gender && <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">الجنس: {selectedCase.patient_gender === 'male' ? 'ذكر' : 'أنثى'}</span>}
                  {selectedCase.patient_blood_type && <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">فصيلة: {selectedCase.patient_blood_type}</span>}
                  {selectedCase.duration && <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg">المدة: {selectedCase.duration}</span>}
                </div>
              )}

              {selectedCase.symptoms && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 text-right">الأعراض</p>
                  <p className="text-sm text-gray-700 text-right leading-relaxed">{selectedCase.symptoms}</p>
                </div>
              )}
              {selectedCase.current_diagnosis && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-600 mb-1 text-right font-medium">التشخيص الحالي</p>
                  <p className="text-sm text-gray-800 text-right font-bold">{selectedCase.current_diagnosis}</p>
                </div>
              )}
              {selectedCase.treatments_tried && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 text-right">العلاجات السابقة</p>
                  <p className="text-sm text-gray-700 text-right">{selectedCase.treatments_tried}</p>
                </div>
              )}
              {selectedCase.lab_results && (
                <div>
                  <p className="text-xs text-gray-500 mb-1 text-right">نتائج الفحوصات</p>
                  <p className="text-sm text-gray-700 text-right">{selectedCase.lab_results}</p>
                </div>
              )}
              {selectedCase.notes && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs text-amber-600 mb-1 text-right font-medium">ملاحظات الطبيب</p>
                  <p className="text-sm text-gray-700 text-right">{selectedCase.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Replies */}
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-3 text-right">ردود الأطباء ({replies.length})</h3>
            {replies.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
                <MessageSquare size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">لا توجد ردود بعد — كن أول من يرد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {replies.map(r => {
                  const rtc = replyTypeConfig[r.reply_type] || replyTypeConfig.diagnosis;
                  return (
                    <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {r.is_helpful && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><ThumbsUp size={10} />مفيد</span>}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${rtc.cls}`}>{rtc.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{r.doctor_specialization}</span>
                          <span className="text-sm font-bold text-gray-800">{r.doctor_name}</span>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2196F3] to-[#1565C0] flex items-center justify-center text-white text-xs font-bold">{r.doctor_name.charAt(2)}</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 text-right leading-relaxed mb-2">{r.body}</p>
                      {r.suggested_diagnosis && (
                        <div className="bg-blue-50 rounded-xl p-2.5 mb-2">
                          <p className="text-xs text-blue-600 text-right">التشخيص المقترح: <span className="font-bold text-gray-800">{r.suggested_diagnosis}</span></p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        {!r.is_helpful ? (
                          <button onClick={() => markHelpful(r.id)} className="text-xs text-gray-400 flex items-center gap-1"><ThumbsUp size={12} />تمييز كمفيد</button>
                        ) : <span />}
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">مستوى الثقة:</span>
                          <span className={`text-xs font-bold ${confidenceConfig[r.confidence_level] || confidenceConfig.medium}`}>{r.confidence_level === 'high' ? 'عالي' : r.confidence_level === 'medium' ? 'متوسط' : 'منخفض'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reply form */}
          {selectedCase.status !== 'resolved' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <h3 className="font-bold text-gray-800 text-sm text-right">أضف رأيك</h3>
              <div className="flex gap-2 flex-wrap">
                {(['diagnosis', 'differential', 'suggestion', 'question'] as const).map(t => (
                  <button key={t} onClick={() => setReplyType(t)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold border-2 transition-all ${replyType === t ? `${replyTypeConfig[t].cls} border-current` : 'bg-gray-50 text-gray-400 border-transparent'}`}>
                    {replyTypeConfig[t].label}
                  </button>
                ))}
              </div>
              <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} rows={3} dir="rtl" placeholder="اكتب رأيك التشخيصي..."
                className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3] resize-none" />
              <input value={suggestedDiagnosis} onChange={e => setSuggestedDiagnosis(e.target.value)} dir="rtl" placeholder="التشخيص المقترح (اختياري)"
                className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3]" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">مستوى الثقة:</span>
                {(['low', 'medium', 'high'] as const).map(c => (
                  <button key={c} onClick={() => setConfidence(c)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${confidence === c ? `${confidenceConfig[c].replace('text', 'bg').replace('-400', '-100').replace('-500', '-100')} ${confidenceConfig[c]}` : 'bg-gray-50 text-gray-400'}`}>
                    {c === 'high' ? 'عالي' : c === 'medium' ? 'متوسط' : 'منخفض'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={resolveCase} className="flex-1 py-3 bg-green-50 text-green-700 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5"><CheckCircle size={16} />حل الحالة</button>
                <button onClick={sendReply} disabled={!replyBody.trim() || sendingReply}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 ${replyBody.trim() ? 'bg-[#2196F3] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {sendingReply ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><Send size={16} />إرسال</>}
                </button>
              </div>
            </div>
          )}

          {selectedCase.status === 'resolved' && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <CheckCircle size={32} className="mx-auto text-green-600 mb-2" />
              <p className="font-bold text-green-700">تم حل هذه الحالة</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-l from-[#2196F3] to-[#1565C0] rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Users2 size={24} className="text-white" />
          </div>
          <div className="flex-1 text-right">
            <h3 className="font-bold text-white">غرفة استشارة الأطباء</h3>
            <p className="text-white/70 text-xs mt-0.5">مناقشة الحالات المستعصية مع الأطباء</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2196F3]" /></div>
      ) : cases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <MessageSquare size={40} className="mx-auto text-gray-200 mb-2" />
          <p className="text-gray-400">لا توجد حالات استشارة حالياً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map(c => {
            const uc = urgencyConfig[c.urgency] || urgencyConfig.normal;
            const sc = statusConfig[c.status] || statusConfig.open;
            return (
              <button key={c.id} onClick={() => openCase(c)} className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-right">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${sc.cls}`}>{sc.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${uc.cls}`}>{uc.label}</span>
                    <h3 className="font-bold text-gray-800 text-sm">{c.chief_complaint}</h3>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-right mb-2 line-clamp-2">{c.symptoms}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' })}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{c.specialization_name}</span>
                    <span className="text-xs text-gray-500">• {c.doctor_name}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export function DoctorDashboard() {
  const { logout } = useAuth();
  const [activeView, setActiveView] = useState<'today' | 'monthly' | 'consult' | 'library' | 'messages' | 'report'>('today');
  const [todayAppts, setTodayAppts] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [examiningAppt, setExaminingAppt] = useState<Appointment | null>(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, cancelled: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('appointments').select('*').eq('appointment_date', today).order('queue_number', { ascending: true });
      const list = data && data.length > 0 ? (data as Appointment[]) : getDemoAppts();
      setTodayAppts(list);
      setStats({ total: list.length, completed: list.filter(a => a.status === 'completed').length, pending: list.filter(a => ['pending', 'confirmed'].includes(a.status)).length, cancelled: list.filter(a => a.status === 'cancelled').length });
    } catch {
      const demo = getDemoAppts();
      setTodayAppts(demo);
      setStats({ total: demo.length, completed: demo.filter(a => a.status === 'completed').length, pending: demo.filter(a => ['pending', 'confirmed'].includes(a.status)).length, cancelled: demo.filter(a => a.status === 'cancelled').length });
    } finally { setIsLoading(false); }
  };

  const getDemoAppts = (): Appointment[] => [
    { id: '1', patient_id: '1', doctor_id: '1', clinic_id: '1', appointment_date: new Date().toISOString().split('T')[0], queue_number: 1, estimated_time: '09:00', status: 'completed', payment_status: 'paid', symptoms: 'ألم في الصدر وضيق تنفس', is_emergency: false, created_at: new Date().toISOString() },
    { id: '2', patient_id: '2', doctor_id: '1', clinic_id: '1', appointment_date: new Date().toISOString().split('T')[0], queue_number: 2, estimated_time: '09:20', status: 'in_progress', payment_status: 'paid', symptoms: 'كحة مستمرة وحرارة', is_emergency: false, created_at: new Date().toISOString() },
    { id: '3', patient_id: '3', doctor_id: '1', clinic_id: '1', appointment_date: new Date().toISOString().split('T')[0], queue_number: 3, estimated_time: '09:40', status: 'confirmed', payment_status: 'paid', symptoms: 'صداع نصفي شديد', is_emergency: true, created_at: new Date().toISOString() },
    { id: '4', patient_id: '4', doctor_id: '1', clinic_id: '1', appointment_date: new Date().toISOString().split('T')[0], queue_number: 4, estimated_time: '10:00', status: 'confirmed', payment_status: 'pending', symptoms: 'غثيان وآلام بطن', is_emergency: false, created_at: new Date().toISOString() },
    { id: '5', patient_id: '5', doctor_id: '1', clinic_id: '1', appointment_date: new Date().toISOString().split('T')[0], queue_number: 5, estimated_time: '10:20', status: 'pending', payment_status: 'pending', symptoms: 'آلام مفاصل', is_emergency: false, created_at: new Date().toISOString() },
  ];

  const openExam = (a: Appointment) => setExaminingAppt(a);

  const closeExam = async () => {
    if (examiningAppt) {
      try { await supabase.from('appointments').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', examiningAppt.id); } catch {}
      setTodayAppts(p => p.map(a => a.id === examiningAppt.id ? { ...a, status: 'completed' } : a));
    }
    setExaminingAppt(null);
    loadData();
  };

  if (examiningAppt) return <ExaminationPanel appointment={examiningAppt} onClose={closeExam} />;

  const statusMap: Record<string, { label: string; cls: string; dotCls: string }> = {
    completed: { label: 'مكتمل', cls: 'bg-green-100 text-green-700', dotCls: 'bg-green-500' },
    in_progress: { label: 'جاري الكشف', cls: 'bg-blue-100 text-[#2196F3]', dotCls: 'bg-[#2196F3] animate-pulse' },
    confirmed: { label: 'في الانتظار', cls: 'bg-amber-100 text-amber-700', dotCls: 'bg-amber-500' },
    pending: { label: 'لم يصل', cls: 'bg-gray-100 text-gray-600', dotCls: 'bg-gray-400' },
    cancelled: { label: 'ملغي', cls: 'bg-red-100 text-red-600', dotCls: 'bg-red-500' },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={logout} className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-2 rounded-xl">
            <LogOut size={18} /><span className="text-sm font-medium">خروج</span>
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-gray-800">لوحة الطبيب</h1>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString('ar-YE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <div className="px-4 pt-4">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          {[{ id: 'today', label: 'اليوم' }, { id: 'monthly', label: 'الشهري' }, { id: 'consult', label: 'استشارة' }, { id: 'library', label: 'مكتبة' }, { id: 'messages', label: 'رسائل' }, { id: 'report', label: 'تقرير' }].map(t => (
            <button key={t.id} onClick={() => setActiveView(t.id as any)} className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeView === t.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>{t.label}</button>
          ))}
        </div>

        {/* Today */}
        {activeView === 'today' && (
          <>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[{ v: stats.total, l: 'إجمالي', c: 'text-gray-800' }, { v: stats.completed, l: 'تمت', c: 'text-green-600' }, { v: stats.pending, l: 'متبقي', c: 'text-amber-600' }, { v: stats.cancelled, l: 'ملغي', c: 'text-red-500' }].map(({ v, l, c }) => (
                <div key={l} className="bg-white rounded-xl p-3 text-center shadow-sm"><p className={`text-2xl font-bold ${c}`}>{v}</p><p className="text-xs text-gray-400">{l}</p></div>
              ))}
            </div>

            <button className="w-full bg-red-600 text-white rounded-2xl p-4 mb-5 flex items-center justify-center gap-3 shadow-lg">
              <AlertCircle size={22} /><span className="font-bold">حالة طارئة — إدخال مباشر</span>
            </button>

            <h3 className="font-bold text-gray-800 mb-3 text-sm">حجوزات اليوم</h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2196F3]" /></div>
            ) : (
              <div className="space-y-2">
                {todayAppts.map(appt => {
                  const st = statusMap[appt.status] || statusMap.pending;
                  const pt = demoPatients[appt.patient_id];
                  const isActive = appt.status === 'in_progress';
                  const canExamine = appt.status === 'in_progress' || appt.status === 'confirmed';

                  return (
                    <div key={appt.id} className={`bg-white rounded-2xl border shadow-sm ${isActive ? 'border-[#2196F3] ring-1 ring-[#2196F3]/20' : appt.is_emergency ? 'border-red-300' : 'border-gray-100'} ${appt.status === 'completed' ? 'opacity-60' : ''}`}>
                      <div className="flex items-center gap-3 p-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 ${isActive ? 'bg-[#2196F3]' : appt.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}>
                          #{appt.queue_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dotCls}`} />
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                            {appt.is_emergency && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1"><AlertCircle size={10} />طارئ</span>}
                          </div>
                          <p className="text-sm font-bold text-gray-800 truncate">{pt?.full_name || `مريض ${appt.queue_number}`}</p>
                          <p className="text-xs text-gray-500 truncate">{appt.symptoms}</p>
                          {pt && <p className="text-xs text-gray-400">{pt.age} سنة • {pt.blood_type}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs text-gray-400">{appt.estimated_time}</span>
                          {canExamine && (
                            <button onClick={() => openExam(appt)} className={`text-xs px-3 py-1.5 rounded-lg font-bold ${isActive ? 'bg-[#2196F3] text-white' : 'bg-gray-100 text-gray-700'}`}>
                              {isActive ? 'معاينة الآن' : 'فحص'}
                            </button>
                          )}
                          {appt.status === 'completed' && (
                            <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} />تمت</span>
                          )}
                        </div>
                      </div>
                      {/* Active patient — 3 action buttons */}
                      {isActive && (
                        <div className="border-t border-gray-100 px-3 pb-3 pt-2 grid grid-cols-3 gap-2">
                          <button onClick={() => { setExaminingAppt(appt); setTimeout(() => {}, 0); }} className="bg-[#2196F3] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><FileText size={13} />وصفة</button>
                          <button onClick={() => { setExaminingAppt(appt); }} className="bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><FlaskConical size={13} />فحوصات</button>
                          <button onClick={() => { setExaminingAppt(appt); }} className="bg-amber-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><Clipboard size={13} />الملف</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Monthly */}
        {activeView === 'monthly' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gradient-to-br from-[#2196F3] to-[#1565C0] rounded-2xl p-5 text-white">
                <p className="text-white/80 text-sm">إجمالي الشهر</p>
                <p className="text-3xl font-bold mt-1">145</p>
                <div className="flex items-center gap-1 mt-2 text-white/80"><TrendingUp size={14} /><span className="text-sm">+15%</span></div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <p className="text-gray-500 text-sm">متوسط يومي</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">12</p>
                <p className="text-sm text-gray-400 mt-2">حجز / يوم</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4 text-sm text-right">أكثر الأعراض شيوعاً</h3>
              {[{ s: 'ألم بطن', n: 25 }, { s: 'صداع', n: 20 }, { s: 'ضيق تنفس', n: 15 }, { s: 'حرارة', n: 12 }].map((item, i) => (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-[#2196F3] font-bold text-xs">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm text-right">{item.s}</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1"><div className="bg-[#2196F3] rounded-full h-1.5" style={{ width: `${(item.n / 25) * 100}%` }} /></div>
                  </div>
                  <span className="text-gray-500 text-sm">{item.n}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Consultation Room */}
        {activeView === 'consult' && <ConsultationRoom />}

        {/* Medical Library */}
        {activeView === 'library' && <MedicalLibrary />}

        {/* Doctor Messages */}
        {activeView === 'messages' && <DoctorMessages />}

        {/* Report */}
        {activeView === 'report' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3 text-sm text-right">ملخص الشهر</h3>
              <div className="space-y-3">
                {[['إجمالي المرضى', '145'], ['معدل الإلغاء', '5%'], ['حالات طارئة', '12'], ['نسبة النمو', '+15%'], ['التقييم العام', '4.8 / 5']].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="font-medium text-gray-500 text-sm">{v}</span>
                    <span className="text-gray-700 text-sm">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full bg-[#2196F3] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"><Download size={18} />تحميل تقرير PDF</button>
          </div>
        )}
      </div>
    </div>
  );
}
