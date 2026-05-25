
import React from 'react';
import { TopicSuggestion } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface SuggestedTopicsProps {
  onSelect: (prompt: string) => void;
}

export const SuggestedTopics: React.FC<SuggestedTopicsProps> = ({ onSelect }) => {
  const { t } = useLanguage();

  const TOPICS: TopicSuggestion[] = [
    {
      label: t('topics.mindmap'),
      prompt: t('topics.mindmapPrompt'),
      icon: "🧠"
    },
    {
      label: t('topics.quiz'),
      prompt: t('topics.quizPrompt'),
      icon: "📝"
    },
    {
      label: t('topics.exercises'),
      prompt: t('topics.exercisesPrompt'),
      icon: "💪"
    },
    {
      label: t('topics.tutorial'),
      prompt: t('topics.tutorialPrompt'),
      icon: "📚"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
      {TOPICS.map((topic, index) => (
        <button
          key={index}
          onClick={() => onSelect(topic.prompt)}
          className="flex items-center p-4 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl transition-all duration-300 text-left shadow-sm hover:shadow-lg hover:border-brand-200 hover:-translate-y-1 group"
        >
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-2xl mr-4 group-hover:scale-110 group-hover:bg-brand-100 transition-all duration-300 shadow-sm">
            {topic.icon}
          </div>
          <div>
            <span className="block font-bold text-gray-800 text-sm group-hover:text-brand-700 transition-colors">{topic.label}</span>
            <span className="block text-xs text-gray-500 mt-1">{t('topics.mindmapDesc')}</span>
          </div>
        </button>
      ))}
    </div>
  );
};
