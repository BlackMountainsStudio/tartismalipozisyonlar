import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";

const DECISION_TYPES = ["PENALTY", "CONTINUE", "YELLOW_CARD", "RED_CARD"] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get("positionId");
    if (!positionId) {
      return NextResponse.json({ error: "positionId gerekli" }, { status: 400 });
    }

    const session = await auth();
    let userVote: string | null = null;
    if (session?.user?.id) {
      const vote = await prisma.vote.findUnique({
        where: {
          positionId_userId: { positionId, userId: session.user.id },
        },
      });
      userVote = vote?.decisionType ?? null;
    }

    const votes = await prisma.vote.groupBy({
      by: ["decisionType"],
      where: { positionId },
      _count: { id: true },
    });

    const total = votes.reduce((sum, v) => sum + v._count.id, 0);
    const byType: Record<string, number> = {};
    for (const v of votes) {
      byType[v.decisionType] = v._count.id;
    }

    return NextResponse.json(
      {
        total,
        byType: {
          PENALTY: byType.PENALTY ?? 0,
          CONTINUE: byType.CONTINUE ?? 0,
          YELLOW_CARD: byType.YELLOW_CARD ?? 0,
          RED_CARD: byType.RED_CARD ?? 0,
        },
        percentages:
          total > 0
            ? {
                PENALTY: Math.round(((byType.PENALTY ?? 0) / total) * 100),
                CONTINUE: Math.round(((byType.CONTINUE ?? 0) / total) * 100),
                YELLOW_CARD: Math.round(((byType.YELLOW_CARD ?? 0) / total) * 100),
                RED_CARD: Math.round(((byType.RED_CARD ?? 0) / total) * 100),
              }
            : null,
        userVote,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/votes error:", err);
    return NextResponse.json(
      { error: "Oylar alınamadı" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 });
    }

    const body = await request.json();
    const { positionId, decisionType } = body;

    if (!positionId || !decisionType) {
      return NextResponse.json(
        { error: "positionId ve decisionType gerekli" },
        { status: 400 }
      );
    }

    if (!DECISION_TYPES.includes(decisionType)) {
      return NextResponse.json(
        { error: "Geçersiz decisionType. PENALTY, CONTINUE, YELLOW_CARD, RED_CARD olabilir" },
        { status: 400 }
      );
    }

    const incident = await prisma.incident.findUnique({
      where: { id: positionId },
    });

    if (!incident) {
      return NextResponse.json({ error: "Pozisyon bulunamadı" }, { status: 404 });
    }

    const vote = await prisma.vote.upsert({
      where: {
        positionId_userId: { positionId, userId: session.user.id },
      },
      create: {
        positionId,
        userId: session.user.id,
        decisionType,
      },
      update: { decisionType },
    });

    return NextResponse.json(vote, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("POST /api/votes error:", err);
    return NextResponse.json(
      { error: "Oy kaydedilemedi" },
      { status: 500 }
    );
  }
}
