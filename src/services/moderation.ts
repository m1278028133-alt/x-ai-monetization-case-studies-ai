import { config } from "../config.js";
import type { ModerationResult } from "../types/index.js";

const softWarnings = [
  "guaranteed",
  "overnight",
  "instant",
  "passive income",
  "dm me",
  "follow for more",
  "viral thread"
];

export function moderateTweet(text: string): ModerationResult {
  const reasons: string[] = [];
  const lowered = text.toLowerCase();

  for (const term of config.hardBlockTerms) {
    if (lowered.includes(term)) {
      reasons.push(`Hard-blocked phrase detected: ${term}`);
    }
  }

  for (const warning of softWarnings) {
    if (lowered.includes(warning)) {
      reasons.push(`Soft warning phrase detected: ${warning}`);
    }
  }

  if ((text.match(/https?:\/\//g) ?? []).length > 1) {
    reasons.push("Too many links.");
  }

  if ((text.match(/\n/g) ?? []).length > 4) {
    reasons.push("Formatting looks too spammy.");
  }

  const sanitizedText = text.replace(/\s+/g, " ").trim();
  return {
    approved: reasons.length === 0,
    reasons,
    sanitizedText
  };
}
