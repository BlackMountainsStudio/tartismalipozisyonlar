import OpenAI from "openai";
import { createLogger } from "@/utils/logger";

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
