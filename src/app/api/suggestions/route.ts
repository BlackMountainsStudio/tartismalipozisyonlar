import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";
import { SuggestionPostSchema, parseBody } from "@/lib/schemas";
import { suggestionRateLimiter, getClientIP } from "@/lib/rateLimiter";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, string> = {};
    if (status) where.status = status;

    const suggestions = await prisma.suggestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(suggestions, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("GET /api/suggestions error:", err);
    return NextResponse.json(
      { error: "Öneriler alınamadı" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  if (!suggestionRateLimiter.isAllowed(clientIP)) {
    return NextResponse.json(
      { error: "Çok fazla öneri gönderdiniz. Lütfen daha sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Öneri göndermek için giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    const raw = await request.json();
    const parsed = parseBody(SuggestionPostSchema, raw);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { category, subject, message } = parsed.data;

    const name = session.user.nickname || session.user.name || "Kullanıcı";
    const email = session.user.email ?? null;

    const suggestion = await prisma.suggestion.create({
      data: {
        userId: session.user.id,
        name,
        email,
        category: category || "GENERAL",
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    return NextResponse.json(suggestion, { status: 201 });
  } catch (err) {
    console.error("POST /api/suggestions error:", err);
    return NextResponse.json(
      { error: "Mesajınız gönderilemedi" },
      { status: 500 }
    );
  }
}
