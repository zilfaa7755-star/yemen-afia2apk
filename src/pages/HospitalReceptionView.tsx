import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, UserPlus, X, Phone, Clock, CheckCircle, Users,
  Activity, HeartPulse, Droplet, Thermometer, Scale, Zap,
  AlertTriangle, ChevronLeft, Stethoscope, Coffee, Wallet,
  Smartphone, Bell, Plus, Minus, Timer,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type PaymentMethod = 'wallet' | 'cash';
type PatientStatus = 'waiting' | 'in_consultation' | 'completed' | 'postponed';

interface WaitingPatient {
  id: string;
  token: number;
  name: string;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  payment: PaymentMethod;
  status: PatientStatus;
  bookedAt: string;
  calledAt?: string;
  vitals?: VitalsRecord;
}

interface VitalsRecord {
  bp_systolic?: number;
  bp_diastolic?: number;
  pulse?: number;
  glucose?: number;
  temp?: number;
  weight?: number;
  isCritical?: boolean;
}

interface DoctorLane {
  id: string;
  name: string;
  specialty: string;
  badge: string;
  badgeColor: string;
  onBreak: boolean;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DOCTORS: DoctorLane[] = [
  { id: 'd1', name: 'د. سامي النجار', specialty: 'أمراض القلب والباطنية', badge: 'استشاري معتمد', badgeColor: 'bg-[#E8F5F4] text-[#104C48]', onBreak: false },
  { id: 'd2', name: 'د. نجيب المتوكل', specialty: 'جراحة العظام والمفاصل', badge: 'أخصائي', badgeColor: 'bg-teal-100 text-teal-700', onBreak: false },
  { id: 'd3', name: 'د. إلهام الشامي', specialty: 'النساء والولادة', badge: 'استراحة مؤقتة', badgeColor: 'bg-amber-100 text-amber-700', onBreak: true },
];

const INITIAL_QUEUE: Record<string, WaitingPatient[]> = {
  d1: [
    { id: 'p1', token: 1, name: 'أحمد محمد الأغبري', phone: '777123456', age: 45, gender: 'male', payment: 'wallet', status: 'in_consultation', bookedAt: new Date(Date.now() - 20 * 60000).toISOString(), calledAt: new Date(Date.now() - 8 * 60000).toISOString() },
    { id: 'p2', token: 2, name: 'سالم عبدالله الحكيمي', phone: '777234567', age: 52, gender: 'male', payment: 'cash', status: 'waiting', bookedAt: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: 'p3', token: 3, name: 'نورا يحيى الحيمي', phone: '777345678', age: 38, gender: 'female', payment: 'wallet', status: 'waiting', bookedAt: new Date(Date.now() - 10 * 60000).toISOString() },
    { id: 'p4', token: 4, name: 'خالد الشامي', phone: '777456789', age: 60, gender: 'male', payment: 'cash', status: 'waiting', bookedAt: new Date(Date.now() - 5 * 60000).toISOString() },
  ],
  d2: [
    { id: 'p5', token: 1, name: 'فاطمة علي المقطري', phone: '777567890', age: 30, gender: 'female', payment: 'wallet', status: 'in_consultation', bookedAt: new Date(Date.now() - 15 * 60000).toISOString(), calledAt: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 'p6', token: 2, name: 'محمد عبدالله الزبيدي', phone: '777678901', age: 28, gender: 'male', payment: 'cash', status: 'waiting', bookedAt: new Date(Date.now() - 8 * 60000).toISOString() },
    { id: 'p7', token: 3, name: 'ريم سالم الأغبري', phone: '777789012', age: 35, gender: 'female', payment: 'wallet', status: 'waiting', bookedAt: new Date(Date.now() - 3 * 60000).toISOString() },
  ],
  d3: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatElapsed(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function isCriticalVitals(v: VitalsRecord): boolean {
  if (v.bp_systolic && v.bp_diastolic) {
    return v.bp_systolic >= 180 || v.bp_diastolic >= 110;
  }
  return false;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface HospitalReceptionViewProps {
  onBack?: () => void;
}

export function HospitalReceptionView({ onBack }: HospitalReceptionViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [queue, setQueue] = useState<Record<string, WaitingPatient[]>>(INITIAL_QUEUE);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInDoctor, setWalkInDoctor] = useState<string>('d1');
  const [vitalsModal, setVitalsModal] = useState<{ doctorId: string; patientId: string } | null>(null);
  const [vitalsForm, setVitalsForm] = useState<VitalsRecord>({});
  const [showVitalsWarning, setShowVitalsWarning] = useState(false);
  const [callToast, setCallToast] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Walk-in form state
  const [walkInForm, setWalkInForm] = useState({ name: '', phone: '', age: '', gender: 'male' as 'male' | 'female' });

  // Live timer tick
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'F2') { e.preventDefault(); setShowWalkInModal(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const callNext = (doctorId: string) => {
    setQueue(prev => {
      const lane = [...(prev[doctorId] || [])];
      // complete current in-consultation
      const currentIdx = lane.findIndex(p => p.status === 'in_consultation');
      if (currentIdx >= 0) lane[currentIdx] = { ...lane[currentIdx], status: 'completed' };
      // call next waiting
      const nextIdx = lane.findIndex(p => p.status === 'waiting');
      if (nextIdx >= 0) {
        lane[nextIdx] = { ...lane[nextIdx], status: 'in_consultation', calledAt: new Date().toISOString() };
        const patient = lane[nextIdx];
        setCallToast(`نداء: ${patient.name} — الرقم ${patient.token}`);
        setTimeout(() => setCallToast(null), 3000);
      }
      return { ...prev, [doctorId]: lane };
    });
  };

  const postpone = (doctorId: string, patientId: string) => {
    setQueue(prev => {
      const lane = [...(prev[doctorId] || [])];
      const idx = lane.findIndex(p => p.id === patientId);
      if (idx >= 0) lane[idx] = { ...lane[idx], status: 'postponed' };
      // move to end of waiting
      const postponed = lane.splice(idx, 1)[0];
      lane.push(postponed);
      return { ...prev, [doctorId]: lane };
    });
  };

  const addWalkIn = () => {
    if (!walkInForm.name.trim() || !walkInForm.phone.trim()) return;
    const doctorId = walkInDoctor;
    setQueue(prev => {
      const lane = [...(prev[doctorId] || [])];
      const nextToken = lane.length + 1;
      const newPatient: WaitingPatient = {
        id: `walkin-${Date.now()}`,
        token: nextToken,
        name: walkInForm.name.trim(),
        phone: walkInForm.phone.trim(),
        age: parseInt(walkInForm.age) || 0,
        gender: walkInForm.gender,
        payment: 'cash',
        status: 'waiting',
        bookedAt: new Date().toISOString(),
      };
      lane.push(newPatient);
      return { ...prev, [doctorId]: lane };
    });
    setWalkInForm({ name: '', phone: '', age: '', gender: 'male' });
    setShowWalkInModal(false);
  };

  const saveVitals = () => {
    if (!vitalsModal) return;
    const critical = isCriticalVitals(vitalsForm);
    setQueue(prev => {
      const lane = [...(prev[vitalsModal.doctorId] || [])];
      const idx = lane.findIndex(p => p.id === vitalsModal.patientId);
      if (idx >= 0) lane[idx] = { ...lane[idx], vitals: { ...vitalsForm, isCritical: critical } };
      return { ...prev, [vitalsModal.doctorId]: lane };
    });
    if (critical) {
      setShowVitalsWarning(true);
      setTimeout(() => setShowVitalsWarning(false), 4000);
    }
    setVitalsModal(null);
    setVitalsForm({});
  };

  // ── Stats per doctor ────────────────────────────────────────────────────────
  const getStats = (doctorId: string) => {
    const lane = queue[doctorId] || [];
    return {
      total: lane.length,
      completed: lane.filter(p => p.status === 'completed').length,
      waiting: lane.filter(p => p.status === 'waiting').length,
      current: lane.find(p => p.status === 'in_consultation') || null,
      nextWaiting: lane.find(p => p.status === 'waiting') || null,
    };
  };

  // ── Search results ──────────────────────────────────────────────────────────
  const searchResults = searchQuery.trim()
    ? Object.entries(queue).flatMap(([doctorId, lane]) =>
        lane.filter(p =>
          p.name.includes(searchQuery) ||
          p.phone.includes(searchQuery) ||
          String(p.token).includes(searchQuery)
        ).map(p => ({ ...p, doctorId }))
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top Quick Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          {onBack && (
            <button onClick={onBack} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
          )}
          <div className="flex-1 relative">
            <Search size={18} className="absolute right-3 top-3 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الهاتف، أو الرقم... (F1)"
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={() => setShowWalkInModal(true)}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-l from-[#104C48] to-[#199A8E] text-white rounded-xl font-bold text-sm shadow-md whitespace-nowrap"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">تسجيل مريض جديد</span>
            <span className="sm:hidden">جديد</span>
            <kbd className="hidden md:inline text-[10px] bg-white/20 px-1.5 py-0.5 rounded">F2</kbd>
          </button>
        </div>
      </div>

      {/* Critical vitals warning */}
      {showVitalsWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-down">
          <AlertTriangle size={24} className="animate-pulse" />
          <div>
            <p className="font-black">أزمة ضغط دموي حرجة!</p>
            <p className="text-sm text-white/90">تم تسجيل قراءة &gt; 180/110 mmHg — يُنصح بنقل المريض للطوارئ</p>
          </div>
        </div>
      )}

      {/* Call toast */}
      {callToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-slide-down">
          <Bell size={20} className="animate-bounce" />
          <span className="font-bold">{callToast}</span>
        </div>
      )}

      {/* Search results overlay */}
      {searchQuery.trim() && (
        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-[#E8F5F4] border-b border-[#199A8E]/20">
              <p className="font-bold text-[#104C48] text-sm">نتائج البحث ({searchResults.length})</p>
            </div>
            {searchResults.length === 0 ? (
              <div className="text-center py-10">
                <Search size={40} className="mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">لا توجد نتائج مطابقة</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {searchResults.map(p => {
                  const doc = DOCTORS.find(d => d.id === p.doctorId);
                  return (
                    <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E8F5F4] rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="font-black text-[#104C48] text-sm">{p.token}</span>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500">{doc?.name} · {p.phone}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        p.status === 'in_consultation' ? 'bg-[#E8F5F4] text-[#104C48]' :
                        p.status === 'waiting' ? 'bg-amber-100 text-amber-700' :
                        p.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {p.status === 'in_consultation' ? 'في الكشف' : p.status === 'waiting' ? 'منتظر' : p.status === 'completed' ? 'مكتمل' : 'مؤجل'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Doctor Swimlanes */}
      {!searchQuery.trim() && (
        <div className="px-4 pt-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {DOCTORS.map(doctor => {
              const stats = getStats(doctor.id);
              return (
                <div key={doctor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                  {/* Doctor header */}
                  <div className={`px-4 py-4 ${doctor.onBreak ? 'bg-amber-50' : 'bg-gradient-to-l from-slate-700 to-slate-900'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${doctor.badgeColor}`}>
                        {doctor.onBreak && <Coffee size={10} className="inline ml-1" />}
                        {doctor.badge}
                      </span>
                      <div className="text-right">
                        <h3 className={`font-black ${doctor.onBreak ? 'text-amber-800' : 'text-white'}`}>{doctor.name}</h3>
                        <p className={`text-xs ${doctor.onBreak ? 'text-amber-600' : 'text-white/70'}`}>{doctor.specialty}</p>
                      </div>
                    </div>
                    {/* Counters */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className={`${doctor.onBreak ? 'bg-white/60' : 'bg-white/15'} rounded-xl p-2 text-center`}>
                        <p className={`font-black text-lg ${doctor.onBreak ? 'text-amber-800' : 'text-white'}`}>{stats.total}</p>
                        <p className={`text-[10px] ${doctor.onBreak ? 'text-amber-600' : 'text-white/70'}`}>إجمالي</p>
                      </div>
                      <div className={`${doctor.onBreak ? 'bg-white/60' : 'bg-white/15'} rounded-xl p-2 text-center`}>
                        <p className={`font-black text-lg ${doctor.onBreak ? 'text-amber-800' : 'text-white'}`}>{stats.completed}</p>
                        <p className={`text-[10px] ${doctor.onBreak ? 'text-amber-600' : 'text-white/70'}`}>مكتمل</p>
                      </div>
                      <div className={`${doctor.onBreak ? 'bg-white/60' : 'bg-white/15'} rounded-xl p-2 text-center`}>
                        <p className={`font-black text-lg ${doctor.onBreak ? 'text-amber-800' : 'text-white'}`}>{stats.waiting}</p>
                        <p className={`text-[10px] ${doctor.onBreak ? 'text-amber-600' : 'text-white/70'}`}>انتظار</p>
                      </div>
                    </div>
                  </div>

                  {doctor.onBreak ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12">
                      <Coffee size={40} className="text-amber-300 mb-3" />
                      <p className="text-amber-600 font-medium text-sm">الطبيب في استراحة</p>
                    </div>
                  ) : (
                    <>
                      {/* Current patient */}
                      {stats.current && (
                        <div className="px-4 py-3 bg-[#E8F5F4] border-b border-[#199A8E]/20">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <Timer size={14} className="text-[#199A8E]" />
                              <span className="text-sm font-mono font-bold text-[#104C48]">
                                {stats.current.calledAt ? formatElapsed(stats.current.calledAt) : '00:00'}
                              </span>
                            </div>
                            <span className="text-xs bg-[#E8F5F4] text-[#104C48] px-2 py-0.5 rounded-full font-bold animate-pulse">
                              في الكشف الآن
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#E8F5F4] rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="font-black text-[#104C48] text-xs">{stats.current.token}</span>
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-bold text-gray-800 text-sm">{stats.current.name}</p>
                              <p className="text-xs text-gray-500">{stats.current.phone}</p>
                            </div>
                          </div>
                          {stats.current.vitals && (
                            <div className="mt-2 flex flex-wrap gap-1.5 justify-end">
                              {stats.current.vitals.bp_systolic && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stats.current.vitals.isCritical ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                  ضغط: {stats.current.vitals.bp_systolic}/{stats.current.vitals.bp_diastolic}
                                </span>
                              )}
                              {stats.current.vitals.pulse && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">نبض: {stats.current.vitals.pulse}</span>
                              )}
                              {stats.current.vitals.glucose && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">سكر: {stats.current.vitals.glucose}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Next patient call card */}
                      {stats.nextWaiting ? (
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs text-gray-500 mb-2 text-right">المريض التالي:</p>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="font-black text-amber-700 text-xs">{stats.nextWaiting.token}</span>
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-bold text-gray-800 text-sm">{stats.nextWaiting.name}</p>
                              <div className="flex items-center gap-1.5 justify-end">
                                {stats.nextWaiting.payment === 'wallet' ? (
                                  <><Smartphone size={10} className="text-teal-600" /><span className="text-xs text-teal-600">محفظة رقمية</span></>
                                ) : (
                                  <><Wallet size={10} className="text-gray-500" /><span className="text-xs text-gray-500">نقداً</span></>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button
                              onClick={() => setVitalsModal({ doctorId: doctor.id, patientId: stats.nextWaiting!.id })}
                              className="flex flex-col items-center gap-1 py-2.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-100 transition-colors"
                            >
                              <Activity size={16} />
                              قياس المؤشرات
                            </button>
                            <button
                              onClick={() => callNext(doctor.id)}
                              className="flex flex-col items-center gap-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors"
                            >
                              <Stethoscope size={16} />
                              دخول
                            </button>
                            <button
                              onClick={() => postpone(doctor.id, stats.nextWaiting!.id)}
                              className="flex flex-col items-center gap-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                            >
                              <Clock size={16} />
                              تأجيل
                            </button>
                          </div>
                        </div>
                      ) : !stats.current ? (
                        <div className="px-4 py-6 text-center border-b border-gray-100">
                          <CheckCircle size={32} className="mx-auto text-green-300 mb-2" />
                          <p className="text-gray-400 text-sm">لا يوجد مرضى في الانتظار</p>
                        </div>
                      ) : null}

                      {/* Waiting list */}
                      <div className="flex-1 overflow-y-auto max-h-64">
                        {(queue[doctor.id] || []).filter(p => p.status === 'waiting').length === 0 ? (
                          <div className="text-center py-6">
                            <Users size={28} className="mx-auto text-gray-200 mb-1" />
                            <p className="text-gray-300 text-xs">قائمة الانتظار فارغة</p>
                          </div>
                        ) : (
                          (queue[doctor.id] || [])
                            .filter(p => p.status === 'waiting')
                            .slice(stats.nextWaiting ? 1 : 0)
                            .map(p => (
                              <div key={p.id} className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="font-bold text-gray-500 text-xs">{p.token}</span>
                                </div>
                                <div className="flex-1 text-right min-w-0">
                                  <p className="font-medium text-gray-700 text-sm truncate">{p.name}</p>
                                  <p className="text-xs text-gray-400">{p.phone}</p>
                                </div>
                                {p.payment === 'wallet' ? (
                                  <Smartphone size={12} className="text-teal-500" />
                                ) : (
                                  <Wallet size={12} className="text-gray-400" />
                                )}
                              </div>
                            ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Walk-in registration modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-slide-down">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setShowWalkInModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
              <div className="text-right">
                <h3 className="font-black text-gray-800">تسجيل مريض جديد</h3>
                <p className="text-xs text-gray-500">بدون حجز مسبق — تسجيل فوري</p>
              </div>
              <UserPlus size={20} className="text-[#199A8E]" />
            </div>

            <div className="space-y-4">
              {/* Doctor selector */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block text-right font-medium">الطبيب</label>
                <div className="grid grid-cols-3 gap-2">
                  {DOCTORS.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setWalkInDoctor(d.id)}
                      disabled={d.onBreak}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                        walkInDoctor === d.id ? 'bg-[#199A8E] text-white' : d.onBreak ? 'bg-gray-100 text-gray-300' : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {d.name.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1.5 block text-right">الاسم الرباعي *</label>
                <input
                  type="text"
                  value={walkInForm.name}
                  onChange={e => setWalkInForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: أحمد محمد علي الأغبري"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 text-right"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block text-right">الهاتف *</label>
                  <input
                    type="tel"
                    value={walkInForm.phone}
                    onChange={e => setWalkInForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="777xxx"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 text-right"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block text-right">العمر</label>
                  <input
                    type="number"
                    value={walkInForm.age}
                    onChange={e => setWalkInForm(p => ({ ...p, age: e.target.value }))}
                    placeholder="45"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-400 text-center"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block text-right">النوع</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setWalkInForm(p => ({ ...p, gender: 'female' }))}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold ${walkInForm.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-gray-50 text-gray-500'}`}
                    >أنثى</button>
                    <button
                      onClick={() => setWalkInForm(p => ({ ...p, gender: 'male' }))}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold ${walkInForm.gender === 'male' ? 'bg-[#E8F5F4] text-[#104C48]' : 'bg-gray-50 text-gray-500'}`}
                    >ذكر</button>
                  </div>
                </div>
              </div>

              <button
                onClick={addWalkIn}
                disabled={!walkInForm.name.trim() || !walkInForm.phone.trim()}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  walkInForm.name.trim() && walkInForm.phone.trim()
                    ? 'bg-gradient-to-l from-[#104C48] to-[#199A8E] text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Plus size={18} />
                تسجيل وإصدار رقم دور
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vitals modal */}
      {vitalsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-slide-down max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => { setVitalsModal(null); setVitalsForm({}); }} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
              <div className="text-right">
                <h3 className="font-black text-gray-800">قياس المؤشرات الحيوية</h3>
                <p className="text-xs text-gray-500">تسجيل قراءات ما قبل الكشف</p>
              </div>
              <Activity size={20} className="text-purple-600" />
            </div>

            <div className="space-y-3">
              {/* Blood pressure */}
              <div className="bg-red-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <HeartPulse size={16} className="text-red-600" />
                  <span className="text-sm font-bold text-gray-700">ضغط الدم (mmHg)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="انقباضي 120"
                    value={vitalsForm.bp_systolic || ''}
                    onChange={e => setVitalsForm(p => ({ ...p, bp_systolic: parseInt(e.target.value) || undefined }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-center font-bold text-sm outline-none ${
                      vitalsForm.bp_systolic && vitalsForm.bp_systolic >= 180 ? 'border-red-500 bg-red-100 text-red-700 animate-pulse' : 'border-gray-200'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="انبساطي 80"
                    value={vitalsForm.bp_diastolic || ''}
                    onChange={e => setVitalsForm(p => ({ ...p, bp_diastolic: parseInt(e.target.value) || undefined }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-center font-bold text-sm outline-none ${
                      vitalsForm.bp_diastolic && vitalsForm.bp_diastolic >= 110 ? 'border-red-500 bg-red-100 text-red-700 animate-pulse' : 'border-gray-200'
                    }`}
                  />
                </div>
                {vitalsForm.bp_systolic && vitalsForm.bp_systolic >= 180 && (
                  <p className="text-xs text-red-600 font-bold mt-2 text-right flex items-center gap-1 justify-end">
                    <AlertTriangle size={12} /> أزمة ضغط دموي حرجة! (&gt; 180/110)
                  </p>
                )}
              </div>

              {/* Pulse */}
              <div className="bg-purple-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-purple-600" />
                  <span className="text-sm font-bold text-gray-700">نبضات القلب (bpm)</span>
                </div>
                <input
                  type="number"
                  placeholder="72"
                  value={vitalsForm.pulse || ''}
                  onChange={e => setVitalsForm(p => ({ ...p, pulse: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-center font-bold text-sm outline-none focus:border-purple-400"
                />
              </div>

              {/* Glucose */}
              <div className="bg-[#E8F5F4] rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet size={16} className="text-[#199A8E]" />
                  <span className="text-sm font-bold text-gray-700">سكر الدم (mg/dL)</span>
                </div>
                <input
                  type="number"
                  placeholder="110"
                  value={vitalsForm.glucose || ''}
                  onChange={e => setVitalsForm(p => ({ ...p, glucose: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-center font-bold text-sm outline-none focus:border-blue-400"
                />
              </div>

              {/* Temp & Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer size={16} className="text-amber-600" />
                    <span className="text-sm font-bold text-gray-700">الحرارة (°C)</span>
                  </div>
                  <input
                    type="number"
                    placeholder="37"
                    value={vitalsForm.temp || ''}
                    onChange={e => setVitalsForm(p => ({ ...p, temp: parseFloat(e.target.value) || undefined }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-center font-bold text-sm outline-none focus:border-amber-400"
                  />
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale size={16} className="text-green-600" />
                    <span className="text-sm font-bold text-gray-700">الوزن (kg)</span>
                  </div>
                  <input
                    type="number"
                    placeholder="75"
                    value={vitalsForm.weight || ''}
                    onChange={e => setVitalsForm(p => ({ ...p, weight: parseFloat(e.target.value) || undefined }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-center font-bold text-sm outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <button
                onClick={saveVitals}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-purple-600 to-purple-800 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                حفظ القياسات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
