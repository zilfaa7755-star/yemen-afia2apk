import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  User,
  Send,
  Paperclip,
  Image,
  FileText,
  ChevronLeft,
  Clock,
  XCircle,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { supabase } from '../lib/supabase';
import type { Conversation, Message } from '../types';

interface MessagesPageProps {
  onBack?: () => void;
  preselectedConversation?: string;
}

interface ChatConversation extends Conversation {
  doctor?: { id: string; full_name: string };
  patient?: { id: string; full_name: string };
}

export function MessagesPage({ onBack, preselectedConversation }: MessagesPageProps) {
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setConversations(data as ChatConversation[]);
      } else {
        setConversations(getDemoConversations());
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations(getDemoConversations());
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(data as Message[]);
      } else {
        setMessages(getDemoMessages());
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages(getDemoMessages());
    }
  };

  const getDemoConversations = (): ChatConversation[] => [
    {
      id: '1',
      patient_id: 'demo',
      doctor_id: '1',
      doctor: { id: '1', full_name: 'د. محمد أمين الديلمي' },
      status: 'active',
      expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      patient_id: 'demo',
      doctor_id: '2',
      doctor: { id: '2', full_name: 'د. فاطمة الشامي' },
      status: 'closed',
      closed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const getDemoMessages = (): Message[] => [
    {
      id: '1',
      conversation_id: '1',
      sender_type: 'doctor',
      sender_id: '1',
      content: 'مرحباً بك، كيف تشعر اليوم؟ هل تحسنت الأعراض؟',
      attachments: [],
      is_read: true,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      conversation_id: '1',
      sender_type: 'patient',
      sender_id: 'demo',
      content: 'السلام عليكم دكتور، نعم تحسنت الأعراض بشكل ملحوظ بعد العلاج الذي وصفته لي',
      attachments: [],
      is_read: true,
      created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      conversation_id: '1',
      sender_type: 'doctor',
      sender_id: '1',
      content: 'الحمد لله. استمر في تناول الدواء وأخبرني أي استفسار آخر لديك.',
      attachments: [],
      is_read: true,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      conversation_id: selectedConversation.id,
      sender_type: 'patient',
      sender_id: 'demo',
      content: newMessage.trim(),
      attachments: [],
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');

    try {
      await supabase.from('messages').insert([message]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return 'منتهي';
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return `${days} يوم ${hours} ساعة`;
  };

  if (view === 'chat' && selectedConversation) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Header
          title={selectedConversation.doctor?.full_name || 'المحادثة'}
          showBack
          onBack={() => {
            setView('list');
            setSelectedConversation(null);
          }}
        />

        {/* Expiry Warning */}
        {selectedConversation.status === 'active' && selectedConversation.expires_at && (
          <div className="bg-warning-50 px-4 py-2 flex items-center gap-2">
            <Clock size={16} className="text-warning-600" />
            <span className="text-sm text-warning-700">
              متاح لـ {getTimeRemaining(selectedConversation.expires_at)}
            </span>
          </div>
        )}

        {selectedConversation.status === 'closed' && (
          <div className="bg-gray-100 px-4 py-2 flex items-center gap-2">
            <XCircle size={16} className="text-gray-500" />
            <span className="text-sm text-gray-500">المحادثة مغلقة</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.sender_type === 'patient' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.sender_type === 'patient'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : 'bg-white shadow-soft rounded-tl-sm'
                }`}
              >
                <p className={`whitespace-pre-wrap ${message.sender_type === 'patient' ? '' : 'text-gray-700'}`}>
                  {message.content}
                </p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <FileText size={16} />
                        <span className="text-sm">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p
                  className={`text-xs mt-2 ${
                    message.sender_type === 'patient' ? 'text-white/60' : 'text-gray-400'
                  }`}
                >
                  {new Date(message.created_at || Date.now()).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {selectedConversation.status === 'active' && (
          <div className="bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <button className="p-3 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="اكتب رسالتك..."
                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className={`p-3 rounded-xl transition-colors ${
                  newMessage.trim()
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50">
      <Header title="المحادثات الطبية" showBack onBack={onBack} />

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">لا توجد محادثات نشطة</p>
            <p className="text-sm text-gray-400 mt-2">يمكنك التواصل مع طبيبك بعد المعاينة</p>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv);
                  setView('chat');
                }}
                className="w-full bg-white rounded-2xl shadow-soft p-4 border border-gray-100 card-hover text-right"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-medical rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {conv.doctor?.full_name?.charAt(0) || 'ط'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{conv.doctor?.full_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {conv.status === 'active' ? (
                        <span className="text-xs text-success-600 font-medium">نشط</span>
                      ) : (
                        <span className="text-xs text-gray-400">مغلق</span>
                      )}
                      {conv.expires_at && conv.status === 'active' && (
                        <span className="text-xs text-gray-400">
                          متبقي: {getTimeRemaining(conv.expires_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronLeft size={20} className="text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
