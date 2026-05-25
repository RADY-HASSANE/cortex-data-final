
import React from 'react';
import { DataCleaningResponse } from '../../../types';
import { MarkdownRenderer } from '../../shared/MarkdownRenderer';

export const CleaningCard: React.FC<{ data: DataCleaningResponse }> = ({ data }) => {
  return (
    <div className="mt-4 flex flex-col gap-5 animate-fade-in border-t border-gray-100 pt-6">
      <div className="flex items-center gap-4">
        <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900 leading-tight">Nettoyage : {data.target_issue}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mt-1">Data Quality Guard</p>
        </div>
      </div>

      <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
        <h4 className="text-xs font-black text-amber-800 uppercase mb-2">Diagnostic</h4>
        <p className="text-sm text-amber-900 leading-relaxed">{data.diagnosis}</p>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Plan de remédiation</h4>
        <div className="space-y-2">
          {data.remedy_steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">{i+1}</span>
              <p className="text-sm text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {data.python_fix && (
        <div className="mt-2">
          <MarkdownRenderer content={`\`\`\`python\n# Solution de nettoyage\n${data.python_fix}\n\`\`\``} />
        </div>
      )}
    </div>
  );
};
