import type {
  MlbbBestOf,
  MlbbGameScore,
  MlbbMatch,
  MlbbPlayer,
  MlbbResult,
  MlbbStore,
  MlbbTournament,
} from '../types/mlbb';
import { playerKey } from './participants';
import { shuffleItems } from './random';

export const MLBB_MAX_PLAYERS = 64;
export const MLBB_MAX_TOURNAMENTS = 50;

export function mlbbRulePresets(english = false) {
  return {
    victories: english
      ? ['First to 3 kills', 'First kill', 'Destroy the opposing base']
      : ['Primeiro a fazer 3 kills', 'Primeira kill', 'Destruir a base adversária'],
    rules: english
      ? [
          'The first player to reach 3 kills wins the game; attacking the tower is not allowed; if you destroy the enemy tower with fewer kills than your opponent, you lose; if minions destroy the enemy tower, the player with more kills and more farm wins; if you do not own the drawn hero, report it immediately in the livestream chat.',
          'The first player to get a kill wins the game. Agree on allowed heroes, spells and tiebreakers before starting.',
          'Destroy the opposing base to win the game. Agree on allowed heroes, spells and pauses before starting.',
        ]
      : [
          'O primeiro jogador a fazer 3 kills ganha a partida; não é permitido bater na torre; se destruir a torre inimiga com menos kills que o adversário, você perde; na exceção de os mínions levarem a torre inimiga, ganha quem tem mais kills e mais farm; caso não tenha o herói sorteado, informe imediatamente no chat da live.',
          'O primeiro jogador a fazer uma kill ganha a partida. Combine os heróis permitidos, feitiços e critérios de desempate antes de começar.',
          'Destrua a base adversária para ganhar a partida. Combine os heróis permitidos, feitiços e pausas antes de começar.',
        ],
  };
}

export function emptyMlbbTournament(id: string, english = false): MlbbTournament {
  return {
    id,
    name: '',
    createdAt: new Date().toISOString(),
    players: [],
    rules: {
      bestOf: 1,
      semifinalBestOf: 1,
      finalBestOf: 3,
      thirdPlace: 'none',
      thirdPlaceBestOf: 1,
      lane: english ? 'Mid lane' : 'Rota do meio',
      victory: mlbbRulePresets(english).victories[0]!,
      notes: mlbbRulePresets(english).rules[0]!,
    },
    seededIds: [],
    results: {},
    draftNames: '',
  };
}

export function mlbbBracketSize(count: number): number {
  return count < 2 ? 0 : 2 ** Math.ceil(Math.log2(count));
}

export function parseMlbbNames(raw: string, players: MlbbPlayer[]): string[] {
  const seen = new Set(players.map((player) => playerKey(player.name)));
  return raw
    .split(/[,;\n]+/)
    .map((name) => name.trim().normalize('NFC').replace(/\s+/g, ' ').slice(0, 60))
    .filter((name) => {
      const key = playerKey(name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function drawMlbbBracket(
  tournament: MlbbTournament,
  random: () => number = Math.random,
): MlbbTournament {
  if (tournament.players.length < 2 || tournament.players.length > MLBB_MAX_PLAYERS)
    throw new RangeError('players');
  if (
    ![
      tournament.rules.bestOf,
      tournament.rules.semifinalBestOf,
      tournament.rules.finalBestOf,
      tournament.rules.thirdPlaceBestOf,
    ].every((value) => Number.isInteger(value) && value >= 1 && value <= 99)
  )
    throw new RangeError('format');
  return {
    ...tournament,
    seededIds: shuffleItems(
      tournament.players.map((player) => player.id),
      random,
    ),
    results: {},
  };
}

function validResult(
  value: MlbbResult | undefined,
  a: string | null,
  b: string | null,
  bestOf: MlbbBestOf,
): value is MlbbResult {
  if (!value || !a || !b || value.playerAId !== a || value.playerBId !== b) return false;
  if (value.kind === 'wo') return value.winnerId === a || value.winnerId === b;
  if (value.kind !== 'score') return false;
  if (value.games !== undefined) {
    if (!Array.isArray(value.games) || !value.games.length || value.games.length > bestOf)
      return false;
    let winsA = 0;
    let winsB = 0;
    for (const game of value.games) {
      if (
        Math.max(winsA, winsB) > bestOf / 2 ||
        !game ||
        !Number.isSafeInteger(game.scoreA) ||
        !Number.isSafeInteger(game.scoreB) ||
        game.scoreA < 0 ||
        game.scoreB < 0 ||
        (game.winnerId !== a && game.winnerId !== b)
      )
        return false;
      if (game.winnerId === a) winsA++;
      else winsB++;
    }
    if (winsA !== value.scoreA || winsB !== value.scoreB) return false;
  }
  const needed = Math.floor(bestOf / 2) + 1;
  const { scoreA, scoreB } = value;
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0)
    return false;
  if (scoreA + scoreB > bestOf || scoreA > needed || scoreB > needed) return false;
  if (scoreA === scoreB)
    return scoreA + scoreB === bestOf && (value.winnerId === a || value.winnerId === b);
  if (Math.max(scoreA, scoreB) !== needed && scoreA + scoreB !== bestOf) return false;
  return value.winnerId === (scoreA > scoreB ? a : b);
}

export function buildMlbbRounds(tournament: MlbbTournament): MlbbMatch[][] {
  const ids = tournament.seededIds;
  if (ids.length < 2 || ids.length !== tournament.players.length) return [];
  const size = mlbbBracketSize(ids.length);
  const count = Math.log2(size);
  const byes = size - ids.length;
  const rounds: MlbbMatch[][] = [];
  let cursor = 0;
  for (let round = 0; round < count; round++) {
    const matches: MlbbMatch[] = [];
    const matchCount = size / 2 ** (round + 1);
    for (let index = 0; index < matchCount; index++) {
      const id = `r${round + 1}-m${index + 1}`;
      const previousA = rounds[round - 1]?.[index * 2];
      const previousB = rounds[round - 1]?.[index * 2 + 1];
      const bye =
        round === 0 &&
        Math.floor(((index + 1) * byes) / matchCount) > Math.floor((index * byes) / matchCount);
      const playerAId = round === 0 ? (ids[cursor++] ?? null) : (previousA?.winnerId ?? null);
      const playerBId =
        round === 0 ? (bye ? null : (ids[cursor++] ?? null)) : (previousB?.winnerId ?? null);
      const bestOf =
        round === count - 1
          ? tournament.rules.finalBestOf
          : round === count - 2
            ? tournament.rules.semifinalBestOf
            : tournament.rules.bestOf;
      const candidate = tournament.results[id];
      const result = validResult(candidate, playerAId, playerBId, bestOf) ? candidate : null;
      matches.push({
        id,
        round,
        index,
        bestOf,
        playerAId,
        playerBId,
        sourceA: previousA?.id ?? null,
        sourceB: previousB?.id ?? null,
        winnerId: bye ? playerAId : (result?.winnerId ?? null),
        status: bye ? 'bye' : result ? 'completed' : playerAId && playerBId ? 'ready' : 'waiting',
        result,
      });
    }
    rounds.push(matches);
  }
  return rounds;
}

export function mlbbDescendants(tournament: MlbbTournament, matchId: string): string[] {
  const matches = buildMlbbRounds(tournament).flat();
  const affected = new Set([matchId]);
  for (const match of matches) {
    if (
      (match.sourceA && affected.has(match.sourceA)) ||
      (match.sourceB && affected.has(match.sourceB))
    )
      affected.add(match.id);
  }
  affected.delete(matchId);
  const bronze = buildMlbbThirdPlaceMatch(tournament);
  if (
    bronze &&
    ((bronze.sourceA && affected.has(bronze.sourceA)) ||
      (bronze.sourceB && affected.has(bronze.sourceB)) ||
      bronze.sourceA === matchId ||
      bronze.sourceB === matchId)
  )
    affected.add(bronze.id);
  return [...affected];
}

function loser(match: MlbbMatch | undefined): string | null {
  if (!match?.result || !match.winnerId) return null;
  return match.winnerId === match.playerAId ? match.playerBId : match.playerAId;
}

export function buildMlbbThirdPlaceMatch(tournament: MlbbTournament): MlbbMatch | null {
  if (tournament.rules.thirdPlace !== 'match' || tournament.players.length < 4) return null;
  const rounds = buildMlbbRounds(tournament);
  const semifinals = rounds.at(-2);
  if (!semifinals) return null;
  const playerAId = loser(semifinals[0]);
  const playerBId = loser(semifinals[1]);
  const candidate = tournament.results['third-place'];
  const result = validResult(candidate, playerAId, playerBId, tournament.rules.thirdPlaceBestOf)
    ? candidate
    : null;
  return {
    id: 'third-place',
    round: rounds.length,
    index: 0,
    bestOf: tournament.rules.thirdPlaceBestOf,
    playerAId,
    playerBId,
    sourceA: semifinals[0]?.id ?? null,
    sourceB: semifinals[1]?.id ?? null,
    winnerId: result?.winnerId ?? null,
    status: result ? 'completed' : playerAId && playerBId ? 'ready' : 'waiting',
    result,
  };
}

export function mlbbThirdPlaceId(tournament: MlbbTournament): string | null {
  if (tournament.players.length < 4) return null;
  if (tournament.rules.thirdPlace === 'match')
    return buildMlbbThirdPlaceMatch(tournament)?.winnerId ?? null;
  if (tournament.rules.thirdPlace !== 'champion-loser') return null;
  const rounds = buildMlbbRounds(tournament);
  const champion = rounds.at(-1)?.[0]?.winnerId;
  return champion ? loser(rounds.at(-2)?.find((match) => match.winnerId === champion)) : null;
}

export function setMlbbResult(
  tournament: MlbbTournament,
  matchId: string,
  input:
    | { kind: 'score'; scoreA: number; scoreB: number; winnerId?: string; games?: MlbbGameScore[] }
    | { kind: 'wo'; winnerId: string }
    | null,
): MlbbTournament {
  const match =
    matchId === 'third-place'
      ? buildMlbbThirdPlaceMatch(tournament)
      : buildMlbbRounds(tournament)
          .flat()
          .find((item) => item.id === matchId);
  if (!match || !match.playerAId || !match.playerBId) throw new RangeError('match');
  let result: MlbbResult | null = null;
  if (input) {
    const winnerId =
      input.kind === 'wo'
        ? input.winnerId
        : input.scoreA === input.scoreB
          ? (input.winnerId ?? '')
          : input.scoreA > input.scoreB
            ? match.playerAId
            : match.playerBId;
    result = {
      playerAId: match.playerAId,
      playerBId: match.playerBId,
      kind: input.kind,
      scoreA: input.kind === 'score' ? input.scoreA : 0,
      scoreB: input.kind === 'score' ? input.scoreB : 0,
      winnerId,
      ...(input.kind === 'score' && input.games !== undefined
        ? { games: input.games.map((game) => ({ ...game })) }
        : {}),
    };
    if (!validResult(result, match.playerAId, match.playerBId, match.bestOf))
      throw new RangeError('score');
  }
  const results = { ...tournament.results };
  if (result) results[matchId] = result;
  else delete results[matchId];
  if (match.winnerId !== result?.winnerId) {
    for (const id of mlbbDescendants(tournament, matchId)) delete results[id];
  }
  return { ...tournament, results };
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function textValue(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function bestOf(value: unknown): MlbbBestOf {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 99
    ? value
    : 1;
}

/** Untrusted files/storage are rebuilt field by field; results are checked against their opponents. */
export function restoreMlbbTournament(value: unknown): MlbbTournament | null {
  const data = record(value);
  const rules = record(data?.rules);
  if (
    !data ||
    typeof data.id !== 'string' ||
    !data.id ||
    !rules ||
    !Array.isArray(data.players) ||
    data.players.length > MLBB_MAX_PLAYERS
  )
    return null;
  const tournament = emptyMlbbTournament(data.id.slice(0, 100));
  tournament.name = textValue(data.name, 80);
  tournament.createdAt =
    typeof data.createdAt === 'string' && Number.isFinite(Date.parse(data.createdAt))
      ? data.createdAt
      : tournament.createdAt;
  tournament.draftNames = textValue(data.draftNames, 10000);
  const heroSettings = record(data.heroSettings);
  const classIds = new Set(['tank', 'fighter', 'assassin', 'mage', 'marksman', 'support']);
  const strings = (value: unknown): string[] =>
    Array.isArray(value)
      ? [
          ...new Set(
            value.filter((id): id is string => typeof id === 'string' && id.length <= 100),
          ),
        ].slice(0, 200)
      : [];
  if (heroSettings) {
    const overrides: Record<string, string[]> = {};
    for (const [id, values] of Object.entries(record(heroSettings.overrides) ?? {}).slice(0, 200)) {
      if (/^[a-z0-9-]+$/.test(id)) overrides[id] = strings(values).filter((id) => classIds.has(id));
    }
    tournament.heroSettings = {
      classes: strings(heroSettings.classes).filter((id) => classIds.has(id)),
      bannedIds: strings(heroSettings.bannedIds),
      overrides,
    };
    // Kept in sync with MLBB_DRAW_MODES and MLBB_WIN_RATE_GAP in mlbb-heroes.ts.
    const mode = heroSettings.drawMode;
    if (mode === 'avoid-counters' || mode === 'balanced') tournament.heroSettings.drawMode = mode;
    const gap = heroSettings.maxWinRateGap;
    if (typeof gap === 'number' && Number.isFinite(gap))
      tournament.heroSettings.maxWinRateGap = Math.min(15, Math.max(0.5, Math.round(gap * 2) / 2));
  }
  if (data.heroPicks) {
    tournament.heroPicks = {};
    for (const [id, raw] of Object.entries(record(data.heroPicks) ?? {}).slice(0, 64)) {
      const pick = record(raw);
      if (
        /^(r\d+-m\d+|third-place)$/.test(id) &&
        classIds.has(String(pick?.classId)) &&
        typeof pick?.heroAId === 'string' &&
        typeof pick.heroBId === 'string'
      )
        tournament.heroPicks[id] = {
          classId: String(pick.classId),
          heroAId: pick.heroAId.slice(0, 100),
          heroBId: pick.heroBId.slice(0, 100),
        };
    }
  }
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const value of data.players) {
    const player = record(value);
    const id = textValue(player?.id, 100);
    const name = textValue(player?.name, 60).trim().normalize('NFC').replace(/\s+/g, ' ');
    if (!id || !name || ids.has(id) || names.has(playerKey(name))) return null;
    ids.add(id);
    names.add(playerKey(name));
    tournament.players.push({
      id,
      name,
      gameId: textValue(player?.gameId, 30),
      serverId: textValue(player?.serverId, 20),
    });
  }
  tournament.rules = {
    bestOf: bestOf(rules.bestOf),
    semifinalBestOf: bestOf(rules.semifinalBestOf ?? rules.bestOf),
    finalBestOf: bestOf(rules.finalBestOf),
    thirdPlace:
      rules.thirdPlace === 'match' || rules.thirdPlace === 'champion-loser'
        ? rules.thirdPlace
        : 'none',
    thirdPlaceBestOf: bestOf(rules.thirdPlaceBestOf),
    lane: textValue(rules.lane, 80),
    victory: textValue(rules.victory, 200),
    notes: textValue(rules.notes, 2000),
  };
  if (
    Array.isArray(data.seededIds) &&
    data.seededIds.length >= 2 &&
    data.seededIds.length === ids.size &&
    new Set(data.seededIds).size === ids.size &&
    data.seededIds.every((id: unknown) => typeof id === 'string' && ids.has(id))
  ) {
    tournament.seededIds = data.seededIds as string[];
  }
  const results = record(data.results);
  // Resolve one round at a time so an invalid upstream result cannot resurrect a later match.
  const roundCount = Math.max(0, Math.log2(mlbbBracketSize(ids.size)));
  for (let round = 0; round <= roundCount; round++) {
    const bronze = round === roundCount ? buildMlbbThirdPlaceMatch(tournament) : null;
    for (const match of bronze ? [bronze] : (buildMlbbRounds(tournament)[round] ?? [])) {
      const raw = record(results?.[match.id]);
      if (!raw) continue;
      const candidate: MlbbResult = {
        playerAId: textValue(raw.playerAId, 100),
        playerBId: textValue(raw.playerBId, 100),
        winnerId: textValue(raw.winnerId, 100),
        kind: raw.kind === 'wo' ? 'wo' : 'score',
        scoreA: typeof raw.scoreA === 'number' ? raw.scoreA : -1,
        scoreB: typeof raw.scoreB === 'number' ? raw.scoreB : -1,
      };
      if (raw.games !== undefined) {
        if (!Array.isArray(raw.games) || raw.games.length > 99) continue;
        const games: MlbbGameScore[] = [];
        for (const entry of raw.games) {
          const game = record(entry);
          games.push({
            scoreA: typeof game?.scoreA === 'number' ? game.scoreA : -1,
            scoreB: typeof game?.scoreB === 'number' ? game.scoreB : -1,
            winnerId: textValue(game?.winnerId, 100),
          });
        }
        candidate.games = games;
      }
      if (
        (raw.kind === 'score' || raw.kind === 'wo') &&
        validResult(candidate, match.playerAId, match.playerBId, match.bestOf)
      )
        tournament.results[match.id] = candidate;
    }
  }
  return tournament;
}

export function restoreMlbbStore(value: unknown): MlbbStore {
  const data = record(value);
  const tournaments: MlbbTournament[] = [];
  if (data?.version === 1 && Array.isArray(data.tournaments)) {
    for (const item of data.tournaments.slice(0, MLBB_MAX_TOURNAMENTS)) {
      const tournament = restoreMlbbTournament(item);
      if (tournament && !tournaments.some((other) => other.id === tournament.id))
        tournaments.push(tournament);
    }
  }
  const activeId =
    tournaments.find((item) => item.id === data?.activeId)?.id ?? tournaments[0]?.id ?? '';
  return { version: 1, activeId, tournaments };
}
