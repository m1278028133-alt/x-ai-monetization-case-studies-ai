import test from "node:test";
import assert from "node:assert/strict";
import { config, validateRuntimeConfig } from "../src/config.js";

test("runtime config validates under defaults", () => {
  assert.doesNotThrow(() => validateRuntimeConfig());
});

test("boolean config fields are normalized", () => {
  assert.equal(typeof config.DRY_RUN, "boolean");
  assert.equal(typeof config.ENABLE_SEMANTIC_DEDUP, "boolean");
});
