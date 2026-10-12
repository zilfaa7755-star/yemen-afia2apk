import { useState } from 'react';
import {
  Droplets,
  ChevronLeft,
  Search,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Bell,
  Heart,
  FlaskConical,
  Zap,
  Building2,
  Navigation,
  X,
  Loader2,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
type BloodComponent = 'whole' | 'red' | 'platelets' | 'plasma';

interface BloodBankResult {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  available: boolean;
  units: number;
  component: BloodComponent;
  workingHours: string;
}

const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const componentLabels: Record<BloodComponent, { label: string; icon: typeof Droplets; desc: string }> = {
  whole: { label: 'دم كامل', icon: Droplets, desc: 'وحدة دم كاملة' },
  red: { label: 'كرات حمراء', icon: Heart, desc: 'نقل كريات حمراء مركزة' },
  platelets: { label: 'صفائح دموية', icon: Zap, desc: 'نقل صفائح دموية' },
  plasma: { label: 'بلازما', icon: FlaskConical, desc: 'نقل بلازما طازجة أو مجمّدة' },
};

const allBanks: BloodBankResult[] = [
  { id: '1', name: 'بنك الدم المركزي - مستشفى الثورة', address: 'صنعاء - شارع الخمسين', phone: '01-789012', distance: 1.2, available: true, units: 4, component: 'whole', workingHours: '24 ساعة' },
  { id: '2', name: 'بنك الدم - مستشفى الكويتي', address: 'صنعاء - الستين', phone: '01-567890', distance: 1.8, available: true, units: 2, component: 'red', workingHours: '8ص - 8م' },
  { id: '3', name: 'بنك دم الجمهورية', address: 'صنعاء - حدة', phone: '01-234567', distance: 2.5, available: false, units: 0, component: 'platelets', workingHours: '7ص - 9م' },
  { id: '4', name: 'بنك الدم - مجمع الحياة', address: 'صنعاء - شارع تونس', phone: '01-667788', distance: 3.1, available: true, units: 3, component: 'plasma', workingHours: '8ص - 6م' },
  { id: '5', name: 'بنك الدم - مستشفى السعودي', address: 'صنعاء - شارع الزبيري', phone: '01-334455', distance: 4.0, available: false, units: 0, component: 'whole', workingHours: '8ص - 10م' },
];

interface BloodDonationPageProps {
  onBack?: () => void;
}

export function BloodDonationPage({ onBack }: BloodDonationPageProps) {
  const { addNotification } = useNotifications();
  const [bloodType, setBloodType] = useState<BloodType | ''>('');
  const [component, setComponent] = useState<BloodComponent>('whole');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<BloodBankResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [notifiedBank, setNotifiedBank] = useState<string | null>(null);

  const handleSearch = () => {
    if (!bloodType) return;
    setSearching(true);
    setHasSearched(false);
    setResults([]);
    setTimeout(() => {
      const filtered = allBanks
        .filter((b) => b.component === component || component === 'whole')
        .sort((a, b) => a.distance - b.distance);
      setResults(filtered);
      setSearching(false);
      setHasSearched(true);
      const availableCount = filtered.filter((b) => b.available).length;
      if (availableCount > 0) {
        addNotification({
          type: 'info',
          title: 'تم العثور على دم متاح',
          message: `تم العثور على ${availableCount} بنك دم يتوفر لديها الفصيلة المطلوبة`,
        });
      }
    }, 1500);
  };

  const handleNotifyMe = (bank: BloodBankResult) => {
    setNotifiedBank(bank.id);
    addNotification({
      type: 'info',
      title: 'تم تسجيل طلب الإشعار',
      message: `سيتم إشعارك فور توفر الدم في ${bank.name}`,
    });
    setTimeout(() => setNotifiedBank(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-12">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#104C48] via-[#0B337A] to-rose-700 pt-4 pb-20 px-4 sticky top-0 z-40 text-white">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-10 h-10 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center transition active:scale-95">
            <ChevronLeft size={22} className="text-white rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-white">البحث عن فصائل الدم والمتبرعين</h1>
          <div className="w-10" />
        </div>
        <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20">
          <Droplets size={20} className="text-rose-300 shrink-0" />
          <p className="text-white/95 text-xs font-medium leading-relaxed">
            منظومة الربط المباشر مع بنوك الدم والمستشفيات اليمنية على مدار الساعة
          </p>
        </div>
      </div>

      <div className="px-4 -mt-12 relative z-30 space-y-4">
        {/* Search form */}
        <div className="bg-white rounded-2xl shadow-lg p-5 space-y-5">
          {/* Blood type selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2.5">فصيلة الدم المطلوبة *</label>
            <div className="grid grid-cols-4 gap-2">
              {bloodTypes.map((bt) => (
                <button
                  key={bt}
                  onClick={() => setBloodType(bt)}
                  className={`py-3.5 rounded-xl font-bold text-base transition-all ${
                    bloodType === bt
                      ? 'bg-red-600 text-white shadow-md scale-105'
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}
                >
                  {bt}
                </button>
              ))}
            </div>
          </div>

          {/* Component selector */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2.5">نوع مكون الدم المطلوب *</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(componentLabels) as BloodComponent[]).map((key) => {
                const cfg = componentLabels[key];
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setComponent(key)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all text-right ${
                      component === key
                        ? 'bg-red-50 border-2 border-red-500'
                        : 'bg-gray-50 border-2 border-gray-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      component === key ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <Icon size={20} className={component === key ? 'text-red-600' : 'text-gray-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${component === key ? 'text-red-700' : 'text-gray-700'}`}>
                        {cfg.label}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{cfg.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={!bloodType || searching}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              bloodType && !searching
                ? 'bg-gradient-to-l from-red-600 to-red-500 text-white shadow-lg active:scale-95'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {searching ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                جاري البحث في بنوك الدم...
              </>
            ) : (
              <>
                <Search size={20} />
                البحث عن الدم المتاح
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {results.filter((r) => r.available).length} بنك متاح من أصل {results.length}
              </p>
              <h3 className="font-bold text-gray-800 text-sm">نتائج البحث</h3>
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <Droplets size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="font-bold text-gray-400">لا توجد بنوك دم مطابقة</p>
                <p className="text-sm text-gray-300 mt-1">جرّب تغيير نوع مكون الدم</p>
              </div>
            ) : (
              <>
                {results.map((bank) => (
                  <div
                    key={bank.id}
                    className={`bg-white rounded-2xl shadow-sm border p-4 ${
                      bank.available ? 'border-green-200' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        bank.available ? 'bg-green-50' : 'bg-gray-100'
                      }`}>
                        {bank.available ? (
                          <CheckCircle2 size={24} className="text-green-600" />
                        ) : (
                          <Building2 size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            bank.available
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {bank.available ? `متاح (${bank.units} وحدات)` : 'غير متاح حالياً'}
                          </span>
                          <h3 className="font-bold text-gray-800 text-sm text-right">{bank.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 justify-end mb-1">
                          <span className="text-[#199A8E] font-medium">{bank.distance} كم</span>
                          <MapPin size={12} />
                          <span className="text-right">{bank.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 justify-end">
                          <Clock size={12} />
                          <span>{bank.workingHours}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {bank.available ? (
                      <div className="flex gap-2 mt-3">
                        <a
                          href={`tel:${bank.phone}`}
                          className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-bold flex items-center justify-center gap-1.5"
                        >
                          <Phone size={15} /> اتصال للحجز
                        </a>
                        <button className="flex-1 py-2.5 rounded-xl bg-[#E8F5F4] text-[#199A8E] text-sm font-bold flex items-center justify-center gap-1.5">
                          <Navigation size={15} /> الاتجاهات
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleNotifyMe(bank)}
                        className="w-full mt-3 py-2.5 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold flex items-center justify-center gap-2"
                      >
                        {notifiedBank === bank.id ? (
                          <>
                            <CheckCircle2 size={16} /> تم تسجيل طلب الإشعار
                          </>
                        ) : (
                          <>
                            <Bell size={16} /> أعلمني عند توفر الدم
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Info banner */}
        {!hasSearched && !searching && (
          <div className="bg-[#E8F5F4] rounded-2xl p-4 flex items-start gap-3 border border-blue-100">
            <div className="w-10 h-10 bg-[#E8F5F4] rounded-lg flex items-center justify-center flex-shrink-0">
              <Droplets size={20} className="text-[#199A8E]" />
            </div>
            <div>
              <p className="font-bold text-blue-800 text-sm mb-1">كيف يعمل البحث عن دم؟</p>
              <p className="text-[#199A8E] text-xs leading-relaxed">
                حدد فصيلة الدم ونوع المكون المطلوب، ثم اضغط بحث. سيتم البحث في بنوك الدم القريبة وإشعارك بالبنوك التي يتوفر لديها الدم المطلوب مع عدد الوحدات المتاحة.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
