import type { BoardGameModule, CircuitReference, GearReference } from './board-games';

/** Source contract: Heat uses a different JSON schema from Potion Explosion. */
export interface HeatDataset {
  schemaVersion: string;
  id: string;
  slug: string;
  locale: string;
  name: string;
  publisher: string;
  players: { min: number; max: number };
  durationMinutes: number;
  edition: string;
  contentDisclaimer: string;
  sources: { label: string; url: string }[];
  modules: BoardGameModule[];
  playerAid: {
    turnSteps: { step: number; ruleId: string; mandatory: boolean }[];
    rules: {
      id: string;
      title: string;
      summary: string;
      tags: string;
      module: string;
      details?: string[];
      step?: number;
    }[];
  };
  quickReference: GearReference[];
  circuits: CircuitReference[];
  weatherReference: { physicalTokensRequired: boolean; notes: string };
  implementationNotes: string[];
}
