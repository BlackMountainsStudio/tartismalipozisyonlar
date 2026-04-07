import OpenAI from "openai";
import { prisma } from "@/database/db";
import { createLogger } from "@/utils/logger";

const logger = createLogger("ChatAgent");

function getOpenAIClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `You are an AI assistant for a football controversy detection dashboard.
You help administrators review and manage detected controversial referee decisions.

You have access to match and incident data. When asked, you can:
- Filter incidents by confidence score
- Suggest merging similar incidents
- Explain why incidents were detected
- Provide summaries of controversial decisions
- Answer questions about matches and incidents

Always be factual and reference specific data when available.
Respond in the same language as the user's message.`;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function chat(
  messages: ChatMessage[],
  matchId?: string
): Promise<string> {
  const client = getOpenAIClient();

  let context = "";
  try {
    if (matchId) {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: { incidents: true },
      });
      if (match) {
        context = `\nCurrent match context:\n${match.homeTeam} vs ${match.awayTeam} (Week ${match.week}, ${match.date.toLocaleDateString()})\n`;
        context += `Incidents (${match.incidents.length}):\n`;
        for (const inc of match.incidents) {
          context += `- [${inc.status}] ${inc.type} at ${inc.minute ?? "?"}': ${inc.description} (confidence: ${inc.confidenceScore})\n`;
        }
      }
    } else {
      const recentMatches = await prisma.match.findMany({
        take: 10,
        orderBy: { date: "desc" },
        include: { incidents: { where: { status: "PENDING" } } },
      });
      context = `\nRecent matches:\n`;
      for (const m of recentMatches) {
        context += `- ${m.homeTeam} vs ${m.awayTeam} (Week ${m.week}): ${m.incidents.length} pending incidents\n`;
      }
    }
  } catch {
    logger.warn("Could not load context from database");
  }

  const systemMessage: ChatMessage = {
    role: "system",
    content: SYSTEM_PROMPT + context,
  };

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content ?? "I couldn't generate a response.";
  } catch (err) {
    logger.error("Chat agent error", err);
    return "Sorry, I encountered an error. Please try again.";
  }
}
