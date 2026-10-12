import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  QrCode,
  RotateCcw,
  Navigation,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Appointment } from '../types';

interface AppointmentsPageProps {
  onBack?: () => void;
  onSelectAppointment?: (appointment: Appointment) => void;
  onBookNew?: () => void;
}

type TabType = 'upcoming' | 'completed' | 'cancelled';

export function AppointmentsPage({ onBack, onBookNew }: AppointmentsPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedQR, setSelectedQR] = useState<Appointment | null>(null);
  const [rescheduleItem, setRescheduleItem] = useState<Appointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, doctor:doctors(*), clinic:clinics(*)')
        .order('appointment_date', { ascending: true });

      if (!error && data && data.length > 0) {
        setAppointments(data as Appointment[]);
      } else {
        setAppointments(getDemoAppointments());
      }
    } catch {
      setAppointments(getDemoAppointments());
    }
  };

  const getDemoAppointments = (): Appointment[] => [
    {
      id: 'YA-84920',
      patient_id: 'p1',
      doctor_id: 'd1',
      doctor: {
        id: 'd1',
        full_name: 'د. سامي المقطري',
        specialization: { id: 's1', name_ar: 'طب القلب والأوعية الدموية', name_en: 'Cardiology' },
        consultation_fee: 3500,
        average_consultation_time: 15,
        rating: 4.9,
      } as any,
      clinic: {
        name: 'مستشفى الثورة التعليمي',
        address: 'صنعاء — شارع الخمسين',
      } as any,
      appointment_date: new Date().toISOString().split('T')[0],
      queue_number: 3,
      estimated_time: '04:30 م',
      status: 'confirmed',
      payment_status: 'paid',
      payment_amount: 3500,
      symptoms: 'ألم في الصدر مع دوار خفيف',
      created_at: new Date().toISOString(),
    },
    {
      id: 'YA-72145',
      patient_id: 'p1',
      doctor_id: 'd2',
      doctor: {
        id: 'd2',
        full_name: 'د. فاطمة الشامي',
        specialization: { id: 's2', name_ar: 'طب الأطفال وحديثي الولادة', name_en: 'Pediatrics' },
        consultation_fee: 3000,
        rating: 4.8,
      } as any,
      clinic: {
        name: 'المستشفى الكويتي التخصصي',
        address: 'صنعاء — شارع الستين',
      } as any,
      appointment_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      queue_number: 7,
      estimated_time: '06:00 م',
      status: 'confirmed',
      payment_status: 'paid',
      payment_amount: 3000,
      symptoms: 'متابعة لقاحات الطفل الدورية',
      created_at: new Date().toISOString(),
    },
    {
      id: 'YA-63910',
      patient_id: 'p1',
      doctor_id: 'd3',
      doctor: {
        id: 'd3',
        full_name: 'د. محمد العولقي',
        specialization: { id: 's3', name_ar: 'جراحة العظام والمفاصل', name_en: 'Orthopedics' },
        consultation_fee: 4000,
        rating: 4.9,
      } as any,
      clinic: {
        name: 'المركز الاستشاري اليمني',
        address: 'صنعاء — حي حدة',
      } as any,
      appointment_date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      queue_number: 12,
      estimated_time: '11:00 ص',
      status: 'completed',
      payment_status: 'paid',
      payment_amount: 4000,
      symptoms: 'ألم في الركبة اليمنى بعد التواء',
      created_at: new Date().toISOString(),
    },
    {
      id: 'YA-51208',
      patient_id: 'p1',
      doctor_id: 'd4',
      doctor: {
        id: 'd4',
        full_name: 'د. أحمد الصبري',
        specialization: { id: 's4', name_ar: 'طب وجراحة العيون', name_en: 'Ophthalmology' },
        consultation_fee: 3000,
        rating: 4.7,
      } as any,
      clinic: {
        name: 'مستشفى مغربي للعيون',
        address: 'صنعاء — حدة',
      } as any,
      appointment_date: new Date(Date.now() - 86400000 * 12).toISOString().split('T')[0],
      queue_number: 4,
      estimated_time: '09:30 ص',
      status: 'cancelled',
      payment_status: 'refunded',
      payment_amount: 3000,
      symptoms: 'فحص قاع العين وتغير قياس النظارة',
      created_at: new Date().toISOString(),
    },
  ];

  const filteredAppointments = appointments.filter((app) => {
    if (activeTab === 'upcoming') return app.status === 'confirmed' || app.status === 'pending';
    if (activeTab === 'completed') return app.status === 'completed';
    if (activeTab === 'cancelled') return app.status === 'cancelled';
    return true;
  });

  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
    );
    showToast('تم إلغاء الموعد واسترداد الرسوم بنجاح');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-28">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 z-50 max-w-sm mx-auto bg-[#104C48] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between text-xs animate-slide-down">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)}>
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
          <h1 className="text-base font-bold text-[#104C48]">إدارة المواعيد الطبية</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Tabbed View: Upcoming, Completed, Cancelled */}
        <div className="bg-[#E8F5F4]/60 p-1 rounded-2xl flex items-center border border-[#199A8E]/15">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'upcoming'
                ? 'bg-[#199A8E] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#104C48]'
            }`}
          >
            القادمة ({appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'completed'
                ? 'bg-[#199A8E] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#104C48]'
            }`}
          >
            المكتملة ({appointments.filter((a) => a.status === 'completed').length})
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'cancelled'
                ? 'bg-[#199A8E] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#104C48]'
            }`}
          >
            الملغاة ({appointments.filter((a) => a.status === 'cancelled').length})
          </button>
        </div>

        {/* List of Ticket-Style Cards */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-[24px] p-8 text-center border border-[#E2E8F0] shadow-sm my-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#E8F5F4] text-[#199A8E] flex items-center justify-center mx-auto">
              <Calendar size={28} />
            </div>
            <h3 className="font-bold text-sm text-[#104C48]">لا توجد مواعيد في هذا القسم</h3>
            <p className="text-xs text-slate-400">يمكنك حجز موعد جديد مع نخبة الأطباء في أي وقت.</p>
            {onBookNew && (
              <button
                onClick={onBookNew}
                className="mt-2 py-2.5 px-6 rounded-xl bg-[#199A8E] text-white font-bold text-xs"
              >
                احجز موعد جديد
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((app) => {
              const isUpcoming = app.status === 'confirmed' || app.status === 'pending';
              const isCompleted = app.status === 'completed';

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(25,154,142,0.07)] overflow-hidden transition-all"
                >
                  {/* Ticket Header Strip */}
                  <div className="bg-[#E8F5F4] px-4 py-2.5 border-b border-[#199A8E]/15 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#104C48]">{app.id}</span>
                      <span className="text-[10px] text-slate-400">· تذكرة موعد</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isUpcoming
                          ? 'bg-[#199A8E] text-white'
                          : isCompleted
                          ? 'bg-[#2E7D32]/15 text-[#2E7D32]'
                          : 'bg-[#E53935]/15 text-[#E53935]'
                      }`}
                    >
                      {isUpcoming ? 'مؤكد ومحجوز' : isCompleted ? 'مكتمل' : 'ملغي'}
                    </span>
                  </div>

                  {/* Ticket Body */}
                  <div className="p-4 space-y-3.5">
                    {/* Doctor Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#E8F5F4] text-[#104C48] font-bold text-base flex items-center justify-center shrink-0 border border-[#199A8E]/30">
                          {app.doctor?.full_name?.split(' ')?.[1]?.[0] || 'ط'}
                        </div>
                        <div className="text-right">
                          <h3 className="font-bold text-sm text-[#104C48]">{app.doctor?.full_name}</h3>
                          <p className="text-xs text-[#199A8E] font-medium">{app.doctor?.specialization?.name_ar || 'استشاري'}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <MapPin size={11} />
                            <span>{app.clinic?.name} — {app.clinic?.address}</span>
                          </p>
                        </div>
                      </div>

                      {/* Queue Number Badge */}
                      {isUpcoming && (
                        <div className="bg-[#E8F5F4] border border-[#199A8E]/25 rounded-2xl px-3 py-2 text-center shrink-0">
                          <span className="text-[10px] text-slate-500 block">رقمك</span>
                          <span className="text-base font-black text-[#104C48] font-mono leading-none">
                            #{app.queue_number}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Perforated Divider Simulation */}
                    <div className="relative py-1">
                      <div className="border-t border-dashed border-slate-200" />
                      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#F8FAFB] border border-[#E2E8F0]" />
                      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#F8FAFB] border border-[#E2E8F0]" />
                    </div>

                    {/* Date & Time Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8FAFB] p-2.5 rounded-xl border border-[#E2E8F0]">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#199A8E]" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">تاريخ الزيارة</span>
                          <span className="font-bold text-slate-700 font-mono">{app.appointment_date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#199A8E]" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">الوقت التقديري</span>
                          <span className="font-bold text-slate-700 font-mono">{app.estimated_time || '04:30 م'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      {isUpcoming ? (
                        <>
                          <button
                            onClick={() => setSelectedQR(app)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-[#E8F5F4] hover:bg-[#d4ede9] text-[#104C48] font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                          >
                            <QrCode size={16} className="text-[#199A8E]" />
                            <span>باركود الدخول (QR)</span>
                          </button>

                          <button
                            onClick={() => setRescheduleItem(app)}
                            className="py-2.5 px-3 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-slate-600 font-semibold text-xs flex items-center gap-1 transition active:scale-95"
                          >
                            <RotateCcw size={14} />
                            <span>تعديل</span>
                          </button>

                          <button
                            onClick={() => handleCancelAppointment(app.id)}
                            className="py-2.5 px-3 rounded-xl text-[#E53935] hover:bg-rose-50 text-xs font-semibold transition"
                            title="إلغاء الموعد"
                          >
                            إلغاء
                          </button>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between text-xs text-slate-400">
                          <span>الرسوم المدفوعة: {app.payment_amount} ريال يمني</span>
                          <button
                            onClick={() => showToast('جاري فتح تفاصيل التقرير الطبي...')}
                            className="text-[#199A8E] font-bold hover:underline flex items-center gap-1"
                          >
                            <FileText size={14} />
                            <span>عرض التقرير</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* QR Code Check-in Modal */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 text-center shadow-2xl border border-[#E2E8F0] animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#104C48]">تذكرة الدخول الذكية</span>
              <button
                onClick={() => setSelectedQR(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={15} />
              </button>
            </div>

            <div className="my-5 flex flex-col items-center">
              {/* QR Simulation Box */}
              <div className="p-4 bg-white rounded-2xl border-2 border-[#199A8E] shadow-md inline-block">
                <div className="w-44 h-44 bg-[#F8FAFB] flex flex-col items-center justify-center border border-dashed border-[#199A8E]/40 rounded-xl relative">
                  <QrCode size={110} className="text-[#104C48]" />
                  <span className="text-[10px] font-mono text-slate-500 mt-2">
                    REF: {selectedQR.id}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <h4 className="font-bold text-sm text-[#104C48]">{selectedQR.doctor?.full_name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{selectedQR.clinic?.name}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-[#E8F5F4] text-[#199A8E] font-black rounded-full text-xs font-mono">
                  رقم الدور: #{selectedQR.queue_number}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
              أظهر هذا الرمز عند شباك استقبال العيادة للتأكيد الفوري والدخول للطبيب.
            </p>

            <button
              onClick={() => setSelectedQR(null)}
              className="w-full py-3 rounded-xl bg-[#199A8E] text-white font-bold text-xs active:scale-95 transition shadow-sm"
            >
              تم، العودة للمواعيد
            </button>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 text-right shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#104C48]">تعديل موعد الزيارة</span>
              <button
                onClick={() => setRescheduleItem(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={15} />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600">
                اختر موعداً جديداً مع <b className="text-[#104C48]">{rescheduleItem.doctor?.full_name}</b>:
              </p>

              <div className="space-y-2">
                {[
                  'غداً · 05:00 مساءً (متاح)',
                  'بعد غد · 06:30 مساءً (متاح)',
                  'الأحد القادم · 10:00 صباحاً (متاح)',
                ].map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      showToast('تم تحديث وتثبيت الموعد الجديد بنجاح');
                      setRescheduleItem(null);
                    }}
                    className="w-full p-3 rounded-xl bg-[#F8FAFB] hover:bg-[#E8F5F4] hover:text-[#199A8E] text-xs font-semibold text-slate-700 text-right border border-[#E2E8F0] transition active:scale-95"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setRescheduleItem(null)}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
