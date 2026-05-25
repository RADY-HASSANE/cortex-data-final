
import React from 'react';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const { addToast } = useToast();
  const { t } = useLanguage();

  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    addToast(t('common.copied'), 'success');
  };

  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-gray-100 text-brand-700 border border-gray-200 px-1.5 py-0.5 rounded text-xs font-mono font-medium">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="text-sm md:text-base leading-relaxed space-y-3">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const language = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);

          return (
            <div key={index} className="my-5 rounded-xl overflow-hidden bg-[#1e1e1e] shadow-xl border border-gray-800">
              <div className="flex justify-between items-center px-4 py-2.5 bg-[#252526] border-b border-[#333]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  <span className="ml-2 text-xs text-gray-400 font-mono opacity-60">
                    {language || 'terminal'}
                  </span>
                </div>
                <button 
                  onClick={() => handleCopy(code)}
                  className="group flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>{t('common.copy')}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[#d4d4d4] font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-700">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        return (
          <div key={index} className="whitespace-pre-wrap">
            {part.split('\n').map((line, i) => {
              if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                return (
                  <div key={i} className="flex ml-4 mb-1">
                    <span className="mr-2 text-brand-500">•</span>
                    <span>{parseInline(line.replace(/^[-*]\s/, ''))}</span>
                  </div>
                );
              }
              if (/^\d+\.\s/.test(line.trim())) {
                return (
                    <div key={i} className="flex ml-4 mb-1">
                        <span className="mr-2 font-semibold text-brand-600">{line.match(/^\d+\./)?.[0]}</span>
                        <span>{parseInline(line.replace(/^\d+\.\s/, ''))}</span>
                    </div>
                )
              }
              return line.trim() === '' ? <div key={i} className="h-2" /> : <p key={i} className="mb-1">{parseInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};
