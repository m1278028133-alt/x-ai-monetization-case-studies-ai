const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "i",
  "if",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "with",
  "you",
  "your"
]);

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractKeywords(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((token) => token && !stopWords.has(token) && token.length > 2);
}

export function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) {
    return 0;
  }
  const aSet = new Set(a);
  const bSet = new Set(b);
  let intersection = 0;
  for (const item of aSet) {
    if (bSet.has(item)) {
      intersection += 1;
    }
  }
  const union = new Set([...aSet, ...bSet]).size;
  return union === 0 ? 0 : intersection / union;
}

export function splitForXThread(text: string, limit = 275): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [];
  }

  const words = normalized.split(" ");
  const parts: string[] = [];
  let current = "";

  for (const word of words) {
    if (word.length > limit) {
      if (current) {
        parts.push(current);
        current = "";
      }
      for (let index = 0; index < word.length; index += limit) {
        parts.push(word.slice(index, index + limit));
      }
      continue;
    }

    const next = current ? `${current} ${word}` : word;
    if (next.length <= limit) {
      current = next;
      continue;
    }

    if (current) {
      parts.push(current);
    }
    current = word;
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

export function truncateTweet(text: string, limit = 280): string {
  return splitForXThread(text, limit)[0] ?? "";
}
