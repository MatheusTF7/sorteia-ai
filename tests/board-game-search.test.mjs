import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

// Compile the pure utility in memory using the project's existing TypeScript dependency.
const source = await readFile(
  new URL('../src/utils/board-game-search.ts', import.meta.url),
  'utf8',
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { createGameSearch, getGameEntries } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
const game = JSON.parse(
  await readFile(
    new URL('../public/data/board-games/potion-explosion.json', import.meta.url),
    'utf8',
  ),
);
const entries = getGameEntries(game);
const search = createGameSearch(entries, game.searchSynonyms);
const ids = (query, category) => search(query, category).map((entry) => entry.id);

test('includes every dataset entry and the eight potions without duplicate ids', () => {
  assert.equal(search('').length, game.setup.length + game.rules.length + 8);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length);
  for (const potion of game.potions) {
    assert.ok(ids(potion.name).includes(potion.id));
    assert.ok(ids(potion.originalName).includes(potion.id));
  }
});

test('matches accents, case, composed Unicode and whitespace consistently', () => {
  for (const [accented, plain] of [
    ['EXPLOSÃO', 'explosao'],
    ['Atração Magnética', 'atracao magnetica'],
    ['Bálsamo', 'balsamo'],
    ['poções', 'pocoes'],
  ]) {
    assert.deepEqual(ids(accented), ids(plain));
    assert.ok(ids(plain).length > 0);
    assert.deepEqual(ids(accented.normalize('NFD')), ids(plain));
  }
  assert.deepEqual(ids('  ATRACAO   magnetica  '), ['magnetic-attraction']);
});

test('searches effects, tags, observations and original names', () => {
  assert.ok(ids('adversario').includes('blind-love'));
  assert.ok(ids('coringa').includes('prismatic-joy'));
  assert.ok(ids('reposicionados').includes('ingredients'));
  assert.ok(ids('Sands of Time').includes('sands-of-time'));
});

test('expands the dataset synonyms in either direction including phrases', () => {
  for (const alias of ['frasco', 'pool', 'ingredientes guardados']) {
    assert.ok(ids(alias).includes('ingredients'));
    assert.ok(ids(alias).includes('blind-love'));
  }
  assert.ok(ids('reacao em cadeia').includes('explosion'));
  assert.ok(ids('token').includes('skills'));
  const reverseSearch = createGameSearch(
    [{ id: 'alias', title: 'Frasco', summary: '', details: [], tags: [], category: 'test' }],
    game.searchSynonyms,
  );
  assert.equal(reverseSearch('reserva')[0]?.id, 'alias');
});

test('combines query and category and handles empty results', () => {
  assert.ok(search('', 'pocoes').length >= 8);
  assert.ok(search('reserva', 'pocoes').every((entry) => entry.category === 'pocoes'));
  assert.deepEqual(ids('sabedoria', 'pontuacao'), []);
  assert.deepEqual(ids('xyz-inexistente'), []);
  assert.deepEqual(ids('', 'inexistente'), []);
  assert.equal(search('   ').length, entries.length);
});

const heatSource = JSON.parse(
  await readFile(
    new URL('../public/data/board-games/heat-pedal-to-the-metal.json', import.meta.url),
    'utf8',
  ),
);
const { outputText: adapterCode } = ts.transpileModule(
  await readFile(new URL('../src/data/normalize-heat.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
);
const { normalizeHeatDataset } = await import(
  `data:text/javascript;base64,${Buffer.from(adapterCode).toString('base64')}`
);
const heat = normalizeHeatDataset(heatSource);
const heatEntries = getGameEntries(heat);
const heatSearch = createGameSearch(heatEntries, heat.searchSynonyms);

test('adapts Heat metadata, rules, circuits and reference values without changing the source', () => {
  assert.equal(heat.title, heatSource.name);
  assert.equal(heat.language, heatSource.locale);
  assert.deepEqual(heat.durationMinutes, { min: 60, max: 60 });
  assert.equal(heatEntries.length, heatSource.playerAid.rules.length);
  assert.equal(new Set(heatEntries.map((entry) => entry.id)).size, heatEntries.length);
  assert.deepEqual(heat.modules, heatSource.modules);
  assert.deepEqual(heat.racingReference.gears, heatSource.quickReference);
  assert.deepEqual(heat.racingReference.circuits, heatSource.circuits);
  for (const rule of heatSource.playerAid.rules) {
    const entry = heatEntries.find((candidate) => candidate.id === rule.id);
    assert.equal(entry.summary, rule.summary);
    assert.deepEqual(entry.details, rule.details ?? []);
    assert.deepEqual(entry.tags, [rule.tags]);
  }
  assert.equal(heatSource.playerAid.rules.find((rule) => rule.id === 'gear').category, undefined);
});

test('builds the nine Heat turn steps from referenced ids, order and mandatory flags', () => {
  const turn = heatEntries.filter((entry) => entry.category === 'turno');
  assert.equal(turn.length, 9);
  assert.deepEqual(
    turn.map((entry) => entry.id),
    heatSource.playerAid.turnSteps.map((step) => step.ruleId),
  );
  for (const step of heatSource.playerAid.turnSteps) {
    const entry = turn.find((candidate) => candidate.id === step.ruleId);
    assert.equal(entry.step, step.step);
    assert.equal(entry.mandatory, step.mandatory);
  }
  // Source array order and duplicate rule.step metadata must not determine the guide.
  const reordered = structuredClone(heatSource);
  reordered.playerAid.rules.reverse();
  reordered.playerAid.rules.forEach((rule) => {
    rule.step = 99;
  });
  assert.deepEqual(
    normalizeHeatDataset(reordered)
      .rules.filter((rule) => rule.category === 'turno')
      .map((rule) => rule.id),
    turn.map((entry) => entry.id),
  );
});

test('searches Heat titles, descriptions, details, keywords and module names without accents', () => {
  for (const [query, id] of [
    ['VACUO', 'slipstream'],
    ['resfriar', 'react'],
    ['superaquecimento', 'heat'],
    ['bloqueio', 'reveal-move'],
    ['condicoes', 'weather'],
    ['weather-road', 'road'],
  ])
    assert.ok(heatSearch(query).some((entry) => entry.id === id));
  assert.deepEqual(heatSearch('vácuo'), heatSearch('vacuo'));
  assert.deepEqual(heatSearch('CONDIÇÕES'), heatSearch('condicoes'));
});

test('isolates Heat modules and combines module, category and query filters', () => {
  const defaultModule = heat.modules.find((module) => module.defaultEnabled).id;
  assert.equal(defaultModule, 'base');
  const base = heatSearch('', '', defaultModule);
  assert.ok(base.length > 0);
  assert.ok(base.every((entry) => entry.module === 'base'));
  assert.ok(!base.some((entry) => entry.id === 'championship'));
  for (const module of heat.modules) {
    const results = heatSearch('', '', module.id);
    assert.equal(
      results.length,
      heatSource.playerAid.rules.filter((rule) => rule.module === module.id).length,
    );
    assert.ok(results.every((entry) => entry.module === module.id));
  }
  assert.equal(heatSearch('', 'turno', 'base').length, 9);
  assert.deepEqual(heatSearch('campeonato', '', 'base'), []);
  assert.deepEqual(
    heatSearch('campeonato', '', 'championship').map((entry) => entry.id),
    ['championship'],
  );
  assert.deepEqual(heatSearch('inexistente', '', 'garage'), []);
  assert.deepEqual(heatSearch('', '', 'missing-module'), []);
});
