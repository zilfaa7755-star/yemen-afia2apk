import React, { useState } from 'react';
import {
  Building2,
  Phone,
  ChevronLeft,
  Shield,
  User,
  Stethoscope,
  ClipboardList,
  Droplets,
  AlertTriangle,
  Pill,
  Heart,
  Plus,
  X,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../types';
import { YemenAfiaLogo } from '../components/common/YemenAfiaLogo';

interface LoginPageProps {
  onLogin: () => void;
}

interface MedicalProfile {
  full_name: string;
  gender: 'male' | 'female' | '';
  birth_year: string;
  blood_type: string;
  chronic_diseases: string[];
  drug_allergies: string[];
  chronic_medications: string[];
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMMON_DISEASES = ['السكري', 'ضغط الدم', 'القلب', 'الربو', 'الغدة الدرقية', 'الكلى', 'الكبد', 'أمراض المناعة'];
const COMMON_ALLERGIES = ['البنسلين', 'الأسبرين', 'السلفا', 'الكودايين', 'الإيبوبروفين', 'مضادات حيوية'];

export function LoginPage({ onLogin }: LoginPageProps) {
  const { login } = useAuth();
  const [step, setStep] = useState<'role' | 'phone' | 'medical-profile'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customDisease, setCustomDisease] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [customMedication, setCustomMedication] = useState('');
  const [profile, setProfile] = useState<MedicalProfile>({
    full_name: '',
    gender: '',
    birth_year: '',
    blood_type: '',
    chronic_diseases: [],
    drug_allergies: [],
    chronic_medications: [],
  });

  const roles = [
    { id: 'patient' as UserRole, label: 'مريض', icon: User, description: 'حجز المواعيد والخدمات الطبية', gradient: 'from-[#104C48] to-[#199A8E]', bg: 'bg-sky-50', color: 'text-sky-600' },
    { id: 'doctor' as UserRole, label: 'طبيب', icon: Stethoscope, description: 'إدارة المواعيد والمرضى', gradient: 'from-[#00897B] to-[#199A8E]', bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { id: 'secretary' as UserRole, label: 'سكرتاري', icon: ClipboardList, description: 'إدارة الطابور والحجوزات', gradient: 'from-[#104C48] to-[#38B2AC]', bg: 'bg-violet-50', color: 'text-violet-600' },
    { id: 'nurse' as UserRole, label: 'ممرض/ة', icon: Activity, description: 'الخدمات التمريضية المنزلية', gradient: 'from-[#199A8E] to-[#38B2AC]', bg: 'bg-teal-50', color: 'text-teal-600' },
    { id: 'hospital' as UserRole, label: 'منشآة طبية', icon: Building2, description: 'مستشفى أو صيدلية أو مختبر', gradient: 'from-[#0B337A] to-[#104C48]', bg: 'bg-rose-50', color: 'text-rose-600' },
    { id: 'admin' as UserRole, label: 'مدير النظام', icon: Shield, description: 'لوحة الإدارة والتحكم الكاملة', gradient: 'from-[#334155] to-[#104C48]', bg: 'bg-slate-100', color: 'text-slate-700' },
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('phone');
  };

  const handlePhoneSubmit = async () => {
    if (!phone || phone.length < 9) return;
    if (selectedRole === 'patient') {
      setStep('medical-profile');
    } else {
      await doLogin();
    }
  };

  const doLogin = async () => {
    setIsLoading(true);
    try {
      await login(phone, selectedRole);
      onLogin();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicalSubmit = async () => {
    setIsLoading(true);
    try {
      await login(phone, selectedRole);

      await supabase.from('users').upsert({
        id: `demo-${phone}`,
        phone: `+967${phone}`,
        full_name: profile.full_name || 'مستخدم',
        gender: profile.gender || 'male',
        date_of_birth: profile.birth_year ? `${profile.birth_year}-01-01` : null,
        blood_type: profile.blood_type || null,
        chronic_diseases: profile.chronic_diseases,
        drug_allergies: profile.drug_allergies,
        chronic_medications: profile.chronic_medications,
        created_at: new Date().toISOString(),
      });

      onLogin();
    } catch (error) {
      console.error('Profile save error:', error);
      onLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (field: 'chronic_diseases' | 'drug_allergies' | 'chronic_medications', value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((v) => v !== value) : [...prev[field], value],
    }));
  };

  const addCustom = (field: 'chronic_diseases' | 'drug_allergies' | 'chronic_medications', value: string, clear: () => void) => {
    if (!value.trim()) return;
    setProfile((prev) => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    clear();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#104C48] via-[#0D3B38] to-[#199A8E] flex flex-col">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-y-24 -translate-x-24" />
      <div className="absolute top-40 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-20" />

      {/* Official Logo Banner */}
      <div className="relative flex-shrink-0 pt-12 pb-6 px-6 text-center">
        <div className="inline-block bg-white/95 rounded-3xl p-4.5 px-6 shadow-2xl shadow-[#08285F]/50 mx-auto mb-3 backdrop-blur-sm border border-white/40">
          <YemenAfiaLogo variant="full" size="lg" />
        </div>
        <p className="text-white/80 text-xs font-semibold tracking-wide">
          المنصة الصحية الرقمية المتكاملة في اليمن
        </p>
      </div>

      {/* White Card */}
      <div className="relative flex-1 bg-white rounded-t-[2.5rem] px-6 pt-8 pb-6 overflow-y-auto shadow-2xl">

        {step === 'role' && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 text-center mb-1">اختر نوع الحساب</h2>
            <p className="text-center text-slate-400 text-sm mb-5">حدد دورك للانتقال إلى بوابتك المتخصصة</p>
            
            {/* Quick Demo Switcher Info */}
            <div className="mb-4 bg-[#E8F5F4] border border-[#199A8E]/30 rounded-2xl p-3 text-center">
              <p className="text-xs text-[#104C48] font-bold">بوابات منظومة يمن عافية الوطنية الست (6 أدوار)</p>
              <p className="text-[11px] text-[#199A8E] mt-0.5">يمكنك الدخول المباشر بنقرة واحدة للتجربة أو إدخال رقم هاتفك</p>
            </div>

            <div className="space-y-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <div
                    key={role.id}
                    className="w-full bg-slate-50 hover:bg-slate-100 rounded-2xl p-3.5 border border-slate-200/80 flex items-center gap-3 text-right transition-all hover:shadow-md"
                  >
                    <div className={`w-13 h-13 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md p-3`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => handleRoleSelect(role.id)} role="button">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-base">{role.label}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                          بوابة مخصصة
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{role.description}</p>
                    </div>
                    
                    {/* Instant Entrance Button */}
                    <button
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          await login('777123456', role.id);
                          onLogin();
                        } catch {
                          onLogin();
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#104C48] to-[#199A8E] hover:opacity-95 text-white text-xs font-bold transition shadow-sm active:scale-95 shrink-0"
                      title="دخول تجريبي فوري"
                    >
                      دخول مباشر
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-xs text-slate-400 mt-6">
              جميع الحقوق محفوظة © 2026 يمن عافية
            </p>
          </div>
        )}

        {step === 'phone' && (
          <div>
            <button onClick={() => setStep('role')} className="flex items-center gap-2 text-slate-500 mb-6 text-sm">
              <ChevronLeft size={18} className="rotate-180" />
              رجوع
            </button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#104C48] to-[#199A8E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sm">
                <Phone size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">أدخل رقم هاتفك</h2>
              <p className="text-slate-500 text-sm mt-1">
                {selectedRole === 'patient' ? 'سيتم إكمال ملفك الصحي في الخطوة التالية' : 'للدخول إلى لوحة التحكم'}
              </p>
            </div>
            <div className="relative mb-4">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-l border-slate-200 pl-3">
                <span className="text-lg">🇾🇪</span>
                <span className="text-slate-600 font-medium text-sm">+967</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="777123456"
                className="w-full pr-28 pl-4 py-4 rounded-2xl border-2 border-slate-200 focus:border-[#199A8E] focus:ring-4 focus:ring-[#199A8E]/10 outline-none text-lg transition-all"
                dir="ltr"
              />
            </div>
            <button
              onClick={handlePhoneSubmit}
              disabled={phone.length < 9 || isLoading}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                phone.length >= 9 ? 'bg-gradient-to-r from-[#104C48] to-[#199A8E] text-white shadow-lg shadow-sm active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'جاري التحميل...' : 'متابعة'}
            </button>
          </div>
        )}

        {step === 'medical-profile' && (
          <div>
            <button onClick={() => setStep('phone')} className="flex items-center gap-2 text-slate-500 mb-4 text-sm">
              <ChevronLeft size={18} className="rotate-180" />
              رجوع
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-[#104C48] to-[#199A8E] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Heart size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">ملفك الصحي</h2>
                <p className="text-xs text-slate-500">تساعد الطبيب على تقديم رعاية أفضل لك</p>
              </div>
            </div>

            {/* Indicators */}
            <div className="flex gap-2 mb-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-[#104C48] to-[#199A8E]" />
              ))}
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">الاسم الكامل *</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="أدخل اسمك الكامل"
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-[#199A8E] focus:ring-2 focus:ring-[#199A8E]/10 outline-none text-right transition-all"
              />
            </div>

            {/* Gender */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">الجنس</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ v: 'male', label: 'ذكر' }, { v: 'female', label: 'أنثى' }].map(({ v, label }) => (
                  <button
                    key={v}
                    onClick={() => setProfile({ ...profile, gender: v as 'male' | 'female' })}
                    className={`py-3 rounded-xl border-2 font-medium transition-all ${
                      profile.gender === v ? 'border-[#199A8E] bg-[#E8F5F4] text-[#104C48]' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Birth Year */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">سنة الميلاد</label>
              <input
                type="number"
                value={profile.birth_year}
                onChange={(e) => setProfile({ ...profile, birth_year: e.target.value })}
                placeholder="مثال: 1990"
                min="1920"
                max={new Date().getFullYear()}
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-[#199A8E] focus:ring-2 focus:ring-[#199A8E]/10 outline-none text-right transition-all"
              />
            </div>

            {/* Blood Type */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Droplets size={15} className="text-red-500" />
                فصيلة الدم
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map((bt) => (
                  <button
                    key={bt}
                    onClick={() => setProfile({ ...profile, blood_type: profile.blood_type === bt ? '' : bt })}
                    className={`py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                      profile.blood_type === bt ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            {/* Chronic Diseases */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Heart size={15} className="text-orange-500" />
                الأمراض المزمنة
                <span className="text-slate-400 font-normal text-xs">(اختياري)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {COMMON_DISEASES.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleItem('chronic_diseases', d)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      profile.chronic_diseases.includes(d)
                        ? 'bg-orange-100 border-orange-300 text-orange-700 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {profile.chronic_diseases.includes(d) ? '✓ ' : ''}{d}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addCustom('chronic_diseases', customDisease, () => setCustomDisease(''))}
                  className="w-10 h-10 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <Plus size={18} />
                </button>
                <input
                  type="text"
                  value={customDisease}
                  onChange={(e) => setCustomDisease(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustom('chronic_diseases', customDisease, () => setCustomDisease(''))}
                  placeholder="أضف مرضاً آخر..."
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-300 text-right"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.chronic_diseases.filter((d) => !COMMON_DISEASES.includes(d)).map((d) => (
                  <span key={d} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                    {d}
                    <button onClick={() => toggleItem('chronic_diseases', d)}><X size={11} /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Drug Allergies */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-red-500" />
                الحساسية من الأدوية
                <span className="text-slate-400 font-normal text-xs">(اختياري)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {COMMON_ALLERGIES.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleItem('drug_allergies', a)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      profile.drug_allergies.includes(a)
                        ? 'bg-red-100 border-red-300 text-red-700 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {profile.drug_allergies.includes(a) ? '✓ ' : ''}{a}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addCustom('drug_allergies', customAllergy, () => setCustomAllergy(''))}
                  className="w-10 h-10 bg-red-100 text-red-700 rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <Plus size={18} />
                </button>
                <input
                  type="text"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustom('drug_allergies', customAllergy, () => setCustomAllergy(''))}
                  placeholder="أضف دواء أو مادة..."
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-red-300 text-right"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.drug_allergies.filter((a) => !COMMON_ALLERGIES.includes(a)).map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                    {a}
                    <button onClick={() => toggleItem('drug_allergies', a)}><X size={11} /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Chronic Medications */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Pill size={15} className="text-violet-500" />
                الأدوية المزمنة
                <span className="text-slate-400 font-normal text-xs">(اختياري)</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => addCustom('chronic_medications', customMedication, () => setCustomMedication(''))}
                  className="w-10 h-10 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <Plus size={18} />
                </button>
                <input
                  type="text"
                  value={customMedication}
                  onChange={(e) => setCustomMedication(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustom('chronic_medications', customMedication, () => setCustomMedication(''))}
                  placeholder="اسم الدواء والجرعة..."
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-300 text-right"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.chronic_medications.map((m) => (
                  <span key={m} className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs">
                    {m}
                    <button onClick={() => toggleItem('chronic_medications', m)}><X size={11} /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pb-4">
              <button
                onClick={doLogin}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-medium"
              >
                تخطى
              </button>
              <button
                onClick={handleMedicalSubmit}
                disabled={isLoading || !profile.full_name}
                className={`flex-1 flex-grow-[2] py-4 rounded-2xl font-bold text-base shadow-lg transition-all ${
                  !isLoading && profile.full_name
                    ? 'bg-gradient-to-r from-[#104C48] to-[#199A8E] text-white shadow-sm active:scale-[0.98]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'جاري الحفظ...' : 'حفظ والمتابعة'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
