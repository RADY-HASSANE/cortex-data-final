
import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../../types';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { SuggestedTopics } from './SuggestedTopics';
import { useLanguage } from '../../context/LanguageContext';

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

interface ChatListProps {
    messages: Message[];
    isLoading: boolean;
    isHistoryLoading: boolean;
    onOptionSelect: (key: string) => void;
    onTopicSelect: (prompt: string) => void;
    onRetry?: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({ 
    messages, 
    isLoading, 
    isHistoryLoading,
    onOptionSelect,
    onTopicSelect,
    onRetry
}) => {
    const { t } = useLanguage();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isBottom = scrollHeight - scrollTop - clientHeight < 150;
            setShowScrollButton(!isBottom);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, isHistoryLoading]);

    return (
        <main 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth bg-slate-50 relative"
        >
            <div className="max-w-3xl mx-auto flex flex-col min-h-full">
            
            {isHistoryLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-sm animate-pulse">{t('chat.retrieving')}</p>
                </div>
            ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-slide-up pb-10">
                    <div className="w-20 h-20 bg-gradient-to-tr from-brand-100 to-white rounded-3xl flex items-center justify-center mb-8 shadow-soft border border-brand-50 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <span className="text-4xl">📚</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">{t('chat.welcomeTitle')}</h2>
                    <p className="text-gray-500 max-w-sm mb-10 text-sm font-medium leading-relaxed">
                        {t('chat.welcomeSubtitle')}
                    </p>
                    <SuggestedTopics onSelect={onTopicSelect} />
                </div>
            ) : (
                <div className="flex flex-col space-y-1 pb-10">
                    {messages.map((msg, idx) => (
                        <ChatBubble 
                            key={msg.id} 
                            message={msg} 
                            onOptionSelect={onOptionSelect} 
                            onRetry={idx === messages.length - 1 && msg.isError ? onRetry : undefined}
                        />
                    ))}
                    {isLoading && (
                        <div className="flex w-full justify-start animate-fade-in pl-12 mt-2">
                            <TypingIndicator />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
            </div>

            {showScrollButton && (
              <button 
                onClick={scrollToBottom}
                className="fixed bottom-28 right-8 z-20 bg-brand-600 text-white p-3 rounded-full shadow-glow animate-fade-in hover:scale-110 active:scale-90 transition-all"
              >
                <ChevronDownIcon />
              </button>
            )}
        </main>
    );
};
