import { createGithubIssueNotification } from "../clients/github-issue-client.js";
import { sendSmtpNotification } from "../clients/smtp-client.js";
import { config } from "../config.js";
import {
  logRun,
  updateTweetStatus,
  updateScheduleSlot,
  type StoredScheduleSlot
} from "../db/repository.js";
import { buildXIntentUrl } from "../lib/x-intent.js";
import { weightedPick } from "../lib/random.js";
import { splitForXThread } from "../lib/text.js";
import { ensureCircuitClosed, registerFailure, registerSuccess } from "./circuit-breaker.js";
import { createApprovedTweetForTopic } from "./content-pipeline.js";
import type { StoredTweet } from "../db/repository.js";
import type { NotificationPayload, PostResult } from "../types/index.js";

interface NotificationDeliveryResult extends PostResult {
  githubPostId?: string;
  smtpPostId?: string;
  smtpError?: string;
  smtpSkipped?: boolean;
}

async function retryPostResult(
  send: () => Promise<PostResult>,
  maxAttempts: number,
): Promise<PostResult> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await send();
    if (result.success) {
      return result;
    }

    lastError = result.error;
    if (!result.retryable) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }

  return {
    success: false,
    error: lastError ?? "Unknown notification failure."
  };
}

function isSmtpConfigured(): boolean {
  return Boolean(config.SMTP_USER && config.SMTP_PASS && (config.SMTP_TO || config.NOTIFICATION_EMAIL));
}

function describeDeliveryResult(result: NotificationDeliveryResult): string {
  const parts = [`GitHub Issue notification created: ${result.githubPostId ?? result.providerPostId}`];
  if (result.smtpPostId) {
    parts.push(`SMTP email sent: ${result.smtpPostId}`);
  } else if (result.smtpSkipped) {
    parts.push("SMTP email skipped because SMTP credentials are not configured.");
  } else if (result.smtpError) {
    parts.push(`SMTP email failed: ${result.smtpError}`);
  }
  return parts.join(" | ");
}

async function retryNotify(
  title: string,
  content: string,
  url: string | undefined,
  maxAttempts: number,
  options: { forceLive?: boolean; requireSmtp?: boolean } = {}
): Promise<NotificationDeliveryResult> {
  const payload: NotificationPayload = { title, content, url };
  const githubResult = await retryPostResult(
    () => createGithubIssueNotification(payload, options),
    maxAttempts
  );

  if (!githubResult.success) {
    return githubResult;
  }

  const shouldSendSmtp = options.requireSmtp || isSmtpConfigured() || (config.DRY_RUN && !options.forceLive);
  if (!shouldSendSmtp) {
    return {
      ...githubResult,
      githubPostId: githubResult.providerPostId,
      smtpSkipped: true
    };
  }

  const smtpResult = await retryPostResult(() => sendSmtpNotification(payload, options), maxAttempts);
  if (!smtpResult.success && options.requireSmtp) {
    return {
      success: false,
      providerPostId: githubResult.providerPostId,
      githubPostId: githubResult.providerPostId,
      smtpError: smtpResult.error,
      error: smtpResult.error ?? "SMTP notification failed.",
      retryable: smtpResult.retryable
    };
  }

  return {
    ...githubResult,
    githubPostId: githubResult.providerPostId,
    smtpPostId: smtpResult.success ? smtpResult.providerPostId : undefined,
    smtpError: smtpResult.success ? undefined : smtpResult.error
  };
}

function getStringMetadata(tweet: StoredTweet, key: string): string {
  const value = tweet.metadata[key];
  return typeof value === "string" ? value.trim() : "";
}

function getStringArrayMetadata(tweet: StoredTweet, key: string): string[] {
  const value = tweet.metadata[key];
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function getBooleanMetadata(tweet: StoredTweet, key: string): boolean | undefined {
  const value = tweet.metadata[key];
  return typeof value === "boolean" ? value : undefined;
}

function buildThreadMarkdown(parts: string[]): string {
  const mainPost = parts[0] ?? "";
  const replies = parts.slice(1);
  const replySection = replies.length > 0
    ? [
        "### 发完正文后，在自己评论区继续回复",
        ...replies.flatMap((reply, index) => [
          `回复 ${index + 1}`,
          "```text",
          reply,
          "```"
        ])
      ].join("\n\n")
    : "### 发完正文后，在自己评论区继续回复\n\n这条不用继续回复，发主贴即可。";

  return [
    "### 主贴正文",
    "```text",
    mainPost,
    "```",
    replySection
  ].join("\n\n");
}

function buildImageSection(tweet: StoredTweet): string {
  const imageNeeded = getBooleanMetadata(tweet, "imageNeeded");
  const imageIdea = getStringMetadata(tweet, "imageIdea");

  if (imageNeeded === false) {
    return "### 配图\n\n这条不需要配图，直接发文字更干净。";
  }

  if (!imageIdea) {
    return "### 配图\n\n这条不需要配图，直接发文字即可。";
  }

  return [
    "### 配图",
    "当前机器人还不能自动把生成图片附件发进邮件，所以先给你配图提示词。需要配图时，把下面这段交给 GPT 图片工具生成：",
    "```text",
    imageIdea,
    "```"
  ].join("\n\n");
}

function buildTweetNotificationMarkdown(tweet: StoredTweet): string {
  const parts = splitForXThread(tweet.text, 275);
  const hashtags = getStringArrayMetadata(tweet, "hashtags");
  const websiteLine = config.WEBSITE_URL ? `主页链接目标：${config.WEBSITE_URL}` : "";
  const xProfileLine = config.X_PROFILE_URL ? `X 主页：${config.X_PROFILE_URL}` : "";
  const notes = getStringMetadata(tweet, "notes");

  return [
    "## 可以发到 X 了",
    "下面是完整推文。主贴先发，如果有回复段，就发完正文后在自己评论区继续回复自己。",
    buildThreadMarkdown(parts),
    hashtags.length > 0 ? `### 建议 hashtags\n\n${hashtags.join(" ")}` : "",
    buildImageSection(tweet),
    `### 为什么适合新号\n\n${tweet.hook || notes || "Strong hook, practical insight, and clear profile-click potential."}`,
    websiteLine || xProfileLine ? ["### 账号信息", websiteLine, xProfileLine].filter(Boolean).join("\n\n") : "",
    "### 操作步骤\n\n1. 点下面的 X 发布器打开主贴\n2. 发布主贴正文\n3. 如果上面有回复段，回到自己这条推文下面逐条回复\n4. 如果有配图提示词，先生成配图再发；如果写着不需要配图，就直接发文字"
  ].filter(Boolean).join("\n\n");
}

function buildTweetIntentUrl(tweet: StoredTweet): string {
  const mainPost = splitForXThread(tweet.text, 275)[0] ?? tweet.text;
  return buildXIntentUrl(mainPost);
}

export async function publishSlot(slot: StoredScheduleSlot, maxAttempts: number): Promise<void> {
  await ensureCircuitClosed();
  const tweet = await createApprovedTweetForTopic(slot.topic);
  const intentUrl = buildTweetIntentUrl(tweet);
  const notificationMarkdown = buildTweetNotificationMarkdown(tweet);

  await updateScheduleSlot(slot.id, {
    tweetId: tweet.id,
    attemptCount: slot.attemptCount + 1
  });

  const result = await retryNotify(
    `X 推文待发布：${slot.topic}`,
    notificationMarkdown,
    intentUrl,
    maxAttempts
  );
  if (!result.success) {
    await updateScheduleSlot(slot.id, {
      status: "failed",
      executionNote: result.error ?? "Unknown GitHub Issue notification failure"
    });
    await registerFailure(result.error ?? "Unknown notification failure");
    await logRun("notify", "failed", "Failed to create GitHub Issue notification.", {
      slotId: slot.id,
      tweetId: tweet.id,
      error: result.error
    });
    throw new Error(result.error ?? "Unknown notification failure.");
  }

  await updateScheduleSlot(slot.id, {
    status: "notified",
    executionNote: describeDeliveryResult(result)
  });
  await registerSuccess();
  await logRun("notify", "success", "Notification delivery completed.", {
    slotId: slot.id,
    tweetId: tweet.id,
    providerPostId: result.githubPostId ?? result.providerPostId,
    smtpPostId: result.smtpPostId,
    smtpError: result.smtpError,
    smtpSkipped: result.smtpSkipped,
    intentUrl
  });
}

export async function publishSampleTweetNotification(): Promise<void> {
  await ensureCircuitClosed();
  const topic = weightedPick(config.topicWeights);
  const tweet = await createApprovedTweetForTopic(topic);
  const intentUrl = buildTweetIntentUrl(tweet);
  const result = await retryNotify(
    "X 推文待发布：邮箱测试",
    buildTweetNotificationMarkdown(tweet),
    intentUrl,
    Math.max(1, config.MAX_RETRY_ATTEMPTS),
    { forceLive: true, requireSmtp: true }
  );

  if (!result.success) {
    await updateTweetStatus(tweet.id, "failed");
    await registerFailure(result.error ?? "Unknown notification failure");
    await logRun("notify-sample-tweet", "failed", "Failed to create sample tweet Issue.", {
      tweetId: tweet.id,
      topic,
      error: result.error
    });
    throw new Error(result.error ?? "Unknown notification failure.");
  }

  await updateTweetStatus(tweet.id, "approved", result.providerPostId);
  await registerSuccess();
  await logRun("notify-sample-tweet", "success", "Sample tweet notification delivered.", {
    tweetId: tweet.id,
    topic,
    providerPostId: result.githubPostId ?? result.providerPostId,
    smtpPostId: result.smtpPostId,
    intentUrl
  });
}
