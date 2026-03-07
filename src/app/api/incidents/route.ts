import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";

function parseSources(sources: string): string[] {
  try {
    return JSON.parse(sources);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");
    const status = searchParams.get("status");
    const minConfidence = searchParams.get("minConfidence");

    const where: Record<string, unknown> = {};
    if (matchId) where.matchId = matchId;
    if (status) where.status = status.toUpperCase();
    if (minConfidence) where.confidenceScore = { gte: parseFloat(minConfidence) };

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        match: {
          select: { homeTeam: true, awayTeam: true, week: true, date: true },
        },
      },
      orderBy: { confidenceScore: "desc" },
    });

    const mapped = incidents.map((inc) => ({
      ...inc,
      sources: parseSources(inc.sources),
      videoUrl: inc.videoUrl ?? null,
      refereeComments: (() => {
        try {
          return JSON.parse(inc.refereeComments);
        } catch {
          return [];
        }
      })(),
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/incidents error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, minute, type, description, confidenceScore, sources } = body;

    if (!matchId || !type || !description || confidenceScore === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const incident = await prisma.incident.create({
      data: {
        matchId,
        minute: minute ? parseInt(minute) : null,
        type,
        description,
        confidenceScore: parseFloat(confidenceScore),
        sources: JSON.stringify(sources ?? []),
      },
    });

    return NextResponse.json(
      { ...incident, sources: parseSources(incident.sources) },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/incidents error:", err);
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}
