import React from 'react';
import { PhoneFrame, StatusBar, WBox, WLine, WTitle, WMuted, WHeader, WBottomNav, WTabBar, WPill, WIconCircle, WButton } from './Wireframe';

// ═══════════════════════════════════════════════════════════════════════════
// 1. SECRETARY DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
export function SecretaryDashboardScreen() {
  const queue = [
    { name: 'محمد أحمد', num: '1', status: 'قيد الكشف', color: 'bg-blue-100 text-blue-700' },
    { name: 'فاطمة علي', num: '2', status: 'منتظر', color: 'bg-gray-100 text-gray-600' },
    { name: 'عبدالله سالم', num: '3', status: 'منتظر', color: 'bg-gray-100 text-gray-600' },
    { name: 'سارة محمد', num: '4', status: 'طوارئ', color: 'bg-red-100 text-red-700' },
  ];
  return (
    <PhoneFrame label="لوحة السكرتاري">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-purple-500 to-purple-700 px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">⚙</div>
            <div className="text-center">
              <h3 className="text-white text-[11px] font-bold">لوحة السكرتاري</h3>
              <p className="text-white/60 text-[7px]">د. أحمد المقطري • 10:30 ص</p>
            </div>
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">🔔</div>
          </div>
          <div className="flex gap-1.5">
            {[['12', 'الطابور'], ['8', 'مكتمل'], ['2', 'ملغي']].map(([n, l]) => (
              <div key={l} className="flex-1 bg-white/20 rounded-lg p-1.5 text-center">
                <p className="text-white text-[10px] font-bold">{n}</p>
                <p className="text-white/70 text-[6px]">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-1 px-3 py-2 bg-white border-b border-gray-100">
          {['الطابور', 'إضافة', 'التقرير'].map((t, i) => (
            <div key={t} className={`flex-1 py-1.5 rounded-lg text-center text-[8px] font-bold ${i === 0 ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{t}</div>
          ))}
        </div>
        <div className="p-3 space-y-2">
          {queue.map((q) => (
            <div key={q.name} className="bg-white rounded-xl p-2.5 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-[8px] text-gray-500">✓</div>
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-[8px] text-gray-500">✗</div>
                </div>
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className={`text-[6px] px-1.5 py-0.5 rounded-full font-bold ${q.color}`}>{q.status}</span>
                    <p className="text-[9px] font-bold text-gray-800">{q.name}</p>
                  </div>
                  <p className="text-[7px] text-gray-400 mt-0.5">رقم الطابور: {q.num}</p>
                </div>
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-purple-600">{q.num}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3">
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-[8px] font-bold text-gray-700 mb-2">إضافة مريض جديد</p>
            <div className="space-y-1.5">
              <div className="p-2 rounded-lg border border-gray-200 bg-gray-50"><WLine w="w-16" /></div>
              <div className="p-2 rounded-lg border border-gray-200 bg-gray-50"><WLine w="w-20" /></div>
              <div className="flex items-center justify-between bg-red-50 rounded-lg p-2 border border-red-100">
                <span className="text-[7px] text-red-700">حالة طارئة</span>
                <div className="w-6 h-3 bg-gray-200 rounded-full" />
              </div>
              <WButton label="إضافة للطابور" color="bg-purple-500" />
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. DOCTOR DASHBOARD — Today's Queue
// ═══════════════════════════════════════════════════════════════════════════
export function DoctorDashboardScreen() {
  const patients = [
    { name: 'محمد أحمد', num: '1', status: 'قيد الكشف', symptoms: 'ألم صدر، ضيق تنفس', color: 'bg-blue-100 text-blue-700' },
    { name: 'فاطمة علي', num: '2', status: 'منتظر', symptoms: 'صداع مستمر', color: 'bg-gray-100 text-gray-600' },
    { name: 'عبدالله سالم', num: '3', status: 'منتظر', symptoms: 'ارتفاع ضغط', color: 'bg-gray-100 text-gray-600' },
  ];
  return (
    <PhoneFrame label="لوحة الطبيب — مواعيد اليوم">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-green-500 to-green-700 px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">⚙</div>
            <div className="text-center">
              <h3 className="text-white text-[11px] font-bold">د. أحمد المقطري</h3>
              <p className="text-white/60 text-[7px]">باطنية عامة • 3 مواعيد اليوم</p>
            </div>
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">🔔</div>
          </div>
        </div>
        <div className="flex gap-1 px-3 py-2 bg-white border-b border-gray-100 overflow-x-auto">
          {['اليوم', 'شهري', 'استشارة', 'مكتبة', 'رسائل', 'تقرير'].map((t, i) => (
            <div key={t} className={`px-2.5 py-1 rounded-lg text-[7px] font-bold whitespace-nowrap ${i === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{t}</div>
          ))}
        </div>
        <div className="p-3 space-y-2">
          {patients.map((p) => (
            <div key={p.name} className="bg-white rounded-xl p-2.5 border border-gray-100">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-lg flex items-center justify-center text-[7px] font-bold">→</div>
                </div>
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-1.5 justify-end mb-0.5">
                    <span className={`text-[6px] px-1.5 py-0.5 rounded-full font-bold ${p.color}`}>{p.status}</span>
                    <p className="text-[9px] font-bold text-gray-800">{p.name}</p>
                  </div>
                  <p className="text-[7px] text-gray-400">الأعراض: {p.symptoms}</p>
                  <p className="text-[7px] text-gray-300 mt-0.5">الطابور: {p.num}</p>
                </div>
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-green-600">{p.num}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. DOCTOR — Examination Panel
// ═══════════════════════════════════════════════════════════════════════════
export function DoctorExaminationScreen() {
  return (
    <PhoneFrame label="لوحة الطبيب — غرفة الفحص">
      <div className="h-full bg-gray-50 flex flex-col">
        <StatusBar dark />
        <div className="bg-green-600 px-3 py-2 flex items-center justify-between">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">✕</div>
          <div className="text-center">
            <h3 className="text-white text-[10px] font-bold">فحص المريض: محمد أحمد</h3>
            <p className="text-white/60 text-[7px]">طابور #1 • باطنية عامة</p>
          </div>
          <div className="w-6" />
        </div>
        <div className="flex gap-1 px-2 py-1.5 bg-white border-b border-gray-100 overflow-x-auto">
          {['التشخيص', 'الوصفة', 'تحاليل', 'السجل', 'تحويل'].map((t, i) => (
            <div key={t} className={`px-2 py-1 rounded-lg text-[7px] font-bold whitespace-nowrap ${i === 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{t}</div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
            <p className="text-[8px] font-bold text-gray-700 mb-1">التشخيص</p>
            <div className="p-2 rounded-lg border border-gray-200 bg-gray-50 h-12">
              <WLine w="w-full" /><div className="h-1" /><WLine w="w-20" />
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center text-[8px]">🎤</div>
              <p className="text-[7px] text-gray-400">إدخال صوتي</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
            <p className="text-[8px] font-bold text-gray-700 mb-1.5">الوصفة الإلكترونية</p>
            <div className="space-y-1">
              <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-1">
                <span className="text-[7px] text-gray-400">1.</span>
                <div className="flex-1"><WLine w="w-16" /></div>
                <span className="text-[6px] bg-green-100 text-green-700 px-1 rounded">✓ آمن</span>
              </div>
              <div className="bg-red-50 rounded-lg p-2 flex items-center gap-1 border border-red-100">
                <span className="text-[7px] text-gray-400">2.</span>
                <div className="flex-1"><WLine w="w-12" color="bg-red-200" /></div>
                <span className="text-[6px] bg-red-100 text-red-700 px-1 rounded font-bold">⚠ حساسية!</span>
              </div>
            </div>
            <div className="flex justify-center mt-2">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-4 gap-px">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`w-1 h-1 ${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-center text-[6px] text-gray-400 mt-1">رمز QR للوصفة</p>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
            <p className="text-[8px] font-bold text-gray-700 mb-1">طلب تحاليل</p>
            <div className="flex flex-wrap gap-1">
              {['CBC', 'سكر', 'دهون', 'كبد', 'كلى'].map((t) => (
                <span key={t} className="text-[7px] bg-blue-50 text-[#2196F3] px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="flex-1 py-2 rounded-xl bg-gray-100 text-center text-[8px] text-gray-500">حفظ</div>
            <div className="flex-1 py-2 rounded-xl bg-green-500 text-white text-center text-[8px] font-bold">إنهاء الكشف ←</div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. DOCTOR — Case Consultation Room
// ═══════════════════════════════════════════════════════════════════════════
export function DoctorConsultationScreen() {
  return (
    <PhoneFrame label="غرفة استشارة الحالات">
      <div className="h-full bg-gray-50 flex flex-col">
        <StatusBar dark />
        <div className="bg-green-600 px-3 py-2 flex items-center justify-between">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
          <h3 className="text-white text-[11px] font-bold">غرفة الاستشارة</h3>
          <div className="w-6" />
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <div className="flex items-center gap-1.5 justify-end mb-1.5">
              <span className="text-[6px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">عاجل</span>
              <span className="text-[6px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">مفتوحة</span>
              <p className="text-[9px] font-bold text-gray-800">حالة: ألم صدر حاد</p>
            </div>
            <p className="text-[7px] text-gray-500 text-right">د. أحمد المقطري • باطنية</p>
            <div className="mt-2 bg-gray-50 rounded-lg p-2">
              <p className="text-[7px] text-gray-600 text-right">مريض 55 سنة، ألم صدري مستمر 6 ساعات، تخطيط القلب يظهر ST elevation...</p>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
              <span className="text-[7px] text-gray-400">👁️ 34 مشاهدة</span>
              <span className="text-[7px] text-gray-400">💬 3 ردود</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center text-white text-[8px] font-bold">ف</div>
              <p className="text-[8px] font-bold text-gray-800">د. فاطمة الشامي</p>
              <span className="text-[6px] text-gray-400">• قلب</span>
              <span className="text-[6px] bg-green-100 text-green-700 px-1 rounded-full">ثقة عالية</span>
            </div>
            <p className="text-[7px] text-gray-600 text-right">موافقة على التشخيص، أنصح بالقسطرة الطارئة خلال أول 90 دقيقة</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[6px] text-[#2196F3]">👍 مفيد (5)</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white text-[8px] font-bold">خ</div>
              <p className="text-[8px] font-bold text-gray-800">د. خالد الإرياني</p>
              <span className="text-[6px] text-gray-400">• أعصاب</span>
            </div>
            <p className="text-[7px] text-gray-600 text-right">هل تم فحص إنزيمات القلب؟ يجب التأكد من مستوى التروبونين</p>
          </div>
        </div>
        <div className="bg-white border-t border-gray-100 p-2 flex items-center gap-1">
          <div className="flex-1 bg-gray-100 rounded-lg px-2 py-2"><span className="text-[8px] text-gray-400">أضف ردك...</span></div>
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs">➤</div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. NURSE DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
export function NurseDashboardScreen() {
  const requests = [
    { name: 'محمد أحمد', service: 'حقن عضلي', addr: 'حدة — شارع 30', status: 'جديد', color: 'bg-blue-100 text-blue-700' },
    { name: 'سارة علي', service: 'تغيير جروح', addr: 'الستين — حي السلام', status: 'مقبول', color: 'bg-green-100 text-green-700' },
    { name: 'عبدالله س.', service: 'محاليل وريدية', addr: 'تونس — شارع الستين', status: 'مكتمل', color: 'bg-gray-100 text-gray-600' },
  ];
  return (
    <PhoneFrame label="لوحة الممرض">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">⚙</div>
            <div className="text-center">
              <h3 className="text-white text-[11px] font-bold">لوحة الممرض</h3>
              <p className="text-white/60 text-[7px]">أحمد التمريض • ممرض</p>
            </div>
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">🔔</div>
          </div>
        </div>
        <div className="flex gap-1 px-3 py-2 bg-white border-b border-gray-100">
          {['الطلبات', 'التحويلات', 'التقرير', 'الملف'].map((t, i) => (
            <div key={t} className={`flex-1 py-1.5 rounded-lg text-center text-[7px] font-bold ${i === 0 ? 'bg-[#2196F3] text-white' : 'bg-gray-100 text-gray-500'}`}>{t}</div>
          ))}
        </div>
        <div className="p-3 space-y-2">
          {requests.map((r) => (
            <div key={r.name} className="bg-white rounded-xl p-2.5 border border-gray-100">
              <div className="flex items-start gap-2">
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-1.5 justify-end mb-0.5">
                    <span className={`text-[6px] px-1.5 py-0.5 rounded-full font-bold ${r.color}`}>{r.status}</span>
                    <p className="text-[9px] font-bold text-gray-800">{r.name}</p>
                  </div>
                  <p className="text-[7px] text-gray-500">{r.service}</p>
                  <p className="text-[7px] text-gray-400 mt-0.5">📍 {r.addr}</p>
                </div>
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm">💉</div>
              </div>
              {r.status === 'جديد' && (
                <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                  <div className="flex-1 py-1 rounded-lg bg-[#2196F3] text-white text-center text-[7px] font-bold">✓ قبول</div>
                  <div className="flex-1 py-1 rounded-lg bg-gray-100 text-center text-[7px] text-gray-500">↗ تحويل</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. MEDICAL FACILITY DASHBOARD — Hospital
// ═══════════════════════════════════════════════════════════════════════════
export function FacilityHospitalScreen() {
  const referrals = [
    { from: 'د. أحمد المقطري', patient: 'محمد ع.', type: 'قسطرة طارئة', urgency: 'طارئ', color: 'bg-red-100 text-red-700' },
    { from: 'د. خالد الإرياني', patient: 'سارة م.', type: 'استشارة أعصاب', urgency: 'عاجل', color: 'bg-amber-100 text-amber-700' },
    { from: 'ممرض أحمد', patient: 'علي س.', type: 'إجراء مجارحة', urgency: 'عادي', color: 'bg-gray-100 text-gray-600' },
  ];
  return (
    <PhoneFrame label="لوحة المنشأة — مستشفى">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-[#2196F3] to-[#1565C0] px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">⚙</div>
            <div className="text-center">
              <h3 className="text-white text-[11px] font-bold">مستشفى الجمهوري</h3>
              <p className="text-white/60 text-[7px]">لوحة الإدارة</p>
            </div>
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">🔔</div>
          </div>
          <div className="flex gap-1.5">
            {[['5', 'تحويلات'], ['12', 'مرضى'], ['3', 'إجراءات']].map(([n, l]) => (
              <div key={l} className="flex-1 bg-white/20 rounded-lg p-1.5 text-center">
                <p className="text-white text-[10px] font-bold">{n}</p>
                <p className="text-white/70 text-[6px]">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3">
          <p className="text-[9px] font-bold text-gray-700 mb-2">التحويلات الواردة</p>
          <div className="space-y-2">
            {referrals.map((r) => (
              <div key={r.patient} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-start gap-2">
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-1.5 justify-end mb-0.5">
                      <span className={`text-[6px] px-1.5 py-0.5 rounded-full font-bold ${r.color}`}>{r.urgency}</span>
                      <p className="text-[9px] font-bold text-gray-800">{r.patient}</p>
                    </div>
                    <p className="text-[7px] text-gray-500">{r.type}</p>
                    <p className="text-[7px] text-gray-400">من: {r.from}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm">📋</div>
                </div>
                <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                  <div className="flex-1 py-1 rounded-lg bg-green-50 text-center text-[7px] text-green-600 font-bold">✓ قبول</div>
                  <div className="flex-1 py-1 rounded-lg bg-amber-50 text-center text-[7px] text-amber-600">📅 جدولة</div>
                  <div className="flex-1 py-1 rounded-lg bg-red-50 text-center text-[7px] text-red-500">✗ رفض</div>
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
// 7. MEDICAL FACILITY DASHBOARD — Pharmacy
// ═══════════════════════════════════════════════════════════════════════════
export function FacilityPharmacyScreen() {
  return (
    <PhoneFrame label="لوحة المنشأة — صيدلية">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-teal-500 to-teal-700 px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">⚙</div>
            <div className="text-center">
              <h3 className="text-white text-[11px] font-bold">صيدلية الشفاء</h3>
              <p className="text-white/60 text-[7px]">لوحة الصرف</p>
            </div>
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">🔔</div>
          </div>
        </div>
        <div className="p-3">
          <div className="bg-white rounded-xl p-2.5 border border-gray-100 mb-3">
            <p className="text-[8px] font-bold text-gray-700 mb-1.5">بحث برمز المريض</p>
            <div className="flex gap-1">
              <div className="flex-1 p-2 rounded-lg border border-gray-200 bg-gray-50"><WLine w="w-20" /></div>
              <div className="px-3 py-2 rounded-lg bg-teal-500 text-white text-[8px] font-bold">بحث</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100 mb-3">
            <p className="text-[8px] font-bold text-gray-700 mb-1.5">وصفة نشطة — RX-2026-00451</p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1.5">
                <div className="w-4 h-4 bg-teal-500 rounded text-white text-[7px] flex items-center justify-center">✓</div>
                <span className="text-[7px] text-gray-600 flex-1">1. باراسيتامول 500mg ×3</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1.5">
                <div className="w-4 h-4 border-2 border-gray-300 rounded" />
                <span className="text-[7px] text-gray-600 flex-1">2. أملوديبين 5mg ×30</span>
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              <div className="flex-1 py-1.5 rounded-lg bg-teal-500 text-white text-center text-[7px] font-bold">صرف المحدد ←</div>
            </div>
          </div>
          <p className="text-[9px] font-bold text-gray-700 mb-2">المخزون</p>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100 space-y-1.5">
            <div className="flex items-center justify-between text-[7px]">
              <span className="text-gray-500">باراسيتامول 500mg</span>
              <div className="flex items-center gap-1">
                <div className="w-12 h-1.5 bg-gray-100 rounded-full"><div className="w-10 h-1.5 bg-green-500 rounded-full" /></div>
                <span className="text-gray-600">120</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[7px]">
              <span className="text-gray-500">أملوديبين 5mg</span>
              <div className="flex items-center gap-1">
                <div className="w-12 h-1.5 bg-gray-100 rounded-full"><div className="w-3 h-1.5 bg-red-500 rounded-full" /></div>
                <span className="text-red-500 font-bold">15 ⚠</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[7px]">
              <span className="text-gray-500">ميتفورمين 500mg</span>
              <div className="flex items-center gap-1">
                <div className="w-12 h-1.5 bg-gray-100 rounded-full"><div className="w-8 h-1.5 bg-amber-500 rounded-full" /></div>
                <span className="text-amber-600">45</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. MEDICAL FACILITY DASHBOARD — Lab
// ═══════════════════════════════════════════════════════════════════════════
export function FacilityLabScreen() {
  const queue = [
    { code: 'YP-001', name: 'محمد أحمد', tests: 'CBC، سكر', eta: '15د', status: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700' },
    { code: 'YP-002', name: 'سارة علي', tests: 'دهون', eta: '20د', status: 'في الطابور', color: 'bg-gray-100 text-gray-600' },
  ];
  return (
    <PhoneFrame label="لوحة المنشأة — مختبر">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-b from-purple-500 to-purple-700 px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">⚙</div>
            <div className="text-center">
              <h3 className="text-white text-[11px] font-bold">مختبر الشفاء</h3>
              <p className="text-white/60 text-[7px]">الطابور الذكي</p>
            </div>
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">🔔</div>
          </div>
          <div className="flex gap-1.5">
            {[['2', 'في الطابور'], ['1', 'قيد المعالجة'], ['8', 'مكتمل اليوم']].map(([n, l]) => (
              <div key={l} className="flex-1 bg-white/20 rounded-lg p-1.5 text-center">
                <p className="text-white text-[10px] font-bold">{n}</p>
                <p className="text-white/70 text-[6px]">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3">
          <div className="bg-white rounded-xl p-2.5 border border-gray-100 mb-3">
            <p className="text-[8px] font-bold text-gray-700 mb-1.5">إضافة للطابور برمز المريض</p>
            <div className="flex gap-1">
              <div className="flex-1 p-2 rounded-lg border border-gray-200 bg-gray-50"><WLine w="w-16" /></div>
              <div className="px-3 py-2 rounded-lg bg-purple-500 text-white text-[8px] font-bold">＋ إضافة</div>
            </div>
          </div>
          <div className="space-y-2">
            {queue.map((q) => (
              <div key={q.code} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <div className="flex items-start gap-2">
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-1.5 justify-end mb-0.5">
                      <span className={`text-[6px] px-1.5 py-0.5 rounded-full font-bold ${q.color}`}>{q.status}</span>
                      <p className="text-[9px] font-bold text-gray-800">{q.name}</p>
                    </div>
                    <p className="text-[7px] text-gray-400">{q.code} • {q.tests}</p>
                    <p className="text-[7px] text-purple-600 mt-0.5">⏱ وقت متوقع: {q.eta}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-sm">🧪</div>
                </div>
                <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                  <div className="flex-1 py-1 rounded-lg bg-purple-500 text-white text-center text-[7px] font-bold">معالجة ←</div>
                  <div className="flex-1 py-1 rounded-lg bg-gray-100 text-center text-[7px] text-gray-500">📤 إرسال</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
