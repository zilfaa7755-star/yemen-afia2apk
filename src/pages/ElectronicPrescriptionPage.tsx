import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  FileText,
  Plus,
  QrCode,
  Download,
  Share2,
  Pill,
  Calendar,
  User,
  Stethoscope,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  X,
  Eye,
  Printer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface ElectronicPrescriptionPageProps {
  onBack?: () => void;
}

interface Prescription {
  id: string;
  code: string;
  patient_id: string;
  doctor_name: string;
  doctor_specialization: string;
  clinic_name: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'dispensed' | 'expired' | 'cancelled';
  medications: PrescriptionMedication[];
  diagnosis?: string;
  notes?: string;
}

interface PrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

const demoPrescriptions: Prescription[] = [
  {
    id: '1',
    code: 'RX-2026-001847',
    patient_id: 'demo',
    doctor_name: 'د. أحمد المقطري',
    doctor_specialization: 'باطنية عامة',
    clinic_name: 'مركز اليمن الطبي',
    issue_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiry_date: new Date(Date.now() + 28 * 86400000).toISOString(),
    status: 'active',
    diagnosis: 'التهاب في الجهاز التنفسي العلوي',
    medications: [
      { name: 'أموكسيسيلين 500 مجم', dosage: '500 مجم', frequency: 'مرة كل 8 ساعات', duration: '7 أيام', instructions: 'تناول بعد الأكل' },
      { name: 'باراسيتامول 500 مجم', dosage: '500 مجم', frequency: 'عند الحاجة كل 6 ساعات', duration: '3 أيام', instructions: 'لا تتجاوز 4 حبات يومياً' },
      { name: 'كلارتين 10 مجم', dosage: '10 مجم', frequency: 'مرة يومياً', duration: '5 أيام', instructions: 'مساءً قبل النوم' },
    ],
    notes: 'الراحة التامة وشرب السوائل بكثرة',
  },
  {
    id: '2',
    code: 'RX-2026-001632',
    patient_id: 'demo',
    doctor_name: 'د. فاطمة الشامي',
    doctor_specialization: 'قلب وأوعية دموية',
    clinic_name: 'عيادات الشفاء',
    issue_date: new Date(Date.now() - 15 * 86400000).toISOString(),
    expiry_date: new Date(Date.now() + 75 * 86400000).toISOString(),
    status: 'active',
    diagnosis: 'ارتفاع ضغط الدم',
    medications: [
      { name: 'أملوديبين 5 مجم', dosage: '5 مجم', frequency: 'مرة يومياً صباحاً', duration: '90 يوم', instructions: 'في وقت ثابت كل يوم' },
      { name: 'ليسينوبريل 10 مجم', dosage: '10 مجم', frequency: 'مرة يومياً', duration: '90 يوم', instructions: '' },
    ],
    notes: 'متابعة ضغط الدم يومياً وتسجيله',
  },
  {
    id: '3',
    code: 'RX-2026-001215',
    patient_id: 'demo',
    doctor_name: 'د. خالد الإرياني',
    doctor_specialization: 'مخ وأعصاب',
    clinic_name: 'مجمع الحياة التخصصي',
    issue_date: new Date(Date.now() - 45 * 86400000).toISOString(),
    expiry_date: new Date(Date.now() - 15 * 86400000).toISOString(),
    status: 'expired',
    diagnosis: 'صداع نصفي متكرر',
    medications: [
      { name: 'سوماتريبتان 50 مجم', dosage: '50 مجم', frequency: 'عند بداية النوبة', duration: '30 يوم', instructions: 'جرعة واحدة فقط لكل نوبة' },
    ],
    notes: '',
  },
];

const statusConfig = {
  active: { label: 'سارية', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  dispensed: { label: 'تم الصرف', color: 'bg-[#E8F5F4] text-[#104C48]', dot: 'bg-[#199A8E]' },
  expired: { label: 'منتهية', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
  cancelled: { label: 'ملغاة', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' });
}

function daysRemaining(expiry: string): number {
  return Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
}

export function ElectronicPrescriptionPage({ onBack }: ElectronicPrescriptionPageProps) {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired'>('all');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('electronic_prescriptions')
        .select('*')
        .eq('patient_id', user?.id || 'demo')
        .order('issue_date', { ascending: false });
      setPrescriptions(data && data.length > 0 ? (data as Prescription[]) : demoPrescriptions);
    } catch {
      setPrescriptions(demoPrescriptions);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = prescriptions.filter((p) => {
    const matchTab = activeTab === 'all' || (activeTab === 'active' && p.status === 'active') || (activeTab === 'expired' && p.status !== 'active');
    const matchSearch = !searchQuery || p.code.includes(searchQuery) || p.doctor_name.includes(searchQuery) || p.medications.some((m) => m.name.includes(searchQuery));
    return matchTab && matchSearch;
  });

  // Detail Screen
  if (selectedPrescription) {
    const st = statusConfig[selectedPrescription.status];
    const days = daysRemaining(selectedPrescription.expiry_date);
    return (
      <div className="min-h-screen bg-[#F8FAFB] pb-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#104C48] via-[#125853] to-[#199A8E] pt-3 pb-16 px-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => setShowQR(!showQR)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <QrCode size={20} className="text-white" />
              </button>
              <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Share2 size={20} className="text-white" />
              </button>
            </div>
            <h1 className="text-xl font-bold text-white">تفاصيل الوصفة</h1>
            <button onClick={() => setSelectedPrescription(null)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronLeft size={22} className="text-white rotate-180" />
            </button>
          </div>
        </div>

        <div className="px-4 -mt-10 relative z-30 space-y-4">
          {/* QR Code Panel */}
          {showQR && (
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <p className="font-bold text-gray-800 mb-4">رمز QR للوصفة</p>
              <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto flex items-center justify-center border-4 border-dashed border-gray-300">
                <div className="text-center">
                  <QrCode size={64} className="text-gray-400 mx-auto" />
                  <p className="text-xs text-gray-400 mt-2">{selectedPrescription.code}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">اعرض هذا الرمز للصيدلاني لصرف الوصفة</p>
            </div>
          )}

          {/* Prescription Header Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-l from-[#E8F5F4] to-[#d4ede9] px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${st.color}`}>
                  <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                  {st.label}
                </span>
                <span className="font-mono text-sm font-bold text-[#104C48]">{selectedPrescription.code}</span>
              </div>
              {selectedPrescription.status === 'active' && (
                <div className={`text-sm font-medium ${days <= 7 ? 'text-orange-600' : 'text-gray-600'}`}>
                  {days > 0 ? `تنتهي خلال ${days} يوم` : 'انتهت الصلاحية'}
                </div>
              )}
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E8F5F4] rounded-xl flex items-center justify-center">
                  <Stethoscope size={20} className="text-[#199A8E]" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{selectedPrescription.doctor_name}</p>
                  <p className="text-sm text-gray-500">{selectedPrescription.doctor_specialization} • {selectedPrescription.clinic_name}</p>
                </div>
              </div>

              {selectedPrescription.diagnosis && (
                <div className="bg-[#E8F5F4] rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">التشخيص</p>
                  <p className="font-medium text-gray-800">{selectedPrescription.diagnosis}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFB] rounded-xl p-3 text-center">
                  <Calendar size={16} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">تاريخ الإصدار</p>
                  <p className="text-sm font-bold text-gray-700">{formatDate(selectedPrescription.issue_date)}</p>
                </div>
                <div className="bg-[#F8FAFB] rounded-xl p-3 text-center">
                  <Clock size={16} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">تاريخ الانتهاء</p>
                  <p className="text-sm font-bold text-gray-700">{formatDate(selectedPrescription.expiry_date)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medications */}
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Pill size={18} className="text-[#199A8E]" />
              الأدوية المقررة ({selectedPrescription.medications.length})
            </h3>
            <div className="space-y-3">
              {selectedPrescription.medications.map((med, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#E8F5F4] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-[#199A8E] font-bold text-sm">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">{med.name}</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                        <span className="bg-[#F8FAFB] rounded-lg px-2 py-1">الجرعة: {med.dosage}</span>
                        <span className="bg-[#F8FAFB] rounded-lg px-2 py-1">التكرار: {med.frequency}</span>
                        <span className="bg-[#F8FAFB] rounded-lg px-2 py-1">المدة: {med.duration}</span>
                        {med.instructions && (
                          <span className="bg-amber-50 text-amber-700 rounded-lg px-2 py-1 col-span-2">{med.instructions}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {selectedPrescription.notes && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800 text-sm">ملاحظات الطبيب</p>
                <p className="text-amber-700 text-sm mt-1">{selectedPrescription.notes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {selectedPrescription.status === 'active' && (
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-[#199A8E] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2">
                <Printer size={18} />
                طباعة
              </button>
              <button className="bg-green-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2">
                <Pill size={18} />
                صرف الآن
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#104C48] via-[#125853] to-[#199A8E] pt-3 pb-20 px-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={22} className="text-white rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-white">الوصفات الإلكترونية</h1>
          <div className="w-10" />
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'الكل', val: prescriptions.length, tab: 'all' as const },
            { label: 'سارية', val: prescriptions.filter((p) => p.status === 'active').length, tab: 'active' as const },
            { label: 'منتهية', val: prescriptions.filter((p) => p.status !== 'active').length, tab: 'expired' as const },
          ].map(({ label, val, tab }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl py-2.5 text-center transition-all ${activeTab === tab ? 'bg-white text-[#199A8E]' : 'bg-white/20 text-white'}`}
            >
              <p className="font-black text-xl">{val}</p>
              <p className="text-xs">{label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-30">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg flex items-center px-4 py-3.5 gap-3 mb-4">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الوصفة أو اسم الطبيب أو الدواء..."
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            dir="rtl"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#199A8E]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={56} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">لا توجد وصفات</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const st = statusConfig[p.status];
              const days = daysRemaining(p.expiry_date);
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPrescription(p)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-right"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#E8F5F4] rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={22} className="text-[#199A8E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${st.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                        <span className="font-mono text-xs text-gray-400">{p.code}</span>
                      </div>
                      <p className="font-bold text-gray-800">{p.doctor_name}</p>
                      <p className="text-sm text-gray-500">{p.doctor_specialization}</p>
                      <p className="text-xs text-gray-400 mt-1">{p.medications.length} دواء • {formatDate(p.issue_date)}</p>
                    </div>
                  </div>
                  {p.status === 'active' && (
                    <div className={`mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm ${days <= 7 ? 'text-orange-600' : 'text-gray-500'}`}>
                      <Clock size={14} />
                      {days > 0 ? `تنتهي خلال ${days} يوم` : 'انتهت الصلاحية'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
