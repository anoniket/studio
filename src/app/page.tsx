'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/hooks/useGame';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Users, Wand2 } from 'lucide-react';
import type { GameSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

const mockPlayers = [
  { name: 'You', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026708d' },
  { name: 'AI Bot', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
];

export default function HomePage() {
  const router = useRouter();
  const { startGame, isLoading } = useGame();
  const { toast } = useToast();
  const [settings, setSettings] = useState<GameSettings>({
    numberOfQuestions: 5,
    difficulty: 'medium',
    topic: '',
  });

  const handleStartGame = async () => {
    try {
      await startGame(settings);
      router.push('/quiz');
    } catch (error) {
      toast({
        title: 'Error starting game',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  const handleSettingChange = (field: keyof GameSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-primary">New Battle</CardTitle>
            <CardDescription>Configure your IQ challenge and start the battle!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={settings.difficulty}
                onValueChange={(value) => handleSettingChange('difficulty', value)}
              >
                <SelectTrigger id="difficulty" className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="questions">Number of Questions</Label>
              <Select
                value={String(settings.numberOfQuestions)}
                onValueChange={(value) => handleSettingChange('numberOfQuestions', Number(value))}
              >
                <SelectTrigger id="questions" className="w-full">
                  <SelectValue placeholder="Select number of questions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic (Optional)</Label>
              <Input
                id="topic"
                placeholder="e.g., Logical Reasoning, Mathematics"
                value={settings.topic}
                onChange={(e) => handleSettingChange('topic', e.target.value)}
              />
            </div>
            <Button size="lg" className="w-full font-bold text-lg" onClick={handleStartGame} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-5 w-5" />
              )}
              Start Battle
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-primary">
                        <Users />
                        Players in Lobby
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    {mockPlayers.map((player, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                        <Avatar>
                        <AvatarImage src={`https://picsum.photos/seed/${index+10}/40/40`} data-ai-hint="person face" />
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{player.name}</span>
                    </div>
                    ))}
                </CardContent>
            </Card>
            <div className="relative h-64 w-full rounded-lg overflow-hidden shadow-lg">
                 <Image src="https://picsum.photos/seed/brain/600/400" layout="fill" objectFit="cover" alt="Brain illustration" data-ai-hint="brain illustration" />
                 <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                 <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-headline text-xl font-bold">Challenge Yourself</h3>
                    <p className="text-sm">New questions every time.</p>
                 </div>
            </div>
        </div>
      </div>
    </MainLayout>
  );
}
