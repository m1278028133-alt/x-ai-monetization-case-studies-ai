import { config } from "../config.js";
import { topics } from "../content/topics.js";
import { getScheduleByDate, insertScheduleSlots, type StoredScheduleSlot } from "../db/repository.js";
import { pickRandom, randomInt, weightedPick } from "../lib/random.js";
import { getTimezoneParts, toDateKey, zonedTimeToUtcIso } from "../lib/time.js";
import type { TopicKey } from "../types/index.js";

function buildTopicPlan(count: number): TopicKey[] {
  const selected: TopicKey[] = [];
  while (selected.length < count) {
    selected.push(weightedPick(config.topicWeights));
  }
  return selected;
}

function canFitSlots(count: number, windowMinutes: number): boolean {
  if (count <= 0) {
    return false;
  }
  const minimumRequired = (count - 1) * config.MIN_GAP_MINUTES;
  return minimumRequired <= windowMinutes;
}

function resolveTargetCount(windowMinutes: number): number {
  const maxDesired = Math.min(config.DAILY_POST_MAX, 24);
  const minDesired = Math.min(config.DAILY_POST_MIN, maxDesired);

  for (let count = maxDesired; count >= minDesired; count -= 1) {
    if (canFitSlots(count, windowMinutes)) {
      return count;
    }
  }

  if (canFitSlots(1, windowMinutes)) {
    return 1;
  }

  throw new Error("Posting window is too narrow to fit even one post safely.");
}

function generateMinuteOffsets(targetCount: number, windowMinutes: number): number[] {
  if (targetCount === 1) {
    return [randomInt(0, windowMinutes)];
  }

  const slack = windowMinutes - (targetCount - 1) * config.MIN_GAP_MINUTES;
  const baseStart = randomInt(0, Math.max(0, slack));
  const offsets: number[] = [baseStart];

  for (let index = 1; index < targetCount; index += 1) {
    const remainingAfterCurrent = targetCount - index - 1;
    const prev = offsets[offsets.length - 1];
    const minOffset = prev + config.MIN_GAP_MINUTES;
    const maxByGap = prev + config.MAX_GAP_MINUTES;
    const maxByWindow = windowMinutes - remainingAfterCurrent * config.MIN_GAP_MINUTES;
    const maxOffset = Math.min(maxByGap, maxByWindow);

    if (minOffset > maxOffset) {
      throw new Error("Unable to generate a valid schedule with the current gap constraints.");
    }

    offsets.push(randomInt(minOffset, maxOffset));
  }

  return offsets;
}

export async function ensureDailySchedule(referenceDate = new Date()): Promise<StoredScheduleSlot[]> {
  const planDate = toDateKey(referenceDate, config.BOT_TIMEZONE);
  const existing = await getScheduleByDate(planDate);
  if (existing.length > 0) {
    return existing;
  }

  const day = getTimezoneParts(referenceDate, config.BOT_TIMEZONE);
  const startMinutes = config.POST_WINDOW_START_HOUR * 60;
  const endMinutes = config.POST_WINDOW_END_HOUR * 60;
  const windowMinutes = endMinutes - startMinutes;

  if (windowMinutes <= config.MIN_GAP_MINUTES) {
    throw new Error("Posting window is too narrow for the configured minimum gap.");
  }

  const feasibleMax = resolveTargetCount(windowMinutes);
  const feasibleMin = Math.min(config.DAILY_POST_MIN, feasibleMax);
  const count = randomInt(feasibleMin, feasibleMax);
  const topicPlan = buildTopicPlan(count);
  const offsets = generateMinuteOffsets(count, windowMinutes);
  const slots = offsets.map((offset, index) => {
    const totalMinutes = startMinutes + offset;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return {
      planDate,
      scheduledAt: zonedTimeToUtcIso(
        day.year,
        day.month,
        day.day,
        hour,
        minute,
        config.BOT_TIMEZONE
      ),
      topic: topicPlan[index] ?? pickRandom(topics).key,
      status: "planned" as const,
      tweetId: undefined,
      attemptCount: 0
    };
  });

  return insertScheduleSlots(slots);
}
