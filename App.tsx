
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { MainLayout } from './components/layout/MainLayout';
import { ChatView } from './components/chat/ChatView';
import { DebugConsole } from './components/layout/DebugConsole';
import { WelcomeLoading } from './components/ui/WelcomeLoading';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { AboutScreen } from './components/screens/AboutScreen';
import { TrackingScreen } from './components/screens/TrackingScreen';
import { useLanguage } from './context/LanguageContext';

// Logic & Data
import { fetchSessions, loadSessionMessages, clearSession, clearHistory, ChatSession } from './features/chatHistory';
import { useChat } from './hooks/useChat';

export default function App() {
  const { session, signOut, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false
  );
  const [view, setView] = useState<'chat' | 'profile' | 'about' | 'tracking'>('chat');
  const [input, setInput] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const hasShownWelcomeRef = useRef(false);
  
  // Session State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => crypto.randomUUID());
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const lastLoadedSessionIdRef = useRef<string | null>(null);

  const { 
      messages, setMessages, isLoading, handleSend, 
      cancelRequest, retryLastMessage, quizState, 
      handleQuizOptionSelect, resetQuiz, startQuiz 
  } = useChat({
      user, currentSessionId, addToast, onNewMessageSent: () => refreshSessions() 
  });

  useEffect(() => {
    if (user && !hasShownWelcomeRef.current) {
      setShowWelcome(true);
      hasShownWelcomeRef.current = true;
      const timer = setTimeout(() => setShowWelcome(false), 2500); 
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    if (user) refreshSessions();
  }, [user]);

  useEffect(() => {
    if (!user || view !== 'chat' || currentSessionId === lastLoadedSessionIdRef.current) return;
    
    const isNewSession = !sessions.find(s => s.id === currentSessionId);
    if (isNewSession) {
        setMessages([]);
        lastLoadedSessionIdRef.current = currentSessionId;
        resetQuiz();
        return;
    }

    const loadMessages = async () => {
        setIsHistoryLoading(true);
        const msgs = await loadSessionMessages(user.id, currentSessionId);
        setMessages(msgs || []);
        lastLoadedSessionIdRef.current = currentSessionId;
        setIsHistoryLoading(false);
        resetQuiz();
    };
    loadMessages();
  }, [currentSessionId, user, sessions, view]); 

  const refreshSessions = async () => {
      if (!user) return;
      const history = await fetchSessions(user.id);
      setSessions(history);
  };

  const handleNewChat = () => {
      if (isLoading) return;
      setCurrentSessionId(crypto.randomUUID());
      setMessages([]);
      resetQuiz();
      setView('chat');
      if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (isLoading || !user || !window.confirm(t('sidebar.deleteConfirm'))) return;
      setSessions(prev => prev.filter(s => s.id !== id));
      if (currentSessionId === id) handleNewChat();
      try {
          await clearSession(user.id, id);
          addToast(t('sidebar.deleteSuccess'), 'success');
      } catch (error) {
          refreshSessions();
          addToast(t('sidebar.deleteError'), 'error');
      }
  };

  const handleReplayQuiz = (quizData: any) => {
    setView('chat');
    const newSid = crypto.randomUUID();
    setCurrentSessionId(newSid);
    setMessages([]);
    setTimeout(() => {
      startQuiz(quizData, `🔄 **Reprise du quiz : ${quizData.quiz_title || quizData.topic || "Cortex Quiz"}**\n\nPrêt pour un nouvel essai ?`);
    }, 300);
  };

  if (authLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!session) return <AuthScreen />;

  return (
    <MainLayout
      user={user}
      signOut={signOut}
      sessions={sessions}
      currentSessionId={currentSessionId}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      isLoading={isLoading}
      onSelectSession={(id) => { setView('chat'); setCurrentSessionId(id); }}
      onNewChat={handleNewChat}
      onDeleteSession={handleDeleteSession}
      onClearAll={async () => {
          if (isLoading || !user || !window.confirm(t('sidebar.clearAllConfirm'))) return;
          try {
              await clearHistory(user.id);
              setSessions([]);
              handleNewChat();
              addToast(t('sidebar.clearAllSuccess'), 'success');
          } catch (e) { addToast(t('sidebar.deleteError'), 'error'); }
      }}
      onViewChange={setView}
    >
      {showWelcome && user && <WelcomeLoading user={user} onDismiss={() => setShowWelcome(false)} />}
      
      {view === 'chat' && (
        <ChatView 
          messages={messages}
          isLoading={isLoading}
          isHistoryLoading={isHistoryLoading}
          input={input}
          setInput={setInput}
          onSend={(audio) => { handleSend(input, audio?.base64, audio?.url); setInput(''); }}
          onCancel={cancelRequest}
          onOptionSelect={handleQuizOptionSelect}
          onTopicSelect={(prompt) => handleSend(prompt)}
          onRetry={retryLastMessage}
          // Fix: Access quizState.active instead of the non-existent variable quizActive
          quizActive={quizState.active}
        />
      )}

      {view === 'profile' && user && <ProfileScreen user={user} onBack={() => setView('chat')} />}
      {view === 'about' && <AboutScreen onBack={() => setView('chat')} />}
      {view === 'tracking' && user && (
        <TrackingScreen 
          user={user} 
          sessionId={currentSessionId}
          onBack={() => setView('chat')} 
          onReplayQuiz={handleReplayQuiz}
          onAction={(prompt) => {
            setView('chat');
            handleSend(prompt);
          }}
        />
      )}
      
      <DebugConsole />
    </MainLayout>
  );
}
