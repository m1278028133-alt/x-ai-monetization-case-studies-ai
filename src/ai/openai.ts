import OpenAI from "openai";
import { assertOpenAIConfig, config } from "../config.js";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  assertOpenAIConfig();
  if (!client) {
    client = new OpenAI({
      apiKey: config.OPENAI_API_KEY
    });
  }
  return client;
}
