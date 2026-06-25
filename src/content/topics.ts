import type { StyleProfile, TopicDefinition } from "../types/index.js";

export const topics: TopicDefinition[] = [
  {
    key: "ai_monetization_case_studies",
    label: "AI Monetization Case Studies",
    description: "Break down real business models, pricing lessons, and GTM patterns from AI businesses.",
    seedIdeas: [
      "micro-SaaS built on top of AI transcription",
      "agency packaging AI research workflows",
      "niche B2B copilots with usage-based pricing",
      "creator products built from internal prompt systems",
      "AI-enabled data cleanup as a service"
    ]
  },
  {
    key: "ai_tools_and_workflows",
    label: "AI Tools and Workflows",
    description: "Explain practical stacks, automations, and operating workflows that save time or increase output.",
    seedIdeas: [
      "lead research workflow using scraping plus summarization",
      "content repurposing pipeline from long-form to short posts",
      "customer support triage with AI classification",
      "internal wiki search with retrieval",
      "proposal drafting workflow with human approval"
    ]
  },
  {
    key: "ai_startup_ideas",
    label: "AI Startup Ideas",
    description: "Share grounded startup concepts with a clear buyer, pain point, and wedge.",
    seedIdeas: [
      "AI QA assistant for sales call review",
      "AI compliance draft checker for SMBs",
      "AI meeting prep engine for account managers",
      "AI workflow layer for recruiters",
      "AI operations tool for local service businesses"
    ]
  },
  {
    key: "ai_industry_insights",
    label: "AI Industry Insights",
    description: "Offer high-signal observations about product, distribution, moats, and model economics.",
    seedIdeas: [
      "how distribution beats raw model quality",
      "why memory matters for retention",
      "what enterprise buyers actually pay for",
      "where agent UX still breaks down",
      "why many AI features should stay narrow"
    ]
  },
  {
    key: "ai_prompts_and_productivity",
    label: "AI Prompts and Productivity",
    description: "Share useful prompts, framing tricks, and execution tips for knowledge workers and builders.",
    seedIdeas: [
      "prompt for extracting decisions from meeting notes",
      "prompt for finding hidden assumptions in plans",
      "prompt for rewriting landing page copy",
      "prompt for turning loose notes into SOPs",
      "prompt for comparing tools on real constraints"
    ]
  }
];

export const defaultStyleProfile: StyleProfile = {
  voice:
    "Write like a sharp English-speaking operator on X: concise, native, practical, credible, slightly opinionated, scroll-stopping, and never hypey.",
  bannedPhrases: [
    "unlock the power of",
    "revolutionary",
    "game changer",
    "guaranteed money",
    "get rich quick",
    "DM me",
    "100% automated income"
  ],
  audience:
    "US and European founders, operators, indie hackers, consultants, and AI-curious professionals who value signal over hype.",
  language: "en"
};
