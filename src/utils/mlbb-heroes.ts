import { shuffleItems } from './random';

export const MLBB_CLASSES = ['tank', 'fighter', 'assassin', 'mage', 'marksman', 'support'] as const;
export interface MlbbHero {
  id: string;
  name: string;
  localImage: string;
  classes: string[];
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
    .filter((pool) => pool.heroes.length >= 2);
}
/** Draw the class uniformly first, then two different heroes within that class. */
export function drawMlbbHeroes(
  heroes: MlbbHero[],
  settings: MlbbHeroSettings,
  random = Math.random,
): MlbbHeroPick | null {
  const pools = heroPools(heroes, settings);
  if (!pools.length) return null;
  const pool = pools[Math.floor(random() * pools.length)]!;
  const picks = shuffleItems(pool.heroes, random);
  return { classId: pool.classId, heroAId: picks[0]!.id, heroBId: picks[1]!.id };
}
export function validHeroPick(pick: MlbbHeroPick, heroes: MlbbHero[], settings: MlbbHeroSettings) {
  return (
    pick.heroAId !== pick.heroBId &&
    heroPools(heroes, settings).some(
      (pool) =>
        pool.classId === pick.classId &&
        [pick.heroAId, pick.heroBId].every((id) => pool.heroes.some((hero) => hero.id === id)),
    )
  );
}
