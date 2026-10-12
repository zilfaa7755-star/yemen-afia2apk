import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Stethoscope,
  Droplets,
  Building2,
  Pill,
  Users,
  FileText,
  BookOpen,
  BellRing,
  Activity,
  Home,
  QrCode,
  HeartPulse,
  Newspaper,
  Sparkles,
  AlertTriangle,
  Phone,
  Sparkle,
  LogOut,
  Bell,
  Layers,
  ArrowLeft,
  User,
  UserPlus,
  Check,
  X,
  Heart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { YemenAfiaLogo } from '../components/common/YemenAfiaLogo';

interface HomePageProps {
  onNavigate?: (page: string, data?: unknown) => void;
  onSelectDoctor?: (doctor: any) => void;
}

// ── 13 Core Services ─────────────────────────────────────────────────────────
const full13Services = [
  {
    id: 'clinics',
    title: 'العيادات والاستشارات',
    desc: 'حجز أطباء ومواعيد حضورية',
    icon: Stethoscope,
    bg: 'bg-[#E8F5F4]',
    color: 'text-[#199A8E]',
    badge: 'فوري',
  },
  {
    id: 'blood-search',
    title: 'البحث عن دم ومتبرعين',
    desc: 'فصائل متوفرة ونداءات عاجلة',
    icon: Droplets,
    bg: 'bg-rose-50',
    color: 'text-[#E53935]',
    badge: 'طوارئ',
  },
  {
    id: 'medical-facilities',
    title: 'المنشآت والمستشفيات',
    desc: 'دليل المستشفيات والمراكز',
    icon: Building2,
    bg: 'bg-sky-50',
    color: 'text-sky-600',
    badge: 'خريطة',
  },
  {
    id: 'pharmacy',
    title: 'صيدليتي والبحث عن دواء',
    desc: 'مخزون الأدوية وتوصيل سريع',
    icon: Pill,
    bg: 'bg-emerald-50',
    color: 'text-emerald-600',
    badge: 'صيدليات',
  },
  {
    id: 'family',
    title: 'أفراد العائلة',
    desc: 'إدارة ملفات ومواعيد الأسرة',
    icon: Users,
    bg: 'bg-indigo-50',
    color: 'text-indigo-600',
    badge: 'ملفات',
  },
  {
    id: 'health-record',
    title: 'السجل الصحي وبطاقة الطوارئ',
    desc: 'الملف الموحد والتحاليل والـ QR',
    icon: FileText,
    bg: 'bg-teal-50',
    color: 'text-[#104C48]',
    badge: 'مشفر',
  },
  {
    id: 'medication-guide',
    title: 'دليل الأدوية والجرعات',
    desc: 'دواعي الاستعمال والتعارضات',
    icon: BookOpen,
    bg: 'bg-amber-50',
    color: 'text-amber-700',
    badge: 'شامل',
  },
  {
    id: 'medication-reminders',
    title: 'تذكيرات الدواء اليومية',
    desc: 'جدولة المنبه والجرعات بالوقت',
    icon: BellRing,
    bg: 'bg-orange-50',
    color: 'text-orange-600',
    badge: 'منبه',
  },
  {
    id: 'tracking',
    title: 'المتابعات الصحية والقياسات',
    desc: 'متابعة الحمل والضغط والجلسات',
    icon: Activity,
    bg: 'bg-cyan-50',
    color: 'text-cyan-700',
    badge: 'مخططات',
  },
  {
    id: 'nursing',
    title: 'الرعاية المنزلية والتمريض',
    desc: 'حقن، محاليل، وتضميد جراح منزلي',
    icon: Home,
    bg: 'bg-violet-50',
    color: 'text-violet-600',
    badge: 'منزلي',
  },
  {
    id: 'electronic-prescription',
    title: 'الوصفة الإلكترونية وQR',
    desc: 'صرف الروشتة المباشر بباركود',
    icon: QrCode,
    bg: 'bg-[#E8F5F4]',
    color: 'text-[#104C48]',
    badge: 'باركود',
  },
  {
    id: 'chronic-disease',
    title: 'الأمراض المزمنة (ضغط وسكر)',
    desc: 'سجل القراءات وتنبيهات الأمان',
    icon: HeartPulse,
    bg: 'bg-red-50',
    color: 'text-red-600',
    badge: 'حيوي',
  },
  {
    id: 'medical-news',
    title: 'الأخبار والمقالات الطبية',
    desc: 'نشرات التوعية وأبحاث الصحة',
    icon: Newspaper,
    bg: 'bg-slate-100',
    color: 'text-slate-700',
    badge: 'جديد',
  },
];

// Awareness & Health Advice Carousel Data
const healthAdviceSlides = [
  {
    id: 's1',
    title: 'حملة الوقاية من حمى الضنك والكوليرا الموسمية',
    desc: 'احرص على تغطية خزانات المياه واستخدام الناموسيات وتناول السوائل المعقمة في موسم الأمطار لتعزيز مناعة الأسرة.',
    tag: 'إرشاد وقائي وطني عاجل',
    doctor: 'اللجنة الوطنية للرعاية الوقائية — صنعاء',
    bgGradient: 'from-[#104C48] via-[#125853] to-[#199A8E]',
  },
  {
    id: 's2',
    title: 'إرشادات ضبط ضغط الدم ومعدل نبضات القلب',
    desc: 'التقليل من استهلاك ملح الطعام وممارسة المشي 30 دقيقة يومياً يخفف إجهاد عضلة القلب بنسبة 25%.',
    tag: 'صحة القلب والشرايين',
    doctor: 'د. سامي المقطري — استشاري أمراض القلب',
    bgGradient: 'from-[#0B337A] via-[#104C48] to-[#199A8E]',
  },
  {
    id: 's3',
    title: 'تغذية الأطفال في الأشهر الأولى واللقاحات الأساسية',
    desc: 'احرص على استكمال جدول التطعيمات الوطني الدوري في أقرب مركز صحي أو مستشفى لحماية طفلك من الأوبئة.',
    tag: 'طب الأطفال واللقاحات',
    doctor: 'د. فاطمة الشامي — استشارية طب الأطفال',
    bgGradient: 'from-[#072456] via-[#0B337A] to-[#104C48]',
  },
  {
    id: 's4',
    title: 'نصائح لمرضى السكري خلال فترات التغير المناخي',
    desc: 'فحص معدل السكر التراكمي وتناول كميات وفيرة من الماء والحرص على فحص القدمين يومياً يمنع المضاعفات الحادة.',
    tag: 'رعاية الأمراض المزمنة',
    doctor: 'د. محمد العولقي — استشاري الباطنية',
    bgGradient: 'from-[#104C48] via-[#1565C0] to-[#199A8E]',
  },
];

// ── Family Account System (تبديل الحساب بين أفراد العائلة) ──────────────────────
export interface FamilyAccount {
  id: string;
  name: string;
  shortName: string;
  relation: 'self' | 'spouse' | 'son' | 'daughter' | 'father' | 'mother' | 'brother' | 'sister' | 'other';
  relationLabel: string;
  avatarIcon: string;
  badgeBg: string;
  badgeColor: string;
  gender: 'male' | 'female';
  bloodType?: string;
  patientCode: string;
  age?: number;
}

const defaultFamilyAccounts: FamilyAccount[] = [
  {
    id: 'self',
    name: 'أحمد محمد الأغبري',
    shortName: 'أحمد',
    relation: 'self',
    relationLabel: 'أنا (الأساسي)',
    avatarIcon: '👤',
    badgeBg: 'bg-emerald-50',
    badgeColor: 'text-emerald-700',
    gender: 'male',
    bloodType: 'A+',
    patientCode: 'YA-777001',
    age: 34,
  },
  {
    id: 'm-son',
    name: 'خالد أحمد الأغبري',
    shortName: 'خالد',
    relation: 'son',
    relationLabel: 'ابن',
    avatarIcon: '👦',
    badgeBg: 'bg-blue-50',
    badgeColor: 'text-blue-700',
    gender: 'male',
    bloodType: 'B+',
    patientCode: 'YA-777002',
    age: 14,
  },
  {
    id: 'm-daughter',
    name: 'سارة أحمد الأغبري',
    shortName: 'سارة',
    relation: 'daughter',
    relationLabel: 'ابنة',
    avatarIcon: '👧',
    badgeBg: 'bg-pink-50',
    badgeColor: 'text-pink-700',
    gender: 'female',
    bloodType: 'A+',
    patientCode: 'YA-777003',
    age: 10,
  },
  {
    id: 'm-spouse',
    name: 'أم خالد (فاطمة)',
    shortName: 'أم خالد',
    relation: 'spouse',
    relationLabel: 'زوجة',
    avatarIcon: '🧕',
    badgeBg: 'bg-purple-50',
    badgeColor: 'text-purple-700',
    gender: 'female',
    bloodType: 'A+',
    patientCode: 'YA-777004',
    age: 36,
  },
  {
    id: 'm-mother',
    name: 'الوالدة أم أحمد (حليمة)',
    shortName: 'الوالدة',
    relation: 'mother',
    relationLabel: 'أم',
    avatarIcon: '👵',
    badgeBg: 'bg-amber-50',
    badgeColor: 'text-amber-700',
    gender: 'female',
    bloodType: 'O+',
    patientCode: 'YA-777005',
    age: 62,
  },
  {
    id: 'm-father',
    name: 'الحاج محمد الأغبري',
    shortName: 'الوالد',
    relation: 'father',
    relationLabel: 'أب',
    avatarIcon: '👴',
    badgeBg: 'bg-cyan-50',
    badgeColor: 'text-cyan-700',
    gender: 'male',
    bloodType: 'O+',
    patientCode: 'YA-777006',
    age: 68,
  },
];

function getRelationMeta(relation: string): { label: string; icon: string; bg: string; color: string } {
  switch (relation) {
    case 'son':
      return { label: 'ابن', icon: '👦', bg: 'bg-blue-50', color: 'text-blue-700' };
    case 'daughter':
      return { label: 'ابنة', icon: '👧', bg: 'bg-pink-50', color: 'text-pink-700' };
    case 'spouse':
      return { label: 'زوجة', icon: '🧕', bg: 'bg-purple-50', color: 'text-purple-700' };
    case 'mother':
      return { label: 'أم', icon: '👵', bg: 'bg-amber-50', color: 'text-amber-700' };
    case 'father':
      return { label: 'أب', icon: '👴', bg: 'bg-cyan-50', color: 'text-cyan-700' };
    case 'brother':
      return { label: 'أخ', icon: '👨', bg: 'bg-indigo-50', color: 'text-indigo-700' };
    case 'sister':
      return { label: 'أخت', icon: '👩', bg: 'bg-rose-50', color: 'text-rose-700' };
    default:
      return { label: 'فرد عائلة', icon: '👤', bg: 'bg-slate-100', color: 'text-slate-700' };
  }
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { user, switchRole, logout } = useAuth();
  const [familyAccounts, setFamilyAccounts] = useState<FamilyAccount[]>(defaultFamilyAccounts);
  const [activeAccountId, setActiveAccountId] = useState<string>('self');
  const [showFamilyPicker, setShowFamilyPicker] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [switchFeedback, setSwitchFeedback] = useState<string | null>(null);

  // New member quick form state
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState<'son' | 'daughter' | 'spouse' | 'mother' | 'father' | 'other'>('son');
  const [newGender, setNewGender] = useState<'male' | 'female'>('male');
  const [newBloodType, setNewBloodType] = useState('O+');
  const [newAge, setNewAge] = useState('');

  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(2);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showAllServices, setShowAllServices] = useState(false);

  // Load and sync family accounts from localStorage / Auth
  const syncAccounts = () => {
    const mainName = user?.full_name || 'أحمد محمد الأغبري';
    const mainUserAccount: FamilyAccount = {
      id: 'self',
      name: mainName,
      shortName: mainName.split(' ')[0] || 'أحمد',
      relation: 'self',
      relationLabel: 'أنا (الأساسي)',
      avatarIcon: '👤',
      badgeBg: 'bg-emerald-50',
      badgeColor: 'text-emerald-700',
      gender: (user as any)?.gender || 'male',
      bloodType: (user as any)?.blood_type || 'A+',
      patientCode: (user as any)?.patient_code || 'YA-777001',
      age: (user as any)?.age || 34,
    };

    let customMembers: FamilyAccount[] = [];
    try {
      const stored = localStorage.getItem('yemenAfiya_family_members');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          customMembers = parsed.map((m: any, idx: number) => {
            const meta = getRelationMeta(m.relation);
            let ageVal = undefined;
            if (m.date_of_birth) {
              ageVal = Math.floor((Date.now() - new Date(m.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000));
            } else if (m.age) {
              ageVal = Number(m.age);
            }
            return {
              id: m.id || `custom-${idx}`,
              name: m.name,
              shortName: m.name.split(' ')[0],
              relation: m.relation || 'other',
              relationLabel: meta.label,
              avatarIcon: meta.icon,
              badgeBg: meta.bg,
              badgeColor: meta.color,
              gender: m.gender || (m.relation === 'daughter' || m.relation === 'spouse' || m.relation === 'mother' ? 'female' : 'male'),
              bloodType: m.blood_type || 'A+',
              patientCode: `YA-777${String(idx + 2).padStart(3, '0')}`,
              age: ageVal,
            };
          });
        }
      }
    } catch {}

    const remainingDefaults = defaultFamilyAccounts.filter((d) => d.id !== 'self');
    const combined = [mainUserAccount, ...(customMembers.length > 0 ? customMembers : remainingDefaults)];
    setFamilyAccounts(combined);

    const savedId = localStorage.getItem('yemenAfiya_active_account_id');
    if (savedId && combined.some((c) => c.id === savedId)) {
      setActiveAccountId(savedId);
    }
  };

  useEffect(() => {
    syncAccounts();
    const handleUpdate = () => syncAccounts();
    window.addEventListener('yemenAfiya_family_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('yemenAfiya_family_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [user]);

  const activeAccount = familyAccounts.find((a) => a.id === activeAccountId) || familyAccounts[0] || defaultFamilyAccounts[0];

  const handleSelectAccount = (account: FamilyAccount) => {
    setActiveAccountId(account.id);
    setShowFamilyPicker(false);
    localStorage.setItem('yemenAfiya_active_account_id', account.id);
    localStorage.setItem('yemenAfiya_active_patient_profile', JSON.stringify(account));
    
    setSwitchFeedback(`تم تبديل المستخدم بنجاح إلى: ${account.name} (${account.relationLabel})`);
    setTimeout(() => {
      setSwitchFeedback(null);
    }, 3500);
  };

  const handleQuickAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const meta = getRelationMeta(newRelation);
    const newId = `fam-${Date.now()}`;
    const newMember: FamilyAccount = {
      id: newId,
      name: newName.trim(),
      shortName: newName.trim().split(' ')[0],
      relation: newRelation,
      relationLabel: meta.label,
      avatarIcon: meta.icon,
      badgeBg: meta.bg,
      badgeColor: meta.color,
      gender: newGender,
      bloodType: newBloodType,
      patientCode: `YA-777${Math.floor(100 + Math.random() * 900)}`,
      age: newAge ? parseInt(newAge) : undefined,
    };

    // Store in localStorage for FamilyPage sync
    try {
      const stored = localStorage.getItem('yemenAfiya_family_members');
      const currentList = stored ? JSON.parse(stored) : defaultFamilyAccounts.filter((d) => d.id !== 'self');
      const updatedList = [
        ...currentList,
        {
          id: newId,
          user_id: user?.id || 'demo',
          name: newMember.name,
          relation: newMember.relation,
          gender: newMember.gender,
          blood_type: newMember.bloodType,
          age: newMember.age,
        },
      ];
      localStorage.setItem('yemenAfiya_family_members', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('yemenAfiya_family_updated'));
    } catch {}

    const updatedAccounts = [...familyAccounts, newMember];
    setFamilyAccounts(updatedAccounts);
    handleSelectAccount(newMember);

    // Reset form
    setNewName('');
    setNewAge('');
    setShowAddMemberModal(false);
  };

  // Auto-rotate advice carousel every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % healthAdviceSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Split into first 6 services and remaining 7
  const initialSixServices = full13Services.slice(0, 6);
  const remainingServices = full13Services.slice(6);

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-32 relative">
      {/* ── Switch User Toast Feedback ── */}
      {switchFeedback && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#104C48] text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-[#199A8E]/40 animate-slide-down text-xs font-bold">
          <div className="w-5 h-5 rounded-full bg-[#199A8E] flex items-center justify-center shrink-0">
            <Check size={13} className="text-white" strokeWidth={3} />
          </div>
          <span>{switchFeedback}</span>
        </div>
      )}

      {/* ── TOP HEADER (Brand, Patient Greeting, Family Account Switcher, Bell, Role Switcher) ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-3 shadow-[0_2px_10px_-4px_rgba(25,154,142,0.06)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Right Slot (RTL Start): Greeting & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5F4] text-[#199A8E] flex items-center justify-center font-bold text-base border border-[#199A8E]/20 shadow-sm shrink-0">
              <YemenAfiaLogo variant="symbol" size="sm" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-start">
                <p className="text-slate-400 text-xs font-medium">
                  مرحباً بك، <span className="text-[#104C48] font-bold">{activeAccount.shortName}</span>
                </p>
                {activeAccount.relation !== 'self' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#199A8E]/10 text-[#199A8E] border border-[#199A8E]/20">
                    {activeAccount.relationLabel}
                  </span>
                )}
              </div>
              <h1 className="text-sm md:text-base font-bold text-[#104C48] -mt-0.5">
                يمن عافية للرعاية الصحية
              </h1>
              {activeAccount.relation !== 'self' && (
                <p className="text-[10px] text-slate-500 font-medium">
                  الحساب النشط: {activeAccount.name} • {activeAccount.patientCode}
                </p>
              )}
            </div>
          </div>

          {/* Left Slot (RTL End): Family Account Switcher, Notification Bell, 5 Interfaces Button */}
          <div className="flex items-center gap-2">
            {/* Family Members Account Switcher (تبديل مستخدم بين أفراد العائلة) */}
            <div className="relative">
              <button
                onClick={() => setShowFamilyPicker(!showFamilyPicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F5F4] hover:bg-[#daf0ee] text-[#104C48] text-xs font-semibold transition active:scale-95 border border-[#199A8E]/30 shadow-2xs"
                title="تبديل الحساب بين أفراد العائلة"
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-2xs flex items-center justify-center text-xs shrink-0">
                  {activeAccount.avatarIcon}
                </div>
                <div className="text-right leading-tight max-w-[110px] sm:max-w-[130px] truncate">
                  <span className="font-bold text-[#104C48]">{activeAccount.shortName}</span>
                  <span className="text-[10px] text-[#199A8E] font-medium mr-1">({activeAccount.relationLabel})</span>
                </div>
                <ChevronDown size={13} className={`text-slate-500 transition-transform duration-200 ${showFamilyPicker ? 'rotate-180' : ''}`} />
              </button>

              {/* Family Accounts Dropdown Menu */}
              {showFamilyPicker && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-2 z-50 animate-slide-down text-right">
                  <div className="px-3 py-2 border-b border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users size={16} className="text-[#199A8E]" />
                      <span className="text-xs font-bold text-[#104C48]">تبديل الحساب / أفراد العائلة</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {familyAccounts.length} حسابات
                    </span>
                  </div>

                  <div className="py-1 max-h-64 overflow-y-auto space-y-1">
                    {familyAccounts.map((acc) => {
                      const isSelected = activeAccount.id === acc.id;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => handleSelectAccount(acc)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl transition text-right ${
                            isSelected
                              ? 'bg-[#E8F5F4] text-[#104C48] font-bold border border-[#199A8E]/30 shadow-2xs'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-base shrink-0 shadow-2xs">
                              {acc.avatarIcon}
                            </div>
                            <div className="min-w-0 text-right">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold truncate max-w-[130px]">{acc.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${acc.badgeBg} ${acc.badgeColor}`}>
                                  {acc.relationLabel}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                                {acc.patientCode} {acc.age ? `• ${acc.age} سنة` : ''} {acc.bloodType ? `• ${acc.bloodType}` : ''}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#199A8E] text-white flex items-center justify-center shrink-0">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-1 border-t border-[#E2E8F0] space-y-1">
                    <button
                      onClick={() => {
                        setShowFamilyPicker(false);
                        setShowAddMemberModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#199A8E] text-white hover:bg-[#104C48] text-xs font-bold transition active:scale-95 shadow-sm"
                    >
                      <UserPlus size={14} />
                      <span>إضافة فرد عائلة جديد (ابن/ابنة/زوجة/أم/أب)</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowFamilyPicker(false);
                        onNavigate?.('family');
                      }}
                      className="w-full text-center py-1.5 text-[11px] text-[#199A8E] hover:text-[#104C48] font-bold hover:underline"
                    >
                      إدارة كافة ملفات العائلة والسجلات ↗
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white border border-[#E2E8F0] text-slate-600 hover:text-[#104C48] flex items-center justify-center transition active:scale-95 shadow-sm"
                title="الإشعارات والتنبيهات"
              >
                <Bell size={17} />
                {notificationsCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E53935] ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-3 z-40 animate-slide-down text-right">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-2">
                    <span className="text-xs font-bold text-[#104C48]">التنبيهات والمواعيد</span>
                    <button
                      onClick={() => setNotificationsCount(0)}
                      className="text-[10px] text-[#199A8E] hover:underline"
                    >
                      تعيين كمقروء
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-xl bg-[#E8F5F4] text-[#104C48]">
                      <p className="font-bold">تذكير بموعد العيادة</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">موعدك في عيادة الباطنية اليوم الساعة 04:30 م.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-50 text-[#E53935]">
                      <p className="font-bold">نداء فصيلة دم عاجل O+</p>
                      <p className="text-[11px] text-rose-700 mt-0.5">مستشفى الثورة بحاجة لمتبرعين عاجلين.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Role / 5 interfaces Switcher */}
            <button
              onClick={() => {
                logout();
                window.dispatchEvent(new CustomEvent('nav-to-main'));
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#199A8E]/50 text-slate-700 hover:text-[#104C48] text-xs font-bold transition active:scale-95 shadow-sm"
              title="العودة لشاشة الواجهات الخمس"
            >
              <LogOut size={14} className="text-[#E53935]" />
              <span className="hidden sm:inline">الواجهات الخمس</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── FAST ROLE QUICK JUMP (Optional compact strip) ── */}
      <div className="max-w-3xl mx-auto px-4 pt-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-[11px]">
          <span className="text-slate-400 font-medium whitespace-nowrap pl-1">البوابات:</span>
          {[
            { id: 'doctor', label: '🩺 الطبيب' },
            { id: 'secretary', label: '📋 السكرتير' },
            { id: 'nurse', label: '💉 التمريض' },
            { id: 'hospital', label: '🏥 المستشفى' },
            { id: 'admin', label: '🛡️ الإدارة' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => switchRole(p.id as any)}
              className="px-2.5 py-1 rounded-xl bg-white border border-[#E2E8F0] text-slate-600 hover:text-[#104C48] hover:border-[#199A8E]/40 whitespace-nowrap font-medium transition active:scale-95 shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN BODY CONTENT: ONLY ADVICE BANNER THEN 13 SERVICES ── */}
      <main className="max-w-3xl mx-auto px-4 pt-3 space-y-6">
        {/* ── 1. بداية الشاشة في الأعلى: شاشة النصائح والعرض والتنبيهات ── */}
        <section className="relative overflow-hidden rounded-[26px] shadow-[0_8px_30px_-6px_rgba(16,76,72,0.22)] border border-[#199A8E]/20">
          <div
            className={`bg-gradient-to-r ${healthAdviceSlides[activeSlide].bgGradient} text-white p-5 md:p-6 transition-all duration-700 relative`}
          >
            {/* Background decorative watermark */}
            <div className="absolute top-0 right-0 w-52 h-52 bg-white/5 rounded-full -translate-y-20 translate-x-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-44 h-44 bg-white/5 rounded-full translate-y-16 -translate-x-14 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold border border-white/20 text-teal-100">
                  <Sparkle size={13} className="text-[#38B2AC]" />
                  <span>{healthAdviceSlides[activeSlide].tag}</span>
                </span>

                <div className="flex items-center gap-1 text-[11px] text-white/80 font-mono">
                  <span>{activeSlide + 1}</span>
                  <span>/</span>
                  <span>{healthAdviceSlides.length}</span>
                </div>
              </div>

              <h2 className="text-base md:text-lg font-black text-white leading-snug mb-2">
                {healthAdviceSlides[activeSlide].title}
              </h2>
              <p className="text-xs md:text-sm text-teal-50/95 leading-relaxed mb-4 font-normal">
                {healthAdviceSlides[activeSlide].desc}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-white/15 text-xs">
                <span className="text-white/85 text-[11px] font-medium flex items-center gap-1.5 truncate max-w-[210px] sm:max-w-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38B2AC]" />
                  {healthAdviceSlides[activeSlide].doctor}
                </span>

                {/* Carousel Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() =>
                      setActiveSlide(
                        (prev) => (prev - 1 + healthAdviceSlides.length) % healthAdviceSlides.length
                      )
                    }
                    className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition active:scale-95"
                    title="السابق"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveSlide((prev) => (prev + 1) % healthAdviceSlides.length)
                    }
                    className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition active:scale-95"
                    title="التالي"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {healthAdviceSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                }`}
                title={`شريحة ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ── 2. تليها الخدمات الـ 13 كاملة (6 ظاهرة + تمرير جانبي أو إظهار الجميع) ── */}
        <section className="space-y-3.5">
          {/* Section Header with Toggle */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#104C48]">
                  الخدمات الطبية والرعاية الصحية
                </h3>
                <span className="text-[10px] font-bold text-[#199A8E] bg-[#E8F5F4] px-2.5 py-0.5 rounded-full border border-[#199A8E]/20">
                  13 خدمة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {showAllServices ? 'عرض المنظومة الكاملة للخدمات' : 'يتم عرض 6 خدمات رئيسية — تصفح البقية أفقياً أو انقر إظهار الجميع'}
              </p>
            </div>

            {/* Toggle Button: اظهار الجميع / إظهار أقل */}
            <button
              onClick={() => setShowAllServices(!showAllServices)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#199A8E]/30 text-[#199A8E] hover:bg-[#E8F5F4] text-xs font-bold transition active:scale-95 shadow-2xs shrink-0"
            >
              <Layers size={13} />
              <span>{showAllServices ? 'عرض 6 فقط' : 'إظهار الجميع (13)'}</span>
            </button>
          </div>

          {/* ── Grid View: 6 Featured Services (or All 13 if expanded) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(showAllServices ? full13Services : initialSixServices).map((srv) => {
              const Icon = srv.icon;
              return (
                <button
                  key={srv.id}
                  onClick={() => onNavigate?.(srv.id)}
                  className="bg-white rounded-[20px] p-4 border border-[#E2E8F0] shadow-[0_2px_12px_-2px_rgba(25,154,142,0.06)] hover:shadow-[0_8px_20px_-4px_rgba(25,154,142,0.12)] hover:border-[#199A8E]/40 text-right flex flex-col justify-between transition-all duration-200 active:scale-95 group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-[#E8F5F4] group-hover:text-[#199A8E] transition-colors">
                      {srv.badge}
                    </span>
                    <div
                      className={`w-11 h-11 rounded-2xl ${srv.bg} ${srv.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}
                    >
                      <Icon size={22} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#104C48] group-hover:text-[#199A8E] transition-colors leading-tight">
                      {srv.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {srv.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Horizontal Scroll Strip for Remaining Services (When collapsed) ── */}
          {!showAllServices && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <span>بقية الخدمات (7 خدمات مساندة):</span>
                  <span className="text-[10px] text-[#199A8E] font-normal">اسحب أفقياً ←</span>
                </span>
                <button
                  onClick={() => setShowAllServices(true)}
                  className="text-xs text-[#199A8E] hover:underline font-bold flex items-center gap-1"
                >
                  <span>عرض الكل في شبكة</span>
                  <ArrowLeft size={13} />
                </button>
              </div>

              {/* Horizontal Scroll Track */}
              <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 scrollbar-hide pt-0.5">
                {remainingServices.map((srv) => {
                  const Icon = srv.icon;
                  return (
                    <button
                      key={srv.id}
                      onClick={() => onNavigate?.(srv.id)}
                      className="min-w-[190px] sm:min-w-[220px] bg-white rounded-[18px] p-3.5 border border-[#E2E8F0] hover:border-[#199A8E]/40 hover:shadow-md text-right flex flex-col justify-between transition-all active:scale-95 group shrink-0"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-[#E8F5F4] group-hover:text-[#199A8E]">
                          {srv.badge}
                        </span>
                        <div
                          className={`w-9 h-9 rounded-xl ${srv.bg} ${srv.color} flex items-center justify-center shrink-0`}
                        >
                          <Icon size={18} />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#104C48] group-hover:text-[#199A8E] transition-colors truncate">
                          {srv.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {srv.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ── ثانياً: الطوارئ والمساعد الذكي كأيقونات / بارات معلقة جانبية طافية ولاتتكرر ── */}
      <aside
        aria-label="أدوات الوصول السريع المعلقة"
        className="fixed left-3 sm:left-6 bottom-24 z-40 flex flex-col items-start gap-2.5 pointer-events-auto"
      >
        {/* Floating Emergency Action Pill (طوارئ 24/7) */}
        <button
          onClick={() => onNavigate?.('emergency')}
          className="group flex items-center gap-2 pl-3.5 pr-2.5 py-2.5 rounded-full bg-gradient-to-r from-[#D32F2F] to-[#E53935] text-white shadow-[0_6px_22px_-2px_rgba(229,57,53,0.45)] hover:shadow-[0_8px_28px_rgba(229,57,53,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/30 backdrop-blur-md"
          title="طلب الطوارئ والإسعاف الفوري 24/7"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Phone size={16} className="text-white animate-pulse" />
          </div>
          <div className="text-right flex flex-col items-start pr-0.5">
            <span className="text-xs font-black tracking-tight leading-none">
              طوارئ 24/7
            </span>
            <span className="text-[9px] text-rose-100 font-medium leading-tight mt-0.5">
              فرز وإسعاف فوري
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />
        </button>

        {/* Floating AI Assistant Action Pill (المساعد الذكي) */}
        <button
          onClick={() => onNavigate?.('ai-assistant')}
          className="group flex items-center gap-2 pl-3.5 pr-2.5 py-2.5 rounded-full bg-gradient-to-r from-[#104C48] via-[#125853] to-[#199A8E] text-white shadow-[0_6px_22px_-2px_rgba(25,154,142,0.45)] hover:shadow-[0_8px_28px_rgba(25,154,142,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/30 backdrop-blur-md"
          title="استشارة المساعد الذكي للأعراض"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-[#38B2AC]" />
          </div>
          <div className="text-right flex flex-col items-start pr-0.5">
            <span className="text-xs font-black tracking-tight leading-none">
              المساعد الذكي
            </span>
            <span className="text-[9px] text-teal-100 font-medium leading-tight mt-0.5">
              تشخيص الأعراض AI
            </span>
          </div>
        </button>
      </aside>

      {/* ── Quick Add Family Member Modal (إضافة فرد عائلة جديد) ── */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-right">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] relative animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#E8F5F4] text-[#199A8E] flex items-center justify-center font-bold">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-[#104C48] text-base">إضافة فرد عائلة جديد</h3>
                  <p className="text-[11px] text-slate-400">إضافة ملف تابع وتبديل الحساب إليه</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleQuickAddMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل للفرد <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خالد أحمد الأغبري"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#199A8E] focus:ring-2 focus:ring-[#199A8E]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  صلة القرابة <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'son', label: 'ابن 👦', gender: 'male' },
                    { id: 'daughter', label: 'ابنة 👧', gender: 'female' },
                    { id: 'spouse', label: 'زوجة 🧕', gender: 'female' },
                    { id: 'mother', label: 'أم 👵', gender: 'female' },
                    { id: 'father', label: 'أب 👴', gender: 'male' },
                    { id: 'other', label: 'أخرى 👤', gender: 'male' },
                  ].map((rel) => (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => {
                        setNewRelation(rel.id as any);
                        setNewGender(rel.gender as any);
                      }}
                      className={`py-2 px-2.5 rounded-xl border font-bold text-center transition ${
                        newRelation === rel.id
                          ? 'bg-[#E8F5F4] border-[#199A8E] text-[#104C48] shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {rel.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">العمر (سنوات)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    placeholder="مثال: 14"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs focus:outline-none focus:border-[#199A8E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">فصيلة الدم</label>
                  <select
                    value={newBloodType}
                    onChange={(e) => setNewBloodType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs bg-white focus:outline-none focus:border-[#199A8E]"
                  >
                    {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#104C48] to-[#199A8E] text-white font-bold text-xs hover:opacity-95 transition active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check size={15} />
                  <span>حفظ وتبديل الحساب إليه</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
