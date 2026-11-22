import raw from './heroes.json';
import classification from './hero-roles.json';
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
export const mlbbHeroes: MlbbHero[] = raw
  .filter((hero) => !filters.has(hero.id))
  .map((hero) => ({
    id: hero.id,
    name: hero.name,
    localImage: hero.localImage,
    classes: roles[hero.id] ?? [],
  }));
// Explicit require.context keeps every local portrait in Webpack's asset graph, including PWA builds.
const portraits = require.context('./heroes', false, /\.png$/) as {
  (path: string): string | { default: string };
};
export function mlbbHeroImage(hero: MlbbHero): string {
  const image = portraits(`./${hero.localImage.split('/').at(-1)!}`);
  return typeof image === 'string' ? image : image.default;
}
