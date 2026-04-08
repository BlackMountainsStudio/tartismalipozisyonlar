import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS, PUBLIC_CACHE_HEADERS } from "@/lib/api-response";
import { MatchVideoPostSchema, parseBody } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");

    const where = matchId ? { matchId } : {};

    const videos = await prisma.matchVideo.findMany({
      where,
      include: {
        match: {
          select: {
            id: true,
            homeTeam: true,
            awayTeam: true,
            week: true,
            date: true,
            league: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(videos, { headers: PUBLIC_CACHE_HEADERS });
  } catch (err) {
    console.error("GET /api/match-videos error:", err);
    return NextResponse.json([], { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const parsed = parseBody(MatchVideoPostSchema, rawBody);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }
    const { matchId, videoUrl, title, durationMin, transcript, source, notes } = parsed.data;

    const video = await prisma.matchVideo.create({
      data: {
        matchId,
        videoUrl,
        title: title ?? null,
        durationMin: durationMin ?? null,
        transcript: transcript ?? null,
        source,
        notes: notes ?? null,
      },
      include: {
        match: {
          select: {
            id: true,
            homeTeam: true,
            awayTeam: true,
            week: true,
            date: true,
            league: true,
          },
        },
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (err) {
    console.error("POST /api/match-videos error:", err);
    return NextResponse.json(
      { error: "Video eklenemedi" },
      { status: 500 }
    );
  }
}
