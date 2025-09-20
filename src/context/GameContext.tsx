'use client';

import React, { createContext, useReducer, ReactNode, useCallback } from 'react';
import { getQuizQuestions } from '@/app/actions';
import type { IQQuestion, Player, GameSettings, GameResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const QUESTION_TIME_LIMIT = 30; // seconds

type GameStatus = 'setup' | 'loading' | 'playing' | 'results';

type State = {
  status: GameStatus;
  settings: GameSettings | null;
  questions: IQQuestion[];
  currentQuestionIndex: number;
  players: Player[];
  startTime: number;
};

type Action =
  | { type: 'START_GAME'; payload: { settings: GameSettings; players: Player[] } }
  | { type: 'QUESTIONS_LOADED'; payload: { questions: IQQuestion[] } }
  | { type: 'QUESTIONS_FAILED' }
  | { type: 'ANSWER_QUESTION'; payload: { playerId: string; score: number } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' };

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
};

const GameReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        status: 'loading',
        settings: action.payload.settings,
        players: initialState.players, // Keep initial players with AI
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
    case 'ANSWER_QUESTION':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.playerId
            ? { ...p, score: p.score + action.payload.score }
            : p
        ),
      };
    case 'NEXT_QUESTION':
      if (state.currentQuestionIndex < state.questions.length - 1) {
        return {
          ...state,
          currentQuestionIndex: state.currentQuestionIndex + 1,
          startTime: Date.now(),
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
  
  const aiAnswer = useCallback((question: IQQuestion) => {
    const aiPlayer = state.players.find(p => p.isAI);
    if (!aiPlayer) return;

    // Simulate AI thinking time
    const thinkingTime = Math.random() * 3 + 1; // 1-4 seconds
    
    setTimeout(() => {
        const difficulty = state.settings?.difficulty || 'medium';
        let chanceOfCorrect = 0.7; // Medium
        if (difficulty === 'easy') chanceOfCorrect = 0.9;
        if (difficulty === 'hard') chanceOfCorrect = 0.5;

        if (Math.random() < chanceOfCorrect) {
            // AI answers correctly
            const score = Math.max(10, 100 - Math.floor(thinkingTime * 2));
            dispatch({ type: 'ANSWER_QUESTION', payload: { playerId: aiPlayer.id, score } });
        } else {
            // AI answers incorrectly
            dispatch({ type: 'ANSWER_QUESTION', payload: { playerId: aiPlayer.id, score: 0 } });
        }
    }, thinkingTime * 1000);

  }, [state.players, state.settings?.difficulty]);


  const answerQuestion = (answerIndex: number) => {
    const question = state.questions[state.currentQuestionIndex];
    
    // User's answer
    if (question.answerIndex === answerIndex) {
      const timeTaken = (Date.now() - state.startTime) / 1000;
      const score = Math.max(10, 100 - Math.floor(timeTaken * 2));
      dispatch({ type: 'ANSWER_QUESTION', payload: { playerId: 'player1', score } });
    }

    // AI's answer
    aiAnswer(question);
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
