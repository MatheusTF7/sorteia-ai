import type { RachaConfig, RachaPlayer, RachaState } from '../types/racha';
import { playerKey } from './participants';
import { shuffleItems } from './random';
import { addRachaMinutes, isRachaDate, isRachaTime } from './racha-schedule';

const PLAYER_WEIGHTS = { low: 1, medium: 2, high: 3 } as const;

function playerWeight(player: RachaPlayer): number {
  return PLAYER_WEIGHTS[player.weight] ?? PLAYER_WEIGHTS.medium;
}

export const RACHA_SPORT_PRESETS = [
  { sport: 'fut7', teamSize: 7 },
  { sport: 'futsal', teamSize: 5 },
  { sport: 'football', teamSize: 11 },
] as const;

export function emptyRacha(): RachaState {
  return {
    title: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    fee: 0,
    players: [],
    config: { mode: 'size', sport: 'fut7', teamSize: 7, defineStarter: true },
    teams: [],
    startingTeam: null,
    drawChanged: false,
    ui: {
      newNames: '',
      search: '',
      filter: 'all',
      detailsOpen: false,
      editPlayerId: '',
      editName: '',
      exportOpen: false,
      importOpen: false,
    },
  };
}

export function isRachaSeed(player: RachaPlayer): boolean {
  return player.goalkeeper || player.seed;
}

export function rachaTeamCount(players: RachaPlayer[], config: RachaConfig): number {
  const seeds = players.filter(isRachaSeed).length;
  if (config.mode === 'seeds') return seeds;
  if (!Number.isSafeInteger(config.teamSize) || config.teamSize < 1) return 0;
  return Math.ceil(players.length / config.teamSize);
}

/** Fixed capacities keep complete teams ahead of the remaining players. */
function rachaTeamSizes(players: RachaPlayer[], config: RachaConfig): number[] {
  const count = rachaTeamCount(players, config);
  return Array.from({ length: count }, (_, index) =>
    config.mode === 'size'
      ? Math.min(config.teamSize, players.length - index * config.teamSize)
      : Math.floor(players.length / count) + Number(index < players.length % count),
  );
}

export function rachaDrawIssue(players: RachaPlayer[], config: RachaConfig) {
  if (players.length < 2) return 'players';
  if (config.mode === 'size' && (!Number.isSafeInteger(config.teamSize) || config.teamSize < 1)) {
    return 'size';
  }
  if (rachaTeamCount(players, config) < 2) return config.mode === 'seeds' ? 'seeds' : 'teams';
  return null;
}

/** Complete the first teams, prioritizing goalkeepers and separating seeds where possible. */
export function drawRachaTeams(
  players: RachaPlayer[],
  config: RachaConfig,
  random: () => number = Math.random,
): string[][] {
  if (rachaDrawIssue(players, config)) return [];
  const sizes = rachaTeamSizes(players, config);
  const teams: string[][] = sizes.map(() => []);
  const seedCounts = sizes.map(() => 0);
  const scores = sizes.map(() => 0);
  const highCounts = sizes.map(() => 0);
  // Shuffle before sorting so equally rated players still participate in a random draw.
  const byWeight = (group: RachaPlayer[]) =>
    shuffleItems(group, random).sort((a, b) => playerWeight(b) - playerWeight(a));
  function assign(player: RachaPlayer, candidates: number[]) {
    const weight = playerWeight(player);
    const index = shuffleItems(candidates, random).sort((a, b) => {
      // Spread high-rated players first, including any already assigned in special roles.
      if (weight === PLAYER_WEIGHTS.high && highCounts[a] !== highCounts[b]) {
        return highCounts[a]! - highCounts[b]!;
      }
      return scores[a]! / sizes[a]! - scores[b]! / sizes[b]!;
    })[0]!;
    teams[index]!.push(player.id);
    scores[index]! += weight;
    if (weight === PLAYER_WEIGHTS.high) highCounts[index]! += 1;
    if (isRachaSeed(player)) seedCounts[index]! += 1;
  }
  const available = () =>
    sizes.map((_, index) => index).filter((index) => teams[index]!.length < sizes[index]!);
  // Place goalkeepers before other seeds so the opening teams get them first.
  const goalkeepers = byWeight(players.filter((player) => player.goalkeeper));
  goalkeepers.forEach((player, index) => {
    const candidates = available();
    if (index < teams.length) assign(player, [index]);
    else {
      const fewestSeeds = Math.min(...candidates.map((index) => seedCounts[index]!));
      assign(
        player,
        candidates.filter((index) => seedCounts[index] === fewestSeeds),
      );
    }
  });
  for (const player of byWeight(players.filter((player) => player.seed && !player.goalkeeper))) {
    const candidates = available();
    const fewestSeeds = Math.min(...candidates.map((index) => seedCounts[index]!));
    assign(
      player,
      candidates.filter((index) => seedCounts[index] === fewestSeeds),
    );
  }
  const others = byWeight(players.filter((player) => !isRachaSeed(player)));
  for (const player of others) {
    assign(player, available());
  }
  return teams;
}

export function drawRachaStartingTeam(teams: string[][], random: () => number = Math.random) {
  // Team 1 and Team 2 always play the opening match.
  return teams.length >= 2 ? Math.floor(random() * 2) : null;
}

export function parseRachaNames(raw: string, existing: RachaPlayer[]): string[] {
  const seen = new Set(existing.map((player) => playerKey(player.name)));
  return raw
    .split(/[,;\n\r]+/)
    .map((name) =>
      name
        .trim()
        // Remove leading list markers before normalizing and deduplicating names.
        .replace(
          /^(?:(?:\d+\s*[.)\-–—:º°ª]+|\(\s*\d+\s*\)|\[\s*\d+\s*\]|[-–—•●▪◦‣])\s*|[*+](?:\s+|$)|\d+\s+)+/u,
          '',
        )
        .trim()
        .replace(/\s+/g, ' '),
    )
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
  for (const key of ['title', 'location'] as const) {
    if (typeof raw[key] === 'string') state[key] = raw[key];
  }
  // Migrate the old datetime-local value while preserving the selected wall-clock time.
  const legacyDate =
    typeof raw.date === 'string'
      ? /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2})?$/.exec(raw.date)
      : null;
  const date = legacyDate?.[1] ?? raw.date;
  if (isRachaDate(date)) state.date = date;
  const start = raw.startTime ?? legacyDate?.[2];
  if (isRachaTime(start)) state.startTime = start;
  if (raw.endTime === '' || isRachaTime(raw.endTime)) state.endTime = raw.endTime;
  else if (state.startTime) state.endTime = addRachaMinutes(state.startTime);
  if (typeof raw.fee === 'number' && Number.isFinite(raw.fee) && raw.fee >= 0) state.fee = raw.fee;
  if (isRecord(raw.config)) {
    state.config.mode = raw.config.mode === 'seeds' ? 'seeds' : 'size';
    if (Number.isSafeInteger(raw.config.teamSize) && Number(raw.config.teamSize) > 0) {
      state.config.teamSize = Number(raw.config.teamSize);
    }
    const preset = RACHA_SPORT_PRESETS.find((item) => item.teamSize === state.config.teamSize);
    state.config.sport = raw.config.sport === 'custom' ? 'custom' : (preset?.sport ?? 'custom');
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
        weight: player.weight === 'low' || player.weight === 'high' ? player.weight : 'medium',
      });
    }
  }
  state.drawChanged = raw.drawChanged === true;
  if (isRecord(raw.ui)) {
    for (const key of ['newNames', 'search', 'editName'] as const) {
      if (typeof raw.ui[key] === 'string') state.ui[key] = raw.ui[key];
    }
    if (
      raw.ui.filter === 'goalkeepers' ||
      raw.ui.filter === 'seeds' ||
      raw.ui.filter === 'unpaid'
    ) {
      state.ui.filter = raw.ui.filter;
    }
    state.ui.detailsOpen = raw.ui.detailsOpen === true;
    state.ui.exportOpen = raw.ui.exportOpen === true;
    state.ui.importOpen = raw.ui.importOpen === true;
    if (typeof raw.ui.editPlayerId === 'string' && ids.has(raw.ui.editPlayerId)) {
      state.ui.editPlayerId = raw.ui.editPlayerId;
    } else {
      state.ui.editName = '';
    }
  }
  if (!Array.isArray(raw.teams) || rachaDrawIssue(state.players, state.config)) return state;
  const teams = (raw.teams as unknown[]).filter(
    (team): team is string[] =>
      Array.isArray(team) && team.length > 0 && team.every((id: unknown) => typeof id === 'string'),
  );
  const drawn = teams.flat();
  const seedIds = new Set(state.players.filter(isRachaSeed).map((player) => player.id));
  const goalkeeperIds = new Set(
    state.players.filter((player) => player.goalkeeper).map((player) => player.id),
  );
  const sizes = rachaTeamSizes(state.players, state.config);
  if (
    teams.length !== raw.teams.length ||
    teams.length !== rachaTeamCount(state.players, state.config) ||
    drawn.length !== ids.size ||
    new Set(drawn).size !== ids.size ||
    drawn.some((id) => !ids.has(id)) ||
    teams.some((team, index) => team.length !== sizes[index]) ||
    teams.filter((team) => team.some((id) => seedIds.has(id))).length !==
      Math.min(seedIds.size, teams.length) ||
    teams
      .slice(0, Math.min(goalkeeperIds.size, teams.length))
      .some((team) => !team.some((id) => goalkeeperIds.has(id)))
  ) {
    if (raw.teams.length) state.drawChanged = true;
    return state;
  }
  state.teams = teams;
  state.startingTeam =
    state.config.defineStarter && (raw.startingTeam === 0 || raw.startingTeam === 1)
      ? raw.startingTeam
      : null;
  return state;
}
