import { createGithubIssueNotification } from "../clients/github-issue-client.js";
import { buildXIntentUrl } from "../lib/x-intent.js";

export async function sendTestNotification(): Promise<{
  success: boolean;
  message: string;
}> {
  const intentUrl = buildXIntentUrl(
    "Testing the GitHub Issue notification link for the X Growth Assistant."
  );

  const result = await createGithubIssueNotification({
    title: "X Growth Assistant notification test",
    content: [
      "## Test notification",
      "If this Issue exists and you receive a GitHub email for it, the free notification path is working.",
      "### Sample tweet",
      "```text",
      "Testing the notification flow before the next scheduled post.",
      "```",
      "### Sample hashtags",
      "#AI #Productivity",
      "### Sample image idea",
      "A clean card with one short AI takeaway.",
      "### Open sample X composer",
      intentUrl
    ].join("\n\n")
  }, { forceLive: true });

  return {
    success: result.success,
    message: result.success
      ? `Test GitHub Issue created: ${result.providerPostId}`
      : result.error ?? "Test GitHub Issue notification failed."
  };
}
