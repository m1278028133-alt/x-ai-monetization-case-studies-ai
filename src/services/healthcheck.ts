import { assertOpenAIConfig, assertPushplusConfig, config, validateRuntimeConfig } from "../config.js";
import { getDb } from "../db/client.js";

export interface HealthcheckReport {
  ok: boolean;
  checks: Array<{
    name: string;
    ok: boolean;
    detail: string;
  }>;
}

export async function runHealthcheck(): Promise<HealthcheckReport> {
  const checks: HealthcheckReport["checks"] = [];

  try {
    validateRuntimeConfig();
    checks.push({
      name: "config-shape",
      ok: true,
      detail: "Posting window, count, and gap constraints are internally consistent."
    });
  } catch (error) {
    checks.push({
      name: "config-shape",
      ok: false,
      detail: error instanceof Error ? error.message : "Unknown config validation error."
    });
  }

  try {
    const db = getDb();
    await db.execute("SELECT 1");
    checks.push({
      name: "database",
      ok: true,
      detail: `Database connection OK: ${config.DATABASE_URL}`
    });
  } catch (error) {
    checks.push({
      name: "database",
      ok: false,
      detail: error instanceof Error ? error.message : "Unable to connect to database."
    });
  }

  try {
    assertOpenAIConfig();
    checks.push({
      name: "openai-config",
      ok: true,
      detail: `OpenAI key present. Model: ${config.OPENAI_MODEL}`
    });
  } catch (error) {
    checks.push({
      name: "openai-config",
      ok: config.DRY_RUN,
      detail: config.DRY_RUN
        ? "OpenAI key missing, but this is acceptable for dry runs with fallback content."
        : error instanceof Error
          ? error.message
          : "Missing OpenAI configuration."
    });
  }

  try {
    assertPushplusConfig();
    checks.push({
      name: "wechat-notify-config",
      ok: true,
      detail: "PushPlus token is present for WeChat delivery."
    });
  } catch (error) {
    checks.push({
      name: "wechat-notify-config",
      ok: config.DRY_RUN,
      detail: config.DRY_RUN
        ? "PushPlus token missing, but this is acceptable in dry-run mode because notification delivery is simulated."
        : error instanceof Error
          ? error.message
          : "Missing PushPlus notification configuration."
    });
  }

  checks.push({
    name: "dry-run-mode",
    ok: true,
    detail: config.DRY_RUN
      ? "DRY_RUN=true, runner will simulate posting."
      : "DRY_RUN=false, runner will attempt live posting."
  });

  return {
    ok: checks.every((check) => check.ok),
    checks
  };
}
