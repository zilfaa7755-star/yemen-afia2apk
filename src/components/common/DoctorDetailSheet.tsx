import React, { useState } from 'react';
import {
  X, Star, MapPin, Clock, Users, Stethoscope, Zap, Video,
  Check, Navigation, Calendar, Award, GraduationCap, Briefcase,
  TrendingUp, ShieldCheck, Phone, FileText, Languages, BookOpen,
  Wallet, CreditCard, Banknote, Shield, CheckCircle2, MessageSquare
} from 'lucide-react';
import type { Doctor } from '../../types';
import { FacilityInteractiveMap } from './FacilityInteractiveMap';

export type ConsultationType = 'clinic' | 'emergency' | 'remote';

interface DoctorDetailSheetProps {
  doctor: Doctor;
  queueInfo: { queueNumber: number; estimatedWaitMinutes: number; estimatedArrivalTime: string };
  distance: number;
  onClose: () => void;
  onBook: (consultationType: ConsultationType) => void;
}

const doctorExtras: Record<string, {
  qualifications: string[];
  certificates: { title: string; issuer: string; year: string }[];
  languages: string[];
  experienceYears: number;
  education: string;
  services: string[];
  totalPatients: number;
  successRate: number;
  phone: string;
  licenseNumber: string;
  hospital: string;
  testimonials: { id: string; author: string; text: string; rating: number; date: string }[];
}> = {
  '1': {
    qualifications: ['بكالوريوس طب وجراحة - جامعة صنعاء (2008)', 'دبلوم الباطنة العامة - المجلس العربي للطب (2013)', 'زمالة الكلية الملكية البريطانية MRCP (2017)'],
    certificates: [{ title: 'دبلوم الأمراض الباطنة', issuer: 'المجلس العربي', year: '2013' }],
    languages: ['العربية', 'الإنجليزية'],
    experienceYears: 16, education: 'جامعة صنعاء - كلية الطب',
    services: ['كشف باطني عام', 'متابعة السكري', 'متابعة ضغط الدم', 'أمراض الغدد والقسطرة'],
    totalPatients: 3420, successRate: 98, phone: '777001001', licenseNumber: 'LIC-20345',
    hospital: 'مستشفى الثورة التعليمي — صنعاء',
    testimonials: [
      { id: 't1', author: 'أحمد صالح', text: 'طبيب متميز وصبور جداً في الاستماع للأعراض وتشخيص دقيق ساعد والدي كثيراً.', rating: 5, date: 'قبل يومين' },
      { id: 't2', author: 'منى الأهدل', text: 'المتابعة ممتازة عبر التطبيق والعيادة منظمة وملتزمين بالمواعيد.', rating: 5, date: 'قبل أسبوع' },
    ],
  },
  '2': {
    qualifications: ['بكالوريوس طب وجراحة - جامعة عدن (2010)', 'دبلوم أمراض القلب - المجلس العربي (2015)', 'زمالة القسطرة القلبية - جامعة برلين (2019)'],
    certificates: [{ title: 'دبلوم أمراض القلب', issuer: 'المجلس العربي', year: '2015' }],
    languages: ['العربية', 'الإنجليزية', 'الألمانية'],
    experienceYears: 14, education: 'جامعة عدن - كلية الطب',
    services: ['قسطرة قلبية', 'علاج الجلطات', 'متابعة أمراض القلب', 'تخطيط القلب'],
    totalPatients: 2180, successRate: 96, phone: '777002002', licenseNumber: 'LIC-20412',
    hospital: 'المستشفى الكويتي التخصصي — صنعاء',
    testimonials: [
      { id: 't1', author: 'فؤاد الحميري', text: 'أفضل دكتورة قلب في أمانة العاصمة، فحص دقيق وشرح وافٍ للحالة.', rating: 5, date: 'قبل 3 أيام' },
    ],
  },
};

// Next 7 Days Generator for Horizontal Booking Calendar
const getNext7Days = () => {
  const days = [];
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      dateStr: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'اليوم' : i === 1 ? 'غداً' : dayNames[d.getDay()],
      dayNum: d.getDate(),
      monthName: d.toLocaleDateString('ar-YE', { month: 'short' }),
      isAvailable: d.getDay() !== 5, // Friday off
    });
  }
  return days;
};

export function DoctorDetailSheet({ doctor, queueInfo, distance, onClose, onBook }: DoctorDetailSheetProps) {
  const [tab, setTab] = useState<'booking' | 'bio' | 'schedule'>('booking');
  const [consultationType, setConsultationType] = useState<ConsultationType>('clinic');
  const [paymentChoice, setPaymentChoice] = useState('wallet');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingDetails, setBookingDetails] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);

  // 7-day selector state
  const calendarDays = getNext7Days();
  const [selectedDate, setSelectedDate] = useState(calendarDays[0].dateStr);

  // Time slot state
  const morningSlots = [
    { time: '09:00 ص', available: true },
    { time: '09:30 ص', available: true },
    { time: '10:00 ص', available: false },
    { time: '10:30 ص', available: true },
    { time: '11:00 ص', available: true },
  ];

  const eveningSlots = [
    { time: '04:00 م', available: true },
    { time: '04:30 م', available: true },
    { time: '05:00 م', available: true },
    { time: '05:30 م', available: false },
    { time: '06:00 م', available: true },
    { time: '06:30 م', available: true },
  ];

  const [selectedSlot, setSelectedSlot] = useState('04:30 م');

  const extras = doctorExtras[doctor.id] || doctorExtras['1'];
  const waitingAhead = queueInfo.queueNumber - 1;

  const fee = consultationType === 'emergency'
    ? Math.round((doctor.consultation_fee || 3500) * 1.5)
    : consultationType === 'remote'
    ? Math.round((doctor.consultation_fee || 3500) * 0.7)
    : (doctor.consultation_fee || 3500);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-[28px] w-full max-w-lg max-h-[92vh] overflow-y-auto animate-slide-up shadow-2xl border-t border-[#E2E8F0]">
        {/* Top Header Card (Clinical Teal & Deep Pine) */}
        <div className="bg-gradient-to-br from-[#104C48] via-[#125853] to-[#199A8E] px-5 pt-6 pb-8 rounded-t-[28px] relative text-white">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition active:scale-95"
          >
            <X size={18} className="text-white" />
          </button>

          <div className="flex items-center gap-4 mt-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-[#E8F5F4] text-[#104C48] flex items-center justify-center font-black text-2xl shrink-0 border-2 border-white/40 shadow-md">
                {doctor.full_name?.split(' ')?.[1]?.[0] || 'ط'}
              </div>
              <span className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-[#199A8E] text-white flex items-center justify-center text-xs ring-2 ring-white font-bold" title="طبيب موثق ومعتمد">
                ✓
              </span>
            </div>

            <div className="flex-1 min-w-0 text-right">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-white truncate">{doctor.full_name}</h2>
                <ShieldCheck size={18} className="text-[#38B2AC] shrink-0" />
              </div>
              <p className="text-teal-100 text-xs mt-0.5 truncate">{doctor.specialization?.name_ar || 'استشاري تخصصي'}</p>
              <p className="text-white/80 text-[11px] mt-0.5 truncate flex items-center gap-1">
                <MapPin size={11} className="text-[#38B2AC] shrink-0" />
                <span>{extras.hospital}</span>
              </p>

              {/* Stats & Rating Row */}
              <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-lg px-2 py-0.5 text-white font-bold">
                  <Star size={12} className="text-[#FFB800]" fill="#FFB800" strokeWidth={0} />
                  <span>{doctor.rating}</span>
                </div>
                <span className="text-white/80 text-[11px]">({doctor.total_reviews} تقييم)</span>
                <span className="text-white/40">·</span>
                <span className="text-teal-100 text-[11px] font-semibold">{extras.experienceYears} سنة خبرة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="px-5 pb-8">
          {/* Segmented Tab Controls */}
          <div className="bg-white rounded-2xl -mt-4 relative z-10 p-1.5 shadow-md border border-[#E2E8F0] flex gap-1" dir="rtl">
            {[
              { id: 'booking', label: 'حجز الموعد' },
              { id: 'bio', label: 'الملف والخبرات' },
              { id: 'schedule', label: 'التقييمات والدوام' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex-1 rounded-xl px-2 py-2.5 text-xs font-bold transition-all ${
                  tab === t.id
                    ? 'bg-[#199A8E] text-white shadow-sm'
                    : 'text-slate-500 hover:text-[#104C48] hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Booking Tab ── */}
          {tab === 'booking' && (
            <div className="pt-5 space-y-4" dir="rtl">
              {/* Consultation Type Selector */}
              <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
                <h3 className="font-bold text-[#104C48] text-xs mb-3">اختر نوع الاستشارة الطبية</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'clinic' as const, label: 'عيادة حضورية', icon: Stethoscope, desc: 'حضور مباشر', f: fee },
                    { id: 'emergency' as const, label: 'أولوية عاجلة', icon: Zap, desc: 'طوارئ أسرع', f: Math.round((doctor.consultation_fee || 3500) * 1.5) },
                    { id: 'remote' as const, label: 'استشارة مرئية', icon: Video, desc: 'مكالمة فيديو', f: Math.round((doctor.consultation_fee || 3500) * 0.7) },
                  ].map(({ id, label, icon: Icon, desc, f }) => (
                    <button
                      key={id}
                      onClick={() => setConsultationType(id)}
                      className={`rounded-2xl border-2 p-2.5 text-center transition-all ${
                        consultationType === id
                          ? 'border-[#199A8E] bg-[#E8F5F4]'
                          : 'border-[#E2E8F0] bg-white hover:border-slate-300'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`mx-auto mb-1 ${consultationType === id ? 'text-[#199A8E]' : 'text-slate-400'}`}
                      />
                      <span className={`block text-xs font-bold ${consultationType === id ? 'text-[#104C48]' : 'text-slate-700'}`}>
                        {label}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{desc}</span>
                      <span className="block text-[11px] font-bold text-[#199A8E] mt-1">{f.toLocaleString()} ر.ي</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* ── Interactive Booking Calendar (Horizontal 7-day scrollable) ── */}
              <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#104C48] text-xs flex items-center gap-1.5">
                    <Calendar size={15} className="text-[#199A8E]" />
                    <span>حدد يوم الموعد</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">{selectedDate}</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {calendarDays.map((cd) => {
                    const isSelected = selectedDate === cd.dateStr;
                    return (
                      <button
                        key={cd.dateStr}
                        onClick={() => {
                          if (cd.isAvailable) setSelectedDate(cd.dateStr);
                        }}
                        disabled={!cd.isAvailable}
                        className={`min-w-[62px] py-2.5 px-1.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-[#199A8E] text-white shadow-md shadow-[#199A8E]/30 font-bold'
                            : cd.isAvailable
                            ? 'bg-[#F8FAFB] text-slate-700 border border-[#E2E8F0] hover:border-[#199A8E]/50'
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-transparent'
                        }`}
                      >
                        <span className={`text-[10px] mb-0.5 ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                          {cd.dayName}
                        </span>
                        <span className="text-base font-black font-mono leading-none my-0.5">
                          {cd.dayNum}
                        </span>
                        <span className={`text-[9px] ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                          {cd.isAvailable ? cd.monthName : 'إجازة'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ── Time Slot Matrix (Morning / Evening Session Pills) ── */}
              <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4 space-y-3">
                <h3 className="font-bold text-[#104C48] text-xs flex items-center gap-1.5">
                  <Clock size={15} className="text-[#199A8E]" />
                  <span>الفترات المتاحة للحجز</span>
                </h3>

                {/* Morning Slots */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-2">الفترة الصباحية</span>
                  <div className="grid grid-cols-3 gap-2">
                    {morningSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedSlot(slot.time)}
                          disabled={!slot.available}
                          className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all text-center ${
                            isSelected
                              ? 'bg-[#199A8E] text-white shadow-sm'
                              : slot.available
                              ? 'bg-[#F8FAFB] text-slate-700 border border-[#E2E8F0] hover:border-[#199A8E]'
                              : 'bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Evening Slots */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-2">الفترة المسائية</span>
                  <div className="grid grid-cols-3 gap-2">
                    {eveningSlots.map((slot) => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedSlot(slot.time)}
                          disabled={!slot.available}
                          className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all text-center ${
                            isSelected
                              ? 'bg-[#199A8E] text-white shadow-sm'
                              : slot.available
                              ? 'bg-[#F8FAFB] text-slate-700 border border-[#E2E8F0] hover:border-[#199A8E]'
                              : 'bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Payment Method Selector */}
              <section className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
                <h3 className="font-bold text-[#104C48] text-xs mb-3">اختر وسيلة الدفع</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'wallet', label: 'محفظة يمن عافية', Icon: Wallet },
                    { id: 'card', label: 'كريمي / بطاقة', Icon: CreditCard },
                    { id: 'cash', label: 'نقداً في العيادة', Icon: Banknote },
                  ].map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setPaymentChoice(id)}
                      className={`rounded-2xl border-2 p-2.5 text-center transition-all ${
                        paymentChoice === id
                          ? 'border-[#199A8E] bg-[#E8F5F4]'
                          : 'border-[#E2E8F0] bg-white'
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`mx-auto mb-1.5 ${paymentChoice === id ? 'text-[#199A8E]' : 'text-slate-400'}`}
                      />
                      <span className="block text-[11px] font-bold text-slate-700">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="text-slate-500">المبلغ الإجمالي المستحق:</span>
                  <span className="text-base font-black text-[#104C48] font-mono">
                    {fee.toLocaleString()} ريال يمني
                  </span>
                </div>
              </section>

              {/* Submit CTA Button */}
              <button
                onClick={() => onBook(consultationType)}
                className="w-full rounded-2xl bg-[#199A8E] hover:bg-[#104C48] py-4 text-white font-bold text-sm shadow-lg shadow-[#199A8E]/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <span>تأكيد الحجز المباشر ({fee.toLocaleString()} ر.ي)</span>
                <Check size={18} />
              </button>
            </div>
          )}

          {/* ── Bio & Experience Tab ── */}
          {tab === 'bio' && (
            <div className="pt-5 space-y-4" dir="rtl">
              {/* KPI Strip */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-[#F8FAFB] rounded-2xl p-3 border border-[#E2E8F0]">
                  <Briefcase size={16} className="mx-auto text-[#199A8E] mb-1" />
                  <p className="font-bold text-slate-800 text-sm">{extras.experienceYears}س</p>
                  <p className="text-[10px] text-slate-400">سنوات الخبرة</p>
                </div>
                <div className="bg-[#F8FAFB] rounded-2xl p-3 border border-[#E2E8F0]">
                  <Users size={16} className="mx-auto text-[#199A8E] mb-1" />
                  <p className="font-bold text-slate-800 text-sm">+{extras.totalPatients}</p>
                  <p className="text-[10px] text-slate-400">مريض تمت معالجتهم</p>
                </div>
                <div className="bg-[#F8FAFB] rounded-2xl p-3 border border-[#E2E8F0]">
                  <TrendingUp size={16} className="mx-auto text-[#2E7D32] mb-1" />
                  <p className="font-bold text-slate-800 text-sm">{extras.successRate}%</p>
                  <p className="text-[10px] text-slate-400">نسبة الشفاء</p>
                </div>
                <div className="bg-[#F8FAFB] rounded-2xl p-3 border border-[#E2E8F0]">
                  <Clock size={16} className="mx-auto text-[#38B2AC] mb-1" />
                  <p className="font-bold text-slate-800 text-sm">{doctor.average_consultation_time}د</p>
                  <p className="text-[10px] text-slate-400">وقت المعاينة</p>
                </div>
              </div>

              {/* Education & Certificates */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 space-y-2">
                <h3 className="font-bold text-[#104C48] text-xs flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-[#199A8E]" />
                  <span>المؤهلات العلمية والشهادات</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {extras.qualifications.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#199A8E] mt-0.5">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hospital Affiliation & Clinic */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
                <h3 className="font-bold text-[#104C48] text-xs flex items-center gap-1.5 mb-2">
                  <MapPin size={15} className="text-[#199A8E]" />
                  <span>المقر والارتباط الطبي</span>
                </h3>
                <p className="text-xs font-bold text-slate-800">{doctor.clinic?.name || extras.hospital}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{doctor.clinic?.address || 'صنعاء، اليمن'}</p>
              </div>
            </div>
          )}

          {/* ── Schedule & Testimonials Tab ── */}
          {tab === 'schedule' && (
            <div className="pt-5 space-y-4" dir="rtl">
              {/* Rating Summary */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star size={24} className="text-[#FFB800]" fill="#FFB800" strokeWidth={0} />
                  <span className="text-3xl font-black text-[#104C48] font-mono">{doctor.rating}</span>
                </div>
                <p className="text-xs text-slate-500">تقييم موثق من {doctor.total_reviews} مريض</p>
              </div>

              {/* Testimonials List */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 space-y-3">
                <h3 className="font-bold text-[#104C48] text-xs flex items-center gap-1.5">
                  <MessageSquare size={15} className="text-[#199A8E]" />
                  <span>آراء وتجارب المرضى</span>
                </h3>

                <div className="space-y-2.5">
                  {extras.testimonials.map((t) => (
                    <div key={t.id} className="p-3 rounded-xl bg-[#F8FAFB] border border-[#E2E8F0] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{t.author}</span>
                        <span className="text-[10px] text-slate-400">{t.date}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setTab('booking')}
                className="w-full py-3.5 rounded-2xl bg-[#199A8E] text-white font-bold text-xs shadow-md"
              >
                الانتقال لحجز الموعد
              </button>
            </div>
          )}
        </div>
      </div>

      {showMapModal && (
        <FacilityInteractiveMap
          facility={{
            id: doctor.clinic?.id || doctor.id,
            name: `${doctor.clinic?.name || 'العيادة'} (${doctor.full_name})`,
            category: 'clinic',
            address: doctor.clinic?.address || 'صنعاء، اليمن',
            phone: extras.phone !== '—' ? extras.phone : undefined,
            latitude: doctor.clinic?.latitude ?? 15.3694,
            longitude: doctor.clinic?.longitude ?? 44.191,
            distance,
          }}
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
        />
      )}
    </div>
  );
}
