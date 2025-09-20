'use client';

import { GameProvider } from './GameContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}
