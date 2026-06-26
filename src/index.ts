import { validateRuntimeConfig, config } from "./config.js";
import { bootstrapProject } from "./services/bootstrap.js";
import { getScheduleByDate } from "./db/repository.js";
import { initDb } from "./db/init.js";
import { toDateKey } from "./lib/time.js";
import { runHealthcheck } from "./services/healthcheck.js";
import { planDay, runDuePosts } from "./services/runner.js";
import { sendTestNotification } from "./services/test-notification.js";

async function main(): Promise<void> {
  const command = process.argv[2] ?? "run-once";

  switch (command) {
    case "setup": {
      const result = await bootstrapProject();
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    case "init-db":
      await initDb();
      console.log("Database initialized.");
      return;
    case "healthcheck": {
      await initDb();
      const report = await runHealthcheck();
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = report.ok ? 0 : 1;
      return;
    }
    case "plan-day": {
      validateRuntimeConfig();
      await initDb();
      await planDay(new Date());
      const today = toDateKey(new Date(), config.BOT_TIMEZONE);
      const slots = await getScheduleByDate(today);
      console.log(JSON.stringify(slots, null, 2));
      return;
    }
    case "dry-run":
    case "run-once":
      validateRuntimeConfig();
      await initDb();
      await runDuePosts(new Date());
      console.log("Run completed.");
      return;
    case "notify-test": {
      validateRuntimeConfig();
      await initDb();
      const result = await sendTestNotification();
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.success ? 0 : 1;
      return;
    }
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
