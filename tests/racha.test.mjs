import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { effectScope, nextTick } from 'vue';
import ts from 'typescript';

async function moduleUrl(path, imports = {}) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const code = outputText.replace(/from ['"]([^'"]+)['"]/g, (original, specifier) =>
    imports[specifier] ? `from ${JSON.stringify(imports[specifier])}` : original,
  );
  return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
}
const participantsUrl = await moduleUrl('../src/utils/participants.ts');
const randomUrl = await moduleUrl('../src/utils/random.ts');
const rachaUrl = await moduleUrl('../src/utils/racha.ts', {
  './participants': participantsUrl,
  './random': randomUrl,
});
const {
  drawRachaTeams,
  drawRachaStarter,
  emptyRacha,
  isRachaSeed,
  parseRachaNames,
  rachaDrawIssue,
  rachaTeamCount,
  restoreRacha,
} = await import(rachaUrl);
const composableUrl = await moduleUrl('../src/composables/useRacha.ts', {
  vue: import.meta.resolve('vue'),
  'src/utils/participants': participantsUrl,
  'src/utils/racha': rachaUrl,
});
const { useRacha, RACHA_STORAGE_KEY } = await import(composableUrl);
const players = (count) =>
  Array.from({ length: count }, (_, index) => ({
    id: `player-${index}`,
    name: `Jogador ${index}`,
    goalkeeper: index < 2,
    seed: index === 2,
    paid: index % 2 === 0,
  }));

test('separates every goalkeeper and seed, balances sizes and assigns each player exactly once', () => {
  for (let count = 2; count <= 35; count++) {
    for (const mode of ['size', 'seeds']) {
      for (const size of [1, 2, 5, 7, 10]) {
        for (const random of [() => 0, () => 0.5, () => 0.99999]) {
          const roster = players(count);
          const before = structuredClone(roster);
          const config = { mode, teamSize: size, defineStarter: true };
          const teams = drawRachaTeams(roster, config, random);
          assert.equal(teams.length, rachaTeamCount(roster, config));
          assert.deepEqual(teams.flat().sort(), roster.map((player) => player.id).sort());
          assert.equal(new Set(teams.flat()).size, count);
          const seeds = new Set(roster.filter(isRachaSeed).map((player) => player.id));
          assert.ok(teams.every((team) => team.filter((id) => seeds.has(id)).length <= 1));
          assert.ok(
            Math.max(...teams.map((team) => team.length)) -
              Math.min(...teams.map((team) => team.length)) <=
              1,
          );
          assert.ok(teams.every((team) => team.length > 0));
          if (mode === 'size') assert.ok(teams.every((team) => team.length <= size));
          assert.deepEqual(roster, before, 'draw does not mutate roles or payments');
        }
      }
    }
  }
});

test('counts a goalkeeper also marked as seed only once and expands teams when needed', () => {
  const roster = players(10);
  roster[0].seed = true;
  assert.equal(roster.filter(isRachaSeed).length, 3);
  assert.equal(rachaTeamCount(roster, { mode: 'size', teamSize: 5 }), 3);
  assert.equal(rachaTeamCount(roster, { mode: 'seeds', teamSize: 1 }), 3);
  assert.equal(drawRachaTeams(roster, { mode: 'seeds', teamSize: 1 }).flat().length, 10);
  assert.equal(
    drawRachaTeams(roster, { mode: 'size', teamSize: 5 }).flat().length,
    10,
    'unpaid players also enter',
  );
});

test('rejects invalid configurations and requires at least two teams', () => {
  const config = { mode: 'size', teamSize: 5 };
  assert.equal(rachaDrawIssue([], config), 'players');
  const roster = players(10).map((player) => ({ ...player, seed: false, goalkeeper: false }));
  for (const size of [0, -1, 1.5, NaN, Infinity, '', null]) {
    assert.equal(rachaDrawIssue(roster, { ...config, teamSize: size }), 'size');
    assert.deepEqual(drawRachaTeams(roster, { ...config, teamSize: size }), []);
  }
  assert.equal(rachaDrawIssue(roster, { ...config, teamSize: 10 }), 'teams');
  assert.equal(rachaDrawIssue(roster, { ...config, mode: 'seeds' }), 'seeds');
  assert.deepEqual(drawRachaTeams(roster, { ...config, mode: 'seeds' }), []);
});

test('draws kickoff only from the largest teams and handles no result', () => {
  assert.equal(drawRachaStarter([]), null);
  assert.equal(
    drawRachaStarter([['a', 'b'], ['c']], () => 0.99999),
    'b',
  );
  assert.equal(
    drawRachaStarter(
      [
        ['a', 'b'],
        ['c', 'd'],
      ],
      () => 0.99999,
    ),
    'd',
  );
});

test('parses pasted names without duplicates and preserves punctuation inside a name', () => {
  assert.deepEqual(
    parseRachaNames(' Ana;ana\nBruno\r\n\nJ. Pedro,  João  Silva; JOÃO SILVA', [{ name: 'BRUNO' }]),
    ['Ana', 'J. Pedro', 'João Silva'],
  );
});

test('restores valid matches and discards malformed or outdated draws', () => {
  for (const raw of [null, [], 'oops', 3, { players: [null, {}, { id: 4 }] }]) {
    assert.deepEqual(restoreRacha(raw), emptyRacha());
  }
  const state = { ...emptyRacha(), title: 'Quinta', players: players(12), fee: 15.5 };
  state.teams = drawRachaTeams(state.players, state.config);
  state.starter = drawRachaStarter(state.teams);
  assert.deepEqual(restoreRacha(state), state);
  const duplicated = structuredClone(state);
  duplicated.teams[0][0] = duplicated.teams[1][0];
  assert.deepEqual(restoreRacha(duplicated).teams, []);
  const removed = structuredClone(state);
  removed.players.pop();
  assert.deepEqual(restoreRacha(removed).teams, []);
  const together = structuredClone(state);
  together.teams = [
    ['player-0', 'player-1', 'player-2', 'player-3'],
    ['player-4', 'player-5', 'player-6', 'player-7'],
    ['player-8', 'player-9', 'player-10', 'player-11'],
  ];
  assert.deepEqual(restoreRacha(together).teams, []);
  assert.equal(restoreRacha({ fee: -4 }).fee, 0);
});

test('persists roles, payments and results; invalidates roster changes while keeping name/payment edits', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const memory = new Map([['saved_lists', 'untouched']]);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => memory.set(key, value),
    },
  });
  let scope = effectScope();
  try {
    let match = scope.run(useRacha);
    assert.equal(match.addNames('Ana;Bruno;Caio;Davi;Eva;Fábio'), 6);
    const [ana, bruno, caio] = match.state.value.players;
    ana.goalkeeper = true;
    bruno.goalkeeper = true;
    caio.seed = true;
    assert.equal(match.addNames('ANA;Ana'), 0);
    match.state.value.fee = 12.35;
    match.generateTeams();
    const drawn = structuredClone(match.state.value.teams.map((team) => [...team]));
    assert.equal(drawn.length, 3);
    ana.paid = true;
    assert.equal(match.received.value, 12.35);
    assert.equal(match.pending.value, 61.75);
    assert.equal(match.renamePlayer(ana.id, 'Ana Maria'), true);
    assert.equal(match.renamePlayer(ana.id, 'BRUNO'), false);
    assert.deepEqual(match.state.value.teams, drawn);
    await nextTick();
    scope.stop();
    scope = effectScope();
    match = scope.run(useRacha);
    assert.deepEqual(match.state.value.teams, drawn);
    assert.equal(match.state.value.players[0].name, 'Ana Maria');
    assert.equal(match.state.value.players[0].paid, true);
    assert.equal(match.state.value.players[0].goalkeeper, true);
    assert.ok(match.starter.value);
    match.state.value.config.defineStarter = false;
    await nextTick();
    assert.equal(match.state.value.starter, null);
    assert.deepEqual(match.state.value.teams, drawn);
    match.state.value.players[3].seed = true;
    assert.deepEqual(match.state.value.teams, []);
    assert.equal(match.drawChanged.value, true);
    match.generateTeams();
    assert.equal(match.drawChanged.value, false);
    assert.equal(match.state.value.teams.length, 4);
    match.removePlayer(caio.id);
    assert.deepEqual(match.state.value.teams, []);
    match.generateTeams();
    match.state.value.config.teamSize = 1;
    assert.deepEqual(match.state.value.teams, []);
    match.reset();
    await nextTick();
    assert.deepEqual(match.state.value, emptyRacha());
    assert.deepEqual(JSON.parse(memory.get(RACHA_STORAGE_KEY)), emptyRacha());
    assert.equal(memory.get('saved_lists'), 'untouched');
  } finally {
    scope.stop();
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});

test('keeps the match usable when browser storage is corrupt or unavailable', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => '{broken',
      setItem: () => {
        throw new Error('Quota exceeded');
      },
    },
  });
  const scope = effectScope();
  try {
    const match = scope.run(useRacha);
    assert.equal(match.storageError.value, true);
    assert.deepEqual(match.state.value, emptyRacha());
    match.addNames('Ana;Bruno');
    await nextTick();
    assert.equal(match.state.value.players.length, 2);
    assert.equal(match.storageError.value, true);
  } finally {
    scope.stop();
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});
