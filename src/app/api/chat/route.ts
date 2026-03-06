import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function generateLocalResponse(
  messages: ChatMessage[],
  matchId?: string
): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() ?? "";

  if (matchId) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { incidents: true },
    });

    if (match) {
      const pending = match.incidents.filter((i) => i.status === "PENDING");
      const approved = match.incidents.filter((i) => i.status === "APPROVED");

      if (lastMessage.includes("confidence") || lastMessage.includes("güven")) {
        const highConf = match.incidents.filter((i) => i.confidenceScore >= 0.7);
        return `${match.homeTeam} vs ${match.awayTeam} maçında güven skoru 0.7 ve üzeri olan ${highConf.length} olay tespit edildi:\n\n${highConf.map((i) => `- ${i.type} (${i.minute ?? "?"}') - Güven: ${(i.confidenceScore * 100).toFixed(0)}% - ${i.description}`).join("\n")}`;
      }

      if (lastMessage.includes("merge") || lastMessage.includes("birleştir")) {
        return `Bu maçta ${pending.length} bekleyen olay var. Dashboard üzerinden iki olayı birleştirmek için "Merge" butonunu kullanabilirsiniz.`;
      }

      if (lastMessage.includes("explain") || lastMessage.includes("açıkla") || lastMessage.includes("neden")) {
        return `AI, topluluk tartışmalarını analiz ederek hakem kararlarıyla ilgili şikayetleri tespit eder. Her olayın güven skoru, kaç farklı kaynakta benzer şikayetler bulunduğuna göre hesaplanır. Bu maçta ${match.incidents.length} olay tespit edildi.`;
      }

      return `${match.homeTeam} vs ${match.awayTeam} (Hafta ${match.week}):\n- ${match.incidents.length} toplam olay\n- ${pending.length} onay bekliyor\n- ${approved.length} onaylandı\n\nDetaylı bilgi için "confidence" veya "explain" yazabilirsiniz.`;
    }
  }

  const recentMatches = await prisma.match.findMany({
    take: 10,
    orderBy: { date: "desc" },
    include: { incidents: true },
  });

  if (lastMessage.includes("pending") || lastMessage.includes("bekleyen")) {
    const allPending = recentMatches.flatMap((m) =>
      m.incidents
        .filter((i) => i.status === "PENDING")
        .map((i) => ({ ...i, match: m }))
    );
    if (allPending.length === 0) return "Şu anda onay bekleyen olay bulunmuyor.";
    return `${allPending.length} onay bekleyen olay var:\n\n${allPending.slice(0, 5).map((i) => `- ${i.match.homeTeam} vs ${i.match.awayTeam}: ${i.type} (${i.minute ?? "?"}') - ${i.description.slice(0, 80)}...`).join("\n")}`;
  }

  if (lastMessage.includes("summary") || lastMessage.includes("özet")) {
    return `Sistemde ${recentMatches.length} maç takip ediliyor.\nToplam ${recentMatches.reduce((s, m) => s + m.incidents.length, 0)} olay tespit edildi.\n\nBelirli bir maç hakkında bilgi almak için Dashboard'dan maçı seçip Chat'e gelin.`;
  }

  return `Merhaba! Ben FootballAI asistanıyım. Size yardımcı olabileceğim konular:\n\n• "Show me incidents with confidence above 0.7"\n• "Summarize all pending incidents"\n• "Explain why this incident was detected"\n• "Merge similar penalty incidents"\n\nŞu anda ${recentMatches.length} maç takip ediliyor.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, matchId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    if (hasOpenAI) {
      try {
        const { chat } = await import("@/agents/chatAgent");
        const response = await chat(
          messages.map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          matchId
        );
        return NextResponse.json({ message: response });
      } catch {
        // Fall through to local response
      }
    }

    const response = await generateLocalResponse(messages, matchId);
    return NextResponse.json({ message: response });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json(
      { error: "Chat failed" },
      { status: 500 }
    );
  }
}
