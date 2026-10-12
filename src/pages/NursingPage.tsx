import React, { useState, useEffect } from 'react';
import {
  Syringe,
  Scissors,
  Activity,
  Droplet,
  Stethoscope,
  MapPin,
  Clock,
  ChevronLeft,
  CheckCircle,
  Smartphone,
  Banknote,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { NursingService } from '../types';

interface NursingPageProps {
  onBack?: () => void;
}

const serviceTypes = [
  { id: 'all', name: 'الكل' },
  { id: 'injection', name: 'إبر', icon: Syringe },
  { id: 'stitching', name: 'خياطة', icon: Scissors },
  { id: 'dressing', name: 'تغيير جبس', icon: Activity },
  { id: 'blood_draw', name: 'سحب دم', icon: Droplet },
  { id: 'iv_therapy', name: 'محاليل', icon: Droplet },
];

const paymentMethods = [
  { id: 'mtn', name: 'MTN Cash', icon: Smartphone, color: 'bg-yellow-500' },
  { id: 'yemen_mobile', name: 'اليمن موبايل', icon: Smartphone, color: 'bg-blue-600' },
  { id: 'cash', name: 'دفع عند الوصول', icon: Banknote, color: 'bg-green-600' },
];

export function NursingPage({ onBack }: NursingPageProps) {
  const { currentLocation, user } = useAuth();
  const [selectedService, setSelectedService] = useState('all');
  const [nursingServices, setNursingServices] = useState<NursingService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNursing, setSelectedNursing] = useState<NursingService | null>(null);
  const [step, setStep] = useState<'list' | 'booking' | 'payment' | 'confirmation'>('list');
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState({ date: '', time: '', address: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadNursingServices();
  }, []);

  const loadNursingServices = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('nursing_services').select('*').eq('is_available', true);
      setNursingServices(data && data.length > 0 ? (data as NursingService[]) : getDemoServices());
    } catch {
      setNursingServices(getDemoServices());
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoServices = (): NursingService[] => [
    { id: '1', nurse_name: 'م. أحمد المحمدي', phone: '777123456', service_type: 'injection', service_name: 'ضرب الإبر العضلية والوريدية', description: 'خدمة ضرب الإبر المنزلية بأساليب احترافية', price: 500, latitude: 15.3700, longitude: 44.1900, service_radius_km: 10, is_available: true },
    { id: '2', nurse_name: 'م. فاطمة الخادمي', phone: '777789012', service_type: 'stitching', service_name: 'خياطة الجروح', description: 'خياطة وتنظيف الجروح في المنزل', price: 1500, latitude: 15.3650, longitude: 44.1850, service_radius_km: 15, is_available: true },
    { id: '3', nurse_name: 'م. يوسف السلامي', phone: '777345678', service_type: 'dressing', service_name: 'تغيير الجبس والضمادات', description: 'تبديل الجبس وتغيير الضمادات الطبية', price: 800, latitude: 15.3750, longitude: 44.1950, service_radius_km: 12, is_available: true },
    { id: '4', nurse_name: 'م. نورة الحيمي', phone: '777567890', service_type: 'blood_draw', service_name: 'سحب عينات الدم', description: 'سحب الدم للتحاليل المخبرية', price: 400, latitude: 15.3600, longitude: 44.1800, service_radius_km: 20, is_available: true },
    { id: '5', nurse_name: 'م. خالد القدسي', phone: '777890123', service_type: 'iv_therapy', service_name: 'تركيب محاليل وريدية', description: 'تركيب المحاليل الطبية الوريدية', price: 700, latitude: 15.3800, longitude: 44.2000, service_radius_km: 8, is_available: true },
  ];

  const calculateDistance = (service: NursingService): number => {
    if (!currentLocation) return 0;
    const lat1 = currentLocation.lat * (Math.PI / 180);
    const lon1 = currentLocation.lng * (Math.PI / 180);
    const lat2 = service.latitude * (Math.PI / 180);
    const lon2 = service.longitude * (Math.PI / 180);
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(6371 * c * 10) / 10;
  };

  const filteredServices = selectedService === 'all' ? nursingServices : nursingServices.filter((s) => s.service_type === selectedService);
  const sortedServices = [...filteredServices].sort((a, b) => calculateDistance(a) - calculateDistance(b));

  const getServiceIcon = (type: string) => {
    const iconMap: Record<string, React.ElementType> = { injection: Syringe, stitching: Scissors, dressing: Activity, blood_draw: Droplet, iv_therapy: Droplet, other: Stethoscope };
    return iconMap[type] || Stethoscope;
  };

  const handleSelectService = (service: NursingService) => {
    setSelectedNursing(service);
    setStep('booking');
    setBookingData({ date: new Date().toISOString().split('T')[0], time: '09:00', address: '', notes: '' });
  };

  const handleConfirmBooking = () => {
    if (!bookingData.address.trim()) return;
    setStep('payment');
  };

  const handlePayment = async () => {
    if (!selectedPayment || !selectedNursing) return;
    setIsSubmitting(true);
    try {
      await supabase.from('nursing_requests').insert({
        patient_id: user?.id || 'demo',
        nurse_id: selectedNursing.id,
        service_type: selectedNursing.service_type,
        appointment_date: bookingData.date,
        appointment_time: bookingData.time,
        address: bookingData.address,
        notes: bookingData.notes,
        status: 'pending',
        payment_method: selectedPayment,
        total_amount: selectedNursing.price,
      });
      setStep('confirmation');
    } catch {
      setStep('confirmation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmation Screen
  if (step === 'confirmation' && selectedNursing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">تم الحجز بنجاح!</h1>
          <p className="text-gray-500 text-center mb-6">سيتم إرسال ممرض إلى عنوانك في الموعد المحدد</p>

          <div className="w-full bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm">الخدمة</span>
              <span className="font-bold text-gray-800">{selectedNursing.service_name}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm">الممرض</span>
              <span className="font-medium text-gray-700">{selectedNursing.nurse_name}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm">التاريخ</span>
              <span className="font-medium text-gray-700">{bookingData.date}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm">الساعة</span>
              <span className="font-medium text-gray-700">{bookingData.time}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-gray-500 text-sm">المبلغ</span>
              <span className="font-bold text-[#199A8E]">{selectedNursing.price} ر.ي</span>
            </div>
          </div>

          <button
            onClick={() => {
              setStep('list');
              setSelectedNursing(null);
            }}
            className="w-full py-4 rounded-2xl bg-[#199A8E] text-white font-bold"
          >
            حسناً
          </button>
        </div>
      </div>
    );
  }

  // Payment Screen
  if (step === 'payment' && selectedNursing) {
    return (
      <div className="min-h-screen bg-gray-50 pb-6">
        <div className="bg-gradient-to-b from-[#104C48] via-[#125853] to-[#199A8E] pt-3 pb-16 px-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('booking')} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronLeft size={22} className="text-white rotate-180" />
            </button>
            <h1 className="text-xl font-bold text-white">الدفع</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-4 -mt-10 relative z-30">
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-[#199A8E]">{selectedNursing.price} ر.ي</span>
              <span className="text-gray-500">{selectedNursing.service_name}</span>
            </div>
          </div>

          <p className="font-bold text-gray-800 mb-3">اختر طريقة الدفع</p>
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                    selectedPayment === method.id ? 'border-[#199A8E] bg-[#E8F5F4]' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="font-medium text-gray-800">{method.name}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handlePayment}
            disabled={!selectedPayment || isSubmitting}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg ${
              selectedPayment ? 'bg-[#199A8E] text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            {isSubmitting ? 'جاري المعالجة...' : 'تأكيد الدفع'}
          </button>
        </div>
      </div>
    );
  }

  // Booking Form Screen
  if (step === 'booking' && selectedNursing) {
    const Icon = getServiceIcon(selectedNursing.service_type);
    return (
      <div className="min-h-screen bg-gray-50 pb-6">
        <div className="bg-gradient-to-b from-[#104C48] via-[#125853] to-[#199A8E] pt-3 pb-16 px-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('list')} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronLeft size={22} className="text-white rotate-180" />
            </button>
            <h1 className="text-xl font-bold text-white">تفاصيل الحجز</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-4 -mt-10 relative z-30">
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E8F5F4] rounded-xl flex items-center justify-center">
                <Icon size={22} className="text-[#199A8E]" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-bold text-gray-800">{selectedNursing.service_name}</p>
                <p className="text-sm text-gray-500">{selectedNursing.nurse_name}</p>
              </div>
              <p className="font-bold text-[#199A8E]">{selectedNursing.price} ر.ي</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
            <input
              type="date"
              value={bookingData.date}
              onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
              className="w-full p-3.5 rounded-xl border border-gray-200"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">الساعة</label>
            <input
              type="time"
              value={bookingData.time}
              onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
              className="w-full p-3.5 rounded-xl border border-gray-200"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">عنوانك *</label>
            <textarea
              value={bookingData.address}
              onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
              placeholder="أدخل عنوانك بالتفصيل..."
              rows={2}
              className="w-full p-3.5 rounded-xl border border-gray-200 resize-none"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات (اختياري)</label>
            <textarea
              value={bookingData.notes}
              onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
              placeholder="أي تفاصيل إضافية..."
              rows={2}
              className="w-full p-3.5 rounded-xl border border-gray-200 resize-none"
            />
          </div>

          <button
            onClick={handleConfirmBooking}
            disabled={!bookingData.address.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-lg ${
              bookingData.address.trim() ? 'bg-[#199A8E] text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            المتابعة للدفع
          </button>
        </div>
      </div>
    );
  }

  // List Screen
  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-gradient-to-b from-[#104C48] via-[#125853] to-[#199A8E] pt-3 pb-20 px-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={22} className="text-white rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-white">خدمة التمريض المنزلي</h1>
          <div className="w-10" />
        </div>
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Syringe size={28} className="text-white" />
          </div>
          <div className="text-right">
            <p className="font-bold text-white">ممرض في منزلك</p>
            <p className="text-white/70 text-sm mt-0.5">استدع ممرضاً محترفاً لأي إجراء تمريضي</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-30">
        {/* Service Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {serviceTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedService(type.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                  selectedService === type.id ? 'bg-[#199A8E] text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {Icon && <Icon size={16} />}
                {type.name}
              </button>
            );
          })}
        </div>

        {/* Services List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#199A8E]" />
          </div>
        ) : sortedServices.length === 0 ? (
          <div className="text-center py-12">
            <Syringe size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">لا توجد خدمات متاحة</p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {sortedServices.map((service) => {
              const Icon = getServiceIcon(service.service_type);
              const distance = calculateDistance(service);

              return (
                <button
                  key={service.id}
                  onClick={() => handleSelectService(service)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-right"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#E8F5F4] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={22} className="text-[#199A8E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800">{service.service_name}</h3>
                      <p className="text-sm text-[#199A8E]">{service.nurse_name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <MapPin size={12} />
                        {distance > 0 ? `${distance} كم` : 'متاح'}
                        <span>•</span>
                        <Clock size={12} />
                        متاح اليوم
                      </div>
                    </div>
                    <p className="font-bold text-[#199A8E]">{service.price} ر.ي</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
