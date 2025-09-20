'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/hooks/useGame';
import { MainLayout } from '@/components/layout/MainLayout';
import { Loader2 } from 'lucide-react';
import { QuestionView } from '@/components/QuestionView';

export default function QuizPage() {
  const router = useRouter();
  const { state } = useGame();
  const { status, questions, currentQuestionIndex } = state;

  useEffect(() => {
    if (status === 'setup') {
      router.replace('/');
    } else if (status === 'results') {
      router.replace('/results');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'setup') {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <h2 className="text-2xl font-headline font-semibold">Generating your battle...</h2>
          <p className="text-muted-foreground">Please wait while we craft your unique set of questions.</p>
        </div>
      </MainLayout>
    );
  }

  if (status === 'playing' && questions.length > 0) {
    const question = questions[currentQuestionIndex];
    return (
      <MainLayout>
        <QuestionView question={question} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
          <h2 className="text-2xl font-headline font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">Could not load the quiz. Please try again.</p>
        </div>
    </MainLayout>
  );
}
