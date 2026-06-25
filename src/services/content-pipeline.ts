import { generateTweet } from "../ai/generator.js";
import { config } from "../config.js";
import { generateFreeTweet } from "../content/free-generator.js";
import {
  getRecentTweets,
  insertTweet,
  type StoredTweet
} from "../db/repository.js";
import { pickRandom } from "../lib/random.js";
import { enrichForStorage, evaluateSimilarity } from "./dedupe.js";
import { moderateTweet } from "./moderation.js";
import type { AngleKey, ToneKey, TopicKey } from "../types/index.js";

export async function createApprovedTweetForTopic(topic: TopicKey): Promise<StoredTweet> {
  const recentTweets = await getRecentTweets(config.LOOKBACK_POST_LIMIT);
  const recentTexts = recentTweets.map((tweet) => tweet.text);
  const shouldUseAi = Boolean(config.OPENAI_API_KEY);

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const tone = pickRandom(config.tonePool) as ToneKey;
    const angle = pickRandom(config.anglePool) as AngleKey;

    const generated = shouldUseAi
      ? await generateTweet({
          topic,
          tone,
          angle,
          recentTweets: recentTexts
        })
      : generateFreeTweet({
          topic,
          tone,
          angle,
          recentTweets: recentTexts
        });

    const moderation = moderateTweet(generated.text);
    if (!moderation.approved) {
      continue;
    }

    const similarity = await evaluateSimilarity(moderation.sanitizedText, recentTweets);
    if (similarity.isTooSimilar) {
      continue;
    }

    const enriched = await enrichForStorage(moderation.sanitizedText);
    return insertTweet({
      generated: {
        ...generated,
        text: moderation.sanitizedText,
        metadata: {
          ...generated.metadata,
          similarity
        }
      },
      ...enriched,
      status: "approved"
    });
  }

  throw new Error(`Unable to create a sufficiently distinct tweet for topic ${topic}.`);
}
