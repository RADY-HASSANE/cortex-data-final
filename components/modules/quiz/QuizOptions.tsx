
import React from 'react';

interface QuizOptionsProps {
  choices: Record<string, string>;
  selectedChoice?: string;
  correctChoice?: string;
  onSelect?: (key: string) => void;
}

export const QuizOptions: React.FC<QuizOptionsProps> = ({ 
  choices, 
  selectedChoice, 
  correctChoice, 
  onSelect 
}) => {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[85%] ml-12 animate-slide-up">
      {Object.entries(choices).map(([key, label]) => {
        let buttonStyle = "bg-white border-gray-200 hover:bg-brand-50 hover:border-brand-300 text-gray-700 shadow-sm";
        let iconStyle = "bg-gray-100 border-gray-300 text-gray-500";
        
        if (selectedChoice) {
           if (key === correctChoice) {
             buttonStyle = "bg-green-100 border-green-500 text-green-800 font-bold scale-[1.02]"; 
             iconStyle = "bg-green-500 border-green-600 text-white";
           } else if (key === selectedChoice) {
             buttonStyle = "bg-red-100 border-red-500 text-red-800 scale-[0.98]"; 
             iconStyle = "bg-red-500 border-red-600 text-white";
           } else {
             buttonStyle = "bg-gray-50 border-gray-100 text-gray-400 opacity-50"; 
             iconStyle = "bg-gray-200 border-gray-300 text-gray-400";
           }
        }

        return (
          <button
            key={key}
            onClick={() => !selectedChoice && onSelect && onSelect(key)}
            disabled={!!selectedChoice}
            className={`
              flex items-center p-4 border rounded-2xl transition-all duration-300 text-left
              ${buttonStyle} ${!selectedChoice ? 'active:scale-95' : ''}
            `}
          >
            <span className={`
              w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mr-4 border flex-shrink-0 transition-colors
              ${iconStyle}
            `}>
              {key}
            </span>
            <span className="text-sm font-medium leading-snug">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
