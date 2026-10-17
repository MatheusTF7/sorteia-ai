import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createRenderer, nextTick } from 'vue';
import ts from 'typescript';

async function moduleUrl(file, imports = {}) {
  const source = await readFile(new URL(file, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const code = outputText.replace(/from ['"]([^'"]+)['"]/g, (original, specifier) =>
    imports[specifier] ? `from ${JSON.stringify(imports[specifier])}` : original,
  );
  return `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
}
const randomUrl = await moduleUrl('../src/utils/random.ts');
const utilityUrl = await moduleUrl('../src/utils/potion-setup.ts', { './random': randomUrl });
const { drawPotionTypes, drawPotionPlayerOrder, dealStartingPotions } = await import(utilityUrl);
const data = JSON.parse(
  await readFile(
    new URL('../public/data/board-games/potion-explosion.json', import.meta.url),
    'utf8',
  ),
);
const ids = data.potions.map((potion) => potion.id);
const names = ['Ana', 'Bruno', 'Caio', 'Dora'];
function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 2 ** 32;
  };
}

test('chooses exactly six distinct types from the eight without altering the source', () => {
  const original = [...ids];
  assert.equal(ids.length, 8);
  assert.equal(data.potionSetup.activeTypeCount, 6);
  for (let seed = 1; seed <= 80; seed++) {
    const selected = drawPotionTypes(ids, data.potionSetup.activeTypeCount, seededRandom(seed));
    assert.equal(selected.length, 6);
    assert.equal(new Set(selected).size, 6);
    assert.ok(selected.every((id) => ids.includes(id)));
    assert.equal(ids.filter((id) => !selected.includes(id)).length, 2);
  }
  assert.deepEqual(ids, original);
});

test('chooses a starting player and rotates the selected sequence without duplicates', () => {
  assert.deepEqual(
    drawPotionPlayerOrder(names, () => 0),
    names,
  );
  assert.deepEqual(
    drawPotionPlayerOrder(names, () => 0.999999),
    ['Dora', 'Ana', 'Bruno', 'Caio'],
  );
  assert.deepEqual(
    drawPotionPlayerOrder(names, () => 0.5),
    ['Caio', 'Dora', 'Ana', 'Bruno'],
  );
  assert.deepEqual(
    drawPotionPlayerOrder([], () => 0),
    [],
  );
});

test('deals two starters per player and at most two of each active type for all 28 subsets', () => {
  assert.equal(data.potionSetup.startingCopiesPerType, 2);
  assert.equal(data.potionSetup.startingPotionsPerPlayer, 2);
  for (let excludedA = 0; excludedA < ids.length; excludedA++) {
    for (let excludedB = excludedA + 1; excludedB < ids.length; excludedB++) {
      const active = ids.filter((_, index) => index !== excludedA && index !== excludedB);
      for (let count = data.players.min; count <= data.players.max; count++) {
        for (let seed = 1; seed <= 20; seed++) {
          const hands = dealStartingPotions(
            names.slice(0, count),
            active,
            data.potionSetup,
            seededRandom(seed),
          );
          assert.deepEqual(
            hands.map((hand) => hand.player),
            names.slice(0, count),
          );
          assert.ok(hands.every((hand) => hand.potionIds.length === 2));
          const distributed = hands.flatMap((hand) => hand.potionIds);
          assert.equal(distributed.length, count * 2);
          assert.ok(distributed.every((id) => active.includes(id)));
          for (const id of ids) assert.ok(distributed.filter((value) => value === id).length <= 2);
        }
      }
    }
  }
});

test('consumes finite stock in normal then reverse order without inventing a distinct-type restriction', () => {
  const active = ids.slice(0, 6);
  const hands = dealStartingPotions(names.slice(0, 3), active, data.potionSetup, () => 0.999999);
  assert.deepEqual(
    hands.map((hand) => hand.potionIds),
    [
      [active[0], active[2]],
      [active[0], active[2]],
      [active[1], active[1]],
    ],
  );
  assert.deepEqual(active, ids.slice(0, 6));
  assert.throws(
    () => dealStartingPotions(names, active, { ...data.potionSetup, startingCopiesPerType: 1 }),
    RangeError,
  );
  assert.throws(
    () => dealStartingPotions(names, [active[0], ...active.slice(0, 5)], data.potionSetup),
    RangeError,
  );
  assert.throws(() => dealStartingPotions(['Ana', 'Ana'], active, data.potionSetup), RangeError);
});

const vueUrl = import.meta.resolve('vue');
const participantUrl = await moduleUrl('../src/utils/participants.ts');
const savedConfigsUrl = await moduleUrl('../src/composables/useSavedConfigs.ts', { vue: vueUrl });
const participantsUrl = await moduleUrl('../src/composables/useSetupParticipants.ts', {
  vue: vueUrl,
  './useSavedConfigs': savedConfigsUrl,
  'src/utils/participants': participantUrl,
});
const composableUrl = await moduleUrl('../src/composables/usePotionSetup.ts', {
  vue: vueUrl,
  './useSetupParticipants': participantsUrl,
  'src/utils/potion-setup': utilityUrl,
});
const { usePotionSetup } = await import(composableUrl);
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
function mountSetup() {
  let state;
  const app = renderer.createApp({
    setup() {
      state = usePotionSetup(data);
      return () => null;
    },
  });
  app.mount({});
  return { app, state };
}
function installLists(lists) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const memory = new Map([['saved_lists', JSON.stringify(lists)]]);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => {
        memory.set(key, value);
      },
    },
  });
  return () => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  };
}
const list = (items) => ({
  id: 'friends',
  name: 'Amigos',
  items,
  isDefault: false,
  createdAt: '2026-10-17',
});

test('loads a single list and keeps a complete draw after Vue watchers flush', async () => {
  const restore = installLists([list(names)]);
  const { app, state } = mountSetup();
  try {
    await nextTick();
    assert.equal(state.selectedListId.value, 'friends');
    assert.equal(state.canPrepare.value, true);
    state.randomizeAll();
    await nextTick();
    assert.equal(state.order.value.length, 4);
    assert.equal(state.activePotions.value.length, 6);
    assert.equal(state.excludedPotions.value.length, 2);
    assert.equal(state.hands.value.length, 4);
    const order = [...state.order.value];
    state.randomizeTypes();
    assert.deepEqual(state.hands.value, []);
    assert.deepEqual(state.order.value, order);
    state.randomizeHands();
    assert.equal(state.hands.value.length, 4);
    state.randomizeStarter();
    assert.deepEqual(state.hands.value, []);
    state.randomizeHands();
    state.selectedNames.value = names.slice(0, 2);
    assert.deepEqual(state.order.value, []);
    assert.deepEqual(state.hands.value, []);
    assert.equal(state.activePotions.value.length, 6);
    state.randomizeAll();
    await nextTick();
    assert.equal(state.hands.value.length, 2);
  } finally {
    app.unmount();
    restore();
  }
});

test('requires two to four selected players, preserves large lists and blocks incomplete distributions', async () => {
  const restore = installLists([list([...names, 'Eva'])]);
  const { app, state } = mountSetup();
  try {
    await nextTick();
    assert.equal(state.names.value.length, 5);
    assert.equal(state.selectedNames.value.length, 0);
    state.randomizeAll();
    assert.deepEqual(state.hands.value, []);
    state.selectedNames.value = ['Ana'];
    assert.equal(state.canPrepare.value, false);
    state.randomizeStarter();
    assert.deepEqual(state.order.value, []);
    state.selectedNames.value = ['Ana', 'Bruno'];
    state.randomizeHands();
    assert.deepEqual(state.hands.value, []);
    state.randomizeStarter();
    assert.equal(state.canDeal.value, false);
    state.randomizeTypes();
    assert.equal(state.canDeal.value, true);
    state.randomizeHands();
    assert.equal(state.hands.value.length, 2);
    state.selectedNames.value = [...names, 'Eva'];
    assert.equal(state.canPrepare.value, false);
    state.randomizeAll();
    assert.deepEqual(state.hands.value, []);
  } finally {
    app.unmount();
    restore();
  }
});
