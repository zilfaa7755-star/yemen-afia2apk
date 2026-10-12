import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Search,
  MapPin,
  Star,
  Clock,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Ear,
  Activity,
  Sparkles,
  Stethoscope,
  Filter,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Doctor, Specialization } from '../types';
import { DoctorDetailSheet, type ConsultationType } from '../components/common/DoctorDetailSheet';
import { FacilityInteractiveMap, type FacilityLocation } from '../components/common/FacilityInteractiveMap';

interface ClinicsPageProps {
  onBack?: () => void;
  onSelectDoctor?: (doctor: Doctor, queueInfo?: { queueNumber: number; estimatedWaitMinutes: number; estimatedArrivalTime: string }, consultationType?: ConsultationType) => void;
  preselectedSpecialization?: string;
}

const specializationIcons: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  'Cardiology': { icon: Heart, bg: 'bg-red-100', color: 'text-red-500' },
  'Neurology': { icon: Brain, bg: 'bg-purple-100', color: 'text-purple-500' },
  'Ophthalmology': { icon: Eye, bg: 'bg-teal-100', color: 'text-teal-500' },
  'Orthopedics': { icon: Bone, bg: 'bg-amber-100', color: 'text-amber-600' },
  'Pediatrics': { icon: Baby, bg: 'bg-orange-100', color: 'text-orange-500' },
  'ENT': { icon: Ear, bg: 'bg-pink-100', color: 'text-pink-500' },
  'Dermatology': { icon: Sparkles, bg: 'bg-pink-100', color: 'text-pink-500' },
  'Gastroenterology': { icon: Activity, bg: 'bg-blue-100', color: 'text-blue-500' },
  'General Medicine': { icon: Stethoscope, bg: 'bg-cyan-100', color: 'text-cyan-600' },
  'Psychiatry': { icon: Brain, bg: 'bg-violet-100', color: 'text-violet-500' },
  'Urology': { icon: Activity, bg: 'bg-blue-100', color: 'text-blue-500' },
  'Obstetrics and Gynecology': { icon: Heart, bg: 'bg-rose-100', color: 'text-rose-500' },
};

export function ClinicsPage({ onBack, onSelectDoctor, preselectedSpecialization }: ClinicsPageProps) {
  const { currentLocation } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(preselectedSpecialization || null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedQueueInfo, setSelectedQueueInfo] = useState<{ queueNumber: number; estimatedWaitMinutes: number; estimatedArrivalTime: string } | null>(null);
  const [selectedDistance, setSelectedDistance] = useState(0);
  const [mapFacility, setMapFacility] = useState<FacilityLocation | null>(null);

  const demoSpecializations: Specialization[] = [
    { id: '1', name_ar: 'باطنية عامة', name_en: 'General Medicine', icon: 'stethoscope' },
    { id: '2', name_ar: 'قلب وأوعية دموية', name_en: 'Cardiology', icon: 'heart' },
    { id: '3', name_ar: 'مخ وأعصاب', name_en: 'Neurology', icon: 'brain' },
    { id: '4', name_ar: 'أطفال', name_en: 'Pediatrics', icon: 'baby' },
    { id: '5', name_ar: 'عيون', name_en: 'Ophthalmology', icon: 'eye' },
    { id: '6', name_ar: 'عظام', name_en: 'Orthopedics', icon: 'bone' },
    { id: '7', name_ar: 'أنف وأذن حنجرة', name_en: 'ENT', icon: 'ear' },
    { id: '8', name_ar: 'جلدية', name_en: 'Dermatology', icon: 'sparkles' },
    { id: '9', name_ar: 'نساء وولادة', name_en: 'Obstetrics and Gynecology', icon: 'heart' },
    { id: '10', name_ar: 'نفسية وعصبية', name_en: 'Psychiatry', icon: 'brain' },
  ];

  const demoDoctors: Doctor[] = [
    { id: '1', full_name: 'د. أحمد المقطري', specialization_id: '1', specialization: { id: '1', name_ar: 'باطنية عامة', name_en: 'General Medicine' }, clinic_id: '1', clinic: { id: '1', name: 'مركز اليمن الطبي', address: 'صنعاء - حدة', latitude: 15.3694, longitude: 44.1910, working_hours: {}, is_active: true }, consultation_fee: 3000, average_consultation_time: 25, rating: 4.2, total_reviews: 148, bio: 'طبيب استشاري بخبرة 10 سنوات في تشخيص وعلاج الأمراض الباطنة المزمنة.', working_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'], working_hours: { morning: { start: '08:00', end: '12:00' }, evening: { start: '16:00', end: '20:00' } }, is_active: true, is_available: true },
    { id: '2', full_name: 'د. فاطمة الشامي', specialization_id: '2', specialization: { id: '2', name_ar: 'قلب وأوعية دموية', name_en: 'Cardiology' }, clinic_id: '2', clinic: { id: '2', name: 'عيادات الشفاء', address: 'صنعاء - الستين', latitude: 15.3570, longitude: 44.1860, working_hours: {}, is_active: true }, consultation_fee: 4200, average_consultation_time: 25, rating: 4.2, total_reviews: 95, bio: 'أخصائية قسطرة قلبية وعلاج أمراض الشرايين التاجية.', working_days: ['sunday', 'monday', 'wednesday', 'thursday'], working_hours: { evening: { start: '17:00', end: '21:00' } }, is_active: true, is_available: true },
    { id: '3', full_name: 'د. خالد الإرياني', specialization_id: '3', specialization: { id: '3', name_ar: 'مخ وأعصاب', name_en: 'Neurology' }, clinic_id: '3', clinic: { id: '3', name: 'مجمع الحياة التخصصي', address: 'صنعاء - تونس', latitude: 15.3740, longitude: 44.1950, working_hours: {}, is_active: true }, consultation_fee: 4500, average_consultation_time: 20, rating: 4.3, total_reviews: 112, bio: 'أخصائي أعصاب طرفية وعلاج الشلل واعتلال الأعصاب.', working_days: ['sunday', 'tuesday', 'thursday'], working_hours: { morning: { start: '09:00', end: '13:00' } }, is_active: true, is_available: true },
    { id: '4', full_name: 'د. سمية الحوثي', specialization_id: '4', specialization: { id: '4', name_ar: 'أطفال', name_en: 'Pediatrics' }, clinic_id: '4', clinic: { id: '4', name: 'مستوصف النور', address: 'صنعاء - الخمسين', latitude: 15.3665, longitude: 44.1885, working_hours: {}, is_active: true }, consultation_fee: 2500, average_consultation_time: 20, rating: 4.3, total_reviews: 88, bio: 'طبيبة أطفال متخصصة في تشخيص وعلاج الأمراض الشائعة عند الأطفال.', working_days: ['monday', 'tuesday', 'wednesday', 'thursday'], working_hours: { morning: { start: '08:00', end: '12:00' } }, is_active: true, is_available: true },
    { id: '5', full_name: 'د. محمد العمري', specialization_id: '5', specialization: { id: '5', name_ar: 'عيون', name_en: 'Ophthalmology' }, clinic_id: '1', clinic: { id: '1', name: 'مركز اليمن الطبي', address: 'صنعاء - حدة', latitude: 15.3694, longitude: 44.1910, working_hours: {}, is_active: true }, consultation_fee: 3500, average_consultation_time: 22, rating: 4.1, total_reviews: 76, bio: 'استشاري العيون متخصص في علاج أمراض العيون والنظر.', working_days: ['sunday', 'monday', 'tuesday'], working_hours: { morning: { start: '09:00', end: '13:00' } }, is_active: true, is_available: true },
    { id: '6', full_name: 'د. عبدالله السامي', specialization_id: '6', specialization: { id: '6', name_ar: 'عظام', name_en: 'Orthopedics' }, clinic_id: '5', clinic: { id: '5', name: 'عيادة العظام المتخصصة', address: 'صنعاء - السبعين', latitude: 15.3620, longitude: 44.1800, working_hours: {}, is_active: true }, consultation_fee: 4000, average_consultation_time: 30, rating: 4.4, total_reviews: 134, bio: 'استشاري عظام ومفاصل متخصص في علاج الكسور والإصابات.', working_days: ['sunday', 'monday', 'wednesday'], working_hours: { evening: { start: '16:00', end: '20:00' } }, is_active: true, is_available: true },
  ];

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, selectedCategory, doctors]);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('doctors')
        .select('*, specialization:specializations(*), clinic:clinics(*)')
        .eq('is_active', true);
      setDoctors(data && data.length > 0 ? (data as Doctor[]) : demoDoctors);
      setFilteredDoctors(data && data.length > 0 ? (data as Doctor[]) : demoDoctors);
    } catch {
      setDoctors(demoDoctors);
      setFilteredDoctors(demoDoctors);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDoctors = () => {
    let results = doctors;
    if (selectedCategory) {
      results = results.filter((d) => d.specialization?.name_en === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (d) =>
          d.full_name.toLowerCase().includes(q) ||
          d.specialization?.name_ar?.includes(q) ||
          d.specialization?.name_en?.toLowerCase().includes(q) ||
          d.clinic?.name?.toLowerCase().includes(q)
      );
    }
    setFilteredDoctors(results);
  };

  const getQueueInfo = (doctor: Doctor, index: number) => {
    const queueNumber = index + 5;
    const waitMinutes = (doctor.average_consultation_time ?? 15) * (queueNumber - 1);
    const arrivalTime = new Date(Date.now() + waitMinutes * 60 * 1000);
    return {
      queueNumber,
      estimatedWaitMinutes: waitMinutes,
      estimatedArrivalTime: arrivalTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getDistanceKm = (_doctor: Doctor, index: number) => {
    return [1.0, 1.3, 1.6, 2.1, 1.0, 2.5][index] || 1.5;
  };

  const getSpecIcon = (spec: Specialization) =>
    (spec.name_en && specializationIcons[spec.name_en]) || { icon: Stethoscope, bg: 'bg-gray-100', color: 'text-gray-600' };

  const handleDoctorClick = (doctor: Doctor, index: number) => {
    const queueInfo = getQueueInfo(doctor, index);
    const distance = getDistanceKm(doctor, index);
    setSelectedDoctor(doctor);
    setSelectedQueueInfo(queueInfo);
    setSelectedDistance(distance);
  };

  const handleShowClinicMap = (doctor: Doctor, index: number) => {
    const lat = doctor.clinic?.latitude ?? (15.3694 + (index * 0.005));
    const lng = doctor.clinic?.longitude ?? (44.1910 + (index * 0.004));
    setMapFacility({
      id: doctor.clinic?.id || doctor.id,
      name: `${doctor.clinic?.name || 'عيادة'} (${doctor.full_name})`,
      category: 'clinic',
      address: doctor.clinic?.address || 'صنعاء، اليمن',
      latitude: lat,
      longitude: lng,
      distance: getDistanceKm(doctor, index),
      phone: doctor.phone || '777000000',
    });
  };

  const handleBook = (consultationType: ConsultationType) => {
    if (selectedDoctor && selectedQueueInfo) {
      onSelectDoctor?.(selectedDoctor, selectedQueueInfo, consultationType);
      setSelectedDoctor(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] pt-3 pb-14 px-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={22} className="text-white rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-white">العيادات الاستشارية</h1>
          <div className="w-10" />
        </div>

        {/* Search */}
        <div className="bg-white/95 rounded-2xl shadow-lg flex items-center px-4 py-3.5 gap-3">
          <Search size={20} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن طبيب أو تخصص..."
            className="flex-1 text-gray-700 placeholder-gray-400 outline-none text-sm bg-transparent"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
              <X size={14} className="text-gray-400" />
            </button>
          )}
          <button onClick={() => setShowFilters(!showFilters)} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
            <Filter size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Specializations Grid */}
      <div className="px-4 -mt-6 relative z-30 mb-5">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <p className="text-sm font-bold text-gray-700 mb-3 text-right">اختر التخصص</p>
          <div className="grid grid-cols-4 gap-2">
            {demoSpecializations.map((spec) => {
              const { icon: Icon, bg, color } = getSpecIcon(spec);
              const isActive = selectedCategory === spec.name_en;
              return (
                <button
                  key={spec.id}
                  onClick={() => setSelectedCategory(isActive ? null : (spec.name_en || null))}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all ${
                    isActive ? 'bg-[#2196F3]/10 border-2 border-[#2196F3]' : 'bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 ${isActive ? 'bg-[#2196F3]' : bg} rounded-full flex items-center justify-center`}>
                    <Icon size={18} className={isActive ? 'text-white' : color} />
                  </div>
                  <span className={`text-[11px] font-medium text-center leading-tight ${
                    isActive ? 'text-[#2196F3]' : 'text-gray-600'
                  }`}>
                    {spec.name_ar}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {selectedCategory && (
            <button onClick={() => setSelectedCategory(null)} className="text-[#2196F3] font-medium">
              إزالة الفلتر
            </button>
          )}
        </span>
        <span className="text-sm text-gray-600 font-medium">
          {filteredDoctors.length} طبيب متاح
        </span>
      </div>

      {/* Doctors List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2196F3]" />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-12 px-4">
          <Stethoscope size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-3">لا يوجد أطباء مطابقين للبحث</p>
          <button onClick={() => { setSearchQuery(''); setSelectedCategory(null); }} className="text-[#2196F3] font-medium text-sm">
            إعادة تعيين البحث
          </button>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {filteredDoctors.map((doctor, index) => {
            const queueInfo = getQueueInfo(doctor, index);
            const distance = getDistanceKm(doctor, index);
            return (
              <button
                key={doctor.id}
                onClick={() => handleDoctorClick(doctor, index)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-right"
              >
                <div className="flex items-start gap-3">
                  {/* Rating */}
                  <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                    <span className="font-bold text-gray-800 text-sm">{doctor.rating}</span>
                    <Star size={13} className="text-yellow-400 fill-yellow-400" />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base truncate text-right">{doctor.full_name}</h3>
                    <p className="text-gray-500 text-sm truncate text-right">
                      {doctor.specialization?.name_ar} • {doctor.clinic?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap justify-end">
                      <span className="text-xs text-gray-500">{queueInfo.queueNumber - 1} في الانتظار</span>
                      <div className="flex items-center gap-1 bg-teal-50 rounded-lg px-2 py-1">
                        <Clock size={12} className="text-teal-600" />
                        <span className="text-xs text-teal-600 font-medium">~{doctor.average_consultation_time}د</span>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowClinicMap(doctor, index);
                        }}
                        className="flex items-center gap-1 bg-sky-50 hover:bg-sky-100 rounded-lg px-2 py-1 text-sky-700 cursor-pointer transition border border-sky-100"
                        title="عرض العيادة على الخريطة التفاعلية"
                      >
                        <MapPin size={12} className="text-sky-600" />
                        <span className="text-xs font-semibold">{distance} كم (الخريطة)</span>
                      </div>
                    </div>
                  </div>
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2196F3] to-[#1565C0] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {doctor.full_name.charAt(2)}
                  </div>
                </div>
                {/* Price & Book */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Stethoscope size={12} /> اضغط للتفاصيل والحجز
                  </span>
                  <div className="text-left">
                    <span className="text-sm text-gray-500">سعر الكشف</span>
                    <p className="font-bold text-gray-800">{doctor.consultation_fee?.toLocaleString('ar-YE')} ر.ي</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Doctor Detail Bottom Sheet */}
      {selectedDoctor && selectedQueueInfo && (
        <DoctorDetailSheet
          doctor={selectedDoctor}
          queueInfo={selectedQueueInfo}
          distance={selectedDistance}
          onClose={() => setSelectedDoctor(null)}
          onBook={handleBook}
        />
      )}

      {/* Interactive Map Modal */}
      {mapFacility && (
        <FacilityInteractiveMap
          facility={mapFacility}
          isOpen={!!mapFacility}
          onClose={() => setMapFacility(null)}
        />
      )}
    </div>
  );
}
