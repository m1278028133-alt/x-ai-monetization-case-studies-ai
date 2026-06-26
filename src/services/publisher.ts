import { createGithubIssueNotification } from "../clients/github-issue-client.js";
import { config } from "../config.js";
import {
  logRun,
  updateScheduleSlot,
  type StoredScheduleSlot
} from "../db/repository.js";
import { ensureCircuitClosed, registerFailure, registerSuccess } from "./circuit-breaker.js";
import { createApprovedTweetForTopic } from "./content-pipeline.js";
import { buildXIntentUrl } from "../lib/x-intent.js";

async function retryNotify(title: string, content: string, url: string | undefined, maxAttempts: number) {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await createGithubIssueNotification({ title, content, url });
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

export async function publishSlot(slot: StoredScheduleSlot, maxAttempts: number): Promise<void> {
  await ensureCircuitClosed();
  const tweet = await createApprovedTweetForTopic(slot.topic);
  const intentUrl = buildXIntentUrl(tweet.text);
  const hashtags = Array.isArray(tweet.metadata.hashtags)
    ? (tweet.metadata.hashtags as string[]).join(" ")
    : "";
  const imageIdea =
    typeof tweet.metadata.imageIdea === "string"
      ? tweet.metadata.imageIdea
      : "Use a clean, high-contrast visual that reinforces the main insight.";
  const websiteLine = config.WEBSITE_URL
    ? `\n\n主页链接目标：${config.WEBSITE_URL}`
    : "";
  const xProfileLine = config.X_PROFILE_URL
    ? `\nX 主页：${config.X_PROFILE_URL}`
    : "";
  const notificationMarkdown = [
    "## 可以发到 X 了",
    "下面这段推文保持英文，直接复制到 X 发布即可。",
    "### 英文推文",
    "```text",
    tweet.text,
    "```",
    hashtags ? `### 建议 hashtags\n${hashtags}` : "",
    `### 配图建议\n${imageIdea}`,
    `### 为什么适合新号\n${tweet.hook || "Strong hook + practical insight + low-friction profile click potential."}`,
    websiteLine,
    xProfileLine,
    "### 操作步骤",
    "1. 复制上面的英文推文",
    "2. 如果字数还够，可以加上 hashtags",
    "3. 按配图建议做一张图或截图",
    "4. 打开 X 发布器并发布"
  ].filter(Boolean).join("\n\n");

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
    executionNote: `GitHub Issue notification created: ${result.providerPostId}`
  });
  await registerSuccess();
  await logRun("notify", "success", "GitHub Issue notification created.", {
    slotId: slot.id,
    tweetId: tweet.id,
    providerPostId: result.providerPostId,
    intentUrl
  });
}
