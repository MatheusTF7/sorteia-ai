import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

async function moduleUrl(relativePath, imports = {}) {
  const source = await readFile(new URL(relativePath, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const code = outputText.replace(/from ['"]([^'"]+)['"]/g, (original, specifier) =>
    imports[specifier] ? `from ${JSON.stringify(imports[specifier])}` : original,
  );
  return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
}

const utilityUrl = await moduleUrl('../src/utils/racha.ts', {
  './participants': await moduleUrl('../src/utils/participants.ts'),
  './random': await moduleUrl('../src/utils/random.ts'),
});
const {
  drawRachaTeams,
  drawRachaStartingTeam,
  emptyRacha,
  rachaTeamCount,
  restoreRacha,
  RACHA_SPORT_PRESETS,
} = await import(utilityUrl);

const config = (teamSize = 7, mode = 'size') => ({
  ...emptyRacha().config,
  sport: RACHA_SPORT_PRESETS.find((preset) => preset.teamSize === teamSize)?.sport ?? 'custom',
  teamSize,
  mode,
});
const roster = (count, goalkeepers = 0, seeds = 0) =>
  Array.from({ length: count }, (_, index) => ({
    id: `player-${index}`,
    name: `Player ${index}`,
    goalkeeper: index < goalkeepers,
    seed: index < goalkeepers + seeds,
    paid: false,
  }));
const randoms = [() => 0, () => 0.5, () => 0.999999];
const countRole = (teams, players, role) =>
  teams.map((team) => team.filter((id) => players.find((player) => player.id === id)[role]).length);

test('completes teams before allocating remaining players for every sport format', () => {
  for (const [count, size, sizes] of [
    [15, 7, [7, 7, 1]],
    [14, 7, [7, 7]],
    [13, 7, [7, 6]],
    [22, 7, [7, 7, 7, 1]],
    [12, 5, [5, 5, 2]],
    [23, 11, [11, 11, 1]],
    [10, 4, [4, 4, 2]],
    [3, 1, [1, 1, 1]],
  ]) {
    const players = roster(count);
    const original = structuredClone(players);
    for (const random of randoms) {
      const teams = drawRachaTeams(players, config(size), random);
      assert.deepEqual(
        teams.map((team) => team.length),
        sizes,
      );
      assert.deepEqual(teams.flat().sort(), players.map((player) => player.id).sort());
    }
    assert.deepEqual(players, original);
  }
});

test('prioritizes goalkeepers in the first teams ahead of other seeds and reserves', () => {
  for (const mode of ['size', 'seeds']) {
    for (const keeperCount of [1, 2, 3]) {
      const players = roster(15, keeperCount, 3 - keeperCount);
      for (const random of randoms) {
        const teams = drawRachaTeams(players, config(7, mode), random);
        assert.deepEqual(
          countRole(teams, players, 'goalkeeper'),
          Array.from({ length: 3 }, (_, index) => Number(index < keeperCount)),
        );
        assert.deepEqual(countRole(teams, players, 'seed'), [1, 1, 1]);
        assert.deepEqual(
          teams.map((team) => team.length),
          mode === 'size' ? [7, 7, 1] : [5, 5, 5],
        );
      }
    }
  }
});

test('extra seeds do not create more teams or prevent complete teams in size mode', () => {
  for (const [goalkeepers, seeds] of [
    [2, 4],
    [4, 0],
    [0, 15],
  ]) {
    const players = roster(15, goalkeepers, seeds);
    assert.equal(rachaTeamCount(players, config()), 3);
    for (const random of randoms) {
      const teams = drawRachaTeams(players, config(), random);
      assert.deepEqual(
        teams.map((team) => team.length),
        [7, 7, 1],
      );
      assert.deepEqual(teams.flat().sort(), players.map((player) => player.id).sort());
      assert.ok(countRole(teams, players, 'seed').every((count) => count >= 1));
      assert.ok(
        countRole(teams, players, 'goalkeeper')
          .slice(0, Math.min(goalkeepers, teams.length))
          .every((count) => count >= 1),
      );
    }
  }
});

test('seed mode retains one team per seed and balances players without a team size limit', () => {
  const players = roster(15, 2, 2);
  const settings = config(2, 'seeds');
  assert.equal(rachaTeamCount(players, settings), 4);
  for (const random of randoms) {
    const teams = drawRachaTeams(players, settings, random);
    assert.deepEqual(
      teams.map((team) => team.length),
      [4, 4, 4, 3],
    );
    assert.deepEqual(countRole(teams, players, 'seed'), [1, 1, 1, 1]);
    assert.deepEqual(countRole(teams, players, 'goalkeeper'), [1, 1, 0, 0]);
  }
});

test('restores complete teams, partial reserves, and surplus seeds without losing match data', () => {
  for (const settings of [config(), config(5), config(2, 'seeds')]) {
    for (const [keepers, seeds] of [
      [2, 0],
      [1, 2],
      [2, 4],
    ]) {
      const state = emptyRacha();
      state.config = settings;
      state.players = roster(15, keepers, seeds);
      state.title = 'Thursday football';
      state.fee = 20;
      state.players[0].paid = true;
      state.teams = drawRachaTeams(state.players, settings, () => 0);
      state.startingTeam = 1;
      assert.deepEqual(restoreRacha(JSON.parse(JSON.stringify(state))), state);
    }
  }
});

test('discards old balanced draws and saved draws that place goalkeepers behind empty teams', () => {
  const state = emptyRacha();
  state.players = roster(15, 2, 1);
  const ids = state.players.map((player) => player.id);
  for (const teams of [
    [ids.slice(0, 5), ids.slice(5, 10), ids.slice(10)],
    [[ids[0], ...ids.slice(3, 9)], ids.slice(9), [ids[1], ids[2]]],
    [[ids[0], ...ids.slice(3, 9)], [ids[2], ...ids.slice(9)], [ids[1]]],
  ]) {
    const restored = restoreRacha({ ...state, teams, startingTeam: 0 });
    assert.deepEqual(restored.teams, []);
    assert.equal(restored.startingTeam, null);
    assert.deepEqual(restored.players, state.players);
  }
});

test('rejects saved draws with missing, duplicated, unknown players or avoidable grouped seeds', () => {
  const state = emptyRacha();
  state.players = roster(15, 2, 1);
  state.teams = drawRachaTeams(state.players, state.config, () => 0);
  const invalidDraws = [];
  const missing = structuredClone(state.teams);
  missing[0].pop();
  invalidDraws.push(missing);
  for (const replacement of [state.teams[1][0], 'unknown-player']) {
    const changed = structuredClone(state.teams);
    changed[0][0] = replacement;
    invalidDraws.push(changed);
  }
  const grouped = structuredClone(state.teams);
  [grouped[0][1], grouped[2][0]] = [grouped[2][0], grouped[0][1]];
  invalidDraws.push(grouped);
  for (const teams of invalidDraws) {
    assert.deepEqual(restoreRacha({ ...state, teams }).teams, []);
  }
});

test('keeps kickoff restricted to the opening match and rejects invalid configurations', () => {
  const teams = drawRachaTeams(roster(15), config());
  assert.equal(
    drawRachaStartingTeam(teams, () => 0),
    0,
  );
  assert.equal(
    drawRachaStartingTeam(teams, () => 0.999999),
    1,
  );
  for (const size of [0, -1, 1.5, NaN, Infinity]) {
    assert.deepEqual(drawRachaTeams(roster(15), config(size)), []);
  }
  assert.deepEqual(drawRachaTeams(roster(1), config()), []);
  assert.deepEqual(drawRachaTeams(roster(7, 2), config()), []);
  assert.deepEqual(drawRachaTeams(roster(15, 1), config(7, 'seeds')), []);
});
