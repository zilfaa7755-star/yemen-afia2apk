import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  UserPlus,
  User,
  Baby,
  UserCog,
  Heart,
  Calendar,
  Clock,
  Stethoscope,
  Plus,
  X,
  CheckCircle,
  Edit2,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface FamilyPageProps {
  onBack?: () => void;
  onBookForMember?: (member: FamilyMember) => void;
}

interface FamilyMember {
  id: string;
  user_id: string;
  name: string;
  relation: string;
  date_of_birth?: string;
  gender: 'male' | 'female';
  blood_type?: string;
  chronic_diseases?: string[];
  allergies?: string[];
  notes?: string;
}

const relations = [
  { id: 'spouse', label: 'الزوج/الزوجة', icon: Heart },
  { id: 'son', label: 'الابن', icon: User },
  { id: 'daughter', label: 'البنت', icon: User },
  { id: 'father', label: 'الأب', icon: UserCog },
  { id: 'mother', label: 'الأم', icon: UserCog },
  { id: 'brother', label: 'الأخ', icon: User },
  { id: 'sister', label: 'الأخت', icon: User },
  { id: 'other', label: 'أخرى', icon: User },
];

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const demoMembers: FamilyMember[] = [
  { id: 'm1', user_id: 'demo', name: 'أم خالد (فاطمة)', relation: 'spouse', date_of_birth: '1985-06-15', gender: 'female', blood_type: 'A+', chronic_diseases: ['ضغط الدم'], allergies: ['بنسلين'] },
  { id: 'm2', user_id: 'demo', name: 'خالد أحمد', relation: 'son', date_of_birth: '2010-03-22', gender: 'male', blood_type: 'B+', chronic_diseases: [], allergies: [] },
  { id: 'm3', user_id: 'demo', name: 'سارة أحمد', relation: 'daughter', date_of_birth: '2014-09-07', gender: 'female', blood_type: 'A+', chronic_diseases: ['ربو'], allergies: ['غبار'] },
  { id: 'm4', user_id: 'demo', name: 'الوالدة أم أحمد', relation: 'mother', date_of_birth: '1962-02-10', gender: 'female', blood_type: 'O+', chronic_diseases: ['سكري'], allergies: [] },
  { id: 'm5', user_id: 'demo', name: 'الحاج محمد (الأب)', relation: 'father', date_of_birth: '1956-11-04', gender: 'male', blood_type: 'O+', chronic_diseases: ['ضغط الدم'], allergies: [] },
];

function calcAge(dob?: string): string {
  if (!dob) return '';
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
  return `${age} سنة`;
}

function getRelationLabel(id: string) {
  return relations.find((r) => r.id === id)?.label || id;
}

function getRelationIcon(id: string) {
  return relations.find((r) => r.id === id)?.icon || User;
}

export function FamilyPage({ onBack, onBookForMember }: FamilyPageProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<FamilyMember>>({
    name: '', relation: 'son', gender: 'male', blood_type: '', chronic_diseases: [], allergies: [], date_of_birth: '', notes: '',
  });
  const [diseaseInput, setDiseaseInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem('yemenAfiya_family_members');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMembers(parsed);
            setIsLoading(false);
            return;
          }
        } catch {}
      }
      const { data } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user?.id || 'demo')
        .order('created_at', { ascending: true });
      const finalMembers = data && data.length > 0 ? (data as FamilyMember[]) : demoMembers;
      setMembers(finalMembers);
      localStorage.setItem('yemenAfiya_family_members', JSON.stringify(finalMembers));
    } catch {
      setMembers(demoMembers);
      localStorage.setItem('yemenAfiya_family_members', JSON.stringify(demoMembers));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.relation) return;
    setIsSaving(true);
    let updated: FamilyMember[] = [];
    try {
      const payload = { ...form, user_id: user?.id || 'demo', chronic_diseases: form.chronic_diseases || [], allergies: form.allergies || [] };
      if (editMode && selectedMember) {
        const { data } = await supabase.from('family_members').update(payload).eq('id', selectedMember.id).select().single();
        const updatedItem = (data || { ...selectedMember, ...payload }) as FamilyMember;
        updated = members.map((m) => m.id === selectedMember.id ? updatedItem : m);
      } else {
        const { data } = await supabase.from('family_members').insert([payload]).select().single();
        const newMember = (data || { id: Date.now().toString(), ...payload }) as FamilyMember;
        updated = [...members, newMember];
      }
    } catch {
      const newMember = { id: Date.now().toString(), ...form, user_id: user?.id || 'demo', chronic_diseases: form.chronic_diseases || [], allergies: form.allergies || [] } as FamilyMember;
      if (editMode && selectedMember) {
        updated = members.map((m) => m.id === selectedMember.id ? newMember : m);
      } else {
        updated = [...members, newMember];
      }
    } finally {
      setMembers(updated);
      localStorage.setItem('yemenAfiya_family_members', JSON.stringify(updated));
      window.dispatchEvent(new Event('yemenAfiya_family_updated'));
      setIsSaving(false);
      setShowAddForm(false);
      setEditMode(false);
      setSelectedMember(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('family_members').delete().eq('id', id);
    } catch {}
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    localStorage.setItem('yemenAfiya_family_members', JSON.stringify(updated));
    window.dispatchEvent(new Event('yemenAfiya_family_updated'));
    setSelectedMember(null);
  };

  const resetForm = () => setForm({ name: '', relation: 'son', gender: 'male', blood_type: '', chronic_diseases: [], allergies: [], date_of_birth: '', notes: '' });

  const startEdit = (m: FamilyMember) => {
    setForm({ ...m });
    setEditMode(true);
    setShowAddForm(true);
    setSelectedMember(m);
  };

  // Detail Screen
  if (selectedMember && !showAddForm) {
    const RelIcon = getRelationIcon(selectedMember.relation);
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-gradient-to-b from-[#199A8E] to-[#1565C0] pt-3 pb-20 px-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={() => startEdit(selectedMember)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Edit2 size={17} className="text-white" />
              </button>
              <button onClick={() => handleDelete(selectedMember.id)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Trash2 size={17} className="text-white" />
              </button>
            </div>
            <h1 className="text-xl font-bold text-white">{selectedMember.name}</h1>
            <button onClick={() => setSelectedMember(null)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ChevronLeft size={22} className="text-white rotate-180" />
            </button>
          </div>
          <div className="mt-6 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <RelIcon size={36} className="text-white" />
            </div>
            <p className="text-white/80 text-sm">{getRelationLabel(selectedMember.relation)}</p>
            {selectedMember.date_of_birth && <p className="text-white/70 text-sm">{calcAge(selectedMember.date_of_birth)}</p>}
          </div>
        </div>

        <div className="px-4 -mt-10 relative z-30 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h3 className="font-bold text-gray-800 mb-3">المعلومات الأساسية</h3>
            <div className="grid grid-cols-2 gap-3">
              {selectedMember.blood_type && (
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">فصيلة الدم</p>
                  <p className="font-black text-red-600 text-xl">{selectedMember.blood_type}</p>
                </div>
              )}
              <div className="bg-[#E8F5F4] rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">الجنس</p>
                <p className="font-bold text-[#199A8E]">{selectedMember.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
              </div>
              {selectedMember.date_of_birth && (
                <div className="bg-gray-50 rounded-xl p-3 text-center col-span-2">
                  <p className="text-xs text-gray-500">تاريخ الميلاد</p>
                  <p className="font-bold text-gray-700">{new Date(selectedMember.date_of_birth).toLocaleDateString('ar-YE')} ({calcAge(selectedMember.date_of_birth)})</p>
                </div>
              )}
            </div>
          </div>

          {(selectedMember.chronic_diseases?.length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h3 className="font-bold text-gray-800 mb-3">الأمراض المزمنة</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMember.chronic_diseases!.map((d, i) => (
                  <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-xl text-sm font-medium">{d}</span>
                ))}
              </div>
            </div>
          )}

          {(selectedMember.allergies?.length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h3 className="font-bold text-gray-800 mb-3">الحساسية</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMember.allergies!.map((a, i) => (
                  <span key={i} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-sm font-medium">{a}</span>
                ))}
              </div>
            </div>
          )}

          {selectedMember.notes && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-sm text-amber-700">{selectedMember.notes}</p>
            </div>
          )}

          <button
            onClick={() => onBookForMember?.(selectedMember)}
            className="w-full bg-[#199A8E] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <Calendar size={18} />
            حجز موعد لـ {selectedMember.name}
          </button>
        </div>
      </div>
    );
  }

  // Add / Edit Form
  if (showAddForm) {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-gradient-to-b from-[#199A8E] to-[#1565C0] pt-3 pb-6 px-4">
          <div className="flex items-center justify-between">
            <button onClick={() => { setShowAddForm(false); setEditMode(false); resetForm(); }} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <X size={20} className="text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">{editMode ? 'تعديل الفرد' : 'إضافة فرد'}</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-4 pt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">الاسم *</label>
            <input type="text" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3.5 rounded-xl border border-gray-200 outline-none text-right" placeholder="الاسم الكامل" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">صلة القرابة *</label>
            <div className="grid grid-cols-4 gap-2">
              {relations.map(({ id, label }) => (
                <button key={id} onClick={() => setForm({ ...form, relation: id })} className={`py-2.5 rounded-xl text-xs font-medium transition-all ${form.relation === id ? 'bg-[#199A8E] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">الجنس</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: 'male', label: 'ذكر' }, { id: 'female', label: 'أنثى' }].map(({ id, label }) => (
                  <button key={id} onClick={() => setForm({ ...form, gender: id as any })} className={`py-2.5 rounded-xl text-sm font-bold ${form.gender === id ? 'bg-[#199A8E] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">فصيلة الدم</label>
              <select value={form.blood_type || ''} onChange={(e) => setForm({ ...form, blood_type: e.target.value })} className="w-full p-3.5 rounded-xl border border-gray-200 outline-none bg-white">
                <option value="">اختر</option>
                {bloodTypes.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">تاريخ الميلاد</label>
            <input type="date" value={form.date_of_birth || ''} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="w-full p-3.5 rounded-xl border border-gray-200 outline-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">الأمراض المزمنة</label>
            <div className="flex gap-2 mb-2">
              <button onClick={() => { if (diseaseInput.trim()) { setForm({ ...form, chronic_diseases: [...(form.chronic_diseases || []), diseaseInput.trim()] }); setDiseaseInput(''); } }} className="bg-[#199A8E] text-white px-3 py-2 rounded-xl text-sm font-bold">إضافة</button>
              <input type="text" value={diseaseInput} onChange={(e) => setDiseaseInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && diseaseInput.trim() && (setForm({ ...form, chronic_diseases: [...(form.chronic_diseases || []), diseaseInput.trim()] }), setDiseaseInput(''))} className="flex-1 p-2.5 rounded-xl border border-gray-200 outline-none text-right text-sm" placeholder="مثل: سكري، ضغط..." />
            </div>
            <div className="flex flex-wrap gap-2">
              {form.chronic_diseases?.map((d, i) => (
                <span key={i} className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-xl text-sm flex items-center gap-1">
                  {d}
                  <button onClick={() => setForm({ ...form, chronic_diseases: form.chronic_diseases!.filter((_, j) => j !== i) })}><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">الحساسية</label>
            <div className="flex gap-2 mb-2">
              <button onClick={() => { if (allergyInput.trim()) { setForm({ ...form, allergies: [...(form.allergies || []), allergyInput.trim()] }); setAllergyInput(''); } }} className="bg-[#199A8E] text-white px-3 py-2 rounded-xl text-sm font-bold">إضافة</button>
              <input type="text" value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && allergyInput.trim() && (setForm({ ...form, allergies: [...(form.allergies || []), allergyInput.trim()] }), setAllergyInput(''))} className="flex-1 p-2.5 rounded-xl border border-gray-200 outline-none text-right text-sm" placeholder="مثل: بنسلين، فول سوداني..." />
            </div>
            <div className="flex flex-wrap gap-2">
              {form.allergies?.map((a, i) => (
                <span key={i} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-sm flex items-center gap-1">
                  {a}
                  <button onClick={() => setForm({ ...form, allergies: form.allergies!.filter((_, j) => j !== i) })}><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">ملاحظات</label>
            <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full p-3.5 rounded-xl border border-gray-200 resize-none text-right" placeholder="أي معلومات إضافية..." />
          </div>

          <button onClick={handleSave} disabled={!form.name || !form.relation || isSaving} className={`w-full py-4 rounded-2xl font-bold text-lg ${form.name && form.relation ? 'bg-[#199A8E] text-white' : 'bg-gray-200 text-gray-400'}`}>
            {isSaving ? 'جاري الحفظ...' : editMode ? 'حفظ التعديلات' : 'إضافة الفرد'}
          </button>
        </div>
      </div>
    );
  }

  // Main List
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gradient-to-b from-[#199A8E] to-[#1565C0] pt-3 pb-20 px-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { setShowAddForm(true); resetForm(); setEditMode(false); }} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Plus size={22} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">أفراد العائلة</h1>
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={22} className="text-white rotate-180" />
          </button>
        </div>

        <div className="bg-white/20 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Heart size={28} className="text-white" />
          </div>
          <div className="text-right">
            <p className="font-bold text-white">إدارة صحة عائلتك</p>
            <p className="text-white/70 text-sm">احجز مواعيد وتابع صحة أفراد عائلتك</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-30">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#199A8E]" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16">
            <UserPlus size={56} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium mb-2">لا يوجد أفراد عائلة مضافين</p>
            <button onClick={() => { setShowAddForm(true); resetForm(); }} className="mt-4 bg-[#199A8E] text-white px-6 py-3 rounded-2xl font-bold">
              إضافة فرد الآن
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const RelIcon = getRelationIcon(member.relation);
              return (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-13 w-[52px] h-[52px] bg-[#E8F5F4] rounded-xl flex items-center justify-center flex-shrink-0">
                      <RelIcon size={24} className="text-[#199A8E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800">{member.name}</h3>
                      <p className="text-sm text-gray-500">{getRelationLabel(member.relation)}{member.date_of_birth && ` • ${calcAge(member.date_of_birth)}`}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-end">
                        {member.blood_type && <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{member.blood_type}</span>}
                        {member.chronic_diseases?.map((d, i) => (
                          <span key={i} className="bg-orange-50 text-orange-600 text-xs px-2 py-0.5 rounded-full">{d}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
            <button
              onClick={() => { setShowAddForm(true); resetForm(); setEditMode(false); }}
              className="w-full border-2 border-dashed border-[#199A8E]/30 rounded-2xl py-4 flex items-center justify-center gap-2 text-[#199A8E] font-medium"
            >
              <Plus size={18} />
              إضافة فرد جديد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
