'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGame } from '@/hooks/useGame';
import type { IQQuestion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Bot, Loader, Check } from 'lucide-react';

const QUESTION_TIME_LIMIT = 30; // seconds

export function QuestionView({ question }: { question: IQQuestion }) {
  const { state, answerQuestion, nextQuestion } = useGame();
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  
  const { currentQuestionState } = state;

  const showResults = useMemo(() => {
    return currentQuestionState.userAnswered && currentQuestionState.aiAnswered;
  }, [currentQuestionState]);


  useEffect(() => {
    setTimeLeft(QUESTION_TIME_LIMIT);
    setUserAnswer(null);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  useEffect(() => {
    if (showResults) {
      const timer = setTimeout(() => {
        if (state.currentQuestionIndex < state.questions.length) {
          nextQuestion();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showResults, nextQuestion, state.currentQuestionIndex, state.questions.length]);
  
  const handleTimeUp = () => {
    if (userAnswer === null) {
      answerQuestion(-1); // Indicate time up for user
      setUserAnswer(-1);
    }
  }

  const handleAnswerClick = (index: number) => {
    if (userAnswer !== null) return;
    setUserAnswer(index);
    answerQuestion(index);
  };
  
  const getButtonClass = (index: number) => {
    if (!showResults) {
      if (index === userAnswer) {
        return 'bg-primary/80 ring-2 ring-primary';
      }
      return 'bg-secondary hover:bg-secondary/80';
    }
    
    // Show results
    if (index === question.answerIndex) {
      return 'bg-green-500 hover:bg-green-500 text-white';
    }
    if (index === userAnswer || index === currentQuestionState.aiAnswer) {
      return 'bg-red-500 hover:bg-red-500 text-white';
    }
    return 'bg-secondary opacity-50';
  };

  const getAIIcon = (index: number) => {
      if (showResults && index === currentQuestionState.aiAnswer) {
        if (currentQuestionState.aiAnswer === question.answerIndex) {
            return <CheckCircle className="text-white"/>;
        }
        return <XCircle className="text-white"/>;
      }
      return null;
  }
  
  const getUserIcon = (index: number) => {
      if (showResults && index === userAnswer) {
        if (userAnswer === question.answerIndex) {
            return <CheckCircle className="text-white"/>;
        }
        return <XCircle className="text-white"/>;
      }
      if (!showResults && index === userAnswer) {
          return <Check className="text-primary-foreground"/>;
      }
      return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
             <div className="flex items-center gap-4">
                <CardDescription>
                Question {state.currentQuestionIndex + 1} of {state.questions.length}
                </CardDescription>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {currentQuestionState.isAIThinking ? (
                        <>
                            <Loader className="h-4 w-4 animate-spin" />
                            <span>AI is thinking...</span>
                        </>
                    ) : currentQuestionState.aiAnswered ? (
                        <>
                            <Bot className="h-4 w-4 text-green-400"/>
                            <span>AI has answered!</span>
                        </>
                    ) : (
                        <>
                            <Bot className="h-4 w-4" />
                            <span>AI is waiting</span>
                        </>
                    )}
                </div>
            </div>
            <div className="text-lg font-bold font-mono bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center">
              {timeLeft}
            </div>
          </div>
          <Progress value={(timeLeft / QUESTION_TIME_LIMIT) * 100} className="w-full h-2" />
        </CardHeader>
        <CardContent className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-medium mb-8 min-h-[6rem]">
            {question.question}
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswerClick(index)}
                disabled={userAnswer !== null}
                className={cn('h-auto py-4 text-lg justify-between items-center whitespace-normal', getButtonClass(index))}
              >
                <span>{option}</span>
                <div className="flex gap-2">
                  {currentQuestionState.aiAnswer === index && <Bot />}
                  {userAnswer === index && !showResults && <div className="w-5" />}
                  {showResults && getUserIcon(index)}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      {showResults && question.explanation && (
        <Card className="mt-4 bg-card/80 backdrop-blur-sm border-border/50 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Explanation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{question.explanation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
