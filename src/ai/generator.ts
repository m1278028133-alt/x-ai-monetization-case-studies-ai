import { getOpenAI } from "./openai.js";
import { config } from "../config.js";
import { tweetTemplates } from "../content/templates.js";
import { defaultStyleProfile, topics } from "../content/topics.js";
import { pickRandom } from "../lib/random.js";
import { truncateTweet } from "../lib/text.js";
import type { AngleKey, GeneratedTweet, ToneKey, TopicKey } from "../types/index.js";

function selectTemplate(topic: TopicKey, tone: ToneKey, angle: AngleKey) {
  const candidates = tweetTemplates.filter(
    (template) =>
      (template.topic === "any" || template.topic === topic) &&
      template.tone === tone &&
      template.angle === angle
  );

  if (candidates.length > 0) {
    return pickRandom(candidates);
  }

  const fallback = tweetTemplates.filter(
    (template) => template.topic === "any" || template.topic === topic
  );
  return pickRandom(fallback);
}

export async function generateTweet(params: {
  topic: TopicKey;
  tone: ToneKey;
  angle: AngleKey;
  recentTweets: string[];
}): Promise<GeneratedTweet> {
  const topic = topics.find((item) => item.key === params.topic);
  if (!topic) {
    throw new Error(`Unknown topic: ${params.topic}`);
  }

  const template = selectTemplate(params.topic, params.tone, params.angle);
  const seedIdea = pickRandom(topic.seedIdeas);
  const client = getOpenAI();

  const prompt = [
    "You are writing a single X post in natural, native English for a Western audience.",
    defaultStyleProfile.voice,
    `Audience: ${defaultStyleProfile.audience}`,
    "Growth objective: help a brand-new X account earn attention, profile clicks, saves, replies, and follows through high-signal writing.",
    "Conversion rule: do not include a website link inside the tweet unless absolutely necessary; assume the account's website is already placed in the X profile.",
    `Topic: ${topic.label}`,
    `Topic description: ${topic.description}`,
    `Seed idea: ${seedIdea}`,
    `Tone: ${params.tone}`,
    `Angle: ${params.angle}`,
    `Template instruction: ${template.prompt}`,
    "Hard constraints:",
    "- Output exactly one tweet in English only.",
    "- Keep it under 260 characters.",
    "- Optimize for strong first-line hook and clarity on mobile.",
    "- Prefer one sharp idea over broad coverage.",
    "- Make people want to click the profile for more.",
    "- Do not make it promotional.",
    "- Do not mention your own product, API, pricing, or website.",
    "- You may suggest 1-3 relevant hashtags separately, but keep the main tweet clean.",
    "- No emojis.",
    "- No bullet list formatting that looks robotic.",
    "- Avoid hype, income promises, and vague marketing language.",
    "- Avoid sounding like a sales page or newsletter teaser.",
    "- Make it feel distinct from recent posts.",
    `Avoid these phrases: ${defaultStyleProfile.bannedPhrases.join(", ")}`,
    `Recent tweets to avoid sounding similar to:\n${params.recentTweets.slice(0, 8).join("\n") || "None"}`,
    'Return strict JSON with keys: "text", "hook", "notes", "hashtags", "imageIdea".'
  ].join("\n");

  const response = await client.responses.create({
    model: config.OPENAI_MODEL,
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "tweet_generation",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["text", "hook", "notes", "hashtags", "imageIdea"],
          properties: {
            text: { type: "string" },
            hook: { type: "string" },
            notes: { type: "string" },
            hashtags: {
              type: "array",
              items: { type: "string" }
            },
            imageIdea: { type: "string" }
          }
        }
      }
    }
  });

  const raw = response.output_text;
  const parsed = JSON.parse(raw) as {
    text: string;
    hook: string;
    notes: string;
    hashtags: string[];
    imageIdea: string;
  };
  const text = truncateTweet(parsed.text.replace(/\s+/g, " ").trim(), 260);

  return {
    topic: params.topic,
    tone: params.tone,
    angle: params.angle,
    text,
    hook: parsed.hook.trim(),
    metadata: {
      templateId: template.id,
      seedIdea,
      notes: parsed.notes.trim(),
      hashtags: (parsed.hashtags ?? []).slice(0, 3).map((tag) => tag.trim()).filter(Boolean),
      imageIdea: parsed.imageIdea.trim()
    }
  };
}
