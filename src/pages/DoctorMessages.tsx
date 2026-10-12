import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Search, ChevronLeft, Users, Circle,
  Stethoscope, Plus, X, ArrowRight, User,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface DoctorContact {
  id: string;
  full_name: string;
  specialization?: string;
  last_message?: string;
  last_time?: string;
  unread?: number;
  online?: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

const DEMO_CONTACTS: DoctorContact[] = [
  { id: '2', full_name: 'د. فاطمة الشامي', specialization: 'قسطرة قلبية', last_message: 'موافقة على التشخيص، أنصح بالقسطرة الطارئة', last_time: 'قبل ساعة', unread: 2, online: true },
  { id: '3', full_name: 'د. خالد الإرياني', specialization: 'أعصاب طرفية', last_message: 'هل جربت إضافة كيتباباتين؟', last_time: 'قبل 3 ساعات', unread: 0, online: true },
  { id: '4', full_name: 'د. سمية الحوثي', specialization: 'أطفال عام', last_message: 'شكراً على المشاركة، حالة مفيدة جداً', last_time: 'أمس', unread: 0, online: false },
  { id: '5', full_name: 'د. عبدالله الرimiي', specialization: 'جلدية', last_message: 'هل لديك مرجع عن علاج الصدفية؟', last_time: 'قبل يومين', unread: 1, online: false },
  { id: '6', full_name: 'د. منى الصبري', specialization: 'عظام', last_message: 'تم استقبال المريض، شكراً على التحويلة', last_time: 'قبل 3 أيام', unread: 0, online: true },
];

const DEMO_MESSAGES: Record<string, Message[]> = {
  '2': [
    { id: 'm1', sender_id: '2', sender_name: 'د. فاطمة الشامي', receiver_id: '1', body: 'السلام عليكم، شفت حالتك في غرفة الاستشارة', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'm2', sender_id: '2', sender_name: 'د. فاطمة الشامي', receiver_id: '1', body: 'موافقة على التشخيص، أنصح بالقسطرة الطارئة خلال أول 90 دقيقة', is_read: false, created_at: new Date(Date.now() - 3500000).toISOString() },
    { id: 'm3', sender_id: '1', sender_name: 'د. أحمد المقطري', receiver_id: '2', body: 'شكراً جزيلاً، تم نقل المريض للقسطرة', is_read: true, created_at: new Date(Date.now() - 3000000).toISOString() },
  ],
  '3': [
    { id: 'm4', sender_id: '3', sender_name: 'د. خالد الإرياني', receiver_id: '1', body: 'هل جربت إضافة كيتباباتين للحالة؟', is_read: true, created_at: new Date(Date.now() - 10800000).toISOString() },
    { id: 'm5', sender_id: '1', sender_name: 'د. أحمد المقطري', receiver_id: '3', body: 'لا، سأجربه. شكراً على الاقتراح', is_read: true, created_at: new Date(Date.now() - 10700000).toISOString() },
  ],
  '4': [
    { id: 'm6', sender_id: '4', sender_name: 'د. سمية الحوثي', receiver_id: '1', body: 'شكراً على المشاركة، حالة مفيدة جداً', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
  '5': [
    { id: 'm7', sender_id: '5', sender_name: 'د. عبدالله الرimiي', receiver_id: '1', body: 'هل لديك مرجع عن علاج الصدفية؟', is_read: false, created_at: new Date(Date.now() - 172800000).toISOString() },
  ],
  '6': [
    { id: 'm8', sender_id: '6', sender_name: 'د. منى الصبري', receiver_id: '1', body: 'تم استقبال المريض، شكراً على التحويلة', is_read: true, created_at: new Date(Date.now() - 259200000).toISOString() },
  ],
};

export function DoctorMessages() {
  const { user } = useAuth();
  const myId = user?.id || '1';
  const myName = user?.full_name || 'د. أحمد المقطري';
  const [contacts, setContacts] = useState<DoctorContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<DoctorContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadContacts(); }, []);

  useEffect(() => {
    if (selectedContact) loadMessages(selectedContact.id);
  }, [selectedContact?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('doctor_messages').select('*').order('created_at', { ascending: false }).limit(100);
      if (data && data.length > 0) {
        // Group by conversation partner
        const convMap = new Map<string, DoctorContact>();
        data.forEach((msg: any) => {
          const partnerId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id;
          const partnerName = msg.sender_id === myId ? msg.receiver_name : msg.sender_name;
          if (!convMap.has(partnerId)) {
            convMap.set(partnerId, {
              id: partnerId, full_name: partnerName,
              last_message: msg.body, last_time: new Date(msg.created_at).toLocaleString('ar-YE'),
              unread: msg.receiver_id === myId && !msg.is_read ? 1 : 0, online: true,
            });
          } else {
            const c = convMap.get(partnerId)!;
            if (msg.receiver_id === myId && !msg.is_read) c.unread = (c.unread || 0) + 1;
          }
        });
        setContacts(Array.from(convMap.values()));
      } else {
        setContacts(DEMO_CONTACTS);
      }
    } catch {
      setContacts(DEMO_CONTACTS);
    } finally { setIsLoading(false); }
  };

  const loadMessages = async (contactId: string) => {
    try {
      const { data } = await supabase.from('doctor_messages')
        .select('*')
        .or(`and(sender_id.eq.${myId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${myId}))`)
        .order('created_at', { ascending: true });
      if (data && data.length > 0) setMessages(data as Message[]);
      else setMessages(DEMO_MESSAGES[contactId] || []);
    } catch {
      setMessages(DEMO_MESSAGES[contactId] || []);
    }
    // Mark as read
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, unread: 0 } : c));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;
    const msg: Message = {
      id: `m${Date.now()}`, sender_id: myId, sender_name: myName,
      receiver_id: selectedContact.id, body: newMessage, is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
    try {
      await supabase.from('doctor_messages').insert({
        sender_id: myId, sender_name: myName, sender_specialization: 'باطنية عامة',
        receiver_id: selectedContact.id, receiver_name: selectedContact.full_name,
        receiver_specialization: selectedContact.specialization, body: msg.body, is_read: false,
      });
    } catch {}
  };

  const filteredContacts = contacts.filter(c => !searchQuery || c.full_name.includes(searchQuery) || c.specialization?.includes(searchQuery));

  // ─── Chat View ─────────────────────────────────────────────────────────────
  if (selectedContact) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 h-16">
            <button onClick={() => setSelectedContact(null)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
              <ChevronLeft size={18} className="text-gray-600 rotate-180" />
            </button>
            <div className="flex items-center gap-3 flex-1 justify-center">
              <div className="text-center">
                <h1 className="text-sm font-bold text-gray-800">{selectedContact.full_name}</h1>
                <p className="text-xs text-gray-400">{selectedContact.specialization}</p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#104C48] to-[#199A8E] flex items-center justify-center text-white font-bold text-sm">
                  {selectedContact.full_name ? selectedContact.full_name.charAt(0) : 'ط'}
                </div>
                {selectedContact.online && <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
              </div>
            </div>
            <div className="w-9" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map(msg => {
            const isMine = msg.sender_id === myId;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-left' : 'justify-right'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-[#199A8E] text-white rounded-bottom-left-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bottom-right-sm'}`}>
                  <p className="text-sm text-right leading-relaxed">{msg.body}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'} text-left`}>
                    {new Date(msg.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-100 p-3 flex items-center gap-2">
          <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="اكتب رسالة..." dir="rtl"
            className="flex-1 p-3 rounded-xl bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/20" />
          <button onClick={sendMessage} disabled={!newMessage.trim()}
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${newMessage.trim() ? 'bg-[#199A8E] text-white' : 'bg-gray-200 text-gray-400'}`}>
            <Send size={18} className="rotate-180" />
          </button>
        </div>
      </div>
    );
  }

  // ─── Contacts List View ────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-l from-[#104C48] to-[#199A8E] rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <MessageSquare size={24} className="text-white" />
          </div>
          <div className="flex-1 text-right">
            <h3 className="font-bold text-white">رسائل الأطباء</h3>
            <p className="text-white/70 text-xs mt-0.5">تواصل مباشر مع زملائك الأطباء</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl flex items-center px-4 py-3 gap-3 border border-gray-100">
        <Search size={18} className="text-gray-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث عن طبيب..." className="flex-1 text-gray-700 placeholder-gray-400 outline-none text-sm" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#199A8E]" /></div>
      ) : (
        <div className="space-y-2">
          {filteredContacts.map(c => (
            <button key={c.id} onClick={() => setSelectedContact(c)}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 text-right">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 justify-end mb-0.5">
                    {c.unread ? <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{c.unread}</span> : null}
                    {c.online && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                    <h3 className="font-bold text-gray-800 text-sm">{c.full_name}</h3>
                  </div>
                  <p className="text-xs text-gray-400 text-right">{c.specialization}</p>
                  <p className="text-xs text-gray-500 text-right mt-1 truncate">{c.last_message}</p>
                  <p className="text-xs text-gray-300 text-right mt-0.5">{c.last_time}</p>
                </div>
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#104C48] to-[#199A8E] flex items-center justify-center text-white font-bold">
                    {c.full_name ? c.full_name.charAt(0) : 'ط'}
                  </div>
                  {c.online && <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
