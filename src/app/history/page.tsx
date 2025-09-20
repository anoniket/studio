'use client';
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp } from 'lucide-react';
import type { GameResult } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryPage() {
  const [history, setHistory] = useState<GameResult[]>([]);

  useEffect(() => {
    try {
      const storedHistory = JSON.parse(localStorage.getItem('brainbattle-history') || '[]');
      setHistory(storedHistory);
    } catch (error) {
      console.error("Failed to load history from local storage", error);
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('brainbattle-history');
    setHistory([]);
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-headline font-bold text-primary">Your Battle History</h1>
        {history.length > 0 && (
          <Button variant="destructive" onClick={clearHistory}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">No battles fought yet!</CardTitle>
            <CardDescription>Complete a quiz to see your history here.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((result) => (
            <Card key={result.id} className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
              <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 items-center gap-4">
                <div className="col-span-2 md:col-span-1">
                  <p className="font-semibold text-lg">{formatDistanceToNow(new Date(result.date), { addSuffix: true })}</p>
                  <p className="text-sm text-muted-foreground capitalize">{result.settings.difficulty} &bull; {result.settings.topic || 'General'}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold text-primary">{result.score}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-2xl font-bold">
                    {Math.round((result.score / (result.totalQuestions * 100)) * 100)}%
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-center">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                    <div>
                        <p className="text-sm text-muted-foreground">Questions</p>
                        <p className="text-lg font-bold">{result.totalQuestions}</p>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
