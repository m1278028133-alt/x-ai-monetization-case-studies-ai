import test from "node:test";
import assert from "node:assert/strict";
import { randomInt } from "../src/lib/random.js";
import { jaccardSimilarity, normalizeText, splitForXThread } from "../src/lib/text.js";
import { cosineSimilarity } from "../src/services/dedupe.js";

test("normalizeText removes links and punctuation", () => {
  assert.equal(
    normalizeText("AI tools! https://example.com  Save 10 hours/week."),
    "ai tools save 10 hours week"
  );
});

test("jaccardSimilarity works for overlapping terms", () => {
  const score = jaccardSimilarity(["ai", "startup", "pricing"], ["ai", "pricing", "agent"]);
  assert.equal(score, 0.5);
});

test("cosineSimilarity returns 1 for identical vectors", () => {
  assert.equal(cosineSimilarity([1, 2, 3], [1, 2, 3]), 1);
});

test("randomInt stays inside inclusive range", () => {
  for (let index = 0; index < 50; index += 1) {
    const value = randomInt(2, 4);
    assert.ok(value >= 2 && value <= 4);
  }
});

test("splitForXThread preserves long text across bounded parts", () => {
  const text = [
    "Most AI products do not fail because the model is weak.",
    "They fail because the workflow is vague, the buyer cannot see the before-and-after, and the team never defines what a good enough output looks like.",
    "A better wedge is narrow: one painful job, one visible metric, one human review step, and one reason to come back next week."
  ].join(" ");

  const parts = splitForXThread(text, 120);

  assert.ok(parts.length > 1);
  assert.ok(parts.every((part) => part.length <= 120));
  assert.equal(parts.join(" "), text);
});
