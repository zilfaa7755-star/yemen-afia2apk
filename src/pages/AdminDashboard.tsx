import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Calendar, FlaskConical, Pill, Activity,
  Heart, Stethoscope, Building2, BarChart2, Settings, LogOut,
  Bell, TrendingUp, RefreshCw, Search, CheckCircle, XCircle,
  AlertTriangle, Shield, Edit3, Trash2, Plus, Download, Send,
  Clock, MapPin, ArrowUpRight, ArrowDownRight, UserCheck, UserX, ArrowRight,
  Database, ToggleLeft, ToggleRight, Save, X, FileText, Award,
  Zap, Star, Radio, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type AdminTab = 'overview' | 'users' | 'appointments' | 'services' | 'facilities' | 'reports' | 'announcements' | 'settings';

interface StatCard { label: string; value: number | string; change?: number; icon: React.ElementType; color: string; bg: string; }
interface UserRecord { id: string; full_name: string; phone: string; patient_code?: string; role: string; created_at: string; is_active?: boolean; }
interface AppointmentRecord { id: string; patient_name?: string; doctor_name?: string; clinic_name?: string; status: string; appointment_date: string; queue_number?: number; payment_status?: string; created_at: string; }
interface AnnouncementForm { title: string; body: string; priority: 'low' | 'normal' | 'high' | 'critical'; target_roles: string[]; expires_at: string; }
interface ConfigItem { key: string; value: string; description: string; }

const buildDemoUsers = (): UserRecord[] => [
  { id: 'u1', full_name: 'أحمد محمد الأغبري', phone: '777001001', patient_code: 'YA-001001', role: 'patient', created_at: new Date(Date.now()-86400000*2).toISOString(), is_active: true },
  { id: 'u2', full_name: 'فاطمة علي المقطري', phone: '777002002', patient_code: 'YA-002002', role: 'patient', created_at: new Date(Date.now()-86400000*5).toISOString(), is_active: true },
  { id: 'u3', full_name: 'د. محمد يحيى العمري', phone: '777003003', role: 'doctor', created_at: new Date(Date.now()-86400000*30).toISOString(), is_active: true },
  { id: 'u4', full_name: 'سالم عبدالله المقطري', phone: '777004004', role: 'secretary', created_at: new Date(Date.now()-86400000*20).toISOString(), is_active: true },
  { id: 'u5', full_name: 'محمد يحيى الأغبري', phone: '777005005', role: 'nurse', created_at: new Date(Date.now()-86400000*15).toISOString(), is_active: true },
  { id: 'u6', full_name: 'مستشفى الجمهوري', phone: '01-234567', role: 'hospital', created_at: new Date(Date.now()-86400000*60).toISOString(), is_active: true },
  { id: 'u7', full_name: 'خالد عبدالله الشامي', phone: '777007007', patient_code: 'YA-007007', role: 'patient', created_at: new Date(Date.now()-86400000).toISOString(), is_active: false },
  { id: 'u8', full_name: 'د. فاطمة الشامي', phone: '777008008', role: 'doctor', created_at: new Date(Date.now()-86400000*10).toISOString(), is_active: true },
];

const buildDemoAppointments = (): AppointmentRecord[] => [
  { id: 'a1', patient_name: 'أحمد الأغبري', doctor_name: 'د. محمد العمري', clinic_name: 'عيادة القلب', status: 'confirmed', appointment_date: new Date().toISOString().split('T')[0], queue_number: 3, payment_status: 'paid', created_at: new Date(Date.now()-3600000).toISOString() },
  { id: 'a2', patient_name: 'فاطمة المقطري', doctor_name: 'د. فاطمة الشامي', clinic_name: 'عيادة الأطفال', status: 'completed', appointment_date: new Date(Date.now()-86400000).toISOString().split('T')[0], queue_number: 7, payment_status: 'paid', created_at: new Date(Date.now()-90000000).toISOString() },
  { id: 'a3', patient_name: 'خالد الشامي', doctor_name: 'د. محمد العمري', clinic_name: 'عيادة القلب', status: 'cancelled', appointment_date: new Date(Date.now()-172800000).toISOString().split('T')[0], queue_number: 2, payment_status: 'pending', created_at: new Date(Date.now()-180000000).toISOString() },
  { id: 'a4', patient_name: 'نورا الحيمي', doctor_name: 'د. محمد العمري', clinic_name: 'عيادة القلب', status: 'pending', appointment_date: new Date(Date.now()+86400000).toISOString().split('T')[0], queue_number: 1, payment_status: 'pending', created_at: new Date(Date.now()-1800000).toISOString() },
  { id: 'a5', patient_name: 'عمر البكري', doctor_name: 'د. فاطمة الشامي', clinic_name: 'عيادة الأطفال', status: 'in_progress', appointment_date: new Date().toISOString().split('T')[0], queue_number: 4, payment_status: 'paid', created_at: new Date(Date.now()-7200000).toISOString() },
];

const defaultConfig: ConfigItem[] = [
  { key: 'maintenance_mode', value: 'false', description: 'وضع الصيانة — يوقف الحجوزات الجديدة' },
  { key: 'booking_enabled', value: 'true', description: 'السماح بالحجوزات الجديدة' },
  { key: 'registration_enabled', value: 'true', description: 'السماح بتسجيل مستخدمين جدد' },
  { key: 'ai_assistant_enabled', value: 'true', description: 'تفعيل المساعد الذكي' },
  { key: 'blood_donation_enabled', value: 'true', description: 'تفعيل خدمة التبرع بالدم' },
  { key: 'nursing_enabled', value: 'true', description: 'تفعيل التمريض المنزلي' },
  { key: 'pharmacy_delivery_enabled', value: 'true', description: 'تفعيل توصيل الأدوية' },
  { key: 'mental_health_enabled', value: 'true', description: 'تفعيل الصحة النفسية' },
  { key: 'max_queue_size', value: '50', description: 'الحد الأقصى لحجم الطابور لكل طبيب' },
  { key: 'avg_consultation_minutes', value: '15', description: 'متوسط وقت الكشف بالدقيقة' },
];

const fmtDate = (d: string) => new Date(d).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short', year: 'numeric' });
const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  return `منذ ${Math.floor(hrs / 24)} يوم`;
};

const roleLabel: Record<string, { label: string; cls: string }> = {
  patient:   { label: 'مريض',       cls: 'bg-[#E8F5F4] text-[#104C48]' },
  doctor:    { label: 'طبيب',       cls: 'bg-green-100 text-green-700' },
  secretary: { label: 'سكرتاري',    cls: 'bg-purple-100 text-purple-700' },
  nurse:     { label: 'ممرض/ة',     cls: 'bg-teal-100 text-teal-700' },
  hospital:  { label: 'منشأة طبية', cls: 'bg-red-100 text-red-700' },
  admin:     { label: 'مدير',       cls: 'bg-gray-900 text-white' },
};

const apptStatusConfig: Record<string, { label: string; cls: string }> = {
  pending:     { label: 'معلق',     cls: 'bg-amber-100 text-amber-700' },
  confirmed:   { label: 'مؤكد',     cls: 'bg-[#E8F5F4] text-[#104C48]' },
  in_progress: { label: 'جارٍ',     cls: 'bg-green-100 text-green-700' },
  completed:   { label: 'مكتمل',    cls: 'bg-gray-100 text-gray-600' },
  cancelled:   { label: 'ملغي',     cls: 'bg-red-100 text-red-600' },
  no_show:     { label: 'غياب',     cls: 'bg-orange-100 text-orange-600' },
};

function KpiCard({ label, value, change, icon: Icon, color, bg }: StatCard) {
  const positive = change !== undefined && change >= 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${positive ? 'text-green-600' : 'text-red-500'}`}>
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900">{typeof value === 'number' ? value.toLocaleString('ar') : value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>{action}</div>
      <div className="text-right">
        <h2 className="font-black text-gray-900 text-lg">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { logout, user } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [users, setUsers] = useState<UserRecord[]>(buildDemoUsers());
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(buildDemoAppointments());
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [config, setConfig] = useState<ConfigItem[]>(defaultConfig);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [apptSearch, setApptSearch] = useState('');
  const [apptStatusFilter, setApptStatusFilter] = useState('all');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({
    title: '', body: '', priority: 'normal',
    target_roles: ['patient', 'doctor', 'secretary', 'nurse', 'hospital'], expires_at: '',
  });
  const [annSaved, setAnnSaved] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ label: string; onConfirm: () => void } | null>(null);

  const refresh = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [usersRes, apptsRes, annRes, cfgRes, logRes] = await Promise.allSettled([
          supabase.from('users').select('id,full_name,phone,patient_code,created_at').order('created_at', { ascending: false }).limit(100),
          supabase.from('appointments').select('id,patient_id,doctor_id,status,appointment_date,queue_number,payment_status,created_at').order('created_at', { ascending: false }).limit(100),
          supabase.from('system_announcements').select('*').order('created_at', { ascending: false }),
          supabase.from('app_config').select('key,value,description').order('key'),
          supabase.from('admin_activity_log').select('*').order('created_at', { ascending: false }).limit(50),
        ]);
        if (usersRes.status === 'fulfilled' && usersRes.value.data?.length) setUsers(usersRes.value.data.map((u: any) => ({ ...u, role: 'patient', is_active: true })));
        if (apptsRes.status === 'fulfilled' && apptsRes.value.data?.length) setAppointments(apptsRes.value.data.map((a: any) => ({ ...a, patient_name: '—', doctor_name: '—', clinic_name: '—' })));
        if (annRes.status === 'fulfilled' && annRes.value.data) setAnnouncements(annRes.value.data);
        if (cfgRes.status === 'fulfilled' && cfgRes.value.data?.length) setConfig(cfgRes.value.data.map((c: any) => ({ key: c.key, value: typeof c.value === 'string' ? c.value : JSON.stringify(c.value), description: c.description || c.key })));
        if (logRes.status === 'fulfilled' && logRes.value.data) setActivityLog(logRes.value.data);
      } catch {}
      setIsLoading(false);
    };
    load();
  }, [refreshKey]);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active !== false).length;
  const totalDoctors = users.filter(u => u.role === 'doctor').length;
  const totalPatients = users.filter(u => u.role === 'patient').length;
  const totalAppts = appointments.length;
  const completedAppts = appointments.filter(a => a.status === 'completed').length;
  const cancelledAppts = appointments.filter(a => a.status === 'cancelled').length;
  const todayAppts = appointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length;

  const kpiCards: StatCard[] = [
    { label: 'إجمالي المستخدمين', value: totalUsers, change: 12, icon: Users, color: 'text-[#199A8E]', bg: 'bg-[#E8F5F4]' },
    { label: 'المرضى المسجلون', value: totalPatients, change: 8, icon: UserCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'الأطباء النشطون', value: totalDoctors, change: 5, icon: Stethoscope, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'إجمالي المواعيد', value: totalAppts, change: 15, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'مواعيد اليوم', value: todayAppts, change: 3, icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'نسبة الإنجاز', value: totalAppts > 0 ? `${Math.round((completedAppts / totalAppts) * 100)}%` : '0%', change: 2, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'المواعيد الملغية', value: cancelledAppts, change: -4, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'الإيرادات التقديرية', value: `${(completedAppts * 3500).toLocaleString('ar')} ر.ي`, change: 18, icon: Award, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const logAction = async (action: string, entity_type: string, entity_id: string, details?: any) => {
    try { await supabase.from('admin_activity_log').insert({ admin_id: user?.id || 'admin', admin_name: user?.full_name || 'المدير', action, entity_type, entity_id, details: details || null }); } catch {}
  };

  const toggleUserStatus = async (u: UserRecord) => {
    const newStatus = !u.is_active;
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: newStatus } : x));
    try { await supabase.from('users').update({ is_active: newStatus }).eq('id', u.id); } catch {}
    await logAction(newStatus ? 'activate_user' : 'deactivate_user', 'user', u.id, { name: u.full_name });
  };

  const deleteUser = async (u: UserRecord) => {
    setUsers(prev => prev.filter(x => x.id !== u.id));
    try { await supabase.from('users').update({ is_active: false }).eq('id', u.id); } catch {}
    await logAction('delete_user', 'user', u.id, { name: u.full_name });
    setConfirmAction(null);
  };

  const cancelAppointment = async (a: AppointmentRecord) => {
    setAppointments(prev => prev.map(x => x.id === a.id ? { ...x, status: 'cancelled' } : x));
    try { await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', a.id); } catch {}
    await logAction('cancel_appointment', 'appointment', a.id);
    setConfirmAction(null);
  };

  const sendAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.body.trim()) return;
    const payload = { ...announcementForm, created_by: user?.full_name || 'المدير', is_active: true };
    try {
      const { data } = await supabase.from('system_announcements').insert(payload).select().single();
      if (data) setAnnouncements(p => [data, ...p]);
      else setAnnouncements(p => [{ id: `ann-${Date.now()}`, ...payload, created_at: new Date().toISOString() }, ...p]);
    } catch {
      setAnnouncements(p => [{ id: `ann-${Date.now()}`, ...payload, created_at: new Date().toISOString() }, ...p]);
    }
    await logAction('send_announcement', 'announcement', Date.now().toString(), { title: announcementForm.title });
    setAnnSaved(true); setShowAnnouncementForm(false);
    setAnnouncementForm({ title: '', body: '', priority: 'normal', target_roles: ['patient','doctor','secretary','nurse','hospital'], expires_at: '' });
    setTimeout(() => setAnnSaved(false), 3000);
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements(p => p.filter(a => a.id !== id));
    try { await supabase.from('system_announcements').delete().eq('id', id); } catch {}
  };

  const saveConfig = async () => {
    for (const item of config) {
      try { await supabase.from('app_config').upsert({ key: item.key, value: item.value, description: item.description, updated_by: user?.full_name || 'admin', updated_at: new Date().toISOString() }, { onConflict: 'key' }); } catch {}
    }
    await logAction('update_config', 'config', 'all', { keys: config.map(c => c.key) });
    setConfigSaved(true); setTimeout(() => setConfigSaved(false), 3000);
  };

  const updateConfigValue = (key: string, value: string) => setConfig(p => p.map(c => c.key === key ? { ...c, value } : c));

  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch || u.full_name.includes(userSearch) || u.phone.includes(userSearch) || (u.patient_code || '').includes(userSearch);
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredAppts = appointments.filter(a => {
    const matchSearch = !apptSearch || (a.patient_name || '').includes(apptSearch) || (a.doctor_name || '').includes(apptSearch);
    const matchStatus = apptStatusFilter === 'all' || a.status === apptStatusFilter;
    return matchSearch && matchStatus;
  });

  const tabs: { id: AdminTab; icon: React.ElementType; label: string }[] = [
    { id: 'overview',      icon: LayoutDashboard, label: 'نظرة عامة' },
    { id: 'users',         icon: Users,           label: 'المستخدمون' },
    { id: 'appointments',  icon: Calendar,        label: 'المواعيد' },
    { id: 'services',      icon: Activity,        label: 'الخدمات' },
    { id: 'facilities',    icon: Building2,       label: 'المنشآت' },
    { id: 'reports',       icon: BarChart2,       label: 'التقارير' },
    { id: 'announcements', icon: Bell,            label: 'الإشعارات' },
    { id: 'settings',      icon: Settings,        label: 'الإعدادات' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-gradient-to-l from-[#0D1B2A] to-[#1B2B3A] px-4 pt-10 pb-4 sticky top-0 z-50 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { logout(); window.dispatchEvent(new CustomEvent('nav-to-main')); }}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 border border-white/20"
              title="العودة لشاشة الواجهات الخمس شاشة البداية"
            >
              <ArrowRight size={16} />
              <span>الواجهات الخمس</span>
            </button>
            <button onClick={refresh} className={`w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center ${isLoading ? 'animate-spin' : ''}`} title="تحديث">
              <RefreshCw size={16} className="text-white/80" />
            </button>
            <button onClick={logout} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center" title="خروج">
              <LogOut size={16} className="text-white/80" />
            </button>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <div>
                <p className="text-white font-black text-base">لوحة الإدارة</p>
                <p className="text-white/60 text-xs">{user?.full_name || 'مدير النظام'}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${tab === id ? 'bg-white text-[#0D1B2A]' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-4 pb-20 space-y-4 max-w-2xl mx-auto">
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {kpiCards.map(card => <KpiCard key={card.label} {...card} />)}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-black text-gray-800 text-sm mb-4 text-right">توزيع الخدمات</h3>
              {[
                { label: 'المواعيد المكتملة', val: completedAppts, total: totalAppts, color: 'bg-green-500' },
                { label: 'المواعيد الملغية', val: cancelledAppts, total: totalAppts, color: 'bg-red-400' },
                { label: 'المستخدمون النشطون', val: activeUsers, total: totalUsers, color: 'bg-[#E8F5F4]0' },
                { label: 'نسبة الإنجاز الكلية', val: completedAppts, total: totalAppts, color: 'bg-emerald-500' },
              ].map(({ label, val, total, color }) => (
                <div key={label} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-bold text-gray-700">{total > 0 ? `${Math.round((val/total)*100)}%` : '0%'}</span>
                    <span>{label}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${color} rounded-full h-2 transition-all`} style={{ width: total > 0 ? `${(val/total)*100}%` : '0%' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-black text-gray-800 text-sm mb-3 text-right">المستخدمون حسب الدور</h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(roleLabel).filter(([k]) => k !== 'admin').map(([role, { label, cls }]) => {
                  const count = users.filter(u => u.role === role).length;
                  return (
                    <div key={role} className={`${cls.split(' ')[0]} rounded-xl p-3 text-center`}>
                      <p className={`text-xl font-black ${cls.split(' ')[1]}`}>{count}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-black text-gray-800 text-sm mb-3 text-right">آخر نشاطات المواعيد</h3>
              {appointments.slice(0, 5).map(a => {
                const st = apptStatusConfig[a.status] || apptStatusConfig.pending;
                return (
                  <div key={a.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400">{timeAgo(a.created_at)}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st.cls}`}>{st.label}</span>
                      <p className="text-sm font-medium text-gray-700">{a.patient_name || '—'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {activityLog.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-black text-gray-800 text-sm mb-3 text-right">سجل نشاط الإدارة</h3>
                {activityLog.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400">{timeAgo(log.created_at)}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.admin_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'users' && (
          <>
            <SectionHeader title="إدارة المستخدمين" subtitle={`${filteredUsers.length} مستخدم`} />
            <div className="space-y-2">
              <div className="relative">
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف أو الرقم التعريفي..." dir="rtl"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#0D1B2A]" />
                <Search size={16} className="absolute right-3 top-3.5 text-gray-400" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {['all', 'patient', 'doctor', 'secretary', 'nurse', 'hospital'].map(r => (
                  <button key={r} onClick={() => setUserRoleFilter(r)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${userRoleFilter === r ? 'bg-[#0D1B2A] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                    {r === 'all' ? 'الكل' : (roleLabel[r]?.label || r)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'إجمالي', val: users.length, cls: 'bg-[#E8F5F4] text-[#104C48]' },
                { label: 'نشط', val: activeUsers, cls: 'bg-green-50 text-green-700' },
                { label: 'موقوف', val: users.filter(u => u.is_active === false).length, cls: 'bg-red-50 text-red-600' },
              ].map(({ label, val, cls }) => (
                <div key={label} className={`${cls.split(' ')[0]} rounded-xl p-3 text-center`}>
                  <p className={`text-xl font-black ${cls.split(' ')[1]}`}>{val}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {filteredUsers.map(u => {
                const rl = roleLabel[u.role] || { label: u.role, cls: 'bg-gray-100 text-gray-600' };
                return (
                  <div key={u.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${u.is_active === false ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmAction({ label: `حذف "${u.full_name}"؟`, onConfirm: () => deleteUser(u) })}
                          className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                        <button onClick={() => toggleUserStatus(u)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${u.is_active !== false ? 'bg-green-50' : 'bg-gray-100'}`}>
                          {u.is_active !== false ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} className="text-gray-500" />}
                        </button>
                      </div>
                      <div className="text-right flex-1 mr-3">
                        <div className="flex items-center gap-2 justify-end mb-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${rl.cls}`}>{rl.label}</span>
                          <p className="font-bold text-gray-800 text-sm">{u.full_name}</p>
                        </div>
                        <div className="flex items-center gap-3 justify-end">
                          {u.patient_code && <span className="text-xs font-mono text-gray-400">{u.patient_code}</span>}
                          <span className="text-xs text-gray-500">{u.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                      <span className={`text-xs font-bold ${u.is_active !== false ? 'text-green-600' : 'text-red-500'}`}>
                        {u.is_active !== false ? '● نشط' : '● موقوف'}
                      </span>
                      <span className="text-xs text-gray-400">{fmtDate(u.created_at)}</span>
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                  <UserX size={40} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-400">لا يوجد مستخدمون مطابقون</p>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'appointments' && (
          <>
            <SectionHeader title="إدارة المواعيد" subtitle={`${filteredAppts.length} موعد`} />
            <div className="space-y-2">
              <div className="relative">
                <input value={apptSearch} onChange={e => setApptSearch(e.target.value)} placeholder="بحث بالمريض أو الطبيب..." dir="rtl"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#0D1B2A]" />
                <Search size={16} className="absolute right-3 top-3.5 text-gray-400" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => {
                  const conf = apptStatusConfig[s];
                  return (
                    <button key={s} onClick={() => setApptStatusFilter(s)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${apptStatusFilter === s ? 'bg-[#0D1B2A] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      {s === 'all' ? 'الكل' : conf?.label || s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'اليوم', val: todayAppts, cls: 'bg-[#E8F5F4] text-[#104C48]' },
                { label: 'مكتمل', val: completedAppts, cls: 'bg-green-50 text-green-700' },
                { label: 'ملغي', val: cancelledAppts, cls: 'bg-red-50 text-red-600' },
                { label: 'الكل', val: totalAppts, cls: 'bg-gray-100 text-gray-700' },
              ].map(({ label, val, cls }) => (
                <div key={label} className={`${cls.split(' ')[0]} rounded-xl p-2.5 text-center`}>
                  <p className={`text-lg font-black ${cls.split(' ')[1]}`}>{val}</p>
                  <p className="text-[10px] text-gray-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {filteredAppts.map(a => {
                const st = apptStatusConfig[a.status] || apptStatusConfig.pending;
                return (
                  <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex gap-2">
                        {['pending','confirmed','in_progress'].includes(a.status) && (
                          <button onClick={() => setConfirmAction({ label: `إلغاء موعد "${a.patient_name}"؟`, onConfirm: () => cancelAppointment(a) })}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold">إلغاء</button>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st.cls}`}>{st.label}</span>
                          <p className="font-bold text-gray-800 text-sm">{a.patient_name || '—'}</p>
                        </div>
                        <p className="text-xs text-gray-500">{a.doctor_name || '—'} — {a.clinic_name || '—'}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {a.payment_status === 'paid'
                          ? <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle size={11} />مدفوع</span>
                          : <span className="text-xs text-amber-600 font-bold flex items-center gap-1"><Clock size={11} />معلق</span>}
                        {a.queue_number && <span className="text-xs text-gray-400">طابور #{a.queue_number}</span>}
                      </div>
                      <span className="text-xs text-gray-400">{a.appointment_date}</span>
                    </div>
                  </div>
                );
              })}
              {filteredAppts.length === 0 && (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                  <Calendar size={40} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-400">لا توجد مواعيد مطابقة</p>
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'services' && (
          <>
            <SectionHeader title="إحصائيات الخدمات" subtitle="نظرة عامة على جميع خدمات التطبيق" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'طلبات التمريض', value: 67, icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50', change: 22 },
                { label: 'طلبات الصيدلية', value: 134, icon: Pill, color: 'text-[#199A8E]', bg: 'bg-[#E8F5F4]', change: 11 },
                { label: 'فحوصات مختبر', value: 289, icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50', change: 8 },
                { label: 'طلبات تبرع دم', value: 23, icon: Heart, color: 'text-red-500', bg: 'bg-red-50', change: -5 },
                { label: 'جلسات نفسية', value: 41, icon: Radio, color: 'text-pink-600', bg: 'bg-pink-50', change: 34 },
                { label: 'وصفات إلكترونية', value: 198, icon: FileText, color: 'text-green-600', bg: 'bg-green-50', change: 17 },
              ].map(card => <KpiCard key={card.label} {...card} />)}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-black text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                <Heart size={16} className="text-red-500" />خدمة التبرع بالدم
              </h3>
              {[
                { label: 'طلبات نشطة', val: 12, cls: 'text-red-600' },
                { label: 'تم التوفير', val: 45, cls: 'text-green-600' },
                { label: 'متبرعون مسجلون', val: 234, cls: 'text-[#199A8E]' },
                { label: 'بنوك الدم', val: 8, cls: 'text-gray-700' },
              ].map(({ label, val, cls }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className={`font-black text-lg ${cls}`}>{val}</span>
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-black text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                <Zap size={16} className="text-amber-500" />المساعد الذكي
              </h3>
              {[
                { label: 'محادثات هذا الشهر', val: 1247 },
                { label: 'أُحيل للحجز', val: 389 },
                { label: 'أكثر الأعراض شيوعاً', val: 'صداع / حمى' },
                { label: 'نسبة الإحالة', val: '31%' },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="font-black text-sm text-gray-800">{val}</span>
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-black text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                <Award size={16} className="text-amber-500" />نظام النقاط والمكافآت
              </h3>
              {[
                { label: 'إجمالي النقاط الممنوحة', val: '1,250,400' },
                { label: 'النقاط المستبدلة', val: '340,200' },
                { label: 'المستخدمون بمستوى ذهبي', val: 67 },
                { label: 'مكافآت مستردة هذا الشهر', val: 134 },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="font-black text-sm text-gray-800">{val}</span>
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'facilities' && (
          <>
            <SectionHeader title="المنشآت الطبية" subtitle="مستشفيات وصيدليات ومختبرات" />
            {[
              { type: 'مستشفيات', icon: Building2, color: 'text-[#199A8E]', stats: [{ label: 'إجمالي المستشفيات', val: 14 }, { label: 'نشطة', val: 12 }, { label: 'تحويلات واردة هذا الشهر', val: 189 }, { label: 'متوسط وقت الاستجابة', val: '4 ساعات' }] },
              { type: 'صيدليات', icon: Pill, color: 'text-teal-600', stats: [{ label: 'إجمالي الصيدليات', val: 31 }, { label: 'نشطة', val: 28 }, { label: 'وصفات صُرفت هذا الشهر', val: 456 }, { label: 'طلبات توصيل', val: 134 }] },
              { type: 'مختبرات ومراكز أشعة', icon: FlaskConical, color: 'text-purple-600', stats: [{ label: 'إجمالي المراكز', val: 19 }, { label: 'نشطة', val: 17 }, { label: 'فحوصات منجزة هذا الشهر', val: 2341 }, { label: 'متوسط وقت الإنجاز', val: '3.2 ساعة' }] },
            ].map(({ type, icon: Icon, color, stats }) => (
              <div key={type} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-black text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                  <Icon size={16} className={color} />{type}
                </h3>
                {stats.map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="font-black text-sm text-gray-800">{val}</span>
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-black text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                <ArrowUpRight size={16} className="text-green-600" />نظام التحويلات الطبية
              </h3>
              {[
                { label: 'تحويلات هذا الشهر', val: 312 },
                { label: 'تحويلات معلقة', val: 47 },
                { label: 'تحويلات مقبولة', val: 198 },
                { label: 'تحويلات حرجة (طارئة)', val: 23 },
                { label: 'تحويلات ممرض → طبيب', val: 89 },
                { label: 'تحويلات مستشفى → مستشفى', val: 34 },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="font-black text-sm text-gray-800">{val}</span>
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'reports' && (
          <>
            <SectionHeader title="التقارير الشاملة" subtitle="بيانات تحليلية لجميع الخدمات" />
            <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1B3A5C] rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <button className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                  <Download size={13} />تصدير PDF
                </button>
                <div className="text-right">
                  <p className="text-white/70 text-xs">تقرير شهر</p>
                  <p className="font-black text-lg">{new Date().toLocaleDateString('ar-YE', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'إجمالي المواعيد', val: totalAppts },
                  { label: 'المواعيد المكتملة', val: completedAppts },
                  { label: 'المستخدمون الجدد', val: 47 },
                  { label: 'الإيرادات التقديرية', val: `${(completedAppts*3500).toLocaleString('ar')} ر.ي` },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="font-black text-xl text-white">{val}</p>
                    <p className="text-white/60 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-black text-gray-800 text-sm mb-3 text-right">مؤشرات الأداء الرئيسية</h3>
              {[
                { label: 'متوسط تقييم الأطباء', val: '4.7/5', icon: Star, color: 'text-amber-500' },
                { label: 'متوسط وقت الانتظار', val: '18 دقيقة', icon: Clock, color: 'text-[#199A8E]' },
                { label: 'نسبة رضا المرضى', val: '89%', icon: TrendingUp, color: 'text-green-500' },
                { label: 'نسبة إكمال الملف الصحي', val: '63%', icon: UserCheck, color: 'text-teal-500' },
                { label: 'معدل الحجوزات/طبيب/يوم', val: '14.3', icon: Calendar, color: 'text-purple-500' },
                { label: 'نسبة الحضور', val: '91%', icon: CheckCircle, color: 'text-emerald-500' },
              ].map(({ label, val, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={color} />
                    <span className="font-black text-sm text-gray-800">{val}</span>
                  </div>
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-black text-gray-800 text-sm mb-4 text-right">استخدام الخدمات هذا الشهر</h3>
              {[
                { label: 'العيادات والحجز', pct: 78 },
                { label: 'المساعد الذكي', pct: 65 },
                { label: 'الوصفات الإلكترونية', pct: 54 },
                { label: 'التمريض المنزلي', pct: 38 },
                { label: 'الصيدلية', pct: 45 },
                { label: 'الصحة النفسية', pct: 22 },
                { label: 'طبيب بلس', pct: 18 },
              ].map(({ label, pct }) => (
                <div key={label} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-gray-700">{pct}%</span>
                    <span className="text-gray-500">{label}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-gradient-to-l from-[#0D1B2A] to-[#199A8E] rounded-full h-2" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-black text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                <MapPin size={16} className="text-red-500" />التوزيع الجغرافي للمستخدمين
              </h3>
              {[
                { city: 'صنعاء', count: 1247, pct: 52 },
                { city: 'عدن', count: 389, pct: 16 },
                { city: 'تعز', count: 312, pct: 13 },
                { city: 'الحديدة', count: 198, pct: 8 },
                { city: 'إب', count: 134, pct: 6 },
                { city: 'أخرى', count: 120, pct: 5 },
              ].map(({ city, count, pct }) => (
                <div key={city} className="mb-2 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{count.toLocaleString('ar')} مستخدم</span>
                    <span className="font-bold text-gray-700">{city}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-[#E8F5F4]0 rounded-full h-1.5" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'announcements' && (
          <>
            <SectionHeader title="الإشعارات والإعلانات" subtitle={`${announcements.length} إعلان`}
              action={<button onClick={() => setShowAnnouncementForm(true)} className="flex items-center gap-1.5 bg-[#0D1B2A] text-white px-4 py-2 rounded-xl text-sm font-bold"><Plus size={15} />جديد</button>} />
            {annSaved && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <p className="text-green-700 font-bold text-sm">تم إرسال الإعلان بنجاح</p>
              </div>
            )}
            {announcements.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Bell size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">لا توجد إعلانات بعد</p>
                <button onClick={() => setShowAnnouncementForm(true)} className="mt-3 text-[#199A8E] font-bold text-sm">إرسال أول إعلان</button>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map(ann => {
                  const prioMap: Record<string, string> = { low: 'bg-gray-100 text-gray-600', normal: 'bg-[#E8F5F4] text-[#104C48]', high: 'bg-amber-100 text-amber-700', critical: 'bg-red-100 text-red-700' };
                  const prioLabel: Record<string, string> = { low: 'منخفض', normal: 'عادي', high: 'مهم', critical: 'حرج' };
                  return (
                    <div key={ann.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
                        <button onClick={() => deleteAnnouncement(ann.id)} className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                          <Trash2 size={13} className="text-red-500" />
                        </button>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${prioMap[ann.priority] || prioMap.normal}`}>{prioLabel[ann.priority] || 'عادي'}</span>
                          <p className="font-bold text-gray-800 text-sm">{ann.title}</p>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-600 text-right mb-2 leading-relaxed">{ann.body}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{timeAgo(ann.created_at)}</span>
                          <div className="flex gap-1 flex-wrap justify-end">
                            {(ann.target_roles || []).map((r: string) => (
                              <span key={r} className={`text-[10px] px-1.5 py-0.5 rounded-full ${roleLabel[r]?.cls || 'bg-gray-100 text-gray-500'}`}>{roleLabel[r]?.label || r}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === 'settings' && (
          <>
            <SectionHeader title="إعدادات النظام" subtitle="التحكم في خدمات وميزات التطبيق" />
            {configSaved && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <p className="text-green-700 font-bold text-sm">تم حفظ الإعدادات بنجاح</p>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                <p className="font-black text-gray-800 text-sm text-right">تفعيل / تعطيل الخدمات</p>
              </div>
              {config.filter(c => c.value === 'true' || c.value === 'false').map((item, idx, arr) => (
                <div key={item.key} className={`flex items-center justify-between px-4 py-4 ${idx !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <button onClick={() => updateConfigValue(item.key, item.value === 'true' ? 'false' : 'true')} className="flex-shrink-0">
                    {item.value === 'true' ? <ToggleRight size={28} className="text-green-500" /> : <ToggleLeft size={28} className="text-gray-300" />}
                  </button>
                  <div className="text-right ml-3">
                    <p className="font-medium text-gray-800 text-sm">{item.description}</p>
                    <p className="text-xs font-mono text-gray-400">{item.key}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                <p className="font-black text-gray-800 text-sm text-right">الإعدادات الرقمية</p>
              </div>
              {config.filter(c => c.value !== 'true' && c.value !== 'false').map((item, idx, arr) => (
                <div key={item.key} className={`px-4 py-3 ${idx !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <input type="number" value={item.value} onChange={e => updateConfigValue(item.key, e.target.value)}
                      className="w-20 p-2 border border-gray-200 rounded-xl text-center font-mono font-bold text-sm outline-none focus:border-[#0D1B2A]" />
                    <div className="text-right">
                      <p className="font-medium text-gray-800 text-sm">{item.description}</p>
                      <p className="text-xs font-mono text-gray-400">{item.key}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={saveConfig} className="w-full py-4 bg-[#0D1B2A] text-white rounded-2xl font-bold flex items-center justify-center gap-2">
              <Save size={18} />حفظ جميع الإعدادات
            </button>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-black text-gray-800 text-sm mb-3 text-right flex items-center gap-2 justify-end">
                <Database size={16} className="text-[#199A8E]" />معلومات النظام
              </h3>
              {[
                { label: 'إصدار التطبيق', val: '1.0.0' },
                { label: 'قاعدة البيانات', val: 'Supabase PostgreSQL' },
                { label: 'الجداول المفعّلة', val: '34 جدول' },
                { label: 'سياسات RLS', val: '136 سياسة' },
                { label: 'نسخة API', val: 'v2.1' },
                { label: 'آخر تحديث', val: fmtDate(new Date().toISOString()) },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-mono font-bold text-gray-700">{val}</span>
                  <span className="text-sm text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showAnnouncementForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-5 pb-8 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setShowAnnouncementForm(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><X size={16} /></button>
              <p className="font-black text-gray-800">إرسال إعلان جديد</p>
              <div className="w-8" />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">عنوان الإعلان *</label>
                <input type="text" value={announcementForm.title} onChange={e => setAnnouncementForm(p => ({ ...p, title: e.target.value }))} placeholder="عنوان الإعلان..." dir="rtl"
                  className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0D1B2A]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">نص الإعلان *</label>
                <textarea value={announcementForm.body} onChange={e => setAnnouncementForm(p => ({ ...p, body: e.target.value }))} rows={4} placeholder="اكتب نص الإعلان هنا..." dir="rtl"
                  className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0D1B2A] resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">درجة الأهمية</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { v: 'low', l: 'منخفض', cls: 'bg-gray-100 text-gray-700' },
                    { v: 'normal', l: 'عادي', cls: 'bg-[#E8F5F4] text-[#104C48]' },
                    { v: 'high', l: 'مهم', cls: 'bg-amber-100 text-amber-700' },
                    { v: 'critical', l: 'حرج', cls: 'bg-red-100 text-red-700' },
                  ].map(({ v, l, cls }) => (
                    <button key={v} onClick={() => setAnnouncementForm(p => ({ ...p, priority: v as any }))}
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${announcementForm.priority === v ? `${cls} border-current` : 'bg-gray-50 text-gray-500 border-transparent'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">المستهدفون</label>
                <div className="flex flex-wrap gap-2">
                  {(['patient','doctor','secretary','nurse','hospital'] as const).map(r => {
                    const rl = roleLabel[r];
                    const sel = announcementForm.target_roles.includes(r);
                    return (
                      <button key={r} onClick={() => setAnnouncementForm(p => ({ ...p, target_roles: sel ? p.target_roles.filter(x => x !== r) : [...p.target_roles, r] }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${sel ? `${rl.cls} border-current` : 'bg-gray-50 text-gray-400 border-transparent'}`}>{rl.label}</button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">تاريخ الانتهاء (اختياري)</label>
                <input type="date" value={announcementForm.expires_at} onChange={e => setAnnouncementForm(p => ({ ...p, expires_at: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#0D1B2A]" />
              </div>
              <button onClick={sendAnnouncement} disabled={!announcementForm.title.trim() || !announcementForm.body.trim() || announcementForm.target_roles.length === 0}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${announcementForm.title.trim() && announcementForm.body.trim() ? 'bg-[#0D1B2A] text-white' : 'bg-gray-200 text-gray-400'}`}>
                <Send size={18} />إرسال الإعلان
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <p className="font-black text-gray-800 text-base">{confirmAction.label}</p>
              <p className="text-gray-500 text-sm mt-2">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm">إلغاء</button>
              <button onClick={confirmAction.onConfirm} className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold text-sm">تأكيد</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
