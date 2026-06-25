import { assertPushplusConfig, config } from "../config.js";
import type { NotificationPayload, PostResult } from "../types/index.js";

export async function sendWechatNotification(payload: NotificationPayload): Promise<PostResult> {
  if (config.DRY_RUN) {
    return {
      success: true,
      providerPostId: `pushplus-dry-run-${Date.now()}`
    };
  }

  assertPushplusConfig();

  const response = await fetch("https://www.pushplus.plus/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      token: config.PUSHPLUS_TOKEN,
      title: payload.title,
      content: payload.content,
      template: "html",
      url: payload.url
    })
  });

  if (!response.ok) {
    return {
      success: false,
      error: `PushPlus ${response.status}: ${await response.text()}`,
      retryable: response.status >= 500 || response.status === 429
    };
  }

  return {
    success: true,
    providerPostId: `pushplus-${Date.now()}`
  };
}
