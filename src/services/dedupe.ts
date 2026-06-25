import { config } from "../config.js";
import { createEmbedding } from "../ai/embeddings.js";
import { extractKeywords, jaccardSimilarity, normalizeText } from "../lib/text.js";
import type { SimilarityResult } from "../types/index.js";
import type { StoredTweet } from "../db/repository.js";

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    aMag += a[index] ** 2;
    bMag += b[index] ** 2;
  }

  if (aMag === 0 || bMag === 0) {
    return 0;
  }

  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
}

export async function evaluateSimilarity(
  candidate: string,
  recentTweets: StoredTweet[]
): Promise<SimilarityResult> {
  const normalizedCandidate = normalizeText(candidate);
  const candidateKeywords = extractKeywords(candidate);

  let bestKeywordScore = 0;
  let bestSemanticScore = 0;
  let matchedTweetId: string | undefined;

  const candidateEmbedding =
    config.ENABLE_SEMANTIC_DEDUP && config.OPENAI_API_KEY
      ? await createEmbedding(normalizedCandidate)
      : null;

  for (const tweet of recentTweets) {
    const keywordScore = jaccardSimilarity(candidateKeywords, tweet.keywordVector);
    const semanticScore =
      candidateEmbedding && tweet.embedding
        ? cosineSimilarity(candidateEmbedding, tweet.embedding)
        : 0;

    if (keywordScore > bestKeywordScore || semanticScore > bestSemanticScore) {
      bestKeywordScore = Math.max(bestKeywordScore, keywordScore);
      bestSemanticScore = Math.max(bestSemanticScore, semanticScore);
      matchedTweetId = tweet.id;
    }
  }

  const isTooSimilar =
    bestKeywordScore >= config.KEYWORD_SIMILARITY_THRESHOLD ||
    bestSemanticScore >= config.SEMANTIC_SIMILARITY_THRESHOLD;

  return {
    keywordScore: bestKeywordScore,
    semanticScore: bestSemanticScore,
    isTooSimilar,
    matchedTweetId
  };
}

export async function enrichForStorage(text: string): Promise<{
  normalizedText: string;
  keywordVector: string[];
  embedding: number[] | null;
}> {
  const normalizedText = normalizeText(text);
  const keywordVector = extractKeywords(text);
  const embedding =
    config.ENABLE_SEMANTIC_DEDUP && config.OPENAI_API_KEY
      ? await createEmbedding(normalizedText)
      : null;

  return {
    normalizedText,
    keywordVector,
    embedding
  };
}
