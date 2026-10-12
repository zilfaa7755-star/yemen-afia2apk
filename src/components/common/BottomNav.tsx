import React from 'react';
import { Home, Calendar, Video, FileText, User } from 'lucide-react';

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'الرئيسية' },
  { id: 'appointments', icon: Calendar, label: 'مواعيدي' },
  { id: 'telemedicine', icon: Video, label: 'الاستشارات' },
  { id: 'health-record', icon: FileText, label: 'سجلاتي' },
  { id: 'more', icon: User, label: 'حسابي' },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-3 left-0 right-0 z-40 px-3 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto bg-white/95 backdrop-blur-xl rounded-[24px] border border-[#E2E8F0] shadow-[0_8px_30px_-4px_rgba(25,154,142,0.14)] p-1.5 transition-all">
        <div className="grid grid-cols-5 items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl min-h-[48px] transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-[#E8F5F4] text-[#199A8E]'
                    : 'text-slate-500 hover:text-[#104C48] hover:bg-slate-50'
                }`}
                title={item.label}
              >
                <div className="relative">
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-transform duration-200 ${isActive ? 'scale-110 text-[#199A8E]' : 'text-slate-500'}`}
                  />
                  {item.id === 'telemedicine' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#38B2AC] ring-2 ring-white" />
                  )}
                </div>
                <span
                  className={`text-[11px] mt-1 font-semibold tracking-tight transition-colors whitespace-nowrap ${
                    isActive ? 'text-[#104C48] font-bold' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-4 h-0.5 rounded-full bg-[#199A8E]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
