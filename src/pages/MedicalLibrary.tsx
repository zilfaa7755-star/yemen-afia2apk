import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, FileText, TrendingUp, Award, Stethoscope,
  ChevronLeft, Clock, Eye, Heart, Tag, ExternalLink, Filter,
  Activity, FlaskConical, Pill, Brain, Baby, Shield, Plus, X,
  CheckCircle, Users2, Lightbulb,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface LibraryItem {
  id: string;
  title: string;
  author?: string;
  category: 'reference' | 'guideline' | 'update' | 'research' | 'case_study' | 'drug_info';
  specialization?: string;
  specialization_id?: string;
  summary: string;
  content?: string;
  source_url?: string;
  image_url?: string;
  published_date?: string;
  tags?: string[];
  views: number;
  likes: number;
  is_featured?: boolean;
  created_at: string;
}

interface SharedCase {
  id: string;
  doctor_name: string;
  doctor_specialization?: string;
  title: string;
  case_summary: string;
  diagnosis?: string;
  treatment?: string;
  outcome?: string;
  lessons_learned?: string;
  tags?: string[];
  views: number;
  likes: number;
  created_at: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; cls: string; icon: any }> = {
  reference: { label: 'مرجع طبي', cls: 'bg-blue-50 text-blue-700', icon: BookOpen },
  guideline: { label: 'دليل إرشادي', cls: 'bg-teal-50 text-teal-700', icon: Shield },
  update: { label: 'تحديث طبي', cls: 'bg-amber-50 text-amber-700', icon: TrendingUp },
  research: { label: 'بحث علمي', cls: 'bg-purple-50 text-purple-700', icon: FlaskConical },
  case_study: { label: 'دراسة حالة', cls: 'bg-rose-50 text-rose-700', icon: Stethoscope },
  drug_info: { label: 'معلومات دوائية', cls: 'bg-green-50 text-green-700', icon: Pill },
};

const SPECIALIZATIONS = [
  { id: 'all', label: 'الكل' },
  { id: '1', label: 'باطنية عامة' },
  { id: '2', label: 'قلب وأوعية' },
  { id: '3', label: 'مخ وأعصاب' },
  { id: '4', label: 'أطفال' },
  { id: '5', label: 'جلدية' },
  { id: '6', label: 'عظام' },
];

const DEMO_LIBRARY: LibraryItem[] = [
  {
    id: 'l1', title: 'دليل علاج السكري النوع الثاني 2025', author: 'الجمعية الأمريكية لمرض السكري',
    category: 'guideline', specialization: 'باطنية عامة', summary: 'تحديث شامل على بروتوكولات علاج السكري النوع الثاني، يشمل الأدوية الجديدة من فئة SGLT2 و GLP-1.',
    source_url: 'https://diabetesjournals.org', published_date: '2025-01-15',
    tags: ['سكري', 'دليل إرشادي', 'SGLT2', 'GLP-1'], views: 342, likes: 28, is_featured: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'l2', title: 'تحديث: معايير تشخيص احتشاء القلب الحاد', author: 'الجمعية الأوروبية لأمراض القلب',
    category: 'update', specialization: 'قلب وأوعية', summary: 'معايير جديدة لتشخيص احتشاء القلب باستخدام تروبونين عالي الحساسية، مع توصيات للقسطرة الطارئة.',
    published_date: '2025-02-01',
    tags: ['قلب', 'تروبونين', 'STEMI', 'قسطرة'], views: 218, likes: 19, is_featured: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'l3', title: 'بروتوكول علاج الصداع النصبي المزمن', author: 'الجمعية الدولية للصداع',
    category: 'guideline', specialization: 'مخ وأعصاب', summary: 'دليل شامل لتصنيف الصداع النصبي واختيار العلاج الوقائي والطارئ.',
    published_date: '2024-11-20',
    tags: ['صداع نصفي', 'بروتوكول', 'علاج وقائي'], views: 156, likes: 12,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'l4', title: 'مرجع: أمراض الأطفال الشائعة - الطبعة الخامسة', author: 'د. نيلسون',
    category: 'reference', specialization: 'أطفال', summary: 'المرجع الأساسي في طب الأطفال، يغطي التشخيص والعلاج لأكثر من 500 مرض.',
    tags: ['أطفال', 'مرجع', 'نيلسون'], views: 489, likes: 45, is_featured: true,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'l5', title: 'بحث: فعالية الأجسام المضادة في علاج كاواساكي', author: 'مجلة لانسيت',
    category: 'research', specialization: 'أطفال', summary: 'دراسة سريرية مقارنة بين بروتوكولات الغلوبيولين المناعي في علاج مرض كاواساكي لدى الأطفال.',
    published_date: '2025-01-30',
    tags: ['كاواساكي', 'أجسام مضادة', 'أطفال'], views: 92, likes: 8,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'l6', title: 'تحديث: استخدام GLP-1 في علاج السمنة', author: 'FDA',
    category: 'drug_info', specialization: 'باطنية عامة', summary: 'معلومات محدثة عن الأدوية الجديدة مثل Semaglutide و Tirzepatide في علاج السمنة والسكري.',
    published_date: '2025-02-10',
    tags: ['GLP-1', 'سمنة', 'Semaglutide'], views: 612, likes: 52, is_featured: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'l7', title: 'دليل الإنعاش القلبي الرئوي ACLS 2025', author: 'الجمعية الأمريكية للقلب',
    category: 'guideline', specialization: 'باطنية عامة', summary: 'بروتوكولات محدثة للإنعاش القلبي الرئوي وإدارة السكتات القلبية.',
    published_date: '2025-01-05',
    tags: ['ACLS', 'إنعاش', 'طوارئ'], views: 387, likes: 34,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'l8', title: 'مرجع: طب الأعصاب السريري - آدامز', author: 'د. آدامز',
    category: 'reference', specialization: 'مخ وأعصاب', summary: 'المرجع الكلاسيكي في طب الأعصاب السريري، يشمل التشخيص التفريقي والعلاج.',
    tags: ['أعصاب', 'مرجع', 'آدامز'], views: 274, likes: 22,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

const DEMO_CASES: SharedCase[] = [
  {
    id: 'sc1', doctor_name: 'د. خالد الإرياني', doctor_specialization: 'أعصاب',
    title: 'حالة صرع مقاوم استجابت للكيتباباتين',
    case_summary: 'مريض 28 سنة يعاني من نوبات صرع جزئي 5-6 مرات أسبوعياً، لم يستجب لكاربامازيبين ولا لاموتريجين.',
    diagnosis: 'صرع جزئي مقاوم للأدوية', treatment: 'تم إضافة كيتباباتين 500mg مرتين يومياً',
    outcome: 'انخفضت النوبات إلى مرة واحدة أسبوعياً بعد 3 أسابيع',
    lessons_learned: 'الكيتباباتين خيار جيد للصرع الجزئي المقاوم، خاصة مع تأثيره المضاد للألم العصبي.',
    tags: ['صرع', 'كيتباباتين', 'حالة مقاومة'], views: 145, likes: 18,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'sc2', doctor_name: 'د. فاطمة الشامي', doctor_specialization: 'قلب',
    title: 'احتشاء أمامي حاد — قسطرة طارئة ناجحة',
    case_summary: 'مريض 55 سنة وصل بألم صدري مستمر 6 ساعات، تخطيط القلب أظهر ST elevation أمامي، تروبونين 8.5.',
    diagnosis: 'STEMI أمامي', treatment: 'قسطرة طارئة خلال 70 دقيقة من الوصول + ستنت دوائي',
    outcome: 'تدفق طبيعي TIMI 3، المريض خرج بعد 3 أيام بحالة مستقرة',
    lessons_learned: 'الوقت ذهبي — القسطرة خلال أول 90 دقيقة تنقذ عضلة القلب. التنسيق المسبق بين الطوارئ والقسطرة أساسي.',
    tags: ['STEMI', 'قسطرة', 'طوارئ'], views: 231, likes: 27,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'sc3', doctor_name: 'د. سمية الحوثي', doctor_specialization: 'أطفال',
    title: 'كاواساكي — التشخيص المبكر أنقذ الطفل',
    case_summary: 'طفل 6 سنوات، حمى 5 أيام + طفح جلدي + احمرار عينين + تضخم عقد لمفاوية. لم يستجب للمضادات الحيوية.',
    diagnosis: 'مرض كاواساكي', treatment: 'غلوبيولين مناعي وريدي 2g/kg + أسبرين بجرعة عالية',
    outcome: 'انخفضت الحمى خلال 24 ساعة، تخطيط القلب طبيعي بعد أسبوعين',
    lessons_learned: 'معرفة معايير كاواساكي الخمسة ضرورية — التأخير في العلاج قد يسبب أمهات الشرايين التاجية.',
    tags: ['كاواساكي', 'أطفال', 'تشخيص مبكر'], views: 178, likes: 21,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

export function MedicalLibrary() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'updates' | 'cases' | 'consult_results'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [sharedCases, setSharedCases] = useState<SharedCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [selectedCase, setSelectedCase] = useState<SharedCase | null>(null);
  const [showAddCase, setShowAddCase] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [libRes, casesRes] = await Promise.all([
        supabase.from('medical_library').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('shared_cases').select('*').order('created_at', { ascending: false }).limit(30),
      ]);
      setLibraryItems(libRes.data && libRes.data.length > 0 ? libRes.data as LibraryItem[] : DEMO_LIBRARY);
      setSharedCases(casesRes.data && casesRes.data.length > 0 ? casesRes.data as SharedCase[] : DEMO_CASES);
    } catch {
      setLibraryItems(DEMO_LIBRARY);
      setSharedCases(DEMO_CASES);
    } finally { setIsLoading(false); }
  };

  const filteredLibrary = libraryItems.filter(item => {
    const matchSearch = !searchQuery || item.title.includes(searchQuery) || item.summary.includes(searchQuery) || item.tags?.some(t => t.includes(searchQuery));
    const matchSpec = selectedSpec === 'all' || item.specialization_id === selectedSpec || item.specialization === SPECIALIZATIONS.find(s => s.id === selectedSpec)?.label;
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchSearch && matchSpec && matchCat;
  });

  const filteredCases = sharedCases.filter(c => {
    const matchSearch = !searchQuery || c.title.includes(searchQuery) || c.case_summary.includes(searchQuery) || c.tags?.some(t => t.includes(searchQuery));
    return matchSearch;
  });

  const latestUpdates = libraryItems.filter(i => i.category === 'update' || i.category === 'guideline').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Consultation results — resolved cases from case_consultations
  const [consultResults, setConsultResults] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('case_consultations').select('*').eq('status', 'resolved').order('created_at', { ascending: false }).limit(20);
        if (data && data.length > 0) setConsultResults(data);
        else setConsultResults(DEMO_CONSULT_RESULTS);
      } catch { setConsultResults(DEMO_CONSULT_RESULTS); }
    })();
  }, []);

  if (selectedItem) {
    const cat = CATEGORY_CONFIG[selectedItem.category] || CATEGORY_CONFIG.reference;
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 h-16">
            <button onClick={() => setSelectedItem(null)} className="text-sm text-gray-500 font-medium">عودة</button>
            <h1 className="text-base font-bold text-gray-800">تفاصيل المرجع</h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="px-4 pt-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3 justify-end">
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${cat.cls}`}>{cat.label}</span>
              <h2 className="font-black text-gray-800 text-lg text-right flex-1">{selectedItem.title}</h2>
            </div>
            {selectedItem.author && <p className="text-sm text-gray-500 text-right mb-3">بقلم: {selectedItem.author}</p>}
            {selectedItem.specialization && <p className="text-xs text-[#2196F3] font-medium text-right mb-3">{selectedItem.specialization}</p>}
            <p className="text-sm text-gray-700 leading-relaxed text-right">{selectedItem.summary}</p>
            {selectedItem.content && <p className="text-sm text-gray-600 leading-relaxed text-right mt-3">{selectedItem.content}</p>}
            {selectedItem.tags && selectedItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end mt-4">
                {selectedItem.tags.map((t, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg flex items-center gap-1"><Tag size={10} />{t}</span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={12} />{selectedItem.views}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Heart size={12} />{selectedItem.likes}</span>
              </div>
              {selectedItem.published_date && <span className="text-xs text-gray-400">{selectedItem.published_date}</span>}
            </div>
            {selectedItem.source_url && (
              <a href={selectedItem.source_url} target="_blank" rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2196F3] text-white font-bold text-sm">
                <ExternalLink size={16} />زيارة المصدر
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedCase) {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 h-16">
            <button onClick={() => setSelectedCase(null)} className="text-sm text-gray-500 font-medium">عودة</button>
            <h1 className="text-base font-bold text-gray-800">دراسة الحالة</h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="px-4 pt-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-black text-gray-800 text-lg text-right">{selectedCase.title}</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 justify-end">
              <span>{new Date(selectedCase.created_at).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' })}</span>
              <span>•</span>
              <span>{selectedCase.doctor_specialization}</span>
              <span>•</span>
              <span className="font-bold">{selectedCase.doctor_name}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 text-right font-medium">ملخص الحالة</p>
              <p className="text-sm text-gray-700 text-right leading-relaxed">{selectedCase.case_summary}</p>
            </div>
            {selectedCase.diagnosis && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-600 mb-1 text-right font-medium">التشخيص</p>
                <p className="text-sm text-gray-800 text-right font-bold">{selectedCase.diagnosis}</p>
              </div>
            )}
            {selectedCase.treatment && (
              <div>
                <p className="text-xs text-gray-500 mb-1 text-right font-medium">العلاج</p>
                <p className="text-sm text-gray-700 text-right">{selectedCase.treatment}</p>
              </div>
            )}
            {selectedCase.outcome && (
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-green-600 mb-1 text-right font-medium">النتيجة</p>
                <p className="text-sm text-gray-700 text-right">{selectedCase.outcome}</p>
              </div>
            )}
            {selectedCase.lessons_learned && (
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs text-amber-600 mb-1 text-right font-medium flex items-center gap-1 justify-end"><Lightbulb size={12} />الدروس المستفادة</p>
                <p className="text-sm text-gray-700 text-right">{selectedCase.lessons_learned}</p>
              </div>
            )}
            {selectedCase.tags && selectedCase.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                {selectedCase.tags.map((t, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{t}</span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={12} />{selectedCase.views}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Heart size={12} />{selectedCase.likes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showAddCase) {
    return <AddCaseForm onClose={() => setShowAddCase(false)} onSaved={() => { setShowAddCase(false); loadData(); }} doctorName={user?.full_name || 'د. أحمد المقطري'} />;
  }

  const tabs = [
    { id: 'library', label: 'المكتبة', icon: BookOpen },
    { id: 'updates', label: 'آخر التحديثات', icon: TrendingUp },
    { id: 'cases', label: 'حالات تعليمية', icon: Stethoscope },
    { id: 'consult_results', label: 'نتائج الاستشارات', icon: CheckCircle },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#2C7BE5] to-[#1565C0] rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <BookOpen size={24} className="text-white" />
          </div>
          <div className="flex-1 text-right">
            <h3 className="font-bold text-white">المكتبة الطبية</h3>
            <p className="text-white/70 text-xs mt-0.5">المراجع، التحديثات، والحالات التعليمية</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all ${activeTab === id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl flex items-center px-4 py-3 gap-3 border border-gray-100">
        <Search size={18} className="text-gray-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث في المكتبة..." className="flex-1 text-gray-700 placeholder-gray-400 outline-none text-sm" />
      </div>

      {/* Filters */}
      {activeTab === 'library' && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${selectedCategory === 'all' ? 'bg-[#2196F3] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>الكل</button>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setSelectedCategory(key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${selectedCategory === key ? 'bg-[#2196F3] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>{cfg.label}</button>
          ))}
        </div>
      )}

      {activeTab !== 'library' && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {SPECIALIZATIONS.map(s => (
            <button key={s.id} onClick={() => setSelectedSpec(s.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${selectedSpec === s.id ? 'bg-[#2196F3] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>{s.label}</button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2196F3]" /></div>
      ) : activeTab === 'library' ? (
        <div className="space-y-3">
          {filteredLibrary.map(item => {
            const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.reference;
            const Icon = cat.icon;
            return (
              <button key={item.id} onClick={() => setSelectedItem(item)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-right">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.cls}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${cat.cls}`}>{cat.label}</span>
                      {item.is_featured && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center gap-1"><Award size={10} />مميز</span>}
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm text-right">{item.title}</h3>
                    {item.author && <p className="text-xs text-gray-500 text-right mt-0.5">{item.author}</p>}
                    <p className="text-xs text-gray-400 text-right mt-1 line-clamp-2">{item.summary}</p>
                    <div className="flex items-center gap-3 mt-2 justify-end">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={11} />{item.views}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Heart size={11} />{item.likes}</span>
                      {item.specialization && <span className="text-xs text-[#2196F3] font-medium">{item.specialization}</span>}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : activeTab === 'updates' ? (
        <div className="space-y-3">
          {latestUpdates.map(item => {
            const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.update;
            return (
              <button key={item.id} onClick={() => setSelectedItem(item)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-right">
                <div className="flex items-center gap-2 mb-2 justify-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${cat.cls}`}>{cat.label}</span>
                  <span className="text-xs text-gray-400">{item.published_date}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-sm text-right">{item.title}</h3>
                <p className="text-xs text-gray-400 text-right mt-1 line-clamp-2">{item.summary}</p>
                {item.specialization && <p className="text-xs text-[#2196F3] font-medium text-right mt-2">{item.specialization}</p>}
              </button>
            );
          })}
        </div>
      ) : activeTab === 'cases' ? (
        <>
          <button onClick={() => setShowAddCase(true)}
            className="w-full bg-[#2196F3] text-white rounded-2xl py-3.5 font-bold flex items-center justify-center gap-2 shadow-lg">
            <Plus size={18} />مشاركة حالة تعليمية
          </button>
          <div className="space-y-3">
            {filteredCases.map(c => (
              <button key={c.id} onClick={() => setSelectedCase(c)}
                className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-right">
                <h3 className="font-bold text-gray-800 text-sm text-right">{c.title}</h3>
                <p className="text-xs text-gray-400 text-right mt-1 line-clamp-2">{c.case_summary}</p>
                <div className="flex items-center gap-2 mt-2 justify-end">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={11} />{c.views}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Heart size={11} />{c.likes}</span>
                  <span className="text-xs text-gray-500">• {c.doctor_name}</span>
                  {c.doctor_specialization && <span className="text-xs text-[#2196F3] font-medium">{c.doctor_specialization}</span>}
                </div>
                {c.tags && c.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 justify-end">
                    {c.tags.map((t, i) => <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">{t}</span>)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      ) : activeTab === 'consult_results' ? (
        <div className="space-y-3">
          {consultResults.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <CheckCircle size={40} className="mx-auto text-gray-200 mb-2" />
              <p className="text-gray-400 text-sm">لا توجد استشارات محلولة بعد</p>
            </div>
          ) : consultResults.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2 justify-end">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold flex items-center gap-1"><CheckCircle size={10} />محلولة</span>
                <h3 className="font-bold text-gray-800 text-sm text-right flex-1">{c.chief_complaint}</h3>
              </div>
              <p className="text-xs text-gray-500 text-right">{c.current_diagnosis}</p>
              {c.resolved_diagnosis && (
                <div className="bg-green-50 rounded-xl p-2.5 mt-2">
                  <p className="text-xs text-green-700 text-right font-bold">التشخيص النهائي: {c.resolved_diagnosis}</p>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2 justify-end">
                <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('ar-YE', { day: 'numeric', month: 'short' })}</span>
                <span className="text-xs text-gray-500">• {c.doctor_name}</span>
                {c.specialization_name && <span className="text-xs text-[#2196F3] font-medium">{c.specialization_name}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const DEMO_CONSULT_RESULTS = [
  {
    id: 'cr1', doctor_name: 'د. فاطمة الشامي', specialization_name: 'قلب',
    chief_complaint: 'ألم صدري مستمر غير مستجيب للعلاج',
    current_diagnosis: 'احتشاء عضلة القلب الحاد (STEMI)',
    resolved_diagnosis: 'STEMI أمامي — تم تأكيد التشخيص والقسطرة الطارئة',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'cr2', doctor_name: 'د. سمية الحوثي', specialization_name: 'أطفال',
    chief_complaint: 'حمى مستمرة وطفح جلدي غير مستجيب للمضادات الحيوية',
    current_diagnosis: 'اشتباه مرض كاواساكي',
    resolved_diagnosis: 'مرض كاواساكي — تم البدء بالغلوبيولين المناعي بنجاح',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

// ─── Add Case Form ─────────────────────────────────────────────────────────────
function AddCaseForm({ onClose, onSaved, doctorName }: { onClose: () => void; onSaved: () => void; doctorName: string }) {
  const [title, setTitle] = useState('');
  const [caseSummary, setCaseSummary] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [outcome, setOutcome] = useState('');
  const [lessons, setLessons] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !caseSummary.trim()) return;
    setSaving(true);
    const payload = {
      doctor_id: 'demo-doctor', doctor_name: doctorName, doctor_specialization: 'باطنية عامة',
      title, case_summary: caseSummary, diagnosis, treatment, outcome, lessons_learned: lessons,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    try { await supabase.from('shared_cases').insert(payload); } catch {}
    setSaving(false); onSaved();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={onClose} className="text-sm text-gray-500 font-medium">إلغاء</button>
          <h1 className="text-base font-bold text-gray-800">مشاركة حالة تعليمية</h1>
          <div className="w-10" />
        </div>
      </div>
      <div className="px-4 pt-4 space-y-3">
        <div className="bg-blue-50 rounded-2xl p-3 mb-2">
          <p className="text-xs text-blue-700 text-right">شارك حالة تعليمية قد يستفيد منها زملاؤك الأطباء. سيتم عرضها في قسم الحالات التعليمية بالمكتبة الطبية.</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">عنوان الحالة *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} dir="rtl" placeholder="مثال: حالة صرع مقاوم استجابت للكيتباباتين"
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3]" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">ملخص الحالة *</label>
          <textarea value={caseSummary} onChange={e => setCaseSummary(e.target.value)} rows={3} dir="rtl" placeholder="صف الحالة بإيجاز..."
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3] resize-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">التشخيص</label>
          <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} dir="rtl" placeholder="التشخيص النهائي..."
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3]" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">العلاج</label>
          <textarea value={treatment} onChange={e => setTreatment(e.target.value)} rows={2} dir="rtl" placeholder="العلاج المتبع..."
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3] resize-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">النتيجة</label>
          <textarea value={outcome} onChange={e => setOutcome(e.target.value)} rows={2} dir="rtl" placeholder="ماذا كانت النتيجة؟"
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3] resize-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">الدروس المستفادة</label>
          <textarea value={lessons} onChange={e => setLessons(e.target.value)} rows={2} dir="rtl" placeholder="ما الذي يمكن أن يتعلمه الآخرون من هذه الحالة؟"
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3] resize-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1.5 text-right font-medium">الوسوم (مفصولة بفاصلة)</label>
          <input value={tags} onChange={e => setTags(e.target.value)} dir="rtl" placeholder="مثال: صرع, كيتباباتين, حالة مقاومة"
            className="w-full p-3.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#2196F3]" />
        </div>
        <button onClick={handleSave} disabled={!title.trim() || !caseSummary.trim() || saving}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${title.trim() && caseSummary.trim() ? 'bg-[#2196F3] text-white' : 'bg-gray-200 text-gray-400'}`}>
          {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><CheckCircle size={18} />نشر الحالة</>}
        </button>
      </div>
    </div>
  );
}
