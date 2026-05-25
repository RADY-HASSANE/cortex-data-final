
import React, { useState, useMemo } from 'react';
import { MessageSquare, Trash2, Plus, Search, Eraser } from 'lucide-react';
import { ChatSession } from '../../features/chatHistory';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
  isDisabled?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    isOpen, 
    onClose, 
    sessions, 
    currentSessionId, 
    onSelectSession, 
    onNewChat,
    onDeleteSession,
    onClearAll,
    isDisabled
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = useMemo(() => {
    if (!searchTerm.trim()) return sessions;
    return sessions.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [sessions, searchTerm]);

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40
        h-full bg-slate-50/95 border-r border-gray-200 
        transition-all duration-300 ease-out shadow-xl md:shadow-none
        flex flex-col flex-shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-72 md:${isOpen ? 'w-72' : 'w-0 border-none'}
      `}>
        
        {/* Header Section */}
        <div className={`p-4 flex flex-col gap-6 md:${!isOpen ? 'hidden' : 'block'}`}>
           {/* New Chat Button */}
           <button 
             onClick={onNewChat}
             disabled={isDisabled}
             className={`w-full flex items-center justify-between px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl transition-all duration-200 shadow-sm group
               ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-brand-600 hover:border-brand-200 hover:shadow-md'}
             `}
           >
             <span className="font-semibold text-sm tracking-tight">{t('sidebar.newChat')}</span>
             <div className={`p-1 bg-gray-100 text-gray-500 rounded-lg transition-colors ${!isDisabled && 'group-hover:bg-brand-50 group-hover:text-brand-500'}`}>
                <Plus size={18} />
             </div>
           </button>

           {/* Search Bar */}
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={16} />
             </div>
             <input 
                type="text" 
                placeholder={t('sidebar.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isDisabled}
                className="w-full bg-white text-gray-700 text-sm rounded-lg pl-9 pr-3 py-2 border border-gray-200 focus:border-brand-300 focus:outline-none focus:ring-4 focus:ring-brand-50/50 transition-all shadow-sm disabled:opacity-50"
             />
           </div>
        </div>

        {/* Sessions List */}
        <div className={`flex-1 overflow-y-auto px-3 py-2 space-y-1 md:${!isOpen ? 'hidden' : 'block'} ${isDisabled ? 'pointer-events-none opacity-60' : ''}`}>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-1">
                {t('sidebar.history')}
            </div>
            
            {sessions.length === 0 && (
                <div className="text-sm text-gray-400 text-center py-8 italic opacity-70">
                    {t('sidebar.noHistory')}
                </div>
            )}

            {filteredSessions.length === 0 && sessions.length > 0 && (
                <div className="text-sm text-gray-400 text-center py-8 italic opacity-70">
                    {t('sidebar.noChats')}
                </div>
            )}

            {filteredSessions.map((session) => (
                <div 
                    key={session.id}
                    onClick={() => {
                        if (isDisabled) return;
                        onSelectSession(session.id);
                        if(window.innerWidth < 768) onClose();
                    }}
                    className={`
                        group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 relative
                        ${currentSessionId === session.id 
                            ? 'bg-white text-brand-700 font-medium shadow-soft border border-gray-100' 
                            : 'text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100'
                        }
                    `}
                >
                    <div className={`transition-colors ${currentSessionId === session.id ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                        <MessageSquare size={16} />
                    </div>
                    
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm truncate">{session.title}</p>
                        <p className="text-[10px] opacity-60 mt-0.5">
                            {new Date(session.timestamp).toLocaleDateString()}
                        </p>
                    </div>
                    
                    {/* Delete Button */}
                    {!isDisabled && (
                      <button
                          onClick={(e) => onDeleteSession(session.id, e)}
                          className={`
                              p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all opacity-0 group-hover:opacity-100 absolute right-2 bg-white/80 backdrop-blur-sm shadow-sm
                          `}
                          title="Delete chat"
                      >
                          <Trash2 size={14} />
                      </button>
                    )}
                </div>
            ))}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-200/60 bg-white/50 backdrop-blur-sm flex flex-col gap-1 md:${!isOpen ? 'hidden' : 'block'}`}>
            {sessions.length > 0 && (
                <button 
                    onClick={onClearAll}
                    disabled={isDisabled}
                    className={`flex items-center justify-center gap-2 py-2 px-3 mt-1 rounded-lg text-xs font-semibold transition-colors w-full border border-transparent 
                      ${isDisabled ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100'}
                    `}
                >
                    <Eraser size={14} />
                    {t('sidebar.clearAll')}
                </button>
            )}

            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xs w-full text-center py-2 md:hidden">
                {t('sidebar.close')}
            </button>
        </div>
      </div>
    </>
  );
};
