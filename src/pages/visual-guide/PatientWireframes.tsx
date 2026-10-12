import React from 'react';
import { PhoneFrame, StatusBar, WBox, WLine, WTitle, WMuted, WHeader, WBottomNav, WTabBar, WPill, WIconCircle, WButton } from './Wireframe';

// ═══════════════════════════════════════════════════════════════════════════
// 1. LOGIN — Role Selection
// ═══════════════════════════════════════════════════════════════════════════
export function LoginRoleScreen() {
  const roles = [
    { label: 'مريض', icon: '👤', color: 'bg-blue-50', text: 'text-[#2196F3]' },
    { label: 'طبيب', icon: '🩺', color: 'bg-green-50', text: 'text-green-600' },
    { label: 'سكرتاري', icon: '📋', color: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'ممرض/ة', icon: '💉', color: 'bg-teal-50', text: 'text-teal-600' },
    { label: 'منشأة طبية', icon: '🏥', color: 'bg-red-50', text: 'text-red-600' },
    { label: 'مدير النظام', icon: '🛡️', color: 'bg-gray-100', text: 'text-gray-800' },
  ];
  return (
    <PhoneFrame label="تسجيل الدخول — اختيار الدور">
      <div className="h-full bg-gradient-to-b from-[#2196F3] to-[#1565C0] flex flex-col">
        <StatusBar dark />
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-white rounded-2xl mx-auto flex items-center justify-center mb-1">
            <span className="text-[#2196F3] font-black text-xl">ع</span>
          </div>
          <h2 className="text-white font-black text-base">يمن عافية</h2>
          <p className="text-white/60 text-[8px]">المنصة الصحية المتكاملة</p>
        </div>
        <div className="flex-1 bg-white rounded-t-3xl p-3 overflow-y-auto">
          <p className="text-center text-[11px] font-bold text-gray-800 mb-3">اختر نوع الحساب</p>
          <div className="space-y-2">
            {roles.map((r) => (
              <div key={r.label} className="bg-gray-50 rounded-xl p-2.5 flex items-center gap-2 border border-gray-100">
                <div className={`w-8 h-8 ${r.color} rounded-lg flex items-center justify-center text-sm`}>{r.icon}</div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-800">{r.label}</p>
                  <p className="text-[7px] text-gray-400">وصف الدور</p>
                </div>
                <span className="text-gray-300 text-xs">‹</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. LOGIN — Phone Input
// ═══════════════════════════════════════════════════════════════════════════
export function LoginPhoneScreen() {
  return (
    <PhoneFrame label="تسجيل الدخول — رقم الهاتف">
      <div className="h-full bg-gradient-to-b from-[#2196F3] to-[#1565C0] flex flex-col">
        <StatusBar dark />
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-white rounded-2xl mx-auto flex items-center justify-center mb-1">
            <span className="text-[#2196F3] font-black text-xl">ع</span>
          </div>
          <h2 className="text-white font-black text-base">يمن عافية</h2>
        </div>
        <div className="flex-1 bg-white rounded-t-3xl p-4">
          <div className="text-center mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl mx-auto flex items-center justify-center mb-2">📱</div>
            <h3 className="text-[12px] font-bold text-gray-800">أدخل رقم هاتفك</h3>
            <p className="text-[8px] text-gray-400">سيتم إكمال ملفك الصحي في الخطوة التالية</p>
          </div>
          <div className="relative mb-3">
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 border-l border-gray-200 pl-2">
              <span>🇾🇪</span>
              <span className="text-[9px] text-gray-600">+967</span>
            </div>
            <div className="w-full pr-16 pl-3 py-3 rounded-xl border-2 border-gray-200 bg-gray-50">
              <span className="text-[10px] text-gray-300">777123456</span>
            </div>
          </div>
          <WButton label="متابعة" />
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. LOGIN — Medical Profile
// ═══════════════════════════════════════════════════════════════════════════
export function LoginProfileScreen() {
  return (
    <PhoneFrame label="تسجيل الدخول — الملف الصحي">
      <div className="h-full bg-gradient-to-b from-[#2196F3] to-[#1565C0] flex flex-col">
        <StatusBar dark />
        <div className="flex-1 bg-white rounded-t-3xl p-3 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-xs">❤️</div>
            <div>
              <p className="text-[10px] font-bold text-gray-800">ملفك الصحي</p>
              <p className="text-[7px] text-gray-400">تساعد الطبيب على تقديم رعاية أفضل</p>
            </div>
          </div>
          <div className="flex gap-1 mb-3">
            <div className="flex-1 h-1 rounded-full bg-[#2196F3]" />
            <div className="flex-1 h-1 rounded-full bg-[#2196F3]" />
            <div className="flex-1 h-1 rounded-full bg-[#2196F3]" />
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[8px] font-semibold text-gray-600 mb-1">الاسم الكامل *</p>
              <div className="w-full p-2 rounded-lg border border-gray-200 bg-gray-50">
                <WLine w="w-20" />
              </div>
            </div>
            <div>
              <p className="text-[8px] font-semibold text-gray-600 mb-1">الجنس</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="py-2 rounded-lg border-2 border-[#2196F3] bg-blue-50 text-center text-[9px] text-[#2196F3] font-bold">ذكر</div>
                <div className="py-2 rounded-lg border-2 border-gray-200 text-center text-[9px] text-gray-500">أنثى</div>
              </div>
            </div>
            <div>
              <p className="text-[8px] font-semibold text-gray-600 mb-1">🩸 فصيلة الدم</p>
              <div className="grid grid-cols-4 gap-1">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt, i) => (
                  <div key={bt} className={`py-1.5 rounded-lg border-2 text-center text-[8px] font-bold ${i === 0 ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500'}`}>{bt}</div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[8px] font-semibold text-gray-600 mb-1">الأمراض المزمنة</p>
              <div className="flex flex-wrap gap-1">
                {['السكري', 'ضغط الدم', 'القلب', 'الربو'].map((d, i) => (
                  <span key={d} className={`text-[7px] px-2 py-0.5 rounded-full border ${i < 2 ? 'bg-orange-100 border-orange-300 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>{d}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[8px] font-semibold text-gray-600 mb-1">⚠️ الحساسية من الأدوية</p>
              <div className="flex flex-wrap gap-1">
                {['البنسلين', 'الأسبرين'].map((a) => (
                  <span key={a} className="text-[7px] px-2 py-0.5 rounded-full bg-red-100 border border-red-300 text-red-700">{a}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <div className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-center text-[9px] text-gray-500">تخطى</div>
            <div className="flex-1 py-2.5 rounded-xl bg-[#2196F3] text-white text-center text-[9px] font-bold">حفظ والمتابعة</div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. HOME PAGE
// ═══════════════════════════════════════════════════════════════════════════
export function HomeScreen() {
  const quickServices = [
    { icon: '🩺', bg: 'bg-blue-100', title: 'العيادات', desc: 'احجز طبيب' },
    { icon: '🩸', bg: 'bg-red-50', title: 'التبرع بالدم', desc: 'أنقذ حياة' },
    { icon: '🎁', bg: 'bg-amber-100', title: 'نقاطي', desc: 'اكسب نقاط' },
    { icon: '🔔', bg: 'bg-violet-100', title: 'تذكيرات', desc: 'متابعة الأدوية' },
  ];
  const extraServices = [
    { icon: '📋', title: 'الوصفة الإلكترونية' },
    { icon: '📰', title: 'أخبار طبية' },
    { icon: '💊', title: 'صيدليتي' },
    { icon: '🏠', title: 'خدمات منزلية' },
    { icon: '👑', title: 'طبيبي بلس' },
    { icon: '📖', title: 'دليل الأدوية' },
    { icon: '🧠', title: 'الدعم النفسي' },
    { icon: '👨‍👩‍👦', title: 'أفراد العائلة' },
    { icon: '❤️', title: 'السجل الصحي' },
    { icon: '📰', title: 'أخبار طبية' },
  ];
  return (
    <PhoneFrame label="الصفحة الرئيسية">
      <div className="h-full bg-gray-50 overflow-y-auto pb-14">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] px-3 pt-2 pb-10">
          <div className="flex items-center justify-between mb-2">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">🔔</div>
            <div className="text-right">
              <p className="text-white/70 text-[8px]">السلام عليكم</p>
              <p className="text-white text-[11px] font-bold">كيف نخدمك اليوم؟</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-white/70 text-[8px]">📍 صنعاء — حي حدة</div>
        </div>
        <div className="px-3 -mt-8 relative z-10">
          <div className="bg-white rounded-xl shadow-lg flex items-center px-3 py-2.5 gap-2">
            <span className="text-gray-300 text-xs">🔍</span>
            <span className="text-[9px] text-gray-400">ابحث عن طبيب أو خدمة...</span>
          </div>
          <div className="mt-2 bg-gradient-to-l from-[#E3F8F8] to-[#D1F2FF] rounded-xl px-3 py-2.5 flex items-center justify-between border border-cyan-100">
            <span className="text-[#2196F3] text-xs">‹</span>
            <div className="text-right flex-1 mx-2">
              <p className="text-[9px] font-bold text-gray-800">المساعد الذكي</p>
              <p className="text-[7px] text-gray-500">صف أعراضك ونقترح لك التخصص</p>
            </div>
            <div className="w-8 h-8 bg-[#2196F3] rounded-lg flex items-center justify-center">✨</div>
          </div>
        </div>
        <div className="px-3 mt-3">
          <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <span className="text-red-400 text-sm">⚠️</span>
            <div className="flex-1 text-right">
              <p className="text-[9px] font-bold text-red-700">طوارئ المستشفيات</p>
              <p className="text-[7px] text-red-400">مستشفيات صنعاء والأقرب إليك</p>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white text-sm">🚑</div>
          </div>
        </div>
        <div className="px-3 mt-3">
          <div className="grid grid-cols-2 gap-2">
            {quickServices.map((s) => (
              <div key={s.title} className="bg-white rounded-xl p-2.5 flex items-center gap-2 shadow-sm border border-gray-100">
                <div className="flex-1 text-right">
                  <p className="text-[8px] font-bold text-gray-800">{s.title}</p>
                  <p className="text-[7px] text-gray-400">{s.desc}</p>
                </div>
                <div className={`w-7 h-7 ${s.bg} rounded-full flex items-center justify-center text-xs`}>{s.icon}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-3 mt-3">
          <p className="text-[9px] font-bold text-gray-800 mb-2">جميع الخدمات</p>
          <div className="grid grid-cols-2 gap-2">
            {extraServices.map((s) => (
              <div key={s.title} className="bg-white rounded-xl p-2.5 flex items-center gap-2 shadow-sm border border-gray-100">
                <div className="flex-1 text-right">
                  <p className="text-[8px] font-bold text-gray-800">{s.title}</p>
                </div>
                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs">{s.icon}</div>
              </div>
            ))}
          </div>
        </div>
        <WBottomNav active="home" />
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. AI ASSISTANT
// ═══════════════════════════════════════════════════════════════════════════
export function AIAssistantScreen() {
  return (
    <PhoneFrame label="المساعد الذكي">
      <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] px-3 py-2 flex items-center justify-between">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
          <h3 className="text-white text-[11px] font-bold">المساعد الذكي</h3>
          <div className="w-6" />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          <div className="flex justify-end">
            <div className="max-w-[80%] bg-white rounded-xl p-2.5 shadow-sm">
              <div className="flex items-start gap-1.5">
                <span className="text-[#2196F3] text-sm">🤖</span>
                <p className="text-[8px] text-gray-700">مرحباً! أنا المساعد الصحي الذكي. أخبرني بالأعراض التي تعاني منها وسأساعدك في تحديد التخصص.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-[#2196F3] text-white rounded-xl p-2.5">
              <div className="flex items-start gap-1.5">
                <span className="text-white text-sm">👤</span>
                <p className="text-[8px]">صداع وألم في الرأس منذ يومين</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[80%] bg-white rounded-xl p-2.5 shadow-sm">
              <p className="text-[8px] text-gray-700">بناءً على الأعراض (صداع، ألم رأس):</p>
              <p className="text-[8px] text-gray-700 mt-1">يُنصح بمراجعة طبيب الأعصاب لتشخيص سبب الصداع</p>
              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[#2196F3] text-xs">🩺</span>
                  <span className="text-[8px] font-bold text-[#2196F3]">طب الأعصاب</span>
                </div>
                <div className="bg-[#2196F3] text-white text-[7px] px-2 py-1 rounded-lg font-bold">حجز موعد ←</div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 bg-white border-t border-gray-100">
          <p className="text-[7px] text-gray-400 mb-1">الأعراض الشائعة:</p>
          <div className="flex flex-wrap gap-1">
            {['صداع وألم رأس', 'ألم بطن وغثيان', 'ضيق تنفس', 'طفح وحكة'].map((s) => (
              <span key={s} className="text-[7px] px-2 py-1 bg-gray-100 rounded-lg text-gray-600">{s}</span>
            ))}
          </div>
        </div>
        <div className="bg-white border-t border-gray-200 px-3 py-2 flex items-center gap-1">
          <div className="flex-1 bg-gray-100 rounded-lg px-2 py-2">
            <span className="text-[8px] text-gray-400">اشرح أعراضك هنا...</span>
          </div>
          <div className="w-8 h-8 bg-[#2196F3] rounded-lg flex items-center justify-center text-white text-xs">➤</div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. CLINICS PAGE
// ═══════════════════════════════════════════════════════════════════════════
export function ClinicsScreen() {
  const specs = ['باطنية', 'قلب', 'أعصاب', 'أطفال', 'عيون', 'عظام', 'أنف أذن', 'جلدية'];
  const doctors = [
    { name: 'د. أحمد المقطري', spec: 'باطنية عامة', clinic: 'مركز اليمن الطبي', rating: '4.2', wait: '4', time: '25د', dist: '1.0', price: '3,000' },
    { name: 'د. فاطمة الشامي', spec: 'قلب وأوعية', clinic: 'عيادات الشفاء', rating: '4.2', wait: '5', time: '25د', dist: '1.3', price: '4,200' },
    { name: 'د. خالد الإرياني', spec: 'مخ وأعصاب', clinic: 'مجمع الحياة', rating: '4.3', wait: '6', time: '20د', dist: '1.6', price: '4,500' },
  ];
  return (
    <PhoneFrame label="العيادات الاستشارية">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] px-3 pt-2 pb-10 sticky top-0">
          <StatusBar dark />
          <div className="flex items-center justify-between mb-2 mt-1">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">العيادات الاستشارية</h3>
            <div className="w-6" />
          </div>
          <div className="bg-white/95 rounded-xl flex items-center px-3 py-2 gap-2">
            <span className="text-gray-300 text-xs">🔍</span>
            <span className="text-[8px] text-gray-400 flex-1">ابحث عن طبيب أو تخصص...</span>
            <span className="text-gray-400 text-xs">⚙</span>
          </div>
        </div>
        <div className="px-3 -mt-6 relative z-10 mb-3">
          <div className="bg-white rounded-xl shadow-lg p-2.5">
            <p className="text-[8px] font-bold text-gray-700 mb-2">اختر التخصص</p>
            <div className="grid grid-cols-4 gap-1.5">
              {specs.map((s, i) => (
                <div key={s} className={`flex flex-col items-center gap-1 p-1.5 rounded-lg ${i === 0 ? 'bg-[#2196F3]/10 border border-[#2196F3]' : 'bg-gray-50 border border-transparent'}`}>
                  <div className={`w-6 h-6 ${i === 0 ? 'bg-[#2196F3]' : 'bg-blue-100'} rounded-full flex items-center justify-center text-[10px]`}>●</div>
                  <span className={`text-[7px] ${i === 0 ? 'text-[#2196F3]' : 'text-gray-600'}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-3 mb-2">
          <span className="text-[8px] text-gray-500">3 أطباء متاحين</span>
        </div>
        <div className="px-3 space-y-2 pb-4">
          {doctors.map((d) => (
            <div key={d.name} className="bg-white rounded-xl p-2.5 shadow-sm border border-gray-100">
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-0.5 mt-1">
                  <span className="text-[8px] font-bold text-gray-800">{d.rating}</span>
                  <span className="text-yellow-400 text-[8px]">★</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-gray-900 text-right">{d.name}</p>
                  <p className="text-[7px] text-gray-400 text-right">{d.spec} • {d.clinic}</p>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <span className="text-[7px] text-gray-400">{d.wait} في الانتظار</span>
                    <span className="text-[7px] bg-teal-50 text-teal-600 px-1 py-0.5 rounded">~{d.time}</span>
                    <span className="text-[7px] bg-blue-50 text-[#2196F3] px-1 py-0.5 rounded">📍 {d.dist}كم</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2196F3] to-[#1565C0] flex items-center justify-center text-white font-bold text-[10px]">أ</div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <div className="bg-[#2196F3] text-white text-[8px] px-3 py-1 rounded-lg font-bold">احجز الآن</div>
                <div className="text-left">
                  <span className="text-[7px] text-gray-400">سعر الكشف</span>
                  <p className="text-[8px] font-bold text-gray-800">{d.price} ر.ي</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. DOCTOR SEARCH — Profile Modal
// ═══════════════════════════════════════════════════════════════════════════
export function DoctorSearchScreen() {
  return (
    <PhoneFrame label="البحث عن الأطباء — ملف الطبيب">
      <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] px-3 py-2 flex items-center justify-between">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
          <h3 className="text-white text-[11px] font-bold">البحث عن طبيب</h3>
          <div className="w-6" />
        </div>
        <div className="bg-white px-3 py-2 flex gap-1.5 border-b border-gray-100">
          {['الكل', 'قلب', 'أعصاب', 'أطفال', 'عظام'].map((s, i) => (
            <div key={s} className={`px-2 py-1 rounded-full text-[7px] font-bold ${i === 0 ? 'bg-[#2196F3] text-white' : 'bg-gray-100 text-gray-500'}`}>{s}</div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2196F3] to-[#1565C0] flex items-center justify-center text-white font-bold text-xs">ف</div>
            <div className="flex-1 text-right">
              <p className="text-[9px] font-bold text-gray-900">د. فاطمة الشامي</p>
              <p className="text-[7px] text-gray-400">قلب وأوعية دموية</p>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <span className="text-[7px] text-yellow-500">★ 4.2</span>
                <span className="text-[7px] text-gray-400">• 95 تقييم</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] p-3 flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-base">ف</div>
              <div className="flex-1 text-right">
                <p className="text-white text-[10px] font-bold">د. فاطمة الشامي</p>
                <p className="text-white/70 text-[7px]">قلب وأوعية دموية • قسطرة قلبية</p>
                <p className="text-yellow-300 text-[7px]">★ 4.2 (95 تقييم)</p>
              </div>
            </div>
            <div className="flex border-b border-gray-100">
              {['الحجز', 'السيرة', 'التقييمات'].map((t, i) => (
                <div key={t} className={`flex-1 text-center py-2 text-[8px] font-bold ${i === 0 ? 'text-[#2196F3] border-b-2 border-[#2196F3]' : 'text-gray-400'}`}>{t}</div>
              ))}
            </div>
            <div className="p-3 space-y-2">
              <div>
                <p className="text-[7px] text-gray-400 mb-1">سبب الزيارة</p>
                <div className="w-full p-2 rounded-lg border border-gray-200 bg-gray-50"><WLine w="w-16" /></div>
              </div>
              <div>
                <p className="text-[7px] text-gray-400 mb-1">وسيلة الدفع</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[['محفظة', true], ['بطاقة', false], ['نقداً', false]].map(([l, a]) => (
                    <div key={l as string} className={`py-1.5 rounded-lg border-2 text-center text-[7px] font-bold ${a ? 'border-[#2196F3] bg-blue-50 text-[#2196F3]' : 'border-gray-200 text-gray-500'}`}>{l}</div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                <div className="flex justify-between text-[7px]"><span className="text-gray-400">سعر الكشف</span><span className="text-gray-700">4,200 ر.ي</span></div>
                <div className="flex justify-between text-[7px]"><span className="text-gray-400">رسوم الخدمة</span><span className="text-gray-700">200 ر.ي</span></div>
                <div className="flex justify-between text-[8px] font-bold pt-1 border-t border-gray-200"><span className="text-gray-700">الإجمالي</span><span className="text-[#2196F3]">4,400 ر.ي</span></div>
              </div>
              <WButton label="تأكيد الحجز" />
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. BOOKING PAGE
// ═══════════════════════════════════════════════════════════════════════════
export function BookingScreen() {
  return (
    <PhoneFrame label="صفحة الحجز — الأعراض">
      <div className="h-full bg-gradient-to-b from-[#2196F3] to-[#1976D2] flex flex-col">
        <StatusBar dark />
        <div className="flex items-center justify-between px-3 py-2">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
          <h3 className="text-white text-[11px] font-bold">حجز الموعد</h3>
          <div className="w-6" />
        </div>
        <div className="flex-1 bg-gray-50 rounded-t-3xl p-3 overflow-y-auto">
          <div className="flex gap-1 mb-3">
            <div className="flex-1 h-1 rounded-full bg-[#2196F3]" />
            <div className="flex-1 h-1 rounded-full bg-gray-200" />
            <div className="flex-1 h-1 rounded-full bg-gray-200" />
          </div>
          <div className="bg-white rounded-xl p-2.5 mb-3 flex items-center gap-2 border border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2196F3] to-[#1565C0] flex items-center justify-center text-white font-bold text-[10px]">أ</div>
            <div className="flex-1 text-right">
              <p className="text-[9px] font-bold text-gray-800">د. أحمد المقطري</p>
              <p className="text-[7px] text-gray-400">باطنية عامة • مركز اليمن الطبي</p>
            </div>
            <div className="bg-teal-50 rounded-lg px-2 py-1 text-center">
              <p className="text-[7px] text-teal-600">رقم الطابور</p>
              <p className="text-[10px] font-bold text-teal-700">5</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[8px] font-semibold text-gray-700 mb-1">الأعراض والشكاوى</p>
              <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-white h-16">
                <WLine w="w-full" />
                <div className="h-1" />
                <WLine w="w-24" />
              </div>
            </div>
            <div className="flex items-center justify-between bg-red-50 rounded-xl p-2.5 border border-red-100">
              <div className="text-right">
                <p className="text-[8px] font-bold text-red-700">حالة طارئة</p>
                <p className="text-[7px] text-red-400">فعّل إذا كانت الحالة عاجلة</p>
              </div>
              <div className="w-8 h-4 bg-red-500 rounded-full flex items-center justify-end px-0.5">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[8px] font-semibold text-gray-700 mb-1.5">وسيلة الدفع</p>
            <div className="space-y-1.5">
              {['MTN Cash', 'Yemen Mobile', 'تحويل بنكي', 'نقداً عند الوصول'].map((m, i) => (
                <div key={m} className={`flex items-center gap-2 p-2 rounded-xl border-2 ${i === 0 ? 'border-[#2196F3] bg-blue-50' : 'border-gray-200'}`}>
                  <div className={`w-3 h-3 rounded-full border-2 ${i === 0 ? 'border-[#2196F3] bg-[#2196F3]' : 'border-gray-300'}`} />
                  <span className={`text-[8px] flex-1 ${i === 0 ? 'text-[#2196F3] font-bold' : 'text-gray-600'}`}>{m}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <WButton label="متابعة ←" />
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. BOOKING CONFIRMATION (Ticket)
// ═══════════════════════════════════════════════════════════════════════════
export function BookingConfirmScreen() {
  return (
    <PhoneFrame label="تأكيد الحجز — التذكرة">
      <div className="h-full bg-gray-50 flex flex-col">
        <StatusBar />
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] px-3 py-2 flex items-center justify-between">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
          <h3 className="text-white text-[11px] font-bold">تم الحجز بنجاح</h3>
          <div className="w-6" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-green-600 text-xl">✓</span>
          </div>
          <p className="text-[10px] font-bold text-gray-800 mb-1">تم تأكيد حجزك!</p>
          <p className="text-[8px] text-gray-400 mb-4">رقم الطابور الخاص بك</p>
          <div className="bg-white rounded-2xl shadow-lg w-full p-3 border border-gray-100">
            <div className="text-center mb-2">
              <p className="text-[7px] text-gray-400">رقم الطابور</p>
              <p className="text-3xl font-black text-[#2196F3]">5</p>
            </div>
            <div className="border-t-2 border-dashed border-gray-200 my-2" />
            <div className="space-y-1">
              <div className="flex justify-between text-[7px]"><span className="text-gray-400">المرجع</span><span className="text-gray-700 font-mono">YH-7K3M9X2</span></div>
              <div className="flex justify-between text-[7px]"><span className="text-gray-400">الطبيب</span><span className="text-gray-700">د. أحمد المقطري</span></div>
              <div className="flex justify-between text-[7px]"><span className="text-gray-400">التاريخ</span><span className="text-gray-700">21 أغسطس 2026</span></div>
              <div className="flex justify-between text-[7px]"><span className="text-gray-400">الوقت</span><span className="text-gray-700">10:30 ص</span></div>
              <div className="flex justify-between text-[7px]"><span className="text-gray-400">العيادة</span><span className="text-gray-700">مركز اليمن الطبي</span></div>
            </div>
            <div className="border-t-2 border-dashed border-gray-200 my-2" />
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-4 gap-px">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 ${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-center text-[6px] text-gray-400 mt-1">YH-7K3M9X2</p>
          </div>
          <div className="flex gap-2 mt-3 w-full">
            <div className="flex-1 py-2 rounded-xl border border-gray-200 text-center text-[8px] text-gray-500">مشاركة</div>
            <div className="flex-1 py-2 rounded-xl bg-[#2196F3] text-white text-center text-[8px] font-bold">متابعة الطابور ←</div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. QUEUE TRACKING
// ═══════════════════════════════════════════════════════════════════════════
export function QueueTrackingScreen() {
  return (
    <PhoneFrame label="متابعة حالة الطابور">
      <div className="h-full bg-gray-50 flex flex-col">
        <StatusBar />
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] px-3 py-2 flex items-center justify-between">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
          <h3 className="text-white text-[11px] font-bold">متابعة الطابور</h3>
          <div className="w-6" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center mb-3">
            <p className="text-[8px] text-gray-400">رقمك في الطابور</p>
            <p className="text-5xl font-black text-green-500 my-1">5</p>
            <p className="text-[8px] text-gray-400">الرقم الحالي قيد الكشف: <span className="font-bold text-gray-700">2</span></p>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-gradient-to-r from-green-400 to-[#2196F3] rounded-full" />
            </div>
            <p className="text-[7px] text-gray-400 mt-1">2 من 5 مكتمل</p>
          </div>
          <div className="bg-teal-50 rounded-xl p-2.5 mb-3 text-center border border-teal-100">
            <p className="text-[9px] font-bold text-teal-700">اقترب دورك!</p>
            <p className="text-[7px] text-teal-600">يتبقى 3 أشخاص أمامك</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white rounded-xl p-2.5 text-center border border-gray-100">
              <p className="text-[7px] text-gray-400">الوقت المتبقي</p>
              <p className="text-[12px] font-bold text-[#2196F3]">~75 دقيقة</p>
            </div>
            <div className="bg-white rounded-xl p-2.5 text-center border border-gray-100">
              <p className="text-[7px] text-gray-400">الوصول المتوقع</p>
              <p className="text-[12px] font-bold text-gray-700">10:45 ص</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 mb-3">
            <p className="text-[8px] font-bold text-gray-700 mb-2">موقع العيادة</p>
            <div className="h-20 bg-blue-50 rounded-lg relative overflow-hidden">
              <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              <div className="absolute bottom-3 left-3 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-px bg-gray-300 rotate-12" />
              </div>
            </div>
            <div className="flex gap-1.5 mt-2">
              <div className="flex-1 py-1.5 rounded-lg bg-[#2196F3] text-white text-center text-[7px] font-bold">📍 الاتجاهات</div>
              <div className="flex-1 py-1.5 rounded-lg border border-gray-200 text-center text-[7px] text-gray-500">📞 اتصال</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 text-[7px] text-gray-400">
            <span>🔄</span><span>آخر تحديث: قبل دقيقة</span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. APPOINTMENTS
// ═══════════════════════════════════════════════════════════════════════════
export function AppointmentsScreen() {
  const appts = [
    { doc: 'د. أحمد المقطري', spec: 'باطنية عامة', date: '21 أغسطس', time: '10:30 ص', queue: '5', status: 'مؤكد', statusColor: 'bg-green-100 text-green-700' },
    { doc: 'د. فاطمة الشامي', spec: 'قلب وأوعية', date: '25 أغسطس', time: '02:00 م', queue: '3', status: 'قيد الكشف', statusColor: 'bg-blue-100 text-blue-700' },
    { doc: 'د. خالد الإرياني', spec: 'مخ وأعصاب', date: '15 أغسطس', time: '11:00 ص', queue: '1', status: 'مكتمل', statusColor: 'bg-gray-100 text-gray-600' },
  ];
  return (
    <PhoneFrame label="مواعيدي">
      <div className="h-full bg-gray-50 overflow-y-auto pb-14">
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] px-3 pt-2 pb-8">
          <StatusBar dark />
          <div className="flex items-center justify-between mt-1">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">مواعيدي</h3>
            <div className="w-6" />
          </div>
        </div>
        <div className="px-3 -mt-4 relative z-10 mb-3">
          <div className="flex gap-2">
            <div className="flex-1 bg-[#2196F3] text-white rounded-xl py-2 text-center text-[9px] font-bold shadow-lg">القادمة (2)</div>
            <div className="flex-1 bg-white text-gray-500 rounded-xl py-2 text-center text-[9px] font-bold border border-gray-100">السابقة (1)</div>
          </div>
        </div>
        <div className="px-3 space-y-2">
          {appts.map((a) => (
            <div key={a.doc} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`h-1 ${a.statusColor.split(' ')[0]}`} />
              <div className="p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[7px] px-2 py-0.5 rounded-full font-bold ${a.statusColor}`}>{a.status}</span>
                  <p className="text-[9px] font-bold text-gray-900">{a.doc}</p>
                </div>
                <p className="text-[7px] text-gray-400 text-right mb-2">{a.spec}</p>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <div className="text-center bg-gray-50 rounded-lg py-1">
                    <p className="text-[6px] text-gray-400">التاريخ</p>
                    <p className="text-[7px] font-bold text-gray-700">{a.date}</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg py-1">
                    <p className="text-[6px] text-gray-400">الوقت</p>
                    <p className="text-[7px] font-bold text-gray-700">{a.time}</p>
                  </div>
                  <div className="text-center bg-blue-50 rounded-lg py-1">
                    <p className="text-[6px] text-[#2196F3]">الطابور</p>
                    <p className="text-[7px] font-bold text-[#2196F3]">#{a.queue}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 py-1 rounded-lg bg-gray-100 text-center text-[7px] text-gray-500">📍 الاتجاهات</div>
                  <div className="flex-1 py-1 rounded-lg bg-gray-100 text-center text-[7px] text-gray-500">✏️ تعديل</div>
                  <div className="flex-1 py-1 rounded-lg bg-red-50 text-center text-[7px] text-red-500">إلغاء</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <WBottomNav active="appts" />
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. MESSAGES
// ═══════════════════════════════════════════════════════════════════════════
export function MessagesScreen() {
  return (
    <PhoneFrame label="الرسائل — محادثة مع الطبيب">
      <div className="h-full bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center justify-between">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xs">›</div>
          <div className="flex items-center gap-2">
            <div className="text-center">
              <p className="text-[9px] font-bold text-gray-800">د. أحمد المقطري</p>
              <p className="text-[7px] text-gray-400">باطنية عامة • مفتوحة</p>
            </div>
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2196F3] to-[#1565C0] flex items-center justify-center text-white font-bold text-[10px]">أ</div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
            </div>
          </div>
          <div className="w-6" />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          <div className="flex justify-end">
            <div className="max-w-[75%] bg-white border border-gray-100 rounded-xl px-2.5 py-2">
              <p className="text-[8px] text-gray-700 text-right">السلام عليكم دكتور، عندي ألم في الصدر منذ يومين</p>
              <p className="text-[6px] text-gray-300 mt-0.5 text-left">10:30 ص</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[75%] bg-[#2196F3] text-white rounded-xl px-2.5 py-2">
              <p className="text-[8px] text-right">وعليكم السلام، هل الألم حاد أم متوسط؟ هل يزيد مع المجهود؟</p>
              <p className="text-[6px] text-white/50 mt-0.5 text-left">10:32 ص</p>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[75%] bg-white border border-gray-100 rounded-xl px-2.5 py-2">
              <p className="text-[8px] text-gray-700 text-right">متوسط، يزيد عند المشي</p>
              <p className="text-[6px] text-gray-300 mt-0.5 text-left">10:33 ص</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 border-t border-amber-100 px-3 py-1">
          <p className="text-[7px] text-amber-600 text-center">⏰ المحادثة تنتهي خلال 45 دقيقة</p>
        </div>
        <div className="bg-white border-t border-gray-100 p-2 flex items-center gap-1">
          <span className="text-gray-400 text-sm">📎</span>
          <div className="flex-1 bg-gray-50 rounded-lg px-2 py-2"><span className="text-[8px] text-gray-400">اكتب رسالة...</span></div>
          <div className="w-8 h-8 bg-[#2196F3] rounded-lg flex items-center justify-center text-white text-xs">➤</div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 13. HEALTH RECORD
// ═══════════════════════════════════════════════════════════════════════════
export function HealthRecordScreen() {
  const records = [
    { type: 'تحاليل', icon: '🧪', color: 'bg-blue-50 text-blue-600', title: 'CBC — صورة دم كاملة', date: '10 أغسطس', tags: ['طبيعي'] },
    { type: 'أشعة', icon: '📸', color: 'bg-teal-50 text-teal-600', title: 'أشعة صدر', date: '5 يوليو', tags: ['سليمة'] },
    { type: 'وصفة', icon: '📋', color: 'bg-green-50 text-green-600', title: 'وصفة دواء الضغط', date: '20 يونيو', tags: ['نشطة'] },
    { type: 'تقرير', icon: '📄', color: 'bg-amber-50 text-amber-600', title: 'تقرير زيارة القلب', date: '15 مايو', tags: ['متابعة'] },
  ];
  return (
    <PhoneFrame label="السجل الصحي">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar />
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] px-3 py-2 flex items-center justify-between">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
          <h3 className="text-white text-[11px] font-bold">السجل الصحي</h3>
          <div className="w-6" />
        </div>
        <div className="p-3">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[['4', 'إجمالي'], ['2', 'تحاليل'], ['1', 'أشعة']].map(([n, l]) => (
              <div key={l} className="bg-white rounded-xl p-2 text-center border border-gray-100">
                <p className="text-lg font-bold text-[#2196F3]">{n}</p>
                <p className="text-[7px] text-gray-400">{l}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mb-3">
            {['الكل', 'تحاليل', 'أشعة', 'وصفات', 'تقارير'].map((f, i) => (
              <div key={f} className={`px-2 py-1 rounded-full text-[7px] font-bold ${i === 0 ? 'bg-[#2196F3] text-white' : 'bg-gray-100 text-gray-500'}`}>{f}</div>
            ))}
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-2.5 text-center mb-3">
            <span className="text-gray-400 text-sm">＋</span>
            <p className="text-[7px] text-gray-400">إضافة سجل جديد</p>
          </div>
          <div className="space-y-2">
            {records.map((r) => (
              <div key={r.title} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-start gap-2">
                  <div className={`w-8 h-8 ${r.color} rounded-lg flex items-center justify-center text-sm`}>{r.icon}</div>
                  <div className="flex-1 text-right">
                    <p className="text-[8px] font-bold text-gray-800">{r.title}</p>
                    <p className="text-[7px] text-gray-400">{r.date}</p>
                    <div className="flex gap-1 justify-end mt-1">
                      {r.tags.map((t) => <span key={t} className="text-[6px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{t}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                  <div className="flex-1 py-1 rounded-lg bg-gray-100 text-center text-[7px] text-gray-500">⬇ تحميل</div>
                  <div className="flex-1 py-1 rounded-lg bg-blue-50 text-center text-[7px] text-[#2196F3]">↗ مشاركة</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 14. MORE / SETTINGS
// ═══════════════════════════════════════════════════════════════════════════
export function MoreScreen() {
  const menuItems = [
    ['👤', 'الملف الشخصي', 'بياناتك الشخصية'],
    ['❤️', 'السجل الصحي', 'سجلاتك الطبية'],
    ['🔔', 'الإشعارات', 'إعدادات التنبيهات'],
    ['📍', 'الموقع', 'موقعك الحالي'],
    ['💳', 'الدفع', 'وسائل الدفع'],
    ['📜', 'الشروط والأحكام', ''],
    ['🔒', 'الخصوصية', ''],
    ['❓', 'المساعدة', ''],
  ];
  return (
    <PhoneFrame label="المزيد — الإعدادات">
      <div className="h-full bg-gray-50 overflow-y-auto pb-14">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] px-3 pt-2 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">م</div>
            <div className="flex-1 text-right">
              <p className="text-white text-[10px] font-bold">محمد أحمد</p>
              <p className="text-white/60 text-[7px]">+967 777123456</p>
            </div>
          </div>
        </div>
        <div className="px-3 -mt-3 relative z-10 mb-3">
          <div className="bg-white rounded-xl shadow-lg p-2.5 flex items-center gap-2 border border-gray-100">
            <div className="flex-1 text-right">
              <p className="text-[7px] text-gray-400">رمز المريض</p>
              <p className="text-[9px] font-bold text-gray-800 font-mono">YP-2026-001234</p>
            </div>
            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-[8px] text-gray-500">📋</div>
          </div>
        </div>
        <div className="px-3 space-y-1.5">
          {menuItems.map(([icon, title, desc]) => (
            <div key={title} className="bg-white rounded-xl p-2.5 flex items-center gap-2 border border-gray-100">
              <div className="flex-1 text-right">
                <p className="text-[8px] font-bold text-gray-800">{title}</p>
                {desc && <p className="text-[7px] text-gray-400">{desc}</p>}
              </div>
              <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center text-xs">{icon}</div>
            </div>
          ))}
        </div>
        <div className="px-3 mt-3">
          <div className="w-full py-2.5 rounded-xl bg-red-50 text-red-500 text-center text-[9px] font-bold border border-red-100">
            🚪 تسجيل الخروج
          </div>
        </div>
        <p className="text-center text-[7px] text-gray-300 mt-3">الإصدار 1.0.0 • صنع في اليمن 🇾🇪</p>
        <WBottomNav active="more" />
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 15. EMERGENCY
// ═══════════════════════════════════════════════════════════════════════════
export function EmergencyScreen() {
  const hospitals = [
    { name: 'مستشفى الجمهوري', dist: '1.2', services: 'طوارئ 24س', nearest: true },
    { name: 'مستشفى الأمل', dist: '2.5', services: 'طوارئ، قلب', nearest: false },
    { name: 'مستشفى السبعين', dist: '3.1', services: 'طوارئ، أطفال', nearest: false },
  ];
  return (
    <PhoneFrame label="الطوارئ">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar />
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] px-3 py-2 flex items-center justify-between">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
          <h3 className="text-white text-[11px] font-bold">طوارئ المستشفيات</h3>
          <div className="w-6" />
        </div>
        <div className="p-3">
          <div className="bg-red-500 rounded-2xl p-4 text-center mb-3 shadow-lg">
            <div className="w-12 h-12 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-2 animate-pulse">
              <span className="text-white text-2xl">🚑</span>
            </div>
            <p className="text-white text-[12px] font-black">اتصل بالإسعاف</p>
            <p className="text-white/80 text-[10px] font-bold">199</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 mb-3">
            <p className="text-[8px] text-amber-700 text-center">⚠️ في حالة الطوارئ القصوى اتصل بالإسعاف أولاً</p>
          </div>
          <p className="text-[9px] font-bold text-gray-700 mb-2">أقرب المستشفيات</p>
          <div className="space-y-2">
            {hospitals.map((h) => (
              <div key={h.name} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-start gap-2">
                  <div className="flex-1 text-right">
                    {h.nearest && <span className="text-[6px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">الأقرب إليك</span>}
                    <p className="text-[9px] font-bold text-gray-800 mt-0.5">{h.name}</p>
                    <p className="text-[7px] text-gray-400">{h.services}</p>
                    <p className="text-[7px] text-[#2196F3] mt-0.5">📍 {h.dist} كم</p>
                  </div>
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-sm">🏥</div>
                </div>
                <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                  <div className="flex-1 py-1 rounded-lg bg-gray-100 text-center text-[7px] text-gray-500">📞 اتصال</div>
                  <div className="flex-1 py-1 rounded-lg bg-red-50 text-center text-[7px] text-red-500">🚨 طوارئ</div>
                  <div className="flex-1 py-1 rounded-lg bg-blue-50 text-center text-[7px] text-[#2196F3]">📍 اتجاهات</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
