import React from 'react';

interface YemenAfiaLogoProps {
  variant?: 'full' | 'symbol' | 'horizontal' | 'compact' | 'white';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showArabic?: boolean;
}

/**
 * Official Yemen Afia (يمن عافية) Logo Component
 * Symmetrical, crisp, vector-accurate medical stethoscope mark + brand typography
 * Colors: Navy Blue (#0B337A) & Medical Vibrant Teal (#00B39F)
 */
export function YemenAfiaLogo({
  variant = 'full',
  className = '',
  size = 'md',
  showArabic = true,
}: YemenAfiaLogoProps) {
  const sizeMap = {
    xs: { h: 'h-7', icon: 'w-7 h-7', textLg: 'text-sm', textSm: 'text-[9px]' },
    sm: { h: 'h-9', icon: 'w-9 h-9', textLg: 'text-base', textSm: 'text-[10px]' },
    md: { h: 'h-12', icon: 'w-12 h-12', textLg: 'text-lg', textSm: 'text-xs' },
    lg: { h: 'h-16', icon: 'w-16 h-16', textLg: 'text-2xl', textSm: 'text-sm' },
    xl: { h: 'h-24', icon: 'w-24 h-24', textLg: 'text-3xl', textSm: 'text-base' },
  };

  const currentSize = sizeMap[size];
  const isWhite = variant === 'white';
  const navyColor = isWhite ? '#FFFFFF' : '#0B337A';
  const tealColor = '#00B39F';

  // Crisp Symmetrical Stethoscope SVG Icon
  const StethoscopeSymbol = ({ customClass = '' }: { customClass?: string }) => (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${customClass}`}
      aria-label="رمز يمن عافية الطبي"
    >
      <defs>
        <linearGradient id="yaStethGrad" x1="40" y1="30" x2="140" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00C4AC" />
          <stop offset="100%" stopColor="#00A391" />
        </linearGradient>
        <filter id="yaGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#00B39F" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Symmetrical Headset Binaural (Letter Y) */}
      <g stroke="url(#yaStethGrad)" strokeLinecap="round" strokeLinejoin="round" filter="url(#yaGlow)">
        {/* Left ear tip */}
        <circle cx="48" cy="34" r="6" fill="#00B39F" stroke="none" />
        {/* Right ear tip */}
        <circle cx="112" cy="34" r="6" fill="#00B39F" stroke="none" />

        {/* Tension spring connecting binaurals */}
        <path
          d="M 58 58 Q 80 64 102 58"
          strokeWidth="3.5"
          stroke={isWhite ? 'rgba(255,255,255,0.7)' : '#0B337A'}
          fill="none"
        />

        {/* Left binaural tube curving down into stem */}
        <path
          d="M 48 34 C 48 56, 68 84, 80 96"
          strokeWidth="9"
          fill="none"
        />

        {/* Right binaural tube curving down into stem */}
        <path
          d="M 112 34 C 112 56, 92 84, 80 96"
          strokeWidth="9"
          fill="none"
        />

        {/* Central stem */}
        <path
          d="M 80 96 L 80 112"
          strokeWidth="9"
          fill="none"
        />

        {/* Flexible tubing looping smoothly to chest piece */}
        <path
          d="M 80 112 C 80 132, 102 142, 118 132 C 128 124, 132 110, 130 94"
          strokeWidth="9"
          fill="none"
        />

        {/* Stethoscope Chest Piece / Diaphragm */}
        <circle cx="130" cy="80" r="16" fill={isWhite ? '#0B337A' : '#FFFFFF'} stroke="#00B39F" strokeWidth="6" />
        <circle cx="130" cy="80" r="9" fill="#00B39F" stroke="none" />
        <circle cx="130" cy="80" r="4" fill={isWhite ? '#0B337A' : '#FFFFFF'} stroke="none" />
      </g>
    </svg>
  );

  // Symbol only
  if (variant === 'symbol') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <StethoscopeSymbol customClass={`${currentSize.icon}`} />
      </div>
    );
  }

  // Horizontal Header / Navbar variant
  if (variant === 'horizontal' || variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`} dir="rtl">
        {/* Icon Emblem Container */}
        <div className={`relative flex items-center justify-center ${currentSize.icon} rounded-2xl ${
          isWhite ? 'bg-white/15 backdrop-blur-md border border-white/25' : 'bg-gradient-to-br from-[#0B337A] to-[#08285F] shadow-sm border border-white/10'
        } p-1.5`}>
          <StethoscopeSymbol customClass="w-full h-full" />
        </div>

        {/* Typography */}
        <div className="flex flex-col text-right leading-tight">
          <div className={`flex items-center gap-1 font-black tracking-tight ${currentSize.textLg}`}>
            <span className={isWhite ? 'text-white' : 'text-[#0B337A]'}>
              يمن
            </span>
            <span className="text-[#00B39F]">
              عافية
            </span>
          </div>
          <span className={`font-black tracking-wider ${currentSize.textSm} ${
            isWhite ? 'text-white/70' : 'text-slate-400'
          } font-mono`} dir="ltr">
            YEMEN AFIA
          </span>
        </div>
      </div>
    );
  }

  // Full Brand Logo Graphic (Stacked with Emblem + Typography)
  return (
    <div className={`inline-flex flex-col items-center select-none text-center ${className}`}>
      {/* Sleek Emblem Badge */}
      <div className="relative mb-3 flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0B337A] via-[#082963] to-[#00B39F] p-3 shadow-xl shadow-[#0B337A]/15 border border-white/20">
        <StethoscopeSymbol customClass="w-full h-full" />
        {/* Subtle decorative dot */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00B39F] border-2 border-white ring-2 ring-[#00B39F]/30" />
      </div>

      {/* Arabic Brand Text */}
      {showArabic && (
        <div className="flex items-center justify-center gap-1.5 font-black text-2xl tracking-tight leading-none" dir="rtl">
          <span className={isWhite ? 'text-white' : 'text-[#0B337A]'}>
            يمن
          </span>
          <span className="text-[#00B39F]">
            عافية
          </span>
        </div>
      )}

      {/* English Wordmark */}
      <div className="flex items-center gap-1 mt-1 text-xs font-black tracking-[0.22em] text-slate-400 font-mono" dir="ltr">
        <span className={isWhite ? 'text-white/80' : 'text-[#0B337A]'}>YEMEN</span>
        <span className="text-[#00B39F]">AFIA</span>
      </div>

      {/* Subtitle */}
      <p className={`text-[11px] font-medium mt-1.5 ${isWhite ? 'text-white/60' : 'text-slate-400'}`}>
        المنظومة الوطنية للرعاية الصحية
      </p>
    </div>
  );
}

export default YemenAfiaLogo;
