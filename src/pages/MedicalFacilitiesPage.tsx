import React, { useState, useEffect } from 'react';
import {
  Building2,
  FlaskConical,
  Pill,
  Stethoscope,
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  Search,
  X,
  ChevronLeft,
  Filter,
  Heart,
  Microscope,
  Syringe,
  Eye,
  Sparkles,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { FacilityInteractiveMap } from '../components/common/FacilityInteractiveMap';

interface MedicalFacilitiesPageProps {
  onBack?: () => void;
}

type FacilityType = 'all' | 'hospital' | 'clinic' | 'lab' | 'pharmacy' | 'imaging' | 'specialty';

interface Facility {
  id: string;
  type: FacilityType;
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  rating?: number;
  total_reviews?: number;
  services: string[];
  working_hours?: string;
  is_open_24h?: boolean;
  distance?: number;
  is_active: boolean;
}

const demoFacilities: Facility[] = [
  { id: 'h1', type: 'hospital', name: 'مستشفى الثورة التعليمي', address: 'صنعاء - شارع الخمسين', phone: '01-789012', latitude: 15.3665, longitude: 44.1885, rating: 4.1, total_reviews: 312, services: ['طوارئ 24/7', 'جراحة', 'عناية مركزة', 'أشعة', 'مختبر', 'زرع كلى'], working_hours: '24 ساعة', is_open_24h: true, is_active: true },
  { id: 'h2', type: 'hospital', name: 'مستشفى الكويتي التخصصي', address: 'صنعاء - شارع الستين', phone: '01-567890', latitude: 15.3570, longitude: 44.1860, rating: 4.3, total_reviews: 289, services: ['طوارئ', 'قلب وأوعية', 'جراحة عظام', 'أطفال', 'نساء وولادة'], working_hours: '24 ساعة', is_open_24h: true, is_active: true },
  { id: 'h3', type: 'hospital', name: 'مستشفى الجمهورية', address: 'صنعاء - حدة', phone: '01-234567', latitude: 15.3750, longitude: 44.2000, rating: 3.9, total_reviews: 178, services: ['طوارئ', 'قلب', 'عظام', 'جهاز هضمي'], working_hours: '8ص - 10م', is_open_24h: false, is_active: true },
  { id: 'c1', type: 'clinic', name: 'مركز اليمن الطبي', address: 'صنعاء - حي حدة', phone: '01-112233', latitude: 15.3694, longitude: 44.1910, rating: 4.5, total_reviews: 205, services: ['باطنية', 'قلب', 'عيون', 'أعصاب', 'جلدية'], working_hours: '8ص - 9م', is_open_24h: false, is_active: true },
  { id: 'c2', type: 'clinic', name: 'عيادات الشفاء التخصصية', address: 'صنعاء - شارع الستين', phone: '01-445566', latitude: 15.3570, longitude: 44.1860, rating: 4.4, total_reviews: 163, services: ['قلب', 'أطفال', 'نساء وولادة', 'تخدير'], working_hours: '9ص - 8م', is_open_24h: false, is_active: true },
  { id: 'l1', type: 'lab', name: 'مختبرات الدقة الطبية', address: 'صنعاء - شارع الزبيري', phone: '01-778899', latitude: 15.3720, longitude: 44.1930, rating: 4.6, total_reviews: 421, services: ['تحليل دم شامل', 'هرمونات', 'بكتيريولوجيا', 'فيروسات', 'جينات'], working_hours: '7ص - 10م', is_open_24h: false, is_active: true },
  { id: 'l2', type: 'lab', name: 'مختبر الأمل التشخيصي', address: 'صنعاء - حي السبعين', phone: '01-334455', latitude: 15.3620, longitude: 44.1800, rating: 4.2, total_reviews: 187, services: ['تحاليل روتينية', 'فحص البول', 'تحليل البراز', 'PCR'], working_hours: '8ص - 8م', is_open_24h: false, is_active: true },
  { id: 'p1', type: 'pharmacy', name: 'صيدلية السعيد', address: 'صنعاء - شارع الزبيري', phone: '01-111111', latitude: 15.3695, longitude: 44.1915, rating: 4.3, total_reviews: 88, services: ['أدوية', 'توصيل', 'مستلزمات طبية', 'مستحضرات'], working_hours: '8ص - 11م', is_open_24h: false, is_active: true },
  { id: 'p2', type: 'pharmacy', name: 'صيدلية النور (24 ساعة)', address: 'صنعاء - شارع الخمسين', phone: '01-222222', latitude: 15.3660, longitude: 44.1880, rating: 4.1, total_reviews: 55, services: ['أدوية', 'مستلزمات', 'توصيل ليلي'], working_hours: '24 ساعة', is_open_24h: true, is_active: true },
  { id: 'i1', type: 'imaging', name: 'مركز الأشعة التشخيصية', address: 'صنعاء - شارع تونس', phone: '01-556677', latitude: 15.3745, longitude: 44.1955, rating: 4.7, total_reviews: 234, services: ['أشعة عادية', 'أشعة مقطعية (CT)', 'رنين مغناطيسي (MRI)', 'سونار', 'بنورامبك'], working_hours: '8ص - 9م', is_open_24h: false, is_active: true },
  { id: 's1', type: 'specialty', name: 'مركز العيون التخصصي', address: 'صنعاء - حي التحرير', phone: '01-889900', latitude: 15.3680, longitude: 44.1870, rating: 4.8, total_reviews: 302, services: ['فحص نظر', 'عمليات ليزر', 'زرع عدسة', 'شبكية العين'], working_hours: '8ص - 6م', is_open_24h: false, is_active: true },
  { id: 's2', type: 'specialty', name: 'مركز القلب والأوعية الدموية', address: 'صنعاء - حدة', phone: '01-667788', latitude: 15.3710, longitude: 44.1940, rating: 4.6, total_reviews: 195, services: ['قسطرة قلبية', 'زرع دعامات', 'فحص إيكو', 'قسطرة تشخيصية'], working_hours: '8ص - 8م', is_open_24h: false, is_active: true },
];

const facilityTypes: { id: FacilityType; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: 'all', label: 'الكل', icon: Building2, color: 'text-gray-600', bg: 'bg-gray-100' },
  { id: 'hospital', label: 'مستشفيات', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'clinic', label: 'عيادات', icon: Stethoscope, color: 'text-[#199A8E]', bg: 'bg-[#E8F5F4]' },
  { id: 'lab', label: 'مختبرات', icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'pharmacy', label: 'صيدليات', icon: Pill, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'imaging', label: 'أشعة', icon: Eye, color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'specialty', label: 'مراكز تخصصية', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' },
];

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

export function MedicalFacilitiesPage({ onBack }: MedicalFacilitiesPageProps) {
  const { currentLocation } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<FacilityType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showOpen24Only, setShowOpen24Only] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapFacility, setMapFacility] = useState<Facility | null>(null);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('medical_facilities').select('*').eq('is_active', true);
      const items = data && data.length > 0 ? (data as Facility[]) : demoFacilities;
      const withDist = items.map((f) => ({
        ...f,
        distance: currentLocation ? calcDistance(currentLocation.lat, currentLocation.lng, f.latitude, f.longitude) : undefined,
      }));
      setFacilities(withDist.sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99)));
    } catch {
      const withDist = demoFacilities.map((f) => ({
        ...f,
        distance: currentLocation ? calcDistance(currentLocation.lat, currentLocation.lng, f.latitude, f.longitude) : undefined,
      }));
      setFacilities(withDist.sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99)));
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = facilities.filter((f) => {
    if (selectedType !== 'all' && f.type !== selectedType) return false;
    if (showOpen24Only && !f.is_open_24h) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.name.includes(searchQuery) || f.address.includes(searchQuery) || f.services.some((s) => s.includes(searchQuery));
    }
    return true;
  });

  const getTypeConfig = (type: FacilityType) => facilityTypes.find((t) => t.id === type) || facilityTypes[0];

  // Detail Screen
  if (selectedFacility) {
    const tc = getTypeConfig(selectedFacility.type);
    const TypeIcon = tc.icon;
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-gradient-to-b from-[#1565C0] to-[#0D47A1] pt-3 pb-20 px-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedFacility(null)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronLeft size={22} className="text-white rotate-180" />
            </button>
            <h1 className="text-lg font-bold text-white text-center flex-1 mx-3 truncate">{selectedFacility.name}</h1>
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Navigation size={18} className="text-white" />
            </button>
          </div>
        </div>

        <div className="px-4 -mt-12 relative z-30 space-y-4">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className={`${tc.bg} px-5 py-4 flex items-center gap-4`}>
              <div className={`w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm`}>
                <TypeIcon size={28} className={tc.color} />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-800 text-lg">{selectedFacility.name}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white ${tc.color}`}>{tc.label}</span>
              </div>
              {selectedFacility.is_open_24h && (
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">24 ساعة</span>
              )}
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm">{selectedFacility.address}</span>
                {selectedFacility.distance !== undefined && (
                  <span className="mr-auto text-[#199A8E] text-sm font-medium">{selectedFacility.distance} كم</span>
                )}
              </div>
              {selectedFacility.working_hours && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm">{selectedFacility.working_hours}</span>
                </div>
              )}
              {selectedFacility.rating && (
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-gray-800">{selectedFacility.rating}</span>
                  <span className="text-gray-400 text-sm">({selectedFacility.total_reviews?.toLocaleString('ar')} تقييم)</span>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="font-bold text-gray-800 mb-3">الخدمات المتاحة</h3>
            <div className="flex flex-wrap gap-2">
              {selectedFacility.services.map((s, i) => (
                <span key={i} className={`px-3 py-1.5 rounded-xl text-sm font-medium ${tc.bg} ${tc.color}`}>{s}</span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            {selectedFacility.phone && (
              <a
                href={`tel:${selectedFacility.phone}`}
                className="bg-[#199A8E] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                اتصال
              </a>
            )}
            <button
              onClick={() => setShowMapModal(true)}
              className="bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 active:scale-95 transition shadow-md shadow-green-600/20"
            >
              <Navigation size={18} />
              الخريطة والمسار
            </button>
          </div>
        </div>

        {showMapModal && selectedFacility && (
          <FacilityInteractiveMap
            facility={{
              id: selectedFacility.id,
              name: selectedFacility.name,
              category: selectedFacility.type,
              address: selectedFacility.address,
              phone: selectedFacility.phone,
              latitude: selectedFacility.latitude,
              longitude: selectedFacility.longitude,
              distance: selectedFacility.distance,
              workingHours: selectedFacility.working_hours,
            }}
            isOpen={showMapModal}
            onClose={() => setShowMapModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1565C0] to-[#0D47A1] pt-3 pb-24 px-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={22} className="text-white rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-white">المنشآت الطبية</h1>
          <button
            onClick={() => setShowOpen24Only(!showOpen24Only)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${showOpen24Only ? 'bg-white text-[#1565C0]' : 'bg-white/20 text-white'}`}
          >
            24 ساعة
          </button>
        </div>
        {/* Search */}
        <div className="bg-white/95 rounded-2xl shadow-lg flex items-center px-4 py-3.5 gap-3">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن منشأة أو خدمة..."
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            dir="rtl"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={15} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Type Filter */}
      <div className="px-4 -mt-14 relative z-30 mb-4">
        <div className="bg-white rounded-2xl shadow-lg p-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {facilityTypes.map(({ id, label, icon: Icon, color, bg }) => (
              <button
                key={id}
                onClick={() => setSelectedType(id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all min-w-[64px] ${selectedType === id ? 'bg-[#1565C0] text-white' : 'bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedType === id ? 'bg-white/20' : bg}`}>
                  <Icon size={16} className={selectedType === id ? 'text-white' : color} />
                </div>
                <span className={`text-[10px] font-medium text-center leading-tight ${selectedType === id ? 'text-white' : 'text-gray-600'}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">{filtered.length} منشأة</span>
        {showOpen24Only && (
          <button onClick={() => setShowOpen24Only(false)} className="text-[#199A8E] text-sm font-medium">إزالة الفلتر</button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1565C0]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 px-4">
          <Building2 size={56} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">لا توجد نتائج</p>
        </div>
      ) : (
        <div className="px-4 space-y-3 pb-6">
          {filtered.map((facility) => {
            const tc = getTypeConfig(facility.type);
            const TypeIcon = tc.icon;
            return (
              <button
                key={facility.id}
                onClick={() => setSelectedFacility(facility)}
                className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-right"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-13 h-13 w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
                    <TypeIcon size={22} className={tc.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {facility.is_open_24h && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">24H</span>
                        )}
                        <ArrowUpRight size={16} className="text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{facility.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{facility.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 flex-wrap justify-end">
                      {facility.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-gray-700">{facility.rating}</span>
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        </div>
                      )}
                      {facility.distance !== undefined && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setMapFacility(facility);
                          }}
                          className="flex items-center gap-1 bg-sky-50 hover:bg-sky-100 rounded-lg px-2 py-1 text-sky-700 cursor-pointer transition border border-sky-100"
                          title="عرض على الخريطة التفاعلية"
                        >
                          <Navigation size={11} className="text-sky-600" />
                          <span className="text-xs font-semibold">{facility.distance} كم (الخريطة)</span>
                        </div>
                      )}
                      {facility.working_hours && (
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
                          <Clock size={11} className="text-gray-500" />
                          <span className="text-xs text-gray-500">{facility.working_hours}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 mt-2 flex-wrap justify-end">
                      {facility.services.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[10px] bg-gray-100 text-gray-600 rounded-lg px-2 py-0.5">{s}</span>
                      ))}
                      {facility.services.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{facility.services.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {/* Interactive Map Modal for List View */}
      {mapFacility && (
        <FacilityInteractiveMap
          facility={{
            id: mapFacility.id,
            name: mapFacility.name,
            category: mapFacility.type,
            address: mapFacility.address,
            phone: mapFacility.phone,
            latitude: mapFacility.latitude,
            longitude: mapFacility.longitude,
            distance: mapFacility.distance,
            workingHours: mapFacility.working_hours,
          }}
          isOpen={!!mapFacility}
          onClose={() => setMapFacility(null)}
        />
      )}
    </div>
  );
}
