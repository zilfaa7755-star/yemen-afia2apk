import React, { useState, useEffect } from 'react';
import {
  Siren,
  Phone,
  MapPin,
  Navigation,
  Clock,
  Building2,
  ChevronLeft,
  Ambulance,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Hospital } from '../types';

interface EmergencyPageProps {
  onBack?: () => void;
}

export function EmergencyPage({ onBack }: EmergencyPageProps) {
  const { currentLocation } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

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
      name: 'مستشفى الثورة',
      address: 'صنعاء - شارع الخمسين',
      phone: '01-789012',
      emergency_phone: '199',
      latitude: 15.3665,
      longitude: 44.1885,
      services: ['طوارئ', 'عمليات', 'عناية مركزة', 'أشعة', 'مختبر'],
      is_active: true,
    },
    {
      id: '2',
      name: 'مستشفى الكويتي',
      address: 'صنعاء - الستين',
      phone: '01-567890',
      emergency_phone: '199',
      latitude: 15.3570,
      longitude: 44.1860,
      services: ['طوارئ', 'عمليات', 'أطفال', 'نساء'],
      is_active: true,
    },
    {
      id: '3',
      name: 'مستشفى الجمهورية',
      address: 'صنعاء - حدة',
      phone: '01-234567',
      emergency_phone: '195',
      latitude: 15.3750,
      longitude: 44.2000,
      services: ['طوارئ', 'قلب', 'عظام'],
      is_active: true,
    },
    {
      id: '4',
      name: 'مستشفى الأنوار',
      address: 'صنعاء - شعوب',
      phone: '01-456789',
      emergency_phone: '191',
      latitude: 15.3850,
      longitude: 44.1750,
      services: ['طوارئ', 'أطفال', 'نساء'],
      is_active: true,
    },
  ];

  const calculateDistance = (hospital: Hospital): number => {
    if (!currentLocation) return 0;
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
    <div className="page-container bg-gray-50">
      <Header title="أسعفني" showBack onBack={onBack} />

      <div className="px-4 pt-4">
        {/* Emergency Call Button */}
        <button className="w-full bg-gradient-to-r from-error-600 to-error-500 rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Ambulance size={32} className="text-white" />
            </div>
            <div className="text-right text-white">
              <h2 className="text-xl font-bold">اتصل بالإسعاف</h2>
              <p className="text-white/80 text-sm">رقم الطوارئ الموحد: 199</p>
            </div>
            <div className="mr-auto">
              <Phone size={32} className="text-white" />
            </div>
          </div>
        </button>

        {/* Support Card */}
        <div className="bg-white rounded-2xl shadow-soft p-4 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <MessageCircle size={24} className="text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800">خدمة العملاء</h3>
              <p className="text-sm text-gray-500">متاحون 24/7 لمساعدتك</p>
            </div>
            <Phone size={20} className="text-primary-600" />
          </div>
        </div>

        {/* Warning */}
        <div className="bg-warning-50 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={24} className="text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="text-right">
            <p className="font-medium text-warning-700">في الحالات الطارئة</p>
            <p className="text-sm text-warning-600 mt-1">
              إذا كانت الحالة طارئة، اتصل بالإسعاف مباشرة أو توجه لأقرب مستشفى. هذه الخدمة للتواصل والاستفسار فقط.
            </p>
          </div>
        </div>

        {/* Hospitals List */}
        <h3 className="font-bold text-gray-800 mb-3">المستشفيات القريبة</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {sortedHospitals.map((hospital, index) => {
              const distance = calculateDistance(hospital);

              return (
                <div
                  key={hospital.id}
                  className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100"
                >
                  {index === 0 && (
                    <div className="bg-success-50 px-4 py-1.5 text-center">
                      <span className="text-success-700 text-xs font-medium">الأقرب إليك</span>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-error-100 rounded-xl flex items-center justify-center">
                        <Building2 size={24} className="text-error-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{hospital.name}</h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                          <MapPin size={14} />
                          {hospital.address}
                        </div>
                        <div className="flex items-center gap-1 text-primary-600 text-sm">
                          <Navigation size={14} />
                          {distance > 0 ? `${distance} كم` : 'الموقع غير متاح'}
                        </div>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {hospital.services?.slice(0, 4).map((service, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          {service}
                        </span>
                      ))}
                    </div>

                    {/* Contact Buttons */}
                    <div className="flex gap-2 mt-4">
                      <a
                        href={`tel:${hospital.phone}`}
                        className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Phone size={16} />
                        هاتف
                      </a>
                      <a
                        href={`tel:${hospital.emergency_phone}`}
                        className="flex-1 py-2.5 rounded-xl bg-error-100 text-error-700 font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Siren size={16} />
                        طوارئ
                      </a>
                      <button className="py-2.5 px-4 rounded-xl bg-primary-100 text-primary-700 font-medium text-sm flex items-center justify-center gap-2">
                        <Navigation size={16} />
                        اتجاهات
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
  );
}
