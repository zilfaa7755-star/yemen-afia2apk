import React, { useState, useEffect } from 'react';
import {
  Search,
  Pill,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Baby,
  User,
  UserCog,
  ShieldCheck,
  XCircle,
  ChevronLeft,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { supabase } from '../lib/supabase';
import type { Medication } from '../types';

interface MedicationGuidePageProps {
  onBack?: () => void;
}

export function MedicationGuidePage({ onBack }: MedicationGuidePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMedications();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredMedications(
        medications.filter(
          (m) =>
            m.name_ar.includes(searchQuery) ||
            m.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.generic_name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredMedications(medications);
    }
  }, [searchQuery, medications]);

  const loadMedications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('medications').select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        setMedications(data as Medication[]);
        setFilteredMedications(data as Medication[]);
      } else {
        const demoMeds = getDemoMedications();
        setMedications(demoMeds);
        setFilteredMedications(demoMeds);
      }
    } catch (error) {
      console.error('Error loading medications:', error);
      const demoMeds = getDemoMedications();
      setMedications(demoMeds);
      setFilteredMedications(demoMeds);
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoMedications = (): Medication[] => [
    {
      id: '1',
      name_ar: 'باراسيتامول',
      name_en: 'Paracetamol',
      generic_name: 'Acetaminophen',
      description: 'مسكن للألم وخافض للحرارة',
      indications: ['حمى', 'ألم خفيف إلى متوسط', 'صداع', 'ألم الأسنان', 'آلام العضلات'],
      contraindications: ['قصور الكبد الحاد', 'فرط الحساسية للباراسيتامول'],
      side_effects: ['غثيان', 'طفح جلدي', 'ندرة: مشاكل كبدية'],
      dosage_adult: '500-1000 مجم كل 4-6 ساعات (حد أقصى 4 جم يومياً)',
      dosage_pediatric: '10-15 مجم/كجم كل 4-6 ساعات',
      dosage_elderly: 'تقليل الجرعة مع مراقبة الوظائف الكبدية',
      pregnancy_safe: true,
      breastfeeding_safe: true,
      controlled: false,
      requires_prescription: false,
    },
    {
      id: '2',
      name_ar: 'أموكسيسيلين',
      name_en: 'Amoxicillin',
      generic_name: 'Amoxicillin',
      description: 'مضاد حيوي من مجموعة البنسلين',
      indications: ['التهابات الجهاز التنفسي', 'التهاب الأذن الوسطى', 'التهاب الحلق', 'التهابات المسالك البولية'],
      contraindications: ['حساسية البنسلين', 'حساسية السيفالوسبورينات'],
      side_effects: ['إسهال', 'غثيان', 'طفح جلدي', 'تفاعلات تحسسية'],
      dosage_adult: '250-500 مجم كل 8 ساعات',
      dosage_pediatric: '20-40 مجم/كجم/يوم مقسمة على 3 جرعات',
      drug_interactions: ['نمط منع الحمل الفموي'],
      pregnancy_safe: true,
      breastfeeding_safe: true,
      controlled: false,
      requires_prescription: true,
    },
    {
      id: '3',
      name_ar: 'إيبوبروفين',
      name_en: 'Ibuprofen',
      generic_name: 'Ibuprofen',
      description: 'مضاد التهاب غير ستيرويدي (NSAID)',
      indications: ['ألم', 'التهاب', 'حمى', 'آلام المفاصل', 'صداع نصفي'],
      contraindications: ['قرحة المعدة النشطة', 'قصور الكلى', 'الحمل (الثالث)'],
      side_effects: ['اضطرابات معدية', 'نزيف معدي', 'اختلال وظائف كلى'],
      dosage_adult: '200-400 مجم كل 6-8 ساعات',
      dosage_pediatric: '20 مجم/كجم/يوم مقسمة على 3-4 جرعات',
      drug_interactions: ['أسبرين', 'مميعات الدم', 'مدرات البول'],
      pregnancy_safe: false,
      breastfeeding_safe: true,
      controlled: false,
      requires_prescription: false,
    },
    {
      id: '4',
      name_ar: 'ميتفورمين',
      name_en: 'Metformin',
      generic_name: 'Metformin',
      description: 'دواء مضاد للسكر النوع 2',
      indications: ['داء السكري النوع 2', 'مقاومة الأنسولين', 'متلازمة المبيض متعدد الكيسات'],
      contraindications: ['قصور الكلى الحاد', 'الحماض اللبني', 'استخدام المواد الظليلة'],
      side_effects: ['اضطرابات هضمية', 'نقص فيتامين B12', 'طعم معدني'],
      dosage_adult: '500 مجم مرتين يومياً (حد أقصى 2550 مجم)',
      drug_interactions: ['كحول', 'سيمنتدين'],
      pregnancy_safe: false,
      breastfeeding_safe: false,
      controlled: false,
      requires_prescription: true,
    },
    {
      id: '5',
      name_ar: 'أملوديبين',
      name_en: 'Amlodipine',
      generic_name: 'Amlodipine',
      description: 'دواء من مجموعة حاصرات قنوات الكالسيوم لارتفاع ضغط الدم',
      indications: ['ارتفاع ضغط الدم', 'الذبحة الصدرية المستقرة'],
      contraindications: ['صدمة قلبية', 'اضطرابات شديدة بالصمام الأبهري'],
      side_effects: ['وذمة الكاحل', 'صداع', 'احمرار الوجه', 'دوخة'],
      dosage_adult: '5-10 مجم مرة واحدة يومياً',
      dosage_elderly: 'البدء بـ 2.5 مجم يومياً',
      drug_interactions: ['عصير الجريب فروت', 'سيمفاستاتين'],
      pregnancy_safe: false,
      breastfeeding_safe: false,
      controlled: false,
      requires_prescription: true,
    },
  ];

  if (selectedMedication) {
    return (
      <div className="page-container bg-gray-50">
        <Header title={selectedMedication.name_ar} showBack onBack={() => setSelectedMedication(null)} />

        <div className="px-4 pt-4">
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
                <Pill size={32} className="text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{selectedMedication.name_ar}</h1>
                <p className="text-primary-600 font-medium">{selectedMedication.name_en}</p>
                {selectedMedication.generic_name && (
                  <p className="text-sm text-gray-500 mt-1">{selectedMedication.generic_name}</p>
                )}
                {selectedMedication.requires_prescription && (
                  <span className="inline-block mt-2 px-3 py-1 bg-warning-50 text-warning-700 text-xs rounded-full">
                    يحتاج وصفة طبية
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 mt-4">{selectedMedication.description}</p>
          </div>

          {/* Indications */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
            <h3 className="font-bold text-gray-800 mb-3">دواعي الاستعمال</h3>
            <div className="space-y-2">
              {selectedMedication.indications?.map((indication, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-gray-600">{indication}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contraindications */}
          {selectedMedication.contraindications && selectedMedication.contraindications.length > 0 && (
            <div className="bg-error-50 rounded-2xl p-5 mb-4 border border-error-100">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={20} className="text-error-600" />
                <h3 className="font-bold text-error-700">موانع الاستعمال</h3>
              </div>
              <div className="space-y-2">
                {selectedMedication.contraindications.map((contraindication, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <XCircle size={16} className="text-error-500" />
                    <span className="text-error-700">{contraindication}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Side Effects */}
          {selectedMedication.side_effects && selectedMedication.side_effects.length > 0 && (
            <div className="bg-warning-50 rounded-2xl p-5 mb-4 border border-warning-100">
              <div className="flex items-center gap-2 mb-3">
                <Info size={20} className="text-warning-600" />
                <h3 className="font-bold text-warning-700">الأعراض الجانبية</h3>
              </div>
              <div className="space-y-2">
                {selectedMedication.side_effects.map((effect, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                    <span className="text-warning-700">{effect}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dosage */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
            <h3 className="font-bold text-gray-800 mb-4">الجرعات</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-accent-50 rounded-xl p-4 text-center">
                <User size={24} className="mx-auto text-accent-600 mb-2" />
                <p className="text-xs text-gray-500 mb-1">البالغين</p>
                <p className="text-sm font-medium text-gray-800">{selectedMedication.dosage_adult}</p>
              </div>
              {selectedMedication.dosage_pediatric && (
                <div className="bg-secondary-50 rounded-xl p-4 text-center">
                  <Baby size={24} className="mx-auto text-secondary-600 mb-2" />
                  <p className="text-xs text-gray-500 mb-1">الأطفال</p>
                  <p className="text-sm font-medium text-gray-800 text-xs">{selectedMedication.dosage_pediatric}</p>
                </div>
              )}
              {selectedMedication.dosage_elderly && (
                <div className="bg-primary-50 rounded-xl p-4 text-center">
                  <UserCog size={24} className="mx-auto text-primary-600 mb-2" />
                  <p className="text-xs text-gray-500 mb-1">كبار السن</p>
                  <p className="text-sm font-medium text-gray-800 text-xs">{selectedMedication.dosage_elderly}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pregnancy & Breastfeeding */}
          <div className="bg-white rounded-2xl shadow-soft p-5 mb-4">
            <h3 className="font-bold text-gray-800 mb-3">الحمل والرضاعة</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-xl p-4 ${selectedMedication.pregnancy_safe ? 'bg-success-50' : 'bg-error-50'}`}>
                <div className="flex items-center gap-2">
                  {selectedMedication.pregnancy_safe ? (
                    <ShieldCheck size={20} className="text-success-600" />
                  ) : (
                    <XCircle size={20} className="text-error-600" />
                  )}
                  <span className={selectedMedication.pregnancy_safe ? 'text-success-700' : 'text-error-700'}>
                    الحمل: {selectedMedication.pregnancy_safe ? 'آمن' : 'غير آمن'}
                  </span>
                </div>
              </div>
              <div className={`rounded-xl p-4 ${selectedMedication.breastfeeding_safe ? 'bg-success-50' : 'bg-error-50'}`}>
                <div className="flex items-center gap-2">
                  {selectedMedication.breastfeeding_safe ? (
                    <ShieldCheck size={20} className="text-success-600" />
                  ) : (
                    <XCircle size={20} className="text-error-600" />
                  )}
                  <span className={selectedMedication.breastfeeding_safe ? 'text-success-700' : 'text-error-700'}>
                    الرضاعة: {selectedMedication.breastfeeding_safe ? 'آمن' : 'غير آمن'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-100 rounded-2xl p-4 mb-24">
            <p className="text-xs text-gray-500 text-center">
              هذه المعلومات للاستخدام المرجعي فقط. استشر طبيبك أو الصيدلي قبل استخدام أي دواء.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50">
      <Header title="المرشد الصيدلي" showBack onBack={onBack} />

      <div className="px-4 pt-4">
        {/* Search */}
        <div className="relative mb-6">
          <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الدواء..."
            className="w-full pr-12 pl-4 py-4 bg-white rounded-2xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
          />
        </div>

        {/* Medications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredMedications.length === 0 ? (
          <div className="text-center py-12">
            <Pill size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">لم يتم العثور على نتائج</p>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {filteredMedications.map((medication) => (
              <button
                key={medication.id}
                onClick={() => setSelectedMedication(medication)}
                className="w-full bg-white rounded-2xl shadow-soft p-4 border border-gray-100 card-hover text-right"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Pill size={24} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{medication.name_ar}</h3>
                    <p className="text-sm text-primary-600">{medication.name_en}</p>
                    <p className="text-xs text-gray-500 mt-1">{medication.description}</p>
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
