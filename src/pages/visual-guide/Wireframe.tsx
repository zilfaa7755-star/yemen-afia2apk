import React from 'react';

// Phone frame wrapper — gives the mockup a phone-like border
export function PhoneFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-2xl z-20" />
        <div className="w-full h-full bg-gray-50 rounded-[2rem] overflow-hidden relative">
          {children}
        </div>
      </div>
      {label && <p className="mt-3 text-sm font-bold text-gray-700 text-center">{label}</p>}
    </div>
  );
}

// Status bar mock
export function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 pt-2 pb-1 text-[10px] ${dark ? 'text-white' : 'text-gray-700'}`}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <div className="w-3 h-2 border border-current rounded-sm" />
        <span>96%</span>
      </div>
    </div>
  );
}

// Generic placeholder box
export function WBox({ className = '', children, h }: { className?: string; children?: React.ReactNode; h?: number }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}
      style={h ? { height: `${h}px` } : undefined}
    >
      {children}
    </div>
  );
}

// Skeleton line
export function WLine({ w = 'w-full', h = 'h-2', color = 'bg-gray-200' }: { w?: string; h?: string; color?: string }) {
  return <div className={`${w} ${h} ${color} rounded-full`} />;
}

// Section title
export function WTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[11px] font-bold text-gray-800 ${className}`}>{children}</p>;
}

// Muted text
export function WMuted({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[9px] text-gray-400 ${className}`}>{children}</p>;
}

// Blue gradient header block
export function WHeader({ title, sub, icon, color = 'from-[#199A8E] to-[#1976D2]' }: { title: string; sub?: string; icon?: string; color?: string }) {
  return (
    <div className={`bg-gradient-to-b ${color} px-3 py-3 rounded-t-2xl`}>
      <div className="flex items-center justify-between">
        <div className="w-6 h-6 bg-white/20 rounded-full" />
        <h3 className="text-white text-sm font-bold">{title}</h3>
        {icon ? <span className="text-white text-base">{icon}</span> : <div className="w-6" />}
      </div>
      {sub && <p className="text-white/70 text-[9px] mt-1 text-center">{sub}</p>}
    </div>
  );
}

// Bottom nav mock
export function WBottomNav({ active = 'home' }: { active?: string }) {
  const items = [
    { id: 'home', label: 'الرئيسية', icon: '🏠' },
    { id: 'ai', label: 'المساعد', icon: '✨' },
    { id: 'appts', label: 'حجوزاتي', icon: '📅', center: true },
    { id: 'facilities', label: 'المنشآت', icon: '🏥' },
    { id: 'more', label: 'حسابي', icon: '👤' },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-12">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col items-center gap-0.5">
          {item.center ? (
            <div className="w-8 h-8 bg-[#199A8E] rounded-full flex items-center justify-center -mt-3 shadow-lg">
              <span className="text-white text-xs">{item.icon}</span>
            </div>
          ) : (
            <span className={`text-xs ${active === item.id ? 'text-[#199A8E]' : 'text-gray-400'}`}>{item.icon}</span>
          )}
          <span className={`text-[7px] ${active === item.id ? 'text-[#199A8E] font-bold' : 'text-gray-400'}`}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Tab bar mock
export function WTabBar({ tabs, active = 0 }: { tabs: string[]; active?: number }) {
  return (
    <div className="flex gap-1 px-3 py-2 bg-white border-b border-gray-100">
      {tabs.map((tab, i) => (
        <div
          key={i}
          className={`px-3 py-1 rounded-full text-[9px] font-bold ${
            i === active ? 'bg-[#199A8E] text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {tab}
        </div>
      ))}
    </div>
  );
}

// Pill / chip
export function WPill({ children, active = false, color = 'blue' }: { children: React.ReactNode; active?: boolean; color?: string }) {
  const colors: Record<string, string> = {
    blue: active ? 'bg-[#199A8E]/10 border-[#199A8E] text-[#199A8E]' : 'bg-gray-50 border-gray-200 text-gray-500',
    red: 'bg-red-50 border-red-200 text-red-500',
    green: 'bg-green-50 border-green-200 text-green-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-500',
  };
  return (
    <span className={`text-[8px] px-2 py-0.5 rounded-full border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
}

// Icon circle
export function WIconCircle({ color = 'bg-[#E8F5F4]', icon = '●', size = 'w-8 h-8' }: { color?: string; icon?: string; size?: string }) {
  return (
    <div className={`${size} ${color} rounded-full flex items-center justify-center text-[10px]`}>
      {icon}
    </div>
  );
}

// Button mock
export function WButton({ label, color = 'bg-[#199A8E]', full = true }: { label: string; color?: string; full?: boolean }) {
  return (
    <div className={`${color} ${full ? 'w-full' : ''} text-white text-[10px] font-bold rounded-xl px-3 py-2 text-center`}>
      {label}
    </div>
  );
}
