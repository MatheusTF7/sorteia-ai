import { shuffleItems } from './random';

export const MLBB_CLASSES = ['tank', 'fighter', 'assassin', 'mage', 'marksman', 'support'] as const;
export const MLBB_DRAW_MODES = ['uniform', 'avoid-counters', 'balanced'] as const;
export type MlbbHeroDrawMode = (typeof MLBB_DRAW_MODES)[number];
/** Default and limits, in percentage points, for the win rate gap in balanced draws. */
export const MLBB_WIN_RATE_GAP = { default: 3, min: 0.5, max: 15 } as const;
export interface MlbbHeroStats {
  /** Percentages as published by the source, e.g. 52.3 means 52.3%. */
  winRate: number;
  pickRate: number;
  banRate: number;
  position: number;
}
export interface MlbbHero {
  id: string;
  name: string;
  localImage: string;
  classes: string[];
  stats?: MlbbHeroStats;
  /** IDs listed by the source as counters of this hero. */
  counters?: string[];
}
export interface MlbbHeroPick {
  classId: string;
  heroAId: string;
  heroBId: string;
}
export interface MlbbHeroSettings {
  classes: string[];
  bannedIds: string[];
  overrides: Record<string, string[]>;
  /** Missing means 'uniform', which keeps tournaments saved before this option unchanged. */
  drawMode?: MlbbHeroDrawMode;
  /** Maximum win rate difference for 'balanced', in percentage points. */
  maxWinRateGap?: number;
}
/** IDs of either hero that the source lists as a counter of the other one. */
export function counterRelations(a: MlbbHero, b: MlbbHero) {
  return {
    aCountersB: b.counters?.includes(a.id) ?? false,
    bCountersA: a.counters?.includes(b.id) ?? false,
  };
}
export function compatibleHeroes(a: MlbbHero, b: MlbbHero, settings: MlbbHeroSettings) {
  const mode = settings.drawMode ?? 'uniform';
  if (a.id === b.id) return false;
  if (mode === 'uniform') return true;
  const relations = counterRelations(a, b);
  if (relations.aCountersB || relations.bCountersA) return false;
  if (mode === 'avoid-counters') return true;
  // Balanced draws need data on both sides; a hero without stats cannot be compared.
  if (!a.stats || !b.stats) return false;
  const gap = settings.maxWinRateGap ?? MLBB_WIN_RATE_GAP.default;
  return Math.abs(a.stats.winRate - b.stats.winRate) <= gap + 1e-9;
}
function compatiblePairs(heroes: MlbbHero[], settings: MlbbHeroSettings) {
  const pairs: [MlbbHero, MlbbHero][] = [];
  for (let i = 0; i < heroes.length; i++)
    for (let j = i + 1; j < heroes.length; j++)
      if (compatibleHeroes(heroes[i]!, heroes[j]!, settings)) pairs.push([heroes[i]!, heroes[j]!]);
  return pairs;
}
function hasCompatiblePair(heroes: MlbbHero[], settings: MlbbHeroSettings) {
  return heroes.some((a, i) => heroes.slice(i + 1).some((b) => compatibleHeroes(a, b, settings)));
}
export function heroPools(heroes: MlbbHero[], settings: MlbbHeroSettings) {
  return MLBB_CLASSES.filter((id) => settings.classes.includes(id))
    .map((classId) => ({
      classId,
      heroes: heroes.filter(
        (hero) =>
          !settings.bannedIds.includes(hero.id) &&
          (settings.overrides[hero.id] ?? hero.classes).includes(classId),
      ),
    }))
    .filter((pool) => pool.heroes.length >= 2 && hasCompatiblePair(pool.heroes, settings));
}
/**
 * Draw the class uniformly among classes with at least one allowed pair, then the heroes.
 * Uniform mode shuffles the pool; the other modes pick one allowed pair uniformly and a random side.
 */
export function drawMlbbHeroes(
  heroes: MlbbHero[],
  settings: MlbbHeroSettings,
  random = Math.random,
): MlbbHeroPick | null {
  const pools = heroPools(heroes, settings);
  if (!pools.length) return null;
  const pool = pools[Math.floor(random() * pools.length)]!;
  if ((settings.drawMode ?? 'uniform') === 'uniform') {
    const picks = shuffleItems(pool.heroes, random);
    return { classId: pool.classId, heroAId: picks[0]!.id, heroBId: picks[1]!.id };
  }
  const pairs = compatiblePairs(pool.heroes, settings);
  const [a, b] = pairs[Math.floor(random() * pairs.length)]!;
  const [heroA, heroB] = random() < 0.5 ? [a, b] : [b, a];
  return { classId: pool.classId, heroAId: heroA.id, heroBId: heroB.id };
}
export function validHeroPick(pick: MlbbHeroPick, heroes: MlbbHero[], settings: MlbbHeroSettings) {
  const pool = heroPools(heroes, settings).find((pool) => pool.classId === pick.classId);
  const heroA = pool?.heroes.find((hero) => hero.id === pick.heroAId);
  const heroB = pool?.heroes.find((hero) => hero.id === pick.heroBId);
  return !!heroA && !!heroB && compatibleHeroes(heroA, heroB, settings);
}
