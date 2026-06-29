import type { StyleProfile, TopicDefinition } from "../types/index.js";

export const topics: TopicDefinition[] = [
  {
    key: "ai_monetization_case_studies",
    label: "AI Monetization Case Studies",
    description: "Break down AI businesses, monetization paths, pricing lessons, and practical success patterns followers can learn from.",
    seedIdeas: [
      "micro-SaaS built on top of AI transcription",
      "agency packaging AI research workflows",
      "niche B2B copilots with usage-based pricing",
      "creator products built from internal prompt systems",
      "AI-enabled data cleanup as a service",
      "AI automation agency turning one workflow into a productized monthly retainer",
      "solo founder selling an internal AI workflow as a template pack",
      "consultant using AI audits to land implementation projects",
      "B2B AI tool that starts as a service before becoming software",
      "newsletter creator monetizing AI workflows through paid playbooks"
    ]
  },
  {
    key: "ai_tools_and_workflows",
    label: "AI Tools and Workflows",
    description: "Explain practical stacks, automations, and operating workflows that save time, increase output, or create a paid offer.",
    seedIdeas: [
      "lead research workflow using scraping plus summarization",
      "content repurposing pipeline from long-form to short posts",
      "customer support triage with AI classification",
      "internal wiki search with retrieval",
      "proposal drafting workflow with human approval",
      "AI workflow for turning customer calls into paid implementation ideas",
      "AI-assisted market research package for consultants",
      "workflow that turns messy business data into a sellable dashboard",
      "AI SOP builder for local businesses",
      "automation stack for delivering a recurring service with fewer manual hours"
    ]
  },
  {
    key: "ai_startup_ideas",
    label: "AI Startup Ideas",
    description: "Share grounded AI startup concepts with a clear buyer, pain point, wedge, pricing angle, and first customer path.",
    seedIdeas: [
      "AI QA assistant for sales call review",
      "AI compliance draft checker for SMBs",
      "AI meeting prep engine for account managers",
      "AI workflow layer for recruiters",
      "AI operations tool for local service businesses",
      "AI implementation service for clinics, agencies, or law firms",
      "vertical AI assistant that starts with one painful recurring report",
      "AI-powered due diligence service for small investors",
      "AI onboarding assistant for B2B software companies",
      "paid AI prompt library bundled with consulting calls"
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
    "US and European founders, operators, indie hackers, consultants, creators, and AI-curious professionals who want practical ways to use AI to build, monetize, and grow without hype.",
  language: "en"
};
