import { Shield, User, ChevronDown } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-700/50">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-bold leading-tight">
              🛡️ يمن عافية الوطنية
            </h1>
            <p className="text-xs text-slate-400 leading-tight mt-0.5 hidden sm:block">
              السجل السريري الموحد (HIE) | مستشفى آزال النموذجي - صنعاء
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-success-500/15 border border-success-500/30 animate-pulse-glow">
            <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            <span className="text-sm font-semibold text-success-400">سحابة صنعاء: متصلة</span>
          </div>

          <div className="flex items-center gap-2.5 sm:pr-4 sm:border-r border-slate-700/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-semibold">د. علي عبدالله الأهنومي</p>
              <p className="text-xs text-slate-400">استشاري باطنية وقسطرة</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 hidden md:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
