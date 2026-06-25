import { readFile } from "node:fs/promises";
import { getDb } from "./client.js";

export async function initDb(): Promise<void> {
  const sqlPath = new URL("./schema.sql", import.meta.url);
  const sql = await readFile(sqlPath, "utf8");
  const db = getDb();

  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.execute(statement);
  }
}
