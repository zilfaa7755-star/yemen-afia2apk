import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Navigation,
  XCircle,
  AlertCircle,
  Users,
  ChevronLeft,
  Star,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Appointment } from '../types';

interface AppointmentsPageProps {
  onBack?: () => void;
  onSelectAppointment?: (appointment: Appointment) => void;
}

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  pending: { label: 'قيد الانتظار', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  confirmed: { label: 'مؤكد', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  in_progress: { label: 'جاري المعاينة', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  completed: { label: 'مكتمل', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  cancelled: { label: 'ملغي', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  no_show: { label: 'لم يحضر', bgColor: 'bg-gray-100', textColor: 'text-gray-500' },
};

export function AppointmentsPage({ onBack, onSelectAppointment }: AppointmentsPageProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, doctor:doctors(*), clinic:clinics(*)')
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setAppointments(data as Appointment[]);
      } else {
        setAppointments(getDemoAppointments());
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments(getDemoAppointments());
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoAppointments = (): Appointment[] => [
    {
      id: '1',
      patient_id: 'demo',
      doctor_id: '1',
      doctor: {
        id: '1',
        full_name: 'د. محمد أمين الديلمي',
        specialization_id: '1',
        specialization: { id: '1', name_ar: 'طب القلب والأوعية الدموية', name_en: 'Cardiology' },
        clinic_id: '1',
        consultation_fee: 5000,
        average_consultation_time: 20,
        rating: 4.9,
        total_reviews: 120,
        working_days: [],
        working_hours: {},
        is_active: true,
        is_available: true,
      },
      clinic_id: '1',
      clinic: { id: '1', name: 'مجمع اليمن الطبي', address: 'صنعاء - شارع الزبيري', latitude: 15.3694, longitude: 44.1910, working_hours: {}, is_active: true },
      appointment_date: new Date().toISOString().split('T')[0],
      queue_number: 5,
      estimated_time: '10:30',
      status: 'confirmed',
      payment_status: 'paid',
      payment_amount: 5000,
      symptoms: 'ألم في الصدر وضيق تنفس خفيف',
      is_emergency: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      patient_id: 'demo',
      doctor_id: '2',
      doctor: {
        id: '2',
        full_name: 'د. فاطمة الشامي',
        specialization_id: '2',
        specialization: { id: '2', name_ar: 'طب الجهاز الهضمي', name_en: 'Gastroenterology' },
        clinic_id: '2',
        consultation_fee: 4000,
        average_consultation_time: 15,
        rating: 4.7,
        total_reviews: 85,
        working_days: [],
        working_hours: {},
        is_active: true,
        is_available: true,
      },
      clinic_id: '2',
      clinic: { id: '2', name: 'مستشفى الثورة', address: 'صنعاء - شارع الخمسين', latitude: 15.3665, longitude: 44.1885, working_hours: {}, is_active: true },
      appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      queue_number: 12,
      estimated_time: '17:45',
      status: 'pending',
      payment_status: 'pending',
      symptoms: 'حرقة في المعدة وارتجاع مستمر',
      is_emergency: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      patient_id: 'demo',
      doctor_id: '3',
      doctor: {
        id: '3',
        full_name: 'د. أحمد الصالحي',
        specialization_id: '3',
        specialization: { id: '3', name_ar: 'طب الأعصاب', name_en: 'Neurology' },
        clinic_id: '1',
        consultation_fee: 4500,
        average_consultation_time: 25,
        rating: 4.8,
        total_reviews: 65,
        working_days: [],
        working_hours: {},
        is_active: true,
        is_available: true,
      },
      clinic_id: '1',
      clinic: { id: '1', name: 'مجمع اليمن الطبي', address: 'صنعاء - شارع الزبيري', latitude: 15.3694, longitude: 44.1910, working_hours: {}, is_active: true },
      appointment_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      queue_number: 3,
      estimated_time: '09:15',
      status: 'completed',
      payment_status: 'paid',
      symptoms: 'صداع متكرر وآلام في الرقبة',
      is_emergency: false,
      created_at: new Date().toISOString(),
    },
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments.filter(
    (a) => a.appointment_date >= todayStr && a.status !== 'cancelled' && a.status !== 'completed' && a.status !== 'no_show'
  );
  const pastAppointments = appointments.filter(
    (a) => a.appointment_date < todayStr || a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show'
  );

  const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#2196F3] to-[#1976D2] pt-12 pb-20 px-4">
        <div className="flex items-center justify-center gap-3">
          <Calendar size={24} className="text-white" />
          <h1 className="text-xl font-bold text-white">حجوزاتي</h1>
        </div>
      </div>

      {/* Tabs - Floating */}
      <div className="px-4 -mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-1.5 flex">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'upcoming'
                ? 'bg-[#2196F3] text-white shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            القادمة ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'past'
                ? 'bg-[#2196F3] text-white shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            السابقة ({pastAppointments.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2196F3]"></div>
          </div>
        ) : displayAppointments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">لا توجد حجوزات</p>
            <p className="text-gray-400 text-sm mt-2">
              {activeTab === 'upcoming' ? 'قم بحجز موعد جديد من الصفحة الرئيسية' : 'لم تقم بأي حجوزات سابقة'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Live Queue Display for confirmed/in_progress */}
                {(appointment.status === 'confirmed' || appointment.status === 'in_progress') && appointment.queue_number && (
                  <div className="bg-gradient-to-l from-[#E3F2FD] to-[#BBDEFB] px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#2196F3] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-black">{appointment.queue_number}</span>
                      </div>
                      <span className="text-[#1565C0] text-sm font-medium">رقمك في الطابور</span>
                    </div>
                    <div className="text-right">
                      {appointment.status === 'in_progress' ? (
                        <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">دورك الآن</span>
                      ) : (
                        <span className="text-[#1565C0] text-xs font-medium">الوقت المتوقع: {appointment.estimated_time}</span>
                      )}
                    </div>
                  </div>
                )}
                {/* Status Badge */}
                <div className={`${statusConfig[appointment.status].bgColor} px-4 py-2 flex items-center justify-between`}>
                  <span className={`font-medium text-sm ${statusConfig[appointment.status].textColor}`}>
                    {statusConfig[appointment.status].label}
                  </span>
                  {appointment.is_emergency && (
                    <span className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle size={14} />
                      طارئ
                    </span>
                  )}
                </div>

                {/* Doctor Info */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 bg-[#2196F3] rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {appointment.doctor?.full_name?.charAt(0) || 'ط'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{appointment.doctor?.full_name}</h3>
                      <p className="text-sm text-[#2196F3]">{appointment.doctor?.specialization?.name_ar}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-500">{appointment.doctor?.rating}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{appointment.clinic?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Queue & Time Info */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <Calendar size={16} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500">التاريخ</p>
                      <p className="font-medium text-gray-800 text-sm mt-1">
                        {new Date(appointment.appointment_date).toLocaleDateString('ar-YE', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <Clock size={16} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500">الساعة</p>
                      <p className="font-medium text-gray-800 text-sm mt-1">
                        {appointment.estimated_time || '--:--'}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <Users size={16} className="mx-auto text-[#2196F3] mb-1" />
                      <p className="text-xs text-[#2196F3]">الطابور</p>
                      <p className="font-bold text-[#2196F3] text-lg mt-1">
                        #{appointment.queue_number || '--'}
                      </p>
                    </div>
                  </div>

                  {/* Symptoms */}
                  {appointment.symptoms && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">الأعراض:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{appointment.symptoms}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {activeTab === 'upcoming' && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          const lat = appointment.clinic?.latitude || 15.3694;
                          const lng = appointment.clinic?.longitude || 44.1910;
                              const name = encodeURIComponent(appointment.clinic?.name || 'العيادة');
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${name}`, '_blank');
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-[#2196F3] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#1976D2] transition-colors"
                      >
                        <Navigation size={18} />
                        الاتجاهات
                      </button>
                      <button className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                        <RefreshCw size={18} />
                        تعديل
                      </button>
                      <button className="py-2.5 px-4 rounded-xl border border-red-200 text-red-600 font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
                        <XCircle size={18} />
                      </button>
                    </div>
                  )}

                  {/* Chat for Completed */}
                  {(appointment.status === 'completed' || appointment.status === 'in_progress') && (
                    <button
                      onClick={() => onSelectAppointment?.(appointment)}
                      className="mt-4 w-full py-3 rounded-xl bg-green-50 text-green-700 font-medium flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"
                    >
                      <MessageCircle size={18} />
                      محادثة المراجعة الطبية
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
