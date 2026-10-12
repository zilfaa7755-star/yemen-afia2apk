import { Activity, Bell, ChevronDown, Cloud, HeartPulse, Keyboard, ShieldCheck, Wifi, ArrowRight, LogOut } from 'lucide-react';
import type { ScreenId } from '../types';
import { useStore } from '../store';
import { useAuth } from '../../context/AuthContext';

const tabs: { id: ScreenId; label: string; short: string; icon: typeof Activity }[] = [
  { id: 'reception', label: 'الاستقبال والفرز متعدد الأطباء', short: 'الاستقبال والفرز', icon: Activity },
  { id: 'lab', label: 'مختبر المنشأة ورصد الفحوصات', short: 'المختبر', icon: ShieldCheck },
  { id: 'pharmacy', label: 'صيدلية المنشأة وصرف الروشتات', short: 'الصيدلية', icon: HeartPulse },
];

export function GlobalHeader({ showTabs = true, title, onBack }: { showTabs?: boolean; title?: string; onBack?: () => void }) {
  const { activeScreen, setActiveScreen } = useStore();
  const { logout } = useAuth();

  const handleExit = () => {
    if (onBack) {
      onBack();
    } else {
      logout();
    }
    window.dispatchEvent(new CustomEvent('nav-to-main'));
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* Back to 5 interfaces / start screen button */}
            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B337A] to-[#00B39F] hover:opacity-90 text-white px-3.5 py-2 text-xs font-bold transition shadow-sm active:scale-95 shrink-0"
              title="العودة لشاشة الواجهات الخمس شاشة البداية"
            >
              <ArrowRight size={16} />
              <span className="inline">الواجهات الخمس</span>
            </button>

            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
              <HeartPulse size={24} strokeWidth={2.4} />
              <span className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-extrabold text-white lg:text-base">{title || 'منظومة يمن عافية الوطنية'}</h1>
                <span className="hidden rounded bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-bold text-sky-400 xl:inline">v2.4.1</span>
              </div>
              <p className="truncate text-[10px] font-medium text-slate-400">{title ? 'منظومة يمن عافية الوطنية' : 'البوابة السحابية الموحدة للرعاية الصحية'}</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 md:flex">
            <Wifi size={14} className="text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-300">متصل</span>
            <span className="text-[10px] text-emerald-500/70">الإنترانت الوطني</span>
            <span className="animate-pulse text-[10px] text-emerald-400">●</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost hidden p-2 sm:inline-flex" title="اختصارات لوحة المفاتيح"><Keyboard size={18} /></button>
            <button className="relative rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white">
              <Bell size={19} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
            </button>
            {/* Direct logout button to return to start screen */}
            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/25 transition active:scale-95"
              title="العودة لشاشة البداية (الواجهات الخمس)"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">الواجهات الرئيسية</span>
            </button>
            <div className="hidden h-8 w-px bg-slate-700 sm:block" />
            <button className="hidden items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-800 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-xs font-bold text-sky-300">س</div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-200">سكرتارية الاستقبال</p>
                <p className="text-[9px] text-slate-500">لوحة الفرز</p>
              </div>
              <ChevronDown size={14} className="text-slate-500" />
            </button>
          </div>
        </div>
        {showTabs && (
          <nav className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-4 lg:px-6" aria-label="بوابات النظام">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeScreen === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveScreen(tab.id)}
                  className={`group relative flex shrink-0 items-center gap-2 px-4 py-3 text-xs font-bold transition-all ${active ? 'text-emerald-300' : 'text-slate-400 hover:text-slate-200'}`}>
                  <Icon size={16} className={active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.short}</span>
                  {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />}
                </button>
              );
            })}
          </nav>
        )}
      </header>
      <div className="hidden border-b border-slate-800 bg-slate-900/50 px-4 py-1.5 text-center text-[10px] text-slate-500 lg:block">
        <Cloud size={11} className="ml-1 inline text-sky-400" /> جميع البيانات مشفرة ومزامنة لحظياً مع مركز البيانات الوطني <span className="mx-2 text-slate-700">|</span> آخر مزامنة: الآن
      </div>
    </>
  );
}
