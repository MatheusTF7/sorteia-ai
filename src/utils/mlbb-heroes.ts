import { shuffleItems } from './random';

export const MLBB_CLASSES = ['tank', 'fighter', 'assassin', 'mage', 'marksman', 'support'] as const;
export const MLBB_DRAW_MODES = [
  'uniform',
  'free',
  'avoid-counters',
  'balanced',
  'presets',
] as const;
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
  /** Set only for picks drawn from a curated matchup. */
  presetId?: string;
  /** Set only in free mode, where each side may come from a different class. */
  classBId?: string;
}
export interface MlbbDuelPreset {
  id: string;
  heroes: [string, string];
  title: Record<string, string>;
  description: Record<string, string>;
}
export interface MlbbDrawContext {
  presets?: MlbbDuelPreset[];
  /** Matchups already in use; they are drawn again only when every eligible one is taken. */
  usedPresetIds?: string[];
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
  if (mode === 'uniform' || mode === 'free' || mode === 'presets') return true;
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
function effectiveClasses(hero: MlbbHero, settings: MlbbHeroSettings) {
  return settings.overrides[hero.id] ?? hero.classes;
}
/** The first allowed class of a hero, in MLBB_CLASSES order, or undefined. */
function allowedClass(hero: MlbbHero, settings: MlbbHeroSettings) {
  return MLBB_CLASSES.find(
    (id) => settings.classes.includes(id) && effectiveClasses(hero, settings).includes(id),
  );
}
/** Free mode: every unbanned hero with at least one allowed class, each listed once. */
export function freeHeroPool(heroes: MlbbHero[], settings: MlbbHeroSettings) {
  return heroes.filter(
    (hero) => !settings.bannedIds.includes(hero.id) && allowedClass(hero, settings),
  );
}
/**
 * Curated matchups whose heroes are both unbanned and each have at least one allowed class.
 * The pick's class is the first allowed class of the first hero, kept for older readers of picks.
 */
export function eligiblePresets(
  heroes: MlbbHero[],
  settings: MlbbHeroSettings,
  presets: MlbbDuelPreset[],
) {
  const byId = new Map(heroes.map((hero) => [hero.id, hero]));
  return presets.flatMap((preset) => {
    const [a, b] = preset.heroes.map((id) => byId.get(id));
    if (!a || !b || a.id === b.id) return [];
    if ([a, b].some((hero) => settings.bannedIds.includes(hero.id))) return [];
    const classId = allowedClass(a, settings);
    return classId && allowedClass(b, settings) ? [{ preset, classId }] : [];
  });
}
/** Whether the current settings can produce at least one pick. */
export function canDrawHeroes(
  heroes: MlbbHero[],
  settings: MlbbHeroSettings,
  presets: MlbbDuelPreset[] = [],
) {
  if (settings.drawMode === 'presets') return eligiblePresets(heroes, settings, presets).length > 0;
  if (settings.drawMode === 'free') return freeHeroPool(heroes, settings).length >= 2;
  return heroPools(heroes, settings).length > 0;
}
export function heroPools(heroes: MlbbHero[], settings: MlbbHeroSettings) {
  return MLBB_CLASSES.filter((id) => settings.classes.includes(id))
    .map((classId) => ({
      classId,
      heroes: heroes.filter(
        (hero) =>
          !settings.bannedIds.includes(hero.id) &&
          effectiveClasses(hero, settings).includes(classId),
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
  context: MlbbDrawContext = {},
): MlbbHeroPick | null {
  if (settings.drawMode === 'presets') {
    const eligible = eligiblePresets(heroes, settings, context.presets ?? []);
    const unused = eligible.filter(({ preset }) => !context.usedPresetIds?.includes(preset.id));
    const options = unused.length ? unused : eligible;
    if (!options.length) return null;
    const { preset, classId } = options[Math.floor(random() * options.length)]!;
    const [heroAId, heroBId] =
      random() < 0.5 ? preset.heroes : [preset.heroes[1], preset.heroes[0]];
    return { classId, heroAId, heroBId, presetId: preset.id };
  }
  if (settings.drawMode === 'free') {
    // Every eligible hero has the same chance, whatever its class; hybrids are not counted twice.
    const [a, b] = shuffleItems(freeHeroPool(heroes, settings), random);
    if (!a || !b) return null;
    return {
      classId: allowedClass(a, settings)!,
      classBId: allowedClass(b, settings)!,
      heroAId: a.id,
      heroBId: b.id,
    };
  }
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
export function validHeroPick(
  pick: MlbbHeroPick,
  heroes: MlbbHero[],
  settings: MlbbHeroSettings,
  presets: MlbbDuelPreset[] = [],
) {
  // A pick belongs to the mode that drew it: switching modes redraws upcoming matches.
  if (settings.drawMode === 'presets') {
    const entry = eligiblePresets(heroes, settings, presets).find(
      ({ preset }) => preset.id === pick.presetId,
    );
    return (
      !!entry &&
      entry.classId === pick.classId &&
      [pick.heroAId, pick.heroBId].sort().join() === [...entry.preset.heroes].sort().join()
    );
  }
  if (pick.presetId) return false;
  if (settings.drawMode === 'free') {
    const pool = freeHeroPool(heroes, settings);
    const heroA = pool.find((hero) => hero.id === pick.heroAId);
    const heroB = pool.find((hero) => hero.id === pick.heroBId);
    return (
      !!heroA &&
      !!heroB &&
      heroA.id !== heroB.id &&
      pick.classId === allowedClass(heroA, settings) &&
      pick.classBId === allowedClass(heroB, settings)
    );
  }
  if (pick.classBId) return false;
  const pool = heroPools(heroes, settings).find((pool) => pool.classId === pick.classId);
  const heroA = pool?.heroes.find((hero) => hero.id === pick.heroAId);
  const heroB = pool?.heroes.find((hero) => hero.id === pick.heroBId);
  return !!heroA && !!heroB && compatibleHeroes(heroA, heroB, settings);
}
