
import { useState, Dispatch, SetStateAction, useRef } from 'react';
import { Message, Role } from '../types';
import { supabase } from '../services/supabase';

export interface QuizState {
  active: boolean;
  currentQuestionIndex: number;
  score: number;
}

interface NormalizedQuestion {
  id: string;
  question: string;
  choices: Record<string, string>;
  correct_answer: string;
  explanation: string;
}

/**
 * Mélange un tableau de manière aléatoire (Algorithme de Fisher-Yates)
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useQuiz = (
  setMessages: Dispatch<SetStateAction<Message[]>>, 
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  userId?: string
) => {
  const [quizData, setQuizData] = useState<{ title: string; questions: NormalizedQuestion[] } | null>(null);
  const [fullRawData, setFullRawData] = useState<any>(null);
  const [quizState, setQuizState] = useState<QuizState>({ 
    active: false, 
    currentQuestionIndex: 0, 
    score: 0 
  });
  
  const scoreRef = useRef(0);

  const startQuiz = (data: any, introText?: string) => {
    setFullRawData(data);
    scoreRef.current = 0;

    let questions: NormalizedQuestion[] = [];
    const rawQuestions = data.questions || data.quiz_items || [];
    const quizTitle = data.quiz_title || data.topic || "Cortex Quiz";

    questions = rawQuestions.map((q: any, idx: number) => {
      if (Array.isArray(q.options)) {
        // 1. Identifier le texte de la réponse correcte
        // n8n peut envoyer soit l'index (0,1,2), soit la lettre (A,B,C), soit le texte brut
        let correctText = q.correct_answer;
        if (q.correct_answer === "A" || q.correct_answer === "B" || q.correct_answer === "C" || q.correct_answer === "D") {
           const charIdx = q.correct_answer.charCodeAt(0) - 65;
           correctText = q.options[charIdx];
        } else if (typeof q.correct_answer === 'number') {
           correctText = q.options[q.correct_answer];
        }

        // 2. Mélanger les options
        const shuffledOptions = shuffleArray(q.options);

        // 3. Ré-attribuer les clés A, B, C... et retrouver la nouvelle clé de la bonne réponse
        const choices: Record<string, string> = {};
        let correctAnswerKey = "A";
        
        shuffledOptions.forEach((opt: string, i: number) => {
          const key = String.fromCharCode(65 + i);
          choices[key] = opt;
          if (opt === correctText) {
            correctAnswerKey = key;
          }
        });

        return {
          id: q.id || `q-${idx}`,
          question: q.question,
          choices,
          correct_answer: correctAnswerKey,
          explanation: q.explanation || ""
        };
      }
      
      // Fallback si choices est déjà un objet
      return {
        id: q.id || `q-${idx}`,
        question: q.question,
        choices: q.choices || {},
        correct_answer: q.correct_answer,
        explanation: q.explanation || ""
      };
    });

    if (questions.length === 0) return;

    setQuizData({ title: quizTitle, questions });
    setQuizState({ active: true, currentQuestionIndex: 0, score: 0 });
    
    const msg: Message = {
        id: `quiz-start-${Date.now()}`,
        role: Role.MODEL,
        text: introText || `🚀 **Session d'apprentissage interactive**\n\nDébut du quiz : **${quizTitle}**.\nC'est parti pour ${questions.length} questions. Bonne chance !`,
        timestamp: Date.now(),
    };
    setMessages(prev => [...prev, msg]);
    
    setTimeout(() => showQuestion(0, questions), 1000);
  };

  const showQuestion = (index: number, specificQuestions?: NormalizedQuestion[]) => {
    const questions = specificQuestions || quizData?.questions;
    if (!questions || index >= questions.length) {
      if (index >= (questions?.length || 0)) endQuiz();
      return;
    }

    const q = questions[index];
    const questionMsg: Message = {
        id: `quiz-q-${index}-${Date.now()}`,
        role: Role.MODEL,
        text: `**Question ${index + 1} sur ${questions.length}**\n\n${q.question}`,
        timestamp: Date.now(),
        choices: q.choices,
        correctChoice: q.correct_answer 
    };

    setMessages(prev => [...prev, questionMsg]);
    setIsLoading(false);
  };

  const handleQuizOptionSelect = (choiceKey: string) => {
    if (!quizData) return;

    const idx = quizState.currentQuestionIndex;
    const q = quizData.questions[idx];
    const isCorrect = choiceKey === q.correct_answer;

    setMessages(prev => {
        const last = [...prev];
        let msgIdx = -1;
        for (let i = last.length - 1; i >= 0; i--) {
            if (last[i].choices) {
                msgIdx = i;
                break;
            }
        }
        if (msgIdx !== -1) {
            last[msgIdx] = { ...last[msgIdx], selectedChoice: choiceKey };
        }
        return last;
    });

    if (isCorrect) {
      scoreRef.current += 1;
      setQuizState(prev => ({ ...prev, score: prev.score + 1 }));
    }

    setIsLoading(true);

    setTimeout(() => {
        const feedbackMsg: Message = {
            id: `quiz-feedback-${idx}-${Date.now()}`,
            role: Role.MODEL,
            text: isCorrect 
                ? `✅ **Correct !**\n\n${q.explanation}`
                : `❌ **Presque.** La réponse était **${q.correct_answer}** : *${q.choices[q.correct_answer]}*.\n\n${q.explanation}`,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, feedbackMsg]);

        setTimeout(() => {
            const nextIdx = idx + 1;
            setQuizState(prev => ({ ...prev, currentQuestionIndex: nextIdx }));
            showQuestion(nextIdx);
        }, 2000);
    }, 600);
  };

  const endQuiz = async () => {
    if (!quizData) return;
    setIsLoading(false);
    
    const total = quizData.questions.length;
    const finalScoreCount = scoreRef.current;
    const percentage = (finalScoreCount / total) * 100;

    if (userId) {
      try {
        const storageData = {
          data: {
            content: fullRawData || {
                topic: quizData.title,
                quiz_items: quizData.questions.map(q => ({
                    question: q.question,
                    options: Object.values(q.choices),
                    correct_answer: q.choices[q.correct_answer] || q.correct_answer,
                    explanation: q.explanation
                }))
            }
          },
          type: "ai"
        };

        await supabase.from('quiz_scores').insert({
          user_id: userId,
          topic: quizData.title,
          score: finalScoreCount, 
          quiz_data: storageData
        });
      } catch (err) {
        console.error("Erreur lors de l'enregistrement du score du quiz:", err);
      }
    }

    const resultMsg: Message = {
        id: `quiz-end-${Date.now()}`,
        role: Role.MODEL,
        text: `🏆 **Quiz terminé !**\n\nVotre score : **${finalScoreCount} sur ${total}** (${Math.round(percentage)}%).\n\nContinuez ainsi pour perfectionner vos compétences !`,
        timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, resultMsg]);
    setQuizState({ active: false, currentQuestionIndex: 0, score: 0 });
    setQuizData(null);
    setFullRawData(null);
    scoreRef.current = 0;
  };

  return { quizState, startQuiz, handleQuizOptionSelect, resetQuiz: () => {
      setQuizState({ active: false, currentQuestionIndex: 0, score: 0 });
      setQuizData(null);
      setFullRawData(null);
      scoreRef.current = 0;
  }};
};
