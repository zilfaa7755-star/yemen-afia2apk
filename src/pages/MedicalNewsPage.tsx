import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Newspaper,
  Trophy,
  FlaskConical,
  Megaphone,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MedicalArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string | null;
  is_featured: boolean;
  published_at: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; bg: string; color: string; cardBg: string }> = {
  achievement: { label: 'إنجاز طبي', icon: Trophy, bg: 'bg-green-100', color: 'text-green-700', cardBg: 'bg-gradient-to-br from-green-50 to-emerald-50' },
  conference: { label: 'مؤتمر طبي', icon: Calendar, bg: 'bg-[#E8F5F4]', color: 'text-[#104C48]', cardBg: 'bg-gradient-to-br from-[#E8F5F4] to-teal-50' },
  news: { label: 'أخبار', icon: Megaphone, bg: 'bg-gray-100', color: 'text-gray-700', cardBg: 'bg-gradient-to-br from-gray-50 to-slate-50' },
  research: { label: 'بحث علمي', icon: FlaskConical, bg: 'bg-violet-100', color: 'text-violet-700', cardBg: 'bg-gradient-to-br from-violet-50 to-purple-50' },
};

const demoArticles: MedicalArticle[] = [
  { id: '1', title: 'افتتاح مركز القلب التخصصي في صنعاء', summary: 'أعلنت وزارة الصحة اليمنية عن افتتاح أول مركز متخصص لأمراض القلب في العاصمة صنعاء، مجهز بأحدث الأجهزة التشخيصية وغرف قسطرة القلب. المركز يستقبل الحالات الطارئة على مدار الساعة.', category: 'achievement', source: 'وزارة الصحة اليمنية', is_featured: true, published_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', title: 'المؤتمر الطبي اليمني الدولي 2026', summary: 'ينعقد المؤتمر الطبي اليمني الدولي التاسع في صنعاء بمشاركة أكثر من 200 طبيب متخصص من 12 دولة عربية وأجنبية، ويناقش آخر التطورات في الجراحة التنظيرية وزراعة الأعضاء.', category: 'conference', source: 'نقابة الأطباء اليمنيين', is_featured: true, published_at: new Date(Date.now() - 172800000).toISOString() },
  { id: '3', title: 'حملة التطعيم الوطنية تحقق 94% تغطية', summary: 'أعلنت منظمة الصحة العالمية عن نجاح الجولة الثانية من حملة التطعيم الوطنية ضد شلل الأطفال وتغطية 94% من الأطفال دون سن الخامسة في 18 محافظة يمنية.', category: 'news', source: 'منظمة الصحة العالمية', is_featured: false, published_at: new Date(Date.now() - 259200000).toISOString() },
  { id: '4', title: 'نتائج مبشرة في علاج حمى الضنك بالعقار اليمني', summary: 'كشفت دراسة يمنية منشورة في مجلة طبية دولية عن فاعلية مستخلص نبات الحرجل في تخفيف أعراض حمى الضنك وتسريع الشفاء بنسبة 40% دون آثار جانبية تُذكر.', category: 'research', source: 'جامعة صنعاء — كلية الطب', is_featured: true, published_at: new Date(Date.now() - 518400000).toISOString() },
  { id: '5', title: 'إطلاق برنامج الكشف المبكر عن السرطان', summary: 'تعاونت وزارة الصحة مع مؤسسة أطباء بلا حدود لإطلاق برنامج مجاني للكشف المبكر عن سرطان الثدي وعنق الرحم في ثماني محافظات يمنية، يستهدف النساء فوق 35 سنة.', category: 'achievement', source: 'أطباء بلا حدود اليمن', is_featured: false, published_at: new Date(Date.now() - 345600000).toISOString() },
  { id: '6', title: 'تدريب 500 كادر صحي على الإسعافات الأولية', summary: 'أطلق المعهد الوطني للتدريب الصحي برنامجاً مكثفاً لتدريب 500 من الكوادر الصحية على بروتوكولات الإسعافات الأولية والطوارئ في المستشفيات الميدانية.', category: 'news', source: 'المعهد الوطني للتدريب الصحي', is_featured: false, published_at: new Date(Date.now() - 432000000).toISOString() },
  { id: '7', title: 'توفر أجهزة غسيل الكلى في مستشفيات الأطراف', summary: 'أعلنت منظمة الهلال الأحمر اليمني عن توريد 120 جهاز غسيل كلى حديث لمستشفيات 14 محافظة، لتوسيع خدمة مرضى الفشل الكلوي خارج العاصمة.', category: 'achievement', source: 'الهلال الأحمر اليمني', is_featured: false, published_at: new Date(Date.now() - 604800000).toISOString() },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'اليوم';
  if (days === 1) return 'أمس';
  if (days < 7) return `منذ ${days} أيام`;
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
  return `منذ ${Math.floor(days / 30)} أشهر`;
}

export function MedicalNewsPage({ onBack }: { onBack?: () => void }) {
  const [articles, setArticles] = useState<MedicalArticle[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('medical_articles').select('*').order('published_at', { ascending: false });
      setArticles(data && data.length > 0 ? (data as MedicalArticle[]) : demoArticles);
    } catch {
      setArticles(demoArticles);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['achievement', 'conference', 'news', 'research'];
  const filteredArticles = selectedCategory
    ? articles.filter((a) => a.category === selectedCategory)
    : articles;

  const featuredArticles = filteredArticles.filter((a) => a.is_featured);
  const regularArticles = filteredArticles.filter((a) => !a.is_featured);

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#104C48] via-[#125853] to-[#199A8E] pt-3 pb-16 px-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={22} className="text-white rotate-180" />
          </button>
          <div className="flex items-center gap-2">
            <Newspaper size={22} className="text-white" />
            <h1 className="text-xl font-bold text-white">مقالات وتحديثات طبية</h1>
          </div>
          <div className="w-10" />
        </div>
        <p className="text-white/70 text-sm text-center mt-2">آخر الأخبار والإنجازات الطبية في اليمن</p>
      </div>

      {/* Category Filter */}
      <div className="px-4 -mt-10 relative z-30 mb-4">
        <div className="bg-white rounded-2xl shadow-lg p-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !selectedCategory ? 'bg-[#199A8E] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            الكل
          </button>
          {categories.map((cat) => {
            const cfg = categoryConfig[cat];
            const Icon = cfg.icon;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat ? `${cfg.bg} ${cfg.color}` : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Icon size={14} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#199A8E]" />
        </div>
      ) : (
        <div className="px-4">
          {/* Featured Articles */}
          {featuredArticles.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-1.5">
                <Trophy size={14} className="text-amber-500" />
                أخبار مميزة
              </p>
              <div className="space-y-3">
                {featuredArticles.map((article) => {
                  const cfg = categoryConfig[article.category] || categoryConfig['news'];
                  const CatIcon = cfg.icon;
                  const isExpanded = expandedId === article.id;
                  return (
                    <div
                      key={article.id}
                      className={`${cfg.cardBg} border border-gray-100 rounded-2xl p-4 shadow-sm`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs">{timeAgo(article.published_at)}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">مميز</span>
                          <span className={`px-2 py-0.5 ${cfg.bg} ${cfg.color} text-xs font-semibold rounded-full flex items-center gap-1`}>
                            <CatIcon size={10} />
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base leading-snug text-right mb-2">
                        {article.title}
                      </h3>
                      <p className={`text-gray-600 text-sm leading-relaxed text-right ${isExpanded ? '' : 'line-clamp-3'}`}>
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        {article.source ? (
                          <span className="text-gray-400 text-xs truncate max-w-[55%]">{article.source}</span>
                        ) : <span />}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : article.id)}
                          className={`text-xs font-semibold ${cfg.color} flex items-center gap-1`}
                        >
                          {isExpanded ? 'أقل' : 'اقرأ المزيد'}
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Articles */}
          {regularArticles.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-1.5">
                <Newspaper size={14} className="text-gray-400" />
                جميع المقالات
              </p>
              <div className="space-y-3">
                {regularArticles.map((article) => {
                  const cfg = categoryConfig[article.category] || categoryConfig['news'];
                  const CatIcon = cfg.icon;
                  const isExpanded = expandedId === article.id;
                  return (
                    <div
                      key={article.id}
                      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs">{timeAgo(article.published_at)}</span>
                        <span className={`px-2 py-0.5 ${cfg.bg} ${cfg.color} text-xs font-semibold rounded-full flex items-center gap-1`}>
                          <CatIcon size={10} />
                          {cfg.label}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm leading-snug text-right mb-1.5">
                        {article.title}
                      </h3>
                      <p className={`text-gray-500 text-xs leading-relaxed text-right ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between mt-2.5">
                        {article.source ? (
                          <span className="text-gray-400 text-xs truncate max-w-[55%]">{article.source}</span>
                        ) : <span />}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : article.id)}
                          className={`text-xs font-semibold ${cfg.color}`}
                        >
                          {isExpanded ? 'أقل' : 'المزيد'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <Newspaper size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">لا توجد مقالات في هذه الفئة</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
