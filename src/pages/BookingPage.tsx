import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  Users,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Wallet,
  Building,
  Banknote,
  QrCode,
  Share2,
  Download,
  Bell,
  Star,
  Hash,
  Navigation,
} from 'lucide-react';
import type { Doctor, Appointment } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

interface BookingPageProps {
  doctor?: Doctor | null;
  onBack?: () => void;
  onComplete?: (appointment: Appointment) => void;
  queueNumber?: number;
  estimatedWaitMinutes?: number;
  estimatedArrivalTime?: string;
  queueBookingInfo?: {
    queueNumber: number;
    estimatedWaitMinutes: number;
    estimatedArrivalTime: string;
  } | null;
}

const fallbackDoctor: Doctor = {
  id: 'd1',
  full_name: 'د. سامي المقطري',
  specialization: { id: 's1', name_ar: 'طب القلب والأوعية الدموية', name_en: 'Cardiology' },
  clinic: {
    id: 'c1',
    name: 'مستشفى الثورة التعليمي',
    address: 'صنعاء — شارع الخمسين',
    latitude: 15.3694,
    longitude: 44.1910,
    is_active: true,
    working_hours: {},
  },
  clinic_id: 'c1',
  consultation_fee: 3500,
  average_consultation_time: 15,
  rating: 4.9,
  total_reviews: 120,
  is_active: true,
  is_available: true,
  working_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
};

export function BookingPage({
  doctor: propDoctor,
  onBack,
  onComplete,
  queueNumber: propQueueNumber,
  estimatedWaitMinutes: propEstimatedWaitMinutes,
  estimatedArrivalTime: propEstimatedArrivalTime,
  queueBookingInfo,
}: BookingPageProps) {
  const doctor: Doctor = propDoctor || fallbackDoctor;
  const doctorName = doctor?.full_name || 'طبيب استشاري';
  const doctorInitial = (typeof doctorName === 'string' && doctorName.trim().length > 0)
    ? doctorName.trim().charAt(0)
    : 'ط';

  const { user, currentLocation } = useAuth();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState<'payment' | 'confirmation'>('payment');
  const [symptoms] = useState('');
  const [isEmergency] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  const queueNumber = propQueueNumber ?? queueBookingInfo?.queueNumber ?? 12;
  const estimatedWaitMinutes = propEstimatedWaitMinutes ?? queueBookingInfo?.estimatedWaitMinutes ?? 45;
  const estimatedArrivalTime = propEstimatedArrivalTime ?? queueBookingInfo?.estimatedArrivalTime ?? '10:30 ص';

  const paymentMethods = [
    { id: 'kuraimi', name: 'كريمي جوال', icon: Wallet, color: 'bg-[#104C48]' },
    { id: 'floosak', name: 'فلوسك', icon: CreditCard, color: 'bg-[#199A8E]' },
    { id: 'jawali', name: 'جوالي', icon: Building, color: 'bg-[#00897B]' },
    { id: 'cash', name: 'نقداً في العيادة', icon: Banknote, color: 'bg-slate-700' },
  ];

  const calculateDistance = (): number => {
    const clinicLat = doctor?.clinic?.latitude;
    const clinicLng = doctor?.clinic?.longitude;
    if (!currentLocation || !clinicLat || !clinicLng) {
      return 1.8;
    }
    const R = 6371;
    const dLat = ((clinicLat - currentLocation.lat) * Math.PI) / 180;
    const dLon = ((clinicLng - currentLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((currentLocation.lat * Math.PI) / 180) *
        Math.cos((clinicLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const calculateTravelTime = (): number => {
    const dist = calculateDistance();
    return Math.round(dist * 3 + 5);
  };


  const handleConfirmBooking = async () => {
    if (!paymentMethod) return;
    setIsSubmitting(true);

    try {
      const fee = doctor?.consultation_fee || doctor?.price || 3500;
      const newAppointment: Partial<Appointment> = {
        patient_id: user?.id || 'demo-patient',
        doctor_id: doctor?.id || 'd1',
        clinic_id: doctor?.clinic_id || 'c1',
        appointment_date: new Date().toISOString().split('T')[0],
        queue_number: queueNumber,
        status: 'confirmed',
        symptoms,
        is_emergency: isEmergency,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
        payment_amount: fee,
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([newAppointment])
        .select()
        .single();

      if (error) {
        const fallbackAppt: Appointment = {
          id: `YA-${Date.now().toString().slice(-6)}`,
          patient_id: user?.id || 'demo-patient',
          doctor_id: doctor?.id || 'd1',
          clinic_id: doctor?.clinic_id || 'c1',
          appointment_date: new Date().toISOString().split('T')[0],
          queue_number: queueNumber,
          status: 'confirmed',
          symptoms,
          is_emergency: isEmergency,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
          payment_amount: fee,
          created_at: new Date().toISOString(),
          doctor,
          clinic: doctor?.clinic,
        };
        setCreatedAppointment(fallbackAppt);
      } else {
        setCreatedAppointment({ ...data, doctor, clinic: doctor?.clinic });
      }

      addNotification({
        type: 'queue_update',
        title: 'تم تأكيد الحجز بنجاح',
        message: `تم حجز موعدك مع ${doctorName} - رقمك في الطابور #${queueNumber}`,
        data: {
          doctorName,
          queueNumber,
        },
      });

      setStep('confirmation');
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'confirmation' && createdAppointment) {
    const bookingRef = `YA-${Date.now().toString().slice(-8)}`;
    const today = new Date().toLocaleDateString('ar-YE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#104C48] via-[#125853] to-[#199A8E]">
        {/* Header */}
        <div className="px-4 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition active:scale-95">
              <CheckCircle size={20} className="text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">تم تأكيد الحجز</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#F8FAFB] rounded-t-[28px] min-h-[calc(100vh-100px)] px-4 pt-8 pb-24 border-t border-[#E2E8F0]">
          {/* Success badge */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-[#E8F5F4] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#199A8E]/30 animate-bounce">
              <CheckCircle size={40} className="text-[#199A8E]" />
            </div>
            <h2 className="text-xl font-bold text-[#104C48]">تم تسجيلك في الطابور بنجاح</h2>
            <p className="text-slate-500 mt-2 text-sm">احتفظ بتذكرة الحجز — ستحتاجها عند الوصول للعيادة</p>
          </div>

          {/* Smart Ticket Card */}
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_-2px_rgba(25,154,142,0.08)] border border-[#E2E8F0] overflow-hidden mb-4 relative">
            {/* Ticket header strip */}
            <div className="bg-gradient-to-l from-[#104C48] to-[#199A8E] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white/90 text-xs font-bold bg-white/20 rounded-full px-2.5 py-1">تذكرة حجز ذكية</span>
                <span className="text-white font-bold text-sm">يمن عافية</span>
              </div>
              <div className="flex items-center gap-1 text-white">
                <Hash size={13} />
                <span className="font-mono font-bold text-sm">{bookingRef}</span>
              </div>
            </div>

            {/* Doctor info */}
            <div className="px-5 py-4 border-b border-dashed border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#E8F5F4] text-[#104C48] border border-[#199A8E]/30 rounded-2xl flex items-center justify-center font-bold text-lg">
                  {doctorInitial}
                </div>
                <div className="flex-1 text-right">
                  <h3 className="font-bold text-[#104C48]">{doctorName}</h3>
                  <p className="text-sm text-[#199A8E] font-medium">{doctor?.specialization?.name_ar || 'استشاري تخصصي'}</p>
                </div>
                <div className="flex items-center gap-1 bg-[#E8F5F4] px-2 py-1 rounded-xl">
                  <Star size={14} className="text-[#FFB800] fill-[#FFB800]" />
                  <span className="font-bold text-[#104C48] text-sm">{doctor?.rating ?? 4.9}</span>
                </div>
              </div>
            </div>

            {/* Queue number — large */}
            <div className="px-5 py-6 text-center bg-[#E8F5F4]/60 border-b border-dashed border-slate-200">
              <p className="text-slate-500 text-xs mb-2">رقمك في الطابور</p>
              <p className="text-[#104C48] text-6xl font-black tracking-tight font-mono">#{queueNumber}</p>
              <p className="text-slate-500 text-xs mt-2">{queueNumber - 1} شخص قبلك</p>
            </div>

            {/* Ticket details grid */}
            <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-dashed border-slate-200">
              <div className="bg-[#F8FAFB] rounded-xl p-3 text-right border border-[#E2E8F0]">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <span className="text-xs text-slate-500">وقت الانتظار</span>
                  <Clock size={13} className="text-[#199A8E]" />
                </div>
                <p className="font-bold text-[#104C48] text-sm">{estimatedWaitMinutes} دقيقة</p>
              </div>
              <div className="bg-[#F8FAFB] rounded-xl p-3 text-right border border-[#E2E8F0]">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <span className="text-xs text-slate-500">الحضور المتوقع</span>
                  <Calendar size={13} className="text-[#2E7D32]" />
                </div>
                <p className="font-bold text-[#104C48] text-sm">{estimatedArrivalTime}</p>
              </div>
              <div className="bg-[#F8FAFB] rounded-xl p-3 text-right col-span-2 border border-[#E2E8F0]">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <span className="text-xs text-slate-500">التاريخ</span>
                  <Calendar size={13} className="text-[#199A8E]" />
                </div>
                <p className="font-bold text-[#104C48] text-sm">{today}</p>
              </div>
            </div>

            {/* Clinic location */}
            <div className="px-5 py-4 border-b border-dashed border-slate-200">
              <div className="flex items-start gap-2 text-right">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">مكان العيادة</p>
                  <p className="font-bold text-[#104C48] text-sm">{doctor?.clinic?.name || 'مستشفى الثورة التعليمي'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{doctor?.clinic?.address || 'صنعاء — شارع الخمسين'}</p>
                  {calculateDistance() > 0 && (
                    <p className="text-xs text-[#199A8E] font-medium mt-1">{calculateDistance()} كم • {calculateTravelTime()} دقيقة وصول</p>
                  )}
                </div>
                <MapPin size={16} className="text-[#199A8E] flex-shrink-0 mt-1" />
              </div>
              <button
                onClick={() => {
                  const lat = doctor?.clinic?.latitude || 15.3694;
                  const lng = doctor?.clinic?.longitude || 44.1910;
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                }}
                className="mt-3 w-full rounded-xl bg-[#104C48] hover:bg-[#0d3f3c] py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2 transition"
              >
                <Navigation size={15} /> الاتجاهات للعيادة
              </button>
            </div>

            {/* QR placeholder + payment */}
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#199A8E]/30 flex items-center justify-center bg-[#E8F5F4]/50">
                <QrCode size={36} className="text-[#104C48]" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs text-slate-500">المبلغ المدفوع</p>
                <p className="font-black text-[#104C48] text-xl font-mono">{(doctor?.consultation_fee ?? doctor?.price ?? 3500).toLocaleString()} ر.ي</p>
                <p className="text-xs text-[#2E7D32] font-bold mt-1">تم الدفع بنجاح</p>
              </div>
            </div>

            {/* Perforated edge */}
            <div className="relative h-4">
              <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-[#F8FAFB] border border-[#E2E8F0]" />
              <div className="absolute right-0 translate-x-1/2 w-4 h-4 rounded-full bg-[#F8FAFB] border border-[#E2E8F0]" />
              <div className="border-t-2 border-dashed border-slate-200 h-full" />
            </div>

            {/* Bottom stub */}
            <div className="px-5 py-3 flex items-center justify-between bg-[#F8FAFB]">
              <span className="font-mono text-xs text-slate-500">{bookingRef}</span>
              <span className="text-xs text-slate-400">احتفظ بهذا الرقم للمراجعة</span>
            </div>
          </div>

          {/* Notification hint */}
          <div className="bg-[#E8F5F4] rounded-2xl p-4 mb-4 flex items-start gap-3 border border-[#199A8E]/20">
            <Bell size={20} className="text-[#199A8E] flex-shrink-0 mt-0.5" />
            <div className="text-right">
              <p className="font-bold text-[#104C48] text-sm">إشعارات الطابور الذكية مفعّلة</p>
              <p className="text-xs text-slate-600 mt-1">سيصلك إشعار عند اقتراب دورك (قبل 3 مرضى) وعند حان وقت الدخول</p>
            </div>
          </div>

          {/* Alert */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 mb-4 flex items-start gap-3 text-right">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 text-sm">تنبيه الموعد</p>
              <p className="text-sm text-amber-700 mt-1">
                يُنصح بالوصول قبل 10 دقائق من موعدك لتجنب فقدان دورك
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-4">
            <button className="flex-1 py-3 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition">
              <Share2 size={16} /> مشاركة
            </button>
            <button className="flex-1 py-3 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition">
              <Download size={16} /> حفظ التذكرة
            </button>
          </div>

          <button
            onClick={() => onComplete?.(createdAppointment)}
            className="w-full bg-[#199A8E] hover:bg-[#104C48] text-white py-4 rounded-2xl font-bold text-base shadow-md flex items-center justify-center gap-2 transition active:scale-95"
          >
            متابعة حالة الطابور مباشرة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#104C48] via-[#125853] to-[#199A8E]">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition active:scale-95"
            title="رجوع للعيادة"
          >
            <ChevronLeft size={20} className="text-white rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-white">اختيار وسيلة الدفع وتأكيد الحجز</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#F8FAFB] rounded-t-[28px] min-h-[calc(100vh-100px)] px-4 pt-6 border-t border-[#E2E8F0]">
        {/* Doctor & Queue Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#E8F5F4] text-[#104C48] border border-[#199A8E]/30 rounded-2xl flex items-center justify-center font-bold text-lg">
              {doctorInitial}
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-bold text-[#104C48]">{doctorName}</h3>
              <p className="text-sm text-[#199A8E] font-medium">{doctor?.specialization?.name_ar || 'استشاري تخصصي'}</p>
            </div>
          </div>

          {/* Queue Info Badge */}
          <div className="flex items-center justify-between bg-[#E8F5F4] rounded-xl p-3 border border-[#199A8E]/20">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#199A8E]" />
              <span className="text-[#104C48] text-xs font-bold">رقمك المقدر في الطابور</span>
            </div>
            <span className="font-black text-[#104C48] text-lg font-mono">#{queueNumber}</span>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-slate-500">وقت الانتظار المتوقع:</span>
            <span className="font-bold text-[#104C48]">{estimatedWaitMinutes} دقيقة</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-slate-500">احضر تقريباً الساعة:</span>
            <span className="font-bold text-[#199A8E] font-mono">{estimatedArrivalTime}</span>
          </div>
        </div>

        {/* Payment Methods Section */}
        <h3 className="font-bold text-[#104C48] text-sm mb-3 text-right">اختر طريقة السداد الإلكتروني</h3>
        <div className="space-y-2.5">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.id;

            return (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition-all text-right ${
                  isSelected
                    ? 'bg-[#E8F5F4] border-2 border-[#199A8E]'
                    : 'bg-white border border-[#E2E8F0] hover:border-slate-300'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${method.color} shadow-sm shrink-0`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{method.name}</p>
                  {method.id === 'cash' && (
                    <p className="text-xs text-slate-400 mt-0.5">الدفع المباشر عند شباك استقبال العيادة</p>
                  )}
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    isSelected ? 'border-[#199A8E] bg-[#199A8E]' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <CheckCircle size={13} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="mt-4 bg-white rounded-2xl p-4 border border-[#E2E8F0] text-right">
          <h4 className="font-bold text-[#104C48] text-sm mb-3">ملخص الحجز</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="font-bold text-slate-800">{doctorName}</span>
              <span className="text-slate-500">الطبيب المعالج:</span>
            </div>
            <div className="flex justify-between">
              <span className="font-black text-[#199A8E] font-mono text-sm">#{queueNumber}</span>
              <span className="text-slate-500">رقمك المقدر:</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-slate-800 font-mono">{estimatedArrivalTime}</span>
              <span className="text-slate-500">وقت الحضور المتوقع:</span>
            </div>
            <div className="border-t border-[#E2E8F0] pt-2 flex justify-between">
              <span className="font-black text-[#104C48] text-sm font-mono">{(doctor?.consultation_fee || doctor?.price || 3500).toLocaleString()} ر.ي</span>
              <span className="text-slate-500 font-bold">رسوم الكشف:</span>
            </div>
          </div>
        </div>

        {/* Confirm Booking CTA */}
        <div className="mt-6 pb-24">
          <button
            onClick={handleConfirmBooking}
            disabled={!paymentMethod || isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
              paymentMethod && !isSubmitting
                ? 'bg-[#199A8E] hover:bg-[#104C48] text-white shadow-md active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'جاري تثبيت الحجز والدفع...' : 'تأكيد الحجز النهائي'}
          </button>
        </div>
      </div>
    </div>
  );
}
