import React from 'react';
import { PhoneFrame, StatusBar, WBox, WLine, WTitle, WMuted, WHeader, WBottomNav, WTabBar, WPill, WIconCircle, WButton } from './Wireframe';

// ═══════════════════════════════════════════════════════════════════════════
// 1. ADMIN DASHBOARD — Overview
// ═══════════════════════════════════════════════════════════════════════════
export function AdminOverviewScreen() {
  const kpis = [
    { label: 'المستخدمون', value: '12,450', trend: '↑ 8%', color: 'text-green-600' },
    { label: 'المواعيد', value: '3,280', trend: '↑ 12%', color: 'text-green-600' },
    { label: 'المنشآت', value: '85', trend: '↑ 3%', color: 'text-green-600' },
    { label: 'الإيرادات', value: '2.4M', trend: '↓ 2%', color: 'text-red-500' },
  ];
  return (
    <PhoneFrame label="لوحة الإدارة — نظرة عامة">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">⚙</div>
            <div className="text-center">
              <h3 className="text-white text-[11px] font-bold">لوحة الإدارة</h3>
              <p className="text-white/60 text-[7px]">نظرة عامة</p>
            </div>
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">🔔</div>
          </div>
        </div>
        <div className="flex gap-1 px-3 py-2 bg-white border-b border-gray-100 overflow-x-auto">
          {['نظرة', 'مستخدمون', 'مواعيد', 'خدمات', 'منشآت', 'تقارير', 'إعلانات', 'إعدادات'].map((t, i) => (
            <div key={t} className={`px-2.5 py-1 rounded-lg text-[7px] font-bold whitespace-nowrap ${i === 0 ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-500'}`}>{t}</div>
          ))}
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {kpis.map((k) => (
              <div key={k.label} className="bg-white rounded-xl p-2.5 border border-gray-100">
                <p className="text-[7px] text-gray-400">{k.label}</p>
                <p className="text-lg font-bold text-gray-800">{k.value}</p>
                <p className={`text-[7px] font-bold ${k.color}`}>{k.trend}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 mb-3">
            <p className="text-[8px] font-bold text-gray-700 mb-2">توزيع الخدمات</p>
            <div className="space-y-1.5">
              {[
                ['التمريض', 80, 'bg-[#199A8E]'],
                ['الصيدلية', 65, 'bg-teal-500'],
                ['المختبر', 50, 'bg-purple-500'],
                ['تبرع الدم', 35, 'bg-red-500'],
              ].map(([l, w, c]) => (
                <div key={l as string} className="flex items-center gap-2">
                  <span className="text-[7px] text-gray-500 w-12">{l}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full">
                    <div className={`h-2 ${c} rounded-full`} style={{ width: `${w}%` }} />
                  </div>
                  <span className="text-[7px] text-gray-600">{w}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-[8px] font-bold text-gray-700 mb-2">التوزيع الجغرافي</p>
            <div className="space-y-1">
              {[['صنعاء', '45%'], ['عدن', '20%'], ['تعز', '15%'], ['الحديدة', '10%']].map(([c, p]) => (
                <div key={c} className="flex justify-between text-[7px]">
                  <span className="text-gray-500">{c}</span>
                  <span className="text-gray-700 font-bold">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. ADMIN — User Management
// ═══════════════════════════════════════════════════════════════════════════
export function AdminUsersScreen() {
  const users = [
    { name: 'محمد أحمد', role: 'مريض', phone: '777123456', active: true },
    { name: 'د. فاطمة الشامي', role: 'طبيب', phone: '777654321', active: true },
    { name: 'سكرتاري علي', role: 'سكرتاري', phone: '778987654', active: false },
  ];
  return (
    <PhoneFrame label="لوحة الإدارة — المستخدمون">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">إدارة المستخدمين</h3>
            <div className="w-6" />
          </div>
          <div className="bg-white/95 rounded-xl flex items-center px-2.5 py-2 gap-2">
            <span className="text-gray-300 text-xs">🔍</span>
            <span className="text-[8px] text-gray-400 flex-1">ابحث عن مستخدم...</span>
          </div>
        </div>
        <div className="flex gap-1 px-3 py-2 bg-white border-b border-gray-100 overflow-x-auto">
          {['الكل', 'مرضى', 'أطباء', 'سكرتاري', 'ممرضون', 'منشآت'].map((t, i) => (
            <div key={t} className={`px-2.5 py-1 rounded-full text-[7px] font-bold whitespace-nowrap ${i === 0 ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-500'}`}>{t}</div>
          ))}
        </div>
        <div className="p-3 space-y-2">
          {users.map((u) => (
            <div key={u.name} className="bg-white rounded-xl p-2.5 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-[7px] text-gray-500">✓</div>
                  <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center text-[7px] text-red-500">✗</div>
                </div>
                <div className="flex-1 text-right">
                  <div className="flex items-center gap-1.5 justify-end mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-[7px] text-gray-500">{u.role}</span>
                    <p className="text-[9px] font-bold text-gray-800">{u.name}</p>
                  </div>
                  <p className="text-[7px] text-gray-400">{u.phone}</p>
                </div>
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm">👤</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. ADMIN — Announcements
// ═══════════════════════════════════════════════════════════════════════════
export function AdminAnnouncementsScreen() {
  return (
    <PhoneFrame label="لوحة الإدارة — الإعلانات">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">الإعلانات</h3>
            <div className="bg-white/20 rounded-lg px-2 py-1 text-white text-[8px] font-bold">＋ جديد</div>
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-[8px] font-bold text-gray-700 mb-2">بث إعلان جديد</p>
            <div className="space-y-1.5">
              <div className="p-2 rounded-lg border border-gray-200 bg-gray-50"><WLine w="w-24" /></div>
              <div className="p-2 rounded-lg border border-gray-200 bg-gray-50 h-12"><WLine w="w-full" /><div className="h-1" /><WLine w="w-16" /></div>
              <div>
                <p className="text-[7px] font-semibold text-gray-600 mb-1">الفئة المستهدفة</p>
                <div className="flex gap-1">
                  {['الكل', 'مرضى', 'أطباء', 'منشآت'].map((t, i) => (
                    <div key={t} className={`px-2 py-1 rounded-lg text-[7px] font-bold ${i === 0 ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-500'}`}>{t}</div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[7px] font-semibold text-gray-600 mb-1">الأولوية</p>
                <div className="flex gap-1">
                  {['عادي', 'مهم', 'عاجل'].map((t, i) => (
                    <div key={t} className={`px-2 py-1 rounded-lg text-[7px] font-bold ${i === 1 ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{t}</div>
                  ))}
                </div>
              </div>
              <WButton label="📢 بث الإعلان" color="bg-slate-700" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
            <div className="flex items-center gap-1.5 justify-end mb-1">
              <span className="text-[6px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">مهم</span>
              <p className="text-[8px] font-bold text-gray-800">صيانة مجدولة</p>
            </div>
            <p className="text-[7px] text-gray-500 text-right">سيتم إيقاف الخدمة لصيانة في 25 أغسطس</p>
            <p className="text-[6px] text-gray-400 mt-0.5">قبل 2 ساعة • للجميع</p>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. ADMIN — Settings
// ═══════════════════════════════════════════════════════════════════════════
export function AdminSettingsScreen() {
  const toggles = [
    { label: 'وضع الصيانة', on: false },
    { label: 'الحجز المفتوح', on: true },
    { label: 'تسجيل المستخدمين', on: true },
    { label: 'المساعد الذكي', on: true },
    { label: 'إشعارات الطابور', on: true },
  ];
  return (
    <PhoneFrame label="لوحة الإدارة — الإعدادات">
      <div className="h-full bg-gray-50 overflow-y-auto">
        <StatusBar dark />
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-3 pt-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs">›</div>
            <h3 className="text-white text-[11px] font-bold">الإعدادات</h3>
            <div className="w-6" />
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-[8px] font-bold text-gray-700 mb-2">مفاتيح الميزات</p>
            <div className="space-y-2">
              {toggles.map((t) => (
                <div key={t.label} className="flex items-center justify-between">
                  <div className={`w-8 h-4 rounded-full flex items-center px-0.5 ${t.on ? 'bg-green-500 justify-end' : 'bg-gray-200 justify-start'}`}>
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                  <span className="text-[8px] text-gray-600">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-[8px] font-bold text-gray-700 mb-2">إعدادات رقمية</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-16 p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-center"><span className="text-[7px] text-gray-500">30</span></div>
                <span className="text-[8px] text-gray-600">حد المواعيد اليومية</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="w-16 p-1.5 rounded-lg border border-gray-200 bg-gray-50 text-center"><span className="text-[7px] text-gray-500">500</span></div>
                <span className="text-[8px] text-gray-600">نقاط التسجيل</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="text-[8px] font-bold text-gray-700 mb-2">سجل نشاط المدير</p>
            <div className="space-y-1">
              {['تعطيل حساب سكرتاري', 'بث إعلان صيانة', 'تعديل حد المواعيد'].map((a) => (
                <div key={a} className="flex items-center justify-between text-[7px]">
                  <span className="text-gray-400">قبل ساعة</span>
                  <span className="text-gray-500">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
