import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { format, resolveConfig } from 'prettier';

export const MLBB_ROLES_SOURCE =
  'https://akmweb.youngjoygame.com/web/svnres/mlbb/homepage_2_1_41/latest/en_hero_list.json';

const allowedRoles = new Set(['tank', 'fighter', 'assassin', 'mage', 'marksman', 'support']);
const filters = new Set(['all', 'gold-lane', 'jungle', 'roam', 'mid-lane', 'exp-lane']);
const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Read all role labels; the legacy /hero/detail endpoint only provides one type. */
export function collectHeroRoles(catalog, sourceHeroes, previousRoles, manualRoleIds = []) {
  assert.ok(Array.isArray(sourceHeroes) && sourceHeroes.length, 'Missing official hero list');
  const sourceByName = new Map();
  for (const hero of sourceHeroes) {
    const key = slug(hero.name);
    assert.ok(!sourceByName.has(key), `Duplicate source hero: ${hero.name}`);
    sourceByName.set(key, hero);
  }
  const manual = new Set(manualRoleIds);
  const roles = {};
  for (const hero of catalog.filter((hero) => !filters.has(hero.id))) {
    const source = sourceByName.get(slug(hero.name));
    const labels = manual.has(hero.id) ? previousRoles[hero.id] : source?.sortlabel;
    assert.ok(Array.isArray(labels), `Missing roles: ${hero.id}`);
    // Single-role heroes use an empty string in the second slot.
    const classes = [...new Set(labels.map((label) => label.trim().toLowerCase()).filter(Boolean))];
    assert.ok(classes.length, `Empty roles: ${hero.id}`);
    assert.ok(
      classes.every((role) => allowedRoles.has(role)),
      `Unknown role: ${hero.id}`,
    );
    roles[hero.id] = classes;
  }
  assert.ok(
    manualRoleIds.every((id) => roles[id]),
    'Unknown manual hero ID',
  );
  return roles;
}

async function main() {
  const args = process.argv.slice(2);
  assert.ok(
    args.length === 0 || (args.length === 2 && args[0] === '--input'),
    'Usage: node scripts/update-mlbb-roles.mjs [--input official-hero-list.json]',
  );
  const root = new URL('../src/data/mlbb/', import.meta.url);
  const rolesFile = new URL('hero-roles.json', root);
  const previous = JSON.parse(await readFile(rolesFile, 'utf8'));
  const catalog = JSON.parse(await readFile(new URL('heroes.json', root), 'utf8'));
  let source;
  if (args[0] === '--input') {
    source = JSON.parse(await readFile(args[1], 'utf8'));
  } else {
    const response = await fetch(MLBB_ROLES_SOURCE, { signal: AbortSignal.timeout(30_000) });
    assert.ok(response.ok, `Official catalog request failed: ${response.status}`);
    source = await response.json();
  }
  assert.equal(source.lan, 'en', 'Expected English role labels');
  const roles = collectHeroRoles(catalog, source.hero_list, previous.roles, previous.manualRoleIds);
  const changed = Object.keys(roles).filter(
    (id) => JSON.stringify(roles[id]) !== JSON.stringify(previous.roles[id]),
  );
  const result = {
    ...previous,
    source: MLBB_ROLES_SOURCE,
    checkedAt: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Fortaleza' }).format(
      new Date(),
    ),
    roles,
  };
  // Write only after every playable hero and role has passed validation.
  const formatted = await format(JSON.stringify(result), {
    ...(await resolveConfig(fileURLToPath(rolesFile))),
    parser: 'json',
  });
  await writeFile(rolesFile, formatted);
  console.log(`${Object.keys(roles).length} heroes classified; ${changed.length} updated.`);
  for (const id of changed) console.log(`${id}: ${roles[id].join(' / ')}`);
  console.log(`Saved ${fileURLToPath(rolesFile)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
