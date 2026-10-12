import React from 'react';
import {
  Settings,
  HelpCircle,
  Shield,
  Bell,
  MapPin,
  CreditCard,
  User,
  LogOut,
  ChevronLeft,
  Heart,
  FileText,
  Hash,
  Copy,
  CheckCircle,
  BookOpen,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MorePageProps {
  onNavigate?: (page: string) => void;
}

export function MorePage({ onNavigate }: MorePageProps) {
  const { user, logout } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const patientCode = (user as any)?.patient_code;

  const copyCode = () => {
    if (patientCode) {
      navigator.clipboard.writeText(patientCode).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const menuItems = [
    {
      icon: User,
      label: 'الملف الشخصي',
      description: 'تعديل بياناتك الشخصية',
      onClick: () => onNavigate?.('health-record'),
    },
    {
      icon: Heart,
      label: 'السجل الصحي',
      description: 'ملفي الطبي وبطاقة الطوارئ',
      onClick: () => onNavigate?.('health-record'),
    },
    {
      icon: Bell,
      label: 'الإشعارات',
      description: 'إدارة الإشعارات والتذكيرات',
      onClick: () => onNavigate?.('medication-reminders'),
    },
    {
      icon: MapPin,
      label: 'الموقع الجغرافي',
      description: 'تحديد موقعك لحساب المسافات',
      onClick: () => {},
    },
    {
      icon: CreditCard,
      label: 'طرق الدفع',
      description: 'إدارة بطاقاتك ومحافظك',
      onClick: () => {},
    },
    {
      icon: FileText,
      label: 'الشروط والأحكام',
      onClick: () => {},
    },
    {
      icon: Shield,
      label: 'الخصوصية والأمان',
      onClick: () => {},
    },
    {
      icon: HelpCircle,
      label: 'المساعدة والدعم',
      onClick: () => {},
    },
    {
      icon: BookOpen,
      label: 'الدليل البصري',
      description: 'استعرض جميع واجهات التطبيق',
      onClick: () => onNavigate?.('visual-guide'),
    },
    {
      icon: Activity,
      label: 'متابعات',
      description: 'قياساتي ومتابعة الحمل والجلسات',
      onClick: () => onNavigate?.('tracking'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gradient-medical pt-8 pb-16 px-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{user?.full_name || 'مستخدم'}</h2>
            <p className="text-white/80 text-sm">{user?.phone || 'غير مسجل'}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 space-y-3">
        {/* Patient ID Card */}
        {patientCode && (
          <div className="bg-gradient-to-l from-[#104C48] to-[#199A8E] border border-white/20 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <button onClick={copyCode}
                className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl text-white text-xs font-medium transition-all active:scale-95">
                {copied
                  ? <><CheckCircle size={13} />تم النسخ</>
                  : <><Copy size={13} />نسخ الرقم</>}
              </button>
              <div className="text-right">
                <p className="text-white/70 text-xs mb-1">رقمك التعريفي</p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-white font-black text-2xl tracking-widest font-mono">{patientCode}</span>
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <Hash size={18} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-white/60 text-xs text-right mt-3 leading-relaxed">
              أعطِ هذا الرقم للصيدلي أو المختبر لاستلام وصفتك أو نتائج فحصك
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <item.icon size={20} className="text-gray-600" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-medium text-gray-800">{item.label}</p>
                {item.description && (
                  <p className="text-sm text-gray-500">{item.description}</p>
                )}
              </div>
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
          ))}
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-error-50 text-error-600 font-medium py-4 rounded-2xl hover:bg-error-100 transition-colors"
        >
          <LogOut size={20} />
          تسجيل الخروج
        </button>

        <div className="text-center py-2">
          <p className="text-xs text-gray-400">يمن عافية - الإصدار 1.0.0</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Heart size={14} className="text-error-500" fill="currentColor" />
            <span className="text-xs text-gray-500">صنعت بكل حب في اليمن</span>
          </div>
        </div>
      </div>
    </div>
  );
}
