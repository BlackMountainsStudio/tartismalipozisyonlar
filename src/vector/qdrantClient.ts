import { QdrantClient } from "@qdrant/js-client-rest";
import { createLogger } from "@/utils/logger";

const logger = createLogger("QdrantClient");

const COLLECTION_NAME = "football_incidents";
const VECTOR_SIZE = 1536; // OpenAI text-embedding-3-small dimension

let client: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (!client) {
    client = new QdrantClient({
      url: process.env.QDRANT_URL ?? "http://localhost:6333",
    });
  }
  return client;
}

export async function ensureCollection(): Promise<void> {
  const qdrant = getQdrantClient();

  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === COLLECTION_NAME
    );

    if (!exists) {
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
      });
      logger.info(`Collection "${COLLECTION_NAME}" created`);
    }
  } catch (err) {
    logger.error("Failed to ensure collection", err);
    throw err;
  }
}

export async function upsertPoints(
  points: {
    id: string;
    vector: number[];
    payload: Record<string, unknown>;
  }[]
): Promise<void> {
  const qdrant = getQdrantClient();

  try {
    await qdrant.upsert(COLLECTION_NAME, {
      points: points.map((p) => ({
        id: p.id,
        vector: p.vector,
        payload: p.payload,
      })),
    });
    logger.info(`Upserted ${points.length} points`);
  } catch (err) {
    logger.error("Failed to upsert points", err);
    throw err;
  }
}

export async function searchSimilar(
  vector: number[],
  limit = 10,
  scoreThreshold = 0.75
): Promise<
  { id: string | number; score: number; payload: Record<string, unknown> }[]
> {
  const qdrant = getQdrantClient();

  try {
    const results = await qdrant.search(COLLECTION_NAME, {
      vector,
      limit,
      score_threshold: scoreThreshold,
    });

    return results.map((r) => ({
      id: r.id,
      score: r.score,
      payload: (r.payload ?? {}) as Record<string, unknown>,
    }));
  } catch (err) {
    logger.error("Failed to search similar", err);
    return [];
  }
}
