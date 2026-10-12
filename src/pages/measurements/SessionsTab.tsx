import { useState } from 'react';
import {
  Droplets,
  FlaskConical,
  Ribbon,
  Plus,
  Bell,
  Pill,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

type SessionSubTab = 'dialysis' | 'onco';
type Severity = 'خفيف' | 'متوسط' | 'شديد';

interface SymptomEntry {
  id: string;
  date: string;
  text: string;
  severity: Severity;
}

const dialysis = [
  { day: 'السبت', time: '07:00 ص', center: 'مركز الكلى التخصصي', status: 'قادمة' },
  { day: 'الاثنين', time: '07:00 ص', center: 'مركز الكلى التخصصي', status: 'قادمة' },
  { day: 'الأربعاء', time: '07:00 ص', center: 'مركز الكلى التخصصي', status: 'قادمة' },
];

const labs = [
  { name: 'الكرياتينين', value: '6.2 mg/dL', state: 'مرتفع' },
  { name: 'اليوريا', value: '118 mg/dL', state: 'مرتفع' },
  { name: 'البوتاسيوم', value: '4.8 mmol/L', state: 'طبيعي' },
];

const chemo = [
  { cycle: 'الجرعة 3', date: '2026-08-28', note: 'تأكد من إجراء تحليل CBC قبل الجلسة بيومين' },
  { cycle: 'الجرعة 4', date: '2026-09-18', note: 'جلسة إشعاعية مرافقة' },
];

const demoSymptoms: SymptomEntry[] = [
  { id: 's1', date: '08-25', text: 'غثيان خفيف بعد الجرعة', severity: 'خفيف' },
];

export function SessionsTab() {
  const { addNotification } = useNotifications();
  const [subTab, setSubTab] = useState<SessionSubTab>('dialysis');
  const [text, setText] = useState('');
  const [severity, setSeverity] = useState<Severity>('متوسط');
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>(demoSymptoms);
  const [saved, setSaved] = useState(false);

  const sendSymptom = () => {
    if (!text.trim()) return;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace('/', '-');
    setSymptoms((p) => [
      { id: `s-${Date.now()}`, date: today, text: text.trim(), severity },
      ...p,
    ]);
    addNotification({
      type: 'warning',
      title: 'عرض جانبي جديد من المريض',
      message: `${text} — الشدة: ${severity}`,
    });
    setText('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const simulateReminder = () => {
    addNotification({
      type: 'warning',
      title: 'تذكير: جلسة الغسيل',
      message: 'غداً موعدك لجلسة الغسيل الساعة 7:00 صباحاً.',
    });
  };

  const simulateDose = () => {
    addNotification({
      type: 'info',
      title: 'حان وقت الدواء المرافق',
      message: 'خذ دواء الغثيان مع الجرعة الكيميائية.',
    });
  };

  return (
    <div className="space-y-4">
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2 animate-slide-down">
          <CheckCircle2 size={18} className="text-green-600" />
          <p className="text-green-700 font-bold text-sm">تم إرسال العرض للطبيب المختص</p>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-1">
        <button
          onClick={() => setSubTab('dialysis')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            subTab === 'dialysis'
              ? 'bg-gradient-to-l from-cyan-500 to-blue-500 text-white shadow-card'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Droplets size={18} /> الغسيل الكلوي
        </button>
        <button
          onClick={() => setSubTab('onco')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            subTab === 'onco'
              ? 'bg-gradient-to-l from-rose-500 to-pink-500 text-white shadow-card'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Ribbon size={18} /> الأورام
        </button>
      </div>

      {subTab === 'dialysis' && (
        <div className="space-y-4">
          {/* Dialysis schedule */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Droplets size={18} className="text-cyan-500" />
              <p className="text-sm font-bold text-gray-800">جدول جلسات الغسيل (3 أيام أسبوعياً)</p>
            </div>
            <ul className="space-y-2">
              {dialysis.map((d) => (
                <li
                  key={d.day}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-xs"
                >
                  <span className="font-bold text-gray-800">{d.day}</span>
                  <span className="text-gray-600">{d.time}</span>
                  <span className="text-gray-400">{d.center}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">
                    {d.status}
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={simulateReminder}
              className="w-full mt-3 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold text-sm py-3 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
            >
              <Bell size={16} /> محاكاة تذكير ما قبل الجلسة
            </button>
          </div>

          {/* Lab results */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical size={18} className="text-[#199A8E]" />
              <p className="text-sm font-bold text-gray-800">تحاليل المختبر الدورية</p>
            </div>
            <ul className="space-y-2">
              {labs.map((l) => (
                <li
                  key={l.name}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-xs"
                >
                  <span className="font-bold text-gray-800">{l.name}</span>
                  <span className="text-gray-600">{l.value}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      l.state === 'مرتفع'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {l.state}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {subTab === 'onco' && (
        <div className="space-y-4">
          {/* Chemo plan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Ribbon size={18} className="text-rose-500" />
              <p className="text-sm font-bold text-gray-800">خطة العلاج الكيميائي</p>
            </div>
            <ul className="space-y-2">
              {chemo.map((c) => (
                <li
                  key={c.cycle}
                  className="rounded-xl bg-gray-50 p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">{c.cycle}</span>
                    <span className="text-gray-500">{c.date}</span>
                  </div>
                  <p className="mt-1 text-gray-500">{c.note}</p>
                </li>
              ))}
            </ul>
            <button
              onClick={simulateDose}
              className="w-full mt-3 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold text-sm py-3 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
            >
              <Pill size={16} /> محاكاة تنبيه الجرعة اليومية
            </button>
          </div>

          {/* Side effects */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-500" />
              <p className="text-sm font-bold text-gray-800">تسجيل الأعراض الجانبية</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1"
                placeholder="مثال: غثيان وتعب بعد الجرعة"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                onClick={sendSymptom}
                disabled={!text.trim()}
                className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  text.trim()
                    ? 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                إرسال
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              {(['خفيف', 'متوسط', 'شديد'] as Severity[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    severity === s
                      ? s === 'خفيف'
                        ? 'bg-green-500 text-white'
                        : s === 'متوسط'
                        ? 'bg-amber-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <ul className="mt-3 space-y-2">
              {symptoms.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-xs"
                >
                  <span className="text-gray-400">{s.date}</span>
                  <span className="font-semibold text-gray-700">{s.text}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.severity === 'خفيف'
                        ? 'bg-green-100 text-green-700'
                        : s.severity === 'متوسط'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {s.severity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
