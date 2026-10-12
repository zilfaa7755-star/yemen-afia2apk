import React, { useState, useEffect } from 'react';
import {
  Search, MapPin, Star, ChevronLeft, Clock, Phone, Users,
  Calendar, Navigation, Briefcase, Building2, DollarSign,
  Timer, Check, X, Award, GraduationCap, Languages, CalendarDays,
  Stethoscope, FileText, ShieldCheck, BookOpen, Heart, Activity,
  Shield, Zap, TrendingUp, Clipboard, Eye, CreditCard, Wallet, Banknote,
  Video,
  Mic,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { supabase } from '../lib/supabase';
import type { Doctor, Specialization } from '../types';
import { AudioTranscribeModal } from '../components/common/AudioTranscribeModal';

interface QueueBookingInfo {
  queueNumber: number;
  estimatedWaitMinutes: number;
  estimatedArrivalTime: string;
}

interface DoctorSearchPageProps {
  onBack?: () => void;
  onSelectDoctor?: (doctor: Doctor, queueInfo: QueueBookingInfo) => void;
  preselectedSpecialization?: string;
}

const DAY_LABELS: Record<string, string> = {
  sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت',
};
const ALL_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function DoctorSearchPage({ onBack, onSelectDoctor, preselectedSpecialization }: DoctorSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState(preselectedSpecialization || '');
  const [sortBy, setSortBy] = useState('rating');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState<'booking' | 'bio' | 'schedule'>('booking');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingDetails, setBookingDetails] = useState('');
  const [paymentChoice, setPaymentChoice] = useState('wallet');
  const [consultationType, setConsultationType] = useState<'clinic' | 'emergency' | 'remote'>('clinic');
  const [showTranscribe, setShowTranscribe] = useState(false);
  const [transcribeTarget, setTranscribeTarget] = useState<'search' | 'booking'>('search');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [doctorsRes, specsRes] = await Promise.all([
        supabase.from('doctors').select('*, specialization:specializations(*), clinic:clinics(*)').eq('is_active', true).order('rating', { ascending: false }),
        supabase.from('specializations').select('*').order('name_ar'),
      ]);
      if (doctorsRes.data && doctorsRes.data.length > 0) setDoctors(doctorsRes.data as Doctor[]);
      else setDoctors(getDemoDoctors());
      if (specsRes.data && specsRes.data.length > 0) setSpecializations(specsRes.data as Specialization[]);
      else setSpecializations(getDemoSpecs());
    } catch {
      setDoctors(getDemoDoctors());
      setSpecializations(getDemoSpecs());
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoSpecs = (): Specialization[] => [
    { id: '1', name_ar: 'باطنية عامة', name_en: 'General Medicine' },
    { id: '2', name_ar: 'قلب وأوعية', name_en: 'Cardiology' },
    { id: '3', name_ar: 'مخ وأعصاب', name_en: 'Neurology' },
    { id: '4', name_ar: 'أطفال', name_en: 'Pediatrics' },
    { id: '5', name_ar: 'جلدية', name_en: 'Dermatology' },
    { id: '6', name_ar: 'عظام', name_en: 'Orthopedics' },
  ];

  const getDemoDoctors = (): Doctor[] => [
    {
      id: '1', full_name: 'د. أحمد المقطري', specialization_id: '1',
      specialization: { id: '1', name_ar: 'باطنية عامة', name_en: 'General Medicine' },
      clinic_id: '1', clinic: { id: '1', name: 'مركز اليمن الطبي', address: 'صنعاء - حدة - شارع الستين', latitude: 15.3694, longitude: 44.1910, working_hours: {}, is_active: true },
      consultation_fee: 3000, average_consultation_time: 25, rating: 4.8, total_reviews: 148,
      bio: 'طبيب استشاري بخبرة 10 سنوات في تشخيص وعلاج الأمراض الباطنة المزمنة. متخصص في متابعة مرضى السكري وضغط الدم. يحرص على تقديم رعاية شاملة بأحدث الأساليب الطبية المبنية على الأدلة العلمية.',
      working_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
      working_hours: { morning: { start: '08:00', end: '12:00' }, evening: { start: '16:00', end: '20:00' } },
      is_active: true, is_available: true,
    },
    {
      id: '2', full_name: 'د. فاطمة الشامي', specialization_id: '2',
      specialization: { id: '2', name_ar: 'قسطرة قلبية', name_en: 'Cardiology' },
      clinic_id: '2', clinic: { id: '2', name: 'عيادات الشفاء التخصصية', address: 'صنعاء - الستين - عمارة الشفاء', latitude: 15.3570, longitude: 44.1860, working_hours: {}, is_active: true },
      consultation_fee: 4200, average_consultation_time: 25, rating: 4.7, total_reviews: 95,
      bio: 'أخصائية قسطرة قلبية وعلاج أمراض الشرايين التاجية. حاصلة على زمالة من ألمانيا في القسطرة التداخلية. خبرة في علاج الجلطات القلبية والحالات الحرجة.',
      working_days: ['sunday', 'monday', 'wednesday', 'thursday'],
      working_hours: { evening: { start: '17:00', end: '21:00' } },
      is_active: true, is_available: true,
    },
    {
      id: '3', full_name: 'د. خالد الإرياني', specialization_id: '3',
      specialization: { id: '3', name_ar: 'أعصاب طرفية', name_en: 'Neurology' },
      clinic_id: '3', clinic: { id: '3', name: 'مجمع الحياة التخصصي', address: 'صنعاء - شارع تونس - بجانب جامع الحياة', latitude: 15.3740, longitude: 44.1950, working_hours: {}, is_active: true },
      consultation_fee: 4500, average_consultation_time: 20, rating: 4.9, total_reviews: 112,
      bio: 'أخصائي أعصاب طرفية وعلاج الشلل واعتلال الأعصاب. خبرة 12 سنة في تشخيص وعلاج الصداع النصفي والصرع والتصلب المتعدد.',
      working_days: ['sunday', 'tuesday', 'thursday'],
      working_hours: { morning: { start: '09:00', end: '13:00' } },
      is_active: true, is_available: true,
    },
    {
      id: '4', full_name: 'د. سمية الحوثي', specialization_id: '4',
      specialization: { id: '4', name_ar: 'أطفال عام', name_en: 'Pediatrics' },
      clinic_id: '4', clinic: { id: '4', name: 'مستوصف النور للأطفال', address: 'صنعاء - شارع الخمسين - بجانب صيدلية النور', latitude: 15.3665, longitude: 44.1885, working_hours: {}, is_active: true },
      consultation_fee: 2500, average_consultation_time: 20, rating: 4.6, total_reviews: 88,
      bio: 'طبيبة أطفال متخصصة في تشخيص وعلاج الأمراض الشائعة عند الأطفال. متابعة النمو والتطعيمات. علاج الحالات المزمنة مثل الربو والحساسية الموسمية.',
      working_days: ['monday', 'tuesday', 'wednesday', 'thursday'],
      working_hours: { morning: { start: '08:00', end: '12:00' } },
      is_active: true, is_available: true,
    },
  ];

  const filteredDoctors = doctors.filter((d) => {
    const matchSearch = d.full_name.includes(searchQuery) || (d.specialization?.name_ar ? d.specialization.name_ar.includes(searchQuery) : false);
    const matchSpec = !selectedSpec || d.specialization_id === selectedSpec;
    return matchSearch && matchSpec;
  });

  const queueData: Record<string, { waiting: number; distKm: number; waitMin: number }> = {
    '1': { waiting: 10, distKm: 1.0, waitMin: 8 },
    '2': { waiting: 10, distKm: 1.3, waitMin: 12 },
    '3': { waiting: 11, distKm: 1.6, waitMin: 15 },
    '4': { waiting: 8, distKm: 2.1, waitMin: 8 },
  };

  // Real doctor photos from Pexels
  const doctorPhotos: Record<string, string> = {
    '1': 'https://images.pexels.com/photos/29995617/pexels-photo-29995617.jpeg?auto=compress&cs=tinysrgb&h=350&w=350',
    '2': 'https://images.pexels.com/photos/32115905/pexels-photo-32115905.jpeg?auto=compress&cs=tinysrgb&h=350&w=350',
    '3': 'https://images.pexels.com/photos/32254658/pexels-photo-32254658.jpeg?auto=compress&cs=tinysrgb&h=350&w=350',
    '4': 'https://images.pexels.com/photos/33067699/pexels-photo-33067699.jpeg?auto=compress&cs=tinysrgb&h=350&w=350',
  };

  // Demo comprehensive doctor profile data
  const doctorExtras: Record<string, {
    qualifications: string[];
    certificates: { title: string; issuer: string; year: string }[];
    languages: string[];
    experienceYears: number;
    education: string;
    publications: { title: string; journal: string; year: string }[];
    awards: { title: string; issuer: string; year: string }[];
    insuranceAccepted: string[];
    services: string[];
    members: string[];
    totalPatients: number;
    successRate: number;
    phone: string;
    email: string;
    licenseNumber: string;
  }> = {
    '1': {
      qualifications: ['بكالوريوس طب وجراحة - جامعة صنعاء (2008)', 'دبلوم الباطنة العامة - المجلس العربي للطب (2013)', 'زمالة الكلية الملكية البريطانية MRCP (2017)'],
      certificates: [
        { title: 'دبلوم الأمراض الباطنة', issuer: 'المجلس العربي للاختصاصات الصحية', year: '2013' },
        { title: 'دورة متقدمة في علاج السكري', issuer: 'منظمة الصحة العالمية - الإسكندرية', year: '2016' },
        { title: 'زمالة الباطنة العامة', issuer: 'الكلية الملكية البريطانية للأطباء - لندن', year: '2017' },
        { title: 'دورة الإنعاش القلبي الرئوي ACLS', issuer: 'الجمعية الأمريكية للقلب', year: '2019' },
      ],
      languages: ['العربية', 'الإنجليزية'],
      experienceYears: 16,
      education: 'جامعة صنعاء - كلية الطب والعلوم الصحية',
      publications: [
        { title: 'مضاعفات السكري لدى البالغين في اليمن', journal: 'المجلة اليمنية للطب', year: '2018' },
        { title: 'علاج ارتفاع ضغط الدم المقاوم', journal: 'المجلة العربية للطب الباطني', year: '2020' },
      ],
      awards: [
        { title: 'أفضل طبيب باطنة لعام 2021', issuer: 'نقابة الأطباء - اليمن', year: '2021' },
        { title: 'شهادة التميز في الخدمة الطبية', issuer: 'وزارة الصحة العامة', year: '2019' },
      ],
      insuranceAccepted: ['تأمين سبأ', 'تأمين اليمن', 'تأمين الشرق', 'إيمان'],
      services: ['كشف باطني عام', 'متابعة السكري', 'متابعة ضغط الدم', 'أمراض الغدد', 'كشف دوري شامل'],
      members: ['نقابة الأطباء اليمنيين', 'الجمعية العربية للطب الباطني', 'الكلية الملكية البريطانية'],
      totalPatients: 3200,
      successRate: 94,
      phone: '777001001',
      email: 'ahmed.almaqtari@yemen-health.ye',
      licenseNumber: 'LIC-20345',
    },
    '2': {
      qualifications: ['بكالوريوس طب وجراحة - جامعة عدن (2010)', 'دبلوم أمراض القلب - المجلس العربي (2015)', 'زمالة القسطرة القلبية - جامعة برلين (2019)'],
      certificates: [
        { title: 'دبلوم أمراض القلب', issuer: 'المجلس العربي للاختصاصات الصحية', year: '2015' },
        { title: 'دورة القسطرة التداخلية المتقدمة', issuer: 'جامعة شاريتيه - برلين', year: '2018' },
        { title: 'دورة علاج الجلطات القلبية', issuer: 'الجمعية الأوروبية لأمراض القلب', year: '2020' },
      ],
      languages: ['العربية', 'الإنجليزية', 'الألمانية'],
      experienceYears: 14,
      education: 'جامعة عدن - كلية الطب',
      publications: [
        { title: 'القسطرة التداخلية في علاج الجلطات الحادة', journal: 'المجلة العربية لأمراض القلب', year: '2020' },
      ],
      awards: [
        { title: 'رائدة القسطرة النسائية في اليمن', issuer: 'وزارة الصحة العامة', year: '2022' },
      ],
      insuranceAccepted: ['تأمين سبأ', 'تأمين اليمن', 'إيمان'],
      services: ['قسطرة قلبية', 'علاج الجلطات', 'متابعة أمراض القلب', 'تخطيط القلب', 'إيكو القلب'],
      members: ['الجمعية الأوروبية لأمراض القلب', 'نقابة الأطباء اليمنيين'],
      totalPatients: 1800,
      successRate: 91,
      phone: '777002002',
      email: 'fatima.shami@yemen-health.ye',
      licenseNumber: 'LIC-20412',
    },
    '3': {
      qualifications: ['بكالوريوس طب وجراحة - جامعة صنعاء (2006)', 'دبلوم الأعصاب الطرفية - جامعة الأردن (2012)', 'البورد العربي في طب الأعصاب (2015)'],
      certificates: [
        { title: 'دبلوم الأعصاب الطرفية', issuer: 'جامعة الأردن - عمّان', year: '2012' },
        { title: 'البورد العربي في طب الأعصاب', issuer: 'المجلس العربي للاختصاصات الصحية', year: '2015' },
        { title: 'دورة متقدمة في علاج الصرع', issuer: 'الرابطة الدولية للصرع', year: '2019' },
      ],
      languages: ['العربية', 'الإنجليزية'],
      experienceYears: 18,
      education: 'جامعة صنعاء - كلية الطب',
      publications: [
        { title: 'التصلب المتعدد: التشخيص والعلاج', journal: 'المجلة العربية للأعصاب', year: '2019' },
        { title: 'اعتلال الأعصاب السكري', journal: 'المجلة اليمنية للطب', year: '2021' },
      ],
      awards: [
        { title: 'أخصائي الأعصاب المتميز', issuer: 'الجمعية العربية لطب الأعصاب', year: '2020' },
        { title: 'جائزة البحث العلمي', issuer: 'وزارة التعليم العالي', year: '2018' },
      ],
      insuranceAccepted: ['تأمين سبأ', 'تأمين اليمن', 'تأمين الشرق'],
      services: ['كشف أعصاب', 'علاج الصداع النصبي', 'متابعة الصرع', 'علاج التصلب المتعدد', 'تخطيط الدماغ EEG'],
      members: ['الجمعية العربية لطب الأعصاب', 'الرابطة الدولية للصرع', 'نقابة الأطباء'],
      totalPatients: 2400,
      successRate: 93,
      phone: '777003003',
      email: 'khaled.iriani@yemen-health.ye',
      licenseNumber: 'LIC-19876',
    },
    '4': {
      qualifications: ['بكالوريوس طب وجراحة - جامعة صنعاء (2009)', 'دبلوم طب الأطفال - جامعة القاهرة (2014)', 'البورد العربي في طب الأطفال (2017)'],
      certificates: [
        { title: 'دبلوم طب الأطفال', issuer: 'جامعة القاهرة - مصر', year: '2014' },
        { title: 'البورد العربي في طب الأطفال', issuer: 'المجلس العربي للاختصاصات الصحية', year: '2017' },
        { title: 'دورة الإنعاش للأطفال PALS', issuer: 'الجمعية الأمريكية للقلب', year: '2020' },
      ],
      languages: ['العربية', 'الإنجليزية'],
      experienceYears: 15,
      education: 'جامعة صنعاء - كلية الطب',
      publications: [
        { title: 'الربو عند الأطفال في البيئات الحارة', journal: 'المجلة العربية لطب الأطفال', year: '2020' },
      ],
      awards: [
        { title: 'طبيبة الأطفال المثالية', issuer: 'نقابة الأطباء', year: '2021' },
      ],
      insuranceAccepted: ['تأمين سبأ', 'تأمين اليمن', 'إيمان', 'تأمين الشرق'],
      services: ['كشف أطفال عام', 'متابعة النمو', 'التطعيمات', 'علاج الربو', 'الحساسية الموسمية'],
      members: ['الجمعية العربية لطب الأطفال', 'نقابة الأطباء اليمنيين'],
      totalPatients: 4100,
      successRate: 96,
      phone: '777004004',
      email: 'somaia.houthi@yemen-health.ye',
      licenseNumber: 'LIC-20578',
    },
  };

  const openProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setProfileTab('booking');
    setBookingReason('');
    setBookingDetails('');
    setShowProfileModal(true);
  };

  const handleBook = () => {
    if (!selectedDoctor) return;
    const qd = queueData[selectedDoctor.id] || { waiting: 5, distKm: 2.0, waitMin: 10 };
    const myQueueNumber = qd.waiting + 1;
    const totalWaitMinutes = myQueueNumber * (selectedDoctor.average_consultation_time ?? 15);
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + totalWaitMinutes * 60 * 1000);
    const timeStr = arrivalTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    setShowProfileModal(false);
    onSelectDoctor?.(selectedDoctor, {
      queueNumber: myQueueNumber,
      estimatedWaitMinutes: totalWaitMinutes,
      estimatedArrivalTime: timeStr,
    });
  };

  // ─── Profile Modal ──────────────────────────────────────────────────────────
  const renderProfileModal = () => {
    if (!selectedDoctor) return null;
    const qd = queueData[selectedDoctor.id] || { waiting: 5, distKm: 2.0, waitMin: 10 };
    const extras = doctorExtras[selectedDoctor.id] || {
      qualifications: ['بكالوريوس طب وجراحة'], certificates: [], languages: ['العربية'],
      experienceYears: 5, education: 'كلية الطب', publications: [], awards: [],
      insuranceAccepted: [], services: [], members: [], totalPatients: 0, successRate: 0,
      phone: '—', email: '—', licenseNumber: '—',
    };
    const myQueueNumber = qd.waiting + 1;
    const totalWaitMinutes = myQueueNumber * (selectedDoctor.average_consultation_time ?? 15);
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + totalWaitMinutes * 60 * 1000);
    const timeStr = arrivalTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    const baseFee = selectedDoctor.consultation_fee ?? selectedDoctor.price ?? 3000;
    const currentFee = consultationType === 'emergency' ? Math.round(baseFee * 1.5) : consultationType === 'remote' ? Math.round(baseFee * 0.6) : baseFee;

    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
        <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
          {/* Header with gradient */}
          <div className="bg-gradient-to-b from-[#104C48] via-[#125853] to-[#199A8E] px-5 pt-6 pb-8 rounded-t-3xl relative">
            <button onClick={() => setShowProfileModal(false)}
              className="absolute top-4 left-4 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <X size={18} className="text-white" />
            </button>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30 flex-shrink-0 bg-white/20">
                <img src={doctorPhotos[selectedDoctor.id]} alt={selectedDoctor.full_name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{selectedDoctor.full_name}</h2>
                <p className="text-white/80 text-sm mt-0.5">{selectedDoctor.specialization?.name_ar}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1">
                    <Star size={13} className="text-yellow-300" fill="currentColor" />
                    <span className="text-white text-xs font-bold">{selectedDoctor.rating}</span>
                  </div>
                  <span className="text-white/70 text-xs">({selectedDoctor.total_reviews} تقييم)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 pb-8">
            <div className="bg-white rounded-2xl -mt-4 relative z-10 p-1.5 shadow-sm flex gap-1" dir="rtl">
              {[
                { id: 'booking', label: 'تخصيص الموعد والحجز' },
                { id: 'bio', label: 'السيرة الذاتية والمؤهلات' },
                { id: 'schedule', label: 'التقييمات ومواعيد العمل' },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setProfileTab(tab.id as 'booking' | 'bio' | 'schedule')}
                  className={`flex-1 rounded-xl px-2 py-3 text-[11px] font-bold transition-all ${profileTab === tab.id ? 'bg-[#199A8E] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {profileTab === 'booking' ? (
              <div className="pt-5 space-y-4" dir="rtl">
                {/* Consultation type selector */}
                <section className="bg-white rounded-2xl border border-gray-100 p-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">نوع الاستشارة *</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'clinic', label: 'استشارة عيادة', icon: Stethoscope, desc: 'حضور للعيادة', fee: baseFee },
                      { id: 'emergency', label: 'استشارة طارئة', icon: Zap, desc: 'أولوية قصوى', fee: Math.round(baseFee * 1.5) },
                      { id: 'remote', label: 'استشارة عن بعد', icon: Video, desc: 'مكالمة فيديو', fee: Math.round(baseFee * 0.6) },
                    ].map(({ id, label, icon: Icon, desc, fee }) => (
                      <button
                        key={id}
                        onClick={() => setConsultationType(id as 'clinic' | 'emergency' | 'remote')}
                        className={`rounded-xl border-2 p-3 text-center transition-all ${consultationType === id ? 'border-[#199A8E] bg-[#E8F5F4]' : 'border-gray-100 bg-white'}`}
                      >
                        <Icon size={20} className={`mx-auto mb-1.5 ${consultationType === id ? 'text-[#199A8E]' : 'text-gray-400'}`} />
                        <span className={`block text-xs font-bold ${consultationType === id ? 'text-[#199A8E]' : 'text-gray-600'}`}>{label}</span>
                        <span className="block text-[10px] text-gray-400 mt-0.5">{desc}</span>
                        <span className="block text-[10px] font-bold text-gray-500 mt-1">{fee.toLocaleString()} ر.ي</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setTranscribeTarget('booking');
                        setShowTranscribe(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0B337A]/10 to-[#00B39F]/10 hover:from-[#0B337A]/20 hover:to-[#00B39F]/20 text-[#0B337A] text-xs font-bold transition border border-[#00B39F]/20"
                    >
                      <Mic size={14} className="text-[#00B39F]" />
                      <span>تسجيل صوتي (Gemini 3.5)</span>
                    </button>
                    <h3 className="font-bold text-gray-800 text-sm">سبب الزيارة والأعراض</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['فحص روتيني ومتابعة', 'ألم أو أعراض مستمرة', 'صداع ودوخة', 'ضغط وسكر', 'استشارة وتعديل أدوية'].map((reason) => (
                      <button key={reason} onClick={() => setBookingReason(reason)}
                        className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${bookingReason === reason ? 'bg-[#0B337A] text-white' : 'bg-[#E8F5F4] text-[#0B337A]'}`}>
                        {reason}
                      </button>
                    ))}
                  </div>
                  <textarea value={bookingDetails} onChange={(event) => setBookingDetails(event.target.value)} rows={3}
                    placeholder="اكتب وصفاً أو تحدث بالمايكروفون لوصف الأعراض..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 outline-none focus:border-[#00B39F] focus:ring-2 focus:ring-[#00B39F]/20 resize-none" />
                </section>

                <section className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">{qd.distKm} كم • حوالي {qd.waitMin} دقيقة</span>
                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">مكان العيادة <MapPin size={15} className="text-[#199A8E]" /></h3>
                  </div>
                  <p className="text-sm font-bold text-gray-800 text-right">{selectedDoctor.clinic?.name}</p>
                  <p className="text-xs text-gray-500 mt-1 text-right">{selectedDoctor.clinic?.address}</p>
                  <button className="mt-3 w-full rounded-xl bg-gray-900 py-2.5 text-sm font-bold text-white flex items-center justify-center gap-2"><Navigation size={15} /> توجيه بالخريطة</button>
                </section>

                <button className="w-full rounded-2xl border border-gray-200 bg-white p-4 flex items-center gap-3 text-right">
                  <div className="w-5 h-5 rounded-md border-2 border-gray-300 flex-shrink-0" />
                  <div className="flex-1"><p className="font-bold text-gray-700 text-sm">حالة طارئة حرجة</p><p className="text-xs text-gray-500 mt-1">طلب أولوية للمرضى الذين يحتاجون تدخلاً عاجلاً</p></div>
                  <Zap size={18} className="text-amber-500" />
                </button>

                <section className="bg-white rounded-2xl border border-gray-100 p-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">اختر وسيلة الدفع الإلكتروني:</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ id: 'wallet', label: 'المحفظة الإلكترونية', Icon: Wallet }, { id: 'card', label: 'بطاقة مصرفية', Icon: CreditCard }, { id: 'cash', label: 'نقداً عند الوصول', Icon: Banknote }].map(({ id, label, Icon }) => (
                      <button key={id} onClick={() => setPaymentChoice(id)} className={`rounded-xl border-2 p-3 text-center transition-all ${paymentChoice === id ? 'border-[#199A8E] bg-[#E8F5F4]' : 'border-gray-100 bg-white'}`}>
                        <Icon size={19} className={`mx-auto mb-2 ${paymentChoice === id ? 'text-[#199A8E]' : 'text-gray-400'}`} />
                        <span className="block text-[10px] leading-4 text-gray-600">{label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500"><span>{currentFee.toLocaleString()} ر.ي</span><span>رسوم المعاينة</span></div>
                    <div className="flex justify-between text-gray-500"><span>0 ر.ي</span><span>رسوم الحجز الإلكتروني</span></div>
                    <div className="border-t pt-3 flex justify-between font-black text-gray-900"><span>{currentFee.toLocaleString()} ر.ي</span><span>المبلغ المستحق للدفع</span></div>
                  </div>
                </section>

                <button onClick={handleBook} className="w-full rounded-2xl bg-gradient-to-l from-[#104C48] to-[#199A8E] py-4 text-white font-black text-base shadow-lg flex items-center justify-center gap-2">
                  تأكيد الحجز والحصول على التذكرة ({currentFee.toLocaleString()} ر.ي) <Check size={19} />
                </button>
              </div>
            ) : profileTab === 'schedule' ? (
              <div className="pt-5 space-y-4" dir="rtl">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2"><Star size={20} className="text-amber-400" fill="currentColor" /><span className="text-3xl font-black text-gray-900">{selectedDoctor.rating}</span></div>
                  <p className="text-sm text-gray-500">تقييم ممتاز من {selectedDoctor.total_reviews} مراجع</p>
                  <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full w-[92%] rounded-full bg-amber-400" /></div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">أيام وساعات الدوام <CalendarDays size={16} className="text-[#199A8E]" /></h3>
                  <div className="flex flex-wrap gap-1.5 mb-3">{ALL_DAYS.map((day) => <span key={day} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium ${selectedDoctor.working_days?.includes(day) ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-300 line-through'}`}>{DAY_LABELS[day]}</span>)}</div>
                  <div className="space-y-2">{selectedDoctor.working_hours?.morning && <div className="flex justify-between rounded-xl bg-amber-50 px-3 py-2.5 text-sm"><span className="font-bold text-gray-700">{selectedDoctor.working_hours.morning.start} - {selectedDoctor.working_hours.morning.end}</span><span className="text-amber-600">الفترة الصباحية</span></div>}{selectedDoctor.working_hours?.evening && <div className="flex justify-between rounded-xl bg-[#E8F5F4] px-3 py-2.5 text-sm"><span className="font-bold text-gray-700">{selectedDoctor.working_hours.evening.start} - {selectedDoctor.working_hours.evening.end}</span><span className="text-[#104C48]">الفترة المسائية</span></div>}</div>
                </div>
                <div className="bg-[#EBF8F4] rounded-2xl border border-teal-100 p-4"><div className="flex justify-between items-center"><div><p className="text-xs text-gray-500">المتوقع قبلك</p><p className="text-2xl font-black text-gray-900">{qd.waiting} مرضى</p></div><div className="text-left"><p className="text-xs text-gray-500">الانتظار التقريبي</p><p className="text-2xl font-black text-teal-700">{qd.waitMin} دقيقة</p></div></div></div>
                <button onClick={handleBook} className="w-full rounded-2xl bg-[#199A8E] py-4 text-white font-bold">اختيار هذا الطبيب والحجز</button>
              </div>
            ) : (
              <div className="pt-5 space-y-4">
            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Briefcase size={18} className="mx-auto text-[#199A8E] mb-1" />
                <p className="font-bold text-gray-800 text-base">{extras.experienceYears}س</p>
                <p className="text-xs text-gray-500">خبرة</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Clock size={18} className="mx-auto text-[#199A8E] mb-1" />
                <p className="font-bold text-gray-800 text-base">{selectedDoctor.average_consultation_time}د</p>
                <p className="text-xs text-gray-500">معاينة</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Users size={18} className="mx-auto text-[#199A8E] mb-1" />
                <p className="font-bold text-gray-800 text-base">{qd.waiting}</p>
                <p className="text-xs text-gray-500">في الطابور</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <TrendingUp size={18} className="mx-auto text-green-500 mb-1" />
                <p className="font-bold text-gray-800 text-base">{extras.successRate}%</p>
                <p className="text-xs text-gray-500">نجاح</p>
              </div>
            </div>

            {/* Bio */}
            {selectedDoctor.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-2 text-right flex items-center gap-2 justify-end">
                  نبذة عن الطبيب<FileText size={15} className="text-[#199A8E]" />
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed text-right">{selectedDoctor.bio}</p>
              </div>
            )}

            {/* Qualifications */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                المؤهلات العلمية<GraduationCap size={15} className="text-[#199A8E]" />
              </h3>
              <div className="space-y-2">
                {extras.qualifications.map((q, i) => (
                  <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                    <Check size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 text-right flex-1">{q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education & License */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                التعليم والترخيص<BookOpen size={15} className="text-[#199A8E]" />
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-[#E8F5F4] rounded-xl px-3 py-2.5">
                  <span className="text-sm font-mono font-bold text-gray-700">{extras.licenseNumber}</span>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span className="text-sm text-gray-600">رقم الترخيص</span>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="text-sm text-gray-700 text-right flex-1">{extras.education}</span>
                  <BookOpen size={14} className="text-[#199A8E] flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Services offered */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                الخدمات المقدمة<Activity size={15} className="text-[#199A8E]" />
              </h3>
              <div className="flex flex-wrap gap-2 justify-end">
                {extras.services.map((s, i) => (
                  <span key={i} className="bg-[#E8F5F4] text-[#199A8E] text-xs px-3 py-1.5 rounded-xl font-medium">{s}</span>
                ))}
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                الشهادات والتدريب<Award size={15} className="text-[#199A8E]" />
              </h3>
              <div className="space-y-2">
                {extras.certificates.map((c, i) => (
                  <div key={i} className="bg-[#E8F5F4] rounded-xl px-3 py-2.5 border border-[#199A8E]/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#104C48] font-bold bg-white px-2 py-0.5 rounded-full">{c.year}</span>
                      <p className="font-bold text-gray-800 text-sm text-right flex-1 ml-2">{c.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 text-right">{c.issuer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                اللغات<Languages size={15} className="text-[#199A8E]" />
              </h3>
              <div className="flex flex-wrap gap-2 justify-end">
                {extras.languages.map((lang, i) => (
                  <span key={i} className="bg-teal-50 text-teal-700 text-xs px-3 py-1.5 rounded-full font-medium">{lang}</span>
                ))}
              </div>
            </div>

            {/* Publications */}
            {extras.publications.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                  الأبحاث والمنشورات<FileText size={15} className="text-[#199A8E]" />
                </h3>
                <div className="space-y-2">
                  {extras.publications.map((p, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl px-3 py-2.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-gray-400 font-bold">{p.year}</span>
                        <p className="text-sm font-bold text-gray-800 text-right flex-1 ml-2">{p.title}</p>
                      </div>
                      <p className="text-xs text-gray-500 text-right">{p.journal}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Awards */}
            {extras.awards.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                الجوائز والتكريم<Award size={15} className="text-amber-500" />
                </h3>
                <div className="space-y-2">
                  {extras.awards.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2.5">
                      <Award size={14} className="text-amber-500 flex-shrink-0" />
                      <div className="flex-1 text-right">
                        <p className="text-sm font-bold text-gray-800">{a.title}</p>
                        <p className="text-xs text-gray-500">{a.issuer} — {a.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance & Memberships */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                  شركات التأمين المقبولة<Shield size={15} className="text-[#199A8E]" />
                </h3>
                <div className="flex flex-wrap gap-2 justify-end">
                  {extras.insuranceAccepted.map((ins, i) => (
                    <span key={i} className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-xl font-medium">{ins}</span>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                  العضويات المهنية<Users size={15} className="text-[#199A8E]" />
                </h3>
                <div className="space-y-1.5">
                  {extras.members.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 justify-end">
                      <p className="text-sm text-gray-600">{m}</p>
                      <Check size={13} className="text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                معلومات التواصل<Phone size={15} className="text-[#199A8E]" />
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="text-sm font-mono text-gray-700" dir="ltr">{extras.phone}</span>
                  <div className="flex items-center gap-2"><Phone size={14} className="text-[#199A8E]" /><span className="text-sm text-gray-600">الهاتف</span></div>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="text-sm font-mono text-gray-700" dir="ltr">{extras.email}</span>
                  <div className="flex items-center gap-2"><FileText size={14} className="text-[#199A8E]" /><span className="text-sm text-gray-600">البريد</span></div>
                </div>
              </div>
            </div>

            {/* Patient stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-[#E8F5F4] to-teal-50 rounded-2xl p-4 text-center">
                <Users size={20} className="mx-auto text-[#199A8E] mb-1" />
                <p className="text-xl font-black text-gray-800">{extras.totalPatients.toLocaleString('ar')}</p>
                <p className="text-xs text-gray-500">إجمالي المرضى</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center">
                <TrendingUp size={20} className="mx-auto text-green-500 mb-1" />
                <p className="text-xl font-black text-gray-800">{extras.successRate}%</p>
                <p className="text-xs text-gray-500">نسبة الشفاء</p>
              </div>
            </div>

            {/* Clinic location */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                مكان العيادة<Building2 size={15} className="text-[#199A8E]" />
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="text-sm text-gray-600">{qd.distKm} كم</span>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#199A8E]" />
                    <span className="text-sm font-medium text-gray-700">{selectedDoctor.clinic?.address || '—'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                  <span className="text-sm text-gray-600">العيادة</span>
                  <span className="text-sm font-bold text-gray-800">{selectedDoctor.clinic?.name || '—'}</span>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#E8F5F4] text-[#199A8E] font-bold text-sm">
                  <Navigation size={15} />الاتجاهات للعيادة
                </button>
              </div>
            </div>

            {/* Working days & hours */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                أيام وساعات الدوام<CalendarDays size={15} className="text-[#199A8E]" />
              </h3>
              {/* Days */}
              <div className="flex flex-wrap gap-1.5 mb-3 justify-end">
                {ALL_DAYS.map(day => {
                  const isWorking = selectedDoctor.working_days?.includes(day);
                  return (
                    <span key={day} className={`text-xs px-2.5 py-1.5 rounded-lg font-medium ${isWorking ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-300 line-through'}`}>
                      {DAY_LABELS[day]}
                    </span>
                  );
                })}
              </div>
              {/* Hours */}
              <div className="space-y-2">
                {selectedDoctor.working_hours?.morning && (
                  <div className="flex items-center justify-between bg-amber-50 rounded-xl px-3 py-2.5">
                    <span className="text-sm font-bold text-gray-700">{selectedDoctor.working_hours.morning.start} - {selectedDoctor.working_hours.morning.end}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-600 font-medium">صباحي</span>
                      <Clock size={14} className="text-amber-500" />
                    </div>
                  </div>
                )}
                {selectedDoctor.working_hours?.evening && (
                  <div className="flex items-center justify-between bg-[#E8F5F4] rounded-xl px-3 py-2.5">
                    <span className="text-sm font-bold text-gray-700">{selectedDoctor.working_hours.evening.start} - {selectedDoctor.working_hours.evening.end}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#104C48] font-medium">مسائي</span>
                      <Clock size={14} className="text-[#199A8E]" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Queue info */}
            <div className="bg-[#E8F5F4] rounded-2xl p-4 border border-[#199A8E]/30">
              <div className="flex items-center justify-between mb-3">
                <Timer size={18} className="text-[#199A8E]" />
                <p className="font-bold text-gray-800 text-sm">حالة الطابور الآن</p>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs">احضر تقريباً الساعة</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{timeStr}</p>
                  <p className="text-gray-400 text-xs mt-1">~ {Math.floor(totalWaitMinutes / 60)} س و {totalWaitMinutes % 60} د</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-500 text-xs">رقمك المتوقع</p>
                  <p className="text-2xl font-bold text-[#199A8E] mt-1">#{myQueueNumber}</p>
                  <p className="text-gray-400 text-xs mt-1">{qd.waiting} قبلك</p>
                </div>
              </div>
            </div>

            {/* Fee */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <span className="text-[#199A8E] font-black text-lg">{(selectedDoctor.consultation_fee ?? selectedDoctor.price ?? 3000).toLocaleString()} ر.ي</span>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">رسوم الكشف</span>
              </div>
            </div>

              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── Search/List View ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gradient-to-br from-[#0B337A] via-[#08285F] to-[#00B39F] pb-6 px-4 pt-10">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={22} className="text-white rotate-180" />
          </button>
          <h1 className="text-white font-bold text-lg">البحث عن طبيب</h1>
          <div className="w-10" />
        </div>
        <div className="bg-white rounded-2xl flex items-center px-4 py-3 gap-3 mt-2 shadow-lg">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو التخصص..."
            className="flex-1 text-gray-700 placeholder-gray-400 outline-none text-sm"
          />
          <button
            type="button"
            onClick={() => {
              setTranscribeTarget('search');
              setShowTranscribe(true);
            }}
            className="p-2 rounded-xl bg-gradient-to-br from-[#0B337A] to-[#00B39F] text-white hover:opacity-90 active:scale-95 transition flex-shrink-0 shadow-xs"
            title="بحث صوتي (Gemini 3.5 Transcribe)"
          >
            <Mic size={17} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
          <button onClick={() => setSelectedSpec('')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedSpec ? 'bg-[#199A8E] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            الكل
          </button>
          {specializations.map((s) => (
            <button key={s.id} onClick={() => setSelectedSpec(s.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSpec === s.id ? 'bg-[#199A8E] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {s.name_ar}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-4">{filteredDoctors.length} طبيب متاح</p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#199A8E]" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDoctors.map((doctor) => {
              const qd = queueData[doctor.id] || { waiting: 5, distKm: 2.0, waitMin: 10 };
              return (
                <button key={doctor.id} onClick={() => openProfile(doctor)}
                  className="w-full bg-white rounded-2xl shadow-soft p-4 border border-gray-100 text-right">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 justify-end">
                        <h3 className="font-bold text-gray-900 text-base">{doctor.full_name}</h3>
                      </div>
                      <p className="text-gray-500 text-sm mt-0.5">{doctor.specialization?.name_ar} • {doctor.clinic?.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Star size={14} className="text-yellow-400" fill="currentColor" />
                        <span className="text-sm font-bold text-gray-700">{doctor.rating}</span>
                        <span className="text-gray-400 text-xs">({doctor.total_reviews})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="flex items-center gap-1 bg-[#E8F5F4] rounded-lg px-2 py-1">
                          <MapPin size={11} className="text-[#199A8E]" />
                          <span className="text-xs text-[#199A8E] font-medium">{qd.distKm} كم</span>
                        </div>
                        <div className="flex items-center gap-1 bg-teal-50 rounded-lg px-2 py-1">
                          <Clock size={11} className="text-teal-600" />
                          <span className="text-xs text-teal-600 font-medium">~{qd.waitMin}د</span>
                        </div>
                        <span className="text-xs text-gray-500">{qd.waiting} في الانتظار</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-[#104C48] to-[#199A8E] flex-shrink-0">
                      <img src={doctorPhotos[doctor.id]} alt={doctor.full_name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[#199A8E] font-bold">{(doctor.consultation_fee ?? doctor.price ?? 3000).toLocaleString()} ر.ي</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Stethoscope size={12} />اضغط للتفاصيل
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showProfileModal && renderProfileModal()}

      {/* Audio Transcription Modal */}
      <AudioTranscribeModal
        isOpen={showTranscribe}
        onClose={() => setShowTranscribe(false)}
        onApplyText={(text) => {
          if (transcribeTarget === 'search') {
            setSearchQuery(text);
          } else {
            setBookingDetails((prev) => (prev ? `${prev}\n${text}` : text));
          }
        }}
        title={transcribeTarget === 'search' ? 'بحث صوتي ذكي' : 'تسجيل الأعراض صوتياً'}
        contextHint={
          transcribeTarget === 'search'
            ? 'تحدث باسم الطبيب أو التخصص أو المدينة (مثل: د. أحمد المقطري، قلب وأوعية دموية)'
            : 'صف حالتك أو الشكوى المرضية ليتم تفريغها وإرفاقها في طلب الحجز'
        }
      />
    </div>
  );
}
