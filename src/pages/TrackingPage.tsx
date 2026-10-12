import { useState } from 'react';
import { ChevronLeft, Activity, Baby, Droplets } from 'lucide-react';
import { MeasurementsTab } from './measurements/MeasurementsTab';
import { PregnancyTab } from './measurements/PregnancyTab';
import { SessionsTab } from './measurements/SessionsTab';

type TrackingTab = 'measurements' | 'pregnancy' | 'sessions';

interface TrackingPageProps {
  onBack?: () => void;
}

const tabs: { id: TrackingTab; label: string; icon: typeof Activity; soon?: boolean }[] = [
  { id: 'measurements', label: 'قياساتي', icon: Activity },
  { id: 'pregnancy', label: 'متابعة الحمل', icon: Baby },
  { id: 'sessions', label: 'جلساتي', icon: Droplets },
];

export function TrackingPage({ onBack }: TrackingPageProps) {
  const [activeTab, setActiveTab] = useState<TrackingTab>('measurements');

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-medical pt-8 pb-14 px-4">
        <div className="flex items-center gap-3 mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
          )}
          <div className="flex-1 text-right">
            <h1 className="text-xl font-bold text-white">متابعات</h1>
            <p className="text-white/80 text-sm mt-0.5">تابع مؤشراتك الصحية وجلساتك العلاجية</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Activity size={24} className="text-white" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.soon && setActiveTab(tab.id)}
                disabled={tab.soon}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${
                  active
                    ? 'bg-gradient-medical text-white shadow-card'
                    : tab.soon
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-bold">{tab.label}</span>
                {tab.soon && (
                  <span className="text-[8px] font-medium text-gray-400">قريباً</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        {activeTab === 'measurements' && <MeasurementsTab />}

        {activeTab === 'pregnancy' && <PregnancyTab />}

        {activeTab === 'sessions' && <SessionsTab />}
      </div>
    </div>
  );
}
