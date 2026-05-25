
import React from 'react';
import { Message, Role } from '../../types';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { AudioPlayer } from '../shared/AudioPlayer';

// Imports des Modules
import { TutorCard } from '../modules/tutor/TutorCard';
import { ExerciseCard } from '../modules/exercise/ExerciseCard';
import { ExplanationCard } from '../modules/explanation/ExplanationCard';
import { MindMapCard } from '../modules/mindmap/MindMapCard';
import { QuizOptions } from '../modules/quiz/QuizOptions';
import { QuizReviewCard } from '../modules/quiz/QuizReviewCard';
import { AnalysisCard } from '../modules/analysis/AnalysisCard';
import { CleaningCard } from '../modules/cleaning/CleaningCard';

/**
 * Registre des composants UI par type de module.
 * Facilite l'ajout de nouveaux types sans modifier le JSX principal.
 */
const ModuleRegistry: Record<string, React.FC<{ data: any }>> = {
  tutor_response: TutorCard,
  exercise: ExerciseCard,
  explanation_request: ExplanationCard,
  mindmap_request: MindMapCard,
  quiz_batch: QuizReviewCard,
  data_analysis: AnalysisCard,
  data_cleaning: CleaningCard
};

interface ChatBubbleProps {
  message: Message;
  onOptionSelect?: (choiceKey: string) => void;
  onRetry?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onOptionSelect }) => {
  const isUser = message.role === Role.USER;
  
  // Résolution du composant modulaire
  const ModuleComponent = message.moduleData ? ModuleRegistry[message.moduleData.type] : null;

  return (
    <div className={`flex flex-col w-full mb-6 animate-fade-in ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex w-full max-w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
        {/* Avatar Bot */}
        {!isUser && (
          <div className="flex-shrink-0 mr-3 mt-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
               <span className="text-white">🤖</span>
            </div>
          </div>
        )}

        <div className={`
          max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm relative transition-all duration-300
          ${isUser 
            ? 'bg-white/15 backdrop-blur-md text-white border border-white/20 rounded-tr-sm' 
            : message.isError 
              ? 'bg-red-500/15 text-white border border-red-300/20 rounded-tl-sm backdrop-blur-md'
              : 'bg-white/10 backdrop-blur-md text-white border border-white/15 rounded-tl-sm shadow-soft'
          }
        `}>
          {message.audioUrl && <AudioPlayer url={message.audioUrl} isUser={isUser} />}

          {message.text && (
            <div className={isUser ? "text-sm md:text-base font-medium" : "relative"}>
              {isUser ? message.text : <MarkdownRenderer content={message.text} />}
            </div>
          )}

          {/* Rendu dynamique du module s'il existe */}
          {ModuleComponent && <ModuleComponent data={message.moduleData} />}

          <div className={`flex items-center gap-2 mt-2 text-[10px] ${isUser ? 'justify-end text-white/70' : 'justify-start text-white/60'}`}>
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Options de Quiz (Cas particulier interactif) */}
      {message.choices && !isUser && (
        <QuizOptions 
          choices={message.choices}
          selectedChoice={message.selectedChoice}
          correctChoice={message.correctChoice}
          onSelect={onOptionSelect}
        />
      )}
    </div>
  );
};
