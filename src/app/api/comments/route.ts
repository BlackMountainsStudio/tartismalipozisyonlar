import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";

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

    const where: Record<string, string> = {};
    if (incidentId) where.incidentId = incidentId;
    else if (matchId) where.matchId = matchId;

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("GET /api/comments error:", err);
    return NextResponse.json([], { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, incidentId, author, content } = body;

    if ((!matchId && !incidentId) || !author?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "matchId/incidentId, author ve content alanları gerekli" },
        { status: 400 }
      );
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: "Yorum en fazla 1000 karakter olabilir" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        author: author.trim(),
        content: content.trim(),
        ...(matchId ? { matchId } : {}),
        ...(incidentId ? { incidentId } : {}),
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error("POST /api/comments error:", err);
    return NextResponse.json(
      { error: "Yorum eklenemedi" },
      { status: 500 }
    );
  }
}
