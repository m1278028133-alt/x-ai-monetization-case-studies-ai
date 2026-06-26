import { config } from "../config.js";
import { getPendingDueSlots, logRun } from "../db/repository.js";
import { ensureDailySchedule } from "./scheduler.js";
import { publishSlot } from "./publisher.js";

export async function planDay(referenceDate = new Date()): Promise<void> {
  const slots = await ensureDailySchedule(referenceDate);
  await logRun("plan-day", "success", "Daily schedule ensured.", {
    count: slots.length,
    slots: slots.map((slot) => ({
      id: slot.id,
      scheduledAt: slot.scheduledAt,
      topic: slot.topic,
      status: slot.status
    }))
  });
}

export async function runDuePosts(now = new Date()): Promise<void> {
  await ensureDailySchedule(now);
  const dueSlots = await getPendingDueSlots(now.toISOString());

  if (dueSlots.length === 0) {
    console.log(`No due posts found at ${now.toISOString()}.`);
    return;
  }

  for (const slot of dueSlots) {
    await publishSlot(slot, config.MAX_RETRY_ATTEMPTS);
  }
}
