import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Droplet,
  Scale,
  HeartPulse,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Bell,
  Clock,
  Check,
  X,
  ChevronLeft,
  Calendar,
  Zap,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type VitalType = 'blood_pressure' | 'blood_sugar' | 'weight' | 'heart_rate';

interface VitalReading {
  id: string;
  patient_id: string;
  vital_type: VitalType;
  systolic: number | null;
  diastolic: number | null;
  value: number | null;
  unit: string;
  measured_at: string;
  context: string;
  notes: string | null;
  is_dangerous: boolean;
  created_at: string;
}

interface DangerAlert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ReminderSchedule {
  id: string;
  disease_type: string;
  vital_type: VitalType;
  reminder_time: string;
  context: string;
  is_active: boolean;
}

const vitalConfig: Record<VitalType, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  unit: string;
  gradient: string;
}> = {
  blood_pressure: {
    label: 'ضغط الدم',
    icon: HeartPulse,
    color: 'text-red-600',
    bg: 'bg-red-50',
    unit: 'mmHg',
    gradient: 'from-red-500 to-rose-600',
  },
  blood_sugar: {
    label: 'سكر الدم',
    icon: Droplet,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    unit: 'mg/dL',
    gradient: 'from-blue-500 to-cyan-600',
  },
  weight: {
    label: 'الوزن',
    icon: Scale,
    color: 'text-green-600',
    bg: 'bg-green-50',
    unit: 'kg',
    gradient: 'from-green-500 to-emerald-600',
  },
  heart_rate: {
    label: 'نبضات القلب',
    icon: Activity,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    unit: 'bpm',
    gradient: 'from-purple-500 to-violet-600',
  },
};

const contextLabels: Record<string, string> = {
  fasting: 'صائماً',
  after_breakfast: 'بعد الإفطار',
  after_lunch: 'بعد الغداء',
  evening: 'مساءً',
  random: 'عشوائي',
};

const thresholds: Record<VitalType, { high: number; low: number; highLabel: string; lowLabel: string }> = {
  blood_pressure: { high: 180, low: 90, highLabel: 'ضغط مرتفع جداً', lowLabel: 'ضغط منخفض جداً' },
  blood_sugar: { high: 300, low: 70, highLabel: 'سكر مرتفع جداً', lowLabel: 'سكر منخفض جداً' },
  weight: { high: 999, low: 0, highLabel: '', lowLabel: '' },
  heart_rate: { high: 150, low: 40, highLabel: 'نبض مرتفع جداً', lowLabel: 'نبض منخفض جداً' },
};

function isReadingDangerous(vitalType: VitalType, systolic: number | null, value: number | null): boolean {
  if (vitalType === 'blood_pressure' && systolic !== null) {
    return systolic >= thresholds.blood_pressure.high || systolic <= thresholds.blood_pressure.low;
  }
  if (value !== null && vitalType !== 'blood_pressure') {
    return value >= thresholds[vitalType].high || value <= thresholds[vitalType].low;
  }
  return false;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 30;
  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={i * step}
          cy={height - ((v - min) / range) * height}
          r="1.5"
          fill={color}
        />
      ))}
    </svg>
  );
}

interface ChronicDiseasePageProps {
  onBack?: () => void;
}

export function ChronicDiseasePage({ onBack }: ChronicDiseasePageProps) {
  const { user } = useAuth();
  const patientId = user?.id || 'demo-patient';
  const chronicDiseases: string[] = (user && 'chronic_diseases' in user && Array.isArray(user.chronic_diseases)) ? user.chronic_diseases : [];

  const [activeTab, setActiveTab] = useState<'overview' | 'add' | 'reminders' | 'alerts'>('overview');
  const [readings, setReadings] = useState<VitalReading[]>([]);
  const [alerts, setAlerts] = useState<DangerAlert[]>([]);
  const [reminders, setReminders] = useState<ReminderSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [formVitalType, setFormVitalType] = useState<VitalType>('blood_pressure');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [value, setValue] = useState('');
  const [formContext, setFormContext] = useState('fasting');
  const [notes, setNotes] = useState('');

  // Reminder form
  const [reminderVitalType, setReminderVitalType] = useState<VitalType>('blood_sugar');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [reminderContext, setReminderContext] = useState('fasting');
  const [reminderDisease, setReminderDisease] = useState('diabetes');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [readingsRes, alertsRes, remindersRes] = await Promise.all([
        supabase
          .from('chronic_vitals_readings')
          .select('*')
          .eq('patient_id', patientId)
          .order('measured_at', { ascending: false })
          .limit(100),
        supabase
          .from('chronic_danger_alerts')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('chronic_reminder_schedules')
          .select('*')
          .eq('patient_id', patientId)
          .eq('is_active', true)
          .order('reminder_time', { ascending: true }),
      ]);

      if (readingsRes.data) setReadings(readingsRes.data as VitalReading[]);
      if (alertsRes.data) setAlerts(alertsRes.data as DangerAlert[]);
      if (remindersRes.data) setReminders(remindersRes.data as ReminderSchedule[]);
    } catch (err) {
      console.error('Error loading chronic disease data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveReading = async () => {
    const config = vitalConfig[formVitalType];
    let readingValue: number | null = null;
    let sys: number | null = null;
    let dia: number | null = null;

    if (formVitalType === 'blood_pressure') {
      sys = systolic ? parseInt(systolic) : null;
      dia = diastolic ? parseInt(diastolic) : null;
      if (!sys || !dia) return;
    } else {
      readingValue = value ? parseFloat(value) : null;
      if (readingValue === null) return;
    }

    const dangerous = isReadingDangerous(formVitalType, sys, readingValue);

    const { data: readingData, error: readingError } = await supabase
      .from('chronic_vitals_readings')
      .insert({
        patient_id: patientId,
        vital_type: formVitalType,
        systolic: sys,
        diastolic: dia,
        value: readingValue,
        unit: config.unit,
        measured_at: new Date().toISOString(),
        context: formContext,
        notes: notes || null,
        is_dangerous: dangerous,
      })
      .select()
      .single();

    if (readingError) {
      console.error('Error saving reading:', readingError);
      return;
    }

    if (dangerous && readingData) {
      const threshold = thresholds[formVitalType];
      const isHigh = formVitalType === 'blood_pressure'
        ? (sys !== null && sys >= threshold.high)
        : (readingValue !== null && readingValue >= threshold.high);
      const alertType = formVitalType === 'blood_pressure'
        ? (isHigh ? 'high_bp' : 'low_bp')
        : (isHigh ? 'high_sugar' : 'low_sugar');
      const severity = isHigh ? 'critical' : 'warning';
      const message = formVitalType === 'blood_pressure'
        ? `${threshold.highLabel}: ${sys}/${dia} mmHg — يُنصح بمراجعة الطبيب فوراً`
        : `${isHigh ? threshold.highLabel : threshold.lowLabel}: ${readingValue} ${config.unit} — يُنصح بمراجعة الطبيب فوراً`;

      await supabase.from('chronic_danger_alerts').insert({
        patient_id: patientId,
        reading_id: readingData.id,
        alert_type: alertType,
        severity,
        message,
        is_read: false,
        notified_doctor: false,
      });
    }

    setSystolic('');
    setDiastolic('');
    setValue('');
    setNotes('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
    setActiveTab('overview');
    loadData();
  };

  const handleSaveReminder = async () => {
    const { error } = await supabase.from('chronic_reminder_schedules').insert({
      patient_id: patientId,
      disease_type: reminderDisease,
      vital_type: reminderVitalType,
      reminder_time: reminderTime,
      context: reminderContext,
      is_active: true,
    });

    if (error) {
      console.error('Error saving reminder:', error);
      return;
    }

    loadData();
  };

  const handleDeleteReminder = async (id: string) => {
    await supabase
      .from('chronic_reminder_schedules')
      .update({ is_active: false })
      .eq('id', id);
    loadData();
  };

  const handleMarkAlertRead = async (id: string) => {
    await supabase
      .from('chronic_danger_alerts')
      .update({ is_read: true })
      .eq('id', id);
    loadData();
  };

  const getVitalSeries = (type: VitalType): number[] => {
    return readings
      .filter((r) => r.vital_type === type)
      .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
      .map((r) => (type === 'blood_pressure' ? (r.systolic || 0) : (r.value || 0)))
      .slice(-10);
  };

  const getLatestReading = (type: VitalType): VitalReading | null => {
    return readings.find((r) => r.vital_type === type) || null;
  };

  const unreadAlerts = alerts.filter((a) => !a.is_read);
  const activeReminders = reminders.filter((r) => r.is_active);

  const vitalTypes: VitalType[] = ['blood_pressure', 'blood_sugar', 'weight', 'heart_rate'];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header title="متابعة الأمراض المزمنة" showBack onBack={onBack} />

      {/* Disease badges */}
      {chronicDiseases.length > 0 && (
        <div className="px-4 pt-4">
          <div className="flex flex-wrap gap-2">
            {chronicDiseases.map((d) => (
              <span
                key={d}
                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 pt-4 sticky top-16 z-30 bg-gray-50 pb-2">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: Activity },
            { id: 'add', label: 'تسجيل قياس', icon: Plus },
            { id: 'reminders', label: 'التذكيرات', icon: Bell },
            { id: 'alerts', label: 'التنبيهات', icon: AlertTriangle, badge: unreadAlerts.length },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#2196F3] text-white shadow-md shadow-blue-200'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.badge ? (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top">
          <Check size={20} />
          <span className="font-medium">تم حفظ القياس بنجاح</span>
        </div>
      )}

      <div className="px-4 mt-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2196F3]"></div>
          </div>
        ) : activeTab === 'overview' ? (
          /* ---- Overview ---- */
          <div className="space-y-4">
            {/* Vital cards */}
            <div className="grid grid-cols-2 gap-3">
              {vitalTypes.map((type) => {
                const config = vitalConfig[type];
                const Icon = config.icon;
                const latest = getLatestReading(type);
                const series = getVitalSeries(type);
                const trend = series.length >= 2 ? series[series.length - 1] - series[series.length - 2] : 0;

                return (
                  <div
                    key={type}
                    className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${
                      latest?.is_dangerous ? 'ring-2 ring-red-300' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center`}>
                        <Icon size={20} className={config.color} />
                      </div>
                      {latest?.is_dangerous && (
                        <AlertTriangle size={16} className="text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{config.label}</p>
                    {latest ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          {type === 'blood_pressure' ? (
                            <span className="text-xl font-bold text-gray-800">
                              {latest.systolic}/{latest.diastolic}
                            </span>
                          ) : (
                            <span className="text-xl font-bold text-gray-800">
                              {latest.value}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{config.unit}</span>
                        </div>
                        {series.length >= 2 && (
                          <div className="flex items-center gap-1 mt-1">
                            {trend > 0 ? (
                              <TrendingUp size={12} className="text-orange-500" />
                            ) : trend < 0 ? (
                              <TrendingDown size={12} className="text-green-500" />
                            ) : null}
                            <span className={`text-xs ${trend > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                              {trend !== 0 ? `${Math.abs(trend).toFixed(1)}` : 'مستقر'}
                            </span>
                            <div className="mr-auto">
                              <Sparkline data={series} color={config.color.replace('text-', '#').replace('600', '500').replace('500', '500')} />
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {contextLabels[latest.context] || ''} · {new Date(latest.measured_at).toLocaleDateString('ar-YE')}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">لا توجد قراءات</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recent readings list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm">آخر القراءات</h3>
              </div>
              {readings.length === 0 ? (
                <div className="text-center py-10">
                  <Activity size={48} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">لم تسجل أي قياسات بعد</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-3 text-[#2196F3] font-medium text-sm"
                  >
                    سجل أول قياس
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {readings.slice(0, 10).map((r) => {
                    const config = vitalConfig[r.vital_type];
                    const Icon = config.icon;
                    return (
                      <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                        <div className={`w-9 h-9 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon size={16} className={config.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800 text-sm">
                              {r.vital_type === 'blood_pressure'
                                ? `${r.systolic}/${r.diastolic} ${r.unit}`
                                : `${r.value} ${r.unit}`}
                            </span>
                            {r.is_dangerous && (
                              <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">
                                خطر
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {config.label} · {contextLabels[r.context]} · {new Date(r.measured_at).toLocaleDateString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'add' ? (
          /* ---- Add Reading ---- */
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">تسجيل قياس جديد</h3>

              {/* Vital type selector */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {vitalTypes.map((type) => {
                  const config = vitalConfig[type];
                  const Icon = config.icon;
                  const isSelected = formVitalType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setFormVitalType(type)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                        isSelected
                          ? `bg-gradient-to-br ${config.gradient} text-white shadow-md`
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-medium">{config.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input fields */}
              {formVitalType === 'blood_pressure' ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">الضغط الانقباضي</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      placeholder="120"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-bold text-center focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">الضغط الانبساطي</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      placeholder="80"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-bold text-center focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="text-sm text-gray-600 mb-1.5 block">
                    {vitalConfig[formVitalType].label} ({vitalConfig[formVitalType].unit})
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={formVitalType === 'blood_sugar' ? '120' : formVitalType === 'weight' ? '75' : '72'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg font-bold text-center focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                  />
                </div>
              )}

              {/* Context selector */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-1.5 block">حالة القياس</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(contextLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFormContext(key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        formContext === key
                          ? 'bg-[#2196F3] text-white'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="text-sm text-gray-600 mb-1.5 block">ملاحظات (اختياري)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف ملاحظة..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none resize-none"
                />
              </div>

              <button
                onClick={handleSaveReading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-l from-[#2196F3] to-[#1976D2] text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Check size={20} />
                حفظ القياس
              </button>
            </div>

            {/* Quick tips */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <Zap size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">نصائح للقياس الصحيح</p>
                  <ul className="text-xs text-blue-700 space-y-1 leading-relaxed">
                    <li>• قس الضغط بعد 5 دقائق من الراحة في وضع الجلوس</li>
                    <li>• قس السكر الصائم قبل الإفطار مباشرة</li>
                    <li>• سجل القياسات في نفس الوقت يومياً للحصول على نتائج دقيقة</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'reminders' ? (
          /* ---- Reminders ---- */
          <div className="space-y-4">
            {/* Add reminder form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">إضافة تذكير ذكي</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">نوع القياس</label>
                  <div className="flex gap-2">
                    {vitalTypes.map((type) => {
                      const config = vitalConfig[type];
                      const Icon = config.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => setReminderVitalType(type)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            reminderVitalType === type
                              ? `bg-gradient-to-br ${config.gradient} text-white`
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          <Icon size={16} />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">الوقت</label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">الحالة</label>
                    <select
                      value={reminderContext}
                      onChange={(e) => setReminderContext(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-300 outline-none bg-white"
                    >
                      {Object.entries(contextLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">نوع المرض</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'diabetes', label: 'السكري' },
                      { id: 'hypertension', label: 'الضغط' },
                      { id: 'both', label: 'كلاهما' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setReminderDisease(d.id)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          reminderDisease === d.id
                            ? 'bg-[#2196F3] text-white'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveReminder}
                  className="w-full py-3 rounded-2xl bg-gradient-to-l from-[#2196F3] to-[#1976D2] text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Plus size={20} />
                  إضافة التذكير
                </button>
              </div>
            </div>

            {/* Active reminders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm">التذكيرات النشطة</h3>
              </div>
              {activeReminders.length === 0 ? (
                <div className="text-center py-10">
                  <Bell size={40} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">لا توجد تذكيرات نشطة</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {activeReminders.map((r) => {
                    const config = vitalConfig[r.vital_type];
                    const Icon = config.icon;
                    return (
                      <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                        <div className={`w-9 h-9 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon size={16} className={config.color} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">
                            {config.label} — {contextLabels[r.context]}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <Clock size={12} />
                            {r.reminder_time}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteReminder(r.id)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ---- Alerts ---- */
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-500" />
                </div>
                <p className="font-medium text-gray-700">لا توجد تنبيهات خطر</p>
                <p className="text-sm text-gray-400 mt-1">جميع قراءاتك ضمن الحدود الآمنة</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-2xl p-4 border ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-orange-50 border-orange-200'
                  } ${!alert.is_read ? 'ring-2 ring-offset-1 ring-red-200' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                    }`}>
                      <AlertTriangle size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          alert.severity === 'critical'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-orange-200 text-orange-800'
                        }`}>
                          {alert.severity === 'critical' ? 'حرج' : 'تحذير'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(alert.created_at).toLocaleDateString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{alert.message}</p>
                      {!alert.is_read && (
                        <button
                          onClick={() => handleMarkAlertRead(alert.id)}
                          className="mt-2 text-xs text-[#2196F3] font-medium"
                        >
                          تعليم كمقروء
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
