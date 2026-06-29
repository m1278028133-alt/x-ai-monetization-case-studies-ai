import { getOpenAI } from "./openai.js";
import { config } from "../config.js";
import { tweetTemplates } from "../content/templates.js";
import { defaultStyleProfile, topics } from "../content/topics.js";
import { pickRandom } from "../lib/random.js";
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
    "You are writing X content in natural, native English for a Western audience.",
    defaultStyleProfile.voice,
    `Audience: ${defaultStyleProfile.audience}`,
    "Growth objective: help a brand-new X account earn attention, profile clicks, saves, replies, and follows through high-signal writing.",
    "Content priority: favor AI startup success patterns, AI monetization case studies, productized service ideas, and practical lessons that teach followers how to turn AI workflows into paid offers.",
    "Conversion rule: do not include a website link inside the tweet unless absolutely necessary; assume the account's website is already placed in the X profile.",
    `Topic: ${topic.label}`,
    `Topic description: ${topic.description}`,
    `Seed idea: ${seedIdea}`,
    `Tone: ${params.tone}`,
    `Angle: ${params.angle}`,
    `Template instruction: ${template.prompt}`,
    "Hard constraints:",
    "- Output one complete X post in English only. It may be a short post or a longer post that can become a thread.",
    "- Target 180-650 characters. Do not cut off mid-thought. If the idea needs room, write the full idea.",
    "- Start with a strong first-line hook that creates curiosity, tension, or a useful promise.",
    "- Prefer one sharp idea with concrete detail over broad coverage.",
    "- Make the reader feel they learned a monetization pattern, not just an AI opinion.",
    "- When discussing a success case, use anonymized or clearly hypothetical cases unless the seed explicitly names a real public example. Do not invent company names, revenue, funding, or customer counts.",
    "- Prefer practical monetization details: buyer, painful workflow, paid offer, delivery method, pricing logic, distribution channel, or first validation step.",
    "- It is fine to teach followers how to use AI to make money, but avoid guaranteed outcomes, get-rich language, or unrealistic income claims.",
    "- Make people want to click the profile for more.",
    "- Do not make it promotional.",
    "- Do not mention your own product, API, pricing, or website.",
    "- You may suggest 1-3 relevant hashtags separately, but keep the main tweet clean.",
    "- No emojis.",
    "- Bullet list formatting is allowed only when it improves clarity; keep it human and punchy.",
    "- Avoid hype, income promises, and vague marketing language.",
    "- Avoid sounding like a sales page or newsletter teaser.",
    "- Make it feel distinct from recent posts.",
    "- Include a practical detail, contrast, number, example, or decision rule whenever possible.",
    "- Decide whether the post benefits from an image. Use imageNeeded=false when text-only is stronger.",
    "- If imageNeeded=true, write a specific image prompt that can be pasted into an image generator.",
    "- If imageNeeded=false, keep imageIdea short and explain that no image is needed.",
    `Avoid these phrases: ${defaultStyleProfile.bannedPhrases.join(", ")}`,
    `Recent tweets to avoid sounding similar to:\n${params.recentTweets.slice(0, 8).join("\n") || "None"}`,
    'Return strict JSON with keys: "text", "hook", "notes", "hashtags", "imageNeeded", "imageIdea".'
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
          required: ["text", "hook", "notes", "hashtags", "imageNeeded", "imageIdea"],
          properties: {
            text: { type: "string" },
            hook: { type: "string" },
            notes: { type: "string" },
            hashtags: {
              type: "array",
              items: { type: "string" }
            },
            imageNeeded: { type: "boolean" },
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
    imageNeeded: boolean;
    imageIdea: string;
  };
  const text = parsed.text.replace(/\s+/g, " ").trim();

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
      imageNeeded: parsed.imageNeeded,
      imageIdea: parsed.imageIdea.trim()
    }
  };
}
