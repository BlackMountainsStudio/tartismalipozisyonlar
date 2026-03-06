import OpenAI from "openai";
import { createLogger } from "@/utils/logger";

const logger = createLogger("Embeddings");

function getOpenAIClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();

  try {
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (err) {
    logger.error("Failed to generate embedding", err);
    throw err;
  }
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const client = getOpenAIClient();

  const BATCH_SIZE = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    try {
      const response = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: batch,
      });

      const embeddings = response.data
        .sort((a, b) => a.index - b.index)
        .map((d) => d.embedding);

      allEmbeddings.push(...embeddings);
    } catch (err) {
      logger.error(`Failed to generate embeddings batch ${i}`, err);
      throw err;
    }
  }

  return allEmbeddings;
}
