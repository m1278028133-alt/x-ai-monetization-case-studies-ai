import { randomUUID } from "node:crypto";
import { getDb } from "./client.js";
import type {
  GeneratedTweet,
  PlanStatus,
  ScheduleSlot,
  TweetStatus
} from "../types/index.js";

export interface StoredTweet extends GeneratedTweet {
  id: string;
  normalizedText: string;
  keywordVector: string[];
  embedding: number[] | null;
  status: TweetStatus;
  providerPostId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoredScheduleSlot extends ScheduleSlot {
  id: string;
  executionNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function insertTweet(input: {
  generated: GeneratedTweet;
  normalizedText: string;
  keywordVector: string[];
  embedding: number[] | null;
  status: TweetStatus;
}): Promise<StoredTweet> {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  await db.execute({
    sql: `
      INSERT INTO tweets (
        id, topic, tone, angle, text, normalized_text, keyword_vector, embedding_json,
        hook, metadata_json, status, provider_post_id, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      input.generated.topic,
      input.generated.tone,
      input.generated.angle,
      input.generated.text,
      input.normalizedText,
      JSON.stringify(input.keywordVector),
      input.embedding ? JSON.stringify(input.embedding) : null,
      input.generated.hook,
      JSON.stringify(input.generated.metadata),
      input.status,
      null,
      now,
      now
    ]
  });

  return {
    id,
    ...input.generated,
    normalizedText: input.normalizedText,
    keywordVector: input.keywordVector,
    embedding: input.embedding,
    status: input.status,
    providerPostId: null,
    createdAt: now,
    updatedAt: now
  };
}

function mapTweetRow(row: Record<string, unknown>): StoredTweet {
  return {
    id: String(row.id),
    topic: row.topic as GeneratedTweet["topic"],
    tone: row.tone as GeneratedTweet["tone"],
    angle: row.angle as GeneratedTweet["angle"],
    text: String(row.text),
    normalizedText: String(row.normalized_text),
    keywordVector: JSON.parse(String(row.keyword_vector)) as string[],
    embedding: row.embedding_json ? (JSON.parse(String(row.embedding_json)) as number[]) : null,
    hook: String(row.hook ?? ""),
    metadata: JSON.parse(String(row.metadata_json)) as Record<string, unknown>,
    status: row.status as TweetStatus,
    providerPostId: row.provider_post_id ? String(row.provider_post_id) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapSlotRow(row: Record<string, unknown>): StoredScheduleSlot {
  return {
    id: String(row.id),
    planDate: String(row.plan_date),
    scheduledAt: String(row.scheduled_at),
    topic: row.topic as ScheduleSlot["topic"],
    status: row.status as PlanStatus,
    tweetId: row.tweet_id ? String(row.tweet_id) : undefined,
    attemptCount: Number(row.attempt_count),
    executionNote: row.execution_note ? String(row.execution_note) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export async function getRecentTweets(limit: number): Promise<StoredTweet[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT *
      FROM tweets
      ORDER BY created_at DESC
      LIMIT ?
    `,
    args: [limit]
  });
  return result.rows.map((row) => mapTweetRow(row as Record<string, unknown>));
}

export async function updateTweetStatus(
  tweetId: string,
  status: TweetStatus,
  providerPostId?: string | null
): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `
      UPDATE tweets
      SET status = ?, provider_post_id = COALESCE(?, provider_post_id), updated_at = ?
      WHERE id = ?
    `,
    args: [status, providerPostId ?? null, new Date().toISOString(), tweetId]
  });
}

export async function insertScheduleSlots(slots: Omit<StoredScheduleSlot, "id" | "createdAt" | "updatedAt">[]): Promise<StoredScheduleSlot[]> {
  const db = getDb();
  const created: StoredScheduleSlot[] = [];

  for (const slot of slots) {
    const now = new Date().toISOString();
    const id = randomUUID();
    await db.execute({
      sql: `
        INSERT OR REPLACE INTO schedule_slots (
          id, plan_date, scheduled_at, topic, status, tweet_id, attempt_count, execution_note, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        slot.planDate,
        slot.scheduledAt,
        slot.topic,
        slot.status,
        slot.tweetId ?? null,
        slot.attemptCount,
        null,
        now,
        now
      ]
    });
    created.push({
      id,
      ...slot,
      executionNote: null,
      createdAt: now,
      updatedAt: now
    });
  }

  return created;
}

export async function getScheduleByDate(planDate: string): Promise<StoredScheduleSlot[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT *
      FROM schedule_slots
      WHERE plan_date = ?
      ORDER BY scheduled_at ASC
    `,
    args: [planDate]
  });

  return result.rows.map((row) => mapSlotRow(row as Record<string, unknown>));
}

export async function getPendingDueSlots(nowIso: string): Promise<StoredScheduleSlot[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `
      SELECT *
      FROM schedule_slots
      WHERE status = 'planned'
        AND scheduled_at <= ?
      ORDER BY scheduled_at ASC
    `,
    args: [nowIso]
  });
  return result.rows.map((row) => mapSlotRow(row as Record<string, unknown>));
}

export async function updateScheduleSlot(
  slotId: string,
  patch: {
    status?: PlanStatus;
    tweetId?: string | null;
    attemptCount?: number;
    executionNote?: string | null;
  }
): Promise<void> {
  const fields: string[] = [];
  const args: Array<string | number | null> = [];

  if (patch.status) {
    fields.push("status = ?");
    args.push(patch.status);
  }
  if (patch.tweetId !== undefined) {
    fields.push("tweet_id = ?");
    args.push(patch.tweetId);
  }
  if (patch.attemptCount !== undefined) {
    fields.push("attempt_count = ?");
    args.push(patch.attemptCount);
  }
  if (patch.executionNote !== undefined) {
    fields.push("execution_note = ?");
    args.push(patch.executionNote);
  }

  fields.push("updated_at = ?");
  args.push(new Date().toISOString());
  args.push(slotId);

  const db = getDb();
  await db.execute({
    sql: `UPDATE schedule_slots SET ${fields.join(", ")} WHERE id = ?`,
    args
  });
}

export async function logRun(runType: string, status: string, message: string, metadata: Record<string, unknown> = {}): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `
      INSERT INTO run_logs (id, run_type, status, message, metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      randomUUID(),
      runType,
      status,
      message,
      JSON.stringify(metadata),
      new Date().toISOString()
    ]
  });
}

export async function readCircuitBreaker(key: string): Promise<{
  consecutiveFailures: number;
  lastFailureAt: string | null;
  lastError: string | null;
} | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT * FROM circuit_breaker WHERE key = ?",
    args: [key]
  });
  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    consecutiveFailures: Number(row.consecutive_failures),
    lastFailureAt: row.last_failure_at ? String(row.last_failure_at) : null,
    lastError: row.last_error ? String(row.last_error) : null
  };
}

export async function writeCircuitBreaker(
  key: string,
  consecutiveFailures: number,
  lastError: string | null
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  await db.execute({
    sql: `
      INSERT INTO circuit_breaker (key, consecutive_failures, last_failure_at, last_error, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        consecutive_failures = excluded.consecutive_failures,
        last_failure_at = excluded.last_failure_at,
        last_error = excluded.last_error,
        updated_at = excluded.updated_at
    `,
    args: [key, consecutiveFailures, lastError ? now : null, lastError, now]
  });
}
