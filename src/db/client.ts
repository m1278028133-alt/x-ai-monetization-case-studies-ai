import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { config } from "../config.js";

let singleton: Client | null = null;

function ensureLocalDbDirectory(): void {
  if (!config.DATABASE_URL.startsWith("file:")) {
    return;
  }

  const rawPath = config.DATABASE_URL.slice("file:".length);
  const normalizedPath = rawPath.startsWith("./") ? rawPath.slice(2) : rawPath;
  const directory = dirname(normalizedPath);
  mkdirSync(directory, { recursive: true });
}

export function getDb(): Client {
  if (!singleton) {
    ensureLocalDbDirectory();
    singleton = createClient({
      url: config.DATABASE_URL,
      authToken: config.DATABASE_AUTH_TOKEN
    });
  }
  return singleton;
}
