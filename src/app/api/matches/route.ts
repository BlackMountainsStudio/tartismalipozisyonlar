import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";
import { buildMatchSlug } from "@/lib/slug";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get("week");
    const team = searchParams.get("team");
    const leagueParam = searchParams.get("league");
    const slugParam = searchParams.get("slug");
    const idParam = searchParams.get("id");

    const where: Record<string, unknown> = {};
    if (week) where.week = parseInt(week);
    if (leagueParam) {
      where.league = leagueParam;
    } else if (!slugParam && !idParam) {
      where.league = "Süper Lig 2025-26";
    }
    if (team) {
      where.OR = [
        { homeTeam: { contains: team, mode: "insensitive" } },
        { awayTeam: { contains: team, mode: "insensitive" } },
      ];
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        referee: { select: { id: true, name: true, slug: true, role: true } },
        varReferee: { select: { id: true, name: true, slug: true, role: true } },
        incidents: {
          select: { id: true, type: true, status: true, confidenceScore: true, minute: true, description: true, slug: true },
        },
      },
      orderBy: { date: "desc" },
    });

    const withSlug = matches.map((m) => {
      const slug = m.slug ?? buildMatchSlug({ league: m.league, week: m.week, date: m.date, homeTeam: m.homeTeam, awayTeam: m.awayTeam });
      return { ...m, slug };
    });

    if (slugParam || idParam) {
      const one = slugParam
        ? withSlug.find((m) => m.slug === slugParam)
        : withSlug.find((m) => m.id === idParam);
      if (!one) return NextResponse.json(null, { status: 404, headers: NO_CACHE_HEADERS });
      return NextResponse.json(one, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json(withSlug, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("GET /api/matches error:", err);
    return NextResponse.json([], { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { homeTeam, awayTeam, league, week, date, note, refereeId, varRefereeId } = body;

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
        note: note ?? undefined,
        refereeId: refereeId || undefined,
        varRefereeId: varRefereeId || undefined,
        slug: buildMatchSlug({
          league: league ?? "Süper Lig",
          week: parseInt(week),
          date: new Date(date),
          homeTeam,
          awayTeam,
        }),
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
