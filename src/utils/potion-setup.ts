import { shuffleItems } from './random';

export interface PotionSetupConfig {
  activeTypeCount: number;
  startingPotionsPerPlayer: number;
  startingCopiesPerType: number;
}

export interface PotionStartingHand {
  player: string;
  potionIds: string[];
}

export function drawPotionTypes(
  ids: string[],
  count: number,
  random: () => number = Math.random,
): string[] {
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    count > ids.length ||
    new Set(ids).size !== ids.length
  ) {
    throw new RangeError('Invalid active potion pool');
  }
  return shuffleItems(ids, random).slice(0, count);
}

/** Choose who starts; preserve the relative order of the selected players. */
export function drawPotionPlayerOrder(
  names: string[],
  random: () => number = Math.random,
): string[] {
  if (!names.length) return [];
  const start = Math.floor(random() * names.length);
  return [...names.slice(start), ...names.slice(0, start)];
}

export function dealStartingPotions(
  order: string[],
  activeIds: string[],
  config: PotionSetupConfig,
  random: () => number = Math.random,
): PotionStartingHand[] {
  if (
    !Number.isInteger(config.startingCopiesPerType) ||
    config.startingCopiesPerType < 1 ||
    !Number.isInteger(config.startingPotionsPerPlayer) ||
    config.startingPotionsPerPlayer < 1 ||
    activeIds.length !== config.activeTypeCount ||
    new Set(activeIds).size !== activeIds.length ||
    new Set(order).size !== order.length ||
    order.length * config.startingPotionsPerPlayer > activeIds.length * config.startingCopiesPerType
  ) {
    throw new RangeError('Invalid starting potion stock');
  }
  const stock = shuffleItems(
    activeIds.flatMap((id) => Array<string>(config.startingCopiesPerType).fill(id)),
    random,
  );
  const hands = order.map((player) => ({ player, potionIds: [] as string[] }));
  // Alternate normal/reverse order, matching the two passes described in setup.
  for (let pass = 0; pass < config.startingPotionsPerPlayer; pass++) {
    const sequence = pass % 2 === 0 ? hands : [...hands].reverse();
    for (const hand of sequence) {
      const potion = stock.shift();
      if (potion !== undefined) hand.potionIds.push(potion);
    }
  }
  return hands;
}
