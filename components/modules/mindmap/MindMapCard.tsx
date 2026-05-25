
import React from 'react';
import { MindMapData } from '../../../types';

interface MindMapCardProps {
  data: MindMapData;
}

export const MindMapCard: React.FC<MindMapCardProps> = ({ data }) => {
  if (!data || !data.mindmap_data) return null;
  const { mindmap_data } = data;
  const branches = Array.isArray(mindmap_data.branches) ? mindmap_data.branches : [];

  return (
    <div className="mt-6 w-full animate-fade-in border-t border-gray-100 pt-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl shadow-sm border border-brand-100">
          🧠
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900 leading-tight">
            {mindmap_data.root_node || 'Carte Mentale'}
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {mindmap_data.root_description || 'Visualisation des concepts clés'}
          </p>
        </div>
      </div>

      {/* Grid of Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-soft hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-black text-sm border border-brand-100">
                {idx + 1}
              </div>
              <h4 className="font-bold text-gray-800 uppercase tracking-wide text-sm">
                {branch.label}
              </h4>
            </div>
            
            <p className="text-xs text-gray-500 mb-4 leading-relaxed font-medium">
              {branch.description}
            </p>

            {/* Sub-items (Children) */}
            <div className="space-y-2 border-t border-gray-50 pt-4">
              {branch.children?.map((child, cIdx) => (
                <div key={cIdx} className="flex items-start gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-transparent hover:border-brand-100 hover:bg-white transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <span className="text-[12px] font-bold text-gray-800 block leading-tight">
                      {child.label}
                    </span>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      {child.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branded Note */}
      <div className="mt-8 text-center">
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
          Généré par Cortex Data Intelligence
        </span>
      </div>
    </div>
  );
};
