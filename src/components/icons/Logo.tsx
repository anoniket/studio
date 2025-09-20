import { BrainCircuit } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <BrainCircuit className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold font-headline text-foreground tracking-tight whitespace-nowrap">
        BrainBattle Arena
      </h1>
    </div>
  );
}
