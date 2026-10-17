import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createRenderer, nextTick } from 'vue';
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

const utilityUrl = await moduleUrl('../src/utils/heat-setup.ts');
const {
  assignPlayerColors,
  changePlayerColor,
  drawCircuit,
  drawStartingGrid,
  initialParticipantListId,
  playerKey,
  uniquePlayerNames,
  validColorPreferences,
} = await import(utilityUrl);
const dataset = JSON.parse(
  await readFile(
    new URL('../public/data/board-games/heat-pedal-to-the-metal.json', import.meta.url),
    'utf8',
  ),
);
const colors = dataset.randomizers.find((item) => item.id === 'car-colors').options;
const names = ['Ana', 'Bruno', 'Caio', 'Dora', 'Eva', 'Fábio'];

test('chooses the only saved list or the marked default without selecting an arbitrary list', () => {
  assert.equal(initialParticipantListId([]), '');
  assert.equal(initialParticipantListId([{ id: 'only', isDefault: false }]), 'only');
  assert.equal(
    initialParticipantListId([
      { id: 'first', isDefault: false },
      { id: 'default', isDefault: true },
    ]),
    'default',
  );
  assert.equal(
    initialParticipantListId([
      { id: 'first', isDefault: false },
      { id: 'second', isDefault: false },
    ]),
    '',
  );
});

test('deduplicates participant identities and restores only valid color preferences', () => {
  assert.deepEqual(uniquePlayerNames([' Ana ', 'ana', '', 'Bruno', 'Bruno']), ['Ana', 'Bruno']);
  assert.equal(playerKey('  ANA  Maria '), playerKey('Ana Maria'));
  assert.deepEqual(validColorPreferences({ Ana: 'blue', Bruno: 'purple', Caio: 7 }, colors), {
    ana: 'blue',
  });
  for (const invalid of [null, [], 'invalid', 4])
    assert.deepEqual(validColorPreferences(invalid, colors), {});
});

test('assigns unique colors for one through six players, preserving preferences and current selections', () => {
  for (let count = 1; count <= 6; count++) {
    const players = assignPlayerColors(names.slice(0, count), colors, {
      ana: 'silver',
      bruno: 'silver',
    });
    assert.equal(players.length, count);
    assert.equal(players[0].color, 'silver');
    assert.equal(new Set(players.map((player) => player.color)).size, count);
    assert.ok(players.every((player) => colors.includes(player.color)));
  }
  const current = [{ name: 'Ana', color: 'red' }];
  assert.equal(
    assignPlayerColors(['Ana', 'Bruno'], colors, { bruno: 'red' }, current)[0].color,
    'red',
  );
  assert.throws(() => assignPlayerColors([...names, 'Gabriel'], colors, {}), RangeError);
  assert.deepEqual(assignPlayerColors([], colors, {}), []);
});

test('swaps occupied colors even with all six cars assigned and does not mutate the previous assignment', () => {
  const players = assignPlayerColors(names, colors, {});
  const original = structuredClone(players);
  const changed = changePlayerColor(players, players[0].name, players[5].color);
  assert.equal(changed[0].color, players[5].color);
  assert.equal(changed[5].color, players[0].color);
  assert.equal(new Set(changed.map((player) => player.color)).size, 6);
  assert.deepEqual(players, original);
});

test('draws a complete grid with unique positions and unchanged player-color pairs', () => {
  for (let count = 1; count <= 6; count++) {
    const players = assignPlayerColors(names.slice(0, count), colors, {});
    const original = structuredClone(players);
    for (const random of [() => 0, () => 0.999999, () => 0.5]) {
      const grid = drawStartingGrid(players, random);
      assert.deepEqual(
        grid.map((entry) => entry.position),
        Array.from({ length: count }, (_, index) => index + 1),
      );
      assert.deepEqual(
        grid.map(({ name, color }) => `${name}:${color}`).sort(),
        players.map(({ name, color }) => `${name}:${color}`).sort(),
      );
    }
    assert.deepEqual(players, original);
  }
  const permutations = new Set();
  for (let first = 0; first < 3; first++) {
    for (let second = 0; second < 2; second++) {
      const values = [(first + 0.1) / 3, (second + 0.1) / 2];
      permutations.add(
        drawStartingGrid(assignPlayerColors(names.slice(0, 3), colors, {}), () => values.shift())
          .map((entry) => entry.name)
          .join(','),
      );
    }
  }
  assert.equal(permutations.size, 6);
});

test('draws only real circuits, permits repeats and handles an empty pool', () => {
  assert.equal(drawCircuit(dataset.circuits, () => 0).id, 'usa');
  assert.equal(drawCircuit(dataset.circuits, () => 0.999999).id, 'italy');
  for (let index = 0; index < 4; index++)
    assert.equal(
      drawCircuit(dataset.circuits, () => (index + 0.1) / 4).id,
      dataset.circuits[index].id,
    );
  assert.equal(
    drawCircuit(dataset.circuits, () => 0).id,
    drawCircuit(dataset.circuits, () => 0).id,
  );
  assert.equal(
    drawCircuit([], () => 0),
    undefined,
  );
});

const vueUrl = import.meta.resolve('vue');
const savedConfigsUrl = await moduleUrl('../src/composables/useSavedConfigs.ts', { vue: vueUrl });
const composableUrl = await moduleUrl('../src/composables/useHeatSetup.ts', {
  vue: vueUrl,
  './useSavedConfigs': savedConfigsUrl,
  'src/utils/heat-setup': utilityUrl,
});
const { useHeatSetup } = await import(composableUrl);

// Exercise Vue lifecycle/watchers and localStorage integration without a browser.
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
function mountSetup(data = dataset) {
  let state;
  const app = renderer.createApp({
    setup() {
      state = useHeatSetup(data);
      return () => null;
    },
  });
  app.mount({});
  return { app, state };
}
const list = (items = ['Ana', 'Bruno']) => ({
  id: 'list-1',
  name: 'Amigos',
  items,
  isDefault: false,
  createdAt: '2026-10-17',
});

test('loads a single list automatically, saves/restores chosen colors and invalidates stale grids', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const memory = new Map([['saved_lists', JSON.stringify([list()])]]);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => {
        memory.set(key, value);
      },
    },
  });
  let mounted;
  try {
    mounted = mountSetup();
    await nextTick();
    const { state } = mounted;
    assert.equal(state.selectedListId.value, 'list-1');
    assert.deepEqual(state.selectedNames.value, ['Ana', 'Bruno']);
    state.setColor('Ana', 'yellow');
    assert.ok(!memory.has('heat_player_colors_v1'), 'unsaved choices do not persist');
    assert.equal(state.saveColors(), true);
    await nextTick();
    assert.equal(JSON.parse(memory.get('heat_player_colors_v1')).ana, 'yellow');
    state.randomizeGrid();
    state.randomizeCircuit();
    assert.equal(state.grid.value.length, 2);
    const circuitId = state.circuit.value.id;
    state.setColor('Ana', 'silver');
    assert.deepEqual(state.grid.value, []);
    assert.equal(state.circuit.value.id, circuitId, 'color edits keep the circuit draw');
    state.randomizeGrid();
    state.selectedNames.value = ['Ana'];
    await nextTick();
    assert.deepEqual(state.grid.value, []);
    assert.equal(state.players.value.length, 1);
    assert.deepEqual(JSON.parse(memory.get('saved_lists')), [list()], 'source list was not edited');
    mounted.app.unmount();
    mounted = mountSetup();
    await nextTick();
    assert.equal(
      mounted.state.players.value.find((player) => player.name === 'Ana').color,
      'yellow',
    );
    assert.equal(mounted.state.grid.value.length, 0);
  } finally {
    mounted?.app.unmount();
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});

test('retains large lists for selection, deduplicates manual names and honors disabled base randomizers', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const memory = new Map([
    ['saved_lists', JSON.stringify([list([...names, 'Gabriel', 'Helena'])])],
  ]);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => {
        memory.set(key, value);
      },
    },
  });
  let mounted;
  try {
    mounted = mountSetup();
    await nextTick();
    assert.equal(mounted.state.names.value.length, 8);
    assert.equal(mounted.state.selectedNames.value.length, 0);
    mounted.state.selectedNames.value = names;
    await nextTick();
    mounted.state.addNames('ana; IgOR; Igor; Joana');
    await nextTick();
    assert.equal(mounted.state.names.value.length, 10);
    assert.equal(mounted.state.selectedNames.value.length, 6);
    assert.equal(mounted.state.players.value.length, 6);
    mounted.app.unmount();
    const disabled = structuredClone(dataset);
    disabled.randomizers.find((item) => item.id === 'track').enabled = false;
    mounted = mountSetup(disabled);
    await nextTick();
    assert.equal(mounted.state.available, false);
    mounted.state.randomizeCircuit();
    mounted.state.randomizeGrid();
    assert.equal(mounted.state.circuit.value, null);
    assert.deepEqual(mounted.state.grid.value, []);
  } finally {
    mounted?.app.unmount();
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
});
