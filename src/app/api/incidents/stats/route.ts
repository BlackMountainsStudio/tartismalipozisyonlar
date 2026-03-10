import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";

/** İstatistik ve filtre sayıları için: türe göre, takıma göre, haftaya göre sayılar */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "APPROVED";
    const team = searchParams.get("team")?.trim() || undefined;
    const typeParam = searchParams.get("type")?.trim() || undefined;
    const inFavorOf = searchParams.get("inFavorOf")?.trim() || undefined;
    const against = searchParams.get("against")?.trim() || undefined;
    const leagueParam = searchParams.get("league");

    const matchFilter: Record<string, unknown>[] = [];
    if (leagueParam !== "all") {
      matchFilter.push({ league: leagueParam ?? "Süper Lig 2025-26" });
    }
    if (team) {
      const teams = team.split(",").map((t) => t.trim()).filter(Boolean);
      if (teams.length === 1) {
        matchFilter.push({ OR: [{ homeTeam: teams[0] }, { awayTeam: teams[0] }] });
      } else if (teams.length > 1) {
        matchFilter.push({ OR: teams.flatMap((t) => [{ homeTeam: t }, { awayTeam: t }]) });
      }
    }
    const where: Record<string, unknown> = { status: status.toUpperCase() };
    if (matchFilter.length > 0) {
      where.match = matchFilter.length === 1 ? matchFilter[0] : { AND: matchFilter };
    }
    if (typeParam) {
      const types = typeParam.split(",").map((t) => t.trim()).filter(Boolean);
      if (types.length === 1) where.type = types[0];
      else if (types.length > 1) where.type = { in: types };
    }
    if (inFavorOf) where.inFavorOf = inFavorOf;
    if (against) where.against = against;

    const incidents = await prisma.incident.findMany({
      where,
      select: {
        type: true,
        inFavorOf: true,
        against: true,
        matchId: true,
        match: {
          select: { homeTeam: true, awayTeam: true, week: true },
        },
      },
    });

    const total = incidents.length;
    const byType: Record<string, number> = {};
    const byTeam: Record<string, number> = {};
    const byWeek: Record<number, number> = {};
    const byInFavorOf: Record<string, number> = {};
    const byAgainst: Record<string, number> = {};
    const typeCategoryOrder: Record<string, string> = {
      PENALTY: "penalty",
      POSSIBLE_PENALTY: "penalty",
      GOAL_DISALLOWED: "offside_goal",
      OFFSIDE: "offside_goal",
      POSSIBLE_OFFSIDE_GOAL: "offside_goal",
      RED_CARD: "card",
      YELLOW_CARD: "card",
      MISSED_RED_CARD: "card",
      MISSED_YELLOW: "card",
      FOUL: "foul_handball",
      HANDBALL: "foul_handball",
      VAR_CONTROVERSY: "other",
    };
    const byCategory: Record<string, number> = {};

    for (const inc of incidents) {
      byType[inc.type] = (byType[inc.type] ?? 0) + 1;
      const cat = typeCategoryOrder[inc.type] ?? "other";
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
      if (inc.match) {
        byTeam[inc.match.homeTeam] = (byTeam[inc.match.homeTeam] ?? 0) + 1;
        byTeam[inc.match.awayTeam] = (byTeam[inc.match.awayTeam] ?? 0) + 1;
        const w = inc.match.week;
        byWeek[w] = (byWeek[w] ?? 0) + 1;
      }
      if (inc.inFavorOf) {
        byInFavorOf[inc.inFavorOf] = (byInFavorOf[inc.inFavorOf] ?? 0) + 1;
      }
      if (inc.against) {
        byAgainst[inc.against] = (byAgainst[inc.against] ?? 0) + 1;
      }
    }

    return NextResponse.json(
      {
        total,
        byType: typeof byType === "object" && byType != null ? byType : {},
        byCategory: typeof byCategory === "object" && byCategory != null ? byCategory : {},
        byTeam: Object.fromEntries(
          Object.entries(typeof byTeam === "object" && byTeam != null ? byTeam : {}).sort((a, b) => b[1] - a[1])
        ),
        byWeek: Object.fromEntries(
          Object.entries(typeof byWeek === "object" && byWeek != null ? byWeek : {})
            .map(([k, v]) => [Number(k), v] as const)
            .sort((a, b) => a[0] - b[0])
        ),
        byInFavorOf: Object.fromEntries(
          Object.entries(typeof byInFavorOf === "object" && byInFavorOf != null ? byInFavorOf : {}).sort((a, b) => b[1] - a[1])
        ),
        byAgainst: Object.fromEntries(
          Object.entries(typeof byAgainst === "object" && byAgainst != null ? byAgainst : {}).sort((a, b) => b[1] - a[1])
        ),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/incidents/stats error:", err);
    return NextResponse.json(
      { total: 0, byType: {}, byCategory: {}, byTeam: {}, byWeek: {}, byInFavorOf: {}, byAgainst: {} },
      { headers: NO_CACHE_HEADERS }
    );
  }
}
