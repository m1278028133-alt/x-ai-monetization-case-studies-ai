import dotenv from "dotenv";
import { z } from "zod";
import type { AngleKey, ToneKey, TopicKey } from "./types/index.js";

dotenv.config();

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const schema = z.object({
  OPENAI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  OPENAI_MODEL: z.preprocess(emptyToUndefined, z.string().default("gpt-4.1-mini")),
  EMBEDDING_MODEL: z.preprocess(emptyToUndefined, z.string().default("text-embedding-3-small")),
  X_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  X_API_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  X_ACCESS_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  X_ACCESS_TOKEN_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  X_USER_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  GITHUB_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  GITHUB_REPOSITORY: z.preprocess(emptyToUndefined, z.string().optional()),
  GITHUB_NOTIFY_HANDLE: z.preprocess(emptyToUndefined, z.string().optional()),
  NOTIFICATION_EMAIL: z.preprocess(emptyToUndefined, z.string().default("1278028133@qq.com")),
  WEBSITE_URL: z.preprocess(emptyToUndefined, z.string().optional()),
  X_PROFILE_URL: z.preprocess(emptyToUndefined, z.string().optional()),
  DATABASE_URL: z.preprocess(emptyToUndefined, z.string().default("file:./data/bot.db")),
  DATABASE_AUTH_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  BOT_TIMEZONE: z.preprocess(emptyToUndefined, z.string().default("America/New_York")),
  POST_WINDOW_START_HOUR: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(0).max(23).default(8)
  ),
  POST_WINDOW_END_HOUR: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(23).default(21)
  ),
  DAILY_POST_MIN: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(24).default(2)
  ),
  DAILY_POST_MAX: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(24).default(4)
  ),
  MIN_GAP_MINUTES: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(15).max(1440).default(120)
  ),
  MAX_GAP_MINUTES: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(30).max(1440).default(360)
  ),
  RANDOM_JITTER_MINUTES: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(0).max(60).default(5)
  ),
  MAX_RETRY_ATTEMPTS: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(0).max(10).default(3)
  ),
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(20).default(4)
  ),
  DRY_RUN: z.preprocess(emptyToUndefined, z.string().optional().default("false")),
  LANGUAGE_STRATEGY: z.preprocess(emptyToUndefined, z.enum(["en", "zh"]).default("en")),
  ENABLE_SEMANTIC_DEDUP: z.preprocess(emptyToUndefined, z.string().optional().default("true")),
  KEYWORD_SIMILARITY_THRESHOLD: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0).max(1).default(0.72)
  ),
  SEMANTIC_SIMILARITY_THRESHOLD: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0).max(1).default(0.85)
  ),
  LOOKBACK_POST_LIMIT: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(10).max(1000).default(150)
  ),
  CONTENT_HARD_BLOCK_TERMS: z
    .string()
    .default("guaranteed income,passive income overnight,DM me for access,100% win"),
  TOPIC_WEIGHTS: z.preprocess(
    emptyToUndefined,
    z
      .string()
    .default(
      "ai_monetization_case_studies:30,ai_tools_and_workflows:25,ai_startup_ideas:20,ai_industry_insights:15,ai_prompts_and_productivity:10"
    )
  ),
  TONE_POOL: z.preprocess(
    emptyToUndefined,
    z.string().default("operator,analyst,founder,builder,educator")
  ),
  ANGLE_POOL: z.preprocess(
    emptyToUndefined,
    z
      .string()
    .default(
      "framework,case_study,contrarian,step_by_step,breakdown,prediction,mistake,prompt,comparison,playbook"
    )
  )
});

const env = schema.parse(process.env);

function parseWeightedTopics(input: string): Record<TopicKey, number> {
  const entries = input.split(",").map((segment) => segment.trim());
  const result = {
    ai_monetization_case_studies: 0,
    ai_tools_and_workflows: 0,
    ai_startup_ideas: 0,
    ai_industry_insights: 0,
    ai_prompts_and_productivity: 0
  } satisfies Record<TopicKey, number>;

  for (const entry of entries) {
    const [key, rawWeight] = entry.split(":");
    if (!key || !rawWeight) {
      continue;
    }
    if (key in result) {
      result[key as TopicKey] = Number(rawWeight);
    }
  }
  return result;
}

function parseList<T extends string>(input: string): T[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean) as T[];
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }
  return fallback;
}

export const config = {
  ...env,
  DRY_RUN: parseBoolean(process.env.DRY_RUN, parseBoolean(env.DRY_RUN, false)),
  ENABLE_SEMANTIC_DEDUP: parseBoolean(
    process.env.ENABLE_SEMANTIC_DEDUP,
    parseBoolean(env.ENABLE_SEMANTIC_DEDUP, true)
  ),
  topicWeights: parseWeightedTopics(env.TOPIC_WEIGHTS),
  tonePool: parseList<ToneKey>(env.TONE_POOL),
  anglePool: parseList<AngleKey>(env.ANGLE_POOL),
  hardBlockTerms: env.CONTENT_HARD_BLOCK_TERMS.split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
};

export type AppConfig = typeof config;

export function validateRuntimeConfig(): void {
  if (config.POST_WINDOW_START_HOUR >= config.POST_WINDOW_END_HOUR) {
    throw new Error("POST_WINDOW_START_HOUR must be earlier than POST_WINDOW_END_HOUR.");
  }

  if (config.DAILY_POST_MIN > config.DAILY_POST_MAX) {
    throw new Error("DAILY_POST_MIN cannot be greater than DAILY_POST_MAX.");
  }

  if (config.MIN_GAP_MINUTES > config.MAX_GAP_MINUTES) {
    throw new Error("MIN_GAP_MINUTES cannot be greater than MAX_GAP_MINUTES.");
  }
}

export function assertOpenAIConfig(): void {
  if (!config.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for AI generation or semantic deduplication.");
  }
}

export function assertXPostingConfig(): void {
  const required = [
    "X_API_KEY",
    "X_API_SECRET",
    "X_ACCESS_TOKEN",
    "X_ACCESS_TOKEN_SECRET"
  ] as const;

  const missing = required.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing X posting credentials: ${missing.join(", ")}`);
  }
}

export function assertGithubIssueConfig(): void {
  const missing = [];
  if (!config.GITHUB_TOKEN) {
    missing.push("GITHUB_TOKEN");
  }
  if (!config.GITHUB_REPOSITORY) {
    missing.push("GITHUB_REPOSITORY");
  }
  if (missing.length > 0) {
    throw new Error(`Missing GitHub Issue notification configuration: ${missing.join(", ")}`);
  }
}
