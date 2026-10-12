import { useState } from 'react';
import {
  AlertTriangle,
  Baby,
  CheckCircle2,
  ShieldAlert,
  Syringe,
  HeartPulse,
  Activity,
  Plus,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const UNSAFE_PREGNANCY_DRUGS: Record<string, 'danger' | 'warning'> = {
  'وارفارين': 'danger',
  'warfarin': 'danger',
  'ايبوبروفين': 'warning',
  'ibuprofen': 'warning',
  'أسبرين': 'warning',
  'aspirin': 'warning',
  'ديكلوفيناك': 'warning',
  'diclofenac': 'warning',
  'ريتودين': 'danger',
  'misoprostol': 'danger',
  'ميزوبروستول': 'danger',
  'ليثيوم': 'danger',
  'lithium': 'danger',
  'تتراسيكلين': 'danger',
  'tetracycline': 'danger',
  'دوكسيسيكلين': 'danger',
  'isotretinoin': 'danger',
  'روآكوتان': 'danger',
};

const visits = [
  { week: 'الأسبوع 12', title: 'زيارة الطبيب النسائي + سونار الربع الأول', done: true },
  { week: 'الأسبوع 20', title: 'سونار التشوهات (الربع الثاني)', done: true },
  { week: 'الأسبوع 26', title: 'فحص سكر الحمل', done: false },
  { week: 'الأسبوع 28', title: 'فحص الأنيميا CBC + تطعيم التيتانوس', done: false },
  { week: 'الأسبوع 36', title: 'سونار الربع الثالث + متابعة أسبوعية', done: false },
];

const reminders = [
  { icon: Syringe, text: 'تطعيم التيتانوس — هذا الأسبوع' },
  { icon: CheckCircle2, text: 'حمض الفوليك يومياً + الحديد بعد الغداء' },
  { icon: Baby, text: 'سجّلي حركة الجنين مرتين يومياً' },
];

interface LogEntry {
  id: string;
  text: string;
}

export function PregnancyTab() {
  const { addNotification } = useNotifications();
  const [enabled, setEnabled] = useState(true);
  const [drug, setDrug] = useState('');
  const [check, setCheck] = useState<null | { level: 'danger' | 'warning' | 'safe'; msg: string }>(null);
  const [daily, setDaily] = useState({ weight: '68', bp: '115/75', movement: '12', note: '' });
  const [log, setLog] = useState<LogEntry[]>([
    { id: 'd1', text: '08-23 • وزن 67.8kg • ضغط 112/72 • حركة الجنين طبيعية' },
  ]);
  const [saved, setSaved] = useState(false);

  const checkDrug = () => {
    const key = Object.keys(UNSAFE_PREGNANCY_DRUGS).find((k) =>
      drug.trim().toLowerCase().includes(k.toLowerCase())
    );
    if (!key) {
      setCheck({ level: 'safe', msg: 'لا توجد موانع مسجلة لهذا الدواء أثناء الحمل — يُفضّل تأكيد الطبيب.' });
      return;
    }
    const level = UNSAFE_PREGNANCY_DRUGS[key] ?? 'warning';
    setCheck({
      level,
      msg:
        level === 'danger'
          ? 'ممنوع أثناء الحمل — لا يُصرف إطلاقاً دون بديل من الطبيب.'
          : 'يحتاج استشارة الطبيب قبل الصرف أثناء الحمل.',
    });
    addNotification({
      type: 'warning',
      title: level === 'danger' ? 'تحذير دواء ممنوع أثناء الحمل' : 'تنبيه: دواء يحتاج استشارة',
      message: `${drug} — تم رصده عند إدخال الوصفة.`,
    });
  };

  const saveDaily = () => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace('/', '-');
    setLog((p) => [
      {
        id: `d-${Date.now()}`,
        text: `${today} • وزن ${daily.weight}kg • ضغط ${daily.bp} • حركة ${daily.movement}${daily.note ? ` • ${daily.note}` : ''}`,
      },
      ...p,
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    addNotification({
      type: 'info',
      title: 'تم إرسال متابعتك اليومية',
      message: 'تم تسجيل متابعة الحمل اليومية في ملفك الصحي.',
    });
  };

  if (!enabled) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-4 text-center">
        <Baby size={40} className="text-pink-300" />
        <p className="text-sm text-gray-500 max-w-xs">
          فعّلي حالة "حمل" في بياناتك الصحية ليتحوّل الملف تلقائياً إلى ملف متابعة الحمل.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700">تفعيل الحمل</span>
          <button
            onClick={() => setEnabled(true)}
            className="btn-primary px-6 py-2.5"
          >
            تفعيل
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2 animate-slide-down">
          <CheckCircle2 size={18} className="text-green-600" />
          <p className="text-green-700 font-bold text-sm">تم إرسال متابعتك اليومية للطبيب</p>
        </div>
      )}

      {/* Visit schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <HeartPulse size={18} className="text-pink-500" />
          <p className="text-sm font-bold text-gray-800">جدول الزيارات والفحوصات</p>
        </div>
        <ol className="space-y-2">
          {visits.map((v) => (
            <li
              key={v.week}
              className="flex items-start gap-3 rounded-xl bg-gray-50 p-3"
            >
              <span
                className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                  v.done ? 'bg-green-500' : 'bg-pink-400'
                }`}
              />
              <div className="flex-1 text-right">
                <p className="text-xs font-bold text-gray-800">{v.week}</p>
                <p className="text-xs text-gray-500 mt-0.5">{v.title}</p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  v.done
                    ? 'bg-green-100 text-green-700'
                    : 'bg-pink-100 text-pink-600'
                }`}
              >
                {v.done ? 'تم' : 'قادم'}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Reminders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm font-bold text-gray-800 mb-3">التحصينات والمكملات</p>
        <ul className="space-y-2">
          {reminders.map((r) => {
            const Icon = r.icon;
            return (
              <li
                key={r.text}
                className="flex items-center gap-2 rounded-xl bg-pink-50 p-3 text-xs text-gray-700"
              >
                <Icon size={16} className="text-pink-500 shrink-0" />
                {r.text}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Drug safety check */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm font-bold text-gray-800 mb-3">فحص أمان الدواء أثناء الحمل</p>
        <div className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="اسم الدواء (مثال: وارفارين)"
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
          />
          <button
            onClick={checkDrug}
            disabled={!drug.trim()}
            className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              drug.trim()
                ? 'bg-pink-500 text-white hover:bg-pink-600 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            فحص
          </button>
        </div>
        {check && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-xs ${
              check.level === 'danger'
                ? 'bg-red-50 text-red-700'
                : check.level === 'warning'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {check.level === 'safe' ? (
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            ) : check.level === 'danger' ? (
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            )}
            <span className="font-semibold">{check.msg}</span>
          </div>
        )}
      </div>

      {/* Daily tracking */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={18} className="text-pink-500" />
          <p className="text-sm font-bold text-gray-800">المتابعة اليومية</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">الوزن</label>
            <div className="relative">
              <input
                type="number"
                className="input-field pl-10"
                value={daily.weight}
                onChange={(e) => setDaily({ ...daily, weight: e.target.value })}
              />
              <span className="absolute left-3 top-3 text-[10px] text-gray-400">kg</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">الضغط</label>
            <input
              type="text"
              className="input-field text-center text-sm font-bold"
              value={daily.bp}
              onChange={(e) => setDaily({ ...daily, bp: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">حركة الجنين</label>
            <input
              type="number"
              className="input-field text-center text-sm font-bold"
              value={daily.movement}
              onChange={(e) => setDaily({ ...daily, movement: e.target.value })}
            />
          </div>
        </div>
        <input
          type="text"
          className="input-field mt-3"
          placeholder="أعراض أو ملاحظات"
          value={daily.note}
          onChange={(e) => setDaily({ ...daily, note: e.target.value })}
        />
        <button
          onClick={saveDaily}
          className="btn-primary w-full mt-3 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> حفظ المتابعة
        </button>
        <ul className="mt-3 space-y-2">
          {log.map((l) => (
            <li
              key={l.id}
              className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600"
            >
              {l.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
