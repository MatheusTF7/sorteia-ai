/** Fisher–Yates; always returns a new array. */
export function shuffleItems<T>(items: T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    const item = result[index];
    const otherItem = result[other];
    if (item !== undefined && otherItem !== undefined) {
      result[index] = otherItem;
      result[other] = item;
    }
  }
  return result;
}
