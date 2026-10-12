import React, { useState } from 'react';
import { Bell, Search, User, Mic } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { YemenAfiaLogo } from './YemenAfiaLogo';
import { AudioTranscribeModal } from './AudioTranscribeModal';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  showNotification?: boolean;
  transparent?: boolean;
  showVoiceTranscribe?: boolean;
}

export function Header({
  title,
  showBack = false,
  onBack,
  showSearch = false,
  showNotification = true,
  transparent = false,
  showVoiceTranscribe = true,
}: HeaderProps) {
  const { user } = useAuth();
  const [showTranscribe, setShowTranscribe] = useState(false);

  return (
    <>
      <header
        className={`sticky top-0 z-40 ${
          transparent
            ? 'bg-transparent'
            : 'bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="رجوع"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
            {title ? (
              <h1 className="text-lg font-bold text-gray-800">{title}</h1>
            ) : (
              <YemenAfiaLogo variant="horizontal" size="sm" />
            )}
          </div>

          <div className="flex items-center gap-2">
            {showVoiceTranscribe && (
              <button
                onClick={() => setShowTranscribe(true)}
                className="flex items-center gap-1 p-2 rounded-xl bg-gradient-to-r from-[#0B337A]/10 to-[#00B39F]/10 hover:from-[#0B337A]/20 hover:to-[#00B39F]/20 text-[#0B337A] transition"
                title="تفريغ صوتي ذكي (Gemini 3.5)"
              >
                <Mic size={18} className="text-[#00B39F]" />
              </button>
            )}
            {showSearch && (
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Search size={20} className="text-gray-600" />
              </button>
            )}
            {showNotification && (
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#00B39F] rounded-full"></span>
              </button>
            )}
            {user && (
              <button className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#EDF3FC] hover:bg-[#E2ECF9] transition-colors border border-[#0B337A]/10">
                <span className="text-xs font-bold text-[#0B337A]">
                  {user.full_name?.split(' ')[0]}
                </span>
                <div className="w-7 h-7 bg-gradient-to-br from-[#0B337A] to-[#00B39F] rounded-full flex items-center justify-center shadow-xs">
                  <User size={14} className="text-white" />
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Voice Transcribe Modal */}
      <AudioTranscribeModal
        isOpen={showTranscribe}
        onClose={() => setShowTranscribe(false)}
      />
    </>
  );
}
