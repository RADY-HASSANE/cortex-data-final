
import React from 'react';
import { ChatList } from './ChatList';
import { ChatInput } from './ChatInput';
import { Message } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  isHistoryLoading: boolean;
  input: string;
  setInput: (val: string) => void;
  onSend: (audio?: { base64: string, url: string }) => void;
  onCancel: () => void;
  onOptionSelect: (key: string) => void;
  onTopicSelect: (prompt: string) => void;
  onRetry: () => void;
  quizActive: boolean;
  placeholderOverride?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  isHistoryLoading,
  input,
  setInput,
  onSend,
  onCancel,
  onOptionSelect,
  onTopicSelect,
  onRetry,
  quizActive,
  placeholderOverride
}) => {
  const { t } = useLanguage();

  return (
    <>
      <ChatList 
          messages={messages}
          isLoading={isLoading}
          isHistoryLoading={isHistoryLoading}
          onOptionSelect={onOptionSelect}
          onTopicSelect={onTopicSelect}
          onRetry={onRetry}
      />
      <ChatInput 
          input={input}
          setInput={setInput}
          onSend={onSend}
          onCancel={onCancel}
          isLoading={isLoading}
          isDisabled={isHistoryLoading}
          placeholder={placeholderOverride || (quizActive ? t('chat.placeholderQuiz') : t('chat.placeholder'))}
      />
    </>
  );
};
