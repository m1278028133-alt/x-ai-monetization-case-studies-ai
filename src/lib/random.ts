export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty array.");
  }
  return items[randomInt(0, items.length - 1)];
}

export function shuffle<T>(items: T[]): T[] {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

export function weightedPick<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, weight]) => sum + Math.max(weight, 0), 0);
  if (total <= 0) {
    return entries[0][0];
  }

  let cursor = Math.random() * total;
  for (const [key, weight] of entries) {
    cursor -= Math.max(weight, 0);
    if (cursor <= 0) {
      return key;
    }
  }

  return entries[entries.length - 1][0];
}
