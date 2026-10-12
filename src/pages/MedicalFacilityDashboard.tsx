import React, { useState, useEffect } from 'react';
import {
  LogOut, Building2, FlaskConical, Pill, Users, ClipboardList,
  BarChart2, CheckCircle, Clock, X, Plus, Phone, MapPin,
  AlertCircle, FileText, Star, TrendingUp, Settings, Bell,
  ChevronRight, Search, Filter, Send, Calendar, Activity,
  Package, ShieldCheck, ArrowUpCircle, User, Stethoscope, Droplets, Home, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ReferralModal } from '../components/common/ReferralModal';
import { LiteLabPortalView } from './LiteLabPortalView';
import { LitePharmacyPortalView } from './LitePharmacyPortalView';
import FacilityApp from '../facility_modules/FacilityApp';
import { StoreProvider } from '../facility_modules/store';
import { ReceptionScreen } from '../facility_modules/screens/ReceptionScreen';

// ─── Types ────────────────────────────────────────────────────────────────────
type FacilityType = 'hospital' | 'pharmacy' | 'lab';
type HospitalTab = 'referrals' | 'blood' | 'patients' | 'procedures' | 'reception' | 'report' | 'settings';
type PharmacyTab = 'prescriptions' | 'inventory' | 'pharmacy_portal' | 'report' | 'settings';
type LabTab = 'queue' | 'results' | 'lab_portal' | 'report' | 'settings';

// ─── Demo data ────────────────────────────────────────────────────────────────
const demoHospitalReferrals = [
  { id: 'hr1', patient_name: 'أحمد محمد الأغبري', patient_phone: '777123456', from_role: 'gp', referral_type: 'procedure', procedure_name: 'قسطرة قلبية', reason: 'ألم صدري متكرر مع اختبار إجهاد إيجابي', urgency: 'urgent', status: 'pending', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'hr2', patient_name: 'فاطمة علي المقطري', patient_phone: '777234567', from_role: 'specialist', referral_type: 'operation', procedure_name: 'استئصال مرارة', reason: 'حصوات مرارة متعددة مع نوبات مغص', urgency: 'routine', status: 'accepted', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'hr3', patient_name: 'خالد عبدالله الشامي', patient_phone: '777345678', from_role: 'nurse', referral_type: 'consultation', procedure_name: null, reason: 'نزيف شديد يستدعي تدخلاً عاجلاً', urgency: 'emergency', status: 'pending', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 'hr4', patient_name: 'نورا يحيى الحيمي', patient_phone: '777456789', from_role: 'specialist', referral_type: 'procedure', procedure_name: 'منظار معدة', reason: 'آلام معدة مزمنة مع نزول وزن', urgency: 'urgent', status: 'scheduled', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'hr5', patient_name: 'سالم عبدالرحمن الحكيمي', patient_phone: '777567890', from_role: 'hospital', referral_type: 'operation', procedure_name: 'جراحة قلب مفتوح', reason: 'تحويل من مستشفى الثورة لإجراء عملية قلب', urgency: 'urgent', status: 'pending', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
];

const demoPrescriptions = [
  { id: 'px1', prescription_code: 'RX-2026-008321', patient_name: 'أحمد محمد الأغبري', doctor_name: 'د. محمد العمري', diagnosis: 'التهاب الشعب الهوائية الحاد', medications: [{ name: 'أموكسيسيلين 500 مجم', qty: 14, price: 1200 }, { name: 'باراسيتامول 500 مجم', qty: 30, price: 600 }], total_price: 1800, status: 'pending', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 'px2', prescription_code: 'RX-2026-007544', patient_name: 'فاطمة سالم الزبيدي', doctor_name: 'د. أحمد الحيمي', diagnosis: 'ارتفاع ضغط الدم والسكري', medications: [{ name: 'ميتفورمين 500 مجم', qty: 60, price: 800 }, { name: 'أملوديبين 5 مجم', qty: 30, price: 1500 }], total_price: 2300, status: 'pending', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'px3', prescription_code: 'RX-2026-006130', patient_name: 'خالد نور المقطري', doctor_name: 'د. سالم الحيمي', diagnosis: 'ارتفاع دهون الدم', medications: [{ name: 'أتورفاستاتين 20 مجم', qty: 30, price: 2200 }], total_price: 2200, status: 'dispensed', created_at: new Date(Date.now() - 7200000).toISOString() },
];

const demoLabQueue = [
  { id: 'lq1', patient_name: 'محمد يحيى الأغبري', patient_phone: '777123456', test_names: ['صورة دم كاملة', 'وظائف كلى'], urgency: 'urgent', status: 'in_progress', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 'lq2', patient_name: 'عائشة عبدالله الحيمي', patient_phone: '777234567', test_names: ['HbA1c', 'سكر صيامي'], urgency: 'routine', status: 'pending', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'lq3', patient_name: 'سالم محمد الزبيدي', patient_phone: '777345678', test_names: ['وظائف كبد', 'هرمونات الغدة الدرقية'], urgency: 'routine', status: 'pending', created_at: new Date(Date.now() - 5400000).toISOString() },
  { id: 'lq4', patient_name: 'نورا يحيى المقطري', patient_phone: '777456789', test_names: ['مزرعة بول'], urgency: 'urgent', status: 'completed', results_data: 'لا نمو بكتيري — نتيجة سلبية', created_at: new Date(Date.now() - 86400000).toISOString() },
];

const demoInventory = [
  { id: 'inv-1', name: 'أموكسيسيلين 500 مجم', category: 'مضادات حيوية', qty: 450, min_qty: 100, unit: 'كبسولة', price: 85 },
  { id: 'inv-2', name: 'باراسيتامول 500 مجم', category: 'مسكنات', qty: 1200, min_qty: 200, unit: 'قرص', price: 20 },
  { id: 'inv-3', name: 'ميتفورمين 500 مجم', category: 'سكري', qty: 320, min_qty: 100, unit: 'قرص', price: 13 },
  { id: 'inv-4', name: 'أملوديبين 5 مجم', category: 'ضغط وقلب', qty: 85, min_qty: 100, unit: 'قرص', price: 50 },
  { id: 'inv-5', name: 'أتورفاستاتين 20 مجم', category: 'كوليسترول', qty: 200, min_qty: 80, unit: 'قرص', price: 73 },
  { id: 'inv-6', name: 'أوميبرازول 20 مجم', category: 'معدة', qty: 30, min_qty: 100, unit: 'كبسولة', price: 60 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const urgencyConfig: Record<string, { label: string; cls: string; dot: string }> = {
  routine:   { label: 'روتيني',  cls: 'bg-gray-100 text-gray-700',   dot: 'bg-gray-400' },
  urgent:    { label: 'عاجل',    cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500 animate-pulse' },
  emergency: { label: 'طارئ',   cls: 'bg-red-100 text-red-700',     dot: 'bg-red-500 animate-ping' },
};
const referralTypeLabel: Record<string, string> = {
  consultation: 'استشارة', procedure: 'إجراء', operation: 'عملية',
};
const fromRoleLabel: Record<string, string> = {
  nurse: 'ممرض', gp: 'طبيب عام', specialist: 'أخصائي', hospital: 'مستشفى',
};

// Blood donation request type
interface HospBloodReq {
  id: string; blood_type: string; units_needed: number;
  urgency: 'critical' | 'urgent' | 'routine'; patient_condition: string;
  contact_phone: string; city: string; status: string; created_at: string;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES_LIST = ['صنعاء', 'عدن', 'تعز', 'الحديدة', 'إب', 'ذمار', 'حضرموت', 'مأرب'];

// ═══════════════════════════════════════════════════════════════════════════════
// HOSPITAL DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function HospitalDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<HospitalTab>('referrals');
  const [referrals, setReferrals] = useState(demoHospitalReferrals);
  const [showSendReferral, setShowSendReferral] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'scheduled'>('all');

  // Blood donation
  const [bloodReqs, setBloodReqs] = useState<HospBloodReq[]>([
    { id: 'hb1', blood_type: 'O-', units_needed: 3, urgency: 'critical', patient_condition: 'حادث سير — نزيف حاد', contact_phone: '01-234567', city: 'صنعاء', status: 'active', created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: 'hb2', blood_type: 'A+', units_needed: 2, urgency: 'urgent', patient_condition: 'عملية قلب مفتوح مجدولة', contact_phone: '01-234567', city: 'صنعاء', status: 'active', created_at: new Date(Date.now() - 86400000).toISOString() },
  ]);
  const [showBloodForm, setShowBloodForm] = useState(false);
  const [bloodForm, setBloodForm] = useState({ blood_type: 'O+', units_needed: 1, urgency: 'urgent' as const, patient_condition: '', contact_phone: '', city: 'صنعاء' });
  const [bloodSent, setBloodSent] = useState(false);

  const sendBloodCall = async () => {
    if (!bloodForm.contact_phone.trim()) return;
    const newReq: HospBloodReq = { id: `hb-${Date.now()}`, ...bloodForm, status: 'active', created_at: new Date().toISOString() };
    try {
      await supabase.from('blood_donation_requests').insert({ hospital_name: 'مستشفى الجمهوري', ...bloodForm, status: 'active' });
    } catch {}
    setBloodReqs(p => [newReq, ...p]);
    setBloodSent(true); setShowBloodForm(false);
    setTimeout(() => setBloodSent(false), 3000);
  };

  const fulfillBlood = async (id: string) => {
    try { await supabase.from('blood_donation_requests').update({ status: 'fulfilled' }).eq('id', id); } catch {}
    setBloodReqs(p => p.filter(r => r.id !== id));
  };

  const pendingCount = referrals.filter(r => r.status === 'pending').length;

  const handleStatusChange = async (id: string, newStatus: string) => {
    try { await supabase.from('facility_referrals').update({ status: newStatus }).eq('id', id); } catch {}
    setReferrals(p => p.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const filtered = filterStatus === 'all' ? referrals : referrals.filter(r => r.status === filterStatus);

  const tabs: { id: HospitalTab; icon: React.ElementType; label: string }[] = [
    { id: 'referrals', icon: Send, label: 'التحويلات' },
    { id: 'blood',     icon: Droplets, label: 'تبرع دم' },
    { id: 'patients',  icon: Users, label: 'المرضى' },
    { id: 'procedures',icon: Stethoscope, label: 'الإجراءات' },
    { id: 'reception', icon: ClipboardList, label: 'الاستقبال' },
    { id: 'report',    icon: BarChart2, label: 'التقرير' },
    { id: 'settings',  icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-l from-[#1565C0] to-[#0D47A1] px-4 pt-10 pb-16">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onLogout?.(); window.dispatchEvent(new CustomEvent('nav-to-main')); }}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 border border-white/20"
              title="العودة لشاشة الواجهات الخمس شاشة البداية"
            >
              <ArrowRight size={16} />
              <span>الواجهات الخمس</span>
            </button>
            <button onClick={onLogout} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition active:scale-95" title="تسجيل الخروج">
              <LogOut size={16} />
            </button>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <Building2 size={18} className="text-white/80" />
              <h1 className="text-white font-bold text-lg">مستشفى الجمهوري</h1>
            </div>
            <p className="text-white/70 text-xs">لوحة تحكم المستشفى</p>
          </div>
          <div className="relative">
            {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center z-10">{pendingCount}</span>}
            <Bell size={22} className="text-white" />
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'تحويلات', val: referrals.length },
            { label: 'انتظار', val: referrals.filter(r=>r.status==='pending').length },
            { label: 'مجدول', val: referrals.filter(r=>r.status==='scheduled').length },
            { label: 'مكتمل', val: referrals.filter(r=>r.status==='completed').length },
          ].map(({label,val}) => (
            <div key={label} className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-white font-black text-xl">{val}</p>
              <p className="text-white/70 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white sticky top-0 z-40 shadow-sm -mt-1 overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map(({id, icon: Icon, label}) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1 px-5 py-3 text-xs font-medium border-b-2 transition-colors ${tab===id ? 'border-[#1565C0] text-[#1565C0]' : 'border-transparent text-gray-400'}`}>
              <Icon size={17} />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-12 space-y-3">
        {/* ── REFERRALS ── */}
        {tab === 'referrals' && (
          <>
            {/* Outgoing referral */}
            <button onClick={() => setShowSendReferral(true)}
              className="w-full bg-gradient-to-l from-[#1565C0] to-[#0D47A1] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">
              <ArrowUpCircle size={20} />إرسال تحويل لمستشفى آخر
            </button>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {(['all','pending','accepted','scheduled'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all ${filterStatus===s ? 'bg-[#1565C0] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                  {s==='all'?'الكل':s==='pending'?'انتظار':s==='accepted'?'مقبول':'مجدول'}
                </button>
              ))}
            </div>

            {filtered.map(ref => {
              const urg = urgencyConfig[ref.urgency] || urgencyConfig.routine;
              const stMap: Record<string,{label:string;cls:string}> = {
                pending:   {label:'انتظار',cls:'bg-amber-100 text-amber-700'},
                accepted:  {label:'مقبول',cls:'bg-[#E8F5F4] text-[#104C48]'},
                scheduled: {label:'مجدول',cls:'bg-cyan-100 text-cyan-700'},
                completed: {label:'مكتمل',cls:'bg-green-100 text-green-700'},
                rejected:  {label:'مرفوض',cls:'bg-red-100 text-red-600'},
              };
              const st = stMap[ref.status] || stMap.pending;
              return (
                <div key={ref.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${ref.urgency==='emergency' ? 'border-red-300' : ref.urgency==='urgent' ? 'border-amber-200' : 'border-gray-100'}`}>
                  <div className={`px-4 py-3 ${ref.urgency==='emergency' ? 'bg-red-50' : ref.urgency==='urgent' ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${urg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`}/>{urg.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st.cls}`}>{st.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{ref.patient_name}</p>
                        <p className="text-xs text-gray-500">{fromRoleLabel[ref.from_role] || ref.from_role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    {ref.referral_type && (
                      <div className="flex items-center gap-2 mb-2 justify-end">
                        <span className="bg-[#E8F5F4] text-[#104C48] text-xs px-2.5 py-1 rounded-full font-bold">
                          {referralTypeLabel[ref.referral_type]}
                          {ref.procedure_name ? `: ${ref.procedure_name}` : ''}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-700 text-right leading-relaxed bg-gray-50 rounded-xl px-3 py-2">{ref.reason}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        {ref.status === 'pending' && <>
                          <button onClick={() => handleStatusChange(ref.id, 'rejected')}
                            className="px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">رفض</button>
                          <button onClick={() => handleStatusChange(ref.id, 'scheduled')}
                            className="px-3 py-2 rounded-xl bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-100">تحديد موعد</button>
                          <button onClick={() => handleStatusChange(ref.id, 'accepted')}
                            className="px-3 py-2 rounded-xl bg-[#1565C0] text-white text-xs font-bold">قبول</button>
                        </>}
                        {ref.status === 'accepted' && (
                          <button onClick={() => handleStatusChange(ref.id, 'completed')}
                            className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold">إتمام</button>
                        )}
                        {ref.status === 'scheduled' && (
                          <button onClick={() => handleStatusChange(ref.id, 'completed')}
                            className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold">تم الإجراء</button>
                        )}
                      </div>
                      <div className="text-right">
                        <a href={`tel:${ref.patient_phone}`} className="text-xs text-[#199A8E] flex items-center gap-1 justify-end">
                          <Phone size={11}/>{ref.patient_phone}
                        </a>
                        <p className="text-[10px] text-gray-400 mt-0.5">{new Date(ref.created_at).toLocaleString('ar-YE')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── PATIENTS ── */}
        {tab === 'patients' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <Search size={18} className="text-gray-400" />
              <input type="text" placeholder="بحث عن مريض..." dir="rtl" className="flex-1 outline-none text-sm text-gray-700" />
            </div>
            {[
              { name: 'فاطمة علي المقطري', phone: '777234567', status: 'مجدول — استئصال مرارة', date: 'الأربعاء 12/7', dept: 'جراحة عامة' },
              { name: 'نورا يحيى الحيمي', phone: '777456789', status: 'مجدول — منظار معدة', date: 'الخميس 13/7', dept: 'جهاز هضمي' },
              { name: 'أحمد محمد الأغبري', phone: '777123456', status: 'انتظار موعد — قسطرة', date: '—', dept: 'قلب وأوعية' },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-[#E8F5F4] rounded-xl flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-[#1565C0]" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-gray-800">{p.name}</p>
                    <a href={`tel:${p.phone}`} className="text-xs text-[#199A8E] flex items-center gap-1 justify-end"><Phone size={10}/>{p.phone}</a>
                    <p className="text-xs text-gray-500 mt-1">{p.status}</p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="bg-[#E8F5F4] text-[#104C48] text-xs px-2 py-0.5 rounded-full">{p.dept}</span>
                      <span className="text-xs text-gray-400"><Calendar size={10} className="inline ml-1"/>{p.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PROCEDURES ── */}
        {tab === 'procedures' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-right mb-3">جدول العمليات اليوم</h3>
              {[
                { time: '08:00', name: 'استئصال زائدة', patient: 'محمد الزبيدي', dept: 'جراحة', status: 'completed' },
                { time: '10:30', name: 'قيصرية', patient: 'ريم المقطري', dept: 'نساء وولادة', status: 'in_progress' },
                { time: '13:00', name: 'استئصال مرارة', patient: 'فاطمة المقطري', dept: 'جراحة', status: 'scheduled' },
                { time: '15:30', name: 'منظار معدة', patient: 'نورا الحيمي', dept: 'هضمية', status: 'scheduled' },
              ].map((p, i) => {
                const stCls: Record<string,string> = { completed:'bg-green-100 text-green-700', in_progress:'bg-[#E8F5F4] text-[#104C48] animate-pulse', scheduled:'bg-gray-100 text-gray-600' };
                const stLbl: Record<string,string> = { completed:'مكتمل', in_progress:'جارٍ', scheduled:'مجدول' };
                return (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${stCls[p.status]}`}>{stLbl[p.status]}</span>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-bold text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.patient} • {p.dept}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-600 flex-shrink-0">{p.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── RECEPTION ── */}
        {tab === 'reception' && (
          <div className="facility-dark min-h-[600px]">
            <StoreProvider initialScreen="reception">
              <ReceptionScreen />
            </StoreProvider>
          </div>
        )}

        {/* ── REPORT ── */}
        {tab === 'report' && <FacilityReport type="hospital" />}
        {tab === 'settings' && <FacilitySettings name="مستشفى الجمهوري" type="hospital" />}

        {/* ── BLOOD DONATION ── */}
        {tab === 'blood' && (
          <div className="space-y-3">
            {bloodSent && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600" />
                <p className="font-bold text-green-700 text-sm">تم إرسال نداء التبرع — سيصل إشعار للمتبرعين المسجلين</p>
              </div>
            )}
            <button onClick={() => setShowBloodForm(true)}
              className="w-full bg-gradient-to-l from-red-600 to-red-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">
              <Droplets size={20} />إرسال نداء تبرع بالدم
            </button>
            <p className="font-bold text-gray-700 text-sm text-right">النداءات النشطة ({bloodReqs.length})</p>
            {bloodReqs.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                <Droplets size={40} className="mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">لا توجد نداءات نشطة</p>
              </div>
            ) : bloodReqs.map(req => {
              const urgCls: Record<string, string> = { critical: 'bg-red-50 border-red-300', urgent: 'bg-amber-50 border-amber-200', routine: 'bg-gray-50 border-gray-100' };
              const urgLabel: Record<string, string> = { critical: 'حرج', urgent: 'عاجل', routine: 'روتيني' };
              return (
                <div key={req.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${urgCls[req.urgency]}`}>
                  <div className={`px-4 py-3 flex items-center justify-between ${req.urgency === 'critical' ? 'bg-red-50' : req.urgency === 'urgent' ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${req.urgency === 'critical' ? 'bg-red-100 text-red-700' : req.urgency === 'urgent' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{urgLabel[req.urgency]}</span>
                      <span className="text-3xl font-black text-red-600">{req.blood_type}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 text-sm">{req.units_needed} وحدة مطلوبة</p>
                      <p className="text-xs text-gray-500">{req.city}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-700 text-right bg-gray-50 rounded-xl px-3 py-2 mb-3">{req.patient_condition || 'غير محدد'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button onClick={() => fulfillBlood(req.id)} className="px-3 py-2 bg-green-600 text-white rounded-xl text-xs font-bold">تم التوفير</button>
                        <a href={`tel:${req.contact_phone}`} className="px-3 py-2 bg-[#E8F5F4] text-[#104C48] rounded-xl text-xs font-bold flex items-center gap-1"><Phone size={12} />اتصال</a>
                      </div>
                      <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleString('ar-YE')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showSendReferral && (
        <ReferralModal fromRole="hospital" onClose={() => setShowSendReferral(false)}
          onSuccess={() => setShowSendReferral(false)} />
      )}

      {/* Blood form modal */}
      {showBloodForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-5 pb-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setShowBloodForm(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X size={16} className="text-gray-500" /></button>
              <div className="text-center">
                <p className="font-black text-gray-800 flex items-center gap-2 justify-center"><Droplets size={18} className="text-red-600" />نداء تبرع بالدم</p>
                <p className="text-xs text-gray-500">سيُرسل إشعار فوري للمتبرعين المسجلين</p>
              </div>
              <div className="w-8" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-2 text-right font-medium">فصيلة الدم المطلوبة *</p>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map(bt => (
                    <button key={bt} onClick={() => setBloodForm(p => ({ ...p, blood_type: bt }))}
                      className={`py-3 rounded-xl font-black text-sm transition-all ${bloodForm.blood_type === bt ? 'bg-red-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700'}`}>{bt}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5 text-right">عدد الوحدات</p>
                  <select value={bloodForm.units_needed} onChange={e => setBloodForm(p => ({ ...p, units_needed: parseInt(e.target.value) }))} className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-white outline-none" dir="rtl">
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} وحدة</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5 text-right">درجة الاستعجال</p>
                  <select value={bloodForm.urgency} onChange={e => setBloodForm(p => ({ ...p, urgency: e.target.value as any }))} className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-white outline-none" dir="rtl">
                    <option value="critical">حرج — فوري</option>
                    <option value="urgent">عاجل</option>
                    <option value="routine">روتيني</option>
                  </select>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5 text-right font-medium">الحالة الطبية</p>
                <input type="text" value={bloodForm.patient_condition} onChange={e => setBloodForm(p => ({ ...p, patient_condition: e.target.value }))} placeholder="مثال: حادث سير — نزيف حاد" dir="rtl" className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5 text-right">المدينة</p>
                  <select value={bloodForm.city} onChange={e => setBloodForm(p => ({ ...p, city: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-white outline-none" dir="rtl">
                    {CITIES_LIST.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1.5 text-right font-medium">رقم التواصل *</p>
                  <input type="tel" value={bloodForm.contact_phone} onChange={e => setBloodForm(p => ({ ...p, contact_phone: e.target.value }))} placeholder="01-234567" dir="ltr" className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400 text-right" />
                </div>
              </div>
              <button onClick={sendBloodCall} disabled={!bloodForm.contact_phone.trim()}
                className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 ${bloodForm.contact_phone.trim() ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                <Send size={18} />إرسال النداء
              </button>
              <p className="text-xs text-gray-400 text-center">سيصل إشعار فوري لجميع المتبرعين المسجلين من فصيلة {bloodForm.blood_type} في {bloodForm.city}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHARMACY DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

interface PartialDispenseItem { med_id: string; name: string; selected: boolean; qty: number; price: number; }

function PharmacyDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<PharmacyTab>('prescriptions');
  const [prescriptions, setPrescriptions] = useState(demoPrescriptions);
  const [inventory, setInventory] = useState(demoInventory);
  const [search, setSearch] = useState('');

  // Patient code lookup
  const [patientCodeInput, setPatientCodeInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookedUpPrescs, setLookedUpPrescs] = useState<typeof demoPrescriptions | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookupName, setLookupName] = useState('');

  // Partial dispense
  const [dispenseModal, setDispenseModal] = useState<{ pres: typeof demoPrescriptions[0]; items: PartialDispenseItem[] } | null>(null);
  const [dispenseSaved, setDispenseSaved] = useState(false);

  const pendingCount = prescriptions.filter(p => p.status === 'pending').length;

  const handleLookup = async () => {
    const code = patientCodeInput.trim().toUpperCase();
    if (!code) return;
    setLookupLoading(true); setLookupError(''); setLookedUpPrescs(null); setLookupName('');
    try {
      const { data: ud } = await supabase.from('users').select('id,full_name,patient_code')
        .ilike('patient_code', code).maybeSingle();
      if (!ud) { setLookupError('لم يُعثر على رقم تعريفي مطابق'); setLookupLoading(false); return; }
      setLookupName(ud.full_name || '');
      const { data: pd } = await supabase.from('electronic_prescriptions')
        .select('*').eq('patient_id', ud.id).neq('status','dispensed').order('issue_date',{ascending:false});
      setLookedUpPrescs(pd && pd.length > 0 ? pd as any : getDemoUndispensed());
    } catch {
      setLookedUpPrescs(getDemoUndispensed());
      setLookupName('أحمد محمد الأغبري');
    }
    setLookupLoading(false);
  };

  const getDemoUndispensed = () => demoPrescriptions.filter(p => p.status === 'pending').map(p => ({...p}));

  const openDispenseModal = (pres: typeof demoPrescriptions[0]) => {
    const items: PartialDispenseItem[] = pres.medications.map((m,i) => ({
      med_id: `m${i}`, name: m.name, selected: true, qty: 1, price: Math.floor(Math.random()*2000+500),
    }));
    setDispenseModal({ pres, items });
  };

  const toggleDispenseItem = (med_id: string) => {
    setDispenseModal(p => p ? { ...p, items: p.items.map(i => i.med_id === med_id ? {...i, selected: !i.selected} : i) } : null);
  };

  const confirmDispense = async () => {
    if (!dispenseModal) return;
    const allSelected = dispenseModal.items.every(i => i.selected);
    const newStatus = allSelected ? 'dispensed' : 'partial';
    try {
      await supabase.from('electronic_prescriptions').update({ status: newStatus }).eq('id', dispenseModal.pres.id);
      await supabase.from('pharmacy_dispensing').insert({
        prescription_id: dispenseModal.pres.id,
        dispensed_items: dispenseModal.items.filter(i => i.selected).map(i => i.name),
        status: 'dispensed', dispensed_at: new Date().toISOString(),
      });
    } catch {}
    setPrescriptions(p => p.map(x => x.id === dispenseModal.pres.id ? { ...x, status: newStatus as any } : x));
    if (lookedUpPrescs) setLookedUpPrescs(p => p ? p.filter(x => x.id !== dispenseModal.pres.id) : null);
    setDispenseSaved(true); setDispenseModal(null);
    setTimeout(() => setDispenseSaved(false), 3000);
  };

  const handleReject = (id: string) => setPrescriptions(p => p.map(x => x.id === id ? { ...x, status: 'rejected' as any } : x));

  const tabs: { id: PharmacyTab; icon: React.ElementType; label: string }[] = [
    { id: 'prescriptions',    icon: FileText, label: 'البحث' },
    { id: 'inventory',          icon: Package, label: 'المخزون' },
    { id: 'pharmacy_portal',    icon: Pill, label: 'صرف الروشتات' },
    { id: 'report',            icon: BarChart2, label: 'التقرير' },
    { id: 'settings',          icon: Settings, label: 'الإعدادات' },
  ];

  const filteredInv = inventory.filter(i => !search || i.name.includes(search) || i.category.includes(search));
  const lowStock = inventory.filter(i => i.qty < i.min_qty);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-l from-[#00897B] to-[#00695C] px-4 pt-10 pb-16">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { window.dispatchEvent(new CustomEvent('nav-to-main')); }}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
              title="العودة للقائمة الرئيسية"
            >
              <Home size={16} />
              <span>الرئيسية</span>
            </button>
            <button onClick={onLogout} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition active:scale-95" title="تسجيل الخروج">
              <LogOut size={16} />
            </button>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <Pill size={18} className="text-white/80" />
              <h1 className="text-white font-bold text-lg">صيدلية الشفاء</h1>
            </div>
            <p className="text-white/70 text-xs">لوحة تحكم الصيدلية</p>
          </div>
          <div className="relative">
            {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{pendingCount}</span>}
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Bell size={18} className="text-white" /></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'وصفات معلقة', val: pendingCount },
            { label: 'تنبيهات مخزون', val: lowStock.length },
            { label: 'صُرف اليوم', val: prescriptions.filter(p => p.status === 'dispensed').length },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-white font-black text-xl">{val}</p>
              <p className="text-white/70 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium border-b-2 transition-colors ${tab === id ? 'border-[#00897B] text-[#00897B]' : 'border-transparent text-gray-400'}`}>
              <Icon size={17} />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-12 space-y-4 -mt-6">
        {dispenseSaved && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-green-700 font-bold text-sm">تم صرف الوصفة بنجاح</p>
          </div>
        )}

        {tab === 'prescriptions' && (
          <div className="space-y-4">
            {/* Patient code lookup */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="font-bold text-gray-800 text-right text-sm mb-3 flex items-center gap-2 justify-end">
                <Search size={16} className="text-[#00897B]" />
                البحث بالرقم التعريفي للمريض
              </p>
              <div className="flex gap-2">
                <button onClick={handleLookup} disabled={lookupLoading || !patientCodeInput.trim()}
                  className={`px-4 py-3 rounded-xl font-bold text-sm transition-all flex-shrink-0 ${patientCodeInput.trim() ? 'bg-[#00897B] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {lookupLoading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : 'بحث'}
                </button>
                <input type="text" value={patientCodeInput}
                  onChange={e => { setPatientCodeInput(e.target.value.toUpperCase()); setLookedUpPrescs(null); setLookupError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  placeholder="YA-XXXXXX" dir="ltr"
                  className="flex-1 p-3 rounded-xl border border-gray-200 text-center font-mono font-bold text-lg outline-none focus:border-[#00897B] tracking-widest" />
              </div>
              {lookupError && <p className="text-red-500 text-xs text-right mt-2 font-medium">{lookupError}</p>}
            </div>

            {/* Results from lookup */}
            {lookedUpPrescs !== null && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{lookedUpPrescs.length} وصفة غير مصروفة</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#00897B] text-white text-xs px-3 py-1 rounded-full font-bold">{lookupName}</span>
                    <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{patientCodeInput}</span>
                  </div>
                </div>
                {lookedUpPrescs.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
                    <CheckCircle size={40} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-gray-500 font-medium">جميع وصفات هذا المريض مصروفة</p>
                  </div>
                ) : lookedUpPrescs.map(pres => (
                  <PrescriptionCard key={pres.id} pres={pres} onDispense={() => openDispenseModal(pres as any)} onReject={handleReject} />
                ))}
              </div>
            )}

            {/* Default pending list */}
            {lookedUpPrescs === null && (
              <div className="space-y-3">
                <p className="font-bold text-gray-700 text-sm text-right">الوصفات المعلقة ({pendingCount})</p>
                {prescriptions.filter(p => p.status === 'pending').map(pres => (
                  <PrescriptionCard key={pres.id} pres={pres} onDispense={() => openDispenseModal(pres as any)} onReject={handleReject} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'inventory' && (
          <div className="space-y-3">
            <div className="relative">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="بحث في المخزون..." dir="rtl"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#00897B] bg-white" />
              <Search size={16} className="absolute right-3 top-3.5 text-gray-400" />
            </div>
            {lowStock.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
                <p className="font-bold text-red-700 text-sm text-right mb-1">⚠ تنبيه مخزون منخفض</p>
                <p className="text-red-600 text-xs text-right">{lowStock.map(i=>i.name).join(' / ')}</p>
              </div>
            )}
            {filteredInv.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.qty < item.min_qty ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {item.qty} {item.unit}
                  </span>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`rounded-full h-2 transition-all ${item.qty < item.min_qty ? 'bg-red-500' : 'bg-[#00897B]'}`}
                    style={{ width: `${Math.min(100, (item.qty / (item.min_qty * 3)) * 100)}%` }} />
                </div>
                <p className="text-xs text-gray-400 text-right mt-1">الحد الأدنى: {item.min_qty} {item.unit}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'pharmacy_portal' && <LitePharmacyPortalView onBack={() => setTab('prescriptions')} />}
        {tab === 'report' && <FacilityReport type="pharmacy" />}
        {tab === 'settings' && <FacilitySettings name="صيدلية الشفاء" type="pharmacy" />}
      </div>

      {/* Partial Dispense Modal */}
      {dispenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-5 pb-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setDispenseModal(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X size={16} /></button>
              <div className="text-center">
                <p className="font-black text-gray-800">تحديد أصناف الصرف</p>
                <p className="text-xs text-gray-500 font-mono">{dispenseModal.pres.prescription_code}</p>
              </div>
              <div className="w-8" />
            </div>
            <div className="bg-[#E8F5F4] rounded-xl px-3 py-2 mb-4 text-right">
              <p className="text-xs text-[#104C48] font-medium">التشخيص: {dispenseModal.pres.diagnosis}</p>
            </div>
            <p className="text-sm font-bold text-gray-700 text-right mb-3">اختر الأصناف المتوفرة للصرف</p>
            <div className="space-y-2 mb-4">
              {dispenseModal.items.map(item => (
                <button key={item.med_id} onClick={() => toggleDispenseItem(item.med_id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${item.selected ? 'border-[#00897B] bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${item.selected ? 'bg-[#00897B] border-[#00897B]' : 'border-gray-300'}`}>
                    {item.selected && <CheckCircle size={14} className="text-white" />}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.price.toLocaleString('ar')} ر.ي</p>
                  </div>
                  <Pill size={16} className={item.selected ? 'text-[#00897B]' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 flex justify-between">
              <span className="font-black text-[#00897B]">{dispenseModal.items.filter(i=>i.selected).reduce((s,i)=>s+i.price,0).toLocaleString('ar')} ر.ي</span>
              <span className="text-gray-600 text-sm">{dispenseModal.items.filter(i=>i.selected).length} من {dispenseModal.items.length} صنف</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDispenseModal(null)} className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm">إلغاء</button>
              <button onClick={confirmDispense} disabled={dispenseModal.items.every(i=>!i.selected)}
                className={`flex-2 flex-1 py-3.5 rounded-xl font-bold text-sm ${dispenseModal.items.some(i=>i.selected) ? 'bg-[#00897B] text-white' : 'bg-gray-200 text-gray-400'}`}>
                {dispenseModal.items.every(i=>i.selected) ? 'صرف الكل' : 'صرف المحدد'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PrescriptionCard({ pres, onDispense, onReject }: { pres: any; onDispense: () => void; onReject: (id:string) => void }) {
  const stMap: Record<string,{label:string;cls:string}> = {
    pending:   { label: 'معلقة', cls: 'bg-amber-100 text-amber-700' },
    dispensed: { label: 'مصروفة', cls: 'bg-green-100 text-green-700' },
    partial:   { label: 'جزئية', cls: 'bg-[#E8F5F4] text-[#104C48]' },
    rejected:  { label: 'مرفوضة', cls: 'bg-red-100 text-red-600' },
    cancelled: { label: 'ملغية', cls: 'bg-gray-100 text-gray-500' },
  };
  const st = stMap[pres.status] || stMap.pending;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${st.cls}`}>{st.label}</span>
        <div className="text-right">
          <p className="font-mono font-bold text-sm text-gray-800">{pres.prescription_code}</p>
          <p className="text-xs text-gray-500">{pres.doctor_name} — {pres.patient_name}</p>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="bg-[#E8F5F4] rounded-xl px-3 py-2 mb-3">
          <p className="text-xs text-[#104C48] font-medium text-right">التشخيص: {pres.diagnosis}</p>
        </div>
        <div className="space-y-2 mb-3">
          {pres.medications.map((m:any,i:number) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-xs text-gray-500">{m.dosage} — {m.frequency}</span>
              <span className="text-sm font-medium text-gray-700">{m.name}</span>
            </div>
          ))}
        </div>
        {pres.status === 'pending' && (
          <div className="flex gap-2">
            <button onClick={() => onReject(pres.id)} className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold">رفض</button>
            <button onClick={onDispense} className="flex-[2] py-2.5 bg-[#00897B] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
              <Pill size={14} />تحديد الأصناف وصرف
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAB DASHBOARD — Smart Queue + Patient Code Lookup
// ═══════════════════════════════════════════════════════════════════════════════

interface SmartQueueItem {
  id: string; patient_name: string; patient_code: string; patient_phone: string;
  tests: { name: string; type: string }[];
  queue_number: number; status: string; urgency: string;
  estimated_ready_at?: string; created_at: string;
}

const demoSmartQueue: SmartQueueItem[] = [
  { id: 'sq1', patient_name: 'أحمد محمد الأغبري', patient_code: 'YA-777001', patient_phone: '777001001', tests: [{name:'تحليل دم شامل CBC',type:'lab'},{name:'سكر صيام',type:'lab'}], queue_number:1, status:'in_progress', urgency:'urgent', estimated_ready_at: new Date(Date.now()+1800000).toISOString(), created_at: new Date(Date.now()-900000).toISOString() },
  { id: 'sq2', patient_name: 'فاطمة علي المقطري', patient_code: 'YA-234567', patient_phone: '777002002', tests: [{name:'أشعة صدر',type:'xray'}], queue_number:2, status:'waiting', urgency:'routine', estimated_ready_at: new Date(Date.now()+3600000).toISOString(), created_at: new Date(Date.now()-300000).toISOString() },
  { id: 'sq3', patient_name: 'خالد عبدالله الشامي', patient_code: 'YA-345678', patient_phone: '777003003', tests: [{name:'وظائف كلى',type:'lab'},{name:'وظائف كبد',type:'lab'},{name:'تحليل بول',type:'lab'}], queue_number:3, status:'waiting', urgency:'stat', estimated_ready_at: new Date(Date.now()+5400000).toISOString(), created_at: new Date(Date.now()-120000).toISOString() },
  { id: 'sq4', patient_name: 'نورا يحيى الحيمي', patient_code: 'YA-456789', patient_phone: '777004004', tests: [{name:'سونار بطن',type:'scan'}], queue_number:4, status:'waiting', urgency:'routine', estimated_ready_at: new Date(Date.now()+7200000).toISOString(), created_at: new Date().toISOString() },
];

function LabDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<LabTab>('queue');
  const [smartQueue, setSmartQueue] = useState<SmartQueueItem[]>(demoSmartQueue);
  const [resultsText, setResultsText] = useState<Record<string, string>>({});

  // Patient code lookup for lab
  const [labCodeInput, setLabCodeInput] = useState('');
  const [labLookupLoading, setLabLookupLoading] = useState(false);
  const [labLookupResult, setLabLookupResult] = useState<{ name: string; tests: {id:string;name:string;status:string;requested_at:string}[] } | null>(null);
  const [labLookupError, setLabLookupError] = useState('');
  const [addedToQueue, setAddedToQueue] = useState(false);

  const pendingCount = smartQueue.filter(q => q.status === 'waiting' || q.status === 'in_progress').length;

  const handleLabLookup = async () => {
    const code = labCodeInput.trim().toUpperCase();
    if (!code) return;
    setLabLookupLoading(true); setLabLookupError(''); setLabLookupResult(null); setAddedToQueue(false);
    try {
      const { data: ud } = await supabase.from('users').select('id,full_name,phone')
        .ilike('patient_code', code).maybeSingle();
      if (!ud) { setLabLookupError('لم يُعثر على رقم تعريفي مطابق'); setLabLookupLoading(false); return; }
      const { data: lr } = await supabase.from('lab_requests').select('*')
        .eq('patient_id', ud.id).neq('status','completed').order('requested_at',{ascending:false});
      setLabLookupResult({
        name: ud.full_name || '',
        tests: lr && lr.length > 0 ? lr.map((r:any) => ({id:r.id, name:r.test_type, status:r.status, requested_at:r.requested_at}))
          : getDemoLabTests(),
      });
    } catch {
      setLabLookupResult({ name: 'أحمد محمد الأغبري', tests: getDemoLabTests() });
    }
    setLabLookupLoading(false);
  };

  const getDemoLabTests = () => [
    { id: 'lt1', name: 'تحليل دم شامل CBC', status: 'pending', requested_at: new Date(Date.now()-3600000).toISOString() },
    { id: 'lt2', name: 'سكر صيام FBS', status: 'pending', requested_at: new Date(Date.now()-3600000).toISOString() },
    { id: 'lt3', name: 'أشعة صدر PA', status: 'pending', requested_at: new Date(Date.now()-7200000).toISOString() },
  ];

  const addToSmartQueue = (tests: {id:string;name:string}[]) => {
    if (!labLookupResult) return;
    const avgMins = tests.length * 20;
    const lastReady = smartQueue.filter(q=>q.status!=='completed').reduce((max,q) => {
      const t = q.estimated_ready_at ? new Date(q.estimated_ready_at).getTime() : 0;
      return t > max ? t : max;
    }, Date.now());
    const readyAt = new Date(lastReady + avgMins * 60000);
    const newItem: SmartQueueItem = {
      id: `sq-${Date.now()}`,
      patient_name: labLookupResult.name,
      patient_code: labCodeInput.trim().toUpperCase(),
      patient_phone: '—',
      tests: tests.map(t => ({ name: t.name, type: 'lab' })),
      queue_number: smartQueue.filter(q=>q.status!=='completed').length + 1,
      status: 'waiting',
      urgency: 'routine',
      estimated_ready_at: readyAt.toISOString(),
      created_at: new Date().toISOString(),
    };
    setSmartQueue(p => [...p, newItem]);
    // Notify patient
    try {
      supabase.from('notifications').insert({
        user_id: labCodeInput,
        type: 'info',
        title: 'طابور المختبر',
        message: `رقمك في الطابور: ${newItem.queue_number} — الوقت المتوقع لجاهزية نتائجك: ${readyAt.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}`,
      });
    } catch {}
    setAddedToQueue(true);
    setLabLookupResult(null);
    setLabCodeInput('');
    setTimeout(() => setAddedToQueue(false), 4000);
  };

  const handleStart = (id: string) => setSmartQueue(p => p.map(q => q.id === id ? {...q, status:'in_progress'} : q));

  const handleComplete = async (id: string) => {
    const results = resultsText[id] || 'تمت المعالجة';
    try {
      await supabase.from('lab_smart_queue').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id);
    } catch {}
    setSmartQueue(p => p.map(q => q.id === id ? {...q, status:'completed'} : q));
    const item = smartQueue.find(q => q.id === id);
    if (item) {
      try {
        supabase.from('notifications').insert({
          user_id: item.patient_code,
          type: 'success',
          title: 'نتائج جاهزة',
          message: `نتائج فحوصاتك جاهزة في ${item.tests.map(t=>t.name).join(' و ')}`,
        });
      } catch {}
    }
  };

  const urgMap: Record<string,{label:string;cls:string;dot:string}> = {
    routine: { label: 'روتيني', cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
    urgent:  { label: 'عاجل',   cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500 animate-pulse' },
    stat:    { label: 'فوري',   cls: 'bg-red-100 text-red-700', dot: 'bg-red-500 animate-pulse' },
  };
  const testIcon: Record<string,string> = { lab:'🧪', xray:'🩻', scan:'📡', ecg:'💓', other:'🔬' };

  const tabs: { id: LabTab; icon: React.ElementType; label: string }[] = [
    { id: 'queue',      icon: ClipboardList, label: 'الطابور' },
    { id: 'results',     icon: Activity, label: 'النتائج' },
    { id: 'lab_portal',  icon: FlaskConical, label: 'رصد النتائج' },
    { id: 'report',      icon: BarChart2, label: 'التقرير' },
    { id: 'settings',    icon: Settings, label: 'الإعدادات' },
  ];

  const waiting = smartQueue.filter(q => q.status === 'waiting');
  const inProgress = smartQueue.find(q => q.status === 'in_progress');
  const completed = smartQueue.filter(q => q.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-l from-[#7B1FA2] to-[#4A148C] px-4 pt-10 pb-16">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { window.dispatchEvent(new CustomEvent('nav-to-main')); }}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
              title="العودة للقائمة الرئيسية"
            >
              <Home size={16} />
              <span>الرئيسية</span>
            </button>
            <button onClick={onLogout} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition active:scale-95" title="تسجيل الخروج">
              <LogOut size={16} />
            </button>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <FlaskConical size={18} className="text-white/80" />
              <h1 className="text-white font-bold text-lg">مختبر الدقة</h1>
            </div>
            <p className="text-white/70 text-xs">الطابور الذكي</p>
          </div>
          <div className="relative">
            {pendingCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{pendingCount}</span>}
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Bell size={18} className="text-white" /></div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'إجمالي اليوم', val: smartQueue.length },
            { label: 'يُعالَج', val: inProgress ? 1 : 0 },
            { label: 'انتظار', val: waiting.length },
            { label: 'مكتمل', val: completed.length },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-white font-black text-xl">{val}</p>
              <p className="text-white/70 text-[10px]">{label}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium border-b-2 transition-colors ${tab === id ? 'border-[#7B1FA2] text-[#7B1FA2]' : 'border-transparent text-gray-400'}`}>
              <Icon size={17} />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-12 space-y-4 -mt-6">
        {addedToQueue && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-green-700 font-bold text-sm">تمت إضافته للطابور وإرسال إشعار للمريض بوقت حضوره</p>
          </div>
        )}

        {tab === 'queue' && (
          <div className="space-y-4">
            {/* Patient code lookup */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="font-bold text-gray-800 text-right text-sm mb-3 flex items-center gap-2 justify-end">
                <Search size={16} className="text-[#7B1FA2]" />
                إدخال رقم المريض التعريفي
              </p>
              <div className="flex gap-2">
                <button onClick={handleLabLookup} disabled={labLookupLoading || !labCodeInput.trim()}
                  className={`px-4 py-3 rounded-xl font-bold text-sm flex-shrink-0 transition-all ${labCodeInput.trim() ? 'bg-[#7B1FA2] text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {labLookupLoading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : 'بحث'}
                </button>
                <input type="text" value={labCodeInput}
                  onChange={e => { setLabCodeInput(e.target.value.toUpperCase()); setLabLookupResult(null); setLabLookupError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLabLookup()}
                  placeholder="YA-XXXXXX" dir="ltr"
                  className="flex-1 p-3 rounded-xl border border-gray-200 text-center font-mono font-bold text-lg outline-none focus:border-[#7B1FA2] tracking-widest" />
              </div>
              {labLookupError && <p className="text-red-500 text-xs text-right mt-2">{labLookupError}</p>}
            </div>

            {/* Pending tests found */}
            {labLookupResult && (
              <div className="bg-white rounded-2xl shadow-sm border border-purple-200 overflow-hidden">
                <div className="bg-purple-50 px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-purple-600">{labLookupResult.tests.length} فحص مطلوب</span>
                  <div className="text-right">
                    <p className="font-bold text-purple-900">{labLookupResult.name}</p>
                    <p className="text-xs font-mono text-purple-600">{labCodeInput}</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {labLookupResult.tests.map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                      <span className="text-xs text-gray-500">{new Date(t.requested_at).toLocaleDateString('ar-YE')}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">معلق</span>
                        <p className="text-sm font-bold text-gray-800">{t.name}</p>
                        <span>🧪</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addToSmartQueue(labLookupResult.tests.map(t=>({id:t.id,name:t.name})))}
                    className="w-full mt-2 py-3.5 bg-[#7B1FA2] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                    <Bell size={16} />إضافة للطابور وإشعار المريض بوقت الجاهزية
                  </button>
                </div>
              </div>
            )}

            {/* Current being processed */}
            {inProgress && (
              <div className="bg-white rounded-2xl shadow-sm border-2 border-purple-300 overflow-hidden">
                <div className="bg-gradient-to-l from-[#7B1FA2] to-[#4A148C] px-4 py-3 flex items-center justify-between">
                  <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />يُعالَج الآن
                  </span>
                  <div className="text-right">
                    <p className="text-white font-bold">{inProgress.patient_name}</p>
                    <p className="text-white/70 text-xs font-mono">{inProgress.patient_code}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2 justify-end mb-3">
                    {inProgress.tests.map((t,i) => (
                      <span key={i} className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {testIcon[t.type] || '🔬'} {t.name}
                      </span>
                    ))}
                  </div>
                  <textarea value={resultsText[inProgress.id] || ''} onChange={e => setResultsText(p=>({...p,[inProgress.id]:e.target.value}))}
                    rows={3} placeholder="أدخل نتائج الفحوصات هنا..." dir="rtl"
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm resize-none outline-none focus:border-[#7B1FA2] mb-3" />
                  <button onClick={() => handleComplete(inProgress.id)} className="w-full py-3 bg-[#7B1FA2] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                    <CheckCircle size={16} />إرسال النتائج وإشعار المريض
                  </button>
                </div>
              </div>
            )}

            {/* Waiting queue */}
            <p className="font-bold text-gray-700 text-sm text-right">قائمة الانتظار ({waiting.length})</p>
            {waiting.length === 0 && !inProgress ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                <FlaskConical size={40} className="mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400">الطابور فارغ</p>
              </div>
            ) : (
              waiting.map(item => {
                const urg = urgMap[item.urgency] || urgMap.routine;
                const readyTime = item.estimated_ready_at
                  ? new Date(item.estimated_ready_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })
                  : '—';
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-black text-sm">{item.queue_number}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${urg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`} />{urg.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{item.patient_name}</p>
                        <p className="text-xs text-gray-500 font-mono">{item.patient_code}</p>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5 justify-end mb-2">
                        {item.tests.map((t,i) => (
                          <span key={i} className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-lg font-medium">
                            {testIcon[t.type] || '🔬'} {t.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <button onClick={() => handleStart(item.id)}
                          className="px-4 py-2 bg-[#7B1FA2] text-white rounded-xl text-xs font-bold">
                          بدء المعالجة
                        </button>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">الوقت المتوقع</p>
                          <p className="text-sm font-bold text-purple-700">{readyTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'results' && (
          <div className="space-y-3">
            <p className="font-bold text-gray-700 text-sm text-right">الفحوصات المكتملة اليوم ({completed.length})</p>
            {completed.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                <Activity size={40} className="mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400">لا توجد نتائج بعد</p>
              </div>
            ) : completed.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-green-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle size={12} />مكتمل
                  </span>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{item.patient_name}</p>
                    <p className="text-xs text-gray-500 font-mono">{item.patient_code}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {item.tests.map((t,i) => (
                    <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg">
                      {testIcon[t.type] || '🔬'} {t.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'lab_portal' && <LiteLabPortalView onBack={() => setTab('queue')} />}
        {tab === 'report' && <FacilityReport type="lab" />}
        {tab === 'settings' && <FacilitySettings name="مختبر الدقة" type="lab" />}
      </div>
    </div>
  );
}

// ─── Shared: Monthly Report ───────────────────────────────────────────────────
function FacilityReport({ type }: { type: FacilityType }) {
  const stats = {
    hospital: [
      { label: 'تحويلات مستلمة', val: 47, icon: Send, color: 'text-[#199A8E] bg-[#E8F5F4]' },
      { label: 'عمليات منجزة', val: 29, icon: Stethoscope, color: 'text-green-600 bg-green-50' },
      { label: 'إجراءات طبية', val: 18, icon: Activity, color: 'text-cyan-600 bg-cyan-50' },
      { label: 'إيرادات (مليون ر.ي)', val: '4.2', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
    ],
    pharmacy: [
      { label: 'وصفات مصروفة', val: 312, icon: FileText, color: 'text-green-600 bg-green-50' },
      { label: 'أدوية صُرفت', val: 1847, icon: Pill, color: 'text-teal-600 bg-teal-50' },
      { label: 'قيمة المبيعات', val: '890,500', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
      { label: 'أصناف منخفضة', val: 3, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
    ],
    lab: [
      { label: 'فحوصات مكتملة', val: 234, icon: FlaskConical, color: 'text-purple-600 bg-purple-50' },
      { label: 'نتائج أُرسلت', val: 234, icon: Send, color: 'text-[#199A8E] bg-[#E8F5F4]' },
      { label: 'إيرادات (ألف ر.ي)', val: '342', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
      { label: 'متوسط وقت الإنجاز', val: '2.3 ساعة', icon: Clock, color: 'text-gray-600 bg-gray-50' },
    ],
  };
  const s = stats[type];
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white">
        <p className="text-white/70 text-sm text-right">التقرير الشهري</p>
        <p className="text-2xl font-black">{new Date().toLocaleDateString('ar-YE', { month: 'long', year: 'numeric' })}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {s.map(({ label, val, icon: Icon, color }) => (
          <div key={label} className={`${color.split(' ')[1]} rounded-2xl p-4 flex items-center gap-3`}>
            <Icon size={22} className={color.split(' ')[0]} />
            <div><p className={`text-xl font-black ${color.split(' ')[0]}`}>{val}</p><p className="text-xs text-gray-500 mt-0.5">{label}</p></div>
          </div>
        ))}
      </div>
      <button className="w-full bg-gray-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
        <FileText size={18} />تحميل تقرير PDF
      </button>
    </div>
  );
}

// ─── Shared: Settings ─────────────────────────────────────────────────────────
function FacilitySettings({ name, type }: { name: string; type: FacilityType }) {
  const [fname, setFname] = useState(name);
  const [phone, setPhone] = useState('01-234567');
  const [address, setAddress] = useState('صنعاء، حدة');
  const [hours, setHours] = useState('8:00 - 22:00');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    try {
      await supabase.from('medical_facilities').upsert({ name: fname, facility_type: type, phone, address, working_hours: hours }, { onConflict: 'name' });
    } catch {}
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-gray-800 text-right mb-2">بيانات المنشأة</h3>
        {[
          { label: 'الاسم', val: fname, set: setFname },
          { label: 'رقم الهاتف', val: phone, set: setPhone },
          { label: 'العنوان', val: address, set: setAddress },
          { label: 'ساعات العمل', val: hours, set: setHours },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <label className="text-xs text-gray-500 block mb-1 text-right">{label}</label>
            <input type="text" value={val} onChange={e => set(e.target.value)} dir="rtl" className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400" />
          </div>
        ))}
        <button onClick={save}
          className={`w-full py-3.5 rounded-2xl font-bold transition-all ${saved ? 'bg-green-600 text-white' : 'bg-gray-800 text-white'}`}>
          {saved ? '✓ تم الحفظ' : 'حفظ التغييرات'}
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 text-right mb-3 flex items-center gap-2 justify-end">
          الشهادات والتراخيص <ShieldCheck size={16} className="text-green-600" />
        </h3>
        {['ترخيص وزارة الصحة', 'شهادة اعتماد JCI', 'سجل تجاري'].map((cert, i) => (
          <div key={i} className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 mb-2">
            <span className="text-xs text-green-700 font-bold px-2 py-0.5 bg-green-100 rounded-full">فعّال</span>
            <p className="text-sm text-gray-700">{cert}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — Selector + sub-dashboards
// ═══════════════════════════════════════════════════════════════════════════════
export function MedicalFacilityDashboard() {
  const { logout } = useAuth();
  const [facilityType, setFacilityType] = useState<FacilityType | null>(null);

  if (!facilityType) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-gradient-to-br from-[#1565C0] to-[#0D47A1] rounded-3xl flex items-center justify-center mb-6 shadow-lg">
          <Building2 size={36} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">لوحة المنشآت الطبية</h1>
        <p className="text-gray-500 text-sm mb-8 text-center">اختر نوع منشأتك للمتابعة</p>

        <div className="w-full max-w-sm space-y-3">
          {([
            { type: 'hospital' as FacilityType, label: 'مستشفى', desc: 'إدارة التحويلات والعمليات والمرضى', icon: Building2, color: 'from-[#1565C0] to-[#0D47A1]' },
            { type: 'pharmacy' as FacilityType, label: 'صيدلية', desc: 'صرف الوصفات وإدارة المخزون', icon: Pill, color: 'from-[#00897B] to-[#00695C]' },
            { type: 'lab' as FacilityType, label: 'مختبر / مركز أشعة', desc: 'معالجة الفحوصات وإرسال النتائج', icon: FlaskConical, color: 'from-[#7B1FA2] to-[#4A148C]' },
          ] as const).map(({ type, label, desc, icon: Icon, color }) => (
            <button key={type} onClick={() => setFacilityType(type)}
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

        <button
          onClick={() => { logout(); window.dispatchEvent(new CustomEvent('nav-to-main')); }}
          className="mt-8 flex items-center gap-2 text-white bg-gradient-to-r from-[#104C48] to-[#199A8E] hover:opacity-90 px-5 py-2.5 rounded-2xl text-xs font-bold transition shadow-sm active:scale-95"
        >
          <ArrowRight size={16} />
          <span>العودة لشاشة الواجهات الخمس</span>
        </button>
      </div>
    );
  }

  if (facilityType === 'hospital') return <HospitalDashboard onLogout={logout} />;
  if (facilityType === 'pharmacy') return <FacilityApp initialScreen="pharmacy" singleScreen title="صيدلية المنشأة — صرف الروشتات" onBack={() => setFacilityType(null)} />;
  return <FacilityApp initialScreen="lab" singleScreen title="مختبر المنشأة — رصد الفحوصات" onBack={() => setFacilityType(null)} />;
}
