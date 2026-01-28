
export interface Option {
  id: string;
  label: string;
  nextQuestionId?: string;
  isStar?: boolean; // Marqué pour le rapport final
}

export interface Question {
  id: string;
  text: string;
  description?: string;
  reassurance?: string; // Message de rassurance après la réponse
  options: Option[];
  isMultiSelect?: boolean;
  category?: 'travail' | 'symptomes' | 'lentilles' | 'besoins';
}

export interface UserResponse {
  questionId: string;
  questionText: string;
  answerLabel: string | string[];
  isStar?: boolean;
}

export interface UserInfo {
  lastName: string;
  firstName: string;
  age: number | '';
}

export interface Recommendation {
  title: string;
  explanation: string;
  keyFeatures: string[];
}
