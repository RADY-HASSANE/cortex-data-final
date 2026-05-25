
import React, { useState, useRef, useEffect } from 'react';
import { Bot, LogOut, Menu, User as UserIcon, Bug, ChartBar, Info, ChevronDown } from 'lucide-react';
import { User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useDebug } from '../../context/DebugContext';

interface HeaderProps {
    user: User | null;
    onSignOut: () => Promise<void>;
    onOpenSidebar: () => void;
    onViewChange: (view: 'chat' | 'profile' | 'about' | 'tracking') => void;
    onHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut, onOpenSidebar, onViewChange, onHome }) => {
    const { language, setLanguage, t } = useLanguage();
    const { toggleDebug, isDebugOpen } = useDebug();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // On n'affiche que le nom d'utilisateur (ou un fallback), sans l'email
    const userName = user?.user_metadata?.name || 'Utilisateur';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (action: () => void) => {
        action();
        setIsDropdownOpen(false);
    };

    return (
        <header className="flex-none bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-3 sm:px-4 py-3 flex items-center justify-between z-20 sticky top-0">
            <div className="flex items-center gap-2 sm:gap-3">
                <button 
                    onClick={onOpenSidebar}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100/50 rounded-lg transition-colors"
                    title="Toggle Sidebar"
                >
                    <Menu size={24} />
                </button>

                <div 
                  onClick={onHome}
                  className="bg-brand-50/80 p-1.5 rounded-lg border border-brand-100 cursor-pointer hover:bg-brand-100 transition-colors"
                >
                    <Bot size={20} className="text-brand-500" />
                </div>
                <div onClick={onHome} className="flex flex-col cursor-pointer group">
                    <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-secondary-500 tracking-tight leading-tight group-hover:from-brand-500">
                    Cortex Data
                    </h1>
                    <p className="text-[10px] text-gray-500 hidden sm:block font-medium">
                        {t('header.subtitle')}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Debug Toggle */}
                <button
                    onClick={toggleDebug}
                    className={`hidden sm:flex p-1.5 sm:p-2 rounded-full transition-colors ${isDebugOpen ? 'bg-orange-100 text-orange-600 shadow-inner' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}
                    title="Toggle N8N Debugger"
                >
                    <Bug size={20} />
                </button>

                {/* User Dropdown */}
                {user && (
                    <div className="relative" ref={dropdownRef}>
                        <button 
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`flex items-center gap-2 border rounded-full pl-1 pr-3 py-1 mr-0 sm:mr-1 max-w-[140px] sm:max-w-[200px] shadow-sm transition-all
                            ${isDropdownOpen ? 'bg-white border-brand-500 ring-2 ring-brand-50' : 'bg-gray-50/80 border-gray-200/60 hover:bg-white hover:border-brand-300'}
                          `}
                        >
                            <div className="bg-white border border-gray-200 text-brand-600 rounded-full p-1 shadow-sm flex-shrink-0">
                                <UserIcon size={16} />
                            </div>
                            <span className="text-xs font-semibold text-gray-700 truncate">
                                {userName}
                            </span>
                            <div className={`transition-transform duration-200 text-gray-400 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                                <ChevronDown size={12} strokeWidth={2.5} />
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                                <button 
                                    onClick={() => handleAction(() => onViewChange('profile'))}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                                >
                                    <UserIcon size={16} />
                                    {t('profile.title')}
                                </button>

                                <button 
                                    onClick={() => handleAction(() => onViewChange('tracking'))}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                                >
                                    <ChartBar size={16} />
                                    {t('tracking.title')}
                                </button>

                                <button 
                                    onClick={() => handleAction(() => onViewChange('about'))}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                                >
                                    <Info size={16} />
                                    {t('sidebar.about')}
                                </button>

                                <div className="h-px bg-gray-50 my-1 mx-2"></div>

                                <button 
                                    onClick={() => handleAction(onSignOut)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Déconnexion
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Language Switcher */}
                <div className="flex items-center bg-gray-100/80 border border-gray-200/50 rounded-lg p-1 flex-shrink-0">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-1 rounded-md transition-all ${language === 'en' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        EN
                    </button>
                    <button 
                        onClick={() => setLanguage('fr')}
                        className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-1 rounded-md transition-all ${language === 'fr' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        FR
                    </button>
                </div>
            </div>
        </header>
    );
};
