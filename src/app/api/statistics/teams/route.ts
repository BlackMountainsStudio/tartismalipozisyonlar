import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";
import { getSeasonFromDate, slugify } from "@/lib/slug";

type TeamStats = {
  teamName: string;
  slug: string;
  matches: number;
  incidentTotal: number;
  incidentsFor: number;
  incidentsAgainst: number;
  netBenefit: number;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueFilter = searchParams.get("league");
    const seasonFilter = searchParams.get("season");

    const matches = await prisma.match.findMany({
      where: leagueFilter
        ? {
            league: {
              contains: leagueFilter,
              mode: "insensitive",
            },
          }
        : {},
      include: {
        incidents: {
          where: { status: "APPROVED" },
          select: {
            inFavorOf: true,
            against: true,
          },
        },
      },
    });

    const filteredMatches =
      seasonFilter != null && seasonFilter.trim() !== ""
        ? matches.filter((m) => getSeasonFromDate(m.date) === seasonFilter)
        : matches;

    const statsMap = new Map<string, TeamStats>();

    for (const match of filteredMatches) {
      const teams = [match.homeTeam, match.awayTeam];
      const incidents = match.incidents;

      for (const teamName of teams) {
        const key = teamName.trim();
        if (!key) continue;

        let current = statsMap.get(key);
        if (!current) {
          current = {
            teamName: key,
            slug: slugify(key, 40),
            matches: 0,
            incidentTotal: 0,
            incidentsFor: 0,
            incidentsAgainst: 0,
            netBenefit: 0,
          };
          statsMap.set(key, current);
        }

        current.matches += 1;
        current.incidentTotal += incidents.length;

        for (const incident of incidents) {
          if (incident.inFavorOf && incident.inFavorOf === key) {
            current.incidentsFor += 1;
          }
          if (incident.against && incident.against === key) {
            current.incidentsAgainst += 1;
          }
        }
      }
    }

    const list = Array.from(statsMap.values()).map((item) => ({
      ...item,
      netBenefit: item.incidentsFor - item.incidentsAgainst,
    }));

    list.sort((a, b) => b.incidentTotal - a.incidentTotal);

    return NextResponse.json(list, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("GET /api/statistics/teams error:", err);
    return NextResponse.json([], { headers: NO_CACHE_HEADERS });
  }
}

