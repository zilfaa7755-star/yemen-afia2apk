import React, { useState } from 'react';
import {
  ChevronLeft,
  BookOpen,
  User,
  Stethoscope,
  ClipboardList,
  Activity,
  Building2,
  Shield,
  Search,
} from 'lucide-react';
import {
  LoginRoleScreen,
  LoginPhoneScreen,
  LoginProfileScreen,
  HomeScreen,
  AIAssistantScreen,
  ClinicsScreen,
  DoctorSearchScreen,
  BookingScreen,
  BookingConfirmScreen,
  QueueTrackingScreen,
  AppointmentsScreen,
  MessagesScreen,
  HealthRecordScreen,
  MoreScreen,
  EmergencyScreen,
} from './PatientWireframes';
import {
  BloodDonationScreen,
  PharmacyScreen,
  NursingScreen,
  MedicationGuideScreen,
  MedicationRemindersScreen,
  MedicalNewsScreen,
  PointsScreen,
  ElectronicPrescriptionScreen,
  FamilyScreen,
  DoctorPlusScreen,
  MentalHealthScreen,
  MedicalFacilitiesScreen,
} from './ServicesWireframes';
import {
  SecretaryDashboardScreen,
  DoctorDashboardScreen,
  DoctorExaminationScreen,
  DoctorConsultationScreen,
  NurseDashboardScreen,
  FacilityHospitalScreen,
  FacilityPharmacyScreen,
  FacilityLabScreen,
} from './StaffWireframes';
import {
  AdminOverviewScreen,
  AdminUsersScreen,
  AdminAnnouncementsScreen,
  AdminSettingsScreen,
} from './AdminWireframes';

interface ScreenEntry {
  id: string;
  label: string;
  description: string;
  component: React.ComponentType;
}

interface Section {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  screens: ScreenEntry[];
}

const sections: Section[] = [
  {
    id: 'patient-core',
    label: 'المريض — الواجهات الأساسية',
    icon: User,
    color: 'text-[#199A8E]',
    screens: [
      { id: 'login-role', label: 'تسجيل الدخول — اختيار الدور', description: 'نقطة الدخول للتطبيق. ستة أنواع حسابات: مريض، طبيب، سكرتاري، ممرض، منشأة طبية، مدير نظام. كل دور بأيقونة ووصف.', component: LoginRoleScreen },
      { id: 'login-phone', label: 'تسجيل الدخول — رقم الهاتف', description: 'إدخال رقم هاتف يمني (+967) مع علم اليمن. 9 أرقام كحد أقصى. المرضى ينتقلون لملف صحي، بقية الأدوار يسجلون مباشرة.', component: LoginPhoneScreen },
      { id: 'login-profile', label: 'تسجيل الدخول — الملف الصحي', description: 'للمرضى فقط: الاسم، الجنس، سنة الميلاد، فصيلة الدم (8 فصائل)، الأمراض المزمنة، الحساسية من الأدوية، الأدوية المزمنة. يمكن التخطي.', component: LoginProfileScreen },
      { id: 'home', label: 'الصفحة الرئيسية', description: 'لوحة المريض: ترحيب، بحث، مساعد ذكي، زر طوارئ، 4 خدمات سريعة (عيادات، تبرع دم، نقاط، تذكيرات)، 9 خدمات إضافية، شريط تنقل سفلي.', component: HomeScreen },
      { id: 'ai-assistant', label: 'المساعد الذكي', description: 'محادثة تفاعلية: يصف المريض أعراضه، يحللها الروبوت ويقترح التخصص المناسب مع نصيحة وزر حجز مباشر. 6 أعراض سريعة + قاموس 21+ كلمة مفتاحية.', component: AIAssistantScreen },
      { id: 'clinics', label: 'العيادات الاستشارية', description: 'تصفح الأطباء: بحث، شبكة 10 تخصصات، بطاقات أطباء (تقييم، انتظار، وقت، مسافة، سعر)، زر حجز لكل طبيب.', component: ClinicsScreen },
      { id: 'doctor-search', label: 'البحث عن الأطباء — ملف الطبيب', description: 'بحث متقدم + شرائح تخصص. نافذة منبثقة بثلاثة تبويبات: الحجز (سبب الزيارة، دفع، تفصيل رسوم)، السيرة الذاتية، التقييمات.', component: DoctorSearchScreen },
      { id: 'booking', label: 'صفحة الحجز — الأعراض والدفع', description: '3 خطوات: الأعراض (نص + زر طوارئ)، الدفع (4 وسائل: MTN، Yemen Mobile، تحويل، نقداً)، التأكيد. شريط تقدم 3 مراحل.', component: BookingScreen },
      { id: 'booking-confirm', label: 'تأكيد الحجز — التذكرة', description: 'تذكرة ذكية: رقم طابور كبير، مرجع حجز فريد (YH-XXXX)، تفاصيل الموعد، رمز QR، حافة مثقبة، أزرار مشاركة ومتابعة الطابور.', component: BookingConfirmScreen },
      { id: 'queue-tracking', label: 'متابعة حالة الطابور', description: 'تتبع لحظي: رقم الطابور، الرقم الحالي، شريط تقدم، تنبيه ذكي (دورك/اقترب/يتقدم)، وقت متوقع، خريطة، اتجاهات، اتصال.', component: QueueTrackingScreen },
      { id: 'appointments', label: 'مواعيدي', description: 'تبويبان: القادمة/السابقة. 6 حالات موعد. شريط طابور مباشر، علامة طوارئ، أزرار (اتجاهات، تعديل، إلغاء)، رابط محادثة تقييم.', component: AppointmentsScreen },
      { id: 'messages', label: 'الرسائل — محادثة مع الطبيب', description: 'محادثة مباشرة: فقاعات رسائل، عداد غير مقروء، مؤشر وقت متبقي، تنبيه انتهاء، إرسال مرفقات، إدراج محلي فوري.', component: MessagesScreen },
      { id: 'health-record', label: 'السجل الصحي', description: 'إدارة السجلات: 3 بطاقات إحصائية، فلترة (تحاليل/أشعة/وصفات/تقارير)، إضافة جديد، تحميل ومشاركة مع طبيب.', component: HealthRecordScreen },
      { id: 'more', label: 'المزيد — الإعدادات', description: 'مركز الحساب: صورة + اسم + رقم مريض قابل للنسخ، 8 عناصر قائمة (ملف، سجل، إشعارات، موقع، دفع، شروط، خصوصية، مساعدة)، تسجيل خروج.', component: MoreScreen },
      { id: 'emergency', label: 'الطوارئ', description: 'زر إسعاف ضخم (199) بأيقونة نابضة، تحذير، قائمة مستشفيات مرتبة حسب المسافة، شارة الأقرب، أزرار (اتصال، طوارئ، اتجاهات).', component: EmergencyScreen },
    ],
  },
  {
    id: 'patient-services',
    label: 'المريض — الخدمات الإضافية',
    icon: BookOpen,
    color: 'text-teal-500',
    screens: [
      { id: 'blood-donation', label: 'التبرع بالدم', description: '3 تبويبات: الطلبات (فلترة فصيلة، إلحاح: حرج/عاجل/عاجل/عادي، اتصال)، بنوك الدم، تسجيل متبرع. إحصائيات + نشر طلب.', component: BloodDonationScreen },
      { id: 'pharmacy', label: 'صيدليتي', description: 'طلب أدوية: قائمة صيدليات مرتبة حسب المسافة، شارة توصيل، ساعات عمل، رفع صورة وصفة، نموذج طلب (دواء، عنوان، ملاحظات).', component: PharmacyScreen },
      { id: 'nursing', label: 'الخدمات المنزلية', description: 'رعاية منزلية: حقن، تغيير جروح، سحب دم، محاليل، مجارحة. فلترة، بطاقات بالسعر والمسافة، حجز بخطوات.', component: NursingScreen },
      { id: 'medication-guide', label: 'دليل الأدوية', description: 'مرجع دوائي: بحث فوري، تفاصيل (دواعي، موانع، أعراض جانبية، جرعات 3 فئات، حمل ورضاعة)، تنويه طبي.', component: MedicationGuideScreen },
      { id: 'medication-reminders', label: 'تذكيرات الدواء', description: 'جدول تذكيرات: إضافة (دواء، جرعة، تكرار، أوقات، أيام، نطاق تاريخ)، مفتاح تشغيل/إيقاف، حذف، شرائح وقت.', component: MedicationRemindersScreen },
      { id: 'medical-news', label: 'الأخبار الطبية', description: 'تصفح: فلترة 4 فئات (إنجاز/مؤتمر/خبر/بحث)، مقالات مميزة بشارة، مقالات عادية قابلة للتوسيع، وقت نسبي.', component: MedicalNewsScreen },
      { id: 'points', label: 'نقاطي ومكافآتي', description: 'نقاط ولاء: رصيد ذهبي، شبكة مكافآت (كشف مجاني، خصم، تحليل)، جدول كيف تكسب، سجل نشاط (+/-).', component: PointsScreen },
      { id: 'e-prescription', label: 'الوصفة الإلكترونية', description: 'إدارة وصفات: 3 تبويبات إحصائية، بحث، بطاقات وصفة (حالة، انتهاء، أدوية)، عرض QR، طباعة، صرف.', component: ElectronicPrescriptionScreen },
      { id: 'family', label: 'أفراد العائلة', description: 'إدارة عائلة: إضافة/تعديل أفراد (صلة قرابة، فصيلة دم، أمراض، حساسية)، حجز موعد نيابة، عرض تفصيلي.', component: FamilyScreen },
      { id: 'doctor-plus', label: 'طبيبي بلس', description: 'اشتراك مميز: 3 خطط (شهري/ربعي/سنوي مع خصومات)، جدول مقارنة مزايا، أسئلة شائعة، اشتراك.', component: DoctorPlusScreen },
      { id: 'mental-health', label: 'الدعم النفسي', description: 'صحة نفسية: 3 تبويبات (معالجون/مساعدة ذاتية/جلساتي). معالجون بتقييم وأساليب، حجز (فيديو/صوت/محادثة)، خصوصية.', component: MentalHealthScreen },
      { id: 'medical-facilities', label: 'المنشآت الطبية', description: 'دليل منشآت: بحث، شبكة 4 أنواع (مستشفى/مختبر/صيدلية/طوارئ)، فلترة (24ساعة/الأقرب)، بطاقات (تقييم، مسافة، حالة).', component: MedicalFacilitiesScreen },
    ],
  },
  {
    id: 'staff',
    label: 'الأدوار الطبية',
    icon: Stethoscope,
    color: 'text-green-600',
    screens: [
      { id: 'secretary', label: 'لوحة السكرتاري', description: 'إدارة طابور: 3 تبويبات (طابور/إضافة/تقرير). إدارة المرضى (بدء/إكمال/حذف)، إضافة يدوي، علامات حيوية، إشعارات، إحصائيات يومية.', component: SecretaryDashboardScreen },
      { id: 'doctor-today', label: 'لوحة الطبيب — مواعيد اليوم', description: 'مساحة عمل سريرية: 6 واجهات. طابور اليوم مع تتبع الحالة، الأعراض، رقم الطابور. تبويبات: اليوم/شهري/استشارة/مكتبة/رسائل/تقرير.', component: DoctorDashboardScreen },
      { id: 'doctor-exam', label: 'لوحة الطبيب — غرفة الفحص', description: 'فحص شامل: تشخيص + إدخال صوتي، وصفة إلكترونية (تحذيرات تفاعل/حساسية + QR)، طلب تحاليل، سجل طبي، تحويل. تبويبات فرعية.', component: DoctorExaminationScreen },
      { id: 'doctor-consult', label: 'غرفة استشارة الحالات', description: 'استشارة بين أطباء: مشاركة حالة معقدة، ردود (مستوى ثقة، تمييز مفيد)، مشاهدة، حالة (مفتوحة/محلولة). تفاعل وتبادل خبرات.', component: DoctorConsultationScreen },
      { id: 'nurse', label: 'لوحة الممرض', description: 'خدمات منزلية: 4 تبويبات (طلبات/تحويلات/تقرير/ملف). قبول/إكمال/تحويل طلبات، بطاقات بالخدمة والعنوان، روابط خرائط.', component: NurseDashboardScreen },
      { id: 'facility-hospital', label: 'لوحة المنشأة — مستشفى', description: 'إدارة مستشفى: تحويلات واردة (قبول/جدولة/رفض)، طلبات تبرع دم، قائمة مرضى، جدولة إجراءات، تحويلات صادرة.', component: FacilityHospitalScreen },
      { id: 'facility-pharmacy', label: 'لوحة المنشأة — صيدلية', description: 'إدارة صيدلية: بحث برمز مريض، صرف جزئي (اختيار أدوية محددة)، مخزون مع تنبيهات نقص (ألوان).', component: FacilityPharmacyScreen },
      { id: 'facility-lab', label: 'لوحة المنشأة — مختبر', description: 'طابور مختبر ذكي: بحث برمز، إضافة للطابور مع وقت متوقع، معالجة وإرسال نتائج مع إشعار المريض.', component: FacilityLabScreen },
    ],
  },
  {
    id: 'admin',
    label: 'مدير النظام',
    icon: Shield,
    color: 'text-slate-700',
    screens: [
      { id: 'admin-overview', label: 'لوحة الإدارة — نظرة عامة', description: 'مؤشرات أداء (KPIs) مع اتجاهات، توزيع الخدمات بأشرطة تقدم، توزيع جغرافي. 8 تبويبات: نظرة/مستخدمون/مواعيد/خدمات/منشآت/تقارير/إعلانات/إعدادات.', component: AdminOverviewScreen },
      { id: 'admin-users', label: 'لوحة الإدارة — المستخدمون', description: 'إدارة مستخدمين: بحث، فلترة بالدور (مرضى/أطباء/سكرتاري/ممرضون/منشآت)، تفعيل/إيقاف/حذف، مؤشر حالة نشط/غير نشط.', component: AdminUsersScreen },
      { id: 'admin-announcements', label: 'لوحة الإدارة — الإعلانات', description: 'بث إعلانات: عنوان + محتوى، فئة مستهدفة (الكل/مرضى/أطباء/منشآت)، أولوية (عادي/مهم/عاجل)، قائمة الإعلانات السابقة.', component: AdminAnnouncementsScreen },
      { id: 'admin-settings', label: 'لوحة الإدارة — الإعدادات', description: 'تحكم النظام: مفاتيح ميزات (صيانة، حجز، تسجيل، مساعد ذكي، إشعارات)، إعدادات رقمية (حد مواعيد، نقاط)، سجل نشاط المدير.', component: AdminSettingsScreen },
    ],
  },
];

export function VisualGuidePage({ onExit }: { onExit: () => void }) {
  const [activeSection, setActiveSection] = useState<string>('patient-core');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScreen, setSelectedScreen] = useState<ScreenEntry | null>(null);

  const filteredSections = sections
    .filter((s) => !searchQuery || s.screens.some((sc) => sc.label.includes(searchQuery) || sc.description.includes(searchQuery)))
    .map((s) => ({
      ...s,
      screens: s.screens.filter((sc) => !searchQuery || sc.label.includes(searchQuery) || sc.description.includes(searchQuery)),
    }));

  if (selectedScreen) {
    const ScreenComponent = selectedScreen.component;
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-b from-[#104C48] via-[#125853] to-[#199A8E] px-4 py-3 sticky top-0 z-50">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedScreen(null)}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={22} className="text-white rotate-180" />
            </button>
            <h1 className="text-white text-base font-bold">{selectedScreen.label}</h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <ScreenComponent />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl w-full">
              <h2 className="text-lg font-bold text-gray-800 mb-2 text-right">{selectedScreen.label}</h2>
              <p className="text-gray-600 text-sm leading-relaxed text-right">{selectedScreen.description}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedScreen(null)}
                className="px-6 py-3 bg-[#199A8E] text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
              >
                العودة للدليل
              </button>
              <button
                onClick={onExit}
                className="px-6 py-3 bg-white text-gray-600 rounded-xl font-bold text-sm border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                الخروج من الدليل
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#104C48] via-[#125853] to-[#199A8E] px-4 pt-10 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onExit}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={22} className="text-white rotate-180" />
            </button>
            <div className="text-center">
              <h1 className="text-white text-xl font-black">الدليل البصري الشامل</h1>
              <p className="text-white/70 text-xs mt-0.5">جميع واجهات وخدمات تطبيق يمن عافية</p>
            </div>
            <div className="w-10" />
          </div>
          {/* Search */}
          <div className="bg-white rounded-2xl shadow-lg flex items-center px-4 py-3 gap-3">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن واجهة أو خدمة..."
              className="flex-1 text-gray-700 placeholder-gray-400 outline-none text-sm bg-transparent text-right"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 text-xs">
                مسح
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#199A8E] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Screens Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {filteredSections
          .filter((s) => s.id === activeSection)
          .map((section) => (
            <div key={section.id}>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <section.icon size={22} className={section.color} />
                  <h2 className="text-lg font-bold text-gray-800">{section.label}</h2>
                </div>
                <p className="text-gray-500 text-sm">
                  {section.screens.length} واجهة — اضغط على أي واجهة لعرضها بحجم أكبر مع وصف تفصيلي
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.screens.map((screen) => {
                  const ScreenComponent = screen.component;
                  return (
                    <button
                      key={screen.id}
                      onClick={() => setSelectedScreen(screen)}
                      className="group flex flex-col items-center"
                    >
                      <div className="overflow-hidden rounded-2xl shadow-md border border-gray-100 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                        <div style={{ transform: 'scale(0.5)', transformOrigin: 'top center' }}>
                          <ScreenComponent />
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-bold text-gray-700 text-center group-hover:text-[#199A8E] transition-colors">
                        {screen.label}
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1 line-clamp-2 max-w-[260px]">
                        {screen.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">لا توجد نتائج مطابقة</p>
          </div>
        )}
      </div>
    </div>
  );
}
