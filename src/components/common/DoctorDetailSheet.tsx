import React, { useState } from 'react';
import {
  X, Star, MapPin, Clock, Users, Stethoscope, Zap, Video,
  Check, Navigation, Calendar, Award, GraduationCap, Briefcase,
  TrendingUp, Shield, Phone, FileText, Languages, BookOpen,
  Wallet, CreditCard, Banknote,
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

const DAY_LABELS: Record<string, string> = {
  sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت',
};
const ALL_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

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
}> = {
  '1': {
    qualifications: ['بكالوريوس طب وجراحة - جامعة صنعاء (2008)', 'دبلوم الباطنة العامة - المجلس العربي للطب (2013)', 'زمالة الكلية الملكية البريطانية MRCP (2017)'],
    certificates: [{ title: 'دبلوم الأمراض الباطنة', issuer: 'المجلس العربي', year: '2013' }, { title: 'دورة علاج السكري', issuer: 'منظمة الصحة العالمية', year: '2016' }],
    languages: ['العربية', 'الإنجليزية'],
    experienceYears: 16, education: 'جامعة صنعاء - كلية الطب',
    services: ['كشف باطني عام', 'متابعة السكري', 'متابعة ضغط الدم', 'أمراض الغدد'],
    totalPatients: 3200, successRate: 94, phone: '777001001', licenseNumber: 'LIC-20345',
  },
  '2': {
    qualifications: ['بكالوريوس طب وجراحة - جامعة عدن (2010)', 'دبلوم أمراض القلب - المجلس العربي (2015)', 'زمالة القسطرة القلبية - جامعة برلين (2019)'],
    certificates: [{ title: 'دبلوم أمراض القلب', issuer: 'المجلس العربي', year: '2015' }, { title: 'القسطرة التداخلية', issuer: 'جامعة شاريتيه - برلين', year: '2018' }],
    languages: ['العربية', 'الإنجليزية', 'الألمانية'],
    experienceYears: 14, education: 'جامعة عدن - كلية الطب',
    services: ['قسطرة قلبية', 'علاج الجلطات', 'متابعة أمراض القلب', 'تخطيط القلب'],
    totalPatients: 1800, successRate: 91, phone: '777002002', licenseNumber: 'LIC-20412',
  },
  '3': {
    qualifications: ['بكالوريوس طب وجراحة - جامعة صنعاء (2006)', 'دبلوم الأعصاب الطرفية - جامعة الأردن (2012)', 'البورد العربي في طب الأعصاب (2015)'],
    certificates: [{ title: 'دبلوم الأعصاب الطرفية', issuer: 'جامعة الأردن', year: '2012' }, { title: 'البورد العربي في طب الأعصاب', issuer: 'المجلس العربي', year: '2015' }],
    languages: ['العربية', 'الإنجليزية'],
    experienceYears: 18, education: 'جامعة صنعاء - كلية الطب',
    services: ['كشف أعصاب', 'علاج الصداع النصبي', 'متابعة الصرع', 'تخطيط الدماغ EEG'],
    totalPatients: 2400, successRate: 93, phone: '777003003', licenseNumber: 'LIC-19876',
  },
  '4': {
    qualifications: ['بكالوريوس طب وجراحة - جامعة صنعاء (2009)', 'دبلوم طب الأطفال - جامعة القاهرة (2014)', 'البورد العربي في طب الأطفال (2017)'],
    certificates: [{ title: 'دبلوم طب الأطفال', issuer: 'جامعة القاهرة', year: '2014' }, { title: 'البورد العربي في طب الأطفال', issuer: 'المجلس العربي', year: '2017' }],
    languages: ['العربية', 'الإنجليزية'],
    experienceYears: 15, education: 'جامعة صنعاء - كلية الطب',
    services: ['كشف أطفال عام', 'متابعة النمو', 'التطعيمات', 'علاج الربو'],
    totalPatients: 4100, successRate: 96, phone: '777004004', licenseNumber: 'LIC-20578',
  },
  '5': {
    qualifications: ['بكالوريوس طب وجراحة - جامعة صنعاء (2007)', 'دبلوم العيون - المجلس العربي (2013)'],
    certificates: [{ title: 'دبلوم العيون', issuer: 'المجلس العربي', year: '2013' }],
    languages: ['العربية', 'الإنجليزية'],
    experienceYears: 17, education: 'جامعة صنعاء - كلية الطب',
    services: ['كشف عيون', 'علاج المياه البيضاء', 'فحص النظر', 'عمليات الليزر'],
    totalPatients: 2800, successRate: 92, phone: '777005005', licenseNumber: 'LIC-20789',
  },
  '6': {
    qualifications: ['بكالوريوس طب وجراحة - جامعة صنعاء (2006)', 'دبلوم العظام - المجلس العربي (2012)'],
    certificates: [{ title: 'دبلوم العظام', issuer: 'المجلس العربي', year: '2012' }],
    languages: ['العربية', 'الإنجليزية'],
    experienceYears: 18, education: 'جامعة صنعاء - كلية الطب',
    services: ['كشف عظام', 'علاج الكسور', 'متابعة المفاصل', 'جبائر وكسور'],
    totalPatients: 2200, successRate: 95, phone: '777006006', licenseNumber: 'LIC-20301',
  },
};

export function DoctorDetailSheet({ doctor, queueInfo, distance, onClose, onBook }: DoctorDetailSheetProps) {
  const [tab, setTab] = useState<'booking' | 'bio' | 'schedule'>('booking');
  const [consultationType, setConsultationType] = useState<ConsultationType>('clinic');
  const [paymentChoice, setPaymentChoice] = useState('wallet');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingDetails, setBookingDetails] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);

  const extras = doctorExtras[doctor.id] || {
    qualifications: ['بكالوريوس طب وجراحة'], certificates: [], languages: ['العربية'],
    experienceYears: 5, education: 'كلية الطب', services: [], totalPatients: 0, successRate: 0,
    phone: '—', licenseNumber: '—',
  };

  const waitingAhead = queueInfo.queueNumber - 1;
  const fee = consultationType === 'emergency'
    ? Math.round((doctor.consultation_fee || 3000) * 1.5)
    : consultationType === 'remote'
    ? Math.round((doctor.consultation_fee || 3000) * 0.6)
    : (doctor.consultation_fee || 3000);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] px-5 pt-6 pb-8 rounded-t-3xl relative">
          <button onClick={onClose} className="absolute top-4 left-4 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <X size={18} className="text-white" />
          </button>
          <div className="flex items-center gap-4 mt-2">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#1565C0] flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 border-2 border-white/30">
              {doctor.full_name.charAt(2)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{doctor.full_name}</h2>
              <p className="text-white/80 text-sm mt-0.5">{doctor.specialization?.name_ar}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1">
                  <Star size={13} className="text-yellow-300" fill="currentColor" />
                  <span className="text-white text-xs font-bold">{doctor.rating}</span>
                </div>
                <span className="text-white/70 text-xs">({doctor.total_reviews} تقييم)</span>
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center gap-1 bg-white/25 hover:bg-white/35 active:scale-95 text-white text-[11px] font-bold px-2 py-1 rounded-lg transition"
                  title="عرض موقع العيادة على الخريطة التفاعلية"
                >
                  <MapPin size={12} className="text-white" />
                  <span>{distance} كم (الخريطة)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8">
          {/* Tabs */}
          <div className="bg-white rounded-2xl -mt-4 relative z-10 p-1.5 shadow-sm flex gap-1" dir="rtl">
            {[
              { id: 'booking', label: 'الحجز' },
              { id: 'bio', label: 'السيرة الذاتية' },
              { id: 'schedule', label: 'المواعيد والتقييمات' },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id as 'booking' | 'bio' | 'schedule')}
                className={`flex-1 rounded-xl px-2 py-3 text-[11px] font-bold transition-all ${tab === t.id ? 'bg-[#2196F3] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Booking Tab */}
          {tab === 'booking' && (
            <div className="pt-5 space-y-4" dir="rtl">
              {/* Consultation type */}
              <section className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3">نوع الاستشارة *</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'clinic' as const, label: 'استشارة عيادة', icon: Stethoscope, desc: 'حضور للعيادة', fee },
                    { id: 'emergency' as const, label: 'استشارة طارئة', icon: Zap, desc: 'أولوية قصوى', fee: Math.round((doctor.consultation_fee || 3000) * 1.5) },
                    { id: 'remote' as const, label: 'استشارة عن بعد', icon: Video, desc: 'مكالمة فيديو', fee: Math.round((doctor.consultation_fee || 3000) * 0.6) },
                  ].map(({ id, label, icon: Icon, desc, fee: f }) => (
                    <button key={id} onClick={() => setConsultationType(id)}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${consultationType === id ? 'border-[#2196F3] bg-blue-50' : 'border-gray-100 bg-white'}`}>
                      <Icon size={20} className={`mx-auto mb-1.5 ${consultationType === id ? 'text-[#2196F3]' : 'text-gray-400'}`} />
                      <span className={`block text-xs font-bold ${consultationType === id ? 'text-[#2196F3]' : 'text-gray-600'}`}>{label}</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">{desc}</span>
                      <span className="block text-[10px] font-bold text-gray-500 mt-1">{f.toLocaleString()} ر.ي</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Queue info */}
              <section className="bg-[#EBF5FB] rounded-2xl p-4 border border-[#BEE3F8]">
                <div className="flex items-center justify-between mb-3">
                  <Clock size={18} className="text-[#2196F3]" />
                  <p className="font-bold text-gray-800 text-sm">حالة الطابور الآن</p>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 text-xs">احضر تقريباً الساعة</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{queueInfo.estimatedArrivalTime}</p>
                    <p className="text-gray-400 text-xs mt-1">~ {queueInfo.estimatedWaitMinutes} دقيقة</p>
                  </div>
                  <div className="text-left">
                    <p className="text-gray-500 text-xs">رقمك المتوقع</p>
                    <p className="text-2xl font-bold text-[#2196F3] mt-1">#{queueInfo.queueNumber}</p>
                    <p className="text-gray-400 text-xs mt-1">{waitingAhead} قبلك</p>
                  </div>
                </div>
              </section>

              {/* Reason */}
              <section className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3">سبب الزيارة والأعراض</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['فحص روتيني ومتابعة', 'ألم أو أعراض مستمرة', 'صداع ودوخة', 'ضغط وسكر', 'استشارة وتعديل أدوية'].map((reason) => (
                    <button key={reason} onClick={() => setBookingReason(reason)}
                      className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${bookingReason === reason ? 'bg-[#2196F3] text-white' : 'bg-blue-50 text-[#1565C0]'}`}>
                      {reason}
                    </button>
                  ))}
                </div>
                <textarea value={bookingDetails} onChange={(e) => setBookingDetails(e.target.value)} rows={3}
                  placeholder="اكتب وصفاً مختصراً للأعراض..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 outline-none focus:border-[#2196F3] focus:ring-2 focus:ring-blue-100 resize-none" />
              </section>

              {/* Clinic location */}
              <section className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">{distance} كم</span>
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">مكان العيادة <MapPin size={15} className="text-[#2196F3]" /></h3>
                </div>
                <p className="text-sm font-bold text-gray-800 text-right">{doctor.clinic?.name}</p>
                <p className="text-xs text-gray-500 mt-1 text-right">{doctor.clinic?.address}</p>
                <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${doctor.clinic?.latitude || 15.3694},${doctor.clinic?.longitude || 44.1910}`, '_blank')}
                  className="mt-3 w-full rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2">
                  <Navigation size={15} /> توجيه بالخريطة
                </button>
              </section>

              {/* Payment */}
              <section className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3">اختر وسيلة الدفع:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'wallet', label: 'محفظة إلكترونية', Icon: Wallet }, { id: 'card', label: 'بطاقة مصرفية', Icon: CreditCard }, { id: 'cash', label: 'نقداً عند الوصول', Icon: Banknote }].map(({ id, label, Icon }) => (
                    <button key={id} onClick={() => setPaymentChoice(id)}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${paymentChoice === id ? 'border-[#2196F3] bg-blue-50' : 'border-gray-100 bg-white'}`}>
                      <Icon size={19} className={`mx-auto mb-2 ${paymentChoice === id ? 'text-[#2196F3]' : 'text-gray-400'}`} />
                      <span className="block text-[10px] leading-4 text-gray-600">{label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500"><span>{fee.toLocaleString()} ر.ي</span><span>رسوم المعاينة</span></div>
                  <div className="flex justify-between text-gray-500"><span>0 ر.ي</span><span>رسوم الحجز</span></div>
                  <div className="border-t pt-3 flex justify-between font-black text-gray-900"><span>{fee.toLocaleString()} ر.ي</span><span>المبلغ المستحق</span></div>
                </div>
              </section>

              <button onClick={() => onBook(consultationType)}
                className="w-full rounded-2xl bg-gradient-to-l from-[#2196F3] to-[#18A98C] py-4 text-white font-black text-base shadow-lg flex items-center justify-center gap-2">
                تأكيد الحجز والحصول على التذكرة ({fee.toLocaleString()} ر.ي) <Check size={19} />
              </button>
            </div>
          )}

          {/* Bio Tab */}
          {tab === 'bio' && (
            <div className="pt-5 space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Briefcase size={18} className="mx-auto text-[#2196F3] mb-1" />
                  <p className="font-bold text-gray-800 text-base">{extras.experienceYears}س</p>
                  <p className="text-xs text-gray-500">خبرة</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Clock size={18} className="mx-auto text-[#2196F3] mb-1" />
                  <p className="font-bold text-gray-800 text-base">{doctor.average_consultation_time}د</p>
                  <p className="text-xs text-gray-500">معاينة</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Users size={18} className="mx-auto text-[#2196F3] mb-1" />
                  <p className="font-bold text-gray-800 text-base">{waitingAhead}</p>
                  <p className="text-xs text-gray-500">في الطابور</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <TrendingUp size={18} className="mx-auto text-green-500 mb-1" />
                  <p className="font-bold text-gray-800 text-base">{extras.successRate}%</p>
                  <p className="text-xs text-gray-500">نجاح</p>
                </div>
              </div>

              {doctor.bio && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-2 text-right flex items-center gap-2 justify-end">
                    نبذة عن الطبيب<FileText size={15} className="text-[#2196F3]" />
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed text-right">{doctor.bio || 'طبيب متخصص بتقديم رعاية صحية متميزة'}</p>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                  المؤهلات العلمية<GraduationCap size={15} className="text-[#2196F3]" />
                </h3>
                <div className="space-y-2">
                  {extras.qualifications.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                      <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 text-right flex-1">{q}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                  الشهادات<Award size={15} className="text-[#2196F3]" />
                </h3>
                <div className="space-y-2">
                  {extras.certificates.map((c, i) => (
                    <div key={i} className="bg-blue-50 rounded-xl px-3 py-2.5 border border-blue-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-blue-600 font-bold bg-white px-2 py-0.5 rounded-full">{c.year}</span>
                        <p className="font-bold text-gray-800 text-sm text-right flex-1 ml-2">{c.title}</p>
                      </div>
                      <p className="text-xs text-gray-500 text-right">{c.issuer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                  الخدمات المقدمة<Stethoscope size={15} className="text-[#2196F3]" />
                </h3>
                <div className="flex flex-wrap gap-2 justify-end">
                  {extras.services.map((s, i) => (
                    <span key={i} className="bg-blue-50 text-[#2196F3] text-xs px-3 py-1.5 rounded-xl font-medium">{s}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                  اللغات<Languages size={15} className="text-[#2196F3]" />
                </h3>
                <div className="flex flex-wrap gap-2 justify-end">
                  {extras.languages.map((lang, i) => (
                    <span key={i} className="bg-teal-50 text-teal-700 text-xs px-3 py-1.5 rounded-full font-medium">{lang}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                  التعليم والترخيص<BookOpen size={15} className="text-[#2196F3]" />
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2.5">
                    <span className="text-sm font-mono font-bold text-gray-700">{extras.licenseNumber}</span>
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-green-500" />
                      <span className="text-sm text-gray-600">رقم الترخيص</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                    <span className="text-sm text-gray-700 text-right flex-1">{extras.education}</span>
                    <BookOpen size={14} className="text-[#2196F3] flex-shrink-0" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 text-center">
                  <Users size={20} className="mx-auto text-[#2196F3] mb-1" />
                  <p className="text-xl font-black text-gray-800">{extras.totalPatients.toLocaleString('ar')}</p>
                  <p className="text-xs text-gray-500">إجمالي المرضى</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
                  <TrendingUp size={20} className="mx-auto text-green-500 mb-1" />
                  <p className="text-xl font-black text-gray-800">{extras.successRate}%</p>
                  <p className="text-xs text-gray-500">نسبة الشفاء</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                  معلومات التواصل<Phone size={15} className="text-[#2196F3]" />
                </h3>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="text-sm font-mono text-gray-700" dir="ltr">{extras.phone}</span>
                  <div className="flex items-center gap-2"><Phone size={14} className="text-[#2196F3]" /><span className="text-sm text-gray-600">الهاتف</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {tab === 'schedule' && (
            <div className="pt-5 space-y-4" dir="rtl">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star size={20} className="text-amber-400" fill="currentColor" />
                  <span className="text-3xl font-black text-gray-900">{doctor.rating}</span>
                </div>
                <p className="text-sm text-gray-500">تقييم ممتاز من {doctor.total_reviews} مراجع</p>
                <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full w-[92%] rounded-full bg-amber-400" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3">أيام وساعات الدوام</h3>
                <div className="flex flex-wrap gap-1.5 mb-3 justify-end">
                  {ALL_DAYS.map((day) => (
                    <span key={day} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium ${doctor.working_days?.includes(day) ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-300 line-through'}`}>
                      {DAY_LABELS[day]}
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  {doctor.working_hours?.morning && (
                    <div className="flex justify-between rounded-xl bg-amber-50 px-3 py-2.5 text-sm">
                      <span className="font-bold text-gray-700">{doctor.working_hours.morning.start} - {doctor.working_hours.morning.end}</span>
                      <span className="text-amber-600">الفترة الصباحية</span>
                    </div>
                  )}
                  {doctor.working_hours?.evening && (
                    <div className="flex justify-between rounded-xl bg-blue-50 px-3 py-2.5 text-sm">
                      <span className="font-bold text-gray-700">{doctor.working_hours.evening.start} - {doctor.working_hours.evening.end}</span>
                      <span className="text-[#1565C0]">الفترة المسائية</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#EBF8F4] rounded-2xl border border-teal-100 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">المتوقع قبلك</p>
                    <p className="text-2xl font-black text-gray-900">{waitingAhead} مرضى</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">الانتظار التقريبي</p>
                    <p className="text-2xl font-black text-teal-700">{queueInfo.estimatedWaitMinutes} دقيقة</p>
                  </div>
                </div>
              </div>

              <button onClick={() => { setTab('booking'); }}
                className="w-full rounded-2xl bg-[#2196F3] py-4 text-white font-bold flex items-center justify-center gap-2">
                <Calendar size={18} /> اختيار هذا الطبيب والحجز
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
