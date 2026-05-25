
import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../services/supabase';
import { QuizReviewCard } from '../modules/quiz/QuizReviewCard';
import { sendToN8n, extractStructuredData } from '../../utils/n8n';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';

interface QuizScore {
  id: string;
  topic: string;
  score: number;
  created_at: string;
  quiz_data: any;
}

interface RecommendationAction {
  priority: number;
  topic: string;
  action_type: 'EXPLICATION' | 'MINDMAP' | 'QUIZ' | 'EXERCICE' | string;
  reason: string;
}

interface StructuredRecommendation {
  user_level: string;
  trend: string;
  analysis: string;
  weak_concepts: string[];
  strong_concepts: string[];
  recommendations: RecommendationAction[];
  next_step_prompt: string;
}

interface TrackingScreenProps {
  user: User;
  sessionId: string;
  onBack: () => void;
  onReplayQuiz: (quizData: any) => void;
  onAction?: (prompt: string) => void;
}

const extractQuizData = (raw: any) => {
  if (raw?.data?.content) return raw.data.content;
  if (raw?.content) return raw.content;
  return raw;
};

export const TrackingScreen: React.FC<TrackingScreenProps> = ({ user, sessionId, onBack, onReplayQuiz, onAction }) => {
  const { t, language } = useLanguage();
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewQuiz, setReviewQuiz] = useState<any | null>(null);
  
  const [recommendation, setRecommendation] = useState<string | StructuredRecommendation | null>(null);
  const [isLoadingRec, setIsLoadingRec] = useState(false);

  useEffect(() => {
    fetchScores();
  }, [user.id]);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScores(data || []);
    } catch (err) {
      console.error("Erreur fetching scores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScore = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce score ?")) return;
    try {
      const { error } = await supabase.from('quiz_scores').delete().eq('id', id);
      if (error) throw error;
      setScores(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Erreur suppression score:", err);
    }
  };

  const handleGetRecommendation = async () => {
    if (isLoadingRec) return;
    setIsLoadingRec(true);
    setRecommendation(null);

    try {
      const responseText = await sendToN8n(
        "Génère une recommandation d'apprentissage personnalisée basée sur ma progression actuelle et mon historique de quiz.",
        sessionId,
        language,
        user.id,
        undefined,
        3,
        undefined,
        "request_recommendation"
      );

      const { json, introText } = extractStructuredData(responseText);
      
      if (json && json.user_level) {
        setRecommendation(json as StructuredRecommendation);
      } else {
        const recText = json?.explanation || json?.text || introText || responseText;
        setRecommendation(recText);
      }
    } catch (err) {
      console.error("Erreur recommandation:", err);
      setRecommendation("Désolé, je n'ai pas pu générer de recommandation pour le moment.");
    } finally {
      setIsLoadingRec(false);
    }
  };

  const stats = {
    total: scores.length,
    average: scores.length > 0 
      ? Math.round(scores.reduce((acc, curr) => {
          const quiz = extractQuizData(curr.quiz_data);
          const totalQ = quiz?.questions?.length || quiz?.quiz_items?.length || 1;
          return acc + (curr.score / totalQ);
        }, 0) / scores.length * 100) 
      : 0,
    best: scores.length > 0 
      ? Math.max(...scores.map(s => {
          const quiz = extractQuizData(s.quiz_data);
          const totalQ = quiz?.questions?.length || quiz?.quiz_items?.length || 1;
          return Math.round((s.score / totalQ) * 100);
        })) 
      : 0
  };

  const getScoreColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600 bg-green-50 border-green-100';
    if (percent >= 50) return 'text-orange-600 bg-orange-50 border-orange-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 animate-fade-in relative">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <button 
            onClick={onBack}
            className="group w-fit flex items-center gap-2 text-gray-500 hover:text-brand-600 font-bold text-sm transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:-translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t('common.back')}
          </button>

          {scores.length > 0 && (
            <button 
              onClick={handleGetRecommendation}
              disabled={isLoadingRec}
              className={`flex items-center justify-center gap-3 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all group
                ${isLoadingRec 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:shadow-brand-200 hover:scale-[1.02] active:scale-95'
                }
              `}
            >
              {isLoadingRec ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-xl group-hover:animate-bounce">🤖</span>
              )}
              {isLoadingRec ? "Analyse..." : "Coach IA"}
            </button>
          )}
        </div>

        <div className="space-y-10">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">{t('tracking.title')}</h1>
            <p className="text-gray-500 font-medium">{t('tracking.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-soft border border-gray-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('tracking.completed')}</span>
              <span className="text-4xl font-black text-brand-600">{stats.total}</span>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-soft border border-gray-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('tracking.average')}</span>
              <span className="text-4xl font-black text-brand-600">{stats.average}%</span>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-soft border border-gray-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('tracking.record')}</span>
              <span className="text-4xl font-black text-secondary-500">{stats.best}%</span>
            </div>
          </div>

          {recommendation && (
            <div className="animate-slide-up space-y-6">
              {typeof recommendation === 'string' ? (
                <div className="bg-white p-6 rounded-[2rem] border border-brand-100 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4">
                     <button onClick={() => setRecommendation(null)} className="text-gray-300 hover:text-gray-500 transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </button>
                   </div>
                   <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">💡</span>
                      <h3 className="font-black text-gray-900 tracking-tight">Conseil du Coach IA</h3>
                   </div>
                   <div className="prose prose-slate max-w-none">
                     <MarkdownRenderer content={recommendation} />
                   </div>
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl overflow-hidden">
                  <div className="bg-slate-900 p-6 md:p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-4">
                      <button onClick={() => setRecommendation(null)} className="text-slate-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-3xl shadow-glow animate-pulse">
                          🤖
                        </div>
                        <div>
                          <h2 className="text-2xl font-black tracking-tight leading-none mb-2">Analyse de Performance</h2>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-brand-600/30 text-brand-300 border border-brand-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                              Niveau : {recommendation.user_level}
                            </span>
                            <span className="px-3 py-1 bg-green-600/30 text-green-300 border border-green-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                              Tendance : {recommendation.trend}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-8 text-slate-300 font-medium leading-relaxed italic border-l-2 border-brand-500 pl-6">
                      "{recommendation.analysis}"
                    </p>
                  </div>

                  <div className="p-6 md:p-8 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                      <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Points Forts
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.strong_concepts.map((concept, i) => (
                          <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-100">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                      <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        À Travailler
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.weak_concepts.map((concept, i) => (
                          <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-xl text-xs font-bold border border-orange-100">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-4 bg-white">
                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                      Parcours Recommandé
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {recommendation.recommendations.map((rec, i) => (
                        <div key={i} className="group relative bg-white border border-gray-100 p-5 rounded-3xl shadow-soft hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
                          <div className={`absolute top-0 left-0 h-full w-1 ${
                            rec.priority === 1 ? 'bg-brand-500' : rec.priority === 2 ? 'bg-indigo-400' : 'bg-slate-300'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest">
                                # {rec.priority}
                              </span>
                              <span className="px-2 py-0.5 bg-brand-50 text-brand-600 rounded text-[9px] font-black uppercase tracking-widest">
                                {rec.action_type}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">{rec.topic}</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">{rec.reason}</p>
                          </div>
                          <button 
                            onClick={() => {
                              if (onAction) {
                                let prompt = "";
                                switch(rec.action_type) {
                                  case 'EXPLICATION':
                                    prompt = `Peux-tu m'expliquer en détail le concept de : ${rec.topic} ?`;
                                    break;
                                  case 'MINDMAP':
                                    prompt = `Génère une carte mentale sur : ${rec.topic}`;
                                    break;
                                  case 'EXERCICE':
                                    prompt = `Donne-moi un exercice pratique de code pour m'entraîner sur : ${rec.topic}`;
                                    break;
                                  default:
                                    prompt = `Je voudrais un quiz de niveau supérieur sur : ${rec.topic}`;
                                }
                                onAction(prompt);
                              }
                            }}
                            className="flex-shrink-0 bg-brand-600 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 shadow-sm active:scale-95 transition-all"
                          >
                            Démarrer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-slate-50 text-center border-t border-gray-100">
                    <p className="text-sm font-bold text-slate-600 italic">
                      ✨ {recommendation.next_step_prompt}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
              <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
              {t('tracking.history')}
            </h2>

            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
              </div>
            ) : scores.length === 0 ? (
              <div className="bg-white p-12 rounded-[2rem] border border-dashed border-gray-200 text-center">
                <p className="text-gray-400 font-medium">{t('tracking.empty')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {scores.map((s) => {
                  const quiz = extractQuizData(s.quiz_data);
                  const totalQ = quiz?.questions?.length || quiz?.quiz_items?.length || 1;
                  const percent = Math.round((s.score / totalQ) * 100);
                  return (
                    <div key={s.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between group hover:shadow-md transition-all gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all border border-gray-100">
                          📝
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 leading-tight">{s.topic}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                            {new Date(s.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className={`px-3 py-1.5 rounded-xl border font-black text-xs ${getScoreColor(percent)}`}>
                          {s.score} / {totalQ}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => onReplayQuiz(quiz)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-sm font-bold text-xs"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z" />
                            </svg>
                            {t('tracking.replay')}
                          </button>

                          <button 
                            onClick={() => setReviewQuiz(quiz)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-white hover:text-brand-600 border border-gray-100 hover:border-brand-100 transition-all font-bold text-xs"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {t('tracking.review')}
                          </button>

                          <button 
                            onClick={() => handleDeleteScore(s.id)}
                            className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                            title={t('tracking.delete')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244 2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {reviewQuiz && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReviewQuiz(null)} />
          <div className="relative bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-white/20">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl shadow-sm border border-brand-100">
                  🔍
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">{t('tracking.reviewTitle')}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{reviewQuiz.quiz_title || reviewQuiz.topic || "Cortex Quiz"}</p>
                </div>
              </div>
              <button 
                onClick={() => setReviewQuiz(null)}
                className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
              <QuizReviewCard data={{
                type: 'quiz_batch',
                topic: reviewQuiz.quiz_title || reviewQuiz.topic || 'Review',
                difficulty: reviewQuiz.difficulty || 'Normal',
                quiz_items: reviewQuiz.questions || reviewQuiz.quiz_items || []
              }} />
            </div>

            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button 
                onClick={() => {
                  onReplayQuiz(reviewQuiz);
                  setReviewQuiz(null);
                }}
                className="px-8 py-3 bg-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z" />
                </svg>
                {t('tracking.replay')}
              </button>
              <button 
                onClick={() => setReviewQuiz(null)}
                className="px-8 py-3 bg-slate-200 text-slate-700 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-300 transition-all"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
