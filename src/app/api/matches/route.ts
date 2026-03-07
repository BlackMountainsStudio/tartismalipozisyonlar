import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get("week");
    const team = searchParams.get("team");

    const where: Record<string, unknown> = {};
    if (week) where.week = parseInt(week);
    if (team) {
      where.OR = [
        { homeTeam: { contains: team, mode: "insensitive" } },
        { awayTeam: { contains: team, mode: "insensitive" } },
      ];
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        incidents: {
          select: { id: true, type: true, status: true, confidenceScore: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(matches);
  } catch (err) {
    console.error("GET /api/matches error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { homeTeam, awayTeam, league, week, date } = body;

    if (!homeTeam || !awayTeam || !week || !date) {
      return NextResponse.json(
        { error: "Missing required fields: homeTeam, awayTeam, week, date" },
        { status: 400 }
      );
    }

    const match = await prisma.match.create({
      data: {
        homeTeam,
        awayTeam,
        league: league ?? "Süper Lig",
        week: parseInt(week),
        date: new Date(date),
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (err) {
    console.error("POST /api/matches error:", err);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}
