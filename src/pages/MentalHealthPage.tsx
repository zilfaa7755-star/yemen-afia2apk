import React, { useState } from 'react';
import {
  ChevronLeft,
  Brain,
  Heart,
  Shield,
  Lock,
  Star,
  Clock,
  Video,
  MessageSquare,
  Phone,
  User,
  Calendar,
  CheckCircle,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Headphones,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface MentalHealthPageProps {
  onBack?: () => void;
}

interface Therapist {
  id: string;
  name: string;
  specialization: string;
  sessions_done: number;
  rating: number;
  review_count: number;
  price: number;
  available_today: boolean;
  languages: string[];
  approach: string[];
  avatar_color: string;
}

const therapists: Therapist[] = [
  { id: '1', name: 'د. منى الجابري', specialization: 'علم نفس إكلينيكي', sessions_done: 412, rating: 4.9, review_count: 185, price: 3500, available_today: true, languages: ['عربي'], approach: ['علاج معرفي سلوكي', 'تقليل التوتر'], avatar_color: 'from-purple-400 to-purple-600' },
  { id: '2', name: 'د. أحمد الربيعي', specialization: 'طب نفسي وعلاج إدمان', sessions_done: 638, rating: 4.7, review_count: 241, price: 4500, available_today: true, languages: ['عربي', 'إنجليزي'], approach: ['علاج دوائي', 'جلسات فردية'], avatar_color: 'from-blue-400 to-blue-600' },
  { id: '3', name: 'د. سارة الوهيبي', specialization: 'إرشاد أسري وزوجي', sessions_done: 289, rating: 4.8, review_count: 128, price: 3000, available_today: false, languages: ['عربي'], approach: ['علاج أسري', 'تواصل فعال'], avatar_color: 'from-rose-400 to-rose-600' },
  { id: '4', name: 'أ. خالد المقطري', specialization: 'إرشاد نفسي وتنمية ذات', sessions_done: 175, rating: 4.6, review_count: 67, price: 2000, available_today: true, languages: ['عربي'], approach: ['قبول وتعهد', 'يقظة ذهنية'], avatar_color: 'from-teal-400 to-teal-600' },
];

const selfHelpTopics = [
  { id: 'anxiety', title: 'التعامل مع القلق', icon: Brain, color: 'text-purple-500 bg-purple-50', articles: 8 },
  { id: 'stress', title: 'إدارة الضغط اليومي', icon: Sparkles, color: 'text-blue-500 bg-blue-50', articles: 6 },
  { id: 'sleep', title: 'تحسين النوم', icon: Clock, color: 'text-indigo-500 bg-indigo-50', articles: 5 },
  { id: 'grief', title: 'الحزن وخسارة العزيز', icon: Heart, color: 'text-rose-500 bg-rose-50', articles: 7 },
  { id: 'relations', title: 'العلاقات الصحية', icon: User, color: 'text-green-500 bg-green-50', articles: 9 },
  { id: 'selfesteem', title: 'تقدير الذات', icon: Shield, color: 'text-amber-500 bg-amber-50', articles: 6 },
];

const sessionTypes = [
  { id: 'video', icon: Video, label: 'كشف فيديو', desc: '45-60 دقيقة مرئية', color: 'bg-blue-100 text-blue-600' },
  { id: 'voice', icon: Phone, label: 'مكالمة صوتية', desc: '45 دقيقة هاتفية', color: 'bg-green-100 text-green-600' },
  { id: 'chat', icon: MessageSquare, label: 'محادثة نصية', desc: 'تواصل كتابي مرن', color: 'bg-purple-100 text-purple-600' },
];

export function MentalHealthPage({ onBack }: MentalHealthPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'therapists' | 'self-help' | 'my-sessions'>('therapists');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [bookingStep, setBookingStep] = useState<'type' | 'confirm' | 'done'>('type');
  const [sessionType, setSessionType] = useState('video');
  const [bookingNote, setBookingNote] = useState('');

  const handleBook = async () => {
    try {
      await supabase.from('mental_health_sessions').insert({
        patient_id: user?.id || 'demo',
        therapist_id: selectedTherapist?.id,
        therapist_name: selectedTherapist?.name,
        session_type: sessionType,
        notes: bookingNote,
        status: 'pending',
        price: selectedTherapist?.price,
        scheduled_at: new Date(Date.now() + 2 * 86400000).toISOString(),
      });
    } catch {}
    setBookingStep('done');
  };

  // Booking detail screen
  if (selectedTherapist) {
    const t = selectedTherapist;
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className={`bg-gradient-to-b ${t.avatar_color} pt-4 pb-20 px-4`}>
          <div className="flex items-center justify-between mb-6">
            <div className="w-10" />
            <h1 className="text-lg font-bold text-white">حجز جلسة</h1>
            <button onClick={() => { setSelectedTherapist(null); setBookingStep('type'); }} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronLeft size={22} className="text-white rotate-180" />
            </button>
          </div>
          <div className="text-center">
            <div className={`w-20 h-20 bg-gradient-to-br ${t.avatar_color} rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white shadow-lg`}>
              <User size={36} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">{t.name}</h2>
            <p className="text-white/80 text-sm">{t.specialization}</p>
          </div>
        </div>

        <div className="px-4 -mt-10 relative z-10 space-y-4">
          {bookingStep === 'done' ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">تم تأكيد الحجز!</h2>
              <p className="text-gray-500 text-sm mb-4">ستتلقى رسالة تأكيد قريباً. الجلسة بعد غد.</p>
              <div className="bg-green-50 rounded-xl p-4 mb-6 text-right">
                <p className="text-sm font-bold text-gray-700">{t.name}</p>
                <p className="text-sm text-gray-500">{sessionTypes.find(s => s.id === sessionType)?.label}</p>
                <p className="text-sm text-green-600 font-medium mt-1">{t.price.toLocaleString('ar')} ر.ي</p>
              </div>
              <button onClick={() => { setSelectedTherapist(null); setBookingStep('type'); }} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold">
                تم
              </button>
            </div>
          ) : bookingStep === 'confirm' ? (
            <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4">
              <h3 className="font-bold text-gray-800 text-right">ملاحظات للمعالج (اختياري)</h3>
              <textarea
                value={bookingNote}
                onChange={e => setBookingNote(e.target.value)}
                placeholder="ما الذي تريد التحدث عنه؟ (لن يطلع عليه أحد سوى المعالج)"
                rows={4}
                dir="rtl"
                className="w-full p-3 rounded-xl border border-gray-200 resize-none text-sm outline-none"
              />
              <div className="bg-amber-50 rounded-xl p-3 flex gap-2">
                <Lock size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700 text-xs text-right">محادثاتك مشفرة بالكامل ولا يطلع عليها أي طرف ثالث</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setBookingStep('type')} className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-medium">رجوع</button>
                <button onClick={handleBook} className="flex-1 py-3.5 rounded-2xl bg-purple-600 text-white font-bold">تأكيد الحجز</button>
              </div>
            </div>
          ) : (
            <>
              {/* Therapist info */}
              <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="font-black text-gray-800">{t.sessions_done}</p>
                    <p className="text-xs text-gray-500">جلسة</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-black text-gray-800">{t.rating}</span>
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    </div>
                    <p className="text-xs text-gray-500">{t.review_count} تقييم</p>
                  </div>
                  <div className={`rounded-xl p-3 ${t.available_today ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <p className={`font-black text-sm ${t.available_today ? 'text-green-600' : 'text-gray-400'}`}>
                      {t.available_today ? 'متاح' : 'محجوز'}
                    </p>
                    <p className="text-xs text-gray-500">اليوم</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {t.approach.map(a => (
                    <span key={a} className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-xl">{a}</span>
                  ))}
                </div>
              </div>

              {/* Session type */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-gray-800 text-sm mb-3 text-right">نوع الجلسة</h3>
                <div className="space-y-2">
                  {sessionTypes.map(st => (
                    <button
                      key={st.id}
                      onClick={() => setSessionType(st.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${sessionType === st.id ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-gray-50'}`}
                    >
                      <div className={`w-10 h-10 ${st.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <st.icon size={18} />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-bold text-gray-800 text-sm">{st.label}</p>
                        <p className="text-xs text-gray-500">{st.desc}</p>
                      </div>
                      {sessionType === st.id && <CheckCircle size={18} className="text-purple-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price + CTA */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-black text-gray-900">{t.price.toLocaleString('ar')} ر.ي</span>
                  <span className="text-gray-500 text-sm">سعر الجلسة</span>
                </div>
                <button onClick={() => setBookingStep('confirm')} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                  <Calendar size={18} />
                  احجز الجلسة
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-700 to-purple-900 pt-4 pb-24 px-4">
        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={22} className="text-white rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-white">الدعم النفسي</h1>
          <div className="w-10" />
        </div>

        {/* Privacy badge */}
        <div className="bg-white/15 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Lock size={20} className="text-white/80 flex-shrink-0" />
          <div className="text-right">
            <p className="text-white text-sm font-bold">سرية تامة</p>
            <p className="text-white/70 text-xs">جميع جلساتك ومحادثاتك مشفرة ومحمية</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-14 relative z-10 mb-4">
        <div className="bg-white rounded-2xl shadow-lg p-1.5 grid grid-cols-3 gap-1">
          {[
            { id: 'therapists', label: 'المعالجون' },
            { id: 'self-help', label: 'مساعدة ذاتية' },
            { id: 'my-sessions', label: 'جلساتي' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === id ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        {/* Therapists tab */}
        {activeTab === 'therapists' && (
          <div className="space-y-3">
            {therapists.map(t => (
              <button
                key={t.id}
                onClick={() => { setSelectedTherapist(t); setBookingStep('type'); }}
                className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-right"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-14 h-14 bg-gradient-to-br ${t.avatar_color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <User size={26} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      {t.available_today && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">متاح اليوم</span>
                      )}
                      <h3 className="font-bold text-gray-900 text-sm">{t.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500">{t.specialization}</p>
                    <div className="flex items-center gap-2 mt-1.5 justify-end">
                      <span className="text-xs text-gray-500">{t.sessions_done} جلسة</span>
                      <div className="flex items-center gap-0.5">
                        <span className="text-xs font-bold text-gray-700">{t.rating}</span>
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                      </div>
                      <span className="font-bold text-purple-600 text-sm">{t.price.toLocaleString('ar')} ر.ي</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5 justify-end">
                      {t.approach.slice(0, 2).map(a => (
                        <span key={a} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-lg">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Self-help tab */}
        {activeTab === 'self-help' && (
          <>
            {/* Breathing exercise banner */}
            <div className="bg-gradient-to-l from-purple-600 to-purple-800 rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between">
                <button className="bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-xl">
                  ابدأ الآن
                </button>
                <div className="text-right">
                  <p className="text-white font-bold">تمرين التنفس</p>
                  <p className="text-white/70 text-sm">5 دقائق للاسترخاء الفوري</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {selfHelpTopics.map(topic => {
                const Icon = topic.icon;
                return (
                  <button key={topic.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-right">
                    <div className={`w-12 h-12 ${topic.color.split(' ')[1]} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon size={22} className={topic.color.split(' ')[0]} />
                    </div>
                    <p className="font-bold text-gray-800 text-sm mb-0.5">{topic.title}</p>
                    <p className="text-xs text-gray-400">{topic.articles} مقالات</p>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* My sessions tab */}
        {activeTab === 'my-sessions' && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones size={36} className="text-purple-500" />
            </div>
            <p className="font-bold text-gray-700 text-lg mb-2">لا توجد جلسات بعد</p>
            <p className="text-gray-400 text-sm mb-6">احجز جلستك الأولى مع أحد معالجينا المتخصصين</p>
            <button onClick={() => setActiveTab('therapists')} className="bg-purple-600 text-white px-8 py-3.5 rounded-2xl font-bold">
              احجز جلسة الآن
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
