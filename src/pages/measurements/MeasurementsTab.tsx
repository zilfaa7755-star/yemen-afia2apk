import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Droplet, Scale, HeartPulse, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const DANGER = { systolic: 180, diastolic: 110, glucose: 300 };

export interface Measurement {
  id: string;
  date: string;
  systolic: number;
  diastolic: number;
  glucose: number;
  weight: number;
}

const demoData: Measurement[] = [
  { id: 'm1', date: '٩ سبتمبر', systolic: 125, diastolic: 82, glucose: 110, weight: 83 },
  { id: 'm2', date: '١٠ سبتمبر', systolic: 132, diastolic: 86, glucose: 145, weight: 82.5 },
  { id: 'm3', date: '١١ سبتمبر', systolic: 128, diastolic: 84, glucose: 130, weight: 82.8 },
  { id: 'm4', date: '١٢ سبتمبر', systolic: 140, diastolic: 92, glucose: 160, weight: 83.2 },
];

export function MeasurementsTab() {
  const { addNotification } = useNotifications();
  const [measurements, setMeasurements] = useState<Measurement[]>(demoData);
  const [form, setForm] = useState({ systolic: '130', diastolic: '85', glucose: '150', weight: '83' });
  const [saved, setSaved] = useState(false);

  const submit = () => {
    const m: Measurement = {
      id: `m-${Date.now()}`,
      date: new Date().toLocaleDateString('ar-YE', { day: 'numeric', month: 'long' }),
      systolic: Number(form.systolic),
      diastolic: Number(form.diastolic),
      glucose: Number(form.glucose),
      weight: Number(form.weight),
    };
    setMeasurements((prev) => [...prev, m]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);

    const danger = m.systolic >= DANGER.systolic || m.diastolic >= DANGER.diastolic || m.glucose >= DANGER.glucose;

    addNotification({
      type: danger ? 'warning' : 'info',
      title: danger ? 'تحذير: قراءاتك مرتفعة' : 'تم تسجيل قياس جديد',
      message: danger
        ? 'قراءاتك تجاوزت الحدود الآمنة، يُنصح بمراجعة الطبيب فوراً.'
        : 'تم تحديث الرسم البياني في ملفك الصحي.',
    });

    if (danger) {
      addNotification({
        type: 'warning',
        title: 'تنبيه خطر لمريضك',
        message: `قراءة: ${m.systolic}/${m.diastolic} — سكر ${m.glucose}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2 animate-slide-down">
          <CheckCircle2 size={18} className="text-green-600" />
          <p className="text-green-700 font-bold text-sm">تم حفظ القياس في ملفك الصحي</p>
        </div>
      )}

      {/* Input card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Plus size={18} className="text-primary-600" />
          <p className="text-sm font-bold text-gray-800">إدخال قياس جديد</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field icon={HeartPulse} label="الضغط الانقباضي" value={form.systolic} onChange={(v) => setForm({ ...form, systolic: v })} unit="mmHg" />
          <Field icon={Activity} label="الضغط الانبساطي" value={form.diastolic} onChange={(v) => setForm({ ...form, diastolic: v })} unit="mmHg" />
          <Field icon={Droplet} label="السكر (mg/dL)" value={form.glucose} onChange={(v) => setForm({ ...form, glucose: v })} unit="mg/dL" />
          <Field icon={Scale} label="الوزن (kg)" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} unit="kg" />
        </div>
        <button
          onClick={submit}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> حفظ القياس
        </button>
        <p className="mt-2 text-center text-[11px] text-gray-400">
          الحد الخطر: ضغط ≥ {DANGER.systolic}/{DANGER.diastolic} • سكر ≥ {DANGER.glucose}
        </p>
      </div>

      {/* Charts */}
      <ChartCard
        title="تطور ضغط الدم"
        data={measurements}
        lines={[
          { key: 'systolic', name: 'انقباضي', color: '#ef4444' },
          { key: 'diastolic', name: 'انبساطي', color: '#3b82f6' },
        ]}
      />
      <ChartCard
        title="تطور السكر"
        data={measurements}
        lines={[{ key: 'glucose', name: 'السكر', color: '#22c55e' }]}
      />

      {/* History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <p className="mb-3 text-sm font-bold text-gray-800">سجل القراءات</p>
        <ul className="space-y-2">
          {[...measurements].reverse().map((m) => {
            const danger = m.systolic >= DANGER.systolic || m.glucose >= DANGER.glucose;
            return (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 text-xs"
              >
                <span className="font-bold text-gray-600">{m.date}</span>
                <span className="text-gray-700 font-medium">
                  {m.systolic}/{m.diastolic} • سكر {m.glucose} • {m.weight}kg
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    danger ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {danger ? 'خطر' : 'طبيعي'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  unit,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
        <Icon size={13} className="text-gray-400" />
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          className="input-field pl-12"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="absolute left-3 top-3 text-[10px] text-gray-400">{unit}</span>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  data,
  lines,
}: {
  title: string;
  data: Measurement[];
  lines: { key: string; name: string; color: string }[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <p className="mb-3 text-sm font-bold text-gray-800">{title}</p>
      <div className="h-48 w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                background: '#fff',
              }}
            />
            {lines.map((l) => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.name}
                stroke={l.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
