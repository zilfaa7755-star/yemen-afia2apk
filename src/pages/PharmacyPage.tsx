import React, { useState, useEffect } from 'react';
import {
  Pill,
  MapPin,
  Clock,
  ChevronLeft,
  Camera,
  Send,
  ShoppingBag,
  CheckCircle,
  Truck,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Pharmacy } from '../types';

interface PharmacyPageProps {
  onBack?: () => void;
}

export function PharmacyPage({ onBack }: PharmacyPageProps) {
  const { currentLocation, user } = useAuth();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [step, setStep] = useState<'list' | 'order' | 'confirmation'>('list');
  const [medicationName, setMedicationName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPharmacies();
  }, []);

  const loadPharmacies = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('pharmacies').select('*').eq('is_active', true);
      setPharmacies(data && data.length > 0 ? (data as Pharmacy[]) : getDemoPharmacies());
    } catch {
      setPharmacies(getDemoPharmacies());
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoPharmacies = (): Pharmacy[] => [
    { id: '1', name: 'صيدلية السعيد', address: 'صنعاء - شارع الزبيري', phone: '01-111111', latitude: 15.3695, longitude: 44.1915, working_hours: { start: '08:00', end: '23:00' }, delivery_available: true, is_active: true },
    { id: '2', name: 'صيدلية النور', address: 'صنعاء - شارع الخمسين', phone: '01-222222', latitude: 15.3660, longitude: 44.1880, working_hours: { start: '08:00', end: '22:00' }, delivery_available: true, is_active: true },
    { id: '3', name: 'صيدلية الرحمة', address: 'صنعاء - شارع تونس', phone: '01-333333', latitude: 15.3745, longitude: 44.1955, working_hours: { start: '09:00', end: '21:00' }, delivery_available: true, is_active: true },
    { id: '4', name: 'صيدلية الحياة', address: 'صنعاء - الستين', phone: '01-444444', latitude: 15.3575, longitude: 44.1865, working_hours: { start: '08:00', end: '20:00' }, delivery_available: false, is_active: true },
  ];

  const calculateDistance = (pharmacy: Pharmacy): number => {
    if (!currentLocation) return 0;
    const lat1 = currentLocation.lat * (Math.PI / 180);
    const lon1 = currentLocation.lng * (Math.PI / 180);
    const lat2 = pharmacy.latitude * (Math.PI / 180);
    const lon2 = pharmacy.longitude * (Math.PI / 180);
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
    return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  };

  const sortedPharmacies = [...pharmacies].sort((a, b) => calculateDistance(a) - calculateDistance(b));

  const handleSelectPharmacy = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setStep('order');
    setMedicationName('');
    setAddress('');
    setNotes('');
  };

  const handleSubmitOrder = async () => {
    if (!medicationName.trim() || !address.trim() || !selectedPharmacy) return;
    setIsSubmitting(true);
    try {
      await supabase.from('pharmacy_orders').insert({
        patient_id: user?.id || 'demo',
        pharmacy_id: selectedPharmacy.id,
        medications: medicationName,
        address,
        notes,
        status: 'pending',
      });
      setStep('confirmation');
    } catch {
      setStep('confirmation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmation Screen
  if (step === 'confirmation' && selectedPharmacy) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">تم إرسال طلبك!</h1>
          <p className="text-gray-500 text-center mb-6">
            سيقوم فريق {selectedPharmacy.name} بتجهيز طلبك والتواصل معك قريباً
          </p>

          <div className="w-full bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm">الصيدلية</span>
              <span className="font-bold text-gray-800">{selectedPharmacy.name}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-500 text-sm">الأدوية</span>
              <span className="font-medium text-gray-700 text-left max-w-[55%] truncate">{medicationName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">العنوان</span>
              <span className="font-medium text-gray-700 text-left max-w-[55%] truncate">{address}</span>
            </div>
          </div>

          {selectedPharmacy.delivery_available && (
            <div className="w-full bg-[#E8F5F4] rounded-2xl p-4 mb-6 flex items-center gap-3">
              <Truck size={24} className="text-[#199A8E]" />
              <div className="flex-1 text-right">
                <p className="font-medium text-[#199A8E]">التوصيل متاح</p>
                <p className="text-xs text-[#104C48]">سيتم التوصيل خلال 30-60 دقيقة</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setStep('list');
              setSelectedPharmacy(null);
            }}
            className="w-full py-4 rounded-2xl bg-[#199A8E] text-white font-bold"
          >
            حسناً
          </button>
        </div>
      </div>
    );
  }

  // Order Form Screen
  if (step === 'order' && selectedPharmacy) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] pb-6">
        <div className="bg-gradient-to-b from-[#104C48] via-[#125853] to-[#199A8E] pt-3 pb-16 px-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (onBack) onBack();
                else window.dispatchEvent(new CustomEvent('nav-to-main'));
              }}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
              title="العودة للقائمة الرئيسية"
            >
              <Home size={16} />
              <span>الرئيسية</span>
            </button>
            <h1 className="text-xl font-bold text-white">طلب الأدوية</h1>
            <button onClick={() => setStep('list')} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white" title="رجوع للقائمة">
              <ChevronLeft size={22} className="rotate-180" />
            </button>
          </div>
        </div>

        <div className="px-4 -mt-10 relative z-30">
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#E8F5F4] rounded-xl flex items-center justify-center">
                <Pill size={24} className="text-[#199A8E]" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-bold text-gray-800">{selectedPharmacy.name}</p>
                <p className="text-sm text-gray-500">{selectedPharmacy.address}</p>
              </div>
            </div>
          </div>

          {/* Upload Prescription */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-gray-100">
            <p className="font-bold text-gray-800 text-sm mb-3">رفع الوصفة الطبية</p>
            <button className="w-full border-2 border-dashed border-[#199A8E]/40 rounded-xl p-5 flex flex-col items-center gap-2 hover:bg-[#E8F5F4] transition-colors">
              <div className="w-12 h-12 bg-[#E8F5F4] rounded-xl flex items-center justify-center">
                <Camera size={24} className="text-[#199A8E]" />
              </div>
              <span className="text-[#199A8E] font-medium text-sm">التقط صورة للوصفة</span>
            </button>
          </div>

          {/* Medication Entry */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-gray-100">
            <p className="font-bold text-gray-800 text-sm mb-2">أسماء الأدوية المطلوبة *</p>
            <textarea
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="اكتب أسماء الأدوية..."
              rows={3}
              className="w-full p-3 rounded-xl border border-gray-200 resize-none text-sm"
            />
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 border border-gray-100">
            <p className="font-bold text-gray-800 text-sm mb-2">عنوان التوصيل *</p>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="أدخل عنوانك..."
              rows={2}
              className="w-full p-3 rounded-xl border border-gray-200 resize-none text-sm"
            />
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
            <p className="font-bold text-gray-800 text-sm mb-2">ملاحظات (اختياري)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات..."
              rows={2}
              className="w-full p-3 rounded-xl border border-gray-200 resize-none text-sm"
            />
          </div>

          {selectedPharmacy.delivery_available && (
            <div className="bg-[#E8F5F4] rounded-2xl p-4 mb-6 flex items-center gap-3">
              <Truck size={22} className="text-[#199A8E]" />
              <div className="flex-1 text-right">
                <p className="font-medium text-[#199A8E]">التوصيل متاح</p>
                <p className="text-xs text-[#104C48]">خلال 30-60 دقيقة</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmitOrder}
            disabled={!medicationName.trim() || !address.trim() || isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${
              medicationName.trim() && address.trim() ? 'bg-[#199A8E] text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={18} />
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        </div>
      </div>
    );
  }

  // List Screen
  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-6">
      <div className="bg-gradient-to-b from-[#104C48] via-[#125853] to-[#199A8E] pt-3 pb-20 px-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (onBack) onBack();
              else window.dispatchEvent(new CustomEvent('nav-to-main'));
            }}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
            title="العودة للقائمة الرئيسية"
          >
            <Home size={16} />
            <span>الرئيسية</span>
          </button>
          <h1 className="text-xl font-bold text-white">صيدليتي</h1>
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition active:scale-95"
            title="رجوع"
          >
            <ChevronLeft size={22} className="rotate-180" />
          </button>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <div className="text-right flex-1">
            <p className="font-bold text-white">اطلب دواءك</p>
            <p className="text-white/70 text-sm mt-0.5">أرسل وصفتك الطبية وسيتم توصيلها إليك</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-30">
        <p className="font-bold text-gray-800 text-sm mb-3">الصيدليات القريبة</p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#199A8E]" />
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPharmacies.map((pharmacy) => {
              const distance = calculateDistance(pharmacy);
              return (
                <button
                  key={pharmacy.id}
                  onClick={() => handleSelectPharmacy(pharmacy)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-right"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#E8F5F4] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Pill size={22} className="text-[#199A8E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">{pharmacy.name}</h3>
                        {pharmacy.delivery_available && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">توصيل</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin size={12} />
                        {pharmacy.address}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Clock size={12} />
                        {typeof pharmacy.working_hours === 'object' && pharmacy.working_hours ? `${pharmacy.working_hours.start} - ${pharmacy.working_hours.end}` : (pharmacy.working_hours || '8:00 - 22:00')}
                        {distance > 0 && <span className="mr-2 text-[#199A8E]">{distance} كم</span>}
                      </div>
                    </div>
                    <ChevronLeft size={18} className="text-gray-400 flex-shrink-0" />
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
