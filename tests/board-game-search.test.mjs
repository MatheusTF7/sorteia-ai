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
