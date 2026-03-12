import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: positionId } = await params;

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
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/incidents/[id]/votes error:", err);
    return NextResponse.json(
      { total: 0, byType: {}, percentages: null },
      { headers: NO_CACHE_HEADERS }
    );
  }
}
