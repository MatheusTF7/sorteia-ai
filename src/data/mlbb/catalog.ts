import raw from './heroes.json';
import classification from './hero-roles.json';
import statistics from './hero-stats.json';
import type { MlbbHero } from 'src/utils/mlbb-heroes';

declare const require: {
  context(
    directory: string,
    recursive: boolean,
    pattern: RegExp,
  ): { (path: string): string | { default: string } };
};

// These entries describe navigation filters in the source, not playable heroes.
const filters = new Set(['all', 'gold-lane', 'jungle', 'roam', 'mid-lane', 'exp-lane']);
const roles: Record<string, string[]> = classification.roles;
const stats = new Map(statistics.heroes.map((hero) => [hero.id, hero]));
export const mlbbHeroes: MlbbHero[] = raw
  .filter((hero) => !filters.has(hero.id))
  .map((hero) => {
    const entry = stats.get(hero.id);
    return {
      id: hero.id,
      name: hero.name,
      // Square thumbnails fit the round avatars; the tall portraits in ./heroes stay in the repo.
      localImage: entry?.localImage ?? `heroes-mini/${hero.id}.png`,
      classes: roles[hero.id] ?? [],
      ...(entry && {
        stats: {
          winRate: entry.winRate,
          pickRate: entry.pickRate,
          banRate: entry.banRate,
          position: entry.position,
        },
        counters: entry.counters.map((counter) => counter.heroId),
      }),
    };
  });
export const mlbbStatsSource = {
  url: statistics.source,
  collectedAt: statistics.collectedAt,
  rank: statistics.rank,
  periodDays: statistics.periodDays,
};
// Explicit require.context keeps every thumbnail in Webpack's asset graph, including PWA builds.
const thumbnails = require.context('./heroes-mini', false, /\.png$/) as {
  (path: string): string | { default: string };
};
export function mlbbHeroImage(hero: MlbbHero): string {
  const image = thumbnails(`./${hero.localImage.split('/').at(-1)!}`);
  return typeof image === 'string' ? image : image.default;
}
