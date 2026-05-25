
import React from 'react';
import { User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface WelcomeLoadingProps {
  user: User;
  onDismiss: () => void;
}

export const WelcomeLoading: React.FC<WelcomeLoadingProps> = ({ user, onDismiss }) => {
  const { t } = useLanguage();
  const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

  return (
    <div 
      onClick={onDismiss}
      className="fixed inset-0 z-[100] bg-gradient-to-br from-brand-600 to-indigo-800 flex flex-col items-center justify-center p-6 animate-fade-in cursor-pointer"
      title="Cliquez pour passer"
    >
      {/* Robot SVG */}
      <div className="relative w-48 h-48 mb-8 animate-float">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
          {/* Antenna */}
          <line x1="100" y1="40" x2="100" y2="20" stroke="white" strokeWidth="6" strokeLinecap="round" />
          <circle cx="100" cy="15" r="8" fill="#5cebf4" className="animate-pulse" />
          
          {/* Head */}
          <rect x="50" y="40" width="100" height="90" rx="20" fill="white" />
          
          {/* Face Screen */}
          <rect x="60" y="55" width="80" height="55" rx="10" fill="#164e63" />
          
          {/* Eyes */}
          <circle cx="85" cy="82" r="8" fill="#5cebf4" />
          
          <g className="animate-wink origin-[115px_82px]">
            <circle cx="115" cy="82" r="8" fill="#5cebf4" />
          </g>

          {/* Body/Neck */}
          <rect x="85" y="130" width="30" height="15" fill="#ccfbfd" />
          <path d="M40 145 Q100 130 160 145 L170 190 Q100 200 30 190 Z" fill="white" />
          
          {/* Chest Heart/Logo */}
          <circle cx="100" cy="165" r="12" fill="#06b6d4" className="animate-pulse" />
        </svg>
        
        <div className="absolute inset-0 bg-brand-400/20 blur-3xl -z-10 rounded-full animate-pulse-slow"></div>
      </div>

      {/* Text Content */}
      <div className="text-center space-y-4 animate-slide-up">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">
          {t('header.welcomeUser', { name: displayName })}
        </h2>
        <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-brand-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-1.5 w-1.5 bg-brand-300 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <div className="h-1.5 w-1.5 bg-brand-300 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                <span className="text-brand-100 text-sm font-medium ml-2 tracking-widest uppercase">
                    Initialisation de votre tuteur...
                </span>
            </div>
            <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                Cliquez n'importe où pour commencer
            </span>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes wink {
          0%, 45%, 55%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-wink {
          animation: wink 3.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
