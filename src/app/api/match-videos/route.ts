import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";

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

    return NextResponse.json(videos, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("GET /api/match-videos error:", err);
    return NextResponse.json([], { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, videoUrl, title, durationMin, transcript, source, notes } = body;

    if (!matchId || !videoUrl) {
      return NextResponse.json(
        { error: "matchId ve videoUrl gerekli" },
        { status: 400 }
      );
    }

    const video = await prisma.matchVideo.create({
      data: {
        matchId,
        videoUrl: String(videoUrl).trim(),
        title: title?.trim() || null,
        durationMin: durationMin != null ? parseInt(String(durationMin), 10) : null,
        transcript: transcript?.trim() || null,
        source: source?.trim() || "youtube",
        notes: notes?.trim() || null,
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
