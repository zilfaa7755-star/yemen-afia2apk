import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Copy,
  Check,
  Sparkles,
  X,
  Volume2,
  RefreshCw,
  FileText,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { YemenAfiaLogo } from './YemenAfiaLogo';

interface AudioTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText?: (transcription: string) => void;
  title?: string;
  contextHint?: string;
}

export function AudioTranscribeModal({
  isOpen,
  onClose,
  onApplyText,
  title = 'التفريغ الصوتي الذكي (Gemini 3.5 Transcribe)',
  contextHint = 'تحدث بوضوح لوصف حالتك الصحية، الأعراض، أو الملاحظات الطبية وسيتم تحويلها لنص فوراً',
}: AudioTranscribeModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  const handleReset = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordDuration(0);
    setIsTranscribing(false);
    setTranscribedText('');
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setErrorMsg(null);
    setCopied(false);
  };

  const startRecording = async () => {
    setErrorMsg(null);
    setTranscribedText('');
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        // Automatically trigger transcribe
        sendAudioToGemini(blob, mimeType);
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access issue:', err);
      setErrorMsg(
        'تعذر الوصول للمايكروفون. يرجى التأكد من منح صلاحية المايكروفون، أو تجربة العينة الصوتية التجريبية أدناه.'
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendAudioToGemini = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setErrorMsg(null);
    try {
      const base64Data = await blobToBase64(blob);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Data,
          mimeType: mimeType || 'audio/webm',
          prompt:
            'قم بتفريغ هذا التسجيل الصوتي الطبي بدقة متناهية إلى نص باللغة العربية الفصحى أو اللهجة اليمنية المستخدمة.',
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (data.text) {
        setTranscribedText(data.text);
      } else {
        setTranscribedText('لم يتم التعرف على كلمات واضحة في التسجيل الصوتي.');
      }
    } catch (err: any) {
      console.error('Transcribe error:', err);
      // Fallback helpful message
      setErrorMsg(`حدث خطأ أثناء التفريغ الصوتي: ${err.message || 'فشل الاتصال'}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (!transcribedText) return;
    navigator.clipboard.writeText(transcribedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (transcribedText && onApplyText) {
      onApplyText(transcribedText);
      onClose();
    }
  };

  // Quick test demo audio for environments without live mic permission
  const handleTestSampleAudio = () => {
    setIsTranscribing(true);
    setErrorMsg(null);
    setTimeout(() => {
      setTranscribedText(
        'أعاني من صداع نصفي مستمر منذ يومين مع ارتفاع طفيف في درجات الحرارة وغثيان بعد تناول الطعام، وأرغب في استشارة طبيب باطنية لتحديد الفحوصات اللازمة وتعديل جرعة الدواء.'
      );
      setIsTranscribing(false);
    }, 1200);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
      dir="rtl"
    >
      <div className="relative flex flex-col w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100 animate-slide-up">
        {/* Header with Yemen Afia Brand Identity */}
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#0B337A] via-[#08285F] to-[#00B39F] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <YemenAfiaLogo variant="symbol" size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold sm:text-lg">{title}</h3>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  gemini-3.5-transcribe
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5 font-medium">
                تحويل الصوت إلى نص بدقة عالية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 p-2 text-white/90 transition hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 bg-[#EDF3FC] text-[#0B337A] p-3 rounded-2xl border border-[#0B337A]/10 font-medium">
            {contextHint}
          </p>

          {/* Recording Status / Controller */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-gray-50 to-gray-100/60 border border-gray-200/80">
            {/* Visualizer Orb */}
            <div className="relative flex items-center justify-center my-2">
              {isRecording && (
                <div className="absolute h-28 w-28 rounded-full bg-[#00B39F]/20 animate-ping" />
              )}
              {isTranscribing && (
                <div className="absolute h-28 w-28 rounded-full bg-[#0B337A]/20 animate-pulse" />
              )}

              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
                  isRecording
                    ? 'bg-rose-500 hover:bg-rose-600 text-white scale-105 shadow-rose-500/30'
                    : isTranscribing
                    ? 'bg-[#0B337A] text-white opacity-80 cursor-wait'
                    : 'bg-gradient-to-br from-[#0B337A] to-[#00B39F] text-white hover:scale-105 active:scale-95 shadow-[#00B39F]/30'
                }`}
                title={isRecording ? 'إيقاف التسجيل' : 'بدء التسجيل'}
              >
                {isRecording ? (
                  <Square size={28} className="fill-current" />
                ) : isTranscribing ? (
                  <RefreshCw size={28} className="animate-spin text-white" />
                ) : (
                  <Mic size={32} />
                )}
              </button>
            </div>

            {/* Timer and instructions */}
            <div className="mt-3 text-center">
              {isRecording ? (
                <div>
                  <span className="font-mono text-2xl font-black text-rose-600">
                    {formatTime(recordDuration)}
                  </span>
                  <p className="text-xs text-rose-500 font-bold mt-1 animate-pulse">
                    جارٍ التسجيل... اضغط المربع للإيقاف والتفريغ
                  </p>
                </div>
              ) : isTranscribing ? (
                <div>
                  <span className="text-sm font-bold text-[#0B337A] flex items-center justify-center gap-2">
                    <Sparkles size={16} className="text-[#00B39F] animate-spin" />
                    جارٍ معالجة الصوت ونمذجة النص بنموذج gemini-3.5-transcribe...
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-gray-700">
                    {audioBlob ? 'اضغط المايك لتسجيل مقطع جديد' : 'اضغط على المايكروفون لبدء التسجيل'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    يدعم اللهجة اليمنية والمصطلحات الطبية المتخصصة
                  </p>
                </div>
              )}
            </div>

            {/* Audio playback if recorded */}
            {audioUrl && !isRecording && (
              <div className="mt-3 w-full max-w-xs">
                <audio src={audioUrl} controls className="w-full h-8" />
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{errorMsg}</p>
                <button
                  type="button"
                  onClick={handleTestSampleAudio}
                  className="mt-2 text-[11px] font-bold text-[#0B337A] underline flex items-center gap-1"
                >
                  <Sparkles size={12} className="text-[#00B39F]" />
                  جرّب نموذجاً جاهزاً (تفريغ تجريبي فوري)
                </button>
              </div>
            </div>
          )}

          {/* Transcribed Text Result Box */}
          {transcribedText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5 text-[#0B337A]">
                  <FileText size={14} className="text-[#00B39F]" />
                  النص المفرغ من الصوت:
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-gray-500 hover:text-[#0B337A] transition"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-600">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>نسخ النص</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-gray-200 bg-white p-3.5 text-sm text-gray-800 focus:border-[#00B39F] focus:outline-none focus:ring-2 focus:ring-[#00B39F]/20"
                dir="rtl"
                placeholder="سيظهر النص هنا..."
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/90 p-4">
          <button
            type="button"
            onClick={handleTestSampleAudio}
            className="text-xs font-bold text-[#0B337A] hover:text-[#00B39F] transition flex items-center gap-1"
          >
            <Sparkles size={14} className="text-[#00B39F]" />
            تجربة عينة صوتية
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
            >
              إلغاء
            </button>

            {onApplyText && transcribedText && (
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#0B337A] to-[#00B39F] px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-[#00B39F]/20 hover:opacity-95 active:scale-95 transition"
              >
                <Check size={15} />
                استخدام النص
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioTranscribeModal;
