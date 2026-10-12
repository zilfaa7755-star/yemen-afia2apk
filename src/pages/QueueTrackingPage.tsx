import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bell, Clock3, MapPin, Navigation, Phone, RefreshCw, UserRound, Users } from 'lucide-react';
import type { Doctor } from '../types';

interface QueueTrackingPageProps {
  doctor: Doctor;
  queueNumber: number;
  estimatedWaitMinutes: number;
  onBack?: () => void;
}

export function QueueTrackingPage({ doctor, queueNumber, estimatedWaitMinutes, onBack }: QueueTrackingPageProps) {
  const [waitingAhead, setWaitingAhead] = useState(Math.max(queueNumber - 1, 0));
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWaitingAhead((current) => (current > 0 ? current - 1 : 0));
      setLastUpdated(new Date());
    }, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const currentNumber = Math.max(queueNumber - waitingAhead, 1);
  const minutesRemaining = waitingAhead * ((doctor?.average_consultation_time) ?? estimatedWaitMinutes ?? 15);
  const progress = Math.min(100, Math.max(8, (currentNumber / Math.max(queueNumber, 1)) * 100));
  const statusText = waitingAhead === 0 ? 'دورك الآن — يرجى التوجه إلى العيادة' : waitingAhead <= 3 ? 'اقترب دورك، استعد للتوجه' : 'الطابور يتقدم بشكل طبيعي';
  const arrivalTime = useMemo(() => new Date(Date.now() + minutesRemaining * 60000).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }), [minutesRemaining]);

  return (
    <div className="min-h-screen bg-[#f5faf9] pb-24" dir="rtl">
      <header className="bg-white px-5 pt-10 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"><ArrowRight size={19} /></button>
          <div className="text-center"><p className="text-xs text-gray-400">متابعة الحجز</p><h1 className="font-black text-gray-900 text-lg">حالة الطابور</h1></div>
          <div className="w-10 h-10 rounded-full bg-[#e8f7f2] flex items-center justify-center"><Bell size={18} className="text-[#18A98C]" /></div>
        </div>
      </header>

      <main className="px-4 pt-5 space-y-4">
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#199A8E] flex items-center justify-center text-white font-black text-lg">{doctor?.full_name ? doctor.full_name.charAt(0) : 'ط'}</div>
            <div className="flex-1"><h2 className="font-bold text-gray-900">{doctor?.full_name || 'طبيب استشاري'}</h2><p className="text-xs text-gray-500 mt-1">{doctor?.clinic?.name || 'العيادة التخصصية'} • {doctor?.specialization?.name_ar || 'استشاري'}</p></div>
            <div className="flex items-center gap-1 text-xs text-gray-500"><UserRound size={14} className="text-[#199A8E]" /> أنت</div>
          </div>
          <div className="text-center py-3">
            <p className="text-xs text-gray-500">رقمك في الطابور</p>
            <p className="text-7xl leading-none font-black text-[#18A98C] mt-2">{queueNumber}</p>
            <p className="text-sm text-gray-500 mt-3">الرقم الحالي: <span className="font-bold text-gray-800">{currentNumber}</span></p>
          </div>
          <div className="mt-5">
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-l from-[#104C48] to-[#199A8E] transition-all duration-700" style={{ width: `${progress}%` }} /></div>
            <div className="flex justify-between text-[11px] text-gray-400 mt-2"><span>رقمك: {queueNumber}</span><span>البداية: 1</span></div>
          </div>
        </section>

        <section className={`${waitingAhead <= 3 ? 'bg-[#dff6ee] border-[#a9e4d1]' : 'bg-[#e6f3ff] border-[#bfddf6]'} rounded-2xl border p-4 flex items-start gap-3`}>
          <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0"><Bell size={19} className={waitingAhead <= 3 ? 'text-[#18A98C]' : 'text-[#199A8E]'} /></div>
          <div><p className="font-bold text-gray-800 text-sm">{statusText}</p><p className="text-xs text-gray-600 mt-1">{waitingAhead === 0 ? 'يمكنك الدخول الآن' : `باقي ${waitingAhead} ${waitingAhead === 1 ? 'مريض' : 'مرضى'} قبلك. سنرسل لك تنبيهاً عند اقتراب دورك.`}</p></div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center"><Clock3 size={19} className="mx-auto text-[#199A8E] mb-2" /><p className="text-xs text-gray-500">الوقت المتوقع</p><p className="font-black text-gray-900 mt-1">{waitingAhead === 0 ? 'الآن' : `${minutesRemaining} دقيقة`}</p><p className="text-[11px] text-gray-400 mt-1">{arrivalTime}</p></div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center"><Users size={19} className="mx-auto text-[#18A98C] mb-2" /><p className="text-xs text-gray-500">المتبقون أمامك</p><p className="font-black text-gray-900 text-xl mt-1">{waitingAhead}</p><p className="text-[11px] text-gray-400 mt-1">من أصل {queueNumber - 1}</p></div>
        </section>

        <section className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3"><button onClick={() => { setWaitingAhead(Math.max(queueNumber - 1, 0)); setLastUpdated(new Date()); }} className="text-xs text-[#199A8E] flex items-center gap-1"><RefreshCw size={13} /> تحديث</button><h3 className="font-bold text-gray-800 text-sm">موقع العيادة</h3></div>
          <div className="relative h-44 rounded-2xl overflow-hidden bg-[#dcebe3]" style={{ backgroundImage: 'linear-gradient(30deg, transparent 47%, rgba(255,255,255,.85) 48%, rgba(255,255,255,.85) 51%, transparent 52%), linear-gradient(120deg, transparent 42%, rgba(255,255,255,.9) 43%, rgba(255,255,255,.9) 46%, transparent 47%), linear-gradient(0deg, transparent 68%, rgba(186,211,199,.65) 69%, rgba(186,211,199,.65) 72%, transparent 73%)' }}>
            <div className="absolute top-6 right-10 w-9 h-9 rounded-full bg-[#199A8E] border-4 border-white shadow-lg flex items-center justify-center"><MapPin size={17} className="text-white" /></div>
            <div className="absolute bottom-7 left-12 w-8 h-8 rounded-full bg-[#18A98C] border-4 border-white shadow-lg flex items-center justify-center"><UserRound size={14} className="text-white" /></div>
            <div className="absolute bottom-3 right-3 bg-white/90 rounded-lg px-2 py-1 text-[10px] text-gray-600">خريطة موقع العيادة</div>
          </div>
          <div className="flex items-start gap-2 mt-3"><MapPin size={16} className="text-[#199A8E] mt-0.5" /><div><p className="font-bold text-gray-800 text-sm">{doctor.clinic?.name}</p><p className="text-xs text-gray-500 mt-1">{doctor.clinic?.address}</p></div></div>
          <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${doctor.clinic?.latitude || 15.3694},${doctor.clinic?.longitude || 44.1910}`, '_blank')} className="mt-3 w-full rounded-xl bg-gray-900 text-white py-3 font-bold text-sm flex items-center justify-center gap-2"><Navigation size={16} /> فتح الاتجاهات</button>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between"><div className="text-right"><p className="font-bold text-gray-800 text-sm">تحتاج مساعدة؟</p><p className="text-xs text-gray-500 mt-1">تواصل مع العيادة مباشرة</p></div><button className="w-10 h-10 rounded-xl bg-[#E8F5F4] flex items-center justify-center"><Phone size={17} className="text-[#199A8E]" /></button></section>
        <p className="text-center text-[11px] text-gray-400">آخر تحديث {lastUpdated.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
      </main>
    </div>
  );
}
