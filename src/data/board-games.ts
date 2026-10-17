import type { BoardGame } from '../types/board-games';
import { normalizeHeatDataset } from './normalize-heat';

interface BoardGameRegistration {
  title: string;
  descriptionKey: string;
  icon: string;
  setupRoute?: string;
  load: () => Promise<BoardGame>;
}

// Explicit imports keep datasets type-checked and included in the PWA precache.
// Add future games here; routes and the companion page remain shared.
export const boardGames: Record<string, BoardGameRegistration> = {
  'potion-explosion': {
    title: 'Potion Explosion',
    descriptionKey: 'boardGames.homeDescription',
    icon: 'science',
    setupRoute: '/board-games/potion-explosion/setup',
    load: async (): Promise<BoardGame> => {
      const { default: game } = await import('../../public/data/board-games/potion-explosion.json');
      return game;
    },
  },
  'heat-pedal-to-the-metal': {
    title: 'Heat: Pedal to the Metal',
    descriptionKey: 'boardGames.heatDescription',
    icon: 'sports_motorsports',
    setupRoute: '/board-games/heat-pedal-to-the-metal/setup',
    load: async (): Promise<BoardGame> => {
      const { default: game } =
        await import('../../public/data/board-games/heat-pedal-to-the-metal.json');
      return normalizeHeatDataset(game);
    },
  },
};
