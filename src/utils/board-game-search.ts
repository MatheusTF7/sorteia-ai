import type { BoardGame, BoardGameEntry } from '../types/board-games';

export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getGameEntries(game: BoardGame): BoardGameEntry[] {
  return [
    ...game.setup,
    ...game.rules,
    ...(game.potions ?? []).map(
      (potion): BoardGameEntry => ({
        id: potion.id,
        title: potion.name,
        subtitle: potion.originalName,
        category: 'pocoes',
        summary: potion.effect,
        details: potion.notes,
        tags: potion.tags,
      }),
    ),
  ];
}

export function createGameSearch(
  entries: BoardGameEntry[],
  synonyms: Record<string, string[]>,
): (query: string, category?: string) => BoardGameEntry[] {
  const groups = Object.entries(synonyms).map(([term, aliases]) =>
    [term, ...aliases].map(normalizeSearch),
  );
  const index = entries.map((entry) => {
    const text = normalizeSearch(
      [entry.title, entry.subtitle ?? '', entry.summary, ...entry.details, ...entry.tags].join(' '),
    );
    // Expand each original document, so aliases work in both directions without
    // chaining unrelated synonym groups through previously expanded terms.
    const aliases = groups.filter((group) => group.some((term) => text.includes(term))).flat();
    return { entry, text: [text, ...aliases].join(' ') };
  });

  return (query, category) => {
    const terms = normalizeSearch(query).split(' ').filter(Boolean);
    return index
      .filter(
        ({ entry, text }) =>
          (!category || entry.category === category) && terms.every((term) => text.includes(term)),
      )
      .map(({ entry }) => entry);
  };
}
