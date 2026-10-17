import { playerKey, uniquePlayerNames } from './participants';
import { shuffleItems } from './random';
export { playerKey, uniquePlayerNames, initialParticipantListId } from './participants';

export interface HeatPlayer {
  name: string;
  color: string;
}

export interface HeatGridPosition extends HeatPlayer {
  position: number;
}

export function validColorPreferences(value: unknown, colors: string[]): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([name, color]) => playerKey(name) && typeof color === 'string' && colors.includes(color),
      )
      .map(([name, color]) => [playerKey(name), color as string]),
  );
}

/** Keep current choices first, restore available preferences, then fill unused colors. */
export function assignPlayerColors(
  names: string[],
  colors: string[],
  preferences: Record<string, string>,
  current: HeatPlayer[] = [],
): HeatPlayer[] {
  const uniqueNames = uniquePlayerNames(names);
  const available = new Set(colors);
  if (uniqueNames.length > available.size) throw new RangeError('Not enough unique car colors');
  const players = uniqueNames.map((name) => ({ name, color: '' }));
  for (const player of players) {
    const color = current.find(
      (candidate) => playerKey(candidate.name) === playerKey(player.name),
    )?.color;
    if (color && available.delete(color)) player.color = color;
  }
  for (const player of players) {
    if (player.color) continue;
    const preferred = preferences[playerKey(player.name)];
    if (preferred && available.delete(preferred)) player.color = preferred;
  }
  for (const player of players) {
    if (player.color) continue;
    const color = available.values().next().value;
    if (color) {
      player.color = color;
      available.delete(color);
    }
  }
  return players;
}

/** Choosing an occupied color swaps it with the player's previous color. */
export function changePlayerColor(
  players: HeatPlayer[],
  name: string,
  color: string,
): HeatPlayer[] {
  const target = players.find((player) => playerKey(player.name) === playerKey(name));
  if (!target || !color) return players;
  return players.map((player) => {
    if (player === target) return { ...player, color };
    return player.color === color ? { ...player, color: target.color } : { ...player };
  });
}

/** Fisher–Yates, the same approach used by the existing team draw. */
export function drawStartingGrid(
  players: HeatPlayer[],
  random: () => number = Math.random,
): HeatGridPosition[] {
  const shuffled = shuffleItems(players, random);
  return shuffled.map((player, index) => ({ ...player, position: index + 1 }));
}

export function drawCircuit<T>(circuits: T[], random: () => number = Math.random): T | undefined {
  return circuits[Math.floor(random() * circuits.length)];
}
