import React, { useState, useEffect } from 'react';
import {
  Bell,
  Pill,
  Clock,
  Plus,
  ChevronLeft,
  Check,
  Trash2,
  Edit2,
  Calendar,
  Repeat,
  AlertCircle,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { supabase } from '../lib/supabase';
import type { MedicationReminder } from '../types';

interface MedicationRemindersPageProps {
  onBack?: () => void;
}

const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function MedicationRemindersPage({ onBack }: MedicationRemindersPageProps) {
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    medication_name: '',
    dosage: '',
    frequency: 'يومياً',
    times: ['08:00'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    notes: '',
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('medication_reminders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setReminders(data as MedicationReminder[]);
      } else {
        setReminders(getDemoReminders());
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
      setReminders(getDemoReminders());
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoReminders = (): MedicationReminder[] => [
    {
      id: '1',
      patient_id: 'demo',
      medication_name: 'أملوديبين 5 مجم',
      dosage: 'قرص واحد',
      frequency: 'يومياً',
      times: ['08:00'],
      start_date: '2024-01-01',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      notes: 'بعد الإفطار',
      is_active: true,
    },
    {
      id: '2',
      patient_id: 'demo',
      medication_name: 'ميتفورمين 500 مجم',
      dosage: 'قرص واحد',
      frequency: 'مرتين يومياً',
      times: ['09:00', '21:00'],
      start_date: '2024-01-01',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      notes: 'مع الأكل',
      is_active: true,
    },
    {
      id: '3',
      patient_id: 'demo',
      medication_name: 'فيتامين D',
      dosage: 'نصف قرص',
      frequency: 'مرة واحدة أسبوعياً',
      times: ['08:00'],
      start_date: '2024-01-01',
      days_of_week: [0],
      is_active: true,
    },
  ];

  const toggleReminder = async (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const addReminder = () => {
    const reminder: MedicationReminder = {
      id: Date.now().toString(),
      patient_id: 'demo',
      ...newReminder,
      is_active: true,
    };
    setReminders((prev) => [reminder, ...prev]);
    setShowAddForm(false);
    setNewReminder({
      medication_name: '',
      dosage: '',
      frequency: 'يومياً',
      times: ['08:00'],
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      notes: '',
    });
  };

  const toggleDay = (dayIndex: number) => {
    setNewReminder((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayIndex)
        ? prev.days_of_week.filter((d) => d !== dayIndex)
        : [...prev.days_of_week, dayIndex].sort(),
    }));
  };

  const addTime = () => {
    setNewReminder((prev) => ({
      ...prev,
      times: [...prev.times, '12:00'],
    }));
  };

  const updateTime = (index: number, time: string) => {
    setNewReminder((prev) => ({
      ...prev,
      times: prev.times.map((t, i) => (i === index ? time : t)),
    }));
  };

  const removeTime = (index: number) => {
    setNewReminder((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }));
  };

  if (showAddForm) {
    return (
      <div className="page-container bg-gray-50">
        <Header title="إضافة تذكير جديد" showBack onBack={() => setShowAddForm(false)} />

        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <Pill size={24} className="text-primary-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-500 mb-1">اسم الدواء</label>
                <input
                  type="text"
                  value={newReminder.medication_name}
                  onChange={(e) => setNewReminder((prev) => ({ ...prev, medication_name: e.target.value }))}
                  placeholder="مثال: باراسيتامول 500 مجم"
                  className="w-full text-gray-800 font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dosage */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
            <label className="block text-sm text-gray-500 mb-2">الجرعة</label>
            <input
              type="text"
              value={newReminder.dosage}
              onChange={(e) => setNewReminder((prev) => ({ ...prev, dosage: e.target.value }))}
              placeholder="مثال: قرص واحد"
              className="input-field"
            />
          </div>

          {/* Frequency */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
            <label className="block text-sm text-gray-500 mb-3">التكرار</label>
            <div className="flex flex-wrap gap-2">
              {['يومياً', 'مرتين يومياً', 'ثلاث مرات يومياً', 'مرة أسبوعياً'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setNewReminder((prev) => ({ ...prev, frequency: freq }))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    newReminder.frequency === freq
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Times */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-gray-500">أوقات الجرعات</label>
              <button
                onClick={addTime}
                className="text-primary-600 text-sm font-medium flex items-center gap-1"
              >
                <Plus size={16} />
                إضافة وقت
              </button>
            </div>
            <div className="space-y-2">
              {newReminder.times.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(index, e.target.value)}
                    className="input-field"
                  />
                  {newReminder.times.length > 1 && (
                    <button
                      onClick={() => removeTime(index)}
                      className="p-2 text-gray-400 hover:text-error-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Days */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
            <label className="block text-sm text-gray-500 mb-3">أيام الأسبوع</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day, index) => (
                <button
                  key={day}
                  onClick={() => toggleDay(index)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    newReminder.days_of_week.includes(index)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
            <label className="block text-sm text-gray-500 mb-3">فترة التذكير</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">تاريخ البدء</p>
                <input
                  type="date"
                  value={newReminder.start_date}
                  onChange={(e) => setNewReminder((prev) => ({ ...prev, start_date: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">تاريخ الانتهاء (اختياري)</p>
                <input
                  type="date"
                  value={newReminder.end_date}
                  onChange={(e) => setNewReminder((prev) => ({ ...prev, end_date: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-6">
            <label className="block text-sm text-gray-500 mb-2">ملاحظات</label>
            <textarea
              value={newReminder.notes}
              onChange={(e) => setNewReminder((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="مثال: بعد الأكل"
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <button
            onClick={addReminder}
            disabled={!newReminder.medication_name || !newReminder.dosage}
            className={`w-full py-4 rounded-2xl font-bold text-lg mb-24 ${
              newReminder.medication_name && newReminder.dosage
                ? 'btn-primary'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            إضافة التذكير
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50">
      <Header title="التذكير الدوائي" showBack onBack={onBack} />

      <div className="px-4 pt-4">
        {/* Add Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mb-6 py-4 rounded-2xl border-2 border-dashed border-primary-300 text-primary-600 font-medium flex items-center justify-center gap-2 hover:bg-primary-50 transition-colors"
        >
          <Plus size={20} />
          إضافة دواء جديد
        </button>

        {/* Active Reminders */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">لا توجد تذكيرات</p>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`bg-white rounded-2xl shadow-soft overflow-hidden border transition-all ${
                  reminder.is_active ? 'border-primary-200' : 'border-gray-100 opacity-60'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      reminder.is_active ? 'bg-primary-50' : 'bg-gray-100'
                    }`}>
                      <Pill size={24} className={reminder.is_active ? 'text-primary-600' : 'text-gray-400'} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{reminder.medication_name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{reminder.dosage} - {reminder.frequency}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {reminder.times.map((time, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full flex items-center gap-1">
                            <Clock size={12} />
                            {time}
                          </span>
                        ))}
                      </div>
                      {reminder.notes && (
                        <p className="text-xs text-gray-400 mt-2">{reminder.notes}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => toggleReminder(reminder.id)}
                        className={`w-12 h-7 rounded-full transition-colors ${
                          reminder.is_active ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            reminder.is_active ? 'translate-x-1' : 'translate-x-6'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
