
import { useState, useRef } from 'react';
import { Message, Role, User } from '../types';
import { sendToN8n, extractStructuredData } from '../utils/n8n';
import { useQuiz } from '../features/quiz';
import { useDebug } from '../context/DebugContext';
import { useLanguage } from '../context/LanguageContext';
import { processBotResponse } from '../utils/botResponseProcessor';

interface UseChatProps {
    user: User | null;
    currentSessionId: string;
    addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
    onNewMessageSent?: () => void;
}

export const useChat = ({ user, currentSessionId, addToast, onNewMessageSent }: UseChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { addLog } = useDebug();
    const { language } = useLanguage();
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastUserMessageRef = useRef<{text: string, audio?: string, requestType?: string} | null>(null);
    
    const { quizState, startQuiz, handleQuizOptionSelect, resetQuiz } = useQuiz(setMessages, setIsLoading, user?.id);

    const handleSend = async (text: string, audioBase64?: string, audioUrl?: string, requestType?: string) => {
        if ((!text.trim() && !audioBase64) || isLoading) return;

        lastUserMessageRef.current = { text, audio: audioBase64, requestType };
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        const userMessage: Message = {
            id: Date.now().toString(),
            role: Role.USER,
            text: text || "", 
            timestamp: Date.now(),
            audioUrl: audioUrl
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        if (onNewMessageSent) onNewMessageSent();

        const startTime = performance.now();

        try {
            const responseText = await sendToN8n(text, currentSessionId, language, user?.id, abortControllerRef.current.signal, 3, audioBase64, requestType);
            const duration = Math.round(performance.now() - startTime);
            const { json, introText } = extractStructuredData(responseText);
            
            // Priority: Live Interactive Modules
            const hasQuizData = json && (json.questions || json.quiz_items);
            if (hasQuizData) {
                startQuiz(json, introText);
                return; 
            }

            // Normal Flow: Process standard or structured messages
            const botMessage = processBotResponse(responseText, duration);
            setMessages((prev) => [...prev, botMessage]);
            setIsLoading(false);

            let logResponse;
            try { logResponse = JSON.parse(responseText); } catch { logResponse = responseText; }
            addLog({ message: text, sessionId: currentSessionId, userId: user?.id, language, audio: audioBase64, requestType }, logResponse);

        } catch (error: any) {
            if (error.name === 'AbortError') return;
            const duration = Math.round(performance.now() - startTime);
            addLog({ message: text }, { error: error.message }, true);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: Role.MODEL,
                text: `An error occurred: ${error.message || 'Unknown error'}`,
                timestamp: Date.now(),
                isError: true,
                responseTime: duration
            };
            setMessages((prev) => [...prev, errorMessage]);
            setIsLoading(false);
        }
    };

    return {
        messages, setMessages, isLoading, handleSend, 
        cancelRequest: () => abortControllerRef.current?.abort(), 
        retryLastMessage: () => lastUserMessageRef.current && handleSend(lastUserMessageRef.current.text, lastUserMessageRef.current.audio, undefined, lastUserMessageRef.current.requestType),
        quizState, handleQuizOptionSelect, resetQuiz, startQuiz
    };
};
