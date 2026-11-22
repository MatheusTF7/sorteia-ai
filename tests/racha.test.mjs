import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
import { createRenderer } from 'vue';

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

const scheduleUrl = await moduleUrl('../src/utils/racha-schedule.ts');
const utilityUrl = await moduleUrl('../src/utils/racha.ts', {
  './participants': await moduleUrl('../src/utils/participants.ts'),
  './random': await moduleUrl('../src/utils/random.ts'),
  './racha-schedule': scheduleUrl,
});
const {
  drawRachaTeams,
  drawRachaStartingTeam,
  emptyRacha,
  parseRachaNames,
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
    weight: 'medium',
  }));
const randoms = [() => 0, () => 0.5, () => 0.999999];
const countRole = (teams, players, role) =>
  teams.map((team) => team.filter((id) => players.find((player) => player.id === id)[role]).length);

test('parses numbered and bulleted WhatsApp lists, removing only leading list markers', () => {
  for (const prefix of [
    '1. ',
    '1.',
    '1- ',
    '1 - ',
    '1)',
    '1: ',
    '(1) ',
    '[1] ',
    '1º ',
    '1° - ',
    '1ª ',
    '12 ',
    '- ',
    '-',
    '– ',
    '— ',
    '• ',
    '● ',
    '▪ ',
    '◦ ',
    '‣ ',
    '* ',
    '+ ',
    '- 1. ',
    '1. - ',
  ]) {
    assert.deepEqual(parseRachaNames(`${prefix}  João   Pedro`, []), ['João Pedro'], prefix);
  }
  assert.deepEqual(parseRachaNames('1. Ana\r\n2.Bruno\n3- Carlos\n- Dora', []), [
    'Ana',
    'Bruno',
    'Carlos',
    'Dora',
  ]);
  assert.deepEqual(parseRachaNames('Ana-Maria; D’Ávila, 2Pac\nJoão 10\nJ. Carlos', []), [
    'Ana-Maria',
    'D’Ávila',
    '2Pac',
    'João 10',
    'J. Carlos',
  ]);
});

test('deduplicates cleaned names against the roster and ignores empty list items', () => {
  const existing = [{ ...roster(1)[0], name: 'Ana' }];
  assert.deepEqual(
    parseRachaNames('1.Ana\n2. Bruno\n- bruno\n3- Carla\n• Carla\n4.\n-\n* \n(5)', existing),
    ['Bruno', 'Carla'],
  );
});

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

test('spreads four high-weight players across three teams, including partial reserves', () => {
  for (const count of [15, 21]) {
    const players = roster(count);
    players.slice(0, 4).forEach((player) => {
      player.weight = 'high';
    });
    const original = structuredClone(players);
    for (const random of randoms) {
      const teams = drawRachaTeams(players, config(), random);
      const highCounts = teams.map(
        (team) =>
          team.filter((id) => players.find((player) => player.id === id).weight === 'high').length,
      );
      assert.deepEqual(highCounts.sort(), [1, 1, 2]);
      assert.deepEqual(
        teams.map((team) => team.length),
        count === 15 ? [7, 7, 1] : [7, 7, 7],
      );
    }
    assert.deepEqual(players, original);
  }
});

test('balances total weight and counts high-weight goalkeepers and seeds in that balance', () => {
  const players = roster(21, 3, 3);
  const weights = ['high', 'low', 'medium', 'high', 'medium', 'low'];
  players.forEach((player, index) => {
    player.weight = weights[index % weights.length];
  });
  const values = { high: 3, medium: 2, low: 1 };
  for (const mode of ['size', 'seeds']) {
    for (const random of randoms) {
      const teams = drawRachaTeams(players, config(7, mode), random);
      assert.deepEqual(teams.flat().sort(), players.map((player) => player.id).sort());
      assert.ok(
        countRole(teams, players, 'goalkeeper')
          .slice(0, 3)
          .every((count) => count === 1),
      );
      const scores = teams.map(
        (team) =>
          team.reduce(
            (sum, id) => sum + values[players.find((player) => player.id === id).weight],
            0,
          ) / team.length,
      );
      assert.ok(Math.max(...scores) - Math.min(...scores) <= 1);
      const saved = { ...emptyRacha(), config: config(7, mode), players, teams };
      assert.deepEqual(restoreRacha(saved).teams, teams);
    }
  }
});

test('restores player weights and defaults old or invalid weights to medium', () => {
  const players = roster(4);
  players[0].weight = 'low';
  players[1].weight = 'high';
  delete players[2].weight;
  players[3].weight = 'invalid';
  assert.deepEqual(
    restoreRacha({ players }).players.map((player) => player.weight),
    ['low', 'high', 'medium', 'medium'],
  );
});

const { addRachaMinutes, rachaDuration, formatRachaSchedule, isRachaDate, isRachaTime } =
  await import(scheduleUrl);

test('migrates saved date/time to separate fields, defaulting to a one-hour match', () => {
  const restored = restoreRacha({ date: '2026-11-22T23:30', title: 'Night match' });
  assert.equal(restored.date, '2026-11-22');
  assert.equal(restored.startTime, '23:30');
  assert.equal(restored.endTime, '00:30');
  assert.equal(restored.title, 'Night match');
  const custom = restoreRacha({ date: '2026-11-22', startTime: '18:30', endTime: '20:00' });
  assert.equal(custom.startTime, '18:30');
  assert.equal(custom.endTime, '20:00');
  assert.equal(restoreRacha({ startTime: '18:30', endTime: '' }).endTime, '');
  assert.equal(restoreRacha({ date: '2026-02-30', startTime: '25:00' }).date, '');
  assert.equal(restoreRacha({ date: 'invalid', startTime: '25:00' }).startTime, '');
  assert.equal(isRachaDate('2028-02-29'), true);
  assert.equal(isRachaTime('23:59'), true);
  assert.equal(isRachaTime('24:00'), false);
  assert.equal(addRachaMinutes('23:30'), '00:30');
  assert.equal(rachaDuration('23:30', '01:00'), 90);
});

const messageUrl = await moduleUrl('../src/utils/racha-message.ts', {
  './racha-schedule': scheduleUrl,
});
const { formatRachaMessage } = await import(messageUrl);
test('exports the date and time range without a timezone shift, including overnight matches', () => {
  const state = { ...emptyRacha(), date: '2026-11-22', startTime: '23:30', endTime: '00:30' };
  assert.equal(
    formatRachaSchedule(state, 'pt-BR', 'Dia seguinte'),
    '22/11/2026 · 23:30 – 00:30 (Dia seguinte)',
  );
  const message = formatRachaMessage(state, (key) =>
    key === 'racha.nextDay' ? 'Dia seguinte' : key,
  );
  assert.ok(message.includes('📅 22/11/2026 · 23:30 – 00:30 (Dia seguinte)'));
  assert.equal(
    formatRachaSchedule({ ...state, date: '' }, 'en-US', 'Next day'),
    '23:30 – 00:30 (Next day)',
  );
  assert.equal(formatRachaSchedule({ ...state, startTime: '', endTime: '' }), '22/11/2026');
});

const composableUrl = await moduleUrl('../src/composables/useRacha.ts', {
  vue: import.meta.resolve('vue'),
  'src/utils/participants': await moduleUrl('../src/utils/participants.ts'),
  'src/utils/racha': utilityUrl,
  'src/utils/racha-schedule': scheduleUrl,
});
const { useRacha } = await import(composableUrl);
const renderer = createRenderer({
  insert() {},
  remove() {},
  patchProp() {},
  setText() {},
  setElementText() {},
  createElement: () => ({}),
  createText: () => ({}),
  createComment: () => ({}),
  parentNode: () => null,
  nextSibling: () => null,
});

test('persists weights and schedules; changing weight invalidates the draw, changing time preserves it', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const memory = new Map();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => memory.set(key, value),
    },
  });
  let racha;
  const app = renderer.createApp({
    setup() {
      racha = useRacha();
      return () => null;
    },
  });
  try {
    app.mount({});
    racha.addNames(Array.from({ length: 15 }, (_, i) => `Player ${i}`).join('\n'));
    assert.ok(racha.state.value.players.every((player) => player.weight === 'medium'));
    racha.generateTeams();
    const teams = structuredClone(JSON.parse(JSON.stringify(racha.state.value.teams)));
    racha.state.value.date = '2026-11-22';
    racha.setStartTime('18:00');
    assert.equal(racha.state.value.endTime, '19:00');
    racha.state.value.endTime = '19:30';
    racha.setStartTime('20:00');
    assert.equal(racha.state.value.endTime, '21:30');
    assert.deepEqual(racha.state.value.teams, teams);
    racha.state.value.players[0].weight = 'high';
    assert.deepEqual(racha.state.value.teams, []);
    assert.equal(racha.state.value.drawChanged, true);
    racha.generateTeams();
    const saved = restoreRacha(JSON.parse(memory.get('sorteia-ai-racha-v1')));
    assert.deepEqual(saved, JSON.parse(JSON.stringify(racha.state.value)));
    racha.setStartTime('23:30');
    assert.equal(racha.state.value.endTime, '01:00');
    racha.setStartTime(null);
    assert.equal(racha.state.value.startTime, '');
    assert.equal(racha.state.value.endTime, '');
  } finally {
    app.unmount();
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});
