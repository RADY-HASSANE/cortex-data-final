
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

// Interfaces de base pour les modules
export interface BaseModuleResponse {
  type: string;
  source?: string;
}

export interface TutorResponse extends BaseModuleResponse {
  type: 'tutor_response';
  title: string;
  summary: string;
  sections: Array<{ id: string; heading: string; content: string }>;
  sources?: string[];
}

export interface ExerciseResponse extends BaseModuleResponse {
  type: 'exercise';
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  context: string;
  tasks: string[];
  hints?: string[];
  solution: string;
}

export interface ExplanationResponse extends BaseModuleResponse {
  type: 'explanation_request';
  domain: string;
  explanation: string;
}

export interface MindMapData extends BaseModuleResponse {
  type: 'mindmap_request';
  domain: string;
  mindmap_data: {
    root_node: string;
    root_description: string;
    branches: Array<{
      label: string;
      description: string;
      children: Array<{ label: string; description: string }>;
    }>;
  };
}

export interface QuizBatchData extends BaseModuleResponse {
  type: 'quiz_batch';
  topic: string;
  difficulty: string;
  quiz_items: Array<{
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }>;
}

export interface AnalysisResponse extends BaseModuleResponse {
  type: 'data_analysis';
  dataset_name: string;
  insights: string[];
  visual_description?: string;
  code_snippet?: string;
}

/** Nouveau Module : DataCleaning **/
export interface DataCleaningResponse extends BaseModuleResponse {
  type: 'data_cleaning';
  target_issue: string;
  diagnosis: string;
  remedy_steps: string[];
  python_fix: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isError?: boolean;
  responseTime?: number; 
  audioUrl?: string;
  // Slots pour les données modulaires
  moduleData?: 
    | TutorResponse 
    | ExerciseResponse 
    | ExplanationResponse 
    | MindMapData 
    | QuizBatchData 
    | AnalysisResponse 
    | DataCleaningResponse;
  
  // Quiz interactif (Live)
  choices?: Record<string, string>; 
  selectedChoice?: string; 
  correctChoice?: string; 
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: { name?: string; [key: string]: any };
}

export interface TopicSuggestion {
  label: string;
  prompt: string;
  icon: string;
}

export interface Session {
  user: User | null;
  access_token?: string;
}
