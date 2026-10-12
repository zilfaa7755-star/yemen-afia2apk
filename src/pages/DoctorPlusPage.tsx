import React, { useState } from 'react';
import {
  ChevronLeft,
  Crown,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Clock,
  Calendar,
  Video,
  Phone,
  MessageSquare,
  Heart,
  FileText,
  Bell,
  Users,
  ArrowRight,
  Sparkles,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DoctorPlusPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

type Plan = 'monthly' | 'quarterly' | 'annual';

const plans: Record<Plan, { label: string; price: number; originalPrice?: number; discount?: string; color: string }> = {
  monthly: { label: 'شهري', price: 990, color: 'from-slate-600 to-slate-800' },
  quarterly: { label: 'ربع سنوي', price: 2700, originalPrice: 2970, discount: '9%', color: 'from-[#1976D2] to-[#1565C0]' },
  annual: { label: 'سنوي', price: 7990, originalPrice: 11880, discount: '33%', color: 'from-amber-500 to-amber-700' },
};

const features = [
  { icon: Video, title: 'كشف فيديو مع طبيب', desc: 'استشارات مرئية فورية مع أطباء متخصصين', free: false, plus: true },
  { icon: MessageSquare, title: 'رسائل مع الطبيب', desc: 'تواصل نصي مباشر مع طبيبك في أي وقت', free: false, plus: true },
  { icon: Clock, title: 'أولوية في الطابور', desc: 'تخطَّ الانتظار بأولوية VIP في العيادة', free: false, plus: true },
  { icon: Bell, title: 'تذكيرات ذكية', desc: 'تذكير بالأدوية والمواعيد بالذكاء الاصطناعي', free: 'محدود', plus: true },
  { icon: FileText, title: 'سجل طبي شامل', desc: 'ملف طبي موحد لكل عائلتك', free: 'محدود', plus: true },
  { icon: Users, title: 'إدارة أفراد العائلة', desc: 'إضافة غير محدود لأفراد العائلة', free: '3 أفراد', plus: 'غير محدود' },
  { icon: Heart, title: 'متابعة المزمنين', desc: 'خطة متابعة مخصصة لمرضى السكري والضغط', free: false, plus: true },
  { icon: Calendar, title: 'حجوزات مرنة', desc: 'إلغاء وإعادة جدولة مجاناً', free: false, plus: true },
  { icon: Shield, title: 'بيانات موثوقة', desc: 'تشفير كامل وحماية خصوصيتك', free: true, plus: true },
  { icon: Star, title: 'خصومات حصرية', desc: 'خصم يصل 30% على الكشوفات في عيادات الشبكة', free: false, plus: true },
];

const faqs = [
  { q: 'هل يمكنني إلغاء الاشتراك في أي وقت؟', a: 'نعم، يمكنك إلغاء اشتراكك في أي وقت من إعدادات حسابك. لن يتجدد الاشتراك تلقائياً بعد الإلغاء.' },
  { q: 'كيف يتم الدفع؟', a: 'ندعم الدفع عبر MTN كاش، يمن موبايل، وكاش أون ديليفري.' },
  { q: 'هل يشمل الاشتراك جميع الأطباء؟', a: 'يشمل جميع الأطباء المنضمين لشبكة يمن عافية، ويتم توسيع الشبكة باستمرار.' },
  { q: 'ما الفرق بين الكشف المرئي والرسائل؟', a: 'الكشف المرئي هو مكالمة فيديو مجدولة لمدة 15-30 دقيقة. الرسائل هي تواصل نصي غير متزامن للأسئلة السريعة.' },
];

export function DoctorPlusPage({ onBack, onNavigate }: DoctorPlusPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  if (subscribed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-10">
        <div className="bg-gradient-to-b from-amber-500 to-amber-700 pt-16 pb-20 px-6 text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl">
            <Crown size={44} className="text-amber-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">مرحباً بك في بلس!</h1>
          <p className="text-white/80 text-base">اشتراكك الآن فعّال — استمتع بجميع المميزات</p>
        </div>

        <div className="px-4 -mt-10 z-10 relative space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="font-bold text-gray-800 text-lg mb-4 text-right">ابدأ الاستخدام</h2>
            {[
              { icon: Video, label: 'احجز كشف فيديو', action: () => onNavigate?.('clinics'), color: 'text-blue-500 bg-blue-50' },
              { icon: MessageSquare, label: 'راسل طبيبك', action: () => onNavigate?.('messages'), color: 'text-emerald-500 bg-emerald-50' },
              { icon: Users, label: 'أضف أفراد العائلة', action: () => onNavigate?.('family'), color: 'text-purple-500 bg-purple-50' },
              { icon: Heart, label: 'خطة المتابعة الصحية', action: () => {}, color: 'text-red-500 bg-red-50' },
            ].map(({ icon: Icon, label, action, color }) => (
              <button key={label} onClick={action} className="w-full flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                <ArrowRight size={16} className="text-gray-300" />
                <span className="flex-1 text-right font-medium text-gray-800 text-sm">{label}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} />
                </div>
              </button>
            ))}
          </div>
          <button onClick={onBack} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold text-lg shadow-lg">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const plan = plans[selectedPlan];

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Hero */}
      <div className={`bg-gradient-to-b ${plan.color} pt-4 pb-24 px-4`}>
        <div className="flex items-center justify-between mb-6">
          <div className="w-10" />
          <div className="flex items-center gap-2">
            <Crown size={22} className="text-white" />
            <h1 className="text-xl font-black text-white">طبيبي بلس</h1>
          </div>
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={22} className="text-white rotate-180" />
          </button>
        </div>
        <div className="text-center">
          <p className="text-white/80 text-base mb-2">رعاية صحية لك ولعائلتك</p>
          <p className="text-white/60 text-sm">أطباء، متابعة، وصفات — كل شيء في مكان واحد</p>
        </div>
      </div>

      <div className="px-4 -mt-14 relative z-10 space-y-5">
        {/* Plan selector */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex gap-2 mb-4">
            {(Object.entries(plans) as [Plan, typeof plans[Plan]][]).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all relative ${
                  selectedPlan === key
                    ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {p.discount && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    وفّر {p.discount}
                  </span>
                )}
                {p.label}
              </button>
            ))}
          </div>
          <div className="text-center bg-amber-50 rounded-2xl py-5 border border-amber-100">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-gray-400 text-sm">ر.ي</span>
              <span className="text-4xl font-black text-gray-900">{plan.price.toLocaleString('ar')}</span>
            </div>
            {plan.originalPrice && (
              <p className="text-gray-400 text-sm line-through mt-1">{plan.originalPrice.toLocaleString('ar')} ر.ي</p>
            )}
            <p className="text-gray-500 text-sm mt-1">/ {plan.label}</p>
          </div>
        </div>

        {/* Key features highlight */}
        <div className={`bg-gradient-to-br ${plan.color} rounded-2xl p-5 text-white`}>
          <h3 className="font-bold text-lg mb-4 text-center">ما ستحصل عليه</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Video, text: 'كشف فيديو' },
              { icon: Clock, text: 'أولوية VIP' },
              { icon: Users, text: 'عائلة غير محدودة' },
              { icon: Star, text: 'خصومات 30%' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2.5">
                <Icon size={16} className="text-white/90 flex-shrink-0" />
                <span className="text-sm font-medium text-white">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
            <div className="py-3 px-3 text-xs font-bold text-gray-400 text-right col-span-1">الميزة</div>
            <div className="py-3 text-xs font-bold text-gray-500 text-center">مجاني</div>
            <div className="py-3 text-xs font-bold text-amber-600 text-center flex items-center justify-center gap-1">
              <Crown size={12} />بلس
            </div>
          </div>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="grid grid-cols-3 border-b border-gray-50 last:border-0 items-center">
                <div className="py-3.5 px-3 flex items-center gap-2 col-span-1">
                  <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-amber-500" />
                  </div>
                  <div className="text-right min-w-0">
                    <p className="text-xs font-bold text-gray-800 leading-tight">{f.title}</p>
                  </div>
                </div>
                <div className="py-3.5 text-center">
                  {f.free === false ? (
                    <span className="text-gray-300 text-lg">✕</span>
                  ) : f.free === true ? (
                    <CheckCircle size={16} className="text-green-400 mx-auto" />
                  ) : (
                    <span className="text-xs text-gray-400">{f.free}</span>
                  )}
                </div>
                <div className="py-3.5 text-center">
                  {f.plus === true ? (
                    <CheckCircle size={16} className="text-amber-500 mx-auto" />
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">{f.plus}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <h3 className="font-bold text-gray-800 px-4 pt-4 pb-2 text-right">أسئلة شائعة</h3>
          {faqs.map((faq, i) => (
            <div key={i} className="border-t border-gray-50">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-right"
              >
                {expandedFaq === i ? (
                  <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                )}
                <span className="flex-1 font-medium text-gray-800 text-sm">{faq.q}</span>
              </button>
              {expandedFaq === i && (
                <div className="px-4 pb-3.5">
                  <p className="text-gray-500 text-sm text-right leading-relaxed bg-gray-50 rounded-xl p-3">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => setSubscribed(true)}
          className={`w-full py-5 rounded-2xl font-black text-xl text-white bg-gradient-to-l ${plan.color} shadow-xl flex items-center justify-center gap-3`}
        >
          <Crown size={24} />
          اشترك الآن — {plan.price.toLocaleString('ar')} ر.ي
        </button>
        <p className="text-center text-xs text-gray-400 pb-4">إلغاء مجاني في أي وقت • بدون رسوم خفية</p>
      </div>
    </div>
  );
}
