import { createGithubIssueNotification } from "../clients/github-issue-client.js";
import { sendSmtpNotification } from "../clients/smtp-client.js";
import { buildXIntentUrl } from "../lib/x-intent.js";

export async function sendTestNotification(): Promise<{
  success: boolean;
  message: string;
}> {
  const intentUrl = buildXIntentUrl(
    "Testing the GitHub Issue notification link for the X Growth Assistant."
  );

  const payload = {
    title: "X 通知测试：请确认是否收到邮件",
    content: [
      "## 通知测试",
      "如果你看到了这条 Issue，并且 QQ 邮箱也收到了直发邮件，说明通知链路已经正常。",
      "下面的示例推文保持英文，正式通知也会这样显示。",
      "### 英文推文示例",
      "```text",
      "Testing the notification flow before the next scheduled post.",
      "```",
      "### hashtags 示例",
      "#AI #Productivity",
      "### 配图建议示例",
      "A clean card with one short AI takeaway.",
      "### 打开 X 发布器示例",
      intentUrl
    ].join("\n\n")
  };
  const githubResult = await createGithubIssueNotification(payload, { forceLive: true });
  if (!githubResult.success) {
    return {
      success: false,
      message: githubResult.error ?? "Test GitHub Issue notification failed."
    };
  }

  const smtpResult = await sendSmtpNotification(payload, { forceLive: true });
  if (!smtpResult.success) {
    return {
      success: false,
      message: smtpResult.error ?? "Test SMTP notification failed."
    };
  }

  return {
    success: true,
    message: `Test GitHub Issue created and SMTP email sent: ${githubResult.providerPostId}`
  };
}
