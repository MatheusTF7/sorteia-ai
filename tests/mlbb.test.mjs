import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { effectScope } from 'vue';
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

const participantsUrl = await moduleUrl('../src/utils/participants.ts');
const { canDrawHeroes, drawMlbbHeroes, eligiblePresets, heroPools, validHeroPick } = await import(
  await moduleUrl('../src/utils/mlbb-heroes.ts', {
    './random': await moduleUrl('../src/utils/random.ts'),
  })
);
const heroCatalog = JSON.parse(
  await readFile(new URL('../src/data/mlbb/heroes.json', import.meta.url), 'utf8'),
);
const heroRoles = JSON.parse(
  await readFile(new URL('../src/data/mlbb/hero-roles.json', import.meta.url), 'utf8'),
).roles;
const heroStats = JSON.parse(
  await readFile(new URL('../src/data/mlbb/hero-stats.json', import.meta.url), 'utf8'),
);
const statsById = new Map(heroStats.heroes.map((hero) => [hero.id, hero]));
// Mirrors src/data/mlbb/catalog.ts, which cannot be imported here because of require.context.
const playableHeroes = heroCatalog.slice(6).map((hero) => {
  const entry = statsById.get(hero.id);
  return {
    id: hero.id,
    name: hero.name,
    localImage: entry?.localImage ?? `heroes-mini/${hero.id}.png`,
    classes: heroRoles[hero.id] ?? [],
    ...(entry && {
      stats: {
        winRate: entry.winRate,
        pickRate: entry.pickRate,
        banRate: entry.banRate,
        position: entry.position,
      },
      counters: entry.counters.map((counter) => counter.heroId),
    }),
  };
});
const byId = (id) => playableHeroes.find((hero) => hero.id === id);
const isCounterPair = (a, b) => a.counters.includes(b.id) || b.counters.includes(a.id);
const allClasses = ['tank', 'fighter', 'assassin', 'mage', 'marksman', 'support'];

test('season stats cover every playable hero and every counter points to a known hero', () => {
  assert.equal(heroStats.heroes.length, playableHeroes.length);
  for (const hero of playableHeroes) {
    assert.ok(hero.stats, hero.id);
    assert.ok(hero.localImage.startsWith('heroes-mini/'), hero.id);
    assert.equal(hero.counters.length, 5, hero.id);
    assert.ok(!hero.counters.includes(hero.id), hero.id);
    for (const id of hero.counters) assert.ok(byId(id), `${hero.id} -> ${id}`);
  }
});

test('uniform mode is the default and still allows counter pairs', () => {
  const masha = byId('masha');
  const counter = byId(masha.counters[0]);
  const heroes = [
    { ...masha, classes: ['fighter'] },
    { ...counter, classes: ['fighter'] },
  ];
  const settings = { classes: ['fighter'], bannedIds: [], overrides: {} };
  const pick = drawMlbbHeroes(heroes, settings);
  assert.ok(pick);
  assert.ok(validHeroPick(pick, heroes, settings));
  assert.equal(drawMlbbHeroes(heroes, { ...settings, drawMode: 'avoid-counters' }), null);
  assert.ok(!validHeroPick(pick, heroes, { ...settings, drawMode: 'avoid-counters' }));
});

test('avoid-counters mode never draws a pair where either hero counters the other', () => {
  const settings = {
    classes: allClasses,
    bannedIds: [],
    overrides: {},
    drawMode: 'avoid-counters',
  };
  for (let index = 0; index < 300; index++) {
    const pick = drawMlbbHeroes(playableHeroes, settings);
    assert.ok(validHeroPick(pick, playableHeroes, settings));
    assert.ok(!isCounterPair(byId(pick.heroAId), byId(pick.heroBId)));
  }
});

test('balanced mode respects the win rate gap, avoids counters and drops classes without a pair', () => {
  const settings = {
    classes: allClasses,
    bannedIds: [],
    overrides: {},
    drawMode: 'balanced',
    maxWinRateGap: 1,
  };
  for (let index = 0; index < 300; index++) {
    const pick = drawMlbbHeroes(playableHeroes, settings);
    const [a, b] = [byId(pick.heroAId), byId(pick.heroBId)];
    assert.ok(Math.abs(a.stats.winRate - b.stats.winRate) <= 1);
    assert.ok(!isCounterPair(a, b));
  }
  const far = [
    { id: 'low', classes: ['mage'], counters: [], stats: { winRate: 45 } },
    { id: 'high', classes: ['mage'], counters: [], stats: { winRate: 55 } },
    { id: 'unknown', classes: ['mage'] },
  ];
  const mage = { classes: ['mage'], bannedIds: [], overrides: {}, drawMode: 'balanced' };
  assert.deepEqual(heroPools(far, mage), []);
  assert.equal(drawMlbbHeroes(far, { ...mage, maxWinRateGap: 9.5 }), null);
  assert.deepEqual(
    drawMlbbHeroes(far, { ...mage, maxWinRateGap: 10 }, () => 0),
    {
      classId: 'mage',
      heroAId: 'low',
      heroBId: 'high',
    },
  );
});

test('restricted modes pick uniformly among allowed pairs and randomise the sides', () => {
  const heroes = ['a', 'b', 'c'].map((id) => ({ id, classes: ['tank'], counters: [] }));
  heroes[0].counters = ['b'];
  const settings = { classes: ['tank'], bannedIds: [], overrides: {}, drawMode: 'avoid-counters' };
  const seen = new Set();
  for (let index = 0; index < 200; index++) {
    const pick = drawMlbbHeroes(heroes, settings);
    seen.add(pick.heroAId + pick.heroBId);
  }
  assert.deepEqual([...seen].sort(), ['ac', 'bc', 'ca', 'cb']);
});

test('hero draws use a selected class then two different eligible heroes, respecting every ban', () => {
  const settings = { classes: ['mage', 'fighter'], bannedIds: ['eudora', 'miya'], overrides: {} };
  for (let index = 0; index < 100; index++) {
    const pick = drawMlbbHeroes(playableHeroes, settings);
    assert.ok(validHeroPick(pick, playableHeroes, settings));
    assert.notEqual(pick.heroAId, pick.heroBId);
    assert.ok(!settings.bannedIds.includes(pick.heroAId));
    assert.ok(!settings.bannedIds.includes(pick.heroBId));
  }
});

test('empty selections and fully banned or undersized classes return no pick', () => {
  assert.equal(drawMlbbHeroes(playableHeroes, { classes: [], bannedIds: [], overrides: {} }), null);
  const settings = {
    classes: ['mage'],
    bannedIds: playableHeroes.filter((hero) => hero.id !== 'eudora').map((hero) => hero.id),
    overrides: {},
  };
  assert.equal(drawMlbbHeroes(playableHeroes, settings), null);
  assert.deepEqual(heroPools(playableHeroes, settings), []);
});

test('hero classes can be configured per tournament and hybrid heroes enter each permitted pool', () => {
  const heroes = [
    { id: 'a', classes: [] },
    { id: 'b', classes: ['mage', 'fighter'] },
  ];
  const settings = {
    classes: ['mage', 'fighter'],
    bannedIds: [],
    overrides: { a: ['mage', 'fighter'] },
  };
  assert.equal(heroPools(heroes, settings).length, 2);
  assert.equal(drawMlbbHeroes(heroes, settings, () => 0).classId, 'fighter');
  assert.equal(drawMlbbHeroes(heroes, settings, () => 0.999).classId, 'mage');
});

test('every playable catalog image exists locally and navigation filters cannot be drawn', async () => {
  assert.equal(playableHeroes.length, heroCatalog.length - 6);
  for (const hero of playableHeroes)
    await readFile(new URL('../src/data/mlbb/' + hero.localImage, import.meta.url));
  assert.ok(
    playableHeroes.every(
      (hero) => !['all', 'gold-lane', 'jungle', 'roam', 'mid-lane', 'exp-lane'].includes(hero.id),
    ),
  );
});
const utilityUrl = await moduleUrl('../src/utils/mlbb.ts', {
  './participants': participantsUrl,
  './random': await moduleUrl('../src/utils/random.ts'),
});
const {
  buildMlbbRounds,
  buildMlbbThirdPlaceMatch,
  mlbbThirdPlaceId,
  drawMlbbBracket,
  emptyMlbbTournament,
  mlbbBracketSize,
  mlbbDescendants,
  parseMlbbNames,
  restoreMlbbStore,
  restoreMlbbTournament,
  setMlbbResult,
} = await import(utilityUrl);
const { useMlbb, MLBB_STORAGE_KEY } = await import(
  await moduleUrl('../src/composables/useMlbb.ts', {
    vue: import.meta.resolve('vue'),
    'src/utils/mlbb': utilityUrl,
    'src/utils/participants': participantsUrl,
  })
);

function tournament(count, rules = {}) {
  const value = emptyMlbbTournament('tournament');
  value.players = Array.from({ length: count }, (_, index) => ({
    id: `p${index + 1}`,
    name: `Player ${index + 1}`,
    gameId: '',
    serverId: '',
  }));
  Object.assign(value.rules, rules);
  return drawMlbbBracket(value, () => 0.5);
}
function finish(value) {
  while (true) {
    const match = buildMlbbRounds(value)
      .flat()
      .find((match) => match.status === 'ready');
    if (!match) return value;
    value = setMlbbResult(value, match.id, {
      kind: 'score',
      scoreA: Math.floor(match.bestOf / 2) + 1,
      scoreB: 0,
    });
  }
}

test('MD1 records 3-0 kills as 1-0 series wins and preserves both through restore', () => {
  const value = tournament(2, { finalBestOf: 1 });
  const match = buildMlbbRounds(value)[0][0];
  const updated = setMlbbResult(value, match.id, {
    kind: 'score',
    scoreA: 1,
    scoreB: 0,
    games: [{ scoreA: 3, scoreB: 0, winnerId: match.playerAId }],
  });
  assert.equal(updated.results[match.id].scoreA, 1);
  assert.equal(updated.results[match.id].games[0].scoreA, 3);
  assert.deepEqual(restoreMlbbTournament(JSON.parse(JSON.stringify(updated))), updated);
});

test('game winner can have fewer kills under tower rules and series wins follow declared winners', () => {
  const value = tournament(2, { finalBestOf: 3 });
  const match = buildMlbbRounds(value)[0][0];
  const games = [
    { scoreA: 8, scoreB: 2, winnerId: match.playerBId },
    { scoreA: 0, scoreB: 0, winnerId: match.playerBId },
  ];
  const updated = setMlbbResult(value, match.id, { kind: 'score', scoreA: 0, scoreB: 2, games });
  assert.equal(buildMlbbRounds(updated)[0][0].winnerId, match.playerBId);
  assert.deepEqual(restoreMlbbTournament(updated), updated);
});

test('rejects mismatched series counts, invalid kills, outsiders and games after the series was won', () => {
  const value = tournament(2, { finalBestOf: 3 });
  const match = buildMlbbRounds(value)[0][0];
  const win = { scoreA: 3, scoreB: 0, winnerId: match.playerAId };
  for (const games of [
    [win],
    [win, { ...win, scoreA: -1 }],
    [win, { ...win, scoreA: 1.5 }],
    [win, { ...win, winnerId: 'outsider' }],
    [win, win, { ...win, winnerId: match.playerBId }],
  ]) {
    assert.throws(
      () => setMlbbResult(value, match.id, { kind: 'score', scoreA: 2, scoreB: 0, games }),
      RangeError,
    );
  }
});

test('third-place match resolves semifinal losers independently of the main final and restores', () => {
  let value = finish(tournament(8, { thirdPlace: 'match', thirdPlaceBestOf: 1 }));
  const match = buildMlbbThirdPlaceMatch(value);
  assert.equal(match.status, 'ready');
  const final = buildMlbbRounds(value).at(-1)[0];
  assert.ok(![final.playerAId, final.playerBId].includes(match.playerAId));
  assert.ok(![final.playerAId, final.playerBId].includes(match.playerBId));
  value = setMlbbResult(value, match.id, {
    kind: 'score',
    scoreA: 0,
    scoreB: 1,
    games: [{ scoreA: 1, scoreB: 3, winnerId: match.playerBId }],
  });
  assert.equal(mlbbThirdPlaceId(value), match.playerBId);
  assert.equal(buildMlbbRounds(value).at(-1)[0].winnerId, final.winnerId);
  assert.deepEqual(restoreMlbbTournament(JSON.parse(JSON.stringify(value))), value);
  assert.equal(buildMlbbThirdPlaceMatch(tournament(4, { thirdPlace: 'match' })).status, 'waiting');
});

test('correcting a semifinal invalidates the bronze result; correcting final does not', () => {
  let value = finish(tournament(4, { thirdPlace: 'match', thirdPlaceBestOf: 1 }));
  const bronze = buildMlbbThirdPlaceMatch(value);
  value = setMlbbResult(value, bronze.id, { kind: 'wo', winnerId: bronze.playerAId });
  const semifinal = buildMlbbRounds(value)[0][0];
  const corrected = setMlbbResult(value, semifinal.id, { kind: 'score', scoreA: 0, scoreB: 1 });
  assert.equal(corrected.results['third-place'], undefined);
  assert.equal(corrected.results['r2-m1'], undefined);
  assert.equal(buildMlbbThirdPlaceMatch(corrected).playerAId, semifinal.playerAId);
  const finalCorrected = setMlbbResult(value, 'r2-m1', { kind: 'score', scoreA: 0, scoreB: 2 });
  assert.deepEqual(finalCorrected.results['third-place'], value.results['third-place']);
});

test('automatic third place is the champion semifinal opponent and changes with final winner', () => {
  const value = finish(tournament(4, { thirdPlace: 'champion-loser' }));
  const semifinals = buildMlbbRounds(value)[0];
  assert.equal(mlbbThirdPlaceId(value), semifinals[0].playerBId);
  const changed = setMlbbResult(value, 'r2-m1', { kind: 'score', scoreA: 0, scoreB: 2 });
  assert.equal(mlbbThirdPlaceId(changed), semifinals[1].playerBId);
  assert.equal(mlbbThirdPlaceId(tournament(4, { thirdPlace: 'champion-loser' })), null);
  assert.equal(mlbbThirdPlaceId(finish(tournament(2, { thirdPlace: 'champion-loser' }))), null);
});

test('legacy series-only results restore without inventing kills', () => {
  const value = finish(tournament(4));
  delete value.rules.thirdPlace;
  delete value.rules.thirdPlaceBestOf;
  const restored = restoreMlbbTournament(value);
  assert.deepEqual(restored.results, value.results);
  assert.equal(restored.rules.thirdPlace, 'none');
  assert.equal(restored.results['r1-m1'].games, undefined);
});

test('hero choices, bans, class overrides and exact pre-draw survive backup restoration', () => {
  const value = tournament(4);
  value.heroSettings = {
    classes: ['mage'],
    bannedIds: ['eudora'],
    overrides: { hirara: ['mage'] },
  };
  const pick = drawMlbbHeroes(playableHeroes, value.heroSettings);
  value.heroPicks = { 'r1-m1': pick };
  const restored = restoreMlbbTournament(JSON.parse(JSON.stringify(value)));
  assert.deepEqual(restored.heroSettings, value.heroSettings);
  assert.deepEqual(restored.heroPicks, value.heroPicks);
  assert.ok(validHeroPick(restored.heroPicks['r1-m1'], playableHeroes, restored.heroSettings));
});

test('draw mode and win rate gap survive backups; invalid values fall back to the defaults', () => {
  const value = tournament(4);
  value.heroSettings = {
    classes: ['mage'],
    bannedIds: [],
    overrides: {},
    drawMode: 'balanced',
    maxWinRateGap: 2.5,
  };
  assert.deepEqual(
    restoreMlbbTournament(JSON.parse(JSON.stringify(value))).heroSettings,
    value.heroSettings,
  );
  value.heroSettings = { ...value.heroSettings, drawMode: 'cheat', maxWinRateGap: 999 };
  const restored = restoreMlbbTournament(JSON.parse(JSON.stringify(value))).heroSettings;
  assert.equal(restored.drawMode, undefined);
  assert.equal(restored.maxWinRateGap, 15);
});

test('all sizes from 2 to 64 produce a complete elimination tree, fair byes and exactly N-1 played duels', () => {
  for (let count = 2; count <= 64; count++) {
    const value = tournament(count);
    const rounds = buildMlbbRounds(value);
    const first = rounds[0];
    assert.equal(rounds.length, Math.log2(mlbbBracketSize(count)));
    assert.equal(
      first.filter((match) => match.status === 'bye').length,
      mlbbBracketSize(count) - count,
    );
    const ids = first.flatMap((match) => [match.playerAId, match.playerBId]).filter(Boolean);
    assert.equal(ids.length, count);
    assert.equal(new Set(ids).size, count);
    assert.ok(first.every((match) => match.playerAId));
    for (let round = 1; round < rounds.length; round++) {
      rounds[round].forEach((match, index) => {
        assert.equal(match.sourceA, rounds[round - 1][index * 2].id);
        assert.equal(match.sourceB, rounds[round - 1][index * 2 + 1].id);
        // An unknown opponent must never be treated as an automatic advance.
        if (match.status === 'waiting') assert.equal(match.winnerId, null);
      });
    }
    const done = finish(value);
    assert.equal(Object.keys(done.results).length, count - 1);
    assert.ok(buildMlbbRounds(done).at(-1)[0].winnerId);
    assert.deepEqual(restoreMlbbTournament(JSON.parse(JSON.stringify(done))), done);
  }
});

test('draw shuffles a copy and leaves the stored bracket stable until an explicit redraw', () => {
  const value = tournament(8);
  const before = structuredClone(value);
  const different = drawMlbbBracket(value, () => 0);
  assert.deepEqual(value, before);
  assert.notDeepEqual(different.seededIds, value.seededIds);
  assert.deepEqual(buildMlbbRounds(value), buildMlbbRounds(value));
});

test('applies separate match, semifinal and final formats including an arbitrary MD7', () => {
  const rounds = buildMlbbRounds(tournament(16, { bestOf: 2, semifinalBestOf: 4, finalBestOf: 7 }));
  assert.deepEqual(
    rounds.map((round) => [...new Set(round.map((match) => match.bestOf))]),
    [[2], [2], [4], [7]],
  );
  assert.equal(
    buildMlbbRounds(tournament(2, { bestOf: 9, semifinalBestOf: 5, finalBestOf: 3 }))[0][0].bestOf,
    3,
  );
});

test('supports 3 x 1 and 1 x 0 scores and automatically selects the player with more wins', () => {
  let value = tournament(4, { semifinalBestOf: 1, finalBestOf: 5 });
  for (const match of buildMlbbRounds(value)[0])
    value = setMlbbResult(value, match.id, { kind: 'score', scoreA: 1, scoreB: 0 });
  const final = buildMlbbRounds(value).at(-1)[0];
  value = setMlbbResult(value, final.id, { kind: 'score', scoreA: 1, scoreB: 3 });
  assert.equal(buildMlbbRounds(value).at(-1)[0].winnerId, final.playerBId);
});

test('rejects unfinished, fractional, negative and impossible scores and matches without opponents', () => {
  const value = tournament(8, { bestOf: 5 });
  const match = buildMlbbRounds(value)[0][0];
  for (const [scoreA, scoreB] of [
    [0, 0],
    [1, 0],
    [2, 1],
    [3, 3],
    [4, 0],
    [3, -1],
    [NaN, 0],
    [2.5, 0],
    [3, 4],
  ]) {
    assert.throws(
      () => setMlbbResult(value, match.id, { kind: 'score', scoreA, scoreB }),
      RangeError,
    );
  }
  assert.throws(
    () => setMlbbResult(value, 'r2-m1', { kind: 'score', scoreA: 1, scoreB: 0 }),
    RangeError,
  );
  assert.throws(() => setMlbbResult(value, 'missing', null), RangeError);
});

test('even MD2/MD4 series require the rules’ explicit tiebreak winner when tied at the limit', () => {
  for (const bestOf of [2, 4]) {
    const value = tournament(2, { finalBestOf: bestOf });
    const match = buildMlbbRounds(value)[0][0];
    const score = { kind: 'score', scoreA: bestOf / 2, scoreB: bestOf / 2 };
    assert.throws(() => setMlbbResult(value, match.id, score), RangeError);
    assert.throws(
      () => setMlbbResult(value, match.id, { ...score, winnerId: 'outsider' }),
      RangeError,
    );
    const tied = setMlbbResult(value, match.id, { ...score, winnerId: match.playerBId });
    assert.equal(buildMlbbRounds(tied)[0][0].winnerId, match.playerBId);
    assert.deepEqual(restoreMlbbTournament(tied), tied);
  }
});

test('MD4 permits a non-tied full 3-1 or clinched 3-0, but cannot end at 2-1', () => {
  const value = tournament(2, { finalBestOf: 4 });
  for (const [scoreA, scoreB] of [
    [3, 1],
    [3, 0],
  ])
    assert.ok(setMlbbResult(value, 'r1-m1', { kind: 'score', scoreA, scoreB }).results['r1-m1']);
  assert.throws(
    () => setMlbbResult(value, 'r1-m1', { kind: 'score', scoreA: 2, scoreB: 1 }),
    RangeError,
  );
});

test('walkovers select only an actual opponent and restore without fabricating a played score', () => {
  const value = tournament(2);
  const match = buildMlbbRounds(value)[0][0];
  assert.throws(
    () => setMlbbResult(value, match.id, { kind: 'wo', winnerId: 'outsider' }),
    RangeError,
  );
  const updated = setMlbbResult(value, match.id, { kind: 'wo', winnerId: match.playerAId });
  assert.equal(updated.results[match.id].kind, 'wo');
  assert.equal(buildMlbbRounds(updated)[0][0].winnerId, match.playerAId);
  assert.deepEqual(restoreMlbbTournament(updated), updated);
});

test('correcting a winner clears only dependent matches, including a final the old winner lost', () => {
  const value = finish(tournament(8));
  const match = buildMlbbRounds(value)[0][0];
  assert.deepEqual(mlbbDescendants(value, match.id), ['r2-m1', 'r3-m1']);
  const corrected = setMlbbResult(value, match.id, { kind: 'score', scoreA: 0, scoreB: 1 });
  assert.ok(corrected.results['r1-m1']);
  assert.equal(corrected.results['r2-m1'], undefined);
  assert.equal(corrected.results['r3-m1'], undefined);
  assert.deepEqual(corrected.results['r2-m2'], value.results['r2-m2']);
  assert.equal(buildMlbbRounds(corrected).at(-1)[0].winnerId, null);
  assert.ok(buildMlbbRounds(value).at(-1)[0].winnerId);
});

test('score corrections that preserve a winner preserve later results; clearing invalidates dependents', () => {
  const value = finish(tournament(8, { bestOf: 3 }));
  const corrected = setMlbbResult(value, 'r1-m1', { kind: 'score', scoreA: 2, scoreB: 1 });
  assert.deepEqual(corrected.results['r3-m1'], value.results['r3-m1']);
  const cleared = setMlbbResult(corrected, 'r1-m1', null);
  assert.equal(cleared.results['r1-m1'], undefined);
  assert.equal(cleared.results['r2-m1'], undefined);
  assert.equal(cleared.results['r3-m1'], undefined);
  assert.deepEqual(cleared.results['r2-m2'], value.results['r2-m2']);
});

test('restoration drops stale opponents and invalid upstream results instead of reviving a champion', () => {
  const value = finish(tournament(8));
  const damaged = structuredClone(value);
  damaged.results['r1-m1'].playerAId = 'outsider';
  const restored = restoreMlbbTournament(damaged);
  assert.equal(restored.results['r1-m1'], undefined);
  assert.equal(restored.results['r2-m1'], undefined);
  assert.equal(restored.results['r3-m1'], undefined);
  assert.ok(restored.results['r2-m2']);
  assert.equal(buildMlbbRounds(restored).at(-1)[0].winnerId, null);
});

test('restoration rejects duplicate identities, handles malformed inputs and resets invalid bracket permutations', () => {
  for (const input of [null, [], 7, {}, { id: 't', rules: {}, players: [null] }])
    assert.equal(restoreMlbbTournament(input), null);
  const duplicate = tournament(4);
  duplicate.players[1].name = duplicate.players[0].name.toUpperCase();
  assert.equal(restoreMlbbTournament(duplicate), null);
  const invalid = finish(tournament(4));
  invalid.seededIds[0] = invalid.seededIds[1];
  const restored = restoreMlbbTournament(invalid);
  assert.deepEqual(restored.seededIds, []);
  assert.deepEqual(restored.results, {});
});

test('parses nicknames using Unicode-normalized case-insensitive identities', () => {
  assert.deepEqual(parseMlbbNames(' Ana ; ANA\nJose\u0301, José; Blue   Sky', [{ name: 'ana' }]), [
    'José',
    'Blue Sky',
  ]);
});

test('draw guards player and format limits', () => {
  for (const count of [0, 1, 65]) assert.throws(() => tournament(count), RangeError);
  for (const format of [0, -1, 1.5, 100, NaN, '2'])
    assert.throws(() => tournament(4, { bestOf: format }), RangeError);
});

test('store restores multiple tournaments, deduplicates IDs and selects a valid active tournament', () => {
  const a = tournament(4);
  const b = { ...finish(tournament(8)), id: 'other' };
  const restored = restoreMlbbStore({ version: 1, activeId: b.id, tournaments: [a, null, a, b] });
  assert.equal(restored.tournaments.length, 2);
  assert.equal(restored.activeId, b.id);
  assert.equal(
    restoreMlbbStore({ version: 1, activeId: 'missing', tournaments: [a] }).activeId,
    a.id,
  );
  assert.deepEqual(restoreMlbbStore({ version: 9, tournaments: [a] }).tournaments, []);
});

function storageFixture(run, initial = new Map()) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const storage = {
    getItem: (key) => initial.get(key) ?? null,
    setItem: (key, value) => initial.set(key, value),
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  const scopes = [];
  const mount = () => {
    const scope = effectScope();
    scopes.push(scope);
    return scope.run(() => useMlbb());
  };
  try {
    run({ mount, initial, storage });
  } finally {
    scopes.forEach((scope) => scope.stop());
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  }
}

test('persists registration, rules, exact draw, results and draft text across remounts', () =>
  storageFixture(({ mount }) => {
    const app = mount();
    assert.equal(app.addNames('Ana, Bruno, Caio'), 3);
    app.current.value.name = 'Copa X1';
    app.current.value.rules.notes = 'Regra de desempate: decisão do juiz.';
    app.current.value.draftNames = 'Dora';
    app.draw();
    const match = app.rounds.value[0].find((match) => match.status === 'ready');
    app.saveResult(match.id, { kind: 'score', scoreA: 1, scoreB: 0 });
    const restored = mount();
    assert.deepEqual(
      JSON.parse(JSON.stringify(restored.store.value)),
      JSON.parse(JSON.stringify(app.store.value)),
    );
    assert.equal(restored.locked.value, true);
    assert.equal(restored.current.value.draftNames, 'Dora');
  }));

test('locks registration after draw and reopening preserves players while clearing results', () =>
  storageFixture(({ mount }) => {
    const app = mount();
    app.addNames('Ana, Bruno');
    assert.equal(app.updatePlayer(app.current.value.players[0].id, 'ANA', '123', '456'), true);
    assert.equal(app.updatePlayer(app.current.value.players[1].id, 'ana', '', ''), false);
    app.draw();
    const before = JSON.stringify(app.current.value.players);
    assert.equal(app.addNames('Caio'), 0);
    app.removePlayer(app.current.value.players[0].id);
    assert.equal(app.updatePlayer(app.current.value.players[0].id, 'Other', '', ''), false);
    assert.equal(JSON.stringify(app.current.value.players), before);
    app.saveResult('r1-m1', { kind: 'score', scoreA: 2, scoreB: 0 });
    assert.ok(app.championId.value);
    app.reopen();
    assert.equal(app.locked.value, false);
    assert.equal(app.championId.value, null);
    assert.equal(JSON.stringify(app.current.value.players), before);
    assert.deepEqual(app.current.value.results, {});
  }));

test('creating and deleting a tournament preserves the others and never leaves an invalid current selection', () =>
  storageFixture(({ mount }) => {
    const app = mount();
    app.addNames('Ana, Bruno');
    const originalId = app.current.value.id;
    assert.equal(app.create(), true);
    assert.notEqual(app.current.value.id, originalId);
    app.removeCurrent();
    assert.equal(app.current.value.id, originalId);
    assert.equal(app.current.value.players.length, 2);
    app.removeCurrent();
    assert.equal(app.store.value.tournaments.length, 1);
    assert.equal(app.current.value.players.length, 0);
  }));

test('storage failures keep the tournament usable and expose an error until a successful save', () =>
  storageFixture(({ mount, storage }) => {
    storage.setItem = () => {
      throw new Error('quota');
    };
    const app = mount();
    assert.equal(app.storageError.value, true);
    assert.equal(app.addNames('Ana, Bruno'), 2);
    app.draw();
    assert.equal(app.locked.value, true);
    storage.setItem = () => {};
    app.current.value.name = 'Recovered';
    assert.equal(app.storageError.value, false);
  }));

test('malformed saved JSON starts a usable draft with a recovery warning', () =>
  storageFixture(
    ({ mount }) => {
      const app = mount();
      assert.equal(app.recoveryWarning.value, true);
      assert.equal(app.current.value.players.length, 0);
    },
    new Map([[MLBB_STORAGE_KEY, '{bad JSON']]),
  ));

const duelPresets = JSON.parse(
  await readFile(new URL('../src/data/mlbb/duel-presets.json', import.meta.url), 'utf8'),
).presets;
const presetSettings = { classes: allClasses, bannedIds: [], overrides: {}, drawMode: 'presets' };

test('curated matchups reference distinct, classified heroes and have text in both languages', () => {
  const ids = new Set();
  for (const preset of duelPresets) {
    assert.ok(/^[a-z0-9-]+$/.test(preset.id) && !ids.has(preset.id), preset.id);
    ids.add(preset.id);
    assert.equal(preset.heroes.length, 2, preset.id);
    const [a, b] = preset.heroes.map(byId);
    assert.ok(a && b && a.id !== b.id, preset.id);
    assert.ok(a.classes.length && b.classes.length, preset.id);
    for (const field of [preset.title, preset.description])
      for (const locale of ['pt-BR', 'en-US']) assert.ok(field[locale]?.trim(), preset.id + locale);
  }
  assert.equal(eligiblePresets(playableHeroes, presetSettings, duelPresets).length, ids.size);
});

test('themed mode draws only curated matchups, respects bans and classes and avoids repeats', () => {
  const context = { presets: duelPresets, usedPresetIds: [] };
  for (let index = 0; index < duelPresets.length; index++) {
    const pick = drawMlbbHeroes(playableHeroes, presetSettings, Math.random, context);
    const preset = duelPresets.find((preset) => preset.id === pick.presetId);
    assert.deepEqual([pick.heroAId, pick.heroBId].sort(), [...preset.heroes].sort());
    assert.ok(validHeroPick(pick, playableHeroes, presetSettings, duelPresets));
    assert.ok(!context.usedPresetIds.includes(pick.presetId));
    context.usedPresetIds.push(pick.presetId);
  }
  // Once every matchup was used, repeats are allowed instead of failing.
  assert.ok(drawMlbbHeroes(playableHeroes, presetSettings, Math.random, context));

  const banned = { ...presetSettings, bannedIds: ['gusion'] };
  const left = eligiblePresets(playableHeroes, banned, duelPresets).map(({ preset }) => preset.id);
  assert.ok(!left.includes('paxley-brothers') && !left.includes('combo-masters'));
  const tanks = { ...presetSettings, classes: ['tank'] };
  for (const { preset } of eligiblePresets(playableHeroes, tanks, duelPresets))
    assert.ok(
      preset.heroes.every((id) => byId(id).classes.includes('tank')),
      preset.id,
    );
  assert.ok(!canDrawHeroes(playableHeroes, { ...presetSettings, classes: [] }, duelPresets));
  assert.equal(
    drawMlbbHeroes(playableHeroes, { ...presetSettings, classes: [] }, Math.random, context),
    null,
  );
});

test('picks belong to the mode that drew them, so switching modes replaces upcoming picks', () => {
  const themed = drawMlbbHeroes(playableHeroes, presetSettings, Math.random, {
    presets: duelPresets,
  });
  const uniform = { ...presetSettings, drawMode: undefined };
  assert.ok(!validHeroPick(themed, playableHeroes, uniform, duelPresets));
  const plain = drawMlbbHeroes(playableHeroes, uniform);
  assert.ok(!validHeroPick(plain, playableHeroes, presetSettings, duelPresets));
  const tampered = { ...themed, heroBId: themed.heroAId === 'miya' ? 'layla' : 'miya' };
  assert.ok(!validHeroPick(tampered, playableHeroes, presetSettings, duelPresets));
});

test('themed mode and matchup IDs survive backups', () => {
  const value = tournament(4);
  value.heroSettings = { ...presetSettings, classes: ['mage'] };
  value.heroPicks = {
    'r1-m1': { classId: 'mage', heroAId: 'valir', heroBId: 'aurora', presetId: 'fire-and-ice' },
    'r1-m2': { classId: 'mage', heroAId: 'pharsa', heroBId: 'yve', presetId: 'Bad ID!' },
  };
  const restored = restoreMlbbTournament(JSON.parse(JSON.stringify(value)));
  assert.equal(restored.heroSettings.drawMode, 'presets');
  assert.deepEqual(restored.heroPicks['r1-m1'], value.heroPicks['r1-m1']);
  assert.equal(restored.heroPicks['r1-m2'].presetId, undefined);
});
