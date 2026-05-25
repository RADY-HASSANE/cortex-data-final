
import React, { useState } from 'react';
import { ExerciseResponse } from '../../../types';
import { MarkdownRenderer } from '../../shared/MarkdownRenderer';
import { useLanguage } from '../../../context/LanguageContext';

interface ExerciseCardProps {
  data: ExerciseResponse;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ data }) => {
  const { t } = useLanguage();
  const [showSolution, setShowSolution] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);

  return (
    <div className="mt-4 flex flex-col gap-6 animate-fade-in border-t border-gray-100 pt-6">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900 leading-tight">{data.title}</h3>
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 mt-1 inline-block">
            {data.difficulty}
          </span>
        </div>
      </div>

      <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 leading-relaxed text-gray-700 text-sm">
        <MarkdownRenderer content={data.context} />
      </div>

      <div className="space-y-4">
        {data.hints && hintsRevealed < data.hints.length && (
          <button 
            onClick={() => setHintsRevealed(h => h + 1)}
            className="text-xs font-black text-brand-600 hover:text-brand-800 uppercase tracking-widest flex items-center gap-2 transition-all hover:gap-3"
          >
            <span>💡 {t('common.needHint')}</span>
            <span className="bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">{data.hints.length - hintsRevealed}</span>
          </button>
        )}

        <div className="flex flex-col gap-3">
          {data.hints?.slice(0, hintsRevealed).map((hint, idx) => (
            <div key={idx} className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-sm text-amber-900 animate-slide-up flex gap-3">
              <span className="text-lg">💡</span>
              <span className="font-medium">{hint}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowSolution(!showSolution)}
          className="w-full py-3 px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
            bg-slate-900 text-white hover:bg-black shadow-lg hover:shadow-glow"
        >
          {showSolution ? t('common.hideSolution') : t('common.showSolution')}
        </button>

        {showSolution && (
          <div className="mt-2 animate-fade-in bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-6 bg-brand-400 rounded-full"></span>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.solution')}</h4>
            </div>
            <div className="text-slate-100 text-sm">
              <MarkdownRenderer content={data.solution} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
