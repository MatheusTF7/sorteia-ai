import type { BoardGame } from '../types/board-games';

interface BoardGameRegistration {
  load: () => Promise<BoardGame>;
}

// Explicit imports keep datasets type-checked and included in the PWA precache.
// Add future games here; routes and the companion page remain shared.
export const boardGames: Record<string, BoardGameRegistration> = {
  'potion-explosion': {
    load: async (): Promise<BoardGame> => {
      const { default: game } = await import('../../public/data/board-games/potion-explosion.json');
      return game;
    },
  },
};
