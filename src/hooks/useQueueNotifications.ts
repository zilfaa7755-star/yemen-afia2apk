import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../context/NotificationContext';

interface ActiveAppointment {
  appointmentId: string;
  doctorId: string;
  queueNumber: number;
  avgConsultationTime: number;
  clinicLat?: number;
  clinicLng?: number;
  patientLat?: number;
  patientLng?: number;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

export function useQueueNotifications(activeAppointment: ActiveAppointment | null) {
  const { addNotification } = useNotifications();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastQueuePositionRef = useRef<number | null>(null);

  const calculateArrivalInfo = useCallback(
    (waitingAhead: number, avgTime: number, clinicLat?: number, clinicLng?: number, patLat?: number, patLng?: number) => {
      const waitMinutes = waitingAhead * avgTime;
      let travelMinutes = 0;

      if (clinicLat && clinicLng && patLat && patLng) {
        const distKm = calculateDistance(patLat, patLng, clinicLat, clinicLng);
        travelMinutes = Math.max(0, Math.round(distKm * 4) - 5); // 4 min/km, leave 5 min early
      }

      const departureMs = Math.max(0, (waitMinutes - travelMinutes - 10)) * 60 * 1000;
      const arrivalMs = waitMinutes * 60 * 1000;
      const now = new Date();
      const arrivalTime = new Date(now.getTime() + arrivalMs);
      const departureTime = new Date(now.getTime() + departureMs);

      return {
        waitMinutes,
        travelMinutes,
        arrivalTimeStr: formatTime(arrivalTime),
        departureTimeStr: formatTime(departureTime),
        shouldLeaveNow: departureMs < 60000,
      };
    },
    []
  );

  useEffect(() => {
    if (!activeAppointment) return;

    const { appointmentId, doctorId, queueNumber, avgConsultationTime, clinicLat, clinicLng, patientLat, patientLng } =
      activeAppointment;

    // Subscribe to queue changes for this doctor
    const channel = supabase
      .channel(`queue-doctor-${doctorId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'queue' },
        async (payload) => {
          const updated = payload.new as { doctor_id?: string; status?: string; queue_position?: number };
          if (updated.status !== 'completed' && updated.status !== 'in_progress') return;

          // Fetch current queue state for this doctor
          const { data: queueItems } = await supabase
            .from('queue')
            .select('queue_position, appointment_id')
            .eq('status', 'waiting')
            .order('queue_position', { ascending: true });

          if (!queueItems) return;

          // Find our position in the remaining queue
          const ourItem = queueItems.find((q) => q.appointment_id === appointmentId);
          if (!ourItem) return;

          const waitingAhead = ourItem.queue_position - 1;
          const info = calculateArrivalInfo(waitingAhead, avgConsultationTime, clinicLat, clinicLng, patientLat, patientLng);

          if (lastQueuePositionRef.current !== waitingAhead) {
            lastQueuePositionRef.current = waitingAhead;

            if (waitingAhead === 0) {
              addNotification({
                type: 'queue_moved',
                title: 'دورك الآن!',
                message: 'أنت التالي في الطابور، يرجى التوجه للعيادة الآن',
                queuePosition: 1,
                waitMinutes: 0,
                autoClose: 15000,
              });
            } else if (waitingAhead <= 2) {
              addNotification({
                type: 'queue_moved',
                title: `باقي ${waitingAhead} شخص قبلك`,
                message: info.shouldLeaveNow
                  ? 'حان وقت التوجه للعيادة الآن'
                  : `ابدأ التوجه الساعة ${info.departureTimeStr}`,
                queuePosition: waitingAhead + 1,
                arrivalTime: info.arrivalTimeStr,
                waitMinutes: info.waitMinutes,
                autoClose: 12000,
              });
            } else {
              addNotification({
                type: 'queue_moved',
                title: 'تحديث الطابور',
                message: `تقدّم الطابور — باقي ${waitingAhead} شخص قبلك`,
                queuePosition: waitingAhead + 1,
                arrivalTime: info.arrivalTimeStr,
                waitMinutes: info.waitMinutes,
              });
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [activeAppointment, addNotification, calculateArrivalInfo]);
}

export { calculateDistance, formatTime };
