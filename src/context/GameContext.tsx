'use client';

import React, { createContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { getQuizQuestions, getAIAnswer } from '@/app/actions';
import type { IQQuestion, Player, GameSettings, GameResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type GameStatus = 'setup' | 'loading' | 'playing' | 'results';

type QuestionState = {
  isAIThinking: boolean;
  aiAnswered: boolean;
  userAnswered: boolean;
  aiAnswer: number | null;
}

type State = {
  status: GameStatus;
  settings: GameSettings | null;
  questions: IQQuestion[];
  currentQuestionIndex: number;
  players: Player[];
  startTime: number;
  currentQuestionState: QuestionState;
};

type Action =
  | { type: 'START_GAME'; payload: { settings: GameSettings; players: Player[] } }
  | { type: 'QUESTIONS_LOADED'; payload: { questions: IQQuestion[] } }
  | { type: 'QUESTIONS_FAILED' }
  | { type: 'ANSWER_SUBMITTED'; payload: { playerId: string; score: number, answerIndex: number } }
  | { type: 'AI_THINKING' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' };

const initialQuestionState: QuestionState = {
  isAIThinking: false,
  aiAnswered: false,
  userAnswered: false,
  aiAnswer: null,
};

const initialState: State = {
  status: 'setup',
  settings: null,
  questions: [],
  currentQuestionIndex: 0,
  players: [
      { id: 'player1', name: 'You', score: 0, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d' },
      { id: 'player2', name: 'AI Bot', score: 0, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', isAI: true },
    ],
  startTime: 0,
  currentQuestionState: initialQuestionState
};

const GameReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        status: 'loading',
        settings: action.payload.settings,
        players: initialState.players,
      };
    case 'QUESTIONS_LOADED':
      return {
        ...state,
        status: 'playing',
        questions: action.payload.questions,
        currentQuestionIndex: 0,
        startTime: Date.now(),
      };
    case 'QUESTIONS_FAILED':
      return {
        ...state,
        status: 'setup',
      };
    case 'AI_THINKING':
      return {
          ...state,
          currentQuestionState: { ...state.currentQuestionState, isAIThinking: true },
      }
    case 'ANSWER_SUBMITTED':
      const isAI = action.payload.playerId === 'player2';
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? { ...p, score: p.score + action.payload.score }
            : p
        ),
        currentQuestionState: {
          ...state.currentQuestionState,
          isAIThinking: isAI ? false : state.currentQuestionState.isAIThinking,
          aiAnswered: isAI || state.currentQuestionState.aiAnswered,
          userAnswered: !isAI || state.currentQuestionState.userAnswered,
          aiAnswer: isAI ? action.payload.answerIndex : state.currentQuestionState.aiAnswer,
        }
      };
    case 'NEXT_QUESTION':
      if (state.currentQuestionIndex < state.questions.length - 1) {
        return {
          ...state,
          currentQuestionIndex: state.currentQuestionIndex + 1,
          startTime: Date.now(),
          currentQuestionState: initialQuestionState,
        };
      }
      return { ...state, status: 'results' };
    case 'END_GAME':
      return { ...state, status: 'results' };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
};

interface GameContextProps {
  state: State;
  isLoading: boolean;
  startGame: (settings: GameSettings) => Promise<void>;
  answerQuestion: (answerIndex: number) => void;
  nextQuestion: () => void;
  resetGame: () => void;
  saveResult: () => void;
}

export const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(GameReducer, initialState);
  const { toast } = useToast();

  const aiAnswer = useCallback(async (question: IQQuestion) => {
    const aiPlayer = state.players.find(p => p.isAI);
    if (!aiPlayer) return;

    dispatch({ type: 'AI_THINKING' });

    const startTime = Date.now();
    const aiAnswerIndex = await getAIAnswer({ question: question.question, options: question.options });
    const timeTaken = (Date.now() - startTime) / 1000;

    let score = 0;
    if (aiAnswerIndex === question.answerIndex) {
        score = Math.max(10, 100 - Math.floor(timeTaken * 2));
    }
    dispatch({ type: 'ANSWER_SUBMITTED', payload: { playerId: aiPlayer.id, score, answerIndex: aiAnswerIndex } });

  }, [state.players]);
  
  useEffect(() => {
    if (state.status === 'playing' && !state.currentQuestionState.aiAnswered && !state.currentQuestionState.isAIThinking) {
      const question = state.questions[state.currentQuestionIndex];
      aiAnswer(question);
    }
  }, [state.status, state.currentQuestionIndex, state.questions, aiAnswer, state.currentQuestionState.aiAnswered, state.currentQuestionState.isAIThinking]);


  const startGame = async (settings: GameSettings) => {
    dispatch({ type: 'START_GAME', payload: { settings, players: initialState.players } });
    try {
      const questions = await getQuizQuestions(settings);
      if (questions.length === 0) {
        throw new Error('No questions were generated. Please try again.');
      }
      dispatch({ type: 'QUESTIONS_LOADED', payload: { questions } });
    } catch (error) {
      dispatch({ type: 'QUESTIONS_FAILED' });
      const message = error instanceof Error ? error.message : 'Failed to fetch questions.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      throw error;
    }
  };

  const answerQuestion = (answerIndex: number) => {
    if (state.currentQuestionState.userAnswered) return;
    
    const question = state.questions[state.currentQuestionIndex];
    const userPlayer = state.players.find(p => !p.isAI)!;
    
    let score = 0;
    if (answerIndex !== -1) { // -1 indicates time up
        if (question.answerIndex === answerIndex) {
          const timeTaken = (Date.now() - state.startTime) / 1000;
          score = Math.max(10, 100 - Math.floor(timeTaken * 2));
        }
    }
    dispatch({ type: 'ANSWER_SUBMITTED', payload: { playerId: userPlayer.id, score, answerIndex } });
  };

  const nextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };
  
  const saveResult = () => {
    if (!state.settings || !state.players.find(p => !p.isAI)) return;
    const userPlayer = state.players.find(p => !p.isAI)!;
    const result: GameResult = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        score: userPlayer.score,
        totalQuestions: state.questions.length,
        settings: state.settings,
    };

    try {
        const history = JSON.parse(localStorage.getItem('brainbattle-history') || '[]');
        history.unshift(result);
        localStorage.setItem('brainbattle-history', JSON.stringify(history.slice(0, 20)));
    } catch (error) {
        console.error("Could not save game result to local storage", error);
    }
  }

  const isLoading = state.status === 'loading';

  return (
    <GameContext.Provider value={{ state, isLoading, startGame, answerQuestion, nextQuestion, resetGame, saveResult }}>
      {children}
    </GameContext.Provider>
  );
};
