import { Droplet, HeartPulse, AlertOctagon, Phone } from 'lucide-react';

interface SafetyBannerProps {
  onOpenEmergency: () => void;
}

export function SafetyBanner({ onOpenEmergency }: SafetyBannerProps) {
  return (
    <div className="bg-white border-b-2 border-slate-200 shadow-sm">
      <div className="flex items-stretch px-3 sm:px-6 py-2.5 gap-2 sm:gap-3 overflow-x-auto">
        {/* Patient identity */}
        <button
          onClick={onOpenEmergency}
          className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors text-right group shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
            أ س
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base group-hover:text-primary-700 transition-colors">
                أمل سعود أمين 🪪
              </span>
              <span className="text-xs text-slate-500 font-medium">38س | أنثى</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono text-slate-600">الرقم الوطني: 01010049281</span>
            </div>
          </div>
          <div className="sm:hidden">
            <span className="font-bold text-slate-900 text-sm">أمل سعود</span>
          </div>
        </button>

        <div className="w-px bg-slate-200 shrink-0" />

        {/* Blood group */}
        <button
          onClick={onOpenEmergency}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-danger-50 border-2 border-danger-500 hover:scale-105 transition-transform group shrink-0"
        >
          <Droplet className="w-5 h-5 text-danger-600 fill-danger-500" />
          <div className="text-right">
            <p className="text-xs text-danger-600 font-medium leading-none">فصيلة الدم</p>
            <p className="text-lg font-extrabold text-danger-700 leading-tight">O+</p>
          </div>
        </button>

        {/* Renal function */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950 border-2 border-danger-600 animate-pulse-danger shrink-0">
          <HeartPulse className="w-5 h-5 text-danger-400" />
          <div className="text-right">
            <p className="text-xs text-red-300 font-medium leading-none">وظائف الكلى (CKD-EPI)</p>
            <p className="text-sm font-bold text-danger-300 leading-tight">
              eGFR: 22 mL/min (قصور كلوي م4) ⚠️
            </p>
          </div>
        </div>

        {/* Life-threatening alert */}
        <button
          onClick={onOpenEmergency}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-danger-600 to-danger-500 text-white animate-pulse-danger hover:scale-[1.02] transition-transform group shrink-0 min-w-0"
        >
          <AlertOctagon className="w-5 h-5 text-white shrink-0" />
          <span className="font-bold text-sm">
            ⛔ تحذير مهدد للحياة: حساسية مفرطة من البنسلين (صدمة تأقية 2024)
          </span>
        </button>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
          <Phone className="w-4 h-4 text-slate-600" />
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-medium leading-none">أقرب الأقارب</p>
            <a href="tel:771234567" className="text-xs font-bold text-primary-700 hover:underline">
              771234567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
