
import { supabase } from '../services/supabase.ts';
import { Message, Role } from '../types.ts';

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
}

/**
 * Tente de parser une chaîne en JSON, sinon retourne la valeur initiale.
 */
const safeJsonParse = (val: any): any => {
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
};

/**
 * Extrait et parse récursivement les données utiles d'un message stocké.
 * Supporte : { data: { content: { output: { ... } } } } ou { data: { content: "{...}" } }
 */
const getOutputData = (msg: any): any => {
  let current = safeJsonParse(msg);
  if (!current || typeof current !== 'object') return { text: String(msg || '') };

  // Forage successif dans les couches n8n/LangChain
  if (current.message) current = safeJsonParse(current.message);
  if (current.data) current = safeJsonParse(current.data);
  if (current.content) current = safeJsonParse(current.content);
  if (current.output) current = safeJsonParse(current.output);

  return (current && typeof current === 'object') ? current : { text: String(current || '') };
};

/**
 * Normalise une ligne de la base de données en un objet Message UI.
 */
const normalizeRow = (row: any): Message => {
  // 1. Préparation du message brut (gestion du format Supabase)
  const msgRaw = safeJsonParse(row.message || {});
  const data = getOutputData(msgRaw);
  
  // 2. Détection robuste du rôle IA
  // On vérifie le type dans le message, dans la ligne, ou par la présence de données structurées
  const roleType = (msgRaw.role || msgRaw.type || row.type || '').toLowerCase();
  const hasMindMap = !!(data.mindmap_data || (data.branches && data.root_node) || data.category === 'mindmap_request');
  const hasQuiz = !!(data.quiz_items || data.questions || data.category === 'quiz_batch');
  const hasExercise = !!(data.exerciseData || (data.tasks && data.solution) || data.category === 'exercise_delivery');
  const hasExplanation = !!(data.explanation || data.category === 'explanation_request');
  
  const isAi = roleType === 'ai' || roleType === 'assistant' || roleType === 'model' || 
               hasMindMap || hasQuiz || hasExercise || hasExplanation;
  
  const role = isAi ? Role.MODEL : Role.USER;
  const timestamp = row.id ? row.id * 1000 : Date.now();

  // 3. Extraction du texte (priorité aux textes humains, sinon fallback)
  let text = data.text || data.summary || data.explanation || data.question || msgRaw.text || msgRaw.content || '';
  if (typeof text !== 'string') text = ""; // On ne stringifie pas les objets ici pour éviter de polluer l'UI

  const message: Message = {
    id: row.id?.toString() || `msg-${timestamp}`,
    role,
    text,
    timestamp,
    ...msgRaw.metadata
  };

  // 4. Attribution des données structurées pour les composants UI spécialisés
  if (isAi) {
    // Cas MIND MAP
    // Fix: Use moduleData instead of non-existent mindMapData
    if (hasMindMap) {
      const rawMM = data.mindmap_data || data;
      message.moduleData = {
        type: 'mindmap_request',
        domain: data.domain || 'data_science',
        source: data.source || 'supabase',
        mindmap_data: {
            root_node: rawMM.root_node || 'Concept',
            root_description: rawMM.root_description || '',
            branches: Array.isArray(rawMM.branches) ? rawMM.branches : []
        }
      } as any;
      // On vide le texte si c'est une pure mindmap pour éviter les doublons JSON affichés
      if (!message.text || message.text.startsWith('{')) message.text = "";
    } 
    // Cas EXPLICATION
    // Fix: Use moduleData instead of non-existent explanationData
    else if (hasExplanation) {
      message.moduleData = {
        type: 'explanation_request',
        domain: data.domain || 'Data Science',
        source: data.source || 'n8n/supabase',
        explanation: data.explanation || text
      } as any;
      if (text === data.explanation) message.text = "";
    } 
    // Cas EXERCICE
    // Fix: Use moduleData instead of non-existent exerciseData
    else if (hasExercise) {
      message.moduleData = {
        type: 'exercise',
        title: data.topic || data.title || 'Exercice',
        difficulty: data.difficulty || 'Intermediate',
        context: data.question || data.context || '', 
        tasks: Array.isArray(data.tasks) ? data.tasks : [data.question || 'Résoudre l\'exercice'],
        hints: data.hints || (data.hint ? [data.hint] : []),
        solution: data.solution || ''
      } as any;
      message.text = "";
    } 
    // Cas QUIZ (Historique statique)
    // Fix: Use moduleData instead of non-existent quizBatchData
    else if (hasQuiz) {
      message.moduleData = {
        topic: data.topic || data.quiz_title || 'Quiz Recap',
        type: 'quiz_batch',
        difficulty: data.difficulty || 'History',
        quiz_items: Array.isArray(data.quiz_items) ? data.quiz_items : (Array.isArray(data.questions) ? data.questions : []),
        source: data.source || 'supabase'
      } as any;
      message.text = "";
    }
  }

  return message;
};

export const fetchSessions = async (userId: string): Promise<ChatSession[]> => {
  try {
    const { data, error } = await supabase
      .from('langchain_chat_histories')
      .select('id, session_id, message')
      .eq('user_id', userId)
      .order('id', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    const sessionsMap: Record<string, { id: string, title: string, lastId: number }> = {};
    data.forEach((row: any) => {
      const sid = row.session_id;
      const contentData = getOutputData(row.message);
      const content = contentData.text || contentData.explanation || contentData.summary || 'Discussion';
      
      if (!sessionsMap[sid]) {
        sessionsMap[sid] = { 
          id: sid, 
          title: content.length > 40 ? content.substring(0, 40) + '...' : content, 
          lastId: row.id 
        };
      } else if (row.id > sessionsMap[sid].lastId) {
        sessionsMap[sid].lastId = row.id;
      }
    });

    return Object.values(sessionsMap)
      .map(s => ({
        id: s.id, 
        title: s.title,
        timestamp: s.lastId * 1000
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (err: any) {
    console.warn('Erreur fetchSessions:', err.message);
    return []; 
  }
};

export const loadSessionMessages = async (userId: string, sessionId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('langchain_chat_histories')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('id', { ascending: true });

    if (error) throw error;
    return (data || []).map(normalizeRow);
  } catch (err: any) {
    console.warn('Erreur loadSessionMessages:', err.message);
    return [];
  }
};

export const clearSession = async (userId: string, sessionId: string) => {
  const { error } = await supabase
    .from('langchain_chat_histories')
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', userId);
  if (error) throw error;
};

export const clearHistory = async (userId: string) => {
  const { error } = await supabase
    .from('langchain_chat_histories')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
};
