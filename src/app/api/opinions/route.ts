import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const incidentId = searchParams.get("incidentId");
    const commentatorId = searchParams.get("commentatorId");

    const where: Record<string, unknown> = {};
    if (incidentId) where.incidentId = incidentId;
    if (commentatorId) where.commentatorId = commentatorId;

    const opinions = await prisma.expertOpinion.findMany({
      where,
      include: {
        commentator: true,
        incident: {
          include: { match: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(opinions);
  } catch (err) {
    console.error("GET /api/opinions error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentatorId, incidentId, comment, stance, sourceUrl } = body;

    if (!commentatorId || !incidentId || !comment) {
      return NextResponse.json({ error: "commentatorId, incidentId and comment are required" }, { status: 400 });
    }

    const opinion = await prisma.expertOpinion.create({
      data: {
        commentatorId,
        incidentId,
        comment,
        stance: stance || "NEUTRAL",
        sourceUrl: sourceUrl || null,
      },
      include: {
        commentator: true,
        incident: {
          include: { match: true },
        },
      },
    });

    return NextResponse.json(opinion, { status: 201 });
  } catch (err) {
    console.error("POST /api/opinions error:", err);
    return NextResponse.json({ error: "Failed to create opinion" }, { status: 500 });
  }
}
