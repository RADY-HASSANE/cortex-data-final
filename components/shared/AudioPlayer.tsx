
import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  url: string;
  isUser: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, isUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const themeClass = isUser 
    ? "bg-white/10 text-white" 
    : "bg-brand-50 text-brand-700 border border-brand-100";

  const progressClass = isUser
    ? "accent-white"
    : "accent-brand-500";

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl w-full max-w-[280px] shadow-sm animate-fade-in ${themeClass}`}>
      <audio ref={audioRef} src={url} preload="metadata" />
      
      <button 
        onClick={togglePlay}
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${isUser ? 'bg-white text-brand-600' : 'bg-brand-500 text-white shadow-md shadow-brand-200'}`}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75zm7.5 0a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0v-12a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex gap-0.5 items-center h-3">
             {[1, 2, 3, 4, 5].map(i => (
               <div 
                 key={i} 
                 className={`w-1 rounded-full transition-all duration-300 ${isUser ? 'bg-white' : 'bg-brand-400'} ${isPlaying ? 'animate-wave' : 'h-1'}`}
                 style={{ 
                   height: isPlaying ? '100%' : '20%', 
                   animationDelay: `${i * 0.1}s`,
                   animationDuration: '0.6s'
                 }}
               />
             ))}
          </div>
          <span className="text-[10px] font-bold opacity-80 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        <input 
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className={`w-full h-1 bg-black/10 rounded-lg cursor-pointer appearance-none ${progressClass}`}
        />
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
        .animate-wave {
          animation: wave linear infinite;
        }
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
