import { useState } from 'react';
import {
  Building2, FlaskConical, Pill, Stethoscope, MapPin, Phone,
  Clock, Star, Navigation, Search, X, ChevronLeft, Heart,
  CheckCircle, Radiation, Sparkles, ArrowRight,
  Upload, FileText, Calendar, User, Send, Loader2,
  Video, Activity, Microscope, Syringe, Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FacilityInteractiveMap } from '../components/common/FacilityInteractiveMap';

// ─── Types ───────────────────────────────────────────────────────────────────
type FacilityCategory = 'hospital' | 'pharmacy' | 'lab' | 'imaging';
type Screen = 'categories' | 'list' | 'detail' | 'service';

interface Facility {
  id: string;
  category: FacilityCategory;
  name: string;
  address: string;
  phone: string;
  distance: number;
  latitude: number;
  longitude: number;
  rating: number;
  totalReviews: number;
  workingHours: string;
  isOpen24h: boolean;
  description: string;
  services: FacilityService[];
}

interface FacilityService {
  id: string;
  type: 'clinic' | 'lab' | 'imaging' | 'pharmacy';
  name: string;
  description?: string;
  price?: number;
  doctorName?: string;
  doctorSpecialty?: string;
  available: boolean;
}

// ─── Demo Data ───────────────────────────────────────────────────────────────
const categories: { id: FacilityCategory; label: string; icon: typeof Building2; color: string; bg: string; desc: string }[] = [
  { id: 'hospital', label: 'مستشفيات', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', desc: 'مستشفيات متكاملة' },
  { id: 'pharmacy', label: 'صيدليات', icon: Pill, color: 'text-green-600', bg: 'bg-green-50', desc: 'صيدليات وأدوية' },
  { id: 'lab', label: 'مختبرات', icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'مختبرات تشخيصية' },
  { id: 'imaging', label: 'مراكز الأشعة', icon: Radiation, color: 'text-teal-600', bg: 'bg-teal-50', desc: 'أشعة تشخيصية' },
];

const demoFacilities: Facility[] = [
  {
    id: 'h1', category: 'hospital', name: 'مستشفى الثورة التعليمي', address: 'صنعاء - شارع الخمسين',
    phone: '01-789012', distance: 1.2, latitude: 15.3665, longitude: 44.1885, rating: 4.1, totalReviews: 312, workingHours: '24 ساعة', isOpen24h: true,
    description: 'أكبر مستشفى حكومي في صنعاء، يوفر خدمات طبية شاملة على مدار الساعة.',
    services: [
      { id: 'h1-cl1', type: 'clinic', name: 'عيادة باطنية', doctorName: 'د. أحمد المقطري', doctorSpecialty: 'باطنية عامة', price: 3000, available: true },
      { id: 'h1-cl2', type: 'clinic', name: 'عيادة قلب', doctorName: 'د. فاطمة الشامي', doctorSpecialty: 'قسطرة قلبية', price: 4200, available: true },
      { id: 'h1-cl3', type: 'clinic', name: 'عيادة أطفال', doctorName: 'د. سمية الحوثي', doctorSpecialty: 'أطفال عام', price: 2500, available: true },
      { id: 'h1-lab1', type: 'lab', name: 'تحليل دم شامل CBC', price: 500, available: true },
      { id: 'h1-lab2', type: 'lab', name: 'وظائف الكلى والكبد', price: 800, available: true },
      { id: 'h1-lab3', type: 'lab', name: 'هرمونات', price: 1200, available: true },
      { id: 'h1-img1', type: 'imaging', name: 'أشعة عادية (X-Ray)', price: 1000, available: true },
      { id: 'h1-img2', type: 'imaging', name: 'أشعة مقطعية (CT)', price: 5000, available: true },
      { id: 'h1-img3', type: 'imaging', name: 'رنين مغناطيسي (MRI)', price: 7000, available: true },
      { id: 'h1-img4', type: 'imaging', name: 'سونار (Ultrasound)', price: 800, available: true },
      { id: 'h1-ph1', type: 'pharmacy', name: 'صيدلية المستشفى', description: 'رفع وصفة طبية', available: true },
    ],
  },
  {
    id: 'h2', category: 'hospital', name: 'مستشفى الكويتي التخصصي', address: 'صنعاء - شارع الستين',
    phone: '01-567890', distance: 1.8, latitude: 15.3570, longitude: 44.1860, rating: 4.3, totalReviews: 289, workingHours: '24 ساعة', isOpen24h: true,
    description: 'مستشفى متخصص يضم نخبة من الأطباء في مختلف التخصصات.',
    services: [
      { id: 'h2-cl1', type: 'clinic', name: 'عيادة قلب وأوعية', doctorName: 'د. فاطمة الشامي', doctorSpecialty: 'قسطرة قلبية', price: 4200, available: true },
      { id: 'h2-cl2', type: 'clinic', name: 'عيادة جراحة عظام', doctorName: 'د. محمد العولقي', doctorSpecialty: 'جراحة عظام', price: 5000, available: true },
      { id: 'h2-cl3', type: 'clinic', name: 'عيادة نساء وولادة', doctorName: 'د. هدى الأهدل', doctorSpecialty: 'نساء وولادة', price: 3500, available: true },
      { id: 'h2-lab1', type: 'lab', name: 'تحاليل روتينية', price: 400, available: true },
      { id: 'h2-lab2', type: 'lab', name: 'PCR', price: 3000, available: true },
      { id: 'h2-img1', type: 'imaging', name: 'أشعة عادية', price: 1000, available: true },
      { id: 'h2-img2', type: 'imaging', name: 'سونار 4D', price: 1500, available: true },
      { id: 'h2-ph1', type: 'pharmacy', name: 'صيدلية المستشفى', description: 'رفع وصفة طبية', available: true },
    ],
  },
  {
    id: 'h3', category: 'hospital', name: 'مستشفى الجمهورية العام', address: 'صنعاء - حدة',
    phone: '01-234567', distance: 2.5, latitude: 15.3750, longitude: 44.2000, rating: 3.9, totalReviews: 178, workingHours: '8ص - 10م', isOpen24h: false,
    description: 'مستشفى حكومي يخدم سكان منطقة حدة وما حولها.',
    services: [
      { id: 'h3-cl1', type: 'clinic', name: 'عيادة باطنية', doctorName: 'د. علي الحمادي', doctorSpecialty: 'باطنية', price: 2000, available: true },
      { id: 'h3-cl2', type: 'clinic', name: 'عيادة قلب', doctorName: 'د. سامي المخلافي', doctorSpecialty: 'أمراض القلب', price: 3500, available: true },
      { id: 'h3-lab1', type: 'lab', name: 'تحاليل شاملة', price: 600, available: true },
      { id: 'h3-img1', type: 'imaging', name: 'أشعة عادية', price: 800, available: true },
      { id: 'h3-ph1', type: 'pharmacy', name: 'صيدلية المستشفى', description: 'رفع وصفة طبية', available: true },
    ],
  },
  {
    id: 'p1', category: 'pharmacy', name: 'صيدلية السعيد', address: 'صنعاء - شارع الزبيري',
    phone: '01-111111', distance: 0.8, latitude: 15.3695, longitude: 44.1915, rating: 4.3, totalReviews: 88, workingHours: '8ص - 11م', isOpen24h: false,
    description: 'صيدلية متكاملة مع خدمة التوصيل وتوافر معظم الأدوية.',
    services: [
      { id: 'p1-ph1', type: 'pharmacy', name: 'رفع وصفة طبية', description: 'ارفع وصفة طبية للصرف', available: true },
      { id: 'p1-ph2', type: 'pharmacy', name: 'طلب دواء', description: 'اطلب دواء غير متوفر', available: true },
      { id: 'p1-ph3', type: 'pharmacy', name: 'توصيل أدوية', description: 'خدمة توصيل للمنزل', available: true },
    ],
  },
  {
    id: 'p2', category: 'pharmacy', name: 'صيدلية النور (24 ساعة)', address: 'صنعاء - شارع الخمسين',
    phone: '01-222222', distance: 1.5, latitude: 15.3660, longitude: 44.1880, rating: 4.1, totalReviews: 55, workingHours: '24 ساعة', isOpen24h: true,
    description: 'الصيدلية الوحيدة في المنطقة التي تعمل على مدار الساعة.',
    services: [
      { id: 'p2-ph1', type: 'pharmacy', name: 'رفع وصفة طبية', description: 'ارفع وصفة طبية للصرف', available: true },
      { id: 'p2-ph2', type: 'pharmacy', name: 'طلب دواء', description: 'اطلب دواء غير متوفر', available: true },
      { id: 'p2-ph3', type: 'pharmacy', name: 'توصيل ليلي', description: 'توصيل على مدار الساعة', available: true },
    ],
  },
  {
    id: 'l1', category: 'lab', name: 'مختبرات الدقة الطبية', address: 'صنعاء - شارع الزبيري',
    phone: '01-778899', distance: 1.0, latitude: 15.3710, longitude: 44.1930, rating: 4.6, totalReviews: 421, workingHours: '7ص - 10م', isOpen24h: false,
    description: 'مختبر معتمد بأحدث أجهزة التحليل الطبي وكوادر مؤهلة.',
    services: [
      { id: 'l1-s1', type: 'lab', name: 'تحليل دم شامل CBC', price: 500, available: true },
      { id: 'l1-s2', type: 'lab', name: 'هرمونات', price: 1200, available: true },
      { id: 'l1-s3', type: 'lab', name: 'بكتيريولوجيا', price: 800, available: true },
      { id: 'l1-s4', type: 'lab', name: 'فحص فيروسات', price: 2000, available: true },
      { id: 'l1-s5', type: 'lab', name: 'تحليل جينات', price: 5000, available: true },
      { id: 'l1-s6', type: 'lab', name: 'رفع طلب طبيب', description: 'ارفع طلب فحص من طبيبك', available: true },
    ],
  },
  {
    id: 'l2', category: 'lab', name: 'مختبر الأمل التشخيصي', address: 'صنعاء - حي السبعين',
    phone: '01-334455', distance: 2.2, latitude: 15.3630, longitude: 44.1870, rating: 4.2, totalReviews: 187, workingHours: '8ص - 8م', isOpen24h: false,
    description: 'مختبر يقدم خدمات التحليل الطبي بدقة عالية وتقارير فورية.',
    services: [
      { id: 'l2-s1', type: 'lab', name: 'تحاليل روتينية', price: 400, available: true },
      { id: 'l2-s2', type: 'lab', name: 'فحص البول', price: 200, available: true },
      { id: 'l2-s3', type: 'lab', name: 'تحليل البراز', price: 250, available: true },
      { id: 'l2-s4', type: 'lab', name: 'PCR', price: 3000, available: true },
      { id: 'l2-s5', type: 'lab', name: 'رفع طلب طبيب', description: 'ارفع طلب فحص من طبيبك', available: true },
    ],
  },
  {
    id: 'i1', category: 'imaging', name: 'مركز الأشعة التشخيصية', address: 'صنعاء - شارع تونس',
    phone: '01-556677', distance: 1.6, latitude: 15.3745, longitude: 44.1955, rating: 4.7, totalReviews: 234, workingHours: '8ص - 9م', isOpen24h: false,
    description: 'أحدث مركز للتصوير الطبي يضم CT 128 شريحة و MRI 3 تيسلا.',
    services: [
      { id: 'i1-s1', type: 'imaging', name: 'أشعة عادية (X-Ray)', price: 1000, available: true },
      { id: 'i1-s2', type: 'imaging', name: 'أشعة مقطعية (CT)', price: 5000, available: true },
      { id: 'i1-s3', type: 'imaging', name: 'رنين مغناطيسي (MRI)', price: 7000, available: true },
      { id: 'i1-s4', type: 'imaging', name: 'سونار (Ultrasound)', price: 800, available: true },
      { id: 'i1-s5', type: 'imaging', name: 'بنورامبك (Panoramic)', price: 1500, available: true },
      { id: 'i1-s6', type: 'imaging', name: 'رفع طلب طبيب', description: 'ارفع طلب أشعة من طبيبك', available: true },
    ],
  },
  {
    id: 'i2', category: 'imaging', name: 'مركز الحياة للأشعة', address: 'صنعاء - شارع تونس',
    phone: '01-667788', distance: 2.0, latitude: 15.3760, longitude: 44.1970, rating: 4.5, totalReviews: 167, workingHours: '8ص - 8م', isOpen24h: false,
    description: 'مركز متخصص في التصوير الطبي بتقنيات حديثة.',
    services: [
      { id: 'i2-s1', type: 'imaging', name: 'أشعة عادية', price: 900, available: true },
      { id: 'i2-s2', type: 'imaging', name: 'أشعة مقطعية (CT)', price: 4500, available: true },
      { id: 'i2-s3', type: 'imaging', name: 'رنين مغناطيسي (MRI)', price: 6500, available: true },
      { id: 'i2-s4', type: 'imaging', name: 'سونار 4D', price: 1500, available: true },
      { id: 'i2-s5', type: 'imaging', name: 'رفع طلب طبيب', description: 'ارفع طلب أشعة من طبيبك', available: true },
    ],
  },
];

const serviceTypeConfig: Record<string, { label: string; icon: typeof Stethoscope; color: string; bg: string }> = {
  clinic: { label: 'عيادات', icon: Stethoscope, color: 'text-[#199A8E]', bg: 'bg-[#E8F5F4]' },
  lab: { label: 'مختبر', icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50' },
  imaging: { label: 'أشعة', icon: Radiation, color: 'text-teal-600', bg: 'bg-teal-50' },
  pharmacy: { label: 'صيدلية', icon: Pill, color: 'text-green-600', bg: 'bg-green-50' },
};

// ─── Component ───────────────────────────────────────────────────────────────
interface MedicalFacilitiesAppProps {
  onExit?: () => void;
}

export function MedicalFacilitiesApp({ onExit }: MedicalFacilitiesAppProps) {
  const [screen, setScreen] = useState<Screen>('categories');
  const [selectedCategory, setSelectedCategory] = useState<FacilityCategory | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedService, setSelectedService] = useState<FacilityService | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadSent, setUploadSent] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapFacility, setMapFacility] = useState<Facility | null>(null);

  const filteredFacilities = demoFacilities
    .filter((f) => selectedCategory && f.category === selectedCategory)
    .filter((f) => !searchQuery || f.name.includes(searchQuery) || f.address.includes(searchQuery))
    .sort((a, b) => a.distance - b.distance);

  const handleSelectCategory = (cat: FacilityCategory) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    setScreen('list');
  };

  const handleSelectFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setScreen('detail');
  };

  const handleSelectService = (service: FacilityService) => {
    setSelectedService(service);
    setScreen('service');
  };

  const handleBack = () => {
    if (screen === 'service') { setScreen('detail'); setSelectedService(null); }
    else if (screen === 'detail') { setScreen('list'); setSelectedFacility(null); }
    else if (screen === 'list') { setScreen('categories'); setSelectedCategory(null); }
  };

  // ─── Categories Screen ─────────────────────────────────────────────────────
  if (screen === 'categories') {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#0D47A1] px-4 pt-10 pb-20">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onExit} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronLeft size={22} className="text-white rotate-180" />
            </button>
            <h1 className="text-white font-bold text-lg">المنشآت الطبية</h1>
            <div className="w-10" />
          </div>
          <p className="text-white/70 text-sm text-right mb-2">اختر نوع المنشأة للبحث عن الأقرب إليك</p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: 'منشأة طبية', val: demoFacilities.length, color: 'text-white' },
              { label: 'مفتوح 24 ساعة', val: demoFacilities.filter((f) => f.isOpen24h).length, color: 'text-green-300' },
              { label: 'خدمة متاحة', val: demoFacilities.reduce((s, f) => s + f.services.length, 0), color: 'text-amber-300' },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-white/15 rounded-xl py-3 text-center">
                <p className={`text-2xl font-bold ${color}`}>{val}</p>
                <p className="text-white/70 text-[11px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 -mt-10 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h2 className="font-bold text-gray-800 text-sm mb-3 text-right">تصفح حسب النوع</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(({ id, label, icon: Icon, color, bg, desc }) => {
                const count = demoFacilities.filter((f) => f.category === id).length;
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectCategory(id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-[#E8F5F4] transition-colors active:scale-95"
                  >
                    <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center`}>
                      <Icon size={28} className={color} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{label}</span>
                    <span className="text-[10px] text-gray-400">{desc}</span>
                    <span className="text-[10px] text-gray-400">{count} منشأة</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Facility List Screen ──────────────────────────────────────────────────
  if (screen === 'list') {
    const cat = categories.find((c) => c.id === selectedCategory)!;
    const CatIcon = cat.icon;
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className={`bg-gradient-to-b ${selectedCategory === 'hospital' ? 'from-red-600 to-red-800' : selectedCategory === 'pharmacy' ? 'from-green-600 to-green-800' : selectedCategory === 'lab' ? 'from-purple-600 to-purple-800' : 'from-teal-600 to-teal-800'} px-4 pt-10 pb-20`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={handleBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronLeft size={22} className="text-white rotate-180" />
            </button>
            <h1 className="text-white font-bold text-lg">{cat.label}</h1>
            <div className="w-10" />
          </div>
          <div className="bg-white rounded-2xl flex items-center px-4 py-3 gap-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`ابحث عن ${cat.label}...`}
              className="flex-1 text-gray-700 placeholder-gray-400 outline-none text-sm"
              dir="rtl"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div className="px-4 -mt-10 relative z-10">
          <p className="text-sm text-gray-500 mb-3">{filteredFacilities.length} منشأة — مرتبة بالأقرب</p>
          <div className="space-y-3">
            {filteredFacilities.map((facility) => {
              const fc = categories.find((c) => c.id === facility.category)!;
              const FIcon = fc.icon;
              return (
                <button
                  key={facility.id}
                  onClick={() => handleSelectFacility(facility)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-right active:scale-98 transition-transform"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 ${fc.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <FIcon size={24} className={fc.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        {facility.isOpen24h && (
                          <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">24H</span>
                        )}
                        <h3 className="font-bold text-gray-900 text-sm text-right flex-1 mr-2">{facility.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 text-right">{facility.address}</p>
                      <div className="flex items-center gap-2 flex-wrap justify-end mt-1.5">
                        <div className="flex items-center gap-0.5">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold text-gray-700">{facility.rating}</span>
                          <span className="text-xs text-gray-400">({facility.totalReviews})</span>
                        </div>
                        <div className="flex items-center gap-0.5 bg-[#E8F5F4] rounded-lg px-2 py-0.5">
                          <MapPin size={10} className="text-[#199A8E]" />
                          <span className="text-xs text-[#199A8E] font-medium">{facility.distance} كم</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMapFacility(facility);
                            setShowMapModal(true);
                          }}
                          className="flex items-center gap-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg px-2 py-0.5 text-xs font-semibold transition"
                          title="عرض على الخريطة التفاعلية"
                        >
                          <Compass size={11} className="text-sky-600" />
                          <span>الخريطة</span>
                        </button>
                        <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg px-2 py-0.5">
                          <Clock size={10} className="text-gray-500" />
                          <span className="text-xs text-gray-500">{facility.workingHours}</span>
                        </div>
                      </div>
                      {facility.category === 'hospital' && (
                        <div className="flex gap-1 mt-2 flex-wrap justify-end">
                          {facility.services.filter((s) => s.type === 'clinic').slice(0, 2).map((s) => (
                            <span key={s.id} className="text-[10px] bg-[#E8F5F4] text-[#199A8E] rounded-lg px-1.5 py-0.5">{s.name}</span>
                          ))}
                          {facility.services.filter((s) => s.type !== 'clinic').length > 0 && (
                            <span className="text-[10px] text-gray-400">+{facility.services.length - 2} خدمات</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Facility Detail Screen ────────────────────────────────────────────────
  if (screen === 'detail' && selectedFacility) {
    const fc = categories.find((c) => c.id === selectedFacility.category)!;
    const FIcon = fc.icon;
    const serviceTypes = selectedFacility.category === 'hospital'
      ? ['clinic', 'lab', 'imaging', 'pharmacy']
      : [selectedFacility.category === 'pharmacy' ? 'pharmacy' : selectedFacility.category === 'lab' ? 'lab' : 'imaging'];

    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        {/* Hero */}
        <div className={`${fc.bg} pt-10 pb-20 px-4 relative`}>
          <button onClick={handleBack} className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <ChevronLeft size={22} className="text-gray-700 rotate-180" />
          </button>
          <div className={`w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-md mx-auto mb-4`}>
            <FIcon size={38} className={fc.color} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 text-center mb-1">{selectedFacility.name}</h1>
          <p className={`text-center text-sm font-medium ${fc.color}`}>{fc.label}</p>
        </div>

        <div className="px-4 -mt-10 relative z-10 space-y-4">
          {/* Info card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {selectedFacility.isOpen24h && (
              <div className="bg-green-500 py-2 text-center">
                <span className="text-white text-xs font-bold">مفتوح 24 ساعة</span>
              </div>
            )}
            <div className="p-5 space-y-3">
              <p className="text-gray-600 text-sm leading-relaxed text-right">{selectedFacility.description}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm flex-1 text-right">{selectedFacility.address}</span>
                <span className="text-[#199A8E] text-sm font-bold flex-shrink-0">{selectedFacility.distance} كم</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} className="text-gray-400" />
                <span className="text-sm">{selectedFacility.workingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={s <= Math.round(selectedFacility.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
                <span className="font-bold text-gray-800 text-sm">{selectedFacility.rating}</span>
                <span className="text-gray-400 text-xs">({selectedFacility.totalReviews} تقييم)</span>
              </div>
            </div>
          </div>

          {/* Interactive Map Button */}
          <button
            onClick={() => {
              setMapFacility(selectedFacility);
              setShowMapModal(true);
            }}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 text-white rounded-2xl py-3.5 px-4 font-bold text-sm shadow-md hover:from-sky-700 hover:to-indigo-800 transition active:scale-98"
          >
            <Navigation size={18} />
            <span>عرض الموقع على الخريطة التفاعلية (المسار والمسافة)</span>
          </button>

          {/* Services by type */}
          {serviceTypes.map((st) => {
            const stConfig = serviceTypeConfig[st];
            const StIcon = stConfig.icon;
            const services = selectedFacility.services.filter((s) => s.type === st);
            if (services.length === 0) return null;
            return (
              <div key={st} className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2 justify-end">
                  <span>{stConfig.label}</span>
                  <StIcon size={18} className={stConfig.color} />
                </h3>
                <div className="space-y-2">
                  {services.map((service) => {
                    const SIcon = service.type === 'clinic' ? Stethoscope : service.type === 'lab' ? FlaskConical : service.type === 'imaging' ? Radiation : Pill;
                    return (
                      <button
                        key={service.id}
                        onClick={() => handleSelectService(service)}
                        className="w-full flex items-center gap-3 bg-gray-50 rounded-xl p-3 text-right hover:bg-gray-100 transition-colors active:scale-98"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm text-right">{service.name}</p>
                          {service.doctorName && (
                            <p className="text-xs text-gray-500 text-right mt-0.5">
                              {service.doctorName} — {service.doctorSpecialty}
                            </p>
                          )}
                          {service.description && (
                            <p className="text-xs text-gray-400 text-right mt-0.5">{service.description}</p>
                          )}
                        </div>
                        <div className={`w-10 h-10 ${stConfig.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <SIcon size={18} className={stConfig.color} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Contact actions */}
          <div className="grid grid-cols-2 gap-3">
            <a href={`tel:${selectedFacility.phone}`} className="bg-[#199A8E] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
              <Phone size={18} /> اتصال
            </a>
            <button
              onClick={() => {
                setMapFacility(selectedFacility);
                setShowMapModal(true);
              }}
              className="bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 active:scale-95 transition"
            >
              <Navigation size={18} /> الخريطة والاتجاهات
            </button>
          </div>
        </div>

        {mapFacility && (
          <FacilityInteractiveMap
            facility={{
              name: mapFacility.name,
              category: mapFacility.category,
              address: mapFacility.address,
              phone: mapFacility.phone,
              latitude: mapFacility.latitude,
              longitude: mapFacility.longitude,
              distance: mapFacility.distance,
              workingHours: mapFacility.workingHours,
            }}
            isOpen={showMapModal}
            onClose={() => setShowMapModal(false)}
          />
        )}
      </div>
    );
  }

  // ─── Service Detail Screen ─────────────────────────────────────────────────
  if (screen === 'service' && selectedFacility && selectedService) {
    const stConfig = serviceTypeConfig[selectedService.type];
    const StIcon = stConfig.icon;
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className={`bg-gradient-to-b ${selectedService.type === 'clinic' ? 'from-[#104C48] via-[#125853] to-[#199A8E]' : selectedService.type === 'lab' ? 'from-purple-600 to-purple-800' : selectedService.type === 'imaging' ? 'from-teal-600 to-teal-800' : 'from-green-600 to-green-800'} px-4 pt-10 pb-16`}>
          <button onClick={handleBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <ChevronLeft size={22} className="text-white rotate-180" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <StIcon size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">{selectedService.name}</h1>
              <p className="text-white/70 text-sm">{selectedFacility.name}</p>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-6 relative z-10 space-y-4">
          {/* Service info */}
          <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3">
            {selectedService.doctorName && (
              <div className="flex items-center gap-3 bg-[#E8F5F4] rounded-xl p-3">
                <div className="w-10 h-10 bg-[#199A8E] rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-white" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-bold text-gray-800 text-sm">{selectedService.doctorName}</p>
                  <p className="text-xs text-gray-500">{selectedService.doctorSpecialty}</p>
                </div>
              </div>
            )}
            {selectedService.description && (
              <p className="text-gray-600 text-sm text-right">{selectedService.description}</p>
            )}
            {selectedService.price && (
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-[#199A8E] font-black text-lg">{selectedService.price.toLocaleString()} ر.ي</span>
                <span className="text-sm text-gray-500">السعر</span>
              </div>
            )}
            {selectedService.available && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm font-bold">متاح الآن</span>
              </div>
            )}
          </div>

          {/* Upload request (for lab/imaging/pharmacy) */}
          {(selectedService.type === 'lab' || selectedService.type === 'imaging' || selectedService.type === 'pharmacy') && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2 justify-end">
                <span>رفع طلب / وصفة طبية</span>
                <Upload size={18} className="text-gray-500" />
              </h3>
              <button className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-8 flex flex-col items-center gap-2 hover:border-[#199A8E] transition-colors">
                <Upload size={32} className="text-gray-300" />
                <p className="text-sm text-gray-500 font-medium">اضغط لرفع صورة الطلب أو الوصفة</p>
                <p className="text-xs text-gray-400">PDF, JPG, PNG</p>
              </button>
              {uploadSent && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <p className="text-green-700 text-sm font-bold">تم إرسال الطلب بنجاح</p>
                </div>
              )}
              <button
                onClick={() => { setUploadSent(true); setTimeout(() => setUploadSent(false), 3000); }}
                className="w-full mt-3 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Send size={16} /> إرسال الطلب
              </button>
            </div>
          )}

          {/* Booking action (for clinics) */}
          {selectedService.type === 'clinic' && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-3 text-right">احجز موعد</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-3">
                  <Calendar size={16} className="text-amber-500" />
                  <span className="text-sm text-amber-700 font-medium">أقرب موعد متاح: غداً — 9:00 صباحاً</span>
                </div>
                <div className="flex items-center gap-2 bg-teal-50 rounded-xl px-3 py-3">
                  <Clock size={16} className="text-teal-500" />
                  <span className="text-sm text-teal-700 font-medium">مدة الانتظار: ~15 دقيقة</span>
                </div>
                <button className="w-full py-4 rounded-2xl bg-gradient-to-l from-[#104C48] to-[#199A8E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95">
                  <Calendar size={18} /> حجز موعد في العيادة
                </button>
              </div>
            </div>
          )}

          {/* Available services list (for lab/imaging) */}
          {(selectedService.type === 'lab' || selectedService.type === 'imaging') && !selectedService.description && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-3 text-right">الخدمات المتاحة في {selectedFacility.name}</h3>
              <div className="space-y-2">
                {selectedFacility.services
                  .filter((s) => s.type === selectedService.type && s.id !== selectedService.id)
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s)}
                      className="w-full flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 text-right hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {s.price && <span className="text-xs text-[#199A8E] font-bold">{s.price.toLocaleString()} ر.ي</span>}
                        <ArrowRight size={14} className="text-gray-300" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{s.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
