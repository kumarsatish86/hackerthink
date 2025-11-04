export interface Quiz {
  id: number;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_time?: number;
  passing_score: number;
  randomize_questions: boolean;
  randomize_answers: boolean;
  status: 'draft' | 'published' | 'archived';
  created_by?: number;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  question_count?: number;
  category_names?: string[];
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'multiple_select' | 'true_false';
  order_in_quiz: number;
  explanation_text?: string;
  related_article_url?: string;
  created_at: string;
  updated_at: string;
  options?: QuizQuestionOption[];
}

export interface QuizQuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
  order_in_question: number;
}

export interface QuizCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  quiz_count?: number;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  user_id?: number;
  session_id?: string;
  start_time: string;
  end_time?: string;
  score?: number;
  is_completed: boolean;
  time_taken?: number;
  created_at: string;
  quiz?: Quiz;
  responses?: QuizResponse[];
}

export interface QuizResponse {
  id: number;
  attempt_id: number;
  question_id: number;
  selected_option_ids: number[];
  is_correct?: boolean;
  time_spent?: number;
  created_at: string;
  question?: QuizQuestion;
}

export interface QuizCreateData {
  title: string;
  slug?: string;
  description?: string;
  thumbnail_url?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_time?: number;
  passing_score?: number;
  randomize_questions?: boolean;
  randomize_answers?: boolean;
  status?: 'draft' | 'published' | 'archived';
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  category_ids?: number[];
}

export interface QuizQuestionCreateData {
  question_text: string;
  question_type: 'multiple_choice' | 'multiple_select' | 'true_false';
  order_in_quiz?: number;
  explanation_text?: string;
  related_article_url?: string;
  options: QuizQuestionOptionCreateData[];
}

export interface QuizQuestionOptionCreateData {
  option_text: string;
  is_correct: boolean;
  order_in_question?: number;
}

export interface QuizAnalytics {
  total_attempts: number;
  completed_attempts: number;
  average_score: number;
  completion_rate: number;
  pass_rate: number;
  average_time_taken: number;
  frequently_missed_questions: Array<{
    question_id: number;
    question_text: string;
    miss_count: number;
    miss_percentage: number;
  }>;
  score_distribution: Array<{
    range: string;
    count: number;
  }>;
  attempts_over_time?: Array<{
    date: string;
    count: number;
  }>;
}

