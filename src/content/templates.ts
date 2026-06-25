import type { AngleKey, ToneKey, TopicKey } from "../types/index.js";

export interface TweetTemplate {
  id: string;
  topic: TopicKey | "any";
  angle: AngleKey;
  tone: ToneKey;
  prompt: string;
}

export const tweetTemplates: TweetTemplate[] = [
  {
    id: "t01",
    topic: "ai_monetization_case_studies",
    angle: "case_study",
    tone: "analyst",
    prompt: "Write a short case study tweet showing how a niche AI business makes money, including offer, buyer, and why it works."
  },
  {
    id: "t02",
    topic: "ai_monetization_case_studies",
    angle: "breakdown",
    tone: "operator",
    prompt: "Break down an AI business model into acquisition, delivery, retention, and margin in one compact tweet."
  },
  {
    id: "t03",
    topic: "ai_monetization_case_studies",
    angle: "mistake",
    tone: "founder",
    prompt: "Explain a common monetization mistake AI founders make and what a stronger pricing move looks like."
  },
  {
    id: "t04",
    topic: "ai_monetization_case_studies",
    angle: "framework",
    tone: "educator",
    prompt: "Give a simple framework for judging whether an AI product idea can monetize beyond a demo."
  },
  {
    id: "t05",
    topic: "ai_monetization_case_studies",
    angle: "contrarian",
    tone: "builder",
    prompt: "Share a contrarian take on AI monetization that feels grounded, not provocative for its own sake."
  },
  {
    id: "t06",
    topic: "ai_tools_and_workflows",
    angle: "step_by_step",
    tone: "operator",
    prompt: "Describe a practical AI workflow in 3-4 compact steps with a clear business outcome."
  },
  {
    id: "t07",
    topic: "ai_tools_and_workflows",
    angle: "playbook",
    tone: "builder",
    prompt: "Share a workflow playbook for using 2-3 AI tools together without sounding like an ad."
  },
  {
    id: "t08",
    topic: "ai_tools_and_workflows",
    angle: "comparison",
    tone: "analyst",
    prompt: "Compare two AI workflow approaches and explain when each one wins."
  },
  {
    id: "t09",
    topic: "ai_tools_and_workflows",
    angle: "mistake",
    tone: "educator",
    prompt: "Point out a workflow mistake people make when adding AI to a team process."
  },
  {
    id: "t10",
    topic: "ai_tools_and_workflows",
    angle: "framework",
    tone: "founder",
    prompt: "Offer a simple framework for deciding what part of a workflow should be automated with AI."
  },
  {
    id: "t11",
    topic: "ai_startup_ideas",
    angle: "breakdown",
    tone: "founder",
    prompt: "Pitch one realistic AI startup idea with buyer, pain point, wedge, and pricing hint."
  },
  {
    id: "t12",
    topic: "ai_startup_ideas",
    angle: "contrarian",
    tone: "analyst",
    prompt: "Give a grounded contrarian startup idea in AI where boring distribution beats flashy tech."
  },
  {
    id: "t13",
    topic: "ai_startup_ideas",
    angle: "case_study",
    tone: "operator",
    prompt: "Imagine a plausible small AI startup and explain why it could reach revenue with a tiny team."
  },
  {
    id: "t14",
    topic: "ai_startup_ideas",
    angle: "playbook",
    tone: "builder",
    prompt: "Share a mini playbook for validating an AI startup idea before building too much."
  },
  {
    id: "t15",
    topic: "ai_startup_ideas",
    angle: "prediction",
    tone: "educator",
    prompt: "Make a sober prediction about the kind of AI startup likely to work in the next 12 months."
  },
  {
    id: "t16",
    topic: "ai_industry_insights",
    angle: "prediction",
    tone: "analyst",
    prompt: "Share an AI industry prediction tied to product, margins, or buyer behavior."
  },
  {
    id: "t17",
    topic: "ai_industry_insights",
    angle: "contrarian",
    tone: "founder",
    prompt: "Write one contrarian but reasonable industry insight about AI product strategy."
  },
  {
    id: "t18",
    topic: "ai_industry_insights",
    angle: "framework",
    tone: "educator",
    prompt: "Explain a simple framework for evaluating moats in AI products."
  },
  {
    id: "t19",
    topic: "ai_industry_insights",
    angle: "comparison",
    tone: "operator",
    prompt: "Compare two common AI product strategies and explain the tradeoff in one tweet."
  },
  {
    id: "t20",
    topic: "ai_industry_insights",
    angle: "mistake",
    tone: "builder",
    prompt: "Point out a common industry misconception about AI adoption and correct it."
  },
  {
    id: "t21",
    topic: "ai_prompts_and_productivity",
    angle: "prompt",
    tone: "educator",
    prompt: "Share one useful AI prompt pattern plus a brief note on when to use it."
  },
  {
    id: "t22",
    topic: "ai_prompts_and_productivity",
    angle: "step_by_step",
    tone: "operator",
    prompt: "Show how to use a prompt sequence to turn messy inputs into useful output."
  },
  {
    id: "t23",
    topic: "ai_prompts_and_productivity",
    angle: "framework",
    tone: "analyst",
    prompt: "Offer a framework for writing better prompts for work, not demos."
  },
  {
    id: "t24",
    topic: "ai_prompts_and_productivity",
    angle: "comparison",
    tone: "builder",
    prompt: "Compare a weak prompt style with a stronger one in a concise way."
  },
  {
    id: "t25",
    topic: "ai_prompts_and_productivity",
    angle: "playbook",
    tone: "founder",
    prompt: "Write a short productivity playbook for using AI without turning every task into prompt tinkering."
  },
  {
    id: "t26",
    topic: "any",
    angle: "breakdown",
    tone: "operator",
    prompt: "Write a compact, high-signal tweet that turns a practical AI lesson into a crisp business insight."
  },
  {
    id: "t27",
    topic: "any",
    angle: "case_study",
    tone: "builder",
    prompt: "Use a believable mini-case to illustrate one AI execution lesson."
  },
  {
    id: "t28",
    topic: "any",
    angle: "framework",
    tone: "educator",
    prompt: "Give a memorable 3-part framework about applying AI in the real world."
  },
  {
    id: "t29",
    topic: "any",
    angle: "contrarian",
    tone: "analyst",
    prompt: "Write a non-clickbait contrarian tweet about AI and business outcomes."
  },
  {
    id: "t30",
    topic: "any",
    angle: "mistake",
    tone: "founder",
    prompt: "Explain a subtle mistake people make when trying to use AI for growth or productivity."
  }
];
