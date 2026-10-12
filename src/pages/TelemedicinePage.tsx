import React, { useState, useEffect } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  RefreshCw,
  FileText,
  Shield,
  Star,
  Clock,
  Send,
  X,
  ChevronRight,
  Maximize2,
  Stethoscope,
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TelemedicinePageProps {
  onBack?: () => void;
  onBookDoctor?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  time: string;
}

export function TelemedicinePage({ onBack, onBookDoctor }: TelemedicinePageProps) {
  const { user } = useAuth();
  const [isInCall, setIsInCall] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showPrescriptionNote, setShowPrescriptionNote] = useState(false);
  const [callDuration, setCallDuration] = useState(142); // in seconds
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'doctor',
      text: 'أهلاً بك يا أخ ' + (user?.full_name?.split(' ')[0] || 'المريض') + '، كيف تشعر بعد تناول الجرعة الصباحية؟',
      time: '10:02 ص',
    },
    {
      id: '2',
      sender: 'patient',
      text: 'الحمد لله دكتور، خف الصداع كثيراً لكن أشعر ببعض الدوار الخفيف عند الوقوف.',
      time: '10:03 ص',
    },
    {
      id: '3',
      sender: 'doctor',
      text: 'ممتاز، هذا متوقع في أول يومين. تأكد من قياس ضغط الدم بعد ساعة وشرب سوائل كافية.',
      time: '10:04 ص',
    },
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInCall) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isInCall]);

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'patient',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessageInput('');

    // Mock doctor reply after 1.5s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'doctor',
          text: 'تم تدوين الملاحظة في ملفك الطبي الإلكتروني.',
          time: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  // If call ended, show Post-Call Summary / Telemedicine Hub
  if (!isInCall) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] pb-28">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-3.5">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-[#E8F5F4] text-[#199A8E] flex items-center justify-center transition active:scale-95"
            >
              <ChevronRight size={22} />
            </button>
            <h1 className="text-base font-bold text-[#104C48]">الاستشارات الطبية المرئية</h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 pt-6 space-y-5">
          {/* Call Completed Card */}
          <div className="bg-white rounded-[20px] p-6 border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(25,154,142,0.07)] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E8F5F4] text-[#199A8E] flex items-center justify-center mx-auto ring-8 ring-[#E8F5F4]/50">
              <Video size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#104C48]">اكتملت الاستشارة المرئية بنجاح</h2>
              <p className="text-xs text-slate-500 mt-1">
                مدة المكالمة: {formatDuration(callDuration)} · د. سامي المقطري (باطنية وقلب)
              </p>
            </div>

            <div className="bg-[#F8FAFB] rounded-xl p-3 border border-[#E2E8F0] flex items-center justify-between text-xs">
              <span className="text-slate-500">الوصفة والتقرير الطبي:</span>
              <span className="font-bold text-[#199A8E]">تمت إضافتها إلى سجلاتك</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCallDuration(0);
                  setIsInCall(true);
                }}
                className="flex-1 py-3 px-4 bg-[#199A8E] hover:bg-[#104C48] text-white font-bold text-sm rounded-xl transition shadow-sm active:scale-95"
              >
                إعادة الاتصال بالطبيب
              </button>
              {onBookDoctor && (
                <button
                  onClick={onBookDoctor}
                  className="py-3 px-4 bg-[#E8F5F4] text-[#104C48] font-bold text-sm rounded-xl transition active:scale-95"
                >
                  حجز موعد عيادة
                </button>
              )}
            </div>
          </div>

          {/* Available Doctors Online Now */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#104C48]">أطباء متاحون للاستشارة الفورية الآن</h3>
              <span className="text-xs text-[#199A8E] font-semibold">متاحون 24/7</span>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'd1',
                  name: 'د. سامي المقطري',
                  specialty: 'استشاري باطنية وقلب',
                  hospital: 'مستشفى الثورة — صنعاء',
                  rate: 4.9,
                  fee: '3,000 ريال',
                  initials: 'سم',
                },
                {
                  id: 'd2',
                  name: 'د. فاطمة الشامي',
                  specialty: 'أخصائية أطفال وحديثي الولادة',
                  hospital: 'المركز الاستشاري اليمني',
                  rate: 4.8,
                  fee: '2,500 ريال',
                  initials: 'فش',
                },
                {
                  id: 'd3',
                  name: 'د. عادل القاضي',
                  specialty: 'استشاري جراحة العظام والمفاصل',
                  hospital: 'المستشفى الألماني الحديث',
                  rate: 4.9,
                  fee: '3,500 ريال',
                  initials: 'عق',
                },
              ].map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-[20px] p-4 border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(25,154,142,0.06)] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-[#E8F5F4] text-[#104C48] flex items-center justify-center font-bold text-base border border-[#199A8E]/30">
                        {doc.initials}
                      </div>
                      <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full bg-[#2E7D32] ring-2 ring-white" />
                    </div>
                    <div className="text-right">
                      <h4 className="text-sm font-bold text-[#104C48]">{doc.name}</h4>
                      <p className="text-xs text-slate-500">{doc.specialty}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="text-[#FFB800] font-bold">★ {doc.rate}</span>
                        <span>·</span>
                        <span>{doc.hospital}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCallDuration(0);
                      setIsInCall(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#199A8E] hover:bg-[#104C48] text-white text-xs font-bold transition shadow-sm active:scale-95 shrink-0"
                  >
                    <Video size={14} />
                    <span>اتصال فوري</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Active Video Call View
  return (
    <div className="fixed inset-0 z-50 bg-[#0B1E1C] flex flex-col overflow-hidden text-white">
      {/* Top Overlay Bar */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/70 via-black/30 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold">
            سم
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">د. سامي المقطري</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#38B2AC]/20 border border-[#38B2AC]/40 text-[#38B2AC] text-[10px] font-bold">
                مباشر HD
              </span>
            </div>
            <p className="text-[11px] text-white/70">استشاري باطنية وقسطرة قلبية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Duration Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-[#E53935] animate-pulse" />
            <span>{formatDuration(callDuration)}</span>
          </div>

          <button
            onClick={() => setShowPrescriptionNote(true)}
            className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition active:scale-95"
            title="ملاحظات الاستشارة"
          >
            <FileText size={16} />
          </button>
        </div>
      </div>

      {/* Main Video Stage (Doctor's View) */}
      <div className="relative flex-1 bg-gradient-to-b from-[#104C48] to-[#072421] flex items-center justify-center overflow-hidden">
        {/* Simulated Doctor Video Canvas */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-6">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#199A8E]/25 border-4 border-[#199A8E] flex items-center justify-center text-white text-3xl font-black shadow-[0_0_50px_rgba(25,154,142,0.4)]">
              د. سامي
            </div>
            <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-[#2E7D32] border-2 border-white flex items-center justify-center text-white text-[10px]">
              ✓
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-white">استشارة طبية مرئية نشطة</h3>
          <p className="text-xs md:text-sm text-teal-100/70 mt-1 max-w-sm">
            الاتصال مشفر طرفاً لطرف ومطابق لمعايير الخصوصية الطبية HIPAA
          </p>

          {/* Audio Waveform Animation Simulation */}
          <div className="flex items-center gap-1.5 mt-6 h-8">
            <span className="w-1 bg-[#38B2AC] rounded-full animate-pulse h-4" />
            <span className="w-1 bg-[#38B2AC] rounded-full animate-pulse h-7 delay-100" />
            <span className="w-1 bg-[#38B2AC] rounded-full animate-pulse h-5 delay-200" />
            <span className="w-1 bg-[#38B2AC] rounded-full animate-pulse h-8 delay-300" />
            <span className="w-1 bg-[#38B2AC] rounded-full animate-pulse h-3" />
          </div>
        </div>

        {/* Self-View Picture-in-Picture (Patient's Feed) */}
        <div className="absolute top-20 left-4 z-20 w-28 h-36 md:w-36 md:h-48 rounded-[20px] overflow-hidden bg-slate-900 border-2 border-white/30 shadow-2xl">
          {isVideoOff ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 p-2 text-center">
              <VideoOff size={20} className="text-white/60 mb-1" />
              <span className="text-[10px] text-white/60">الكاميرا مغلقة</span>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#199A8E]/40 to-slate-800 flex flex-col items-center justify-center p-2 relative">
              <span className="text-sm font-bold text-white">أنت</span>
              <span className="text-[10px] text-white/60 mt-0.5">
                {isFrontCamera ? 'كاميرا أمامية' : 'كاميرا خلفية'}
              </span>
              <span className="absolute bottom-2 left-2 text-[9px] bg-black/50 px-1.5 py-0.5 rounded text-white font-mono">
                {user?.full_name?.split(' ')[0] || 'المريض'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Organic Pill Overlay for In-Call Controls */}
      <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center px-4">
        <div className="bg-[#104C48]/90 backdrop-blur-xl border border-white/20 rounded-[32px] px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex items-center gap-3">
          {/* Mute Audio */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95 ${
              isMuted ? 'bg-[#E53935] text-white' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Toggle Video */}
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95 ${
              isVideoOff ? 'bg-[#E53935] text-white' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={isVideoOff ? 'تشغيل الكاميرا' : 'إيقاف الكاميرا'}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          {/* Camera Flip */}
          <button
            onClick={() => setIsFrontCamera(!isFrontCamera)}
            className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition active:scale-95"
            title="تبديل الكاميرا"
          >
            <RefreshCw size={20} />
          </button>

          {/* Toggle Live Chat */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="relative w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition active:scale-95"
            title="الدردشة الطبية"
          >
            <MessageSquare size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#38B2AC]" />
          </button>

          {/* End Call Button (Crimson #E53935) */}
          <button
            onClick={() => setIsInCall(false)}
            className="w-14 h-12 rounded-full bg-[#E53935] hover:bg-[#c92f2b] text-white flex items-center justify-center shadow-lg shadow-[#E53935]/40 transition active:scale-95 ml-1"
            title="إنهاء المكالمة"
          >
            <PhoneOff size={22} />
          </button>
        </div>
      </div>

      {/* Slide-Up Clinical Chat Drawer */}
      {showChat && (
        <div className="absolute inset-x-0 bottom-0 top-24 z-40 bg-white rounded-t-[28px] text-slate-800 flex flex-col shadow-2xl animate-slide-up border-t border-[#E2E8F0]">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#E8F5F4] text-[#199A8E] flex items-center justify-center font-bold text-xs">
                سم
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#104C48]">الدردشة الطبية المباشرة</h4>
                <p className="text-[10px] text-slate-400">مشفرة ومحفوظة في سجلك الصحي</p>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 transition hover:bg-slate-200"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => {
              const isMe = msg.sender === 'patient';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-[18px] px-3.5 py-2.5 text-xs font-medium leading-relaxed ${
                      isMe
                        ? 'bg-[#199A8E] text-white rounded-bl-sm'
                        : 'bg-[#E8F5F4] text-[#104C48] rounded-br-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              );
            })}
          </div>

          {/* Message input form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E2E8F0] flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="اكتب رسالتك أو استفسارك للطبيب..."
              className="flex-1 bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#199A8E]"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-xl bg-[#199A8E] hover:bg-[#104C48] text-white flex items-center justify-center transition active:scale-95 shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Prescription / Clinical Notes Modal */}
      {showPrescriptionNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-5 text-slate-800 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#199A8E]" />
                <h4 className="text-sm font-bold text-[#104C48]">ملاحظات وتوصيات الطبيب</h4>
              </div>
              <button
                onClick={() => setShowPrescriptionNote(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={15} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-[#E8F5F4] p-3 rounded-xl border border-[#199A8E]/20">
                <p className="font-bold text-[#104C48]">التشخيص المبدئي:</p>
                <p className="text-slate-600 mt-1">إجهاد عام وارتفاع طفيف في ضغط الدم نتيجة السهر.</p>
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-slate-700">التوصيات الطبية:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>الراحة التامة والابتعاد عن المنبهات بعد الساعة 6 مساءً.</li>
                  <li>قياس الضغط مرتين يومياً (صباحاً ومساءً) وتسجيله في تطبيق يمن عافية.</li>
                  <li>مراجعة العيادة في حال استمرار الدوار لأكثر من 48 ساعة.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowPrescriptionNote(false)}
              className="w-full py-2.5 rounded-xl bg-[#199A8E] text-white font-bold text-xs"
            >
              حفظ وإغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
