import { assertGithubIssueConfig, config } from "../config.js";
import type { NotificationPayload, PostResult } from "../types/index.js";

function splitRepository(repository: string): { owner: string; repo: string } {
  const [owner, repo] = repository.split("/");
  if (!owner || !repo) {
    throw new Error("GITHUB_REPOSITORY must use the owner/repo format.");
  }
  return { owner, repo };
}

function buildIssueBody(payload: NotificationPayload): string {
  const reminderTarget = config.NOTIFICATION_EMAIL
    ? `\n\nReminder target: ${config.NOTIFICATION_EMAIL}`
    : "";
  const actionLink = payload.url ? `\n\nOpen X composer: ${payload.url}` : "";

  return `${payload.content}${actionLink}${reminderTarget}`;
}

export async function createGithubIssueNotification(
  payload: NotificationPayload,
  options: { forceLive?: boolean } = {}
): Promise<PostResult> {
  if (config.DRY_RUN && !options.forceLive) {
    return {
      success: true,
      providerPostId: `github-issue-dry-run-${Date.now()}`
    };
  }

  assertGithubIssueConfig();
  const repository = config.GITHUB_REPOSITORY;
  const token = config.GITHUB_TOKEN;
  if (!repository || !token) {
    throw new Error("Missing GitHub Issue notification configuration.");
  }

  const { owner, repo } = splitRepository(repository);
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "x-growth-assistant"
    },
    body: JSON.stringify({
      title: payload.title,
      body: buildIssueBody(payload)
    })
  });

  const responseText = await response.text();

  if (!response.ok) {
    return {
      success: false,
      error: `GitHub Issue ${response.status}: ${responseText}`,
      retryable: response.status === 429 || response.status >= 500
    };
  }

  let body: { html_url?: string; number?: number } | null = null;
  try {
    body = JSON.parse(responseText) as { html_url?: string; number?: number };
  } catch {
    body = null;
  }

  return {
    success: true,
    providerPostId: body?.html_url ?? `github-issue-${body?.number ?? Date.now()}`
  };
}
