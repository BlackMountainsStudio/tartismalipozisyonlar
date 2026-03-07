import OpenAI from "openai";
import { createLogger } from "@/utils/logger";
import { CONTROVERSY_KEYWORDS_TR, CONTROVERSY_KEYWORDS_EN } from "@/utils/keywords";

const logger = createLogger("IncidentDetector");

export interface DetectedIncident {
  type: "Possible Penalty" | "Possible Offside Goal" | "Missed Red Card" | "VAR Controversy";
  minute: number | null;
  description: string;
  confidence: number;
}

const INCIDENT_TYPE_MAP: Record<string, string> = {
  "Possible Penalty": "POSSIBLE_PENALTY",
  "Possible Offside Goal": "POSSIBLE_OFFSIDE_GOAL",
  "Missed Red Card": "MISSED_RED_CARD",
  "VAR Controversy": "VAR_CONTROVERSY",
};

export function mapIncidentType(type: string): string {
  return INCIDENT_TYPE_MAP[type] ?? "VAR_CONTROVERSY";
}

// --- Local detector (no API key): keyword + regex ---
const KEYWORD_TO_TYPE: Record<string, DetectedIncident["type"]> = {
  penaltı: "Possible Penalty",
  penalty: "Possible Penalty",
  "net penaltı": "Possible Penalty",
  "penaltı verilmedi": "Possible Penalty",
  "clear penalty": "Possible Penalty",
  "penalty not given": "Possible Penalty",
  "penaltı pozisyonu": "Possible Penalty",
  "el var": "Possible Penalty",
  handball: "Possible Penalty",
  ofsayt: "Possible Offside Goal",
  offside: "Possible Offside Goal",
  "ofsayt değil": "Possible Offside Goal",
  "ofsayt gol": "Possible Offside Goal",
  "gol iptali": "Possible Offside Goal",
  "goal disallowed": "Possible Offside Goal",
  "not offside": "Possible Offside Goal",
  "offside goal": "Possible Offside Goal",
  "kırmızı kart": "Missed Red Card",
  "red card": "Missed Red Card",
  "kırmızı kart verilmedi": "Missed Red Card",
  "red card not given": "Missed Red Card",
  "sarı kart": "Missed Red Card",
  VAR: "VAR Controversy",
  "VAR skandalı": "VAR Controversy",
  "VAR scandal": "VAR Controversy",
  "hakem hatası": "VAR Controversy",
  "hakem skandalı": "VAR Controversy",
  "referee mistake": "VAR Controversy",
  "referee controversy": "VAR Controversy",
  "yanlış karar": "VAR Controversy",
  "wrong decision": "VAR Controversy",
};

const MINUTE_REGEX =
  /(\d{1,3})\s*[\'\′]?\s*(?:dk|dakika|minute|min|')/gi;

function extractMinute(text: string): number | null {
  const m = MINUTE_REGEX.exec(text);
  if (m) {
    const num = parseInt(m[1], 10);
    return num >= 1 && num <= 120 ? num : null;
  }
  const numOnly = text.match(/\b(\d{1,2})\s*(?:\.\s*yarı|half|\s*-\s*)/i);
  if (numOnly) return parseInt(numOnly[1], 10);
  return null;
}

export function detectIncidentsLocal(
  comments: string[],
  _matchContext: string
): DetectedIncident[] {
  const incidentsByKey = new Map<string, { count: number; minutes: number[]; snippets: string[] }>();

  const allKeywords = [
    ...CONTROVERSY_KEYWORDS_TR,
    ...CONTROVERSY_KEYWORDS_EN,
  ].filter((k) => k.length > 2);
  const sortedKeywords = [...allKeywords].sort((a, b) => b.length - a.length);

  for (const comment of comments) {
    const lower = comment.toLowerCase().trim();
    if (lower.length < 10) continue;

    let matchedType: DetectedIncident["type"] | null = null;
    for (const kw of sortedKeywords) {
      if (lower.includes(kw.toLowerCase())) {
        matchedType = KEYWORD_TO_TYPE[kw] ?? KEYWORD_TO_TYPE[kw.toLowerCase()] ?? "VAR Controversy";
        break;
      }
    }
    if (!matchedType) continue;

    const minute = extractMinute(comment);
    const key = `${matchedType}|${minute ?? "?"}`;
    const existing = incidentsByKey.get(key);
    const snippet = comment.slice(0, 180).trim() + (comment.length > 180 ? "…" : "");
    if (existing) {
      existing.count++;
      if (minute != null) existing.minutes.push(minute);
      if (existing.snippets.length < 2) existing.snippets.push(snippet);
    } else {
      incidentsByKey.set(key, {
        count: 1,
        minutes: minute != null ? [minute] : [],
        snippets: [snippet],
      });
    }
  }

  const result: DetectedIncident[] = [];
  for (const [key, data] of incidentsByKey) {
    const [type] = key.split("|");
    const avgMinute =
      data.minutes.length > 0
        ? Math.round(
            data.minutes.reduce((a, b) => a + b, 0) / data.minutes.length
          )
        : null;
    const confidence = Math.min(0.95, 0.5 + data.count * 0.08);
    const description =
      data.snippets[0]?.slice(0, 200) ??
      `Taraftar yorumlarına göre ${type} tartışması.`;
    result.push({
      type: type as DetectedIncident["type"],
      minute: avgMinute,
      description,
      confidence,
    });
  }

  logger.info(`Local detector: ${result.length} incidents from ${comments.length} comments`);
  return result;
}

function getOpenAIClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `You are a football (soccer) controversy detection AI. 
Your task is to analyze fan comments from forums and social media about football matches,
and detect potential controversial referee decisions.

You must analyze the comments and return a JSON array of detected incidents.
Each incident must have:
- type: one of "Possible Penalty", "Possible Offside Goal", "Missed Red Card", "VAR Controversy"
- minute: the match minute if mentioned (number or null)
- description: a brief factual description of the alleged incident
- confidence: a score from 0 to 1 indicating how likely this is a real controversy

Rules:
- Only detect real controversy mentions, not general complaints
- Multiple comments about the same incident should increase confidence
- Look for specific details: minute, player names, actions
- Ignore trolling or unrelated comments
- Return an empty array if no controversies are detected
- Always return valid JSON`;

export async function detectIncidents(
  comments: string[],
  matchContext: string
): Promise<DetectedIncident[]> {
  const client = getOpenAIClient();

  const commentsText = comments
    .map((c, i) => `[Comment ${i + 1}]: ${c}`)
    .join("\n\n");

  try {
    logger.info(`Analyzing ${comments.length} comments for match: ${matchContext}`);

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Match: ${matchContext}\n\nComments to analyze:\n${commentsText}\n\nDetect controversial referee decisions from these comments. Return a JSON array of incidents.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      logger.warn("Empty response from OpenAI");
      return [];
    }

    const parsed = JSON.parse(content);
    const incidents: DetectedIncident[] = parsed.incidents ?? parsed ?? [];

    logger.info(`Detected ${incidents.length} incidents`);
    return incidents.filter(
      (i) =>
        i.type &&
        i.description &&
        typeof i.confidence === "number" &&
        i.confidence >= 0 &&
        i.confidence <= 1
    );
  } catch (err) {
    logger.error("Failed to detect incidents", err);
    return [];
  }
}

export async function explainIncident(
  incident: { type: string; description: string; confidence: number },
  comments: string[]
): Promise<string> {
  const client = getOpenAIClient();

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a football analyst. Explain why an AI detected a controversial incident based on fan comments. Be factual and concise.",
        },
        {
          role: "user",
          content: `Incident detected:\nType: ${incident.type}\nDescription: ${incident.description}\nConfidence: ${incident.confidence}\n\nRelevant comments:\n${comments.slice(0, 10).join("\n\n")}\n\nExplain why this was flagged as controversial.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content ?? "No explanation available.";
  } catch (err) {
    logger.error("Failed to explain incident", err);
    return "Unable to generate explanation.";
  }
}
