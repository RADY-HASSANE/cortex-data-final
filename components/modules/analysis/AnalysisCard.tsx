
import React from 'react';
import { AnalysisResponse } from '../../../types';
import { MarkdownRenderer } from '../../shared/MarkdownRenderer';

interface AnalysisCardProps {
  data: AnalysisResponse;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ data }) => {
  return (
    <div className="mt-4 flex flex-col gap-5 animate-fade-in border-t border-gray-100 pt-6 text-slate-900">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900 leading-tight">Data Analysis: {data.dataset_name}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">Smart Insights Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {data.insights.map((insight, idx) => (
          <div key={idx} className="bg-white border-l-4 border-emerald-500 p-4 rounded-xl shadow-sm flex gap-3 group hover:bg-emerald-50 transition-colors">
            <span className="text-emerald-500 font-bold"># {idx + 1}</span>
            <p className="text-sm text-gray-700 font-medium">{insight}</p>
          </div>
        ))}
      </div>

      {data.visual_description && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-gray-300">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Visualization Recommendation</h4>
          <p className="text-xs text-gray-600 italic leading-relaxed">{data.visual_description}</p>
        </div>
      )}

      {data.code_snippet && (
        <div className="mt-2">
           <MarkdownRenderer content={`\`\`\`python\n${data.code_snippet}\n\`\`\``} />
        </div>
      )}
    </div>
  );
};
