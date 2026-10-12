import React, { useState } from 'react';
import {
  CheckCircle,
  Users,
  Smartphone,
  AlertCircle,
  Building2,
  Banknote,
  Clock,
  MapPin,
  Calendar,
  Star,
  Navigation,
  Share2,
  Download,
  Bell,
  QrCode,
  Hash,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import type { Doctor, Appointment } from '../types';

interface BookingPageProps {
  doctor: Doctor;
  queueNumber: number;
  estimatedWaitMinutes: number;
  estimatedArrivalTime: string;
  onBack?: () => void;
  onComplete?: (appointment: Appointment) => void;
}

const paymentMethods = [
  { id: 'mtn', name: 'MTN Cash', icon: Smartphone, color: 'bg-yellow-500' },
  { id: 'yemen_mobile', name: 'اليمن موبايل', icon: Smartphone, color: 'bg-blue-600' },
  { id: 'bank', name: 'تحويل بنكي', icon: Building2, color: 'bg-gray-700' },
  { id: 'cash', name: 'دفع في العيادة', icon: Banknote, color: 'bg-green-600' },
];

export function BookingPage({
  doctor,
  queueNumber,
  estimatedWaitMinutes,
  estimatedArrivalTime,
  onBack,
  onComplete,
}: BookingPageProps) {
  const { user, currentLocation } = useAuth();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState<'symptoms' | 'payment' | 'confirmation'>('symptoms');
  const [symptoms, setSymptoms] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  const calculateDistance = (): number => {
    if (!currentLocation || !doctor.clinic?.latitude || !doctor.clinic?.longitude) return 0;
    const lat1 = currentLocation.lat * (Math.PI / 180);
    const lon1 = currentLocation.lng * (Math.PI / 180);
    const lat2 = doctor.clinic.latitude * (Math.PI / 180);
    const lon2 = doctor.clinic.longitude * (Math.PI / 180);
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(6371 * c * 10) / 10;
  };

  const calculateTravelTime = (): number => {
    const distance = calculateDistance();
    return Math.round(distance * 5);
  };

  const handleContinue = () => {
    if (step === 'symptoms') {
      setStep('payment');
    } else if (step === 'payment' && paymentMethod) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const appointmentData = {
        patient_id: user?.id || 'demo-user',
        doctor_id: doctor.id,
        clinic_id: doctor.clinic_id,
        appointment_date: today,
        queue_number: queueNumber,
        estimated_time: estimatedArrivalTime,
        status: paymentMethod === 'cash' ? 'pending' : 'confirmed' as const,
        payment_status: paymentMethod === 'cash' ? 'pending' : 'paid' as const,
        payment_method: paymentMethod,
        payment_amount: doctor.consultation_fee,
        notes: '',
        symptoms: symptoms,
        is_emergency: isEmergency,
        latitude: currentLocation?.lat,
        longitude: currentLocation?.lng,
        distance_km: calculateDistance(),
        travel_time_minutes: calculateTravelTime(),
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        const demoAppointment: Appointment = {
          id: Date.now().toString(),
          ...appointmentData,
          doctor: doctor,
          clinic: doctor.clinic,
          created_at: new Date().toISOString(),
          status: 'confirmed',
        };
        setCreatedAppointment(demoAppointment);
      } else {
        setCreatedAppointment(data as Appointment);
      }

      // Show immediate booking confirmation notification
      addNotification({
        type: 'booking_confirmed',
        title: 'تم تسجيلك في الطابور!',
        message: `رقمك #${queueNumber} لدى ${doctor.full_name}`,
        queuePosition: queueNumber,
        arrivalTime: estimatedArrivalTime,
        waitMinutes: estimatedWaitMinutes,
        autoClose: 10000,
      });

      setStep('confirmation');
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'confirmation' && createdAppointment) {
    const bookingRef = `YH-${Date.now().toString().slice(-8)}`;
    const today = new Date().toLocaleDateString('ar-YE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2196F3] to-[#1976D2]">
        {/* Header */}
        <div className="px-4 pt-12 pb-6">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle size={20} className="text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">تم تأكيد الحجز</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-50 rounded-t-3xl min-h-[calc(100vh-100px)] px-4 pt-8 pb-24">
          {/* Success badge */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">تم تسجيلك في الطابور بنجاح</h2>
            <p className="text-gray-500 mt-2 text-sm">احتفظ بتذكرة الحجز — ستحتاجها عند الوصول للعيادة</p>
          </div>

          {/* Smart Ticket Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-4 relative">
            {/* Ticket header strip */}
            <div className="bg-gradient-to-l from-[#2196F3] to-[#18A98C] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white/90 text-xs font-bold bg-white/20 rounded-full px-2 py-1">تذكرة حجز</span>
                <span className="text-white font-bold text-sm">صحتي</span>
              </div>
              <div className="flex items-center gap-1 text-white">
                <Hash size={13} />
                <span className="font-mono font-bold text-sm">{bookingRef}</span>
              </div>
            </div>

            {/* Doctor info */}
            <div className="px-5 py-4 border-b border-dashed border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#2196F3] rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {doctor.full_name.charAt(0)}
                </div>
                <div className="flex-1 text-right">
                  <h3 className="font-bold text-gray-800">{doctor.full_name}</h3>
                  <p className="text-sm text-[#2196F3]">{doctor.specialization?.name_ar}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-800 text-sm">{doctor.rating}</span>
                </div>
              </div>
            </div>

            {/* Queue number — large */}
            <div className="px-5 py-6 text-center bg-gradient-to-br from-[#E3F2FD] to-[#F3E5F5]">
              <p className="text-gray-500 text-xs mb-2">رقمك في الطابور</p>
              <p className="text-[#1565C0] text-6xl font-black tracking-tight">#{queueNumber}</p>
              <p className="text-gray-400 text-xs mt-2">{queueNumber - 1} شخص قبلك</p>
            </div>

            {/* Ticket details grid */}
            <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-dashed border-gray-200">
              <div className="bg-gray-50 rounded-xl p-3 text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <span className="text-xs text-gray-500">وقت الانتظار</span>
                  <Clock size={13} className="text-[#2196F3]" />
                </div>
                <p className="font-bold text-gray-800 text-sm">{estimatedWaitMinutes} دقيقة</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <span className="text-xs text-gray-500">الحضور المتوقع</span>
                  <Calendar size={13} className="text-green-600" />
                </div>
                <p className="font-bold text-gray-800 text-sm">{estimatedArrivalTime}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-right col-span-2">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <span className="text-xs text-gray-500">التاريخ</span>
                  <Calendar size={13} className="text-[#2196F3]" />
                </div>
                <p className="font-bold text-gray-800 text-sm">{today}</p>
              </div>
            </div>

            {/* Clinic location */}
            <div className="px-5 py-4 border-b border-dashed border-gray-200">
              <div className="flex items-start gap-2 text-right">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">مكان العيادة</p>
                  <p className="font-bold text-gray-800 text-sm">{doctor.clinic?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{doctor.clinic?.address}</p>
                  {calculateDistance() > 0 && (
                    <p className="text-xs text-[#2196F3] mt-1">{calculateDistance()} كم • {calculateTravelTime()} دقيقة وصول</p>
                  )}
                </div>
                <MapPin size={16} className="text-[#2196F3] flex-shrink-0 mt-1" />
              </div>
              <button
                onClick={() => {
                  const lat = doctor.clinic?.latitude || 15.3694;
                  const lng = doctor.clinic?.longitude || 44.1910;
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                }}
                className="mt-3 w-full rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2"
              >
                <Navigation size={15} /> الاتجاهات للعيادة
              </button>
            </div>

            {/* QR placeholder + payment */}
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <QrCode size={36} className="text-gray-400" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs text-gray-500">المبلغ المدفوع</p>
                <p className="font-black text-[#2196F3] text-xl">{(doctor.consultation_fee ?? doctor.price ?? 3000).toLocaleString()} ر.ي</p>
                <p className="text-xs text-green-600 font-medium mt-1">تم الدفع بنجاح</p>
              </div>
            </div>

            {/* Perforated edge */}
            <div className="relative h-4">
              <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-50" />
              <div className="absolute right-0 translate-x-1/2 w-4 h-4 rounded-full bg-gray-50" />
              <div className="border-t-2 border-dashed border-gray-200 h-full" />
            </div>

            {/* Bottom stub */}
            <div className="px-5 py-3 flex items-center justify-between bg-gray-50">
              <span className="font-mono text-xs text-gray-500">{bookingRef}</span>
              <span className="text-xs text-gray-400">احتفظ بهذا الرقم للمراجعة</span>
            </div>
          </div>

          {/* Notification hint */}
          <div className="bg-blue-50 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <Bell size={20} className="text-[#2196F3] flex-shrink-0 mt-0.5" />
            <div className="text-right">
              <p className="font-bold text-[#1565C0] text-sm">إشعارات الطابور مفعّلة</p>
              <p className="text-xs text-blue-700 mt-1">سيصلك إشعار عند اقتراب دورك (قبل 3 مرضى) وعند حان وقت الدخول</p>
            </div>
          </div>

          {/* Alert */}
          <div className="bg-amber-50 rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 text-sm">تنبيه</p>
              <p className="text-sm text-amber-700 mt-1">
                يُنصح بالوصول قبل 10 دقائق من موعدك لتجنب فقدان دورك
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-4">
            <button className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center gap-2">
              <Share2 size={16} /> مشاركة
            </button>
            <button className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center gap-2">
              <Download size={16} /> حفظ التذكرة
            </button>
          </div>

          <button
            onClick={() => onComplete?.(createdAppointment)}
            className="w-full bg-[#2196F3] text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
          >
            متابعة حالة الطابور
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2196F3] to-[#1976D2]">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (step === 'payment') setStep('symptoms');
              else onBack?.();
            }}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">
            {step === 'symptoms' ? 'إكمال الحجز' : 'طريقة الدفع'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded-t-3xl min-h-[calc(100vh-100px)] px-4 pt-6">
        {/* Doctor & Queue Info */}
        <div className="bg-white rounded-2xl shadow p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#2196F3] rounded-xl flex items-center justify-center text-white font-bold">
              {doctor.full_name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">{doctor.full_name}</h3>
              <p className="text-sm text-[#2196F3]">{doctor.specialization?.name_ar}</p>
            </div>
          </div>

          {/* Queue Info Badge */}
          <div className="flex items-center justify-between bg-blue-50 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#2196F3]" />
              <span className="text-gray-700">رقم الطابور</span>
            </div>
            <span className="font-bold text-[#2196F3] text-lg">#{queueNumber}</span>
          </div>

          <div className="flex items-center justify-between mt-3 text-sm">
            <span className="text-gray-500">وقت الانتظار المتوقع:</span>
            <span className="font-medium text-gray-800">{estimatedWaitMinutes} دقيقة</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">احضر تقريباً الساعة:</span>
            <span className="font-medium text-[#2196F3]">{estimatedArrivalTime}</span>
          </div>
        </div>

        {step === 'symptoms' && (
          <>
            <h3 className="font-bold text-gray-800 mb-3">الأعراض (اختياري)</h3>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="اشرح الأعراض التي تعاني منها..."
              rows={4}
              className="w-full p-4 bg-white rounded-2xl border border-gray-200 focus:border-[#2196F3] focus:ring-2 focus:ring-blue-100 outline-none resize-none text-right"
            />

            <div className="mt-6">
              <button
                onClick={() => setIsEmergency(!isEmergency)}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-colors ${
                  isEmergency
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                <AlertCircle size={20} />
                <div className="text-right flex-1">
                  <p className="font-medium">حالة طارئة</p>
                  <p className="text-xs opacity-70">اختر هذا الخيار إذا كانت حالتك تستدعي معاينة أولوية</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isEmergency ? 'border-red-500 bg-red-500' : 'border-gray-300'
                  }`}
                >
                  {isEmergency && <CheckCircle size={16} className="text-white" />}
                </div>
              </button>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            <h3 className="font-bold text-gray-800 mb-3">اختر طريقة الدفع</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;

                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-2 border-[#2196F3]'
                        : 'bg-white border-2 border-gray-100'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method.color}`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-bold text-gray-800">{method.name}</p>
                      {method.id === 'cash' && (
                        <p className="text-xs text-gray-500">الدفع عند الوصول للعيادة</p>
                      )}
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#2196F3] bg-[#2196F3]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <CheckCircle size={16} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Summary */}
            <div className="mt-6 bg-white rounded-2xl p-5 border border-gray-100">
              <h4 className="font-bold text-gray-800 mb-4">ملخص الحجز</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">الطبيب:</span>
                  <span className="font-medium">{doctor.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">رقم الطابور:</span>
                  <span className="font-medium text-[#2196F3]">#{queueNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">وقت الحضور:</span>
                  <span className="font-medium">{estimatedArrivalTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">رسم الكشف:</span>
                  <span className="font-medium">{doctor.consultation_fee} ر.ي</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Continue Button */}
        <div className="mt-6 pb-24">
          <button
            onClick={handleContinue}
            disabled={(step === 'payment' && !paymentMethod) || isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
              ((step === 'symptoms') || (step === 'payment' && paymentMethod)) && !isSubmitting
                ? 'bg-[#2196F3] text-white shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'جاري الحجز...' : step === 'symptoms' ? 'متابعة' : 'تأكيد الحجز'}
          </button>
        </div>
      </div>
    </div>
  );
}
