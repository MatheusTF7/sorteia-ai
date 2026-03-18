export interface SavedList {
  [key: string]: string | string[] | boolean;
  id: string;
  name: string;
  items: string[];
  createdAt: string;
  isDefault: boolean;
}

export function parseDelimitedEntries(raw: string): string[] {
  return raw
    .split(/[,;.]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function shuffleItems<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target]!, shuffled[index]!];
  }

  return shuffled;
}
