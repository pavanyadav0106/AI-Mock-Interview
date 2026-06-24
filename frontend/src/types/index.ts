export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CreateInterviewData {
  role: string;
  difficulty: string;
  totalQuestions: number;
  jobDescription?: string;
}

export interface SubmitAnswerData {
  answers: Array<{
    question: string;
    answer: string;
  }>;
}

export interface Interview {
  _id: string;
  userId: string;
  role: string;
  difficulty: string;
  totalQuestions: number;
  totalScore: number;
  createdAt: string;
  completedAt: string | null;
}

export interface Response {
  _id: string;
  interviewId: string;
  question: string;
  answer: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewWithResponses {
  interview: Interview;
  responses: Response[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}