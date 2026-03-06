import { generateEmbedding, generateEmbeddings } from "./embeddings";
import { ensureCollection, upsertPoints, searchSimilar } from "./qdrantClient";
import { createLogger } from "@/utils/logger";

const logger = createLogger("Clustering");

export interface ClusterableItem {
  id: string;
  text: string;
  matchId: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface Cluster {
  id: string;
  label: string;
  items: ClusterableItem[];
  centroidText: string;
}

const SIMILARITY_THRESHOLD = 0.80;

export async function indexComments(items: ClusterableItem[]): Promise<void> {
  await ensureCollection();

  const texts = items.map((item) => item.text);
  const embeddings = await generateEmbeddings(texts);

  const points = items.map((item, i) => ({
    id: item.id,
    vector: embeddings[i],
    payload: {
      text: item.text,
      matchId: item.matchId,
      source: item.source,
      ...item.metadata,
    },
  }));

  await upsertPoints(points);
  logger.info(`Indexed ${items.length} comments`);
}

export async function findSimilarComments(
  text: string,
  limit = 10
): Promise<{ id: string | number; score: number; text: string }[]> {
  const embedding = await generateEmbedding(text);
  const results = await searchSimilar(embedding, limit, SIMILARITY_THRESHOLD);

  return results.map((r) => ({
    id: r.id,
    score: r.score,
    text: (r.payload.text as string) ?? "",
  }));
}

export async function clusterComments(
  items: ClusterableItem[]
): Promise<Cluster[]> {
  if (items.length === 0) return [];

  await indexComments(items);

  const clusters: Cluster[] = [];
  const assigned = new Set<string>();

  for (const item of items) {
    if (assigned.has(item.id)) continue;

    const similar = await findSimilarComments(item.text, 20);
    const clusterItems: ClusterableItem[] = [item];
    assigned.add(item.id);

    for (const sim of similar) {
      const simId = String(sim.id);
      if (assigned.has(simId)) continue;
      const matchingItem = items.find((i) => i.id === simId);
      if (matchingItem) {
        clusterItems.push(matchingItem);
        assigned.add(simId);
      }
    }

    if (clusterItems.length > 0) {
      clusters.push({
        id: `cluster-${clusters.length + 1}`,
        label: generateClusterLabel(clusterItems),
        items: clusterItems,
        centroidText: item.text,
      });
    }
  }

  logger.info(`Created ${clusters.length} clusters from ${items.length} items`);
  return clusters;
}

function generateClusterLabel(items: ClusterableItem[]): string {
  const allText = items.map((i) => i.text.toLowerCase()).join(" ");

  const labels: [string, string][] = [
    ["penaltı", "Penalty Controversy"],
    ["ofsayt", "Offside Controversy"],
    ["kırmızı kart", "Red Card Controversy"],
    ["var", "VAR Controversy"],
    ["hakem", "Referee Decision"],
    ["penalty", "Penalty Controversy"],
    ["offside", "Offside Controversy"],
    ["red card", "Red Card Controversy"],
  ];

  for (const [keyword, label] of labels) {
    if (allText.includes(keyword)) return label;
  }

  return "General Controversy";
}
