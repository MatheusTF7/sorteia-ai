import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createRenderer, shallowRef } from 'vue';
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
const data = JSON.parse(
  await readFile(
    new URL('../public/data/board-games/heat-pedal-to-the-metal.json', import.meta.url),
    'utf8',
  ),
);
const datasetUrl = `data:text/javascript;base64,${Buffer.from(`export default ${JSON.stringify(data)}`).toString('base64')}`;
const { heatPlaymatTopics, heatPlaymatSteps, playmatRule } = await import(
  await moduleUrl('../src/data/heat-playmat.ts', {
    '../../public/data/board-games/heat-pedal-to-the-metal.json': datasetUrl,
  })
);
const { fitPlaymat } = await import(await moduleUrl('../src/utils/playmat-layout.ts'));
const { usePlaymatOrientation } = await import(
  await moduleUrl('../src/composables/usePlaymatOrientation.ts', {
    vue: import.meta.resolve('vue'),
  })
);

test('every turn step and related topic resolves to an existing rule and useful help', () => {
  assert.equal(heatPlaymatSteps.length, 9);
  assert.deepEqual(
    heatPlaymatSteps.map((step) => step.topic.id),
    data.playerAid.turnSteps.map((step) => step.ruleId),
  );
  for (const topic of heatPlaymatTopics) {
    assert.ok(playmatRule(topic)?.summary, topic.id);
    assert.ok(topic.instructions.length > 0 && topic.example, topic.id);
    for (const related of topic.related ?? [])
      assert.ok(
        heatPlaymatTopics.some((item) => item.id === related),
        related,
      );
  }
});

test('hit areas stay within the artwork and do not intercept other symbols', () => {
  const hotspots = heatPlaymatTopics.filter((topic) => topic.width > 0);
  for (const topic of hotspots) {
    assert.ok(
      topic.x >= 0 && topic.y >= 0 && topic.x + topic.width <= 100 && topic.y + topic.height <= 100,
      topic.id,
    );
    for (const other of hotspots.filter((item) => item !== topic)) {
      const intersects =
        topic.x < other.x + other.width &&
        topic.x + topic.width > other.x &&
        topic.y < other.y + other.height &&
        topic.y + topic.height > other.y;
      assert.equal(intersects, false, `${topic.id} intercepts ${other.id}`);
    }
  }
});

test('fits the full artwork in mobile and desktop viewports at 0 and 90 degrees', () => {
  for (const [width, height] of [
    [280, 300],
    [375, 480],
    [700, 220],
    [1000, 700],
    [0, 0],
  ]) {
    for (const rotated of [false, true]) {
      const fit = fitPlaymat(width, height, rotated);
      assert.ok((rotated ? fit.height : fit.width) <= width + 0.001);
      assert.ok((rotated ? fit.width : fit.height) <= height + 0.001);
      if (width && height) assert.ok(Math.abs(fit.width / fit.height - 2171 / 1434) < 0.001);
    }
  }
});

const renderer = createRenderer({
  createElement: () => ({}),
  createText: () => ({}),
  createComment: () => ({}),
  setText() {},
  setElementText() {},
  parentNode: () => null,
  nextSibling: () => null,
  insert() {},
  remove() {},
  patchProp() {},
});

async function withBrowser(run, options = {}) {
  const previous = Object.fromEntries(
    ['screen', 'document'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  const calls = [];
  const events = new Map();
  const documentMock = {
    fullscreenElement: null,
    async exitFullscreen() {
      calls.push('exit');
      documentMock.fullscreenElement = null;
      events.get('fullscreenchange')?.();
    },
    addEventListener: (name, fn) => events.set(name, fn),
    removeEventListener: (name) => events.delete(name),
  };
  const orientation = {
    type: 'portrait-primary',
    lock: options.unsupported
      ? undefined
      : async (type) => {
          calls.push(`lock:${type}`);
          if (options.lockRejected) throw new Error('NotSupportedError');
          await options.lockWait;
        },
    unlock: () => calls.push('unlock'),
  };
  const element = {
    async requestFullscreen() {
      calls.push('fullscreen');
      if (options.fullscreenRejected) throw new Error('NotAllowedError');
      await options.fullscreenWait;
      documentMock.fullscreenElement = element;
      events.get('fullscreenchange')?.();
    },
  };
  Object.defineProperty(globalThis, 'screen', { configurable: true, value: { orientation } });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: documentMock });
  let state;
  const app = renderer.createApp({
    setup() {
      state = usePlaymatOrientation(shallowRef(element));
      return () => null;
    },
  });
  app.mount({});
  try {
    await run({ state, calls, element, documentMock, events, app });
  } finally {
    app.unmount();
    for (const key of Object.keys(previous)) {
      if (previous[key]) Object.defineProperty(globalThis, key, previous[key]);
      else delete globalThis[key];
    }
  }
}

test('locks the current orientation after fullscreen and releases both on close', async () => {
  await withBrowser(async ({ state, calls }) => {
    await state.toggleLock();
    assert.equal(state.locked.value, true);
    assert.deepEqual(calls, ['fullscreen', 'lock:portrait-primary']);
    await state.release();
    assert.deepEqual(calls, ['fullscreen', 'lock:portrait-primary', 'unlock', 'exit']);
    assert.equal(state.locked.value, false);
  });
});

test('unsupported or denied orientation lock keeps help available and never reports success', async () => {
  for (const options of [
    { unsupported: true },
    { lockRejected: true },
    { fullscreenRejected: true },
  ]) {
    await withBrowser(async ({ state, calls }) => {
      await state.toggleLock();
      assert.equal(state.locked.value, false);
      assert.equal(state.pending.value, false);
      assert.equal(state.message.value, 'heatInteractive.lockUnavailable');
      await state.release();
      assert.ok(!calls.includes('unlock'), 'does not release a lock it did not acquire');
    }, options);
  }
});

test('leaving fullscreen externally releases orientation and unmount removes listeners', async () => {
  await withBrowser(async ({ state, documentMock, events, calls, app }) => {
    await state.toggleLock();
    documentMock.fullscreenElement = null;
    events.get('fullscreenchange')();
    assert.equal(state.locked.value, false);
    assert.equal(calls.at(-1), 'unlock');
    app.unmount();
    assert.equal(events.size, 0);
  });
});

test('closing while fullscreen or lock is pending does not leave a late lock behind', async () => {
  for (const waitingOn of ['fullscreenWait', 'lockWait']) {
    let resolve;
    const promise = new Promise((done) => {
      resolve = done;
    });
    await withBrowser(
      async ({ state, calls, documentMock }) => {
        const acquisition = state.toggleLock();
        await Promise.resolve();
        await Promise.resolve();
        await state.release();
        resolve();
        await acquisition;
        assert.equal(state.locked.value, false);
        assert.equal(state.pending.value, false);
        assert.equal(documentMock.fullscreenElement, null);
        if (waitingOn === 'lockWait') assert.equal(calls.at(-1), 'unlock');
        else assert.ok(!calls.some((call) => call.startsWith('lock:')));
      },
      { [waitingOn]: promise },
    );
  }
});
