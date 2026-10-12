import { useState } from 'react';
import {
  LayoutDashboard,
  TestTube,
  ScanLine,
  FileText,
  Syringe,
  Siren,
  Check,
  Filter,
  Building2,
} from 'lucide-react';
import { facilities } from '../data/clinicalData';

export type NavCategory =
  | 'summary'
  | 'labs'
  | 'radiology'
  | 'visits'
  | 'surgeries'
  | 'emergency';

interface SidebarProps {
  activeCategory: NavCategory;
  onCategoryChange: (cat: NavCategory) => void;
  facilityFilter: Set<string>;
  onFacilityToggle: (id: string) => void;
  onCategoryClick: (cat: NavCategory) => void;
}

const navItems: { id: NavCategory; label: string; icon: typeof LayoutDashboard; count?: string }[] = [
  { id: 'summary', label: '★ ملخص المريض الشامل', icon: LayoutDashboard },
  { id: 'labs', label: '🧪 شجرة التحاليل LOINC', icon: TestTube, count: '5/23' },
  { id: 'radiology', label: '🩻 استعراض الأشعة DICOM', icon: ScanLine, count: '2/4' },
  { id: 'visits', label: '📑 الزيارات السابقة', icon: FileText, count: '12' },
  { id: 'surgeries', label: '💉 سجل العمليات', icon: Syringe, count: '6' },
  { id: 'emergency', label: '🚨 بطاقة الطوارئ والـ QR (ICE)', icon: Siren },
];

export function Sidebar({ activeCategory, onCategoryClick, facilityFilter, onFacilityToggle }: SidebarProps) {
  const [filterOpen, setFilterOpen] = useState(true);

  return (
    <aside className="w-full lg:w-[250px] shrink-0 bg-white border-l-2 border-slate-200 flex flex-col overflow-y-auto order-1 lg:order-2 max-h-[200px] lg:max-h-none">
      <div className="p-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
          الفئات السريرية
        </h3>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onCategoryClick(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group whitespace-nowrap lg:w-full ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-600'}`} />
                <span className="flex-1 text-right truncate hidden lg:block">{item.label}</span>
                {item.count && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t-2 border-slate-100 p-3 mt-2 hidden lg:block">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="w-full flex items-center gap-2 px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          فلترة المنشآت
          <span className={`mr-auto text-slate-400 transition-transform ${filterOpen ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </button>

        {filterOpen && (
          <div className="space-y-1 animate-fade-in">
            {facilities.map((facility) => {
              const isChecked = facilityFilter.has(facility.id);
              return (
                <label
                  key={facility.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      isChecked
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-slate-300 group-hover:border-primary-400'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onFacilityToggle(facility.id)}
                    className="sr-only"
                  />
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="flex-1 text-xs font-medium text-slate-700 truncate">
                    {facility.name}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white shrink-0"
                    style={{ backgroundColor: facility.color }}
                  >
                    {facility.recordCount}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-auto p-3 border-t-2 border-slate-100 hidden lg:block">
        <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 p-3 text-center">
          <p className="text-[10px] text-primary-700 font-semibold">
            منصة يمن عافية v3.2.1
          </p>
          <p className="text-[10px] text-primary-600/70 mt-0.5">
            متوافقة مع HL7 FHIR R4
          </p>
        </div>
      </div>
    </aside>
  );
}
