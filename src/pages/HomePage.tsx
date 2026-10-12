import React, { useState } from 'react';
import {
  Search,
  Bell,
  MapPin,
  ChevronLeft,
  Stethoscope,
  Heart,
  Home,
  Pill,
  BookOpen,
  Syringe,
  Droplets,
  BellRing,
  UserCog,
  AlertTriangle,
  Newspaper,
  Sparkles,
  FileText,
  HeartPulse,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { YemenAfiaLogo } from '../components/common/YemenAfiaLogo';
import { AudioTranscribeModal } from '../components/common/AudioTranscribeModal';
import { Mic } from 'lucide-react';

interface HomePageProps {
  onNavigate?: (page: string, data?: unknown) => void;
}

const quickServices = [
  { id: 'clinics', icon: Stethoscope, gradient: 'from-sky-400 to-blue-500', bg: 'bg-sky-50', color: 'text-sky-600', title: 'العيادات الاستشارية', desc: 'احجز طبيب واستشر' },
  { id: 'blood-search', icon: Droplets, gradient: 'from-red-400 to-rose-500', bg: 'bg-red-50', color: 'text-red-500', title: 'البحث عن دم', desc: 'ابحث عن دم متاح' },
  { id: 'medical-facilities', icon: Heart, gradient: 'from-rose-400 to-pink-500', bg: 'bg-rose-50', color: 'text-rose-600', title: 'المنشآت الطبية', desc: 'مستشفيات وصيدليات' },
  { id: 'medication-reminders', icon: BellRing, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', color: 'text-amber-600', title: 'تذكيرات الدواء', desc: 'متابعة الأدوية' },
];

const extraServices = [
  { id: 'electronic-prescription', icon: FileText, gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50', color: 'text-emerald-600', title: 'الوصفة الإلكترونية', desc: 'وصفاتي ورموز QR' },
  { id: 'medical-news', icon: Newspaper, gradient: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50', color: 'text-blue-600', title: 'أخبار طبية', desc: 'مقالات وتحديثات' },
  { id: 'pharmacy', icon: Pill, gradient: 'from-cyan-400 to-sky-500', bg: 'bg-cyan-50', color: 'text-cyan-600', title: 'صيدليتي', desc: 'طلب دواء وتوصيل' },
  { id: 'nursing', icon: Home, gradient: 'from-green-400 to-emerald-500', bg: 'bg-green-50', color: 'text-green-600', title: 'خدمات منزلية', desc: 'حقن، محاليل، مجارحة' },
  { id: 'medication-guide', icon: BookOpen, gradient: 'from-violet-400 to-purple-500', bg: 'bg-violet-50', color: 'text-violet-600', title: 'دليل الأدوية', desc: 'جرعات وموانع' },
  { id: 'chronic-disease', icon: HeartPulse, gradient: 'from-pink-400 to-rose-500', bg: 'bg-pink-50', color: 'text-pink-600', title: 'الأمراض المزمنة', desc: 'الضغط والسكري' },
  { id: 'tracking', icon: Activity, gradient: 'from-teal-400 to-cyan-500', bg: 'bg-teal-50', color: 'text-teal-600', title: 'متابعات', desc: 'قياساتي والحمل والجلسات' },
  { id: 'family', icon: UserCog, gradient: 'from-slate-400 to-gray-500', bg: 'bg-slate-50', color: 'text-slate-600', title: 'أفراد العائلة', desc: 'أدر مواعيد عائلتك' },
  { id: 'health-record', icon: Heart, gradient: 'from-red-400 to-red-500', bg: 'bg-red-50', color: 'text-red-600', title: 'السجل الصحي', desc: 'بطاقة الطوارئ' },
];

export function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTranscribe, setShowTranscribe] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Hero Header with official Yemen Afia brand gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0B337A] via-[#08285F] to-[#00B39F] pt-10 pb-28 px-5">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-10" />

        <div className="relative flex items-center justify-between mb-4">
          <button className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center relative border border-white/20 transition active:scale-95">
            <Bell size={20} className="text-white" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#00B39F] rounded-full border-2 border-[#0B337A]" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white/70 text-xs font-medium">مرحباً بك {user ? user.full_name?.split(' ')[0] : ''}</p>
              <h1 className="text-white text-lg font-black mt-0.5">يمن عافية لصحتك</h1>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2 border border-white/20 flex items-center justify-center shadow-sm">
              <YemenAfiaLogo variant="symbol" size="sm" />
            </div>
          </div>
        </div>
        <div className="relative flex items-center justify-between text-white/80 text-xs">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#00B39F]" />
            <span>صنعاء — حي حدة</span>
          </div>
          <span className="bg-white/15 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
            المنصة الصحية المتكاملة
          </span>
        </div>
      </div>

      {/* Floating Search + AI Voice Transcription */}
      <div className="px-4 -mt-16 relative z-10 space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate?.('doctor-search')}
            className="flex-1 bg-white rounded-2xl shadow-xl shadow-slate-200/60 flex items-center px-4 py-4 gap-3 border border-slate-100 transition-transform active:scale-[0.98]"
          >
            <Search size={20} className="text-slate-400 flex-shrink-0" />
            <span className="flex-1 text-slate-400 text-sm text-right">ابحث عن طبيب أو منشأة أو دواء...</span>
          </button>

          <button
            onClick={() => setShowTranscribe(true)}
            className="h-[52px] w-[52px] rounded-2xl bg-gradient-to-br from-[#0B337A] to-[#00B39F] flex items-center justify-center text-white shadow-xl shadow-[#00B39F]/30 active:scale-95 transition flex-shrink-0"
            title="تفريغ صوتي بالمايكروفون (Gemini 3.5 Transcribe)"
          >
            <Mic size={22} />
          </button>
        </div>

        {/* AI Assistant Card */}
        <button
          onClick={() => onNavigate?.('ai-assistant')}
          className="w-full bg-gradient-to-l from-sky-50 to-teal-50 rounded-2xl px-4 py-4 flex items-center justify-between border border-sky-100 transition-transform active:scale-[0.98] group"
        >
          <ChevronLeft size={20} className="text-sky-500 group-hover:translate-x-[-4px] transition-transform" />
          <div className="text-right flex-1 mx-3">
            <p className="font-bold text-slate-800">المساعد الذكي</p>
            <p className="text-slate-500 text-sm mt-0.5">صف أعراضك ونقترح لك التخصص المناسب</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-200">
            <Sparkles size={24} className="text-white" />
          </div>
        </button>
      </div>

      {/* Emergency Banner */}
      <div className="px-4 mt-4">
        <button
          onClick={() => onNavigate?.('emergency')}
          className="w-full bg-gradient-to-l from-red-50 to-rose-50 border border-red-100 rounded-2xl px-4 py-4 flex items-center gap-3 transition-transform active:scale-[0.98]"
        >
          <AlertTriangle size={22} className="text-red-400 flex-shrink-0" />
          <div className="flex-1 text-right">
            <p className="font-bold text-red-700">طوارئ المستشفيات</p>
            <p className="text-red-400 text-sm">مستشفيات صنعاء والأقرب إليك</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-200">
            <Syringe size={22} className="text-white" />
          </div>
        </button>
      </div>

      {/* Quick Services 2x2 */}
      <div className="px-4 mt-5">
        <div className="grid grid-cols-2 gap-3">
          {quickServices.map((service, idx) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onNavigate?.(service.id)}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md shadow-slate-100 border border-slate-50 transition-all active:scale-95 hover:shadow-lg hover:-translate-y-0.5 text-right"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{service.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 truncate">{service.desc}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Icon size={20} className="text-white" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* All Services */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <button className="text-sky-600 text-sm font-medium">عرض الكل</button>
          <p className="font-bold text-slate-800 text-base">جميع الخدمات</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {extraServices.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => onNavigate?.(service.id)}
                className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-md shadow-slate-100 border border-slate-50 transition-all active:scale-95 hover:shadow-lg hover:-translate-y-0.5 text-right"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{service.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 truncate">{service.desc}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Icon size={20} className="text-white" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio Transcription Modal with gemini-3.5-transcribe */}
      <AudioTranscribeModal
        isOpen={showTranscribe}
        onClose={() => setShowTranscribe(false)}
        onApplyText={(text) => onNavigate?.('doctor-search', { query: text })}
      />
    </div>
  );
}
