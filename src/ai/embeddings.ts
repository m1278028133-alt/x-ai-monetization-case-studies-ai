import { getOpenAI } from "./openai.js";
import { config } from "../config.js";

export async function createEmbedding(text: string): Promise<number[]> {
  const client = getOpenAI();
  const result = await client.embeddings.create({
    model: config.EMBEDDING_MODEL,
    input: text
  });

  return result.data[0]?.embedding ?? [];
}
