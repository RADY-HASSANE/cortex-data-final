
import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Mic, Trash2, Check, Send } from 'lucide-react';

export const ChatInput: React.FC<any> = ({ 
    input, setInput, onSend, isLoading, isDisabled, placeholder 
}) => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    // Recording refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<number | null>(null);
    const ignoreStopRef = useRef(false);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 150) + 'px';
        }
    }, [input]);

    // Cleanup resources on unmount
    useEffect(() => {
        return () => {
            stopStream();
            resetInterval();
        };
    }, []);

    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const resetInterval = () => {
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleStop = () => {
        if (ignoreStopRef.current) {
            return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64withHeader = reader.result as string;
            const base64Parts = base64withHeader.split(',');
            const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
            onSend({ base64: base64Data, url });
        };
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            addToast(t('chat.micNotSupported'), 'error');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            audioChunksRef.current = [];
            ignoreStopRef.current = false;

            let options = {};
            if (MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/webm' };
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                options = { mimeType: 'audio/mp4' };
            }

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = handleStop;

            mediaRecorder.start(250);
            setIsRecording(true);
            setRecordingTime(0);

            recordingIntervalRef.current = window.setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= 120) { // Limit to 2 minutes
                        stopAndSendRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err: any) {
            console.error('Error starting recording:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                addToast(t('chat.micDenied'), 'error');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                addToast(t('chat.micNotFound'), 'error');
            } else {
                addToast(t('chat.micError'), 'error');
            }
        }
    };

    const cancelRecording = () => {
        ignoreStopRef.current = true;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        stopStream();
        setIsRecording(false);
        resetInterval();
    };

    const stopAndSendRecording = () => {
        ignoreStopRef.current = false;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        stopStream();
        setIsRecording(false);
        resetInterval();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) onSend();
        }
    };

    return (
        <footer className="flex-none p-4 w-full bg-transparent">
            <div className="max-w-3xl mx-auto relative group">
                <div className="relative bg-white border border-gray-200 rounded-3xl shadow-lg focus-within:shadow-xl focus-within:border-brand-300 transition-all duration-300 p-2 flex items-end">
                    
                    {isRecording ? (
                        <div className="flex-1 flex items-center justify-between px-3 py-2 bg-slate-50 rounded-2xl border border-dashed border-red-200 animate-pulse-slow">
                            {/* Discard button */}
                            <button
                                type="button"
                                onClick={cancelRecording}
                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                                title="Annuler l'enregistrement"
                            >
                                <Trash2 size={18} />
                            </button>

                            {/* State Indicator */}
                            <div className="flex items-center gap-2 select-none">
                                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-red-600 animate-pulse">
                                    Recording
                                </span>
                                <span className="text-sm font-semibold text-slate-700 font-mono">
                                    {formatTime(recordingTime)}
                                </span>
                            </div>

                            {/* Send recording button */}
                            <button
                                type="button"
                                onClick={stopAndSendRecording}
                                className="p-2.5 text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-glow transition-all active:scale-95 flex items-center justify-center"
                                title="Envoyer l'enregistrement"
                            >
                                <Check size={18} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder}
                                className="flex-1 bg-transparent text-gray-800 px-4 py-3 focus:outline-none resize-none text-sm md:text-base max-h-40"
                                rows={1}
                                disabled={isLoading || isDisabled} 
                            />
                            
                            <div className="flex items-center gap-1.5 pl-2">
                                {/* Voice recorder trigger button */}
                                <button
                                    type="button"
                                    onClick={startRecording}
                                    disabled={isLoading || isDisabled}
                                    className={`mb-1 p-3 rounded-2xl transition-all ${
                                        isLoading || isDisabled
                                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                            : 'text-gray-500 hover:text-brand-600 hover:bg-brand-50'
                                    }`}
                                    title="Enregistrer un message vocal"
                                >
                                    <Mic size={20} />
                                </button>

                                {/* Text Send Button */}
                                <button
                                    onClick={() => onSend()}
                                    disabled={!input.trim() || isLoading || isDisabled}
                                    className={`mb-1 p-3 rounded-2xl transition-all ${
                                        input.trim() && !isLoading && !isDisabled
                                            ? 'bg-brand-600 text-white shadow-glow hover:bg-brand-700' 
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="text-center mt-3">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
                    Cortex Data Learning Companion
                </p>
            </div>
        </footer>
    );
};

