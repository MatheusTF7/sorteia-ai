import type { RachaConfig, RachaPlayer, RachaState } from '../types/racha';
import { playerKey } from './participants';
import { shuffleItems } from './random';

export function emptyRacha(): RachaState {
  return {
    title: '',
    location: '',
    date: '',
    fee: 0,
    players: [],
    config: { mode: 'size', teamSize: 5, defineStarter: true },
    teams: [],
    starter: null,
  };
}

export function isRachaSeed(player: RachaPlayer): boolean {
  return player.goalkeeper || player.seed;
}

export function rachaTeamCount(players: RachaPlayer[], config: RachaConfig): number {
  const seeds = players.filter(isRachaSeed).length;
  if (config.mode === 'seeds') return seeds;
  if (!Number.isSafeInteger(config.teamSize) || config.teamSize < 1) return 0;
  return Math.max(Math.ceil(players.length / config.teamSize), seeds);
}

export function rachaDrawIssue(players: RachaPlayer[], config: RachaConfig) {
  if (players.length < 2) return 'players';
  if (config.mode === 'size' && (!Number.isSafeInteger(config.teamSize) || config.teamSize < 1)) {
    return 'size';
  }
  if (rachaTeamCount(players, config) < 2) return config.mode === 'seeds' ? 'seeds' : 'teams';
  return null;
}

/** Every seed, including every goalkeeper, occupies a different team. */
export function drawRachaTeams(
  players: RachaPlayer[],
  config: RachaConfig,
  random: () => number = Math.random,
): string[][] {
  if (rachaDrawIssue(players, config)) return [];
  const teams: string[][] = Array.from({ length: rachaTeamCount(players, config) }, () => []);
  const seeds = shuffleItems(players.filter(isRachaSeed), random);
  seeds.forEach((player, index) => teams[index]!.push(player.id));
  const others = shuffleItems(
    players.filter((player) => !isRachaSeed(player)),
    random,
  );
  // Fill the smallest teams first so sizes differ by at most one, even with many seeds.
  for (const player of others) {
    const smallest = Math.min(...teams.map((team) => team.length));
    teams.find((team) => team.length === smallest)!.push(player.id);
  }
  return shuffleItems(teams, random);
}

export function drawRachaStarter(teams: string[][], random: () => number = Math.random) {
  const largest = Math.max(0, ...teams.map((team) => team.length));
  const candidates = teams.filter((team) => team.length === largest).flat();
  return candidates[Math.floor(random() * candidates.length)] ?? null;
}

export function parseRachaNames(raw: string, existing: RachaPlayer[]): string[] {
  const seen = new Set(existing.map((player) => playerKey(player.name)));
  return raw
    .split(/[,;\n\r]+/)
    .map((name) => name.trim().replace(/\s+/g, ' '))
    .filter((name) => {
      const key = playerKey(name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Restore only well-formed data, including a complete, valid saved draw. */
export function restoreRacha(raw: unknown): RachaState {
  const state = emptyRacha();
  if (!isRecord(raw)) return state;
  for (const key of ['title', 'location', 'date'] as const) {
    if (typeof raw[key] === 'string') state[key] = raw[key];
  }
  if (typeof raw.fee === 'number' && Number.isFinite(raw.fee) && raw.fee >= 0) state.fee = raw.fee;
  if (isRecord(raw.config)) {
    state.config.mode = raw.config.mode === 'seeds' ? 'seeds' : 'size';
    if (Number.isSafeInteger(raw.config.teamSize) && Number(raw.config.teamSize) > 0) {
      state.config.teamSize = Number(raw.config.teamSize);
    }
    state.config.defineStarter = raw.config.defineStarter !== false;
  }
  const ids = new Set<string>();
  const names = new Set<string>();
  if (Array.isArray(raw.players)) {
    for (const player of raw.players as unknown[]) {
      if (
        !isRecord(player) ||
        typeof player.id !== 'string' ||
        !player.id ||
        typeof player.name !== 'string' ||
        !player.name.trim()
      )
        continue;
      const key = playerKey(player.name);
      if (ids.has(player.id) || names.has(key)) continue;
      ids.add(player.id);
      names.add(key);
      state.players.push({
        id: player.id,
        name: player.name.trim(),
        goalkeeper: player.goalkeeper === true,
        seed: player.seed === true,
        paid: player.paid === true,
      });
    }
  }
  if (!Array.isArray(raw.teams) || rachaDrawIssue(state.players, state.config)) return state;
  const teams = (raw.teams as unknown[]).filter(
    (team): team is string[] =>
      Array.isArray(team) && team.length > 0 && team.every((id: unknown) => typeof id === 'string'),
  );
  const drawn = teams.flat();
  const seedIds = new Set(state.players.filter(isRachaSeed).map((player) => player.id));
  const sizes = teams.map((team) => team.length);
  if (
    teams.length !== raw.teams.length ||
    teams.length !== rachaTeamCount(state.players, state.config) ||
    drawn.length !== ids.size ||
    new Set(drawn).size !== ids.size ||
    drawn.some((id) => !ids.has(id)) ||
    teams.some((team) => team.filter((id) => seedIds.has(id)).length > 1) ||
    Math.max(...sizes) - Math.min(...sizes) > 1 ||
    (state.config.mode === 'size' && Math.max(...sizes) > state.config.teamSize)
  )
    return state;
  state.teams = teams;
  state.starter =
    state.config.defineStarter && typeof raw.starter === 'string' && drawn.includes(raw.starter)
      ? raw.starter
      : null;
  return state;
}
