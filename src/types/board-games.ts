export interface BoardGameRule {
  id: string;
  title: string;
  category: string;
  summary: string;
  details: string[];
  tags: string[];
  module?: string;
  moduleName?: string;
  step?: number;
  mandatory?: boolean;
}

export interface BoardGameModule {
  id: string;
  name: string;
  defaultEnabled: boolean;
}

export interface GearReference {
  id: string;
  gear: number;
  cards: number;
  cooldown: number;
}

export interface CircuitReference {
  id: string;
  name: string;
  laps: number;
  corners: number;
  heat: number;
  stress: number;
}

export interface BoardGamePotion {
  id: string;
  name: string;
  originalName: string;
  effect: string;
  notes: string[];
  tags: string[];
  causesExplosion: boolean;
}

export interface BoardGame {
  schemaVersion: string;
  id: string;
  title: string;
  edition: string;
  language: string;
  players: { min: number; max: number };
  durationMinutes: { min: number; max: number };
  sources: { id: string; label: string; url: string }[];
  disclaimer: string;
  ingredients: { id: string; name: string; color: string }[];
  setup: BoardGameRule[];
  rules: BoardGameRule[];
  potions?: BoardGamePotion[];
  potionSetup?: {
    activeTypeCount: number;
    startingPotionsPerPlayer: number;
    startingCopiesPerType: number;
  };
  scoring?: {
    skillTokenPoints: number;
    professorHelpPenalty: number;
    formula: string;
  };
  endGameSkillTokensByPlayerCount?: Record<string, number>;
  searchSynonyms: Record<string, string[]>;
  sourceNotes: Record<string, string>;
  modules?: BoardGameModule[];
  racingReference?: {
    module: string;
    gears: GearReference[];
    circuits: CircuitReference[];
  };
}

/** Presentation model shared by rules and game-specific catalogs. */
export interface BoardGameEntry {
  id: string;
  title: string;
  image?: string;
  subtitle?: string;
  category: string;
  summary: string;
  details: string[];
  tags: string[];
  module?: string;
  moduleName?: string;
  step?: number;
  mandatory?: boolean;
}
