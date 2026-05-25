
import React from 'react';
import { ExplanationResponse } from '../../../types';
import { MarkdownRenderer } from '../../shared/MarkdownRenderer';
import { useLanguage } from '../../../context/LanguageContext';

interface ExplanationCardProps {
  data: ExplanationResponse;
  messageText?: string;
}

export const ExplanationCard: React.FC<ExplanationCardProps> = ({ data, messageText }) => {
  const { t } = useLanguage();
  
  if (!data) return null;

  const formatDomain = (domain: string) => {
    if (!domain) return 'Général';
    return domain
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const explanationContent = data.explanation || "";

  return (
    <div className={`mt-2 flex flex-col gap-4 ${messageText ? 'border-t border-gray-100 pt-4' : ''}`}>
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2.5">
          <div className="bg-white p-1.5 rounded-lg shadow-sm text-lg">💡</div>
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Domaine</span>
            <h3 className="text-sm md:text-base font-bold text-gray-800 leading-tight">{formatDomain(data.domain)}</h3>
          </div>
        </div>
        <div className="flex flex-col items-end">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-0.5">Source</span>
            <span className="px-2 py-0.5 bg-white text-brand-600 text-xs font-semibold rounded-md border border-brand-100 shadow-sm">{data.source || 'n8n AI'}</span>
        </div>
      </div>
      <div className="text-gray-700 leading-relaxed pl-1">
        {explanationContent ? (
          <MarkdownRenderer content={explanationContent} />
        ) : (
          <div className="italic text-gray-400 text-sm">{t('common.noExplanation')}</div>
        )}
      </div>
    </div>
  );
};
