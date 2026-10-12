import { useState, useEffect } from 'react';
import {
  X,
  Sun,
  RefreshCw,
  ZoomIn,
  RotateCcw,
  Ruler,
  Image as ImageIcon,
} from 'lucide-react';

interface DICOMViewerProps {
  onClose: () => void;
}

type StudyType = 'mri_knee' | 'chest_pa';

export function DICOMViewer({ onClose }: DICOMViewerProps) {
  const [study, setStudy] = useState<StudyType>('mri_knee');
  const [highContrast, setHighContrast] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showMeasure, setShowMeasure] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const filterStyle = `${highContrast ? 'contrast(1.5) brightness(1.2)' : ''} ${inverted ? 'invert(1)' : ''}`.trim();

  const studies = [
    { id: 'mri_knee' as const, label: 'MRI ركبة يمنى', modality: 'MRI', desc: 'قطعي سهمي - T2' },
    { id: 'chest_pa' as const, label: 'صدر PA', modality: 'X-Ray', desc: 'صدر خلفي-أمامي' },
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col animate-fade-in">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">عارض DICOM / PACS المباشر</h2>
            <p className="text-[10px] text-slate-400">منصة يمن عافية - معاينة طبية آمنة</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ToolbarButton
            icon={Sun}
            label="تباين (W/L)"
            active={highContrast}
            onClick={() => setHighContrast(!highContrast)}
          />
          <ToolbarButton
            icon={RefreshCw}
            label="عكس الألوان"
            active={inverted}
            onClick={() => setInverted(!inverted)}
          />
          <ToolbarButton
            icon={ZoomIn}
            label="تكبير (Zoom)"
            onClick={() => setZoom((z) => Math.min(z * 1.3, 3))}
          />
          <ToolbarButton
            icon={RotateCcw}
            label="ضبط الحجم"
            onClick={() => {
              setZoom(1);
              setHighContrast(false);
              setInverted(false);
              setShowMeasure(false);
            }}
          />
          <ToolbarButton
            icon={Ruler}
            label="قياس (mm)"
            active={showMeasure}
            onClick={() => setShowMeasure(!showMeasure)}
          />
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger-600 text-white text-xs font-bold hover:bg-danger-700 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
            إغلاق العارض
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left thumbnail selector */}
        <div className="w-48 bg-slate-950 border-l border-slate-800 p-3 space-y-2 overflow-y-auto dark-scroll">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">الدراسات المتاحة</p>
          {studies.map((s) => (
            <button
              key={s.id}
              onClick={() => setStudy(s.id)}
              className={`w-full p-2.5 rounded-xl border transition-all text-right ${
                study === s.id
                  ? 'border-indigo-500 bg-indigo-500/20'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="w-full aspect-square rounded-lg bg-black mb-2 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full" style={{ filter: filterStyle }}>
                  {s.id === 'mri_knee' ? <MiniKneeSVG /> : <MiniChestSVG />}
                </div>
              </div>
              <p className="text-xs font-bold text-white">{s.label}</p>
              <p className="text-[10px] text-slate-400">{s.modality} | {s.desc}</p>
            </button>
          ))}

          <div className="mt-4 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold mb-1">بيانات المريض</p>
            <p className="text-xs text-white font-semibold">أمل سعود أمين</p>
            <p className="text-[10px] text-slate-400">ID: 01010049281</p>
            <p className="text-[10px] text-slate-400">38س | أنثى | O+</p>
          </div>
        </div>

        {/* Main viewport */}
        <div className="flex-1 relative dicom-grid bg-black flex items-center justify-center overflow-hidden">
          {/* HUD overlays */}
          <div className="absolute top-3 left-3 text-[10px] text-green-400 font-mono space-y-0.5 pointer-events-none z-10">
            <p>^ YEMEN AFIA PACS</p>
            <p>ID: 01010049281</p>
            <p>NAME: AML SAUD AMIN</p>
            <p>DOB: 1988-03-15</p>
          </div>
          <div className="absolute top-3 right-3 text-[10px] text-green-400 font-mono space-y-0.5 text-left pointer-events-none z-10">
            {study === 'mri_knee' ? (
              <>
                <p>SIEMENS MAGNETOM 1.5T</p>
                <p>SEQUENCE: T2_SAG</p>
                <p>SLICE: 12/24</p>
                <p>TE: 45ms | TR: 3500ms</p>
                <p>THICK: 4.0mm</p>
              </>
            ) : (
              <>
                <p>SIEMENS AXIOM Multix</p>
                <p>VIEW: PA CHEST</p>
                <p>kVp: 120 | mAs: 4</p>
                <p>FFD: 180cm</p>
              </>
            )}
          </div>
          <div className="absolute bottom-3 left-3 text-[10px] text-green-400 font-mono pointer-events-none z-10">
            <p>ZOOM: {(zoom * 100).toFixed(0)}%</p>
            <p>W/L: {highContrast ? '120/40' : '80/40'}</p>
          </div>
          <div className="absolute bottom-3 right-3 text-[10px] text-green-400 font-mono text-left pointer-events-none z-10">
            <p>{new Date().toLocaleString('en-GB')}</p>
            <p>VERIFIED: د. خالد المقطري</p>
          </div>

          {/* Crosshair center marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-5 opacity-20">
            <div className="w-12 h-0.5 bg-green-400" />
            <div className="w-0.5 h-12 bg-green-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>

          {/* SVG viewer */}
          <div
            className="transition-transform duration-300 ease-out"
            style={{ transform: `scale(${zoom})`, filter: filterStyle }}
          >
            {study === 'mri_knee' ? <KneeMRI showMeasure={showMeasure} /> : <ChestPA showMeasure={showMeasure} />}
          </div>

          {/* Measurement annotation */}
          {showMeasure && (
            <div className="absolute top-1/2 left-1/2 translate-x-8 -translate-y-8 z-20 pointer-events-none">
              <div className="px-2 py-1 rounded bg-yellow-500 text-black text-[10px] font-bold font-mono">
                12.4 mm
              </div>
            </div>
          )}
        </div>

        {/* Right report drawer */}
        <div className="w-72 bg-slate-950 border-r border-slate-800 p-4 overflow-y-auto dark-scroll">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">التقرير الإشعاعي</h3>
              <p className="text-[10px] text-slate-400">
                {study === 'mri_knee' ? 'MRI - ركبة يمنى - قطعي سهمي' : 'X-Ray - صدر PA'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-indigo-400 font-bold mb-1">النتائج (Findings)</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {study === 'mri_knee'
                  ? 'يظهر قطع جزئي في القرن الإنسي للغضروف الهلالي مع احتباس سائل في المفصل. الأربطة الصليبية سليمة. الغضروف المفصلي يظهر بتآكل خفيف درجة 2.'
                  : 'الحقول الرئوية خالية من بؤر شاذة. القلب بحجم طبيعي. الهيكل العظمي سليم.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <p className="text-[10px] text-amber-400 font-bold mb-1">الانطباع (Impression)</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {study === 'mri_knee'
                  ? 'قطع جزئي بالغضروف الهلالي الإنسي (الدرجة 2) - يُنصح بالمراجعة العظمية'
                  : 'صدر طبيعي - لا يوجد دليل على أمراض نشطة'}
              </p>
            </div>

            {/* Electronic signature stamp */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950 to-slate-900 border-2 border-indigo-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">خ</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">د. خالد المقطري</p>
                  <p className="text-[10px] text-slate-400">استشاري الأشعة</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-700">
                <p className="text-[10px] text-green-400 font-mono">✓ ELECTRONIC SIGNATURE VERIFIED</p>
                <p className="text-[10px] text-slate-500 font-mono">2026-08-12 14:32:18</p>
                <p className="text-[10px] text-slate-500 font-mono">LIC: YE-RAD-2018-4421</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-success-950/50 border border-success-700/30">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <p className="text-[10px] text-success-400 font-semibold">الحالة: موثق ومُعتمد</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Sun;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// --- Knee MRI SVG ---
function KneeMRI({ showMeasure }: { showMeasure: boolean }) {
  return (
    <svg width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#1a1a1a" />

      {/* Femur (thigh bone) - top */}
      <path
        d="M 160 20 Q 170 40 175 80 Q 178 100 180 130 L 220 130 Q 222 100 225 80 Q 230 40 240 20 Z"
        fill="#3a3a3a"
        stroke="#5a5a5a"
        strokeWidth="1.5"
      />
      {/* Femoral condyles */}
      <ellipse cx="185" cy="140" rx="30" ry="22" fill="#4a4a4a" stroke="#6a6a6a" strokeWidth="1" />
      <ellipse cx="215" cy="140" rx="30" ry="22" fill="#4a4a4a" stroke="#6a6a6a" strokeWidth="1" />

      {/* Cartilage (bright on T2) */}
      <path
        d="M 155 142 Q 185 120 215 120 Q 245 120  245 142"
        fill="none"
        stroke="#e8e8e8"
        strokeWidth="3"
        opacity="0.8"
      />
      <path
        d="M 155 155 Q 185 170 215 170 Q 245 170 245 155"
        fill="none"
        stroke="#e8e8e8"
        strokeWidth="3"
        opacity="0.8"
      />

      {/* Meniscus - medial (with tear) */}
      <path
        d="M 150 165 Q 160 175 175 178 L 175 190 Q 160 188 148 180 Z"
        fill="#2a2a2a"
        stroke="#8a8a8a"
        strokeWidth="1.5"
      />
      {/* Meniscus - lateral (intact) */}
      <path
        d="M 225 178 Q 240 175 250 180 L 250 190 Q 240 188 225 190 Z"
        fill="#2a2a2a"
        stroke="#8a8a8a"
        strokeWidth="1.5"
      />

      {/* Tear marker */}
      <circle cx="165" cy="180" r="10" fill="none" stroke="#EF4444" strokeWidth="2.5" className="animate-pulse" />
      <circle cx="165" cy="180" r="3" fill="#EF4444" />

      {/* Callout line */}
      <line x1="155" y1="180" x2="80" y2="230" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4,2" />
      <rect x="10" y="225" width="140" height="28" rx="4" fill="#EF4444" />
      <text x="80" y="243" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
        قطع جزئي بالغضروف (Tear)
      </text>

      {/* Tibia (shin bone) - bottom */}
      <path
        d="M 165 200 Q 170 220 175 260 Q 178 300 180 380 L 220 380 Q 222 300 225 260 Q 230 220 235 200 Z"
        fill="#3a3a3a"
        stroke="#5a5a5a"
        strokeWidth="1.5"
      />
      {/* Tibial plateau */}
      <ellipse cx="200" cy="205" rx="40" ry="15" fill="#4a4a4a" stroke="#6a6a6a" strokeWidth="1" />

      {/* Patella (kneecap) - overlay */}
      <ellipse cx="200" cy="105" rx="25" ry="18" fill="#4a4a4a" stroke="#7a7a7a" strokeWidth="1.5" opacity="0.7" />

      {/* Joint fluid (bright) */}
      <path
        d="M 170 160 Q 200 165 230 160 Q 235 170 230 175 Q 200 180 170 175 Q 165 170 170 160 Z"
        fill="#d4e4f0"
        opacity="0.4"
      />

      {/* Measurement line */}
      {showMeasure && (
        <>
          <line x1="155" y1="180" x2="175" y2="180" stroke="#FBBF24" strokeWidth="2" />
          <line x1="155" y1="175" x2="155" y2="185" stroke="#FBBF24" strokeWidth="2" />
          <line x1="175" y1="175" x2="175" y2="185" stroke="#FBBF24" strokeWidth="2" />
          <text x="165" y="170" textAnchor="middle" fill="#FBBF24" fontSize="10" fontWeight="bold">
            12.4mm
          </text>
        </>
      )}

      {/* Labels */}
      <text x="280" y="60" fill="#888" fontSize="9" fontWeight="bold">Femur</text>
      <text x="280" y="105" fill="#888" fontSize="9" fontWeight="bold">Patella</text>
      <text x="280" y="160" fill="#888" fontSize="9" fontWeight="bold">Meniscus</text>
      <text x="280" y="210" fill="#888" fontSize="9" fontWeight="bold">Tibia</text>

      {/* Scale ruler */}
      <g transform="translate(20, 370)">
        <line x1="0" y1="0" x2="50" y2="0" stroke="#888" strokeWidth="1.5" />
        <line x1="0" y1="-3" x2="0" y2="3" stroke="#888" strokeWidth="1.5" />
        <line x1="25" y1="-2" x2="25" y2="2" stroke="#888" strokeWidth="1" />
        <line x1="50" y1="-3" x2="50" y2="3" stroke="#888" strokeWidth="1.5" />
        <text x="25" y="-6" textAnchor="middle" fill="#888" fontSize="8">10mm</text>
      </g>
    </svg>
  );
}

// --- Chest PA SVG ---
function ChestPA({ showMeasure }: { showMeasure: boolean }) {
  return (
    <svg width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#1a1a1a" />

      {/* Rib cage */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <path
            d={`M ${80 + i * 5} ${100 + i * 35} Q ${100} ${80 + i * 35} ${200} ${75 + i * 35} Q ${300} ${80 + i * 35} ${320 - i * 5} ${100 + i * 35}`}
            fill="none"
            stroke="#4a4a4a"
            strokeWidth="2"
          />
        </g>
      ))}

      {/* Left lung field */}
      <path
        d="M 120 80 Q 90 120 85 200 Q 85 290 120 320 L 170 320 Q 180 280 180 200 Q 180 130 170 80 Z"
        fill="#2a2a2a"
        stroke="#5a5a5a"
        strokeWidth="1.5"
        opacity="0.8"
      />
      {/* Right lung field */}
      <path
        d="M 280 80 Q 310 120 315 200 Q 315 290 280 320 L 230 320 Q 220 280 220 200 Q 220 130 230 80 Z"
        fill="#2a2a2a"
        stroke="#5a5a5a"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Lung vasculature */}
      <g opacity="0.4">
        <path d="M 150 120 Q 160 180 155 280" fill="none" stroke="#6a6a6a" strokeWidth="1.5" />
        <path d="M 250 120 Q 240 180 245 280" fill="none" stroke="#6a6a6a" strokeWidth="1.5" />
        <path d="M 150 150 L 130 180" fill="none" stroke="#5a5a5a" strokeWidth="1" />
        <path d="M 250 150 L 270 180" fill="none" stroke="#5a5a5a" strokeWidth="1" />
        <path d="M 155 200 L 140 230" fill="none" stroke="#5a5a5a" strokeWidth="1" />
        <path d="M 245 200 L 260 230" fill="none" stroke="#5a5a5a" strokeWidth="1" />
      </g>

      {/* Heart silhouette */}
      <path
        d="M 165 180 Q 155 200 160 250 Q 175 280 200 280 Q 225 280 240 250 Q 245 200 235 180 Q 220 165 200 165 Q 180 165 165 180 Z"
        fill="#3a3a3a"
        stroke="#6a6a6a"
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* Trachea */}
      <line x1="200" y1="50" x2="200" y2="110" stroke="#5a5a5a" strokeWidth="3" opacity="0.5" />
      {/* Bronchi */}
      <line x1="200" y1="110" x2="170" y2="150" stroke="#5a5a5a" strokeWidth="2" opacity="0.5" />
      <line x1="200" y1="110" x2="230" y2="150" stroke="#5a5a5a" strokeWidth="2" opacity="0.5" />

      {/* Diaphragm */}
      <path
        d="M 85 310 Q 200 340 315 310"
        fill="none"
        stroke="#5a5a5a"
        strokeWidth="2.5"
      />
      <path
        d="M 85 310 Q 200 340 315 310 L 315 330 L 85 330 Z"
        fill="#3a3a3a"
        opacity="0.5"
      />

      {/* Spine */}
      <line x1="200" y1="40" x2="200" y2="330" stroke="#4a4a4a" strokeWidth="4" opacity="0.4" />

      {/* Measurement */}
      {showMeasure && (
        <>
          <line x1="85" y1="200" x2="315" y2="200" stroke="#FBBF24" strokeWidth="2" />
          <line x1="85" y1="195" x2="85" y2="205" stroke="#FBBF24" strokeWidth="2" />
          <line x1="315" y1="195" x2="315" y2="205" stroke="#FBBF24" strokeWidth="2" />
          <text x="200" y="195" textAnchor="middle" fill="#FBBF24" fontSize="10" fontWeight="bold">
            21.0cm
          </text>
        </>
      )}

      {/* Labels */}
      <text x="350" y="120" fill="#888" fontSize="9" fontWeight="bold">Lung R</text>
      <text x="30" y="120" fill="#888" fontSize="9" fontWeight="bold">Lung L</text>
      <text x="350" y="220" fill="#888" fontSize="9" fontWeight="bold">Heart</text>
      <text x="350" y="310" fill="#888" fontSize="9" fontWeight="bold">Diaphragm</text>

      {/* Normal indicator */}
      <rect x="150" y="360" width="100" height="24" rx="4" fill="#10B981" opacity="0.8" />
      <text x="200" y="376" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
        ✓ صدر طبيعي
      </text>
    </svg>
  );
}

function MiniKneeSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" fill="#1a1a1a" />
      <path d="M 40 10 Q 45 30 48 50 L 52 50 Q 55 30 60 10 Z" fill="#3a3a3a" />
      <ellipse cx="50" cy="55" rx="15" ry="10" fill="#4a4a4a" />
      <circle cx="42" cy="60" r="4" fill="none" stroke="#EF4444" strokeWidth="1.5" />
      <path d="M 40 70 Q 45 85 48 95 L 52 95 Q 55 85 60 70 Z" fill="#3a3a3a" />
    </svg>
  );
}

function MiniChestSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" fill="#1a1a1a" />
      <path d="M 30 20 Q 20 40 22 75 L 42 75 Q 44 50 42 20 Z" fill="#2a2a2a" />
      <path d="M 70 20 Q 80 40 78 75 L 58 75 Q 56 50 58 20 Z" fill="#2a2a2a" />
      <path d="M 42 45 Q 50 55 58 45 Q 55 70 50 72 Q 45 70 42 45 Z" fill="#3a3a3a" />
    </svg>
  );
}
