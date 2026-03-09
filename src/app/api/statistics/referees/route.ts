import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";
import { getSeasonFromDate } from "@/lib/slug";

type RefereeStats = {
  id: string;
  name: string;
  slug: string;
  role: string;
  matchesOfficiated: number;
  matchesAsVar: number;
  controversialDecisions: number;
  varInterventions: number;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueFilter = searchParams.get("league");
    const seasonFilter = searchParams.get("season");

    const referees = await prisma.referee.findMany({
      include: {
        matchesAsReferee: {
          include: {
            incidents: { where: { status: "APPROVED" }, select: { id: true } },
          },
        },
        matchesAsVarReferee: {
          include: {
            incidents: { where: { status: "APPROVED" }, select: { id: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const list: RefereeStats[] = [];

    for (const ref of referees) {
      const primaryMatches = ref.matchesAsReferee.filter((m) => {
        if (leagueFilter && !m.league.toLowerCase().includes(leagueFilter.toLowerCase())) {
          return false;
        }
        if (seasonFilter && getSeasonFromDate(m.date) !== seasonFilter) {
          return false;
        }
        return true;
      });

      const varMatches = ref.matchesAsVarReferee.filter((m) => {
        if (leagueFilter && !m.league.toLowerCase().includes(leagueFilter.toLowerCase())) {
          return false;
        }
        if (seasonFilter && getSeasonFromDate(m.date) !== seasonFilter) {
          return false;
        }
        return true;
      });

      const controversialDecisions =
        primaryMatches.reduce((sum, m) => sum + m.incidents.length, 0) +
        varMatches.reduce((sum, m) => sum + m.incidents.length, 0);

      const varInterventions = varMatches.reduce((sum, m) => sum + m.incidents.length, 0);

      list.push({
        id: ref.id,
        name: ref.name,
        slug: ref.slug,
        role: ref.role,
        matchesOfficiated: primaryMatches.length,
        matchesAsVar: varMatches.length,
        controversialDecisions,
        varInterventions,
      });
    }

    list.sort((a, b) => b.controversialDecisions - a.controversialDecisions);

    return NextResponse.json(list, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/statistics/referees error:", err);
    return NextResponse.json([], { headers: NO_CACHE_HEADERS });
  }
}

