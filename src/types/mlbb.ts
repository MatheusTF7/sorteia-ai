export type MlbbBestOf = number;

export interface MlbbPlayer {
  id: string;
  name: string;
  gameId: string;
  serverId: string;
}

export interface MlbbRules {
  bestOf: MlbbBestOf;
  semifinalBestOf: MlbbBestOf;
  finalBestOf: MlbbBestOf;
  thirdPlace: 'none' | 'match' | 'champion-loser';
  thirdPlaceBestOf: MlbbBestOf;
  lane: string;
  victory: string;
  notes: string;
}

export interface MlbbGameScore {
  scoreA: number;
  scoreB: number;
  winnerId: string;
}

export interface MlbbResult {
  playerAId: string;
  playerBId: string;
  kind: 'score' | 'wo';
  scoreA: number;
  scoreB: number;
  winnerId: string;
  /** Scores within each game; scoreA/scoreB above continue to count series wins. */
  games?: MlbbGameScore[];
}

export interface MlbbTournament {
  heroSettings?: import('../utils/mlbb-heroes').MlbbHeroSettings;
  heroPicks?: Record<string, import('../utils/mlbb-heroes').MlbbHeroPick>;
  id: string;
  name: string;
  createdAt: string;
  players: MlbbPlayer[];
  rules: MlbbRules;
  /** A persisted permutation: rebuilding the bracket never draws again. */
  seededIds: string[];
  results: Record<string, MlbbResult>;
  draftNames: string;
}

export interface MlbbMatch {
  id: string;
  round: number;
  index: number;
  bestOf: MlbbBestOf;
  playerAId: string | null;
  playerBId: string | null;
  sourceA: string | null;
  sourceB: string | null;
  winnerId: string | null;
  status: 'bye' | 'ready' | 'waiting' | 'completed';
  result: MlbbResult | null;
}

export interface MlbbStore {
  version: 1;
  activeId: string;
  tournaments: MlbbTournament[];
}
