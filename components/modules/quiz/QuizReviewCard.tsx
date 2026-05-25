
import React from 'react';
import { QuizBatchData } from '../../../types';
import { MarkdownRenderer } from '../../shared/MarkdownRenderer';

interface QuizReviewCardProps {
  data: QuizBatchData;
}

export const QuizReviewCard: React.FC<QuizReviewCardProps> = ({ data }) => {
  return (
    <div className="flex flex-col gap-6 w-full mt-4 border-t border-gray-100 pt-6">
      <div className="flex items-center justify-between border-b border-orange-100 pb-3">
        <div className="flex items-center gap-3">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800 leading-tight">
                    {data.topic || "Quiz Recap"}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-orange-600 mt-1 inline-block">
                    {data.difficulty || "History"}
                </span>
            </div>
        </div>
      </div>

      <div className="space-y-8">
        {data.quiz_items.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="bg-slate-50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {idx + 1}</span>
              <div className="h-2 w-2 rounded-full bg-brand-500"></div>
            </div>

            <div className="p-5 space-y-4">
              <h4 className="text-base font-semibold text-gray-800 leading-snug">
                {item.question}
              </h4>

              <div className="grid grid-cols-1 gap-2">
                {item.options.map((opt, optIdx) => {
                  const isCorrect = opt === item.correct_answer;
                  return (
                    <div 
                      key={optIdx} 
                      className={`px-4 py-2.5 rounded-xl text-sm border flex items-center gap-3 transition-colors
                        ${isCorrect 
                          ? 'bg-green-50 border-green-200 text-green-700 font-medium' 
                          : 'bg-gray-50/50 border-gray-100 text-gray-500 opacity-80'
                        }
                      `}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2
                        ${isCorrect ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-400'}
                      `}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-blue-500">💡</span>
                   <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Explication</span>
                </div>
                <div className="text-sm text-slate-600 italic">
                    <MarkdownRenderer content={item.explanation} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
