import React, { useState } from 'react';
import {
  LogOut, User, MapPin, Phone, CheckCircle, Clock, X, Plus,
  Shield, Award, FileText, BarChart2, AlertCircle,
  Navigation, Send, ArrowUpCircle, Stethoscope, Building2,
  Clipboard, Camera, Star, TrendingUp, Bell, Activity,
  UserCheck, ChevronRight, Edit3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ReferralModal, type ReferralFromRole, type ReferralResult } from '../components/common/ReferralModal';

// ─── Types ────────────────────────────────────────────────────────────────────
type NurseTab = 'requests' | 'referrals' | 'report' | 'profile';
type NurseRole = 'nurse' | 'gp';

interface ServiceRequest {
  id: string; patient_name: string; patient_phone: string;
  service_type: string; address: string; notes: string;
  payment_method: string; price: number; status: string;
  created_at: string;
}

interface ReferralRecord {
  id: string; to_type: string; to_name: string; specialty?: string;
  patient_name: string; reason: string; urgency: string;
  referral_type?: string; procedure_name?: string;
  status: string; created_at: string;
}

const serviceTypeLabels: Record<string, string> = {
  injection: 'حقن / إبر', stitches: 'خياطة جراحية', dressing: 'تنظيف مجارح',
  blood_draw: 'سحب دم', iv_therapy: 'محاليل وريدية', cast: 'تبديل جبيرة',
  other: 'إجراء آخر', consultation: 'استشارة طبية', followup: 'متابعة',
};

const demoNurseRequests: ServiceRequest[] = [
  { id: '1', patient_name: 'أحمد محمد الأغبري', patient_phone: '777123456', service_type: 'injection', address: 'حي حدة، شارع 30، مقابل مسجد النور', notes: 'حقنة وريدية يومية', payment_method: 'cash', price: 2500, status: 'pending', created_at: new Date().toISOString() },
  { id: '2', patient_name: 'فاطمة علي المقطري', patient_phone: '777234567', service_type: 'dressing', address: 'حي الجراف، بجوار صيدلية الصحة', notes: 'تغيير ضمادة جرح عملية', payment_method: 'mtn', price: 3000, status: 'accepted', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', patient_name: 'خالد عبدالله الشامي', patient_phone: '777345678', service_type: 'iv_therapy', address: 'شارع الزبيري', notes: 'محلول ملحي + 5 أمبولات', payment_method: 'cash', price: 5000, status: 'completed', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', patient_name: 'نورا يحيى الحيمي', patient_phone: '777456789', service_type: 'blood_draw', address: 'حدة، بلوك G، شقة 4', notes: 'سحب عينة دم للمختبر', payment_method: 'cash', price: 2000, status: 'pending', created_at: new Date(Date.now() - 1800000).toISOString() },
];

const demoGPRequests: ServiceRequest[] = [
  { id: 'g1', patient_name: 'سالم عبدالرحمن الزبيدي', patient_phone: '777567890', service_type: 'consultation', address: 'حي الروضة، عمارة النيل', notes: 'ارتفاع حرارة مستمر', payment_method: 'cash', price: 3000, status: 'pending', created_at: new Date().toISOString() },
  { id: 'g2', patient_name: 'ليلى محمد الأغبري', patient_phone: '777678901', service_type: 'followup', address: 'صنعاء القديمة', notes: 'متابعة ضغط الدم', payment_method: 'mtn', price: 2500, status: 'accepted', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'g3', patient_name: 'عمر سالم الحيمي', patient_phone: '777789012', service_type: 'consultation', address: 'حي الحصبة', notes: 'آلام صدر', payment_method: 'cash', price: 3000, status: 'pending', created_at: new Date(Date.now() - 1800000).toISOString() },
];

const demoReferrals: ReferralRecord[] = [
  { id: 'r1', to_type: 'specialist', to_name: 'أخصائي قلب', specialty: 'قلب وأوعية دموية', patient_name: 'سالم عبدالرحمن', reason: 'ألم صدري مشتبه', urgency: 'urgent', status: 'accepted', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'r2', to_type: 'hospital', to_name: 'مستشفى الثورة', patient_name: 'ليلى الحيمي', reason: 'نزيف شديد يستدعي تدخل عاجل', urgency: 'emergency', referral_type: 'operation', procedure_name: 'قيصرية طارئة', status: 'pending', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'r3', to_type: 'gp', to_name: 'د. أحمد العمري', patient_name: 'محمد الزبيدي', reason: 'حالة لا تستدعي تخصصاً، متابعة طبيب عام', urgency: 'routine', status: 'completed', created_at: new Date(Date.now() - 172800000).toISOString() },
];

// ─── Request Card ─────────────────────────────────────────────────────────────
function RequestCard({ req, onAccept, onComplete, onRefer }: {
  req: ServiceRequest;
  onAccept: (id: string) => void;
  onComplete: (id: string) => void;
  onRefer: (req: ServiceRequest) => void;
}) {
  const stMap: Record<string, { label: string; cls: string; dot: string }> = {
    pending:   { label: 'طلب جديد', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500 animate-pulse' },
    accepted:  { label: 'مقبول', cls: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    en_route:  { label: 'في الطريق', cls: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500' },
    completed: { label: 'مكتمل', cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    referred:  { label: 'محوَّل', cls: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    cancelled: { label: 'ملغي', cls: 'bg-red-100 text-red-600', dot: 'bg-red-400' },
  };
  const st = stMap[req.status] || stMap.pending;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${req.status === 'pending' ? 'border-amber-200' : 'border-gray-100'}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <User size={22} className="text-[#2196F3]" />
          </div>
          <div className="flex-1 text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${st.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
              </span>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {serviceTypeLabels[req.service_type] || req.service_type}
              </span>
            </div>
            <p className="font-bold text-gray-800">{req.patient_name}</p>
            <a href={`tel:${req.patient_phone}`} className="text-xs text-blue-600 flex items-center gap-1 justify-end mt-0.5">
              <Phone size={11} />{req.patient_phone}
            </a>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 justify-end">
              <MapPin size={11} className="flex-shrink-0" /><span className="truncate">{req.address}</span>
            </p>
            {req.notes && <p className="text-xs text-gray-400 mt-0.5 bg-gray-50 rounded-lg px-2 py-1">{req.notes}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span className="font-bold text-gray-800">{req.price.toLocaleString('ar')} ر.ي</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{req.payment_method === 'mtn' ? 'MTN' : 'كاش'}</span>
            <a href={`https://www.google.com/maps/search/${encodeURIComponent(req.address)}`}
              target="_blank" rel="noreferrer"
              className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <Navigation size={15} className="text-[#2196F3]" />
            </a>
          </div>
        </div>
      </div>
      {(req.status === 'pending' || req.status === 'accepted') && (
        <div className="flex gap-2 px-4 pb-4">
          <button onClick={() => onRefer(req)}
            className="flex-1 py-2.5 rounded-xl bg-purple-100 text-purple-700 text-sm font-bold flex items-center justify-center gap-1.5">
            <ArrowUpCircle size={15} />تحويل
          </button>
          {req.status === 'pending' ? (
            <button onClick={() => onAccept(req.id)}
              className="flex-1 py-2.5 rounded-xl bg-[#2196F3] text-white text-sm font-bold flex items-center justify-center gap-1.5">
              <CheckCircle size={15} />قبول
            </button>
          ) : (
            <button onClick={() => onComplete(req.id)}
              className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold flex items-center justify-center gap-1.5">
              <CheckCircle size={15} />إتمام
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileSection({ role }: { role: NurseRole }) {
  const [name, setName] = useState(role === 'gp' ? 'د. سعيد محمد الهمداني' : 'محمد يحيى الأغبري');
  const [license, setLicense] = useState(role === 'gp' ? 'DOC-2024-5512' : 'NUR-2024-8821');
  const [spec, setSpec] = useState(role === 'gp' ? 'طب عام وعائلي' : 'تمريض عام');
  const [experience, setExperience] = useState(role === 'gp' ? '12' : '7');
  const [area, setArea] = useState('صنعاء — حدة والجراف والسبعين');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const qualifications = role === 'gp'
    ? [{ label: 'بكالوريوس طب وجراحة — جامعة صنعاء', year: '2012' }, { label: 'دبلوم صحة المجتمع', year: '2016' }, { label: 'شهادة الطب العائلي', year: '2020' }]
    : [{ label: 'بكالوريوس تمريض — جامعة صنعاء', year: '2017' }, { label: 'دبلوم عناية مركزة', year: '2020' }, { label: 'شهادة إسعافات أولية ACLS', year: '2022' }];

  const certs = [
    { label: role === 'gp' ? 'ترخيص مزاولة الطب — وزارة الصحة' : 'شهادة تمريض وزارة الصحة', status: 'فعّالة' },
    { label: role === 'gp' ? 'نقابة الأطباء اليمنيين' : 'ترخيص مزاولة مهنة التمريض', status: 'فعّالة' },
    { label: role === 'gp' ? 'شهادة إسعاف طارئ ATLS' : 'نقابة الممرضين اليمنيين', status: 'فعّالة' },
  ];

  const save = async () => {
    setSaving(true);
    try {
      await supabase.from('nurse_profiles').upsert({
        user_id: `demo_${role}`, full_name: name, license_number: license,
        specialization: spec, years_experience: parseInt(experience) || 0, service_area: area,
      }, { onConflict: 'user_id' });
    } catch {}
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="px-4 pt-4 pb-12 space-y-4">
      <div className={`bg-gradient-to-b ${role === 'gp' ? 'from-green-600 to-green-800' : 'from-[#2196F3] to-[#1565C0]'} rounded-2xl p-6 text-center text-white`}>
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 relative">
          {role === 'gp' ? <Stethoscope size={38} className="text-white" /> : <User size={38} className="text-white" />}
          <button className="absolute -bottom-1 -left-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow">
            <Camera size={13} className={role === 'gp' ? 'text-green-600' : 'text-[#2196F3]'} />
          </button>
        </div>
        <p className="font-bold text-lg">{name}</p>
        <p className="text-white/80 text-sm">{spec}</p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold">4.9</span>
          <span className="text-white/60 text-xs">(83 تقييم)</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
        <h3 className="font-bold text-gray-800 text-right mb-1">البيانات الشخصية</h3>
        {[
          { label: 'الاسم الكامل', val: name, set: setName },
          { label: 'رقم الترخيص', val: license, set: setLicense },
          { label: 'التخصص', val: spec, set: setSpec },
          { label: 'سنوات الخبرة', val: experience, set: setExperience, type: 'number' },
          { label: 'منطقة الخدمة', val: area, set: setArea },
        ].map(({ label, val, set, type }) => (
          <div key={label}>
            <label className="text-xs text-gray-500 block mb-1 text-right">{label}</label>
            <input type={type || 'text'} value={val} onChange={e => set(e.target.value)} dir="rtl"
              className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3]" />
          </div>
        ))}
        <button onClick={save} disabled={saving}
          className={`w-full py-3.5 rounded-2xl font-bold transition-all ${saved ? 'bg-green-600 text-white' : 'bg-[#2196F3] text-white'}`}>
          {saved ? '✓ تم الحفظ' : saving ? 'جاري الحفظ...' : 'حفظ البيانات'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 text-right mb-3 flex items-center gap-2 justify-end">
          <Award size={16} className="text-amber-500" />المؤهلات العلمية
        </h3>
        {qualifications.map((q, i) => (
          <div key={i} className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3 mb-2">
            <span className="text-xs text-amber-600 font-medium">{q.year}</span>
            <p className="text-sm text-gray-700 text-right">{q.label}</p>
          </div>
        ))}
        <button className="mt-2 w-full py-2.5 border-2 border-dashed border-amber-200 rounded-xl text-amber-600 font-medium text-sm flex items-center justify-center gap-2">
          <Plus size={15} />إضافة مؤهل
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 text-right mb-3 flex items-center gap-2 justify-end">
          <Shield size={16} className="text-green-600" />التصاريح والشهادات
        </h3>
        {certs.map((c, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-green-700 bg-green-100">{c.status}</span>
            <p className="text-sm text-gray-700 text-right">{c.label}</p>
          </div>
        ))}
        <button className="mt-2 w-full py-2.5 border-2 border-dashed border-green-200 rounded-xl text-green-600 font-medium text-sm flex items-center justify-center gap-2">
          <Plus size={15} />رفع شهادة جديدة
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
export function NurseDashboard() {
  const { logout } = useAuth();
  const [nurseRole, setNurseRole] = useState<NurseRole | null>(null);
  const [activeTab, setActiveTab] = useState<NurseTab>('requests');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>(demoReferrals);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referringReq, setReferringReq] = useState<ServiceRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'completed'>('all');
  const [notifSent, setNotifSent] = useState<string | null>(null);

  // Role selector
  if (!nurseRole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2196F3] to-[#1565C0] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-lg">
          <Activity size={36} className="text-[#2196F3]" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">لوحة مقدم الخدمة</h1>
        <p className="text-white/70 text-sm mb-8 text-center">اختر دورك لمتابعة</p>
        <div className="w-full max-w-sm space-y-3">
          {([
            { role: 'nurse' as NurseRole, label: 'ممرض / ممرضة', desc: 'تقديم الرعاية التمريضية المنزلية', icon: Activity, color: 'from-[#2196F3] to-[#1565C0]' },
            { role: 'gp' as NurseRole, label: 'طبيب عام', desc: 'الزيارات المنزلية والاستشارات', icon: Stethoscope, color: 'from-green-600 to-green-800' },
          ]).map(({ role, label, desc, icon: Icon, color }) => (
            <button key={role} onClick={() => { setNurseRole(role); setRequests(role === 'gp' ? demoGPRequests : demoNurseRequests); }}
              className={`w-full bg-gradient-to-l ${color} rounded-2xl p-5 flex items-center gap-4 text-white shadow-lg`}>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Icon size={24} className="text-white" />
              </div>
              <div className="text-right flex-1">
                <p className="font-black text-lg">{label}</p>
                <p className="text-white/80 text-xs">{desc}</p>
              </div>
              <ChevronRight size={20} className="text-white/60 flex-shrink-0" />
            </button>
          ))}
        </div>
        <button onClick={logout} className="mt-8 flex items-center gap-2 text-white/60 text-sm">
          <LogOut size={16} />تسجيل خروج
        </button>
      </div>
    );
  }

  const isGP = nurseRole === 'gp';
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const fromRole: ReferralFromRole = isGP ? 'gp' : 'nurse';

  const handleAccept = async (id: string) => {
    try { await supabase.from('nurse_service_requests').update({ status: 'accepted' }).eq('id', id); } catch {}
    setRequests(p => p.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
    const req = requests.find(r => r.id === id);
    setNotifSent(`تم قبول الطلب وإشعار ${req?.patient_name}`);
    setTimeout(() => setNotifSent(null), 3000);
  };

  const handleComplete = async (id: string) => {
    try { await supabase.from('nurse_service_requests').update({ status: 'completed' }).eq('id', id); } catch {}
    setRequests(p => p.map(r => r.id === id ? { ...r, status: 'completed' } : r));
  };

  const handleRefer = (req: ServiceRequest) => { setReferringReq(req); setShowReferralModal(true); };

  const handleReferralSuccess = (result: ReferralResult) => {
    const newRef: ReferralRecord = {
      id: result.id, to_type: result.to_type, to_name: result.to_name,
      specialty: result.specialty, patient_name: result.patient_name,
      reason: result.reason, urgency: result.urgency,
      referral_type: result.referral_type, procedure_name: result.procedure_name,
      status: 'pending', created_at: result.created_at,
    };
    setReferrals(p => [newRef, ...p]);
    if (referringReq) setRequests(p => p.map(r => r.id === referringReq.id ? { ...r, status: 'referred' } : r));
    setNotifSent(`تم إرسال التحويل وإشعار ${result.patient_name}`);
    setTimeout(() => setNotifSent(null), 4000);
    setShowReferralModal(false);
    setReferringReq(null);
  };

  const filteredRequests = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);

  const tabs: { id: NurseTab; icon: React.ElementType; label: string }[] = [
    { id: 'requests', icon: Clipboard, label: 'الطلبات' },
    { id: 'referrals', icon: ArrowUpCircle, label: 'التحويلات' },
    { id: 'report', icon: BarChart2, label: 'التقرير' },
    { id: 'profile', icon: User, label: 'ملفي' },
  ];

  const urgencyMap: Record<string, { label: string; cls: string }> = {
    routine: { label: 'روتيني', cls: 'bg-gray-100 text-gray-600' },
    urgent: { label: 'عاجل', cls: 'bg-amber-100 text-amber-700' },
    emergency: { label: 'طارئ', cls: 'bg-red-100 text-red-700' },
  };
  const statusRefMap: Record<string, { label: string; cls: string }> = {
    pending: { label: 'في الانتظار', cls: 'bg-blue-100 text-blue-700' },
    accepted: { label: 'مقبول', cls: 'bg-green-100 text-green-700' },
    rejected: { label: 'مرفوض', cls: 'bg-red-100 text-red-600' },
    completed: { label: 'مكتمل', cls: 'bg-gray-100 text-gray-600' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification toast */}
      {notifSent && (
        <div className="fixed top-4 left-4 right-4 z-[70] bg-green-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-xl">
          <Bell size={18} />
          <p className="font-bold text-sm flex-1">{notifSent}</p>
          <button onClick={() => setNotifSent(null)}><X size={16} /></button>
        </div>
      )}

      {/* Header */}
      <header className={`bg-gradient-to-l ${isGP ? 'from-green-700 to-green-900' : 'from-[#2196F3] to-[#1565C0]'} px-4 pt-10 pb-16`}>
        <div className="flex items-center justify-between">
          <button onClick={() => setNurseRole(null)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <LogOut size={18} className="text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold text-lg">{isGP ? 'لوحة الطبيب العام' : 'لوحة الممرض'}</h1>
            <p className="text-white/80 text-xs mt-0.5">{new Date().toLocaleDateString('ar-YE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="w-10 relative">
            {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">{pendingCount}</span>}
            <Bell size={22} className="text-white mx-auto" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-5">
          {[
            { label: 'إجمالي', val: requests.length },
            { label: 'جديد', val: requests.filter(r => r.status === 'pending').length },
            { label: 'مقبول', val: requests.filter(r => r.status === 'accepted').length },
            { label: 'مكتمل', val: requests.filter(r => r.status === 'completed').length },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-white font-black text-xl">{val}</p>
              <p className="text-white/80 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white sticky top-0 z-40 shadow-sm -mt-1">
        <div className="flex">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium border-b-2 transition-colors ${activeTab === id ? `${isGP ? 'border-green-700 text-green-700' : 'border-[#2196F3] text-[#2196F3]'}` : 'border-transparent text-gray-400'}`}>
              <Icon size={17} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── REQUESTS ── */}
      {activeTab === 'requests' && (
        <div className="px-4 pt-4 pb-12 space-y-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {(['all', 'pending', 'accepted', 'completed'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all ${filterStatus === s ? `${isGP ? 'bg-green-700' : 'bg-[#2196F3]'} text-white` : 'bg-white text-gray-600 border border-gray-200'}`}>
                {s === 'all' ? 'الكل' : s === 'pending' ? 'جديد' : s === 'accepted' ? 'مقبول' : 'مكتمل'}
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-16">
              <Clipboard size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">لا توجد طلبات في هذا القسم</p>
            </div>
          ) : (
            filteredRequests.map(req => (
              <RequestCard key={req.id} req={req} onAccept={handleAccept} onComplete={handleComplete} onRefer={handleRefer} />
            ))
          )}
        </div>
      )}

      {/* ── REFERRALS ── */}
      {activeTab === 'referrals' && (
        <div className="px-4 pt-4 pb-12 space-y-3">
          <button onClick={() => setShowReferralModal(true)}
            className={`w-full ${isGP ? 'bg-gradient-to-l from-green-700 to-green-900' : 'bg-gradient-to-l from-[#2196F3] to-[#1565C0]'} text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg`}>
            <ArrowUpCircle size={20} />إرسال تحويل جديد
          </button>

          {referrals.length === 0 ? (
            <div className="text-center py-10">
              <ArrowUpCircle size={48} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">لا توجد تحويلات بعد</p>
            </div>
          ) : (
            referrals.map(r => {
              const urg = urgencyMap[r.urgency] || urgencyMap.routine;
              const st = statusRefMap[r.status] || statusRefMap.pending;
              const toLabel = r.to_type === 'specialist' ? `أخصائي ${r.specialty || ''}` : r.to_type === 'gp' ? `طبيب عام — ${r.to_name}` : r.to_name;
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st.cls}`}>{st.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${urg.cls}`}>{urg.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{r.patient_name}</p>
                      <p className="text-xs text-gray-500">إلى: {toLabel}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    {(r.procedure_name || r.referral_type) && (
                      <div className="flex justify-end mb-2">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          {r.referral_type === 'operation' ? 'عملية: ' : r.referral_type === 'procedure' ? 'إجراء: ' : 'استشارة'}
                          {r.procedure_name}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 text-right bg-gray-50 rounded-xl px-3 py-2">{r.reason}</p>
                    <p className="text-xs text-gray-400 text-right mt-2">{new Date(r.created_at).toLocaleString('ar-YE')}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── REPORT ── */}
      {activeTab === 'report' && (
        <div className="px-4 pt-4 pb-12 space-y-4">
          <div className={`bg-gradient-to-br ${isGP ? 'from-green-700 to-green-900' : 'from-[#2196F3] to-[#1565C0]'} rounded-2xl p-5 text-white`}>
            <p className="text-white/80 text-sm text-right">التقرير الشهري</p>
            <p className="text-3xl font-black mt-1">{new Date().toLocaleDateString('ar-YE', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'إجمالي الإجراءات', val: 67, icon: Clipboard, color: 'text-blue-600 bg-blue-50' },
              { label: 'إجراءات مكتملة', val: 61, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
              { label: 'تحويلات أرسلتها', val: referrals.length, icon: ArrowUpCircle, color: 'text-purple-600 bg-purple-50' },
              { label: 'إيرادات الشهر', val: '183,500 ر.ي', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
            ].map(({ label, val, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className={`w-10 h-10 ${color.split(' ')[1]} rounded-xl flex items-center justify-center mb-2`}>
                  <Icon size={20} className={color.split(' ')[0]} />
                </div>
                <p className="text-xl font-black text-gray-800">{val}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 text-right mb-3">{isGP ? 'أكثر الحالات' : 'أكثر الإجراءات'}</h3>
            {(isGP
              ? [{ name: 'استشارة عامة', count: 30 }, { name: 'متابعة أمراض مزمنة', count: 18 }, { name: 'ضغط الدم', count: 12 }, { name: 'سكري', count: 7 }]
              : [{ name: 'حقن / إبر', count: 28 }, { name: 'محاليل وريدية', count: 17 }, { name: 'تنظيف مجارح', count: 12 }, { name: 'سحب دم', count: 10 }]
            ).map((item, i) => (
              <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
                <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-[#2196F3] font-bold text-xs">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`${isGP ? 'bg-green-600' : 'bg-[#2196F3]'} rounded-full h-1.5`} style={{ width: `${(item.count / 30) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className={`w-full ${isGP ? 'bg-green-700' : 'bg-[#2196F3]'} text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2`}>
            <FileText size={18} />تحميل تقرير PDF
          </button>
        </div>
      )}

      {/* ── PROFILE ── */}
      {activeTab === 'profile' && <ProfileSection role={nurseRole} />}

      {/* Referral Modal */}
      {showReferralModal && (
        <ReferralModal
          fromRole={fromRole}
          patientId={referringReq?.id}
          patientName={referringReq?.patient_name}
          onClose={() => { setShowReferralModal(false); setReferringReq(null); }}
          onSuccess={handleReferralSuccess}
        />
      )}
    </div>
  );
}
