export interface BoardGameRule {
  id: string;
  title: string;
  category: string;
  summary: string;
  details: string[];
  tags: string[];
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
  scoring?: {
    skillTokenPoints: number;
    professorHelpPenalty: number;
    formula: string;
  };
  endGameSkillTokensByPlayerCount?: Record<string, number>;
  searchSynonyms: Record<string, string[]>;
  sourceNotes: Record<string, string>;
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
}
