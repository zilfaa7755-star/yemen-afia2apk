import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Stethoscope,
  Loader2,
  ChevronLeft,
  RotateCcw,
  ArrowRight,
  Mic,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { AudioTranscribeModal } from '../components/common/AudioTranscribeModal';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  specialization?: string;
  specializationId?: string;
}

interface QuickSymptom {
  id: string;
  label: string;
  keywords: string[];
}

const quickSymptoms: QuickSymptom[] = [
  { id: '1', label: 'صداع وألم في الرأس', keywords: ['صداع', 'ألم رأس', 'دوخة'] },
  { id: '2', label: 'ألم في البطن والغثيان', keywords: ['ألم بطن', 'غثيان', 'إسهال'] },
  { id: '3', label: 'ضيق تنفس وآلام صدرية', keywords: ['ضيق تنفس', 'ألم صدر', 'كحة'] },
  { id: '4', label: 'طهور وحرارة مرتفعة', keywords: ['طهور', 'حمى', 'سخونة'] },
  { id: '5', label: 'طفح وحكة جلدية', keywords: ['طفح', 'حكة', 'احمرار'] },
  { id: '6', label: 'آلام مفاصل وعظام', keywords: ['ألم مفصل', 'ورم', 'صلابة'] },
];

const symptomMapping: Record<string, { specialization: string; advice: string }> = {
  'صداع': { specialization: 'طب الأعصاب', advice: 'يُنصح بمراجعة طبيب الأعصاب لتشخيص سبب الصداع' },
  'ألم رأس': { specialization: 'طب الأعصاب', advice: 'يُنصح بمراجعة طبيب الأعصاب لتشخيص سبب الألم' },
  'دوخة': { specialization: 'طب الأعصاب', advice: 'الدوخة قد تكون ناتجة عن عدة أسباب، يُنصح بمراجعة طبيب الأعصاب أو الباطنة' },
  'ألم بطن': { specialization: 'طب الجهاز الهضمي', advice: 'ألم البطن يحتاج فحصاً من طبيب الجهاز الهضمي' },
  'غثيان': { specialization: 'طب الجهاز الهضمي', advice: 'الغثيان قد يكون سببه أمراض الجهاز الهضمي' },
  'إسهال': { specialization: 'طب الجهاز الهضمي', advice: 'الإسهال المستمر يحتاج متابعة طبية' },
  'ضيق تنفس': { specialization: 'طب القلب والأوعية الدموية', advice: 'ضيق التنفس قد يكون خطيراً، يُنصح بمراجعة طبيب القلب أو الطوارئ في الحالات الشديدة' },
  'ألم صدر': { specialization: 'طب القلب والأوعية الدموية', advice: 'ألم الصدر يحتاج فحصاً عاجلاً. توجه للطوارئ إذا كان شديداً' },
  'كحة': { specialization: 'طب عام / أمراض صدرية', advice: 'الكحة المستمرة تحتاج مراجعة طبيب عام أو أخصائي صدرية' },
  'طهور': { specialization: 'طب عام / باطنية', advice: 'الطهور قد يكون سببه التهاب أو أمراض باطنية أخرى' },
  'حمى': { specialization: 'طب عام / باطنية', advice: 'الحمى المستمرة تحتاج تشخيص الطبيب' },
  'سخونة': { specialization: 'طب عام / باطنية', advice: 'ارتفاع الحرارة بدون سبب واضح يحتاج فحص طبي' },
  'طفح': { specialization: 'طب الجلدية', advice: 'الطفح الجلدي يحتاج فحص طبيب الجلدية لتحديد السبب' },
  'حكة': { specialization: 'طب الجلدية', advice: 'الحكة المستمرة قد تكون حساسية أو أمراض جلدية أخرى' },
  'احمرار': { specialization: 'طب الجلدية', advice: 'الاحمرار قد يكون حساسية أو التهاب جلدي' },
  'ألم مفصل': { specialization: 'طب العظام', advice: 'آلام المفاصل تحتاج فحص طبيب العظام' },
  'ورم': { specialization: 'طب العظام', advice: 'الورم في المفصل يحتاج فحص طبي عاجل' },
  'صلابة': { specialization: 'طب العظام', advice: 'صلابة المفاصل قد تكون من أعراض التهاب المفاصل' },
  'ضربات قلب سريعة': { specialization: 'طب القلب والأوعية الدموية', advice: 'خفقان القلب يحتاج فحص طبيب القلب. توجه للطوارئ إذا صاحبه ألم صدر' },
  'حرقة معدة': { specialization: 'طب الجهاز الهضمي', advice: 'الحرقة المتكررة تحتاج متابعة طبيب الجهاز الهضمي' },
  'عسر بول': { specialization: 'طب المسالك البولية', advice: 'مشاكل البول تحتاج فحص طبيب المسالك البولية' },
  'آلام أسفل الظهر': { specialization: 'طب العظام', advice: 'آلام الظهر تحتاج فحص طبيب العظام' },
};

interface AIAssistantPageProps {
  onBack?: () => void;
  onBookDoctor?: (specializationId: string) => void;
}

export function AIAssistantPage({ onBack, onBookDoctor }: AIAssistantPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'مرحباً بك! أنا المساعد الصحي الذكي. أخبرني بالأعراض التي تعاني منها وسأساعدك في تحديد التخصص الطبي المناسب. يمكنك وصف أعراضك أو اختيار من الأعراض الشائعة أدناه.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTranscribe, setShowTranscribe] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const analyzeSymptoms = (text: string): { specialization: string; advice: string; matchedKeywords: string[] } => {
    const matchedKeywords: string[] = [];
    let bestMatch: { specialization: string; advice: string } | null = null;

    for (const [keyword, data] of Object.entries(symptomMapping)) {
      if (text.includes(keyword)) {
        matchedKeywords.push(keyword);
        if (!bestMatch) {
          bestMatch = data;
        }
      }
    }

    if (bestMatch) {
      return { ...bestMatch, matchedKeywords };
    }

    return {
      specialization: 'طب عام',
      advice: 'للأسف لم أتمكن من تحديد التخصص المناسب تماماً. يُنصح بمراجعة طبيب عام للتشخيص الأولي.',
      matchedKeywords: [],
    };
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result = analyzeSymptoms(messageText);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: `بناءً على الأعراض التي ذكرتها (${result.matchedKeywords.join('، ') || messageText}):\n\n${result.advice}\n\nالتخصص المناسب: ${result.specialization}`,
      specialization: result.specialization,
      specializationId: result.specialization.toLowerCase().replace(/\s+/g, '-'),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleReset = () => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: 'مرحباً بك! أنا المساعد الصحي الذكي. أخبرني بالأعراض التي تعاني منها وسأساعدك في تحديد التخصص الطبي المناسب.',
      },
    ]);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header title="المساعد الذكي" showBack onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                message.type === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-white shadow-soft rounded-tl-sm'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'user' ? (
                  <User size={20} className="flex-shrink-0 mt-0.5" />
                ) : (
                  <Bot size={20} className="flex-shrink-0 mt-0.5 text-primary-600" />
                )}
                <div className={`whitespace-pre-line ${message.type === 'user' ? '' : 'text-gray-700'}`}>
                  {message.content}
                </div>
              </div>

              {message.specialization && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={18} className="text-primary-600" />
                      <span className="font-bold text-primary-700">{message.specialization}</span>
                    </div>
                    <button
                      onClick={() => onBookDoctor?.(message.specializationId || '')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      حجز موعد
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-end mb-4">
            <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-soft">
              <div className="flex items-center gap-2 text-gray-500">
                <Bot size={20} />
                <Loader2 size={16} className="animate-spin" />
                <span>جاري التحليل...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Symptoms */}
      {messages.length <= 1 && (
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">الأعراض الشائعة:</p>
          <div className="flex flex-wrap gap-2">
            {quickSymptoms.slice(0, 4).map((symptom) => (
              <button
                key={symptom.id}
                onClick={() => handleSendMessage(symptom.label)}
                className="px-3 py-2 bg-gray-100 rounded-xl text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                {symptom.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset Button */}
      {messages.length > 2 && (
        <div className="px-4 py-2 bg-white border-t border-gray-100">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors"
          >
            <RotateCcw size={18} />
            <span>بدء محادثة جديدة</span>
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="اشرح أعراضك هنا أو اضغط المايك..."
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B39F]/30"
          />

          <button
            type="button"
            onClick={() => setShowTranscribe(true)}
            className="p-3 rounded-xl bg-gradient-to-br from-[#0B337A] to-[#00B39F] text-white hover:opacity-95 active:scale-95 transition shadow-sm flex-shrink-0"
            title="تفريغ صوتي بالمايكروفون (Gemini 3.5 Transcribe)"
          >
            <Mic size={20} />
          </button>

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className={`p-3 rounded-xl transition-colors flex-shrink-0 ${
              inputValue.trim() && !isTyping
                ? 'bg-[#0B337A] text-white hover:bg-[#08285F]'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Audio Transcription Modal */}
      <AudioTranscribeModal
        isOpen={showTranscribe}
        onClose={() => setShowTranscribe(false)}
        onApplyText={(text) => {
          setInputValue(text);
          handleSendMessage(text);
        }}
        title="تفريغ الأعراض بالصوت (Gemini 3.5)"
        contextHint="تحدث بوضوح لوصف الأعراض التي تشعر بها وسيتم تفريغ الصوت وتحليله فوراً بواسطة نموذج gemini-3.5-transcribe"
      />
    </div>
  );
}
