import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Search,
  MapPin,
  Star,
  Clock,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Activity,
  Sparkles,
  Stethoscope,
  Filter,
  X,
  ShieldCheck,
  Building2,
  Video,
  Droplets,
  Smile,
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

export function ClinicsPage({ onBack, onSelectDoctor, preselectedSpecialization }: ClinicsPageProps) {
  const { currentLocation } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(preselectedSpecialization || null);
  const [feeFilter, setFeeFilter] = useState<'all' | 'under3000' | 'mid'>('all');
  const [todayOnly, setTodayOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedQueueInfo, setSelectedQueueInfo] = useState<{ queueNumber: number; estimatedWaitMinutes: number; estimatedArrivalTime: string } | null>(null);
  const [selectedDistance, setSelectedDistance] = useState(0);
  const [mapFacility, setMapFacility] = useState<FacilityLocation | null>(null);

  const anatomicalSpecialties = [
    { id: 'Cardiology', name: 'القلب', fullName: 'القلب والأوعية', icon: Heart, count: '48 طبيب' },
    { id: 'General Medicine', name: 'الباطنية', fullName: 'الباطنية والجهاز الهضمي', icon: Activity, count: '62 طبيب' },
    { id: 'hematology', name: 'أمراض الدم', fullName: 'أمراض الدم والأورام', icon: Droplets, count: '24 طبيب' },
    { id: 'Orthopedics', name: 'العظام', fullName: 'جراحة العظام والمفاصل', icon: Bone, count: '55 طبيب' },
    { id: 'Pediatrics', name: 'الأطفال', fullName: 'طب الأطفال وحديثي الولادة', icon: Baby, count: '71 طبيب' },
    { id: 'dentistry', name: 'الأسنان', fullName: 'طب وجراحة الأسنان', icon: Smile, count: '83 طبيب' },
    { id: 'Ophthalmology', name: 'العيون', fullName: 'طب وجراحة العيون', icon: Eye, count: '39 طبيب' },
    { id: 'Dermatology', name: 'الجلدية', fullName: 'الجلدية والتناسلية', icon: Sparkles, count: '44 طبيب' },
  ];

  const demoSpecializations: Specialization[] = [
    { id: '1', name_ar: 'القلب والأوعية', name_en: 'Cardiology' },
    { id: '2', name_ar: 'باطنية عامة', name_en: 'General Medicine' },
    { id: '3', name_ar: 'أطفال وحديثي الولادة', name_en: 'Pediatrics' },
    { id: '4', name_ar: 'عظام ومفاصل', name_en: 'Orthopedics' },
    { id: '5', name_ar: 'عيون وجراحة', name_en: 'Ophthalmology' },
    { id: '6', name_ar: 'مخ وأعصاب', name_en: 'Neurology' },
    { id: '7', name_ar: 'جلدية وتجميل', name_en: 'Dermatology' },
  ];

  const demoDoctors: Doctor[] = [
    {
      id: '1',
      full_name: 'د. سامي المقطري',
      specialization_id: '1',
      specialization: { id: '1', name_ar: 'القلب والأوعية', name_en: 'Cardiology' },
      clinic_id: '1',
      clinic: { id: '1', name: 'مستشفى الثورة التعليمي', address: 'صنعاء — شارع الخمسين', latitude: 15.3694, longitude: 44.1910, working_hours: {}, is_active: true },
      consultation_fee: 3500,
      average_consultation_time: 20,
      rating: 4.9,
      total_reviews: 320,
      bio: 'استشاري باطنية وقسطرة قلبية مع خبرة تفوق 16 عاماً في أكبر مستشفيات اليمن.',
      working_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
      working_hours: { morning: { start: '08:30', end: '12:30' }, evening: { start: '16:00', end: '20:30' } },
      is_active: true,
      is_available: true,
    },
    {
      id: '2',
      full_name: 'د. فاطمة الشامي',
      specialization_id: '3',
      specialization: { id: '3', name_ar: 'أطفال وحديثي الولادة', name_en: 'Pediatrics' },
      clinic_id: '2',
      clinic: { id: '2', name: 'المستشفى الكويتي التخصصي', address: 'صنعاء — شارع الستين', latitude: 15.3570, longitude: 44.1860, working_hours: {}, is_active: true },
      consultation_fee: 3000,
      average_consultation_time: 15,
      rating: 4.8,
      total_reviews: 284,
      bio: 'أخصائية طب الأطفال وحديثي الولادة، متابعة النمو واللقاحات وأمراض الصدرية.',
      working_days: ['sunday', 'monday', 'wednesday', 'thursday'],
      working_hours: { evening: { start: '16:30', end: '21:00' } },
      is_active: true,
      is_available: true,
    },
    {
      id: '3',
      full_name: 'د. محمد العولقي',
      specialization_id: '4',
      specialization: { id: '4', name_ar: 'عظام ومفاصل', name_en: 'Orthopedics' },
      clinic_id: '3',
      clinic: { id: '3', name: 'المركز الاستشاري اليمني', address: 'صنعاء — حي حدة', latitude: 15.3740, longitude: 44.1950, working_hours: {}, is_active: true },
      consultation_fee: 4000,
      average_consultation_time: 25,
      rating: 4.9,
      total_reviews: 410,
      bio: 'استشاري جراحة العظام والمفاصل والعمود الفقري ومعالجة الإصابات الرياضية.',
      working_days: ['sunday', 'tuesday', 'thursday'],
      working_hours: { morning: { start: '09:00', end: '13:00' } },
      is_active: true,
      is_available: true,
    },
    {
      id: '4',
      full_name: 'د. أحمد الصبري',
      specialization_id: '5',
      specialization: { id: '5', name_ar: 'عيون وجراحة', name_en: 'Ophthalmology' },
      clinic_id: '4',
      clinic: { id: '4', name: 'مستشفى مغربي التخصصي', address: 'صنعاء — شارع حدة', latitude: 15.3665, longitude: 44.1885, working_hours: {}, is_active: true },
      consultation_fee: 3000,
      average_consultation_time: 20,
      rating: 4.7,
      total_reviews: 195,
      bio: 'استشاري طب وجراحة العيون والليزك وعلاج اعتلال الشبكية السكري.',
      working_days: ['monday', 'tuesday', 'wednesday', 'thursday'],
      working_hours: { morning: { start: '08:30', end: '13:00' } },
      is_active: true,
      is_available: true,
    },
  ];

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, selectedCategory, feeFilter, todayOnly, locationFilter, doctors]);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('doctors')
        .select('*, specialization:specializations(*), clinic:clinics(*)')
        .eq('is_active', true);
      setDoctors(data && data.length > 0 ? (data as Doctor[]) : demoDoctors);
    } catch {
      setDoctors(demoDoctors);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDoctors = () => {
    let list = [...doctors];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.full_name.toLowerCase().includes(q) ||
          d.specialization?.name_ar.toLowerCase().includes(q) ||
          d.clinic?.name.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      list = list.filter((d) => d.specialization?.name_en === selectedCategory);
    }

    if (feeFilter === 'under3000') {
      list = list.filter((d) => (d.consultation_fee || 0) <= 3000);
    } else if (feeFilter === 'mid') {
      list = list.filter((d) => (d.consultation_fee || 0) > 3000 && (d.consultation_fee || 0) <= 4500);
    }

    if (todayOnly) {
      list = list.filter((d) => d.is_available);
    }

    if (locationFilter !== 'all') {
      list = list.filter((d) => d.clinic?.address.includes(locationFilter));
    }

    setFilteredDoctors(list);
  };

  const getQueueInfo = (doctor: Doctor, index: number) => {
    const queueNumber = index + 3;
    const waitMinutes = (doctor.average_consultation_time ?? 15) * (queueNumber - 1);
    const arrivalTime = new Date(Date.now() + waitMinutes * 60 * 1000);
    return {
      queueNumber,
      estimatedWaitMinutes: waitMinutes,
      estimatedArrivalTime: arrivalTime.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleDoctorClick = (doctor: Doctor, index: number) => {
    const queueInfo = getQueueInfo(doctor, index);
    setSelectedDoctor(doctor);
    setSelectedQueueInfo(queueInfo);
    setSelectedDistance(1.2 + index * 0.4);
  };

  const handleBook = (consultationType: ConsultationType) => {
    if (selectedDoctor && selectedQueueInfo) {
      onSelectDoctor?.(selectedDoctor, selectedQueueInfo, consultationType);
      setSelectedDoctor(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-[#E8F5F4] text-[#199A8E] flex items-center justify-center transition active:scale-95"
            >
              <ChevronRight size={22} />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <h1 className="text-base font-bold text-[#104C48]">دليل الأطباء والعيادات</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الطبيب، المستشفى أو التخصص..."
            className="w-full bg-white border border-[#E2E8F0] rounded-2xl py-3.5 pr-11 pl-4 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#199A8E] shadow-sm"
          />
          <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* ── التخصصات الطبية الاستشارية والتشخيصية (بنفس التنسيق المعتمد) ── */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#104C48]">التخصصات الاستشارية والتشخيصية</h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-[11px] font-bold text-[#199A8E] hover:underline"
              >
                إلغاء التحديد (عرض الكل)
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
            {anatomicalSpecialties.map((spec) => {
              const Icon = spec.icon;
              const isSelected = selectedCategory === spec.id;
              return (
                <button
                  key={spec.id}
                  onClick={() => setSelectedCategory(isSelected ? null : spec.id)}
                  className={`group rounded-[18px] p-2.5 sm:p-3 border flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 ${
                    isSelected
                      ? 'bg-[#E8F5F4] border-[#199A8E] shadow-sm ring-2 ring-[#199A8E]/20'
                      : 'bg-white border-[#E2E8F0] shadow-[0_2px_10px_-2px_rgba(25,154,142,0.06)] hover:border-[#199A8E]/40'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors mb-1.5 border ${
                      isSelected
                        ? 'bg-[#199A8E] text-white border-[#199A8E]'
                        : 'bg-[#E8F5F4] text-[#199A8E] border-[#199A8E]/20 group-hover:bg-[#199A8E] group-hover:text-white'
                    }`}
                  >
                    <Icon size={20} strokeWidth={2.2} />
                  </div>
                  <span
                    className={`text-xs font-bold whitespace-nowrap transition-colors ${
                      isSelected ? 'text-[#199A8E]' : 'text-[#104C48] group-hover:text-[#199A8E]'
                    }`}
                  >
                    {spec.name}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {spec.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Filter Chips Bar (By Specialty, Fee, Availability, Location) ── */}
        <div className="space-y-2">
          {/* Specialty Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition active:scale-95 border ${
                selectedCategory === null
                  ? 'bg-[#199A8E] text-white border-[#199A8E] shadow-sm'
                  : 'bg-white text-slate-600 border-[#E2E8F0] hover:bg-slate-50'
              }`}
            >
              جميع التخصصات
            </button>
            {demoSpecializations.map((spec) => (
              <button
                key={spec.id}
                onClick={() => setSelectedCategory(spec.name_en || null)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 border ${
                  selectedCategory === spec.name_en
                    ? 'bg-[#199A8E] text-white border-[#199A8E] shadow-sm'
                    : 'bg-white text-slate-600 border-[#E2E8F0] hover:bg-slate-50'
                }`}
              >
                {spec.name_ar}
              </button>
            ))}
          </div>

          {/* Secondary Quick Filters: Availability Today, Fee range, Location */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide text-[11px]">
            {/* Availability Today */}
            <button
              onClick={() => setTodayOnly(!todayOnly)}
              className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition border ${
                todayOnly
                  ? 'bg-[#2E7D32] text-white border-[#2E7D32]'
                  : 'bg-[#E8F5F4] text-[#104C48] border-[#199A8E]/30'
              }`}
            >
              ✓ متاح اليوم
            </button>

            {/* Fee Chips */}
            <button
              onClick={() => setFeeFilter(feeFilter === 'under3000' ? 'all' : 'under3000')}
              className={`px-2.5 py-1 rounded-xl font-medium whitespace-nowrap transition border ${
                feeFilter === 'under3000'
                  ? 'bg-[#104C48] text-white border-[#104C48]'
                  : 'bg-white text-slate-600 border-[#E2E8F0]'
              }`}
            >
              كشف ≤ 3,000 ر.ي
            </button>

            <button
              onClick={() => setFeeFilter(feeFilter === 'mid' ? 'all' : 'mid')}
              className={`px-2.5 py-1 rounded-xl font-medium whitespace-nowrap transition border ${
                feeFilter === 'mid'
                  ? 'bg-[#104C48] text-white border-[#104C48]'
                  : 'bg-white text-slate-600 border-[#E2E8F0]'
              }`}
            >
              كشف 3,500 - 4,500 ر.ي
            </button>

            {/* Location Chips */}
            {['حدة', 'الستين', 'الخمسين'].map((loc) => (
              <button
                key={loc}
                onClick={() => setLocationFilter(locationFilter === loc ? 'all' : loc)}
                className={`px-2.5 py-1 rounded-xl font-medium whitespace-nowrap transition border ${
                  locationFilter === loc
                    ? 'bg-[#104C48] text-white border-[#104C48]'
                    : 'bg-white text-slate-600 border-[#E2E8F0]'
                }`}
              >
                حي {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>يتم عرض الأطباء المعتمدين والمتاحين</span>
          <span className="font-bold text-[#104C48]">{filteredDoctors.length} طبيب متاح</span>
        </div>

        {/* Doctors Directory List */}
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="w-10 h-10 border-3 border-[#199A8E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-3">جاري تحميل دليل الأطباء...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-[24px] p-8 text-center border border-[#E2E8F0] shadow-sm my-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#E8F5F4] text-[#199A8E] flex items-center justify-center mx-auto">
              <Stethoscope size={24} />
            </div>
            <h4 className="text-sm font-bold text-[#104C48]">لا يوجد أطباء مطابقين لهذا الفلتر</h4>
            <p className="text-xs text-slate-400">جرب تغيير شروط البحث أو إزالة بعض الفلاتر.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setFeeFilter('all');
                setTodayOnly(false);
                setLocationFilter('all');
              }}
              className="py-2 px-4 rounded-xl bg-[#199A8E] text-white font-bold text-xs"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredDoctors.map((doc, idx) => (
              <div
                key={doc.id}
                className="bg-white rounded-[22px] p-4 border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(25,154,142,0.06)] hover:shadow-[0_8px_25px_-4px_rgba(25,154,142,0.12)] transition-all space-y-3"
              >
                {/* Doctor Header */}
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-[#E8F5F4] text-[#104C48] flex items-center justify-center font-bold text-xl border border-[#199A8E]/30 shrink-0">
                      {doc.full_name?.split(' ')?.[1]?.[0] || 'ط'}
                    </div>
                    <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-[#199A8E] text-white flex items-center justify-center text-[10px] ring-2 ring-white font-bold">
                      ✓
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <h3 className="font-bold text-sm text-[#104C48] truncate">{doc.full_name}</h3>
                        <ShieldCheck size={15} className="text-[#38B2AC] shrink-0" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#FFB800] font-bold shrink-0">
                        <Star size={13} fill="#FFB800" strokeWidth={0} />
                        <span>{doc.rating}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({doc.total_reviews})</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#199A8E] font-medium mt-0.5 truncate">
                      {doc.specialization?.name_ar}
                    </p>

                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                      <Building2 size={12} className="text-slate-400 shrink-0" />
                      <span>{doc.clinic?.name} — {doc.clinic?.address}</span>
                    </p>
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-xs">
                  <div>
                    <span className="text-[11px] text-[#2E7D32] font-semibold block">
                      ● متاح اليوم للحجز
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                      رسوم الكشف: <b className="text-slate-800">{doc.consultation_fee?.toLocaleString()} ر.ي</b>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDoctorClick(doc, idx)}
                      className="py-2.5 px-5 rounded-xl bg-[#199A8E] hover:bg-[#104C48] text-white font-bold text-xs transition shadow-sm active:scale-95"
                    >
                      احجز الآن
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
    </div>
  );
}
