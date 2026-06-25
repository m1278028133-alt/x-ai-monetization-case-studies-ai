import { copyFile, access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import { initDb } from "../db/init.js";

export async function bootstrapProject(): Promise<{
  createdEnv: boolean;
  databaseInitialized: boolean;
}> {
  let createdEnv = false;

  try {
    await access(".env", constants.F_OK);
  } catch {
    await copyFile(".env.example", ".env");
    createdEnv = true;
  }

  await mkdir("data", { recursive: true });
  await initDb();

  return {
    createdEnv,
    databaseInitialized: true
  };
}
