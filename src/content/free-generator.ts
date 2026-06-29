import { topics } from "./topics.js";
import type { AngleKey, GeneratedTweet, ToneKey, TopicKey } from "../types/index.js";
import { randomInt } from "../lib/random.js";

const hookOpeners = [
  "Most people miss this:",
  "One underrated AI lesson:",
  "The real opportunity in AI:",
  "If I were starting from zero:",
  "A better way to think about AI:",
  "One thing builders keep underestimating:",
  "A small AI move that compounds:",
  "If you want more AI traction:"
];

const toneModifiers: Record<ToneKey, string[]> = {
  operator: ["from an execution angle", "in practice", "inside real workflows"],
  analyst: ["from a market angle", "when you look at the pattern", "in the data"],
  founder: ["if you are building a company", "from a founder lens", "if you care about distribution"],
  builder: ["if you are shipping product", "inside the build loop", "when you are making features real"],
  educator: ["for people learning fast", "if you want a simple framework", "for anyone trying to get better"]
};

const anglePatterns: Record<AngleKey, string[]> = {
  framework: [
    "{hook} AI wins when it does 3 things well: removes a painful manual step, fits an existing budget, and gets better with workflow context. {seed} is interesting because it can do all three.",
    "{hook} A useful AI monetization filter: pain, frequency, and proof. If a workflow hurts often and AI can show visible improvement, people will try it. That is why {seed} keeps showing up.",
    "{hook} The simplest AI money test is buyer, pain, delivery, proof. If you cannot name all 4, you probably have a demo, not an offer. {seed} gets interesting when those 4 pieces line up."
  ],
  case_study: [
    "{hook} {seed} works as a case study because the buyer already knows the pain, the ROI is easy to explain, and the workflow is repetitive enough for AI to matter.",
    "{hook} The reason {seed} can become a real business is simple: it is not selling 'AI'. It is selling faster output, fewer mistakes, and less busywork.",
    "{hook} A small AI success case usually looks like this: start as a service, document the repeated steps, automate the painful middle, then turn the repeatable part into software. {seed} fits that path."
  ],
  contrarian: [
    "{hook} The best AI products usually do not look impressive in a demo. They look boring, specific, and deeply useful. {seed} is a better bet than another generic copilot.",
    "{hook} Raw model quality is overrated. Distribution, workflow fit, and response reliability decide who wins. That is why {seed} deserves more attention."
  ],
  step_by_step: [
    "{hook} A simple AI workflow: collect the messy input, classify the real job, generate a first pass, then make a human review the final edge cases. {seed} gets stronger with that setup.",
    "{hook} A practical AI loop is: intake, structure, generate, verify. Most teams skip the verify step. {seed} only works when that last step stays tight.",
    "{hook} If you want to monetize an AI workflow, do it in this order: sell the outcome manually, track the repeated steps, automate one bottleneck, then package the process. {seed} is a good place to apply that."
  ],
  breakdown: [
    "{hook} Break the opportunity into 4 parts: acquisition, activation, retention, and trust. {seed} gets interesting when trust improves faster than cost rises.",
    "{hook} The smartest AI plays are not broad. They win one repeated workflow, prove value fast, and then expand. {seed} fits that pattern."
  ],
  prediction: [
    "{hook} Over the next year, the strongest AI products will look less like chat apps and more like quiet workflow upgrades. {seed} is closer to that future than most people think.",
    "{hook} My bet: the next wave of AI winners will come from tools that save time inside existing teams, not from flashy consumer demos. {seed} is exactly that kind of lane."
  ],
  mistake: [
    "{hook} A common AI mistake is chasing capabilities before workflow fit. {seed} only becomes valuable when it maps to a job people already pay to solve.",
    "{hook} Builders lose time by making AI outputs look magical instead of reliable. {seed} gets stronger when the promise stays narrow and the result stays consistent."
  ],
  prompt: [
    "{hook} A useful prompt habit is to ask for structure before polish. That is why {seed} tends to work better when the AI first labels the task, then drafts the output.",
    "{hook} Better prompts start with context, constraints, and success criteria. That matters more than clever wording. {seed} improves when the workflow follows that rule."
  ],
  comparison: [
    "{hook} Compare 2 AI strategies: broad assistant vs narrow workflow tool. The broad version gets attention. The narrow version gets renewals. {seed} is stronger in the second category.",
    "{hook} One useful comparison in AI: novelty vs reliability. Novelty gets screenshots. Reliability gets teams to come back. {seed} is more interesting when measured that way."
  ],
  playbook: [
    "{hook} A simple AI playbook: pick one painful workflow, define one clear win, and remove one manual step at a time. {seed} becomes much easier to position with that discipline.",
    "{hook} If you want traction with AI, start with a narrow user, a repeated task, and a visible before/after. {seed} is a good example of how that can work.",
    "{hook} A practical AI monetization playbook: find a boring workflow people already pay for, use AI to cut delivery time, charge for the outcome, then productize only after the pattern repeats."
  ]
};

const closers: Record<TopicKey, string[]> = {
  ai_monetization_case_studies: [
    "Would you build this as software or service first?",
    "What part of this would you automate first?",
    "What would you charge for the first version?"
  ],
  ai_tools_and_workflows: [
    "Where would this save you the most time?",
    "What workflow is still too manual in your team?"
  ],
  ai_startup_ideas: [
    "Would you pay for this if it saved you an hour a day?",
    "Would you ship this as a niche tool?",
    "Who would you sell the first 10 customers to?"
  ],
  ai_industry_insights: [
    "What do you think wins next: reliability or novelty?",
    "Which part of the AI stack do you think gets commoditized fastest?"
  ],
  ai_prompts_and_productivity: [
    "What prompt do you wish you had earlier?",
    "What task would you hand to AI first?"
  ]
};

const hashtagSets: Record<TopicKey, string[][]> = {
  ai_monetization_case_studies: [["#AI", "#SaaS"], ["#AI", "#Startups"], ["#AI", "#Business"]],
  ai_tools_and_workflows: [["#AI", "#Productivity"], ["#AI", "#Automation"], ["#AI", "#Workflows"]],
  ai_startup_ideas: [["#AI", "#Startups"], ["#AI", "#IndieHackers"], ["#AI", "#BuildInPublic"]],
  ai_industry_insights: [["#AI", "#Tech"], ["#AI", "#Strategy"], ["#AI", "#FutureOfWork"]],
  ai_prompts_and_productivity: [["#AI", "#Prompts"], ["#AI", "#Productivity"], ["#AI", "#KnowledgeWork"]]
};

const imageIdeas: Record<TopicKey, string[]> = {
  ai_monetization_case_studies: [
    "A clean one-slide case breakdown: buyer, pain, offer, pricing, and delivery loop.",
    "A small table comparing problem, AI solution, revenue logic, and first sales channel."
  ],
  ai_tools_and_workflows: [
    "A simple workflow diagram with 3 to 4 steps on a clean background.",
    "A tidy screenshot-style card showing before vs after workflow time."
  ],
  ai_startup_ideas: [
    "A founder-style note card with problem, buyer, wedge, pricing, and first outreach channel.",
    "A mini market map showing where the startup idea fits and who pays first."
  ],
  ai_industry_insights: [
    "A bold text card with one surprising industry takeaway.",
    "A minimal 2-axis chart that makes the comparison obvious."
  ],
  ai_prompts_and_productivity: [
    "A screenshot-style prompt card with one highlighted line.",
    "A simple checklist graphic showing the prompt workflow."
  ]
};

const textOnlyAngles = new Set<AngleKey>(["contrarian", "mistake", "prediction"]);

function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

export function generateFreeTweet(params: {
  topic: TopicKey;
  tone: ToneKey;
  angle: AngleKey;
  recentTweets: string[];
}): GeneratedTweet {
  const topic = topics.find((item) => item.key === params.topic);
  if (!topic) {
    throw new Error(`Unknown topic: ${params.topic}`);
  }

  const hook = hookOpeners[randomInt(0, hookOpeners.length - 1)];
  const seed = topic.seedIdeas[randomInt(0, topic.seedIdeas.length - 1)];
  const anglePattern = anglePatterns[params.angle][randomInt(0, anglePatterns[params.angle].length - 1)];
  const modifierPool = toneModifiers[params.tone];
  const modifier = modifierPool[randomInt(0, modifierPool.length - 1)];
  const closerPool = closers[params.topic];
  const closer = closerPool[randomInt(0, closerPool.length - 1)];

  let text = fillTemplate(anglePattern, { hook, seed });
  text = `${text} ${modifier}.`.replace(/\s+/g, " ").trim();
  if (Math.random() < 0.65) {
    text = `${text} ${closer}`.replace(/\s+/g, " ").trim();
  }

  const hashtags = hashtagSets[params.topic][randomInt(0, hashtagSets[params.topic].length - 1)];
  const imageNeeded = !textOnlyAngles.has(params.angle) && Math.random() < 0.75;
  const imageIdea = imageNeeded
    ? imageIdeas[params.topic][randomInt(0, imageIdeas[params.topic].length - 1)]
    : "No image needed. The post works better as a direct text insight.";

  return {
    topic: params.topic,
    tone: params.tone,
    angle: params.angle,
    text,
    hook,
    metadata: {
      fallback: true,
      freeMode: true,
      hashtags,
      imageNeeded,
      imageIdea,
      notes: `Free local generator using ${params.angle} angle and ${params.tone} tone.`
    }
  };
}
