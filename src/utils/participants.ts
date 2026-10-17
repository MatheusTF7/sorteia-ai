export function playerKey(name: string): string {
  return name.trim().normalize('NFC').replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR');
}

export function uniquePlayerNames(names: string[]): string[] {
  const seen = new Set<string>();
  return names
    .map((name) => name.trim())
    .filter((name) => {
      const key = playerKey(name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function initialParticipantListId(lists: { id: string; isDefault: boolean }[]): string {
  return (lists.length === 1 ? lists[0]?.id : lists.find((list) => list.isDefault)?.id) ?? '';
}
