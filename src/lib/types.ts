export type IQQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

export type Player = {
  id: string;
  name: string;
  score: number;
  avatar: string;
};

export type GameSettings = {
  numberOfQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
};

export type GameResult = {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  settings: GameSettings;
};
