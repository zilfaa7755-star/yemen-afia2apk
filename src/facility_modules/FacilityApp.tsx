import { useEffect } from 'react';
import { GlobalHeader } from './components/GlobalHeader';
import { ToastSystem } from './components/ToastSystem';
import { StoreProvider, useStore } from './store';
import { ReceptionScreen } from './screens/ReceptionScreen';
import { LabScreen } from './screens/LabScreen';
import { PharmacyScreen } from './screens/PharmacyScreen';
import type { ScreenId } from './types';

function Workspace({ initialScreen, singleScreen, title, onBack }: { initialScreen?: ScreenId; singleScreen?: boolean; title?: string; onBack?: () => void }) {
  const { activeScreen, setActiveScreen, addToast } = useStore();
  useEffect(() => {
    if (initialScreen) setActiveScreen(initialScreen);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        if (!singleScreen && activeScreen !== 'reception') setActiveScreen('reception');
        addToast('تم تفعيل البحث العام', 'info');
      }
      if (event.key === 'F2') {
        event.preventDefault();
        if (!singleScreen && activeScreen !== 'reception') setActiveScreen('reception');
        addToast('استخدم زر تسجيل مريض جديد لفتح النموذج', 'info');
      }
      if (event.key === 'F7' && activeScreen === 'pharmacy')
        addToast('استخدم زر طباعة لواصق الجرعات لعرض المعاينة', 'info');
      if (event.key === 'F9' && activeScreen === 'lab')
        addToast('راجع النتائج ثم اضغط اعتماد ورفع فوري', 'info');
      if (event.key === 'F10' && activeScreen === 'pharmacy')
        addToast('راجع الأصناف ثم اضغط تأكيد الصرف', 'warning');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeScreen, addToast, setActiveScreen, singleScreen]);

  return (
    <div className="facility-dark min-h-screen bg-slate-950">
      <GlobalHeader showTabs={!singleScreen} title={title} onBack={onBack} />
      {activeScreen === 'reception' && <ReceptionScreen />}
      {activeScreen === 'lab' && <LabScreen />}
      {activeScreen === 'pharmacy' && <PharmacyScreen />}
      <ToastSystem />
      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-4 text-center text-[10px] text-slate-600">
        منظومة يمن عافية الوطنية · للاستخدام الداخلي المصرح به فقط · مركز البيانات الوطني اليمني
      </footer>
    </div>
  );
}

export default function FacilityApp({ initialScreen, singleScreen, title, onBack }: { initialScreen?: ScreenId; singleScreen?: boolean; title?: string; onBack?: () => void }) {
  return (
    <StoreProvider initialScreen={initialScreen}>
      <Workspace initialScreen={initialScreen} singleScreen={singleScreen} title={title} onBack={onBack} />
    </StoreProvider>
  );
}
