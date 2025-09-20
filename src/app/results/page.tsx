'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/hooks/useGame';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Home, Repeat } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Confetti } from '@/components/Confetti';

export default function ResultsPage() {
  const router = useRouter();
  const { state, resetGame, saveResult } = useGame();
  const { status, players, questions } = state;

  useEffect(() => {
    if (status !== 'results') {
      router.replace('/');
    } else {
        saveResult();
    }
  }, [status, router, saveResult]);
  
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  if (status !== 'results') {
    return null; // Or a loading spinner
  }

  return (
    <MainLayout>
      <Confetti />
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">Battle Finished!</h1>
        <p className="text-xl text-muted-foreground mb-8">Here are the results. Well done, warrior!</p>
        
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayers.map((player, index) => (
                  <TableRow key={player.id} className="font-medium">
                    <TableCell className="text-2xl font-bold">{index + 1}</TableCell>
                    <TableCell className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={player.avatar} />
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {player.name}
                    </TableCell>
                    <TableCell className="text-right text-xl font-bold text-primary">{player.score}</TableCell>
                    <TableCell className="text-right">{player.score > 0 ? (Math.round((player.score/ (questions.length * 100)) * 100)) : 0}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" onClick={() => { resetGame(); router.push('/'); }}>
            <Repeat className="mr-2 h-5 w-5" />
            Play Again
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/history')}>
            <History className="mr-2 h-5 w-5" />
            View History
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
