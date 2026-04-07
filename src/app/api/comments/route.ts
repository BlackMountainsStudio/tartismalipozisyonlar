import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";
import { CommentPostSchema, parseBody } from "@/lib/schemas";
import { filterContent } from "@/lib/content-filter";
import { commentRateLimiter, getClientIP } from "@/lib/rateLimiter";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");
    const incidentId = searchParams.get("incidentId");

    if (!matchId && !incidentId) {
      return NextResponse.json(
        { error: "matchId veya incidentId parametresi gerekli" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { parentId: null };
    if (incidentId) where.incidentId = incidentId;
    else if (matchId) where.matchId = matchId;

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { image: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { image: true } } },
        },
      },
    });

    const result = comments.map((c) => ({
      id: c.id,
      author: c.author,
      content: c.content,
      verdict: c.verdict,
      image: c.user?.image ?? null,
      createdAt: c.createdAt,
      replies: c.replies.map((r) => ({
        id: r.id,
        author: r.author,
        content: r.content,
        image: r.user?.image ?? null,
        createdAt: r.createdAt,
        parentId: r.parentId,
      })),
    }));

    return NextResponse.json(result, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("GET /api/comments error:", err);
    return NextResponse.json(
      { error: "Yorumlar alınamadı" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

const VALID_VERDICTS = ["CORRECT", "INCORRECT", "UNSURE"] as const;

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  if (!commentRateLimiter.isAllowed(clientIP)) {
    return NextResponse.json(
      { error: "Çok fazla yorum gönderdiniz. Lütfen biraz bekleyin." },
      { status: 429 }
    );
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Yorum yapmak için giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    const raw = await request.json();
    const parsed = parseBody(CommentPostSchema, raw);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { matchId, incidentId, parentId, content, verdict } = parsed.data;

    const filterResult = filterContent(content);
    if (!filterResult.ok) {
      return NextResponse.json({ error: filterResult.reason ?? "Yorum gönderilemedi" }, { status: 400 });
    }

    const author = session.user.nickname || session.user.name || "Kullanıcı";

    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Üst yorum bulunamadı" }, { status: 404 });
      }
      const comment = await prisma.comment.create({
        data: {
          author,
          content: content.trim(),
          verdict: "UNSURE",
          userId: session.user.id,
          parentId,
          matchId: parent.matchId,
          incidentId: parent.incidentId,
        },
      });
      return NextResponse.json(
        { ...comment, image: session.user.image ?? null, parentId },
        { status: 201 }
      );
    }

    const verdictValue = VALID_VERDICTS.includes(verdict) ? verdict : "UNSURE";
    const comment = await prisma.comment.create({
      data: {
        author,
        content: content.trim(),
        verdict: incidentId ? verdictValue : "UNSURE",
        userId: session.user.id,
        ...(matchId ? { matchId } : {}),
        ...(incidentId ? { incidentId } : {}),
      },
    });

    return NextResponse.json(
      { ...comment, image: session.user.image ?? null },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/comments error:", err);
    return NextResponse.json(
      { error: "Yorum eklenemedi" },
      { status: 500 }
    );
  }
}
