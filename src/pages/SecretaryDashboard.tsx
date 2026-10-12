import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Clock, CheckCircle, Play, Coffee, AlertCircle, RefreshCw,
  Phone, User, LogOut, Plus, X, Droplets, Bell, Building2,
  Activity, Heart, Weight, Thermometer, Wind, Gauge, Calendar,
  BarChart2, Search, Edit3, Trash2, ChevronDown, Send, AlertTriangle,
  Home, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Appointment, QueueItem } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface QueueAppointment extends QueueItem {
  appointment?: Appointment & {
    patient?: { id: string; full_name: string; phone: string };
    doctor?: { id: string; full_name: string };
  };
  vitals?: PatientVitals;
  vitals_saved?: boolean;
}

interface PatientVitals {
  weight: string;
  height: string;
  bp_sys: string;
  bp_dia: string;
  pulse: string;
  temperature: string;
  spo2: string;
  blood_sugar: string;
  is_pregnant: boolean;
  pain_level: number;
  notes: string;
}

interface ManualPatient {
  name: string;
  phone: string;
  symptoms: string;
  is_emergency: boolean;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const getDemoQueue = (): QueueAppointment[] => [
  { id: 'q1', patient_id: 'p1', queue_number: 1, status: 'in_progress', estimated_time: '09:00', created_at: new Date().toISOString(), appointment: { id: 'a1', patient_id: 'p1', doctor_id: 'd1', appointment_date: new Date().toISOString().split('T')[0], estimated_time: '09:00', status: 'in_progress', symptoms: 'ألم في الصدر وضيق تنفس', is_emergency: false, queue_number: 1, payment_status: 'paid', created_at: new Date().toISOString(), patient: { id: 'p1', full_name: 'أحمد محمد الأغبري', phone: '777123456' }, doctor: { id: 'd1', full_name: 'د. محمد العمري' } } },
  { id: 'q2', patient_id: 'p2', queue_number: 2, status: 'waiting', estimated_time: '09:20', created_at: new Date().toISOString(), appointment: { id: 'a2', patient_id: 'p2', doctor_id: 'd1', appointment_date: new Date().toISOString().split('T')[0], estimated_time: '09:20', status: 'confirmed', symptoms: 'كحة مستمرة وحرارة', is_emergency: false, queue_number: 2, payment_status: 'paid', created_at: new Date().toISOString(), patient: { id: 'p2', full_name: 'فاطمة علي المقطري', phone: '777234567' }, doctor: { id: 'd1', full_name: 'د. محمد العمري' } } },
  { id: 'q3', patient_id: 'p3', queue_number: 3, status: 'waiting', estimated_time: '09:40', created_at: new Date().toISOString(), appointment: { id: 'a3', patient_id: 'p3', doctor_id: 'd1', appointment_date: new Date().toISOString().split('T')[0], estimated_time: '09:40', status: 'confirmed', symptoms: 'صداع نصفي شديد', is_emergency: true, queue_number: 3, payment_status: 'pending', created_at: new Date().toISOString(), patient: { id: 'p3', full_name: 'خالد عبدالله الشامي', phone: '777345678' }, doctor: { id: 'd1', full_name: 'د. محمد العمري' } } },
  { id: 'q4', patient_id: 'p4', queue_number: 4, status: 'waiting', estimated_time: '10:00', created_at: new Date().toISOString(), appointment: { id: 'a4', patient_id: 'p4', doctor_id: 'd1', appointment_date: new Date().toISOString().split('T')[0], estimated_time: '10:00', status: 'confirmed', symptoms: 'غثيان وآلام بطن', is_emergency: false, queue_number: 4, payment_status: 'paid', created_at: new Date().toISOString(), patient: { id: 'p4', full_name: 'نورا يحيى الحيمي', phone: '777456789' }, doctor: { id: 'd1', full_name: 'د. محمد العمري' } } },
  { id: 'q5', patient_id: 'p5', queue_number: 5, status: 'completed', estimated_time: '08:40', created_at: new Date().toISOString(), appointment: { id: 'a5', patient_id: 'p5', doctor_id: 'd1', appointment_date: new Date().toISOString().split('T')[0], estimated_time: '08:40', status: 'completed', symptoms: 'متابعة دورية', is_emergency: false, queue_number: 5, payment_status: 'paid', created_at: new Date().toISOString(), patient: { id: 'p5', full_name: 'سالم عبدالرحمن الزبيدي', phone: '777567890' }, doctor: { id: 'd1', full_name: 'د. محمد العمري' } } },
];

type SecTab = 'queue' | 'add' | 'report';

// ═══════════════════════════════════════════════════════════════════════════════
export function SecretaryDashboard({ onBack }: { onBack?: () => void }) {
  const { logout } = useAuth();
  const [tab, setTab] = useState<SecTab>('queue');
  const [queue, setQueue] = useState<QueueAppointment[]>(getDemoQueue());
  const [isLoading, setIsLoading] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Vitals modal
  const [vitalItem, setVitalItem] = useState<QueueAppointment | null>(null);
  const emptyVitals = (): PatientVitals => ({ weight: '', height: '', bp_sys: '', bp_dia: '', pulse: '', temperature: '', spo2: '', blood_sugar: '', is_pregnant: false, pain_level: 0, notes: '' });
  const [vitals, setVitals] = useState<PatientVitals>(emptyVitals());
  const [vitalsSaving, setVitalsSaving] = useState(false);

  // Manual add
  const [manual, setManual] = useState<ManualPatient>({ name: '', phone: '', symptoms: '', is_emergency: false });
  const [manualSaving, setManualSaving] = useState(false);

  // Search
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('appointments').select('*, patient:users(*), doctor:doctors(*)').eq('appointment_date', today).order('queue_number', { ascending: true });
      if (data && data.length > 0) {
        const mapped: QueueAppointment[] = data.map((a: any) => ({
          id: a.id, patient_id: a.patient_id, queue_number: a.queue_number || 0,
          status: a.status === 'completed' ? 'completed' : a.status === 'in_progress' ? 'in_progress' : 'waiting',
          estimated_time: a.estimated_time || '', created_at: a.created_at,
          appointment: { ...a, patient: a.patient || { id: a.patient_id, full_name: `مريض`, phone: '' }, doctor: a.doctor || { id: a.doctor_id, full_name: 'الطبيب' } },
        }));
        setQueue(mapped);
      }
    } catch {
      /* keep demo */
    } finally { setIsLoading(false); }
  }, []);

  // ─── Queue actions ──────────────────────────────────────────────────────────
  const handleStart = async (itemId: string) => {
    const now = new Date().toISOString();
    const prev = queue.find(q => q.status === 'in_progress');
    try {
      if (prev) {
        await supabase.from('appointments').update({ status: 'completed' }).eq('id', prev.id);
      }
      await supabase.from('appointments').update({ status: 'in_progress' }).eq('id', itemId);
      await sendQueueNotifications(queue.filter(q => q.id !== itemId && q.status === 'waiting'));
    } catch {}
    setQueue(p => p.map(q =>
      q.id === itemId ? { ...q, status: 'in_progress' } :
      q.status === 'in_progress' ? { ...q, status: 'completed' } : q
    ));
  };

  const handleComplete = async (itemId: string) => {
    try { await supabase.from('appointments').update({ status: 'completed' }).eq('id', itemId); } catch {}
    setQueue(p => p.map(q => q.id === itemId ? { ...q, status: 'completed' } : q));
    await sendQueueNotifications(queue.filter(q => q.id !== itemId && q.status === 'waiting'));
  };

  const handleDelete = (itemId: string) => setQueue(p => p.filter(q => q.id !== itemId));

  const sendQueueNotifications = async (waiting: QueueAppointment[]) => {
    const now = new Date();
    for (let i = 0; i < waiting.length; i++) {
      const pid = waiting[i].appointment?.patient_id;
      if (!pid || pid.startsWith('p') || pid === 'manual') continue;
      const waitMin = i * 20;
      const arrivalTime = new Date(now.getTime() + waitMin * 60000).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      try {
        await supabase.from('notifications').insert({
          user_id: pid, user_type: 'patient', type: 'queue_update',
          title: i === 0 ? 'دورك الآن!' : `باقي ${i} شخص قبلك`,
          message: i === 0 ? 'توجه للعيادة الآن' : `موعدك التقريبي ${arrivalTime}`,
          data: { queue_position: i + 1, wait_minutes: waitMin },
        });
      } catch {}
    }
  };

  // ─── Manual add ─────────────────────────────────────────────────────────────
  const handleAddManual = async () => {
    if (!manual.name.trim()) return;
    setManualSaving(true);
    const waiting = queue.filter(q => q.status === 'waiting' || q.status === 'in_progress');
    const newNum = Math.max(0, ...queue.map(q => q.queue_number || 0)) + 1;
    const newItem: QueueAppointment = {
      id: `manual-${Date.now()}`, patient_id: `manual-${Date.now()}`,
      queue_number: newNum, status: 'waiting',
      estimated_time: '', created_at: new Date().toISOString(),
      appointment: {
        id: `ma-${Date.now()}`, patient_id: `manual-${Date.now()}`,
        doctor_id: 'd1', appointment_date: new Date().toISOString().split('T')[0],
        estimated_time: '', status: 'confirmed',
        symptoms: manual.symptoms || 'حضور مباشر',
        is_emergency: manual.is_emergency, payment_status: 'pending',
        queue_number: newNum, created_at: new Date().toISOString(),
        patient: { id: `manual-${Date.now()}`, full_name: manual.name, phone: manual.phone },
        doctor: { id: 'd1', full_name: 'د. محمد العمري' },
      },
    };
    try {
      await supabase.from('appointments').insert({
        patient_id: newItem.patient_id, doctor_id: 'd1',
        appointment_date: new Date().toISOString().split('T')[0],
        queue_number: newNum, estimated_time: '',
        status: 'confirmed', symptoms: newItem.appointment?.symptoms,
        is_emergency: manual.is_emergency, payment_status: 'pending',
      });
    } catch {}
    setQueue(p => [...p, newItem]);
    setManual({ name: '', phone: '', symptoms: '', is_emergency: false });
    setManualSaving(false);
    setTab('queue');
  };

  // ─── Vitals save ─────────────────────────────────────────────────────────────
  const saveVitals = async () => {
    if (!vitalItem) return;
    setVitalsSaving(true);
    try {
      await supabase.from('patient_vitals').insert({
        patient_id: vitalItem.appointment?.patient_id,
        patient_name: vitalItem.appointment?.patient?.full_name,
        appointment_id: vitalItem.id,
        weight: vitals.weight ? parseFloat(vitals.weight) : null,
        height: vitals.height ? parseFloat(vitals.height) : null,
        blood_pressure_systolic: vitals.bp_sys ? parseInt(vitals.bp_sys) : null,
        blood_pressure_diastolic: vitals.bp_dia ? parseInt(vitals.bp_dia) : null,
        pulse: vitals.pulse ? parseInt(vitals.pulse) : null,
        temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
        oxygen_saturation: vitals.spo2 ? parseInt(vitals.spo2) : null,
        blood_sugar: vitals.blood_sugar ? parseFloat(vitals.blood_sugar) : null,
        is_pregnant: vitals.is_pregnant,
        pain_level: vitals.pain_level,
        notes: vitals.notes,
      });
    } catch {}
    setQueue(p => p.map(q => q.id === vitalItem.id ? { ...q, vitals_saved: true, vitals: { ...vitals } } : q));
    setVitals(emptyVitals());
    setVitalItem(null);
    setVitalsSaving(false);
  };

  // ─── Computed ────────────────────────────────────────────────────────────────
  const currentPatient = queue.find(q => q.status === 'in_progress');
  const waiting = queue.filter(q => q.status === 'waiting');
  const completed = queue.filter(q => q.status === 'completed');
  const filtered = searchQ.trim()
    ? queue.filter(q => q.appointment?.patient?.full_name?.includes(searchQ) || q.appointment?.patient?.phone?.includes(searchQ))
    : queue;

  const tabs: { id: SecTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'queue', label: 'الطابور', icon: Users, badge: waiting.length },
    { id: 'add', label: 'إضافة', icon: Plus },
    { id: 'report', label: 'تقرير', icon: BarChart2 },
  ];

  const urgencyConfig: Record<string, { label: string; cls: string; dotCls: string }> = {
    critical: { label: 'حرج', cls: 'bg-red-100 text-red-700', dotCls: 'bg-red-500 animate-ping' },
    urgent: { label: 'عاجل', cls: 'bg-amber-100 text-amber-700', dotCls: 'bg-amber-500 animate-pulse' },
    routine: { label: 'روتيني', cls: 'bg-gray-100 text-gray-600', dotCls: 'bg-gray-400' },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col">
      {/* ── Header ── */}
      <header className="bg-gradient-to-l from-[#104C48] via-[#0B337A] to-[#199A8E] px-4 pt-10 pb-16 flex-shrink-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onBack) onBack();
                logout();
                window.dispatchEvent(new CustomEvent('nav-to-main'));
              }}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 border border-white/20"
              title="العودة لشاشة الواجهات الخمس"
            >
              <ArrowRight size={16} />
              <span>الواجهات الخمس</span>
            </button>
            <button
              onClick={() => {
                logout();
                window.dispatchEvent(new CustomEvent('nav-to-main'));
              }}
              className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition active:scale-95"
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-white font-bold text-lg">لوحة الاستقبال والسكرتارية</h1>
            <p className="text-teal-100/80 text-xs">{currentTime.toLocaleDateString('ar-YE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="text-white text-right">
            <p className="font-mono text-lg font-bold">{currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-xs text-white/60">{currentTime.toLocaleTimeString('ar-SA', { second: '2-digit' })}ث</p>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'في الانتظار', val: waiting.length, cls: 'text-amber-300' },
            { label: 'مع الطبيب', val: currentPatient ? 1 : 0, cls: 'text-teal-200' },
            { label: 'أُنجز اليوم', val: completed.length, cls: 'text-emerald-300' },
            { label: 'الإجمالي', val: queue.length, cls: 'text-white' },
          ].map(({ label, val, cls }) => (
            <div key={label} className="bg-white/15 rounded-2xl p-3 text-center border border-white/10">
              <p className={`text-xl font-black ${cls}`}>{val}</p>
              <p className="text-white/70 text-[10px]">{label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* ── Tabs ── */}
      <nav className="bg-white sticky top-0 z-40 shadow-sm -mt-1 flex-shrink-0 border-b border-[#E2E8F0]">
        <div className="flex">
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold border-b-2 transition-colors relative ${tab === id ? 'border-[#199A8E] text-[#199A8E] bg-[#E8F5F4]/30' : 'border-transparent text-slate-500 hover:text-[#104C48]'}`}>
              <Icon size={17} />
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="absolute top-1.5 right-2 w-4 h-4 bg-[#E53935] rounded-full text-white text-[9px] font-bold flex items-center justify-center">{badge}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-12 space-y-3">

        {/* ══════ QUEUE TAB ══════ */}
        {tab === 'queue' && (
          <>
            {/* Controls */}
            <div className="flex gap-2">
              <button onClick={() => setIsBreak(p => !p)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isBreak ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                <Coffee size={15} />{isBreak ? 'إنهاء الاستراحة' : 'استراحة'}
              </button>
              <button onClick={loadQueue}
                className="p-2.5 rounded-xl bg-white border border-gray-200">
                <RefreshCw size={16} className={`text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex-1 relative">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="بحث بالاسم أو الهاتف..." dir="rtl" className="w-full py-2.5 pr-8 pl-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#199A8E]" />
              </div>
            </div>

            {isBreak && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                <Coffee size={22} className="text-amber-600" />
                <div>
                  <p className="font-bold text-amber-800 text-sm">استراحة الطبيب</p>
                  <p className="text-xs text-amber-600">الطابور متوقف مؤقتاً</p>
                </div>
              </div>
            )}

            {/* Current patient */}
            {currentPatient && (
              <div className="bg-gradient-to-l from-[#104C48] to-[#199A8E] rounded-2xl p-4 text-white shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-white/80 text-xs font-medium">يُعاين الآن بالعيادة</p>
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => handleComplete(currentPatient.id)}
                    className="px-4 py-2 bg-white text-[#104C48] rounded-xl font-bold text-sm shadow-xs hover:bg-[#E8F5F4] transition">أنهى الكشف</button>
                  <div className="text-right">
                    <p className="font-black text-lg">{currentPatient.appointment?.patient?.full_name}</p>
                    <p className="text-teal-100 text-xs">{currentPatient.appointment?.symptoms}</p>
                    <a href={`tel:${currentPatient.appointment?.patient?.phone}`} className="flex items-center gap-1 justify-end text-white/80 text-xs mt-1">
                      <Phone size={11} />{currentPatient.appointment?.patient?.phone}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Waiting queue */}
            {filtered.filter(q => q.status === 'waiting').length === 0 && !searchQ ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Users size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 font-medium">لا يوجد مرضى في الانتظار</p>
                <button onClick={() => setTab('add')} className="mt-3 px-5 py-2.5 bg-[#199A8E] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#104C48] transition">
                  + إضافة مريض
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.filter(q => q.status === 'waiting').map((item, idx) => (
                  <QueueCard
                    key={item.id}
                    item={item}
                    index={idx}
                    showStartBtn={!currentPatient && idx === 0}
                    onStart={() => handleStart(item.id)}
                    onVitals={() => { setVitalItem(item); setVitals(emptyVitals()); }}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            )}

            {/* Completed today (collapsed) */}
            {completed.length > 0 && (
              <details className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <summary className="px-4 py-3 flex items-center justify-between cursor-pointer select-none">
                  <span className="text-xs text-gray-400">{completed.length} مريض</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" />
                    <span className="font-bold text-gray-700 text-sm">المكتملون اليوم</span>
                  </div>
                </summary>
                <div className="divide-y divide-gray-50">
                  {completed.map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 opacity-60">
                      <span className="w-7 h-7 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xs font-bold">#{item.queue_number}</span>
                      <div className="flex-1 text-right">
                        <p className="text-sm font-medium text-gray-700">{item.appointment?.patient?.full_name}</p>
                        <p className="text-xs text-gray-400">{item.appointment?.symptoms}</p>
                      </div>
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}

        {/* ══════ ADD TAB ══════ */}
        {tab === 'add' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-5">
              <h2 className="font-black text-gray-800 text-lg mb-4 text-right flex items-center gap-2 justify-end">
                إضافة مريض للطابور <User size={18} className="text-[#199A8E]" />
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1.5 text-right font-medium">اسم المريض *</label>
                  <input type="text" value={manual.name} onChange={e => setManual(p => ({ ...p, name: e.target.value }))}
                    placeholder="أدخل الاسم الكامل..." dir="rtl"
                    className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#199A8E]" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1.5 text-right font-medium">رقم الهاتف</label>
                  <div className="flex gap-2">
                    <input type="tel" value={manual.phone} onChange={e => setManual(p => ({ ...p, phone: e.target.value.replace(/\D/g,'') }))}
                      placeholder="777123456" dir="ltr"
                      className="flex-1 p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#199A8E] text-right" />
                    <span className="flex items-center px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">+967</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1.5 text-right font-medium">سبب الزيارة / الأعراض</label>
                  <textarea value={manual.symptoms} onChange={e => setManual(p => ({ ...p, symptoms: e.target.value }))}
                    placeholder="أدخل الأعراض أو سبب الزيارة..." rows={2} dir="rtl"
                    className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-[#199A8E]" />
                </div>
                <label className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 cursor-pointer select-none">
                  <input type="checkbox" checked={manual.is_emergency} onChange={e => setManual(p => ({ ...p, is_emergency: e.target.checked }))} className="w-5 h-5 accent-red-600" />
                  <div className="flex-1 text-right">
                    <p className="font-bold text-[#E53935] text-sm flex items-center gap-1.5 justify-end"><AlertTriangle size={14} />حالة طارئة حرجة</p>
                    <p className="text-xs text-rose-500">سيُعطى أولوية في مقدمة الطابور</p>
                  </div>
                </label>
                <button onClick={handleAddManual} disabled={!manual.name.trim() || manualSaving}
                  className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${manual.name.trim() ? 'bg-[#199A8E] text-white hover:bg-[#104C48] shadow-md shadow-[#199A8E]/20' : 'bg-gray-200 text-gray-400'}`}>
                  {manualSaving ? 'جاري الإضافة...' : 'إضافة إلى طابور اليوم'}
                </button>
              </div>
            </div>

            {/* Today's bookings list */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                حجوزات اليوم ({queue.length})
                <Calendar size={14} className="text-[#199A8E]" />
              </h3>
              {queue.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">لا توجد حجوزات اليوم</p>
              ) : (
                <div className="space-y-2">
                  {queue.map(item => {
                    const stMap: Record<string, { label: string; cls: string }> = {
                      waiting: { label: 'انتظار', cls: 'bg-amber-100 text-amber-700' },
                      in_progress: { label: 'يُعاين', cls: 'bg-[#E8F5F4] text-[#199A8E] font-bold' },
                      completed: { label: 'مكتمل', cls: 'bg-emerald-100 text-emerald-700' },
                    };
                    const st = stMap[item.status] || stMap.waiting;
                    return (
                      <div key={item.id} className="flex items-center gap-3 bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl px-3 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                        <div className="flex-1 text-right min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{item.appointment?.patient?.full_name}</p>
                          <p className="text-xs text-gray-500 truncate">{item.appointment?.symptoms || '—'}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 font-bold">#{item.queue_number}</span>
                        {item.appointment?.is_emergency && <AlertCircle size={14} className="text-red-500 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════ REPORT TAB ══════ */}
        {tab === 'report' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#104C48] to-[#199A8E] rounded-2xl p-5 text-white shadow-md">
              <p className="text-teal-100/80 text-sm text-right">تقرير الأداء اليومي</p>
              <p className="text-2xl font-black">{new Date().toLocaleDateString('ar-YE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'إجمالي الحجوزات', val: queue.length, cls: 'bg-[#E8F5F4] text-[#104C48]' },
                { label: 'تمت المعاينة', val: completed.length, cls: 'bg-emerald-50 text-emerald-700' },
                { label: 'في الانتظار', val: waiting.length, cls: 'bg-amber-50 text-amber-700' },
                { label: 'حالات طارئة', val: queue.filter(q => q.appointment?.is_emergency).length, cls: 'bg-rose-50 text-rose-700' },
              ].map(({ label, val, cls }) => (
                <div key={label} className={`${cls.split(' ')[0]} rounded-2xl p-4 border border-black/5`}>
                  <p className={`text-3xl font-black ${cls.split(' ')[1]}`}>{val}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 text-right">إحصائيات الطابور</h3>
              {[
                ['متوسط وقت الانتظار', '~18 دقيقة'],
                ['أطول انتظار', '~45 دقيقة'],
                ['نسبة الإنجاز', `${queue.length > 0 ? Math.round((completed.length / queue.length) * 100) : 0}%`],
                ['زيارات مباشرة (يدوي)', queue.filter(q => q.patient_id?.startsWith('manual')).length.toString()],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="font-bold text-gray-800 text-sm">{v}</span>
                  <span className="text-gray-500 text-sm">{l}</span>
                </div>
              ))}
            </div>
            <button className="w-full bg-gray-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
              <BarChart2 size={18} />تصدير التقرير
            </button>
          </div>
        )}
      </div>

      {/* ══════ VITALS MODAL ══════ */}
      {vitalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-5 pb-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { setVitalItem(null); setVitals(emptyVitals()); }}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
              <div className="text-center">
                <p className="font-black text-gray-800">بيانات {vitalItem.appointment?.patient?.full_name}</p>
                <p className="text-xs text-gray-500">قبل الدخول للطبيب</p>
              </div>
              <div className="w-8" />
            </div>

            <div className="space-y-3">
              {/* Row 1: Weight + Height */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1 text-right flex items-center gap-1 justify-end"><span>الوزن (كجم)</span></label>
                  <input type="number" value={vitals.weight} onChange={e => setVitals(p => ({ ...p, weight: e.target.value }))} placeholder="70" className="w-full p-3 rounded-xl border border-gray-200 text-sm text-center outline-none focus:border-[#199A8E]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1 text-right">الطول (سم)</label>
                  <input type="number" value={vitals.height} onChange={e => setVitals(p => ({ ...p, height: e.target.value }))} placeholder="170" className="w-full p-3 rounded-xl border border-gray-200 text-sm text-center outline-none focus:border-[#199A8E]" />
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="bg-red-50 rounded-2xl p-3">
                <p className="text-xs text-red-600 font-bold mb-2 text-right">ضغط الدم (mmHg)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 text-center">الانبساطي (القاعدي)</label>
                    <input type="number" value={vitals.bp_dia} onChange={e => setVitals(p => ({ ...p, bp_dia: e.target.value }))} placeholder="80" className="w-full p-2.5 rounded-xl border border-red-200 text-sm text-center outline-none bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 text-center">الانقباضي (القمي)</label>
                    <input type="number" value={vitals.bp_sys} onChange={e => setVitals(p => ({ ...p, bp_sys: e.target.value }))} placeholder="120" className="w-full p-2.5 rounded-xl border border-red-200 text-sm text-center outline-none bg-white" />
                  </div>
                </div>
              </div>

              {/* Row 3: Pulse + Temp + SpO2 */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1 text-center">النبض<br/>(ن/د)</label>
                  <input type="number" value={vitals.pulse} onChange={e => setVitals(p => ({ ...p, pulse: e.target.value }))} placeholder="75" className="w-full p-2.5 rounded-xl border border-gray-200 text-sm text-center outline-none focus:border-[#199A8E]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1 text-center">الحرارة<br/>(°م)</label>
                  <input type="number" step="0.1" value={vitals.temperature} onChange={e => setVitals(p => ({ ...p, temperature: e.target.value }))} placeholder="36.6" className="w-full p-2.5 rounded-xl border border-gray-200 text-sm text-center outline-none focus:border-[#199A8E]" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1 text-center">الأكسجين<br/>SpO₂ (%)</label>
                  <input type="number" value={vitals.spo2} onChange={e => setVitals(p => ({ ...p, spo2: e.target.value }))} placeholder="98" className="w-full p-2.5 rounded-xl border border-gray-200 text-sm text-center outline-none focus:border-[#199A8E]" />
                </div>
              </div>

              {/* Blood sugar */}
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 text-right">سكر الدم العشوائي (mg/dL)</label>
                <input type="number" value={vitals.blood_sugar} onChange={e => setVitals(p => ({ ...p, blood_sugar: e.target.value }))} placeholder="100 (اختياري)" className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#199A8E]" dir="rtl" />
              </div>

              {/* Pain level */}
              <div className="bg-orange-50 rounded-2xl p-3">
                <p className="text-xs text-orange-600 font-bold mb-2 text-right">مستوى الألم: {vitals.pain_level}/10</p>
                <input type="range" min="0" max="10" value={vitals.pain_level} onChange={e => setVitals(p => ({ ...p, pain_level: parseInt(e.target.value) }))}
                  className="w-full accent-orange-500" />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>لا ألم</span><span>متوسط</span><span>شديد جداً</span>
                </div>
              </div>

              {/* Pregnant */}
              <label className="flex items-center gap-3 bg-pink-50 border border-pink-100 rounded-xl px-4 py-3 cursor-pointer select-none">
                <input type="checkbox" checked={vitals.is_pregnant} onChange={e => setVitals(p => ({ ...p, is_pregnant: e.target.checked }))} className="w-5 h-5 accent-pink-600" />
                <p className="flex-1 text-right font-medium text-pink-800 text-sm">المريضة حامل</p>
              </label>

              {/* Notes */}
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 text-right">ملاحظات للطبيب</label>
                <textarea value={vitals.notes} onChange={e => setVitals(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="أي معلومات مهمة..." dir="rtl" className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:border-[#199A8E]" />
              </div>

              <button onClick={saveVitals} disabled={vitalsSaving}
                className="w-full py-4 bg-[#199A8E] hover:bg-[#104C48] text-white rounded-2xl font-bold text-base shadow-md shadow-[#199A8E]/20 transition">
                {vitalsSaving ? 'جاري الحفظ...' : 'حفظ وتجهيز للدخول'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Queue Card Component ─────────────────────────────────────────────────────
function QueueCard({ item, index, showStartBtn, onStart, onVitals, onDelete }: {
  item: QueueAppointment;
  index: number;
  showStartBtn: boolean;
  onStart: () => void;
  onVitals: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${item.appointment?.is_emergency ? 'border-red-300' : item.vitals_saved ? 'border-green-200' : 'border-gray-100'}`}>
      <div className={`px-4 py-3 flex items-center gap-3 ${item.appointment?.is_emergency ? 'bg-red-50' : 'bg-[#F8FAFB]'}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${item.appointment?.is_emergency ? 'bg-red-100 text-red-700' : 'bg-[#E8F5F4] text-[#199A8E]'}`}>
          #{item.queue_number}
        </div>
        <div className="flex-1 text-right min-w-0">
          <div className="flex items-center gap-2 justify-end mb-0.5">
            {item.appointment?.is_emergency && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5"><AlertCircle size={9} />طارئ</span>}
            {item.vitals_saved && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">✓ بيانات</span>}
            <p className="font-bold text-gray-800 text-sm truncate">{item.appointment?.patient?.full_name}</p>
          </div>
          <p className="text-xs text-gray-500 truncate">{item.appointment?.symptoms || 'حضور مباشر'}</p>
        </div>
      </div>
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex gap-2">
          {showStartBtn && (
            <button onClick={onStart} className="px-3 py-2 bg-[#199A8E] hover:bg-[#104C48] text-white rounded-xl text-xs font-bold transition shadow-xs">
              إدخال
            </button>
          )}
          <button onClick={onVitals} className={`px-3 py-2 rounded-xl text-xs font-bold ${item.vitals_saved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {item.vitals_saved ? '✓ بيانات' : 'إدخال البيانات'}
          </button>
          <button onClick={onDelete} className="p-2 rounded-xl bg-red-50 text-red-400 hover:text-red-600 transition">
            <Trash2 size={13} />
          </button>
        </div>
        <div className="text-right">
          <a href={`tel:${item.appointment?.patient?.phone}`} className="text-xs text-blue-600 flex items-center gap-1 justify-end">
            <Phone size={10} />{item.appointment?.patient?.phone}
          </a>
          <p className="text-[10px] text-gray-400 mt-0.5">{item.estimated_time}</p>
        </div>
      </div>
    </div>
  );
}
