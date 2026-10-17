export interface HeatPlayer {
  name: string;
  color: string;
}

export interface HeatGridPosition extends HeatPlayer {
  position: number;
}

export function playerKey(name: string): string {
  return name.trim().normalize('NFC').replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
}

export function uniquePlayerNames(names: string[]): string[] {
  const seen = new Set<string>();
  return names
    .map((name) => name.trim())
    .filter((name) => {
      const key = playerKey(name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function initialParticipantListId(lists: { id: string; isDefault: boolean }[]): string {
  return (lists.length === 1 ? lists[0]?.id : lists.find((list) => list.isDefault)?.id) ?? '';
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
  const shuffled = players.map((player) => ({ ...player }));
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    const player = shuffled[index];
    const otherPlayer = shuffled[other];
    if (player && otherPlayer) {
      shuffled[index] = otherPlayer;
      shuffled[other] = player;
    }
  }
  return shuffled.map((player, index) => ({ ...player, position: index + 1 }));
}

export function drawCircuit<T>(circuits: T[], random: () => number = Math.random): T | undefined {
  return circuits[Math.floor(random() * circuits.length)];
}
