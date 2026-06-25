import test from "node:test";
import assert from "node:assert/strict";
import { randomInt } from "../src/lib/random.js";
import { jaccardSimilarity, normalizeText } from "../src/lib/text.js";
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
