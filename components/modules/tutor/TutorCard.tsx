
import React from 'react';
import { TutorResponse } from '../../../types';
import { MarkdownRenderer } from '../../shared/MarkdownRenderer';
import { useLanguage } from '../../../context/LanguageContext';

interface TutorCardProps {
  data: TutorResponse;
  messageText?: string;
}

export const TutorCard: React.FC<TutorCardProps> = ({ data, messageText }) => {
  const { t } = useLanguage();
  return (
    <div className={`mt-4 flex flex-col gap-5 ${messageText ? 'border-t border-gray-100 pt-4' : ''}`}>
      <div className="border-b border-brand-100 pb-2">
        <h3 className="text-xl font-bold text-brand-700">{data.title}</h3>
      </div>
      <div className="bg-brand-50 p-4 rounded-xl border-l-4 border-brand-500 text-gray-700 italic text-sm">
        <div className="font-semibold text-brand-800 mb-1 text-xs uppercase tracking-wide not-italic">{t('common.summary')}</div>
        <MarkdownRenderer content={data.summary} />
      </div>
      <div className="space-y-4">
        {data.sections.map((section) => (
          <div key={section.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <h4 className="font-semibold text-lg text-slate-800 mb-3 flex items-center">
              <span className="bg-brand-100 text-brand-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 font-bold">{section.id}</span>
              {section.heading}
            </h4>
            <div className="text-gray-600 pl-8">
              <MarkdownRenderer content={section.content} />
            </div>
          </div>
        ))}
      </div>
      {data.sources && data.sources.length > 0 && (
        <div className="text-xs text-gray-400 mt-2 border-t border-gray-100 pt-3 flex flex-wrap gap-2 items-center">
          <span className="font-medium uppercase tracking-wider">{t('common.sources')}:</span>
          {data.sources.map((source, idx) => (
            <span key={idx} className="bg-gray-100 px-2 py-1 rounded-md text-gray-500">{source}</span>
          ))}
        </div>
      )}
    </div>
  );
};
