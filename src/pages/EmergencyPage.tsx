import React, { useState, useEffect } from 'react';
import {
  Siren,
  Phone,
  MapPin,
  Navigation,
  Building2,
  ChevronLeft,
  Ambulance,
  AlertTriangle,
  MessageCircle,
  HeartPulse,
  Droplet,
  ShieldAlert,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Hospital } from '../types';

interface EmergencyPageProps {
  onBack?: () => void;
  onNavigateToBlood?: () => void;
}

export function EmergencyPage({ onBack, onNavigateToBlood }: EmergencyPageProps) {
  const { currentLocation } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('hospitals').select('*').eq('is_active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        setHospitals(data as Hospital[]);
      } else {
        setHospitals(getDemoHospitals());
      }
    } catch (error) {
      console.error('Error loading hospitals:', error);
      setHospitals(getDemoHospitals());
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoHospitals = (): Hospital[] => [
    {
      id: '1',
      name: 'مستشفى الثورة العام النموذجي',
      address: 'صنعاء - شارع الخمسين',
      phone: '01-789012',
      emergency_phone: '199',
      latitude: 15.3665,
      longitude: 44.1885,
      services: ['طوارئ عامة', 'عمليات كبرى', 'عناية مركزة ICU', 'بنك دم مركزي', 'قسطرة قلبية'],
      is_active: true,
    },
    {
      id: '2',
      name: 'المستشفى الكويتي التخصصي',
      address: 'صنعاء - شارع الستين',
      phone: '01-567890',
      emergency_phone: '199',
      latitude: 15.3570,
      longitude: 44.1860,
      services: ['طوارئ 24/7', 'طوارئ أطفال', 'عناية مركزة', 'مختبر طوارئ'],
      is_active: true,
    },
    {
      id: '3',
      name: 'مستشفى الجمهورية التعليمي',
      address: 'صنعاء - حي حدة',
      phone: '01-234567',
      emergency_phone: '195',
      latitude: 15.3750,
      longitude: 44.2000,
      services: ['طوارئ وحوادث', 'جراحة عظام', 'طوارئ باطنية'],
      is_active: true,
    },
    {
      id: '4',
      name: 'مستشفى الأنوار التخصصي',
      address: 'صنعاء - شعوب',
      phone: '01-456789',
      emergency_phone: '191',
      latitude: 15.3850,
      longitude: 44.1750,
      services: ['طوارئ نساء وتوليد', 'أطفال وحواضن'],
      is_active: true,
    },
  ];

  const calculateDistance = (hospital: Hospital): number => {
    if (!currentLocation) return 1.5;
    const lat1 = currentLocation.lat * (Math.PI / 180);
    const lon1 = currentLocation.lng * (Math.PI / 180);
    const lat2 = hospital.latitude * (Math.PI / 180);
    const lon2 = hospital.longitude * (Math.PI / 180);
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(6371 * c * 10) / 10;
  };

  const sortedHospitals = [...hospitals].sort((a, b) => {
    return calculateDistance(a) - calculateDistance(b);
  });

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-16">
      <Header title="طوارئ أسعفني 24/7" showBack onBack={onBack} />

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Urgent Emergency Call Banner */}
        <a
          href="tel:199"
          className="block w-full bg-gradient-to-r from-[#D32F2F] to-[#E53935] rounded-[24px] p-5 shadow-[0_4px_20px_-2px_rgba(229,57,53,0.25)] border border-rose-300 transition active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-white">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 animate-pulse">
              <Ambulance size={30} className="text-white" />
            </div>
            <div className="text-right flex-1 px-4">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">خط ساخن عاجل</span>
                <h2 className="text-lg font-black">اتصال فوري بالإسعاف</h2>
              </div>
              <p className="text-white/90 text-xs mt-1">الرقم الموحد للطوارئ والإسعاف الطبي: 199</p>
            </div>
            <div className="w-12 h-12 bg-white text-[#E53935] rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <Phone size={24} />
            </div>
          </div>
        </a>

        {/* Quick Triage Grid */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="tel:195"
            className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-sm flex items-center gap-3 text-right hover:border-[#199A8E] transition"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-[#104C48]">الدفاع المدني</p>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5 font-bold">195</p>
            </div>
          </a>

          <a
            href="tel:191"
            className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-sm flex items-center gap-3 text-right hover:border-[#199A8E] transition"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E8F5F4] text-[#199A8E] flex items-center justify-center shrink-0">
              <HeartPulse size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-[#104C48]">طوارئ المستشفيات</p>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5 font-bold">191</p>
            </div>
          </a>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200/80 flex items-start gap-3 text-right">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-xs text-amber-900">توجيه الحالات الحرجة</p>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              إذا كان المريض يعاني من نزيف حاد، فقدان وعي، أو ألم حاد في الصدر، اتصل بالإسعاف مباشرة وتوجه لأقرب مركز طوارئ فورا.
            </p>
          </div>
        </div>

        {/* Hospitals List */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs text-slate-400 font-medium">مرتبة حسب الأقرب إلى موقعك</span>
            <h3 className="font-bold text-sm text-[#104C48] flex items-center gap-1.5">
              <span>أقسام الطوارئ القريبة</span>
              <Building2 size={16} className="text-[#199A8E]" />
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#199A8E]" />
            </div>
          ) : (
            <div className="space-y-3 pb-12">
              {sortedHospitals.map((hospital, index) => {
                const distance = calculateDistance(hospital);

                return (
                  <div
                    key={hospital.id}
                    className="bg-white rounded-[22px] border border-[#E2E8F0] shadow-sm overflow-hidden text-right hover:border-[#199A8E]/40 transition"
                  >
                    {index === 0 && (
                      <div className="bg-[#E8F5F4] px-4 py-1.5 text-center border-b border-[#199A8E]/15">
                        <span className="text-[#104C48] text-xs font-bold">الأقرب إلى موقعك الحالي (وصول سريع)</span>
                      </div>
                    )}

                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-rose-50 text-[#E53935] rounded-2xl flex items-center justify-center shrink-0 border border-rose-100">
                            <Building2 size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#104C48]">{hospital.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 justify-end">
                              <span>{hospital.address}</span>
                              <MapPin size={12} className="text-[#199A8E]" />
                            </p>
                          </div>
                        </div>

                        <div className="bg-[#E8F5F4] px-2.5 py-1 rounded-xl text-center shrink-0">
                          <span className="text-[10px] text-slate-500 block">المسافة</span>
                          <span className="text-xs font-black text-[#104C48] font-mono">{distance} كم</span>
                        </div>
                      </div>

                      {/* Services Chips */}
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {hospital.services?.slice(0, 4).map((service, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] font-semibold text-slate-600"
                          >
                            {service}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <a
                          href={`tel:${hospital.emergency_phone}`}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D32F2F] to-[#E53935] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
                        >
                          <Siren size={15} />
                          <span>طوارئ ({hospital.emergency_phone})</span>
                        </a>

                        <a
                          href={`tel:${hospital.phone}`}
                          className="px-4 py-2.5 rounded-xl bg-[#E8F5F4] text-[#104C48] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                        >
                          <Phone size={14} className="text-[#199A8E]" />
                          <span>هاتف</span>
                        </a>

                        <button
                          onClick={() => {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`,
                              '_blank'
                            );
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition"
                          title="توجيه عبر الخريطة"
                        >
                          <Navigation size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
