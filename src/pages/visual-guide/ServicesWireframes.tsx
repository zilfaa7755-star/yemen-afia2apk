import React from 'react';
import { PhoneFrame, StatusBar, WBox, WLine, WTitle, WMuted, WHeader, WBottomNav, WTabBar, WPill, WIconCircle, WButton } from './Wireframe';

// ═══════════════════════════════════════════════════════════════════════════
// 1. BLOOD DONATION — Requests Tab
// ═══════════════════════════════════════════════════════════════════════════
export function BloodDonationScreen() {
  const requests = [
    { type: 'O+', urgency: 'حرج', color: 'bg-red-500', hospital: 'مستشفى الجمهوري', name: 'محمد ع.' },
    { type: 'A+', urgency: 'عاجل', color: 'bg-amber-500', hospital: 'مستشفى الأمل', name: 'فاطمة ع.' },
    { type: 'B+', urgency: 'عادي', color: 'bg-green-500', hospital: 'مستشفى السبعين', name: 'علي م.' },
  ];
  return (
    <PhoneFrame label="التبرع بالدم — الطلبات">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-red-500 to-red-600 px-3 pt-2 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">التبرع بالدم</h3>
            <div className="bg-white/20 rounded-lg px-2 py-1 text-white text-[8px] font-bold">＋ طلب</div>
          </div>
          <div className="flex gap-2 mt-2">
            <div className="flex-1 bg-white/20 rounded-lg p-2 text-center">
              <p className="text-white text-sm font-bold">12</p>
              <p className="text-white/70 text-[7px]">طلبات نشطة</p>
            </div>
            <div className="flex-1 bg-white/20 rounded-lg p-2 text-center">
              <p className="text-white text-sm font-bold">8</p>
              <p className="text-white/70 text-[7px]">بنوك متوفرة</p>
            </div>
            <div className="flex-1 bg-white/20 rounded-lg p-2 text-center">
              <p className="text-white text-sm font-bold">340</p>
              <p className="text-white/70 text-[7px]">متبرعين</p>
            </div>
          </div>
        </div>
        <div className="px-3 -mt-2 relative z-10">
          <div className="bg-white rounded-xl shadow-lg p-1.5 flex gap-1 mb-3">
            {['الطلبات', 'بنوك الدم', 'التبرع'].map((t, i) => (
              <div key={t} className={`flex-1 py-1.5 rounded-lg text-center text-[8px] font-bold ${i === 0 ? 'bg-red-500 text-white' : 'text-gray-500'}`}>{t}</div>
            ))}
          </div>
          <div className="flex gap-1.5 mb-3 overflow-x-auto">
            {['الكل', 'O+', 'A+', 'B+', 'AB+', 'O-'].map((bt, i) => (
              <div key={bt} className={`px-2.5 py-1 rounded-full text-[7px] font-bold whitespace-nowrap ${i === 0 ? 'bg-red-100 text-red-600 border border-red-300' : 'bg-gray-100 text-gray-500'}`}>{bt}</div>
            ))}
          </div>
          <div className="space-y-2 pb-4">
            {requests.map((r) => (
              <div key={r.name} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-start gap-2">
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-1.5 justify-end mb-1">
                      <span className={`text-[7px] px-2 py-0.5 rounded-full text-white font-bold ${r.color}`}>{r.urgency}</span>
                      <span className="text-[9px] font-bold text-gray-800">{r.name}</span>
                    </div>
                    <p className="text-[7px] text-gray-400">{r.hospital}</p>
                    <p className="text-[7px] text-gray-400">يحتاج 3 أكياس</p>
                  </div>
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <span className="text-red-500 font-bold text-[10px]">{r.type}</span>
                  </div>
                </div>
                <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                  <div className="flex-1 py-1 rounded-lg bg-red-50 text-center text-[7px] text-red-500 font-bold">📞 اتصل</div>
                  <div className="flex-1 py-1 rounded-lg bg-gray-100 text-center text-[7px] text-gray-500">↗ مشاركة</div>
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
// 2. PHARMACY
// ═══════════════════════════════════════════════════════════════════════════
export function PharmacyScreen() {
  const pharmacies = [
    { name: 'صيدلية الشفاء', dist: '0.8', hours: '24 ساعة', delivery: true },
    { name: 'صيدلية النور', dist: '1.2', hours: '8ص - 12م', delivery: true },
    { name: 'صيدلية الحياة', dist: '2.0', hours: '9ص - 11م', delivery: false },
  ];
  return (
    <PhoneFrame label="صيدليتي">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-[#199A8E] to-[#1976D2] px-3 pt-2 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">صيدليتي</h3>
            <div className="w-6" />
          </div>
          <div className="bg-white/20 rounded-xl p-3 flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg">💊</div>
            <div className="flex-1 text-right">
              <p className="text-white text-[9px] font-bold">اطلب دواءك ووصلك للبيت</p>
              <p className="text-white/70 text-[7px]">توصيل سريع لجميع أنحاء صنعاء</p>
            </div>
          </div>
        </div>
        <div className="px-3 -mt-2 relative z-10">
          <div className="bg-green-50 rounded-xl p-2 flex items-center gap-1.5 mb-3 border border-green-100">
            <span className="text-green-600 text-sm">🚚</span>
            <p className="text-[8px] text-green-700 font-bold">التوصيل متاح في منطقتك</p>
          </div>
          <div className="space-y-2">
            {pharmacies.map((p) => (
              <div key={p.name} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-start gap-2">
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-1 justify-end mb-0.5">
                      {p.delivery && <span className="text-[6px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">🚚 توصيل</span>}
                      <p className="text-[9px] font-bold text-gray-800">{p.name}</p>
                    </div>
                    <p className="text-[7px] text-gray-400">⏰ {p.hours}</p>
                    <p className="text-[7px] text-[#199A8E] mt-0.5">📍 {p.dist} كم</p>
                  </div>
                  <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center text-sm">💊</div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <WButton label="طلب دواء ←" color="bg-cyan-500" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 border-2 border-dashed border-gray-200 rounded-xl p-3 text-center">
            <span className="text-gray-400 text-lg">📷</span>
            <p className="text-[8px] text-gray-500 font-bold mt-1">رفع صورة الوصفة</p>
            <p className="text-[7px] text-gray-400">صورة واضحة للوصفة الطبية</p>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. NURSING SERVICES
// ═══════════════════════════════════════════════════════════════════════════
export function NursingScreen() {
  const services = [
    { icon: '💉', title: 'حقن عضلي', price: '500', dist: '0.5' },
    { icon: '🩹', title: 'تغيير جروح', price: '1,500', dist: '0.8' },
    { icon: '🩸', title: 'سحب دم', price: '1,000', dist: '0.5' },
    { icon: '🏥', title: 'محاليل وريدية', price: '2,000', dist: '1.2' },
    { icon: '🧵', title: 'خياطة جرح', price: '3,000', dist: '1.5' },
  ];
  return (
    <PhoneFrame label="الخدمات المنزلية">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-[#199A8E] to-[#1976D2] px-3 pt-2 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">خدمات منزلية</h3>
            <div className="w-6" />
          </div>
          <div className="bg-white/20 rounded-xl p-3 flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-lg">🏠</div>
            <div className="flex-1 text-right">
              <p className="text-white text-[9px] font-bold">رعاية تمريضية في منزلك</p>
              <p className="text-white/70 text-[7px]">حقن، محاليل، مجارحة، سحب دم</p>
            </div>
          </div>
        </div>
        <div className="px-3 -mt-2 relative z-10">
          <div className="flex gap-1.5 mb-3 overflow-x-auto">
            {['الكل', 'حقن', 'جروح', 'سحب دم', 'محاليل', 'مجارحة'].map((f, i) => (
              <div key={f} className={`px-2.5 py-1 rounded-full text-[7px] font-bold whitespace-nowrap ${i === 0 ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-500'}`}>{f}</div>
            ))}
          </div>
          <div className="space-y-2 pb-4">
            {services.map((s) => (
              <div key={s.title} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-right">
                    <p className="text-[9px] font-bold text-gray-800">{s.title}</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <span className="text-[7px] text-[#199A8E]">📍 {s.dist} كم</span>
                      <span className="text-[7px] text-gray-300">•</span>
                      <span className="text-[8px] font-bold text-gray-700">{s.price} ر.ي</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-base">{s.icon}</div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <WButton label="احجز الخدمة ←" color="bg-green-500" />
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
// 4. MEDICATION GUIDE
// ═══════════════════════════════════════════════════════════════════════════
export function MedicationGuideScreen() {
  return (
    <PhoneFrame label="دليل الأدوية">
      <div className="h-full bg-gray-50 flex flex-col">
        <StatusBar />
        <div className="bg-gradient-to-b from-[#199A8E] to-[#1976D2] px-3 py-2 flex items-center justify-between">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
          <h3 className="text-white text-[11px] font-bold">دليل الأدوية</h3>
          <div className="w-6" />
        </div>
        <div className="bg-white px-3 py-2 border-b border-gray-100 flex items-center gap-2">
          <span className="text-gray-300 text-xs">🔍</span>
          <span className="text-[8px] text-gray-400 flex-1">ابحث عن دواء...</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-sm">💊</div>
              <div className="flex-1 text-right">
                <p className="text-[10px] font-bold text-gray-800">Paracetamol — باراسيتامول</p>
                <p className="text-[7px] text-gray-400">مسكن، خافض حرارة</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="bg-green-50 rounded-lg p-1.5">
                <p className="text-[7px] font-bold text-green-700 mb-0.5">✓ دواعي الاستعمال</p>
                <p className="text-[7px] text-gray-600">الصداع، الحرارة، آلام الجسم</p>
              </div>
              <div className="bg-red-50 rounded-lg p-1.5">
                <p className="text-[7px] font-bold text-red-700 mb-0.5">✗ موانع الاستعمال</p>
                <p className="text-[7px] text-gray-600">أمراض الكبد الحادة</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-1.5">
                <p className="text-[7px] font-bold text-amber-700 mb-0.5">⚠ الأعراض الجانبية</p>
                <p className="text-[7px] text-gray-600">غثيان، طفح جلدي (نادر)</p>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-[#E8F5F4] rounded-lg p-1.5 text-center">
                  <p className="text-[6px] text-[#199A8E]">بالغين</p>
                  <p className="text-[7px] font-bold text-gray-700">500mg</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-1.5 text-center">
                  <p className="text-[6px] text-orange-600">أطفال</p>
                  <p className="text-[7px] font-bold text-gray-700">10-15mg/kg</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-1.5 text-center">
                  <p className="text-[6px] text-purple-600">كبار السن</p>
                  <p className="text-[7px] font-bold text-gray-700">500mg</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-green-50 rounded-lg p-1.5 text-center">
                  <p className="text-[6px] text-green-600">الحمل</p>
                  <p className="text-[7px] font-bold text-green-700">آمن</p>
                </div>
                <div className="bg-green-50 rounded-lg p-1.5 text-center">
                  <p className="text-[6px] text-green-600">الرضاعة</p>
                  <p className="text-[7px] font-bold text-green-700">آمن</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-[6px] text-gray-400">⚠️ هذا الدليل للاسترشاد فقط، استشر طبيبك</p>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. MEDICATION REMINDERS
// ═══════════════════════════════════════════════════════════════════════════
export function MedicationRemindersScreen() {
  const reminders = [
    { name: 'أملوديبين', dose: '5mg', times: ['8:00 ص'], active: true },
    { name: 'ميتفورمين', dose: '500mg', times: ['8:00 ص', '8:00 م'], active: true },
    { name: 'أسبرين', dose: '75mg', times: ['بعد الغداء'], active: false },
  ];
  return (
    <PhoneFrame label="تذكيرات الدواء">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar />
        <div className="bg-gradient-to-b from-[#199A8E] to-[#1976D2] px-3 py-2 flex items-center justify-between">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
          <h3 className="text-white text-[11px] font-bold">تذكيرات الدواء</h3>
          <div className="w-6" />
        </div>
        <div className="p-3">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-2.5 text-center mb-3">
            <span className="text-gray-400 text-sm">＋</span>
            <p className="text-[8px] text-gray-500 font-bold">إضافة تذكير جديد</p>
          </div>
          <div className="space-y-2">
            {reminders.map((r) => (
              <div key={r.name} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-4 rounded-full flex items-center px-0.5 ${r.active ? 'bg-green-500 justify-end' : 'bg-gray-200 justify-start'}`}>
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[9px] font-bold text-gray-800">{r.name} {r.dose}</p>
                    <div className="flex gap-1 justify-end mt-0.5">
                      {r.times.map((t) => (
                        <span key={t} className="text-[7px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-sm">💊</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-[8px] font-bold text-gray-700 mb-2">إضافة تذكير</p>
            <div className="space-y-2">
              <div className="p-2 rounded-lg border border-gray-200 bg-gray-50"><WLine w="w-20" /></div>
              <div className="grid grid-cols-3 gap-1">
                {['يومي', 'أسبوعي', 'مخصص'].map((f, i) => (
                  <div key={f} className={`py-1.5 rounded-lg text-center text-[7px] font-bold ${i === 0 ? 'bg-[#199A8E] text-white' : 'bg-gray-100 text-gray-500'}`}>{f}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'].map((d, i) => (
                  <div key={d} className={`py-1 rounded-lg text-center text-[7px] ${i < 5 ? 'bg-[#199A8E]/10 text-[#199A8E] font-bold' : 'bg-gray-50 text-gray-400'}`}>{d}</div>
                ))}
              </div>
              <WButton label="حفظ التذكير" color="bg-violet-500" />
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. MEDICAL NEWS
// ═══════════════════════════════════════════════════════════════════════════
export function MedicalNewsScreen() {
  const articles = [
    { title: 'إنجاز طبي: أول عملية قلب مفتوح ناجحة في اليمن', cat: 'إنجاز', featured: true, time: 'اليوم' },
    { title: 'مؤتمر طب الأسنان 2026 — صنعاء', cat: 'مؤتمر', featured: false, time: 'أمس' },
    { title: 'بحث جديد: علاج السكري بالخلايا الجذعية', cat: 'بحث', featured: false, time: 'قبل 3 أيام' },
  ];
  return (
    <PhoneFrame label="الأخبار الطبية">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-[#199A8E] to-[#1976D2] px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">الأخبار الطبية</h3>
            <div className="w-6" />
          </div>
          <p className="text-white/70 text-[8px] text-center">آخر الأخبار والإنجازات الطبية</p>
        </div>
        <div className="p-3">
          <div className="flex gap-1.5 mb-3 overflow-x-auto">
            {['الكل', 'إنجازات', 'مؤتمرات', 'أخبار', 'أبحاث'].map((c, i) => (
              <div key={c} className={`px-2.5 py-1 rounded-full text-[7px] font-bold whitespace-nowrap ${i === 0 ? 'bg-[#199A8E] text-white' : 'bg-gray-100 text-gray-500'}`}>{c}</div>
            ))}
          </div>
          {articles[0].featured && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 mb-3 border border-amber-100">
              <span className="text-[6px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">⭐ مميز</span>
              <p className="text-[9px] font-bold text-gray-800 mt-1.5">{articles[0].title}</p>
              <p className="text-[7px] text-gray-400 mt-1">{articles[0].time}</p>
              <div className="mt-2"><WLine w="w-full" h="h-1" /><div className="h-0.5" /><WLine w="w-16" h="h-1" /></div>
            </div>
          )}
          <div className="space-y-2">
            {articles.slice(1).map((a) => (
              <div key={a.title} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-center gap-1.5 justify-end mb-1">
                  <span className="text-[7px] text-gray-400">{a.time}</span>
                  <span className="text-[6px] bg-[#E8F5F4] text-[#199A8E] px-1.5 py-0.5 rounded-full font-bold">{a.cat}</span>
                </div>
                <p className="text-[9px] font-bold text-gray-800 text-right">{a.title}</p>
                <div className="mt-1.5"><WLine w="w-full" h="h-1" /><div className="h-0.5" /><WLine w="w-12" h="h-1" /></div>
                <div className="text-left mt-1.5">
                  <span className="text-[7px] text-[#199A8E] font-bold">اقرأ المزيد ←</span>
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
// 7. POINTS
// ═══════════════════════════════════════════════════════════════════════════
export function PointsScreen() {
  const rewards = [
    { icon: '🎁', title: 'كشف مجاني', points: '500', available: true },
    { icon: '💊', title: 'خصم صيدلية 20%', points: '300', available: true },
    { icon: '🩺', title: 'تحليل مجاني', points: '800', available: false },
    { icon: '🏠', title: 'خدمة تمريض مجانية', points: '1,200', available: false },
  ];
  return (
    <PhoneFrame label="نقاطي ومكافآتي">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-amber-400 to-amber-500 px-3 pt-2 pb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">نقاطي ومكافآتي</h3>
            <div className="w-6" />
          </div>
          <div className="bg-white/20 rounded-2xl p-3 text-center">
            <div className="w-10 h-10 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-1">
              <span className="text-white text-lg">🎁</span>
            </div>
            <p className="text-white text-2xl font-black">3,450</p>
            <p className="text-white/70 text-[7px]">نقطة</p>
            <span className="inline-block mt-1 text-[7px] bg-white/30 text-white px-2 py-0.5 rounded-full font-bold">🥇 ذهبي</span>
          </div>
        </div>
        <div className="p-3">
          <p className="text-[9px] font-bold text-gray-700 mb-2">استبدل نقاطك</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {rewards.map((r) => (
              <div key={r.title} className={`bg-white rounded-xl p-2.5 border ${r.available ? 'border-gray-100' : 'border-gray-200 opacity-50'}`}>
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-sm mb-1.5">{r.icon}</div>
                <p className="text-[8px] font-bold text-gray-800">{r.title}</p>
                <p className="text-[7px] text-amber-600 font-bold mt-0.5">{r.points} نقطة</p>
                <div className={`mt-1.5 py-1 rounded-lg text-center text-[7px] font-bold ${r.available ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {r.available ? 'استبدال' : 'نقاط غير كافية'}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[9px] font-bold text-gray-700 mb-2">كيف تكسب النقاط</p>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100 space-y-1.5">
            <div className="flex justify-between text-[7px]"><span className="text-gray-500">حجز موعد</span><span className="text-green-600 font-bold">+50</span></div>
            <div className="flex justify-between text-[7px]"><span className="text-gray-500">التبرع بالدم</span><span className="text-green-600 font-bold">+200</span></div>
            <div className="flex justify-between text-[7px]"><span className="text-gray-500">تقييم طبيب</span><span className="text-green-600 font-bold">+10</span></div>
          </div>
          <p className="text-[9px] font-bold text-gray-700 mb-2 mt-3">النشاط الأخير</p>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100 space-y-1.5">
            <div className="flex justify-between text-[7px]"><span className="text-gray-500">حجز موعد — د. أحمد</span><span className="text-green-600 font-bold">+50</span></div>
            <div className="flex justify-between text-[7px]"><span className="text-gray-500">استبدال — خصم صيدلية</span><span className="text-red-500 font-bold">-300</span></div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. ELECTRONIC PRESCRIPTION
// ═══════════════════════════════════════════════════════════════════════════
export function ElectronicPrescriptionScreen() {
  return (
    <PhoneFrame label="الوصفة الإلكترونية">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-[#199A8E] to-[#1976D2] px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">الوصفة الإلكترونية</h3>
            <div className="w-6" />
          </div>
          <div className="flex gap-1.5">
            <div className="flex-1 bg-white/20 rounded-lg p-1.5 text-center"><p className="text-white text-[10px] font-bold">3</p><p className="text-white/70 text-[6px]">الكل</p></div>
            <div className="flex-1 bg-white/20 rounded-lg p-1.5 text-center"><p className="text-white text-[10px] font-bold">2</p><p className="text-white/70 text-[6px]">نشطة</p></div>
            <div className="flex-1 bg-white/20 rounded-lg p-1.5 text-center"><p className="text-white text-[10px] font-bold">1</p><p className="text-white/70 text-[6px]">منتهية</p></div>
          </div>
        </div>
        <div className="p-3">
          <div className="bg-white rounded-xl flex items-center px-2.5 py-2 gap-2 mb-3 border border-gray-100">
            <span className="text-gray-300 text-xs">🔍</span>
            <span className="text-[8px] text-gray-400 flex-1">ابحث برقم الوصفة أو الطبيب...</span>
          </div>
          <div className="space-y-2">
            <div className="bg-white rounded-xl p-2.5 border border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[6px] text-gray-400">ينتهي خلال 5 أيام</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-[7px] font-bold text-green-700">نشطة</span>
                </div>
              </div>
              <p className="text-[8px] font-bold text-gray-800 text-right">RX-2026-00451</p>
              <p className="text-[7px] text-gray-400 text-right">د. أحمد المقطري • باطنية</p>
              <div className="bg-gray-50 rounded-lg p-1.5 mt-1.5 space-y-1">
                <div className="flex justify-between text-[7px]"><span className="text-gray-500">1. باراسيتامول 500mg</span><span className="text-gray-400">×3 يوم</span></div>
                <div className="flex justify-between text-[7px]"><span className="text-gray-500">2. أملوديبين 5mg</span><span className="text-gray-400">×30 يوم</span></div>
              </div>
              <div className="flex gap-1 mt-2">
                <div className="flex-1 py-1 rounded-lg bg-gray-100 text-center text-[7px] text-gray-500">🖨 طباعة</div>
                <div className="flex-1 py-1 rounded-lg bg-emerald-50 text-center text-[7px] text-emerald-600 font-bold">📋 صرف</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[6px] text-red-400">منتهية منذ 10 أيام</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <span className="text-[7px] font-bold text-gray-500">منتهية</span>
                </div>
              </div>
              <p className="text-[8px] font-bold text-gray-800 text-right">RX-2026-00420</p>
              <p className="text-[7px] text-gray-400 text-right">د. فاطمة الشامي • قلب</p>
              <div className="flex justify-center mt-2">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-px">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. FAMILY MEMBERS
// ═══════════════════════════════════════════════════════════════════════════
export function FamilyScreen() {
  const members = [
    { name: 'أحمد محمد', relation: 'ابن', age: '12 سنة', blood: 'O+' },
    { name: 'سارة أحمد', relation: 'زوجة', age: '35 سنة', blood: 'A+' },
    { name: 'محمد علي', relation: 'والد', age: '68 سنة', blood: 'B+' },
  ];
  return (
    <PhoneFrame label="أفراد العائلة">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-[#199A8E] to-[#1976D2] px-3 pt-2 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">أفراد العائلة</h3>
            <div className="bg-white/20 rounded-lg px-2 py-1 text-white text-[8px] font-bold">＋ إضافة</div>
          </div>
        </div>
        <div className="p-3 space-y-2">
          {members.map((m) => (
            <div key={m.name} className="bg-white rounded-xl p-2.5 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-1.5 justify-end mb-0.5">
                    <span className="text-[6px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full font-bold">🩸 {m.blood}</span>
                    <span className="text-[7px] bg-[#E8F5F4] text-[#199A8E] px-1.5 py-0.5 rounded-full">{m.relation}</span>
                    <p className="text-[9px] font-bold text-gray-800">{m.name}</p>
                  </div>
                  <p className="text-[7px] text-gray-400">{m.age} • لا حساسية</p>
                </div>
                <div className="w-9 h-9 bg-[#E8F5F4] rounded-xl flex items-center justify-center text-sm">👤</div>
              </div>
              <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                <div className="flex-1 py-1 rounded-lg bg-[#199A8E] text-white text-center text-[7px] font-bold">📅 حجز موعد</div>
                <div className="flex-1 py-1 rounded-lg bg-gray-100 text-center text-[7px] text-gray-500">📄 التفاصيل</div>
              </div>
            </div>
          ))}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-2.5 text-center">
            <span className="text-gray-400 text-sm">＋</span>
            <p className="text-[8px] text-gray-500 font-bold">إضافة فرد من العائلة</p>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. DOCTOR PLUS
// ═══════════════════════════════════════════════════════════════════════════
export function DoctorPlusScreen() {
  return (
    <PhoneFrame label="طبيبي بلس — الاشتراك">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-amber-400 to-amber-600 px-3 pt-2 pb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">طبيبي بلس</h3>
            <div className="w-6" />
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-2">
              <span className="text-white text-2xl">👑</span>
            </div>
            <p className="text-white text-[10px] font-bold">عضوية طبيبي بلس</p>
            <p className="text-white/70 text-[7px]">مزايا حصرية وتوصيل مجاني</p>
          </div>
        </div>
        <div className="p-3">
          <div className="flex gap-1.5 mb-3">
            <div className="flex-1 bg-white rounded-xl p-2 text-center border border-gray-100">
              <p className="text-[7px] text-gray-400">شهري</p>
              <p className="text-[10px] font-bold text-gray-800">2,999 ر.ي</p>
            </div>
            <div className="flex-1 bg-amber-50 rounded-xl p-2 text-center border-2 border-amber-400 relative">
              <span className="absolute -top-1.5 left-1 text-[5px] bg-amber-500 text-white px-1 rounded-full">خصم 15%</span>
              <p className="text-[7px] text-amber-600">ربعي</p>
              <p className="text-[10px] font-bold text-amber-700">7,500 ر.ي</p>
            </div>
            <div className="flex-1 bg-white rounded-xl p-2 text-center border border-gray-100">
              <p className="text-[7px] text-gray-400">سنوي</p>
              <p className="text-[10px] font-bold text-gray-800">27,000 ر.ي</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 mb-3">
            <p className="text-[8px] font-bold text-gray-700 mb-2">مقارنة المزايا</p>
            <div className="space-y-1.5">
              {[
                ['حجز مواعيد', true, true],
                ['توصيل أدوية مجاني', false, true],
                ['كشف مجاني شهرياً', false, true],
                ['أولوية في الطابور', false, true],
                ['استشارة طبيب 24/7', false, true],
              ].map(([f, free, plus]) => (
                <div key={f as string} className="flex items-center gap-2 text-[7px]">
                  <span className="flex-1 text-right text-gray-600">{f}</span>
                  <span className={`w-4 text-center ${free ? 'text-green-500' : 'text-red-300'}`}>{free ? '✓' : '✗'}</span>
                  <span className={`w-4 text-center ${plus ? 'text-green-500 font-bold' : 'text-red-300'}`}>{plus ? '✓' : '✗'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 mb-3">
            <p className="text-[8px] font-bold text-gray-700 mb-1.5">الأسئلة الشائعة</p>
            <div className="space-y-1">
              {['هل يمكنني الإلغاء في أي وقت؟', 'هل التوصيل متاح لجميع المدن؟'].map((q) => (
                <div key={q} className="flex items-center justify-between text-[7px] text-gray-500 py-1 border-b border-gray-50">
                  <span className="text-gray-400">‹</span>
                  <span className="flex-1 text-right">{q}</span>
                </div>
              ))}
            </div>
          </div>
          <WButton label="اشترك الآن 👑" color="bg-amber-500" />
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. MENTAL HEALTH
// ═══════════════════════════════════════════════════════════════════════════
export function MentalHealthScreen() {
  const therapists = [
    { name: 'د. سمية الحداد', spec: 'علاج معرفي سلوكي', rating: '4.8', tags: ['قلق', 'اكتئاب'] },
    { name: 'د. خالد المرسي', spec: 'علاج نفسي ديناميكي', rating: '4.6', tags: ['صدمات', 'علاقات'] },
  ];
  return (
    <PhoneFrame label="الدعم النفسي">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-purple-500 to-purple-700 px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">الدعم النفسي</h3>
            <div className="w-6" />
          </div>
          <div className="flex gap-1.5">
            {['المعالجون', 'مساعدة ذاتية', 'جلساتي'].map((t, i) => (
              <div key={t} className={`flex-1 py-1.5 rounded-lg text-center text-[7px] font-bold ${i === 0 ? 'bg-white text-purple-700' : 'bg-white/20 text-white'}`}>{t}</div>
            ))}
          </div>
        </div>
        <div className="p-3">
          <div className="bg-purple-50 rounded-xl p-2.5 mb-3 flex items-center gap-2 border border-purple-100">
            <span className="text-purple-600 text-lg">🌬️</span>
            <div className="flex-1 text-right">
              <p className="text-[8px] font-bold text-purple-700">تمارين التنفس</p>
              <p className="text-[7px] text-purple-500">خذ دقيقة للاسترخاء</p>
            </div>
          </div>
          <div className="space-y-2 mb-3">
            {therapists.map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-right">
                    <p className="text-[9px] font-bold text-gray-800">{t.name}</p>
                    <p className="text-[7px] text-gray-400">{t.spec}</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <span className="text-[7px] text-yellow-500">★ {t.rating}</span>
                      {t.tags.map((tag) => (
                        <span key={tag} className="text-[6px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-[10px]">س</div>
                </div>
                <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                  {['🎥 فيديو', '📞 صوت', '💬 محادثة'].map((s, i) => (
                    <div key={s} className={`flex-1 py-1 rounded-lg text-center text-[7px] ${i === 0 ? 'bg-purple-500 text-white font-bold' : 'bg-gray-100 text-gray-500'}`}>{s}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
            <div className="flex items-center gap-1.5 justify-center text-[7px] text-gray-500">
              <span>🔒</span><span>جلسات سرية ومشفرة بالكامل</span>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. MEDICAL FACILITIES (Patient View)
// ═══════════════════════════════════════════════════════════════════════════
export function MedicalFacilitiesScreen() {
  const facilities = [
    { name: 'مركز اليمن الطبي', type: 'مستشفى', rating: '4.5', dist: '1.0', open: true },
    { name: 'مختبر الشفاء', type: 'مختبر', rating: '4.3', dist: '0.5', open: true },
    { name: 'صيدلية النور', type: 'صيدلية', rating: '4.7', dist: '0.8', open: false },
  ];
  return (
    <PhoneFrame label="المنشآت الطبية">
      <div className="h-full bg-gray-50 overflow-y-auto pb-14">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-[#199A8E] to-[#1976D2] px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">المنشآت الطبية</h3>
            <div className="w-6" />
          </div>
          <div className="bg-white/95 rounded-xl flex items-center px-2.5 py-2 gap-2">
            <span className="text-gray-300 text-xs">🔍</span>
            <span className="text-[8px] text-gray-400 flex-1">ابحث عن منشأة...</span>
          </div>
        </div>
        <div className="px-3 mt-2">
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {[['🏥', 'مستشفى'], ['🧪', 'مختبر'], ['💊', 'صيدلية'], ['🚑', 'طوارئ']].map(([icon, label]) => (
              <div key={label} className="bg-white rounded-xl p-2 text-center border border-gray-100">
                <div className="text-base mb-0.5">{icon}</div>
                <p className="text-[7px] text-gray-600">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mb-3">
            {['الكل', '24 ساعة', 'الأقرب'].map((f, i) => (
              <div key={f} className={`px-2.5 py-1 rounded-full text-[7px] font-bold ${i === 0 ? 'bg-[#199A8E] text-white' : 'bg-gray-100 text-gray-500'}`}>{f}</div>
            ))}
          </div>
          <div className="space-y-2">
            {facilities.map((f) => (
              <div key={f.name} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-start gap-2">
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-1 justify-end mb-0.5">
                      <span className={`text-[6px] px-1.5 py-0.5 rounded-full font-bold ${f.open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{f.open ? 'مفتوح' : 'مغلق'}</span>
                      <span className="text-[7px] text-yellow-500">★ {f.rating}</span>
                      <p className="text-[9px] font-bold text-gray-800">{f.name}</p>
                    </div>
                    <p className="text-[7px] text-gray-400">{f.type} • 📍 {f.dist} كم</p>
                  </div>
                  <div className="w-9 h-9 bg-[#E8F5F4] rounded-xl flex items-center justify-center text-base">🏥</div>
                </div>
                <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                  <div className="flex-1 py-1 rounded-lg bg-gray-100 text-center text-[7px] text-gray-500">📞 اتصال</div>
                  <div className="flex-1 py-1 rounded-lg bg-[#E8F5F4] text-center text-[7px] text-[#199A8E]">📍 اتجاهات</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <WBottomNav active="facilities" />
      </div>
    </PhoneFrame>
  );
}
