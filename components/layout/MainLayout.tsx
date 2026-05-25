
import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { User } from '../../types';
import { ChatSession } from '../../features/chatHistory';

interface MainLayoutProps {
  user: User | null;
  signOut: () => Promise<void>;
  sessions: ChatSession[];
  currentSessionId: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isLoading: boolean;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
  onViewChange: (view: 'chat' | 'profile' | 'about' | 'tracking') => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  user,
  signOut,
  sessions,
  currentSessionId,
  isSidebarOpen,
  setIsSidebarOpen,
  isLoading,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
  onViewChange,
  children
}) => {
  return (
    <div className="flex h-screen bg-slate-50 text-gray-900 overflow-hidden relative selection:bg-brand-100 selection:text-brand-900">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-white to-brand-50/30 pointer-events-none" />

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={onSelectSession}
        onNewChat={onNewChat}
        onDeleteSession={onDeleteSession}
        onClearAll={onClearAll}
        isDisabled={isLoading} 
      />

      <div className="flex-1 flex flex-col h-full w-full relative min-w-0 z-10 backdrop-blur-[2px]">
        <Header 
          user={user} 
          onSignOut={signOut} 
          onOpenSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          onViewChange={onViewChange}
          onHome={() => onViewChange('chat')}
        />
        
        <main className="flex-1 flex flex-col min-h-0 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
