import { config } from "../config.js";
import { readCircuitBreaker, writeCircuitBreaker } from "../db/repository.js";

const KEY = "x-posting";

export async function ensureCircuitClosed(): Promise<void> {
  const state = await readCircuitBreaker(KEY);
  if (state && state.consecutiveFailures >= config.CIRCUIT_BREAKER_FAILURE_THRESHOLD) {
    throw new Error(
      `Circuit breaker open after ${state.consecutiveFailures} consecutive failures. Last error: ${state.lastError ?? "unknown"}`
    );
  }
}

export async function registerSuccess(): Promise<void> {
  await writeCircuitBreaker(KEY, 0, null);
}

export async function registerFailure(error: string): Promise<void> {
  const state = await readCircuitBreaker(KEY);
  const nextCount = (state?.consecutiveFailures ?? 0) + 1;
  await writeCircuitBreaker(KEY, nextCount, error);
}
