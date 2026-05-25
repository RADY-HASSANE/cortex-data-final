
import { Message, Role } from '../types';
import { extractStructuredData } from './n8n';

/** 
 * Registre des Handlers de catégories. 
 * Chaque fonction transforme le JSON brut en moduleData typé.
 */
const CategoryHandlers: Record<string, (json: any) => any> = {
  explanation_request: (json) => ({
    type: 'explanation_request',
    domain: json.domain || 'Data Science',
    explanation: json.explanation || json.text || "",
    source: json.source || 'n8n AI'
  }),
  
  mindmap_request: (json) => ({
    type: 'mindmap_request',
    domain: json.domain || 'data_science',
    mindmap_data: json.mindmap_data || json
  }),

  exercise_delivery: (json) => ({
    type: 'exercise',
    title: json.topic || json.title || 'Exercice',
    difficulty: json.difficulty || 'Intermediate',
    context: json.question || json.context || '', 
    tasks: Array.isArray(json.tasks) ? json.tasks : (json.question ? [json.question] : []),
    hints: json.hints || (json.hint ? [json.hint] : []),
    solution: json.solution || ''
  }),

  quiz_batch: (json) => ({
    type: 'quiz_batch',
    topic: json.topic || json.quiz_title || 'Recap',
    difficulty: json.difficulty || 'Général',
    quiz_items: json.quiz_items || json.questions || []
  }),

  tutor_response: (json) => ({
    type: 'tutor_response',
    ...json
  }),

  data_analysis: (json) => ({
    type: 'data_analysis',
    ...json
  }),

  data_cleaning: (json) => ({
    type: 'data_cleaning',
    target_issue: json.target_issue || 'Qualité des données',
    diagnosis: json.diagnosis || '',
    remedy_steps: json.remedy_steps || [],
    python_fix: json.python_fix || ''
  })
};

export const processBotResponse = (responseText: string, duration: number): Message => {
  const { json, introText } = extractStructuredData(responseText);
  const timestamp = Date.now();
  
  let msg: Message = {
    id: (timestamp + 1).toString(),
    role: Role.MODEL,
    text: introText || (json ? "" : responseText),
    timestamp,
    responseTime: duration
  };

  if (!json) return msg;

  const type = json.category || json.type || 'generic';
  const handler = CategoryHandlers[type];

  if (handler) {
    msg.moduleData = handler(json);
  }

  return msg;
};
