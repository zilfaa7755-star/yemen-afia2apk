import React from 'react';
import { Home, Calendar, Sparkles, Building2, User } from 'lucide-react';

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'more', icon: User, label: 'حسابي' },
  { id: 'medical-facilities', icon: Building2, label: 'المنشآت' },
  { id: 'appointments', icon: Calendar, label: 'حجوزاتي' },
  { id: 'ai-assistant', icon: Sparkles, label: 'المساعد' },
  { id: 'home', icon: Home, label: 'الرئيسية' },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isCenter = item.id === 'appointments';

            if (isCenter) {
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className="flex flex-col items-center justify-center -mt-6"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#0B337A] to-[#00B39F] shadow-[#00B39F]/30 scale-105'
                      : 'bg-gradient-to-br from-[#0B337A] to-[#08285F] shadow-[#0B337A]/20'
                  }`}>
                    <Icon size={26} className="text-white" />
                  </div>
                  <span className={`text-xs mt-1.5 font-bold transition-colors ${
                    isActive ? 'text-[#0B337A]' : 'text-slate-400'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center justify-center w-full h-full transition-all duration-200"
              >
                <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#EDF3FC]' : ''}`}>
                  <Icon
                    size={22}
                    className={`transition-all duration-300 ${isActive ? 'text-[#0B337A] scale-110' : 'text-slate-400'}`}
                  />
                </div>
                <span className={`text-[11px] mt-1 font-bold transition-colors ${
                  isActive ? 'text-[#0B337A]' : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
