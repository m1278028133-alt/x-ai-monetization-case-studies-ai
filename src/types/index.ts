export type TopicKey =
  | "ai_monetization_case_studies"
  | "ai_tools_and_workflows"
  | "ai_startup_ideas"
  | "ai_industry_insights"
  | "ai_prompts_and_productivity";

export type ToneKey =
  | "operator"
  | "analyst"
  | "founder"
  | "builder"
  | "educator";

export type AngleKey =
  | "framework"
  | "case_study"
  | "contrarian"
  | "step_by_step"
  | "breakdown"
  | "prediction"
  | "mistake"
  | "prompt"
  | "comparison"
  | "playbook";

export type PlanStatus = "planned" | "notified" | "posted" | "skipped" | "failed";
export type TweetStatus = "draft" | "approved" | "rejected" | "posted" | "failed";

export interface TopicDefinition {
  key: TopicKey;
  label: string;
  description: string;
  seedIdeas: string[];
}

export interface StyleProfile {
  voice: string;
  bannedPhrases: string[];
  audience: string;
  language: "en" | "zh";
}

export interface GeneratedTweet {
  topic: TopicKey;
  tone: ToneKey;
  angle: AngleKey;
  text: string;
  hook: string;
  metadata: Record<string, unknown>;
}

export interface SimilarityResult {
  keywordScore: number;
  semanticScore: number;
  isTooSimilar: boolean;
  matchedTweetId?: string;
}

export interface ScheduleSlot {
  planDate: string;
  scheduledAt: string;
  topic: TopicKey;
  status: PlanStatus;
  tweetId?: string;
  attemptCount: number;
}

export interface ModerationResult {
  approved: boolean;
  reasons: string[];
  sanitizedText: string;
}

export interface PostResult {
  success: boolean;
  providerPostId?: string;
  error?: string;
  retryable?: boolean;
}

export interface NotificationPayload {
  title: string;
  content: string;
  url?: string;
}
